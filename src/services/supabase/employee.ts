import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types';

export async function createEmployee(email: string, password: string, nickname: string): Promise<Profile> {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'employee',
          nickname
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user data returned');

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email,
          role: 'employee',
          nickname,
          client_name: 'rocketads360'
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }

    if (!profile) {
      throw new Error('Failed to create profile');
    }

    return profile;
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
}