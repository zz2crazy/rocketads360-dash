import { supabase, supabaseAdmin } from '../../lib/supabase';
import type { UserWithProfile } from '../../types';

export async function fetchUsers(): Promise<UserWithProfile[]> {
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profileError) throw profileError;

  return profiles.map(profile => ({
    ...profile,
    last_sign_in_at: null // We can't access this info without admin rights
  }));
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  );

  if (error) {
    console.error('Error updating user password:', error);
    throw new Error('Failed to update user password. Please try again.');
  }
}