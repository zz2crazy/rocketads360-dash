import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { sendWebhookNotification } from '../webhook';
import { debug } from '../../lib/debug';
import { DatabaseError } from './errors';
import { isDatabaseError, formatError } from './utils';
import type { Order, TimezoneStats, Profile } from '../../types';

// Cache for profiles to reduce database queries
const profileCache = new Map<string, {
  data: Profile;
  timestamp: number;
}>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedProfile(userId: string) {
  const cached = profileCache.get(userId);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    debug.info('orders', 'Using cached profile');
    return cached.data;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('client_name')
    .eq('id', userId)
    .single();

  if (profileError) {
    debug.error('orders', 'Failed to fetch user profile', profileError);
    throw profileError;
  }

  profileCache.set(userId, { data: profile, timestamp: now });
  return profile;
}

// Debounce concurrent order creation requests
const pendingOrders = new Map<string, Promise<void>>();

function generateRandomLetters(length: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  debug.debug('orders', 'Generated order ID suffix', result);
  return result;
}

export async function fetchOrders(): Promise<Order[]> {
  debug.group('orders', 'Fetching all orders');
  
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      debug.error('orders', 'Session error:', sessionError);
      throw new Error('Session error');
    }
    
    if (!session?.user) {
      debug.error('orders', 'No authenticated session');
      throw new Error('Authentication required');
    }
    
    // Get user's profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      debug.error('orders', 'Failed to fetch user profile', profileError);
      if (isDatabaseError(profileError)) {
        throw new DatabaseError('Profile not found');
      }
      throw profileError;
    }

    if (!profile) {
      debug.error('orders', 'Profile not found');
      throw new Error('Profile not found');
    }

    if (profile.role !== 'employee' && profile.role !== 'super_admin') {
      debug.error('orders', 'User does not have permission to view all orders');
      throw new Error('Insufficient permissions');
    }

    // Fetch orders with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        debug.info('orders', `Retrieved ${data?.length || 0} orders`);
        debug.table('orders', data || []);
        
        return data || [];
      } catch (error) {
        retries--;
        if (retries === 0) {
          debug.error('orders', 'Failed to fetch orders after retries', error);
          throw new Error('Failed to fetch orders');
        }
        debug.warn('orders', `Retrying order fetch, attempts left: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw new Error('Failed to fetch orders');
  } catch (error) {
    debug.error('orders', 'Error in fetchOrders:', error);
    throw new Error(formatError(error));
  } finally {
    debug.groupEnd('orders');
  }
}

export async function fetchOrderStats(orders: Order[]) {
  debug.group('orders', 'Calculating order statistics');
  
  const statusCounts = orders.reduce(
    (acc, order) => {
      acc[order.status]++;
      acc.total++;
      return acc;
    },
    { pending: 0, processing: 0, completed: 0, cancelled: 0, total: 0 }
  );

  debug.debug('orders', 'Status counts', statusCounts);

  const totalAccountsProvided = orders.reduce((total, order) => {
    return total + (order.status === 'completed' ? order.account_count : 0);
  }, 0);

  debug.info('orders', `Total accounts provided: ${totalAccountsProvided}`);

  const timezoneMap = orders.reduce((acc, order) => {
    if (order.status === 'pending') {
      acc[order.timezone] = (acc[order.timezone] || 0) + order.account_count;
    }
    return acc;
  }, {} as Record<string, number>);

  const timezoneStats: TimezoneStats[] = Object.entries(timezoneMap)
    .map(([timezone, total]) => ({ timezone, total }))
    .sort((a, b) => b.total - a.total);

  debug.debug('orders', 'Timezone statistics', timezoneStats);
  debug.groupEnd('orders');

  return {
    ...statusCounts,
    totalAccountsProvided,
    timezoneStats
  };
}

export async function fetchCustomerOrders(): Promise<Order[]> {
  debug.group('orders', 'Fetching customer orders');
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      debug.error('orders', 'Auth error:', authError);
      throw new Error('Authentication error');
    }

    if (!user) {
      debug.error('orders', 'No authenticated user found');
      throw new Error('No authenticated user');
    }

    debug.info('orders', `Fetching orders for user: ${user.id}`);
    
    // First get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, client_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      debug.error('orders', 'Failed to fetch user profile', profileError);
      throw profileError;
    }

    if (!profile) {
      debug.error('orders', 'Profile not found');
      throw new Error('Profile not found');
    }

    debug.debug('orders', 'Retrieved user profile', profile);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      debug.error('orders', 'Failed to fetch customer orders', error);
      throw error;
    }

    debug.info('orders', `Retrieved ${data?.length || 0} orders for customer`);
    debug.table('orders', data || []);

    // Attach profile to each order
    const ordersWithProfile = data?.map(order => ({
      ...order,
      profile
    })) || [];

    return ordersWithProfile;
  } catch (error) {
    debug.error('orders', 'Error in fetchCustomerOrders:', error);
    throw error;
  } finally {
    debug.groupEnd('orders');
  }
}

export async function verifyPassword(password: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    throw new Error('Authentication error');
  }
  
  if (!user?.email) {
    throw new Error('No authenticated user');
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password
  });

  if (error) {
    throw new Error('Invalid password');
  }
}

export async function createOrder(accountCount: number, timezone: string, accountNameSpec?: string): Promise<void> {
  debug.group('orders', 'Creating new order');
  debug.info('orders', `New order request - Accounts: ${accountCount}, Timezone: ${timezone}`);
  const start = performance.now();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      debug.error('orders', 'Auth error:', authError);
      throw new Error('Authentication error');
    }
    
    if (!user) {
      debug.error('orders', 'No authenticated user found');
      throw new Error('No authenticated user');
    }

    const requestKey = `${user.id}_${Date.now()}`;
    if (pendingOrders.has(requestKey)) {
      debug.info('orders', `Order creation already in progress for ${requestKey}`);
      return pendingOrders.get(requestKey);
    }
    
    const orderPromise = (async () => {
      try {
        const profile = await getCachedProfile(user.id);
        debug.debug('orders', 'Retrieved user profile', profile);

        const timestamp = format(new Date(), 'yyyyMMddHHmmss');
        const randomLetters = generateRandomLetters(2);
        const orderId = `${timestamp}${randomLetters}`;

        debug.info('orders', `Generated order ID: ${orderId}`);

        const { error } = await supabase
          .from('orders')
          .insert([{
            id: orderId,
            user_id: user.id,
            client_name: profile.client_name,
            account_count: accountCount,
            timezone: timezone,
            account_name_spec: accountNameSpec || null,
            status: 'pending'
          }]);

        if (error) {
          debug.error('orders', 'Failed to create order', error);
          throw error;
        }

        debug.info('orders', 'Order created successfully');

        // Fire and forget webhook notification
        sendWebhookNotification({
          event_type: 'order_created',
          order_id: orderId,
          client_name: profile.client_name || '',
          account_count: accountCount,
          timezone: timezone,
          status: 'pending',
          timestamp: new Date().toISOString()
        }).catch(error => {
          debug.error('orders', 'Webhook notification failed:', error);
        });

        const duration = performance.now() - start;
        debug.info('orders', `Order creation took ${duration}ms`);
      } finally {
        pendingOrders.delete(requestKey);
        debug.groupEnd('orders');
      }
    })();

    pendingOrders.set(requestKey, orderPromise);
    return orderPromise;
  } catch (error) {
    debug.error('orders', 'Error in createOrder:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  debug.group('orders', 'Updating order status');
  debug.info('orders', `Updating order ${orderId} to status: ${status}`);
  
  try {
    // First fetch the current order details
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*, profile:profiles(id, email, client_name)')
      .eq('id', orderId)
      .single();
    
    if (fetchError) {
      debug.error('orders', 'Failed to fetch order for update', fetchError);
      throw fetchError;
    }

    if (!currentOrder) {
      debug.error('orders', 'Order not found');
      throw new Error('Order not found');
    }

    debug.debug('orders', 'Current order data', currentOrder);
    
    // Then update the order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (updateError) {
      debug.error('orders', 'Failed to update order status', updateError);
      throw updateError;
    }

    debug.info('orders', 'Order status updated successfully');

    // Send webhook notification in the background
    sendWebhookNotification({
      event_type: 'order_updated',
      order_id: orderId,
      client_name: currentOrder.client_name || '',
      account_count: currentOrder.account_count,
      timezone: currentOrder.timezone,
      status: status,
      previous_status: currentOrder.status,
      timestamp: new Date().toISOString()
    }).catch(error => {
      debug.error('orders', 'Failed to send webhook notification', error);
    });
  } catch (error) {
    debug.error('orders', 'Error in updateOrderStatus:', error);
    throw error;
  } finally {
    debug.groupEnd('orders');
  }
}