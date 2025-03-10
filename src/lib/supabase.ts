import { createClient } from '@supabase/supabase-js';
import { debug } from './debug';

// Ensure environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey
  });
}

// Enhanced storage configuration
const storageConfig = {
  db: {
    schema: 'public'
  },
  storage: {
    // Use localStorage for better persistence
    getItem: (key: string) => {
      try {
        const item = localStorage.getItem(key);
        debug.debug('storage', `Getting item: ${key}`, item);
        return item;
      } catch (error) {
        debug.error('storage', `Error getting item: ${key}`, error);
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        debug.debug('storage', `Setting item: ${key}`, value);
        localStorage.setItem(key, value);
      } catch (error) {
        debug.error('storage', `Error setting item: ${key}`, error);
      }
    },
    removeItem: (key: string) => {
      try {
        debug.debug('storage', `Removing item: ${key}`);
        localStorage.removeItem(key);
      } catch (error) {
        debug.error('storage', `Error removing item: ${key}`, error);
      }
    }
  }
};

// Create Supabase client with enhanced configuration
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseKey || 'fallback-key-for-development',
  {
    auth: {
      ...storageConfig,
      storageKey: 'auth-store', // Use consistent key
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      debug: true,
      // Increased timeout for better reliability
      retryAttempts: 3,
      retryInterval: 2000,
      // Customize storage behavior
      storage: {
        ...storageConfig.storage,
        // Add timestamp to stored session
        setItem: (key: string, value: string) => {
          try {
            const session = JSON.parse(value);
            const enhancedSession = {
              ...session,
              timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(enhancedSession));
          } catch (error) {
            debug.error('storage', `Error enhancing session:`, error);
            localStorage.setItem(key, value);
          }
        }
      }
    },
    // Global error handler
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-v2'
      }
    }
  }
);

// Admin client with service role key for privileged operations
export const supabaseAdmin = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseServiceKey || 'fallback-service-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

// Initialize auth state
export async function initializeAuth() {
  try {
    debug.group('supabase', 'Initializing auth');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      debug.error('supabase', 'Auth initialization error:', error);
      await supabase.auth.signOut();
      return null;
    }

    if (session) {
      debug.info('supabase', 'Session restored successfully');
      return session;
    }

    debug.info('supabase', 'No active session');
    return null;
  } catch (error) {
    debug.error('supabase', 'Failed to initialize auth:', error);
    return null;
  } finally {
    debug.groupEnd('supabase');
  }
}

// Test connection and configuration
console.log('Supabase Configuration:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseKey,
  hasServiceKey: !!supabaseServiceKey
});

// Initialize auth on load
initializeAuth().catch(console.error);