import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  const [initialized, setInitialized] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    debug.group('auth', `Fetching profile for user: ${userId}`);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        debug.error('auth', 'Error fetching profile:', error);
        throw error;
      }
      
      if (!data) {
        debug.warn('auth', 'No profile found');
        throw new Error('Profile not found');
      }

      debug.info('auth', 'Profile fetched successfully');
      setUser(data);
    } catch (error) {
      debug.error('auth', 'Error fetching profile:', error);
      setUser(null);
      throw error;
    } finally {
      debug.groupEnd('auth');
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        debug.group('auth', 'Initializing session');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          debug.error('auth', 'Session error:', error);
          setUser(null);
          return;
        }
        
        if (session?.user && mounted) {
          debug.info('auth', 'Session found, fetching profile');
          await fetchProfile(session.user.id);
        } else {
          debug.info('auth', 'No active session');
          setUser(null);
        }
      } catch (error) {
        debug.error('auth', 'Init error:', error);
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
        debug.groupEnd('auth');
      }
    }

    initSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      debug.group('auth', `Auth state changed: ${event}`);
      
      try {
        if (session?.user) {
          debug.info('auth', 'User authenticated, fetching profile');
          await fetchProfile(session.user.id);
        } else {
          debug.info('auth', 'No user in session');
          setUser(null);
        }
      } catch (error) {
        debug.error('auth', 'Auth change error:', error);
        setUser(null);
      } finally {
        debug.groupEnd('auth');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  async function signIn(email: string, password: string) {
    debug.group('auth', 'Signing in');
    
    try {
      // Clear any existing session first
      await supabase.auth.signOut();
      
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password,
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      // Wait for session to be established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Failed to establish session');
      }
      
      debug.info('auth', 'Sign in successful');
    } catch (error) {
      debug.error('auth', 'Sign in error:', error);
      throw error;
    } finally {
      debug.groupEnd('auth');
    }
  }

  async function signOut() {
    debug.group('auth', 'Signing out');
    try {
      await supabase.auth.signOut();
      setUser(null);
      // Clear any cached data
      sessionStorage.clear();
      debug.info('auth', 'Sign out successful');
    } catch (error) {
      debug.error('auth', 'Sign out error:', error);
      throw error;
    } finally {
      debug.groupEnd('auth');
    }
  }

  const value = {
    user,
    loading: loading || !initialized,
    signIn,
    signOut,
    updateUserProfile: setUser
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