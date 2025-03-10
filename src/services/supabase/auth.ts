import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { getProfile } from './profile';
import { AuthenticationError } from './errors';
import { ERROR_MESSAGES } from './constants';
import { debug } from '../../lib/debug';
import type { AuthResult } from './types';

let authInProgress = false;

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  if (authInProgress) {
    debug.warn('auth', 'Authentication already in progress');
    throw new AuthenticationError('Authentication already in progress');
  }

  try {
    authInProgress = true;
    debug.group('auth', 'Signing in');
    debug.info('auth', `Attempting login for: ${email}`);
    console.log('Starting authentication process...');

    // Clear any existing session first
    await supabase.auth.signOut();
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password,
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (authError) {
      debug.error('auth', 'Sign in error:', authError);
      console.error('Authentication error:', authError);
      if (authError.message.includes('Invalid login credentials')) {
        throw new AuthenticationError(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
      if (authError.message.includes('Email not confirmed')) {
        throw new AuthenticationError(ERROR_MESSAGES.EMAIL_NOT_CONFIRMED);
      }
      throw new AuthenticationError(authError.message);
    }
    
    if (!authData.user) {
      debug.error('auth', 'No user data returned');
      console.error('No user data returned from authentication');
      throw new AuthenticationError(ERROR_MESSAGES.NO_USER_DATA);
    }

    console.log('Authentication successful, waiting for session...');

    // Wait for session to be properly established
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify session is active
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      debug.error('auth', 'No session established after login');
      console.error('Failed to establish session');
      throw new AuthenticationError('Failed to establish session');
    }

    debug.info('auth', 'Session established successfully');
    console.log('Session established successfully');

    // Get user profile
    try {
      const profile = await getProfile(authData.user.id);
      debug.info('auth', 'Sign in successful');
      console.log('Profile fetched successfully:', profile);
      
      return {
        user: {
          id: authData.user.id,
          email: authData.user.email || '',
        },
        profile
      };
    } catch (error) {
      debug.error('auth', 'Profile fetch error:', error);
      console.error('Profile fetch error:', error);
      throw new AuthenticationError(ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    debug.error('auth', 'Authentication error:', error);
    console.error('Unexpected authentication error:', error);
    throw new AuthenticationError(ERROR_MESSAGES.UNEXPECTED_ERROR);
  } finally {
    authInProgress = false;
    debug.groupEnd('auth');
  }
}

export async function signOut(): Promise<void> {
  try {
    debug.group('auth', 'Signing out');
    console.log('Starting sign out process...');
    
    // Clear any cached data
    localStorage.removeItem('auth-store');
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    debug.info('auth', 'Sign out successful');
    console.log('Sign out completed successfully');
  } catch (error) {
    debug.error('auth', 'Sign out error:', error);
    console.error('Sign out error:', error);
    throw new AuthenticationError(ERROR_MESSAGES.SIGN_OUT_FAILED);
  } finally {
    debug.groupEnd('auth');
  }
}