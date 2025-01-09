import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { getProfile } from './profile';
import { AuthenticationError } from './errors';
import { ERROR_MESSAGES } from './constants';
import { debug } from '../../lib/debug';
import type { AuthResult } from './types';

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    debug.group('auth', 'Signing in');
    debug.info('auth', `Attempting login for: ${email}`);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password
    });
    
    if (authError) {
      debug.error('auth', 'Sign in error:', authError);
      if (authError.message.includes('Invalid login credentials')) {
        throw new AuthenticationError(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
      throw new AuthenticationError(authError.message);
    }
    
    if (!authData.user) {
      debug.error('auth', 'No user data returned');
      throw new AuthenticationError(ERROR_MESSAGES.NO_USER_DATA);
    }

    const profile = await getProfile(authData.user.id);
    debug.info('auth', 'Sign in successful');
    
    return {
      user: {
        id: authData.user.id,
        email: authData.user.email || '',
      },
      profile
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    debug.error('auth', 'Authentication error:', error);
    throw new AuthenticationError(ERROR_MESSAGES.UNEXPECTED_ERROR);
  } finally {
    debug.groupEnd('auth');
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
    throw new AuthenticationError(ERROR_MESSAGES.SIGN_OUT_FAILED);
  }
}