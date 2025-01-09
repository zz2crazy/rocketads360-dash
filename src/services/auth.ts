import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

export async function signInWithEmail(email: string, password: string) {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (authError) throw authError;
  
  if (!authData.user) {
    throw new Error('No user returned after successful sign in');
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();
    
  if (profileError) throw profileError;
  
  return {
    user: authData.user,
    profile: profile as Profile
  };
}