import { supabase } from '../../lib/supabase';
import type { WebhookSetting, WebhookPayloadConfig } from '../../types';

export async function fetchCustomerProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, client_name')
    .eq('role', 'customer')
    .not('client_name', 'is', null)
    .order('client_name', { ascending: true });

  if (error) {
    console.error('Error fetching customer profiles:', error);
    throw error;
  }
  return data || [];
}

export async function fetchWebhookSettings() {
  const { data, error } = await supabase
    .from('webhook_settings')
    .select(`
      *,
      client:profiles!inner(
        id,
        email,
        client_name,
        role
      )
    `)
    .eq('client.role', 'customer')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as WebhookSetting[];
}

async function validateWebhookUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msg_type: "text",
        content: { text: "Webhook test message" }
      })
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function createWebhookSetting(clientId: string, webhookUrl: string) {
  console.log('Creating webhook setting:', { clientId, webhookUrl });
  
  // Validate webhook URL format
  try {
    new URL(webhookUrl);
  } catch (error) {
    throw new Error('Invalid webhook URL format');
  }

  // Test webhook endpoint
  const isValid = await validateWebhookUrl(webhookUrl);
  if (!isValid) {
    throw new Error('Unable to reach webhook endpoint. Please verify the URL and try again.');
  }

  const { data, error } = await supabase
    .from('webhook_settings')
    .insert([
      {
        client_id: clientId,
        webhook_url: webhookUrl,
        is_active: true
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating webhook setting:', error);
    throw error;
  }
  console.log('Created webhook setting:', data);
  return data as WebhookSetting;
}

export async function updateWebhookSetting(id: string, updates: Partial<WebhookSetting>) {
  const { data, error } = await supabase
    .from('webhook_settings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as WebhookSetting;
}

export async function deleteWebhookSetting(id: string) {
  const { error } = await supabase
    .from('webhook_settings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateWebhookPayloadConfig(
  id: string,
  config: WebhookPayloadConfig,
  webhookUrl?: string
) {
  const { data, error } = await supabase
    .from('webhook_settings')
    .update({
      payload_config: config,
      webhook_url: webhookUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('*, client:profiles!inner(id, email, client_name, role)')
    .single();

  if (error) throw error;
  return data as WebhookSetting;
}

export async function updateGlobalWebhookConfig(config: WebhookPayloadConfig) {
  // First try to update any existing config
  const { data: updated, error: updateError } = await supabase
    .from('global_webhook_config')
    .update({ payload_config: config })
    .select()
    .maybeSingle();

  if (updateError) throw updateError;

  // If no rows were updated, insert new config
  if (!updated) {
    const { data: inserted, error: insertError } = await supabase
      .from('global_webhook_config')
      .insert([{ payload_config: config }])
      .select()
      .maybeSingle();

    if (insertError) throw insertError;
    return inserted;
  }

  return updated;
}

export async function getGlobalWebhookConfig(): Promise<WebhookPayloadConfig | null> {
  const { data, error } = await supabase
    .from('global_webhook_config')
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.payload_config || null;
}

async function getClientWebhooks(clientName: string): Promise<WebhookSetting[]> {
  if (!clientName) {
    console.warn('No client name provided for webhook lookup');
    return [];
  }

  // First get the client profile
  const { data: clientProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('client_name', clientName)
    .eq('role', 'customer')
    .single();

  if (profileError || !clientProfile) {
    console.warn(`No client profile found for name: ${clientName}`);
    return [];
  }

  const { data, error } = await supabase
    .from('webhook_settings')
    .select(`
      *,
      client:profiles!inner(
        id,
        email,
        client_name,
        role
      )
    `)
    .eq('client_id', clientProfile.id)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching webhooks:', error);
    return [];
  }

  return data || [];
}