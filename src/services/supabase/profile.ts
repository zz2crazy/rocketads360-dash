import { supabase } from '../../lib/supabase';
import { ProfileNotFoundError } from './errors';
import { AUTH_CONFIG } from './constants';
import { debug } from '../../lib/debug';
import { delay, isSupabaseError, validatePassword } from './utils';
import type { Profile } from '../../types';

export async function updateClientName(userId: string, clientName: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ client_name: clientName })
    .eq('id', userId);

  if (error) {
    console.error('Error updating client name:', error);
    throw new Error('Failed to update client name');
  }
}

export async function getProfile(userId: string): Promise<Profile> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new ProfileNotFoundError(userId);
      }
      throw error;
    }
    
    if (!data) {
      throw new ProfileNotFoundError(userId);
    }
    
    return data;
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      throw error;
    }
    
    if (isSupabaseError(error)) {
      console.error('Database error:', error);
    }
    
    throw new ProfileNotFoundError(userId);
  }
}

export async function updateNickname(nickname: string): Promise<Profile> {
  if (nickname.length < 2) {
    throw new Error('Nickname must be at least 2 characters long');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ nickname })
    .eq('id', (await supabase.auth.getUser()).data.user?.id || '')
    .select()
    .single();

  if (error) {
    console.error('Error updating nickname:', error);
    throw new Error('Failed to update nickname');
  }
  
  return data as Profile;
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<void> {
  validatePassword(newPassword);
  
  if (currentPassword === newPassword) {
    throw new Error('New password must be different from your current password');
  }

  const start = performance.now();
  debug.group('profile', 'Verifying password');

  const session = await supabase.auth.getSession();
  if (!session.data.session?.user.email) {
    throw new Error('No authenticated user');
  }

  debug.info('profile', 'Got session, verifying password');

  // Verify current password
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: session.data.session.user.email,
    password: currentPassword
  });

  const end = performance.now();
  debug.info('profile', `Password verification took ${end - start}ms`);
  debug.groupEnd('profile');

  if (verifyError) {
    throw new Error('Invalid current password');
  }
  
  // Update password
  const { error: updateError } = await supabase.auth.updateUser({ 
    password: newPassword
  });

  if (updateError) {
    throw new Error(updateError.message || 'Failed to update password');
  }
}