import { supabase } from '../../lib/supabase';
import { checkBusinessManager } from '../facebook/api';
import type { BusinessManager, BMProvider } from '../../types';

export async function fetchBusinessManagers(): Promise<BusinessManager[]> {
  const { data, error } = await supabase
    .from('business_managers')
    .select(`
      *,
      provider:bm_providers(
        id,
        name,
        status,
        created_at,
        created_by,
        created_by_profile:profiles(*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addBusinessManager(provider: BMProvider, bmId: string): Promise<BusinessManager> {
  try {
    // Validate BM ID format
    if (!/^\d+$/.test(bmId)) {
      throw new Error('Invalid BM ID format. Please enter a valid numeric ID.');
    }

    // Check if BM already exists
    const { data: existing, error: checkError } = await supabase
      .from('business_managers')
      .select('id, name, provider:bm_providers(name)')
      .eq('bm_id', bmId)
      .eq('provider_id', provider.id)
      .maybeSingle();

    if (checkError) throw checkError;

    // If BM exists, throw error with details
    if (existing) {
      throw new Error(
        `This BM ID is already registered with ${existing.provider?.name}. ` +
        `Please use a different BM ID.`
      );
    }

    // Add BM with default values
    const { data, error } = await supabase
      .from('business_managers')
      .insert([{
        provider_id: provider.id,
        bm_id: bmId,
        name: `BM-${bmId}`, // Default name format
        status: 'inactive', // Start as inactive
        last_sync: new Date().toISOString()
      }])
      .select(`
        *,
        provider:bm_providers(
          id,
          name,
          status,
          created_at,
          created_by,
          created_by_profile:profiles(*)
        )
      `)
      .single();

    if (error) {
      // Handle unique constraint violation explicitly
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new Error('This BM ID is already registered. Please use a different BM ID.');
      }
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error; // Preserve the original error message
    }
    throw new Error('Failed to add BM account. Please try again.');
  }
}

export async function syncBusinessManager(id: string): Promise<BusinessManager> {
  // First fetch the BM details from our database
  const { data: bm, error: fetchError } = await supabase
    .from('business_managers')
    .select(`
      *,
      provider:bm_providers(
        id,
        name,
        status,
        created_at,
        created_by,
        created_by_profile:profiles(*)
      )
    `)
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;
  if (!bm) throw new Error('Business Manager not found');

  try {
    // Check BM status with Facebook
    const fbData = await checkBusinessManager(bm.bm_id);
    
    if (!fbData) {
      // Token is invalid or expired
      const { data, error } = await supabase
        .from('business_managers')
        .update({
          status: 'error',
          error_message: 'Facebook authentication required. Please reconnect your Facebook account.',
          last_sync: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          provider:bm_providers(
            id,
            name,
            status,
            created_at,
            created_by,
            created_by_profile:profiles(*)
          )
        `)
        .single();

      if (error) throw error;
      return data;
    }

    // Update BM with Facebook data
    const { data, error } = await supabase
      .from('business_managers')
      .update({
        name: fbData.name,
        status: fbData.status,
        error_message: null,
        last_sync: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        provider:bm_providers(
          id,
          name,
          status,
          created_at,
          created_by,
          created_by_profile:profiles(*)
        )
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    // Handle sync failure
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to sync with Facebook';

    const { data, error: updateError } = await supabase
      .from('business_managers')
      .update({
        status: 'error',
        error_message: errorMessage,
        last_sync: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        provider:bm_providers(
          id,
          name,
          status,
          created_at,
          created_by,
          created_by_profile:profiles(*)
        )
      `)
      .single();

    if (updateError) throw updateError;
    return data;
  }
}

export async function removeBusinessManager(id: string): Promise<void> {
  const { error } = await supabase
    .from('business_managers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}