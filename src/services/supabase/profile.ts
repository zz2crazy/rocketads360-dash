import { supabase } from '../../lib/supabase';
import { ProfileNotFoundError } from './errors';
import { debug } from '../../lib/debug';
import { isSupabaseError } from './utils';
import type { Profile } from '../../types';

export async function getProfile(userId: string): Promise<Profile> {
  debug.group('profile', `Fetching profile for user: ${userId}`);
  
  try {
    // First check if user exists in auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      debug.error('profile', 'Auth error:', authError);
      throw new ProfileNotFoundError(userId);
    }
    
    if (!user) {
      debug.error('profile', 'No authenticated user');
      throw new ProfileNotFoundError(userId);
    }

    // Then get the profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      debug.error('profile', 'Database error:', error);
      throw error;
    }
    
    if (!data) {
      debug.error('profile', 'Profile not found');
      throw new ProfileNotFoundError(userId);
    }

    debug.info('profile', 'Profile fetched successfully');
    debug.debug('profile', 'Profile data:', data);
    
    return data;
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      throw error;
    }
    
    if (isSupabaseError(error)) {
      debug.error('profile', 'Database error:', error);
    }
    
    throw new ProfileNotFoundError(userId);
  } finally {
    debug.groupEnd('profile');
  }
}

export async function updateClientName(userId: string, clientName: string): Promise<void> {
  debug.group('profile', `Updating client name for user: ${userId}`);
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ client_name: clientName })
      .eq('id', userId);

    if (error) {
      debug.error('profile', 'Error updating client name:', error);
      throw new Error('Failed to update client name');
    }

    debug.info('profile', 'Client name updated successfully');
  } catch (error) {
    debug.error('profile', 'Update error:', error);
    throw error;
  } finally {
    debug.groupEnd('profile');
  }
}

export async function updateNickname(nickname: string): Promise<Profile> {
  debug.group('profile', 'Updating nickname');
  
  try {
    if (nickname.length < 2) {
      throw new Error('Nickname must be at least 2 characters long');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      debug.error('profile', 'Auth error:', authError);
      throw new Error('Authentication required');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ nickname })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      debug.error('profile', 'Error updating nickname:', error);
      throw new Error('Failed to update nickname');
    }

    debug.info('profile', 'Nickname updated successfully');
    return data as Profile;
  } catch (error) {
    debug.error('profile', 'Update error:', error);
    throw error;
  } finally {
    debug.groupEnd('profile');
  }
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<void> {
  debug.group('profile', 'Updating password');
  
  try {
    if (currentPassword === newPassword) {
      throw new Error('New password must be different from your current password');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user?.email) {
      debug.error('profile', 'Auth error:', authError);
      throw new Error('Authentication required');
    }

    // Verify current password
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });

    if (verifyError) {
      debug.error('profile', 'Password verification failed:', verifyError);
      throw new Error('Invalid current password');
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({ 
      password: newPassword
    });

    if (updateError) {
      debug.error('profile', 'Password update failed:', updateError);
      throw new Error(updateError.message || 'Failed to update password');
    }

    debug.info('profile', 'Password updated successfully');
  } catch (error) {
    debug.error('profile', 'Update error:', error);
    throw error;
  } finally {
    debug.groupEnd('profile');
  }
}