import { supabase } from '../../lib/supabase';
import type { BMProvider } from '../../types';

export async function fetchProviders(): Promise<BMProvider[]> {
  const { data, error } = await supabase
    .from('bm_providers')
    .select(`
      *,
      created_by_profile:profiles(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createProvider(name: string): Promise<BMProvider> {
  const { data, error } = await supabase
    .from('bm_providers')
    .insert([{
      name,
      status: 'active'
    }])
    .select(`
      *,
      created_by_profile:profiles(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProviderStatus(id: string, status: 'active' | 'inactive'): Promise<BMProvider> {
  const { data, error } = await supabase
    .from('bm_providers')
    .update({ status })
    .eq('id', id)
    .select(`
      *,
      created_by_profile:profiles(*)
    `)
    .single();

  if (error) throw error;
  return data;
}