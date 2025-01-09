import { supabase } from '../../lib/supabase';
import { AuthenticationError } from './errors';
import { ERROR_MESSAGES } from './constants';
import { updateClientName } from './profile';
import type { Profile } from '../../types';

export async function createClient(email: string, password: string, clientName: string): Promise<Profile> {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'customer',
          client_name: clientName
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error(ERROR_MESSAGES.NO_USER_DATA);

    // Explicitly create the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email: email,
          role: 'customer',
          client_name: clientName
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

    // Ensure client name is synced
    try {
      await updateClientName(profile.id, clientName);
    } catch (error) {
      console.error('Failed to sync client name:', error);
      // Don't throw here as the client is already created
    }

    return profile;
  } catch (error) {
    console.error('Error creating client:', error);
    throw new AuthenticationError(ERROR_MESSAGES.CLIENT_CREATION_FAILED);
  }
}