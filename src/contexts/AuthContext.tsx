import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { debug } from '../lib/debug';
import { AuthError } from '@supabase/supabase-js';
import type { Profile } from '../types';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (profile: Profile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    '__isAuthError' in error &&
    error.__isAuthError === true
  );
}
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function updateUserProfile(profile: Profile) {
    setUser(profile);
  }

  useEffect(() => {
    // Initialize auth state from stored session
    async function initSession() {
      try {
        debug.group('auth', 'Initializing session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (isAuthError(error) && error.status === 400) {
            debug.info('auth', 'Invalid or expired session, clearing state');
            setUser(null);
            return;
          }
          throw error;
        }
        
        debug.info('auth', 'Got session:', session ? 'Session exists' : 'No session');
        
        if (session?.user) {
          debug.info('auth', 'User found in session, fetching profile');
          await fetchProfile(session.user.id);
        } else {
          debug.warn('auth', 'No user in session');
          setUser(null);
        }
      } catch (error) {
        if (!isAuthError(error)) {
          debug.error('auth', 'Error initializing session:', error);
        }
        setUser(null);
      } finally {
        setLoading(false);
        debug.groupEnd('auth');
      }
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      debug.group('auth', `Auth state changed: ${event}`);
      debug.info('auth', 'Session:', session ? 'exists' : 'null');
      
      try {
        if (session?.user) {
          debug.info('auth', 'User found, fetching profile');
          await fetchProfile(session.user.id);
        } else {
          debug.warn('auth', 'No user in session, clearing profile');
          setUser(null);
        }
      } catch (error) {
        if (!isAuthError(error)) {
          debug.error('auth', 'Error handling auth state change:', error);
        }
        setUser(null);
      } finally {
        debug.groupEnd('auth');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    debug.group('auth', `Fetching profile for user: ${userId}`);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      debug.error('auth', 'Error fetching profile:', error);
      setUser(null);
      return;
    }
    
    if (data) {
      debug.info('auth', 'Profile fetched successfully');
      debug.debug('auth', 'Profile data:', data);
      setUser(data as Profile);
    } else {
      debug.warn('auth', 'No profile found');
      setUser(null);
    }
    debug.groupEnd('auth');
  }

  async function signIn(email: string, password: string) {
    debug.group('auth', 'Signing in');
    debug.info('auth', `Attempting login for: ${email}`);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      debug.error('auth', 'Sign in error:', error);
      debug.groupEnd('auth');
      throw error;
    }
    debug.info('auth', 'Sign in successful');
    debug.groupEnd('auth');
  }

  async function signOut() {
    debug.group('auth', 'Signing out');
    const { error } = await supabase.auth.signOut();
    if (error) {
      debug.error('auth', 'Sign out error:', error);
      debug.groupEnd('auth');
      throw error;
    }
    debug.info('auth', 'Sign out successful');
    debug.groupEnd('auth');
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}