import type { WebhookPayload } from './types';
import { webhookConfig } from './config';
import { DEFAULT_MESSAGE_TEMPLATES } from './types';
import { debug } from '../../lib/debug';
import { sleep, createWebhookError, formatTimestamp } from './utils';
import { supabase } from '../../lib/supabase';
import type { WebhookSetting } from '../../types';
import { getGlobalWebhookConfig } from '../supabase/webhook';

const pendingRequests = new Map<string, Promise<void>>();

function getRequestKey(payload: WebhookPayload): string {
  return `${payload.event_type}_${payload.order_id}_${payload.status}`;
}

async function sendWebhookRequest(
  url: string, 
  payload: WebhookPayload, 
  messageConfig?: WebhookPayloadConfig,
  attempt: number = 1,
  isGlobal: boolean = false
): Promise<void> {
  const webhookType = isGlobal ? 'Global' : 'Client';
  debug.group('webhook', `${webhookType} Webhook Request (Attempt ${attempt})`);
  debug.info('webhook', `URL: ${url}`);
  debug.debug('webhook', 'Payload:', payload);

  // Get the current user's nickname if they are an employee
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', user?.id)
    .single();

  const nickname = profile?.nickname || '';
  debug.debug('webhook', `Employee nickname: ${nickname}`);

  // Format message using config if available
  const message = payload.event_type === 'order_created'
    ? (messageConfig?.orderCreated || DEFAULT_MESSAGE_TEMPLATES.orderCreated)
        .replace('{order_id}', payload.order_id)
        .replace('{client_name}', payload.client_name)
        .replace('{account_count}', payload.account_count.toString())
        .replace('{timezone}', payload.timezone)
        .replace('{timestamp}', formatTimestamp(payload.timestamp))
    : (messageConfig?.orderUpdated || DEFAULT_MESSAGE_TEMPLATES.orderUpdated)
        .replace('{order_id}', payload.order_id)
        .replace('{nickname}', nickname)
        .replace('{previous_status}', payload.previous_status || '')
        .replace('{status}', payload.status)
        .replace('{timestamp}', formatTimestamp(payload.timestamp));

  debug.debug('webhook', 'Formatted message:', message);

  // Format payload for Feishu
  const feishuPayload = {
    msg_type: "text",
    content: { text: message }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feishuPayload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    debug.info('webhook', `${webhookType} webhook sent successfully:`, responseData);
  } catch (error) {
    debug.error('webhook', `Failed to send to ${url}`, error);

    if (attempt < webhookConfig.maxRetries) {
      const nextAttempt = attempt + 1;
      const delay = webhookConfig.retryDelay * attempt;
      
      debug.info('webhook', `Retrying in ${delay}ms (attempt ${nextAttempt}/${webhookConfig.maxRetries})`);
      await sleep(delay);
      return sendWebhookRequest(url, payload, messageConfig, nextAttempt, isGlobal);
    }
    
    throw createWebhookError(
      `Failed to send webhook notification after ${attempt} attempts`,
      error instanceof Error ? error : undefined
    );
  } finally {
    debug.groupEnd('webhook');
  }
}

async function getClientWebhooks(clientName: string): Promise<WebhookSetting[]> {
  debug.group('webhook', `Fetching webhooks for client: ${clientName}`);

  // Validate input
  if (!clientName) {
    debug.warn('webhook', 'No client name provided for webhook lookup');
    debug.groupEnd('webhook');
    return [];
  }

  debug.info('webhook', `Looking up webhooks for client: ${clientName}`);

  // Get webhooks directly with client profile join
  const { data: webhooks, error } = await supabase
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
    .eq('client.client_name', clientName)
    .eq('client.role', 'customer')
    .eq('is_active', true);

  if (error) {
    debug.error('webhook', 'Error fetching webhooks:', error);
    debug.groupEnd('webhook');
    return [];
  }

  // Additional debug info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('client_name', clientName)
    .single();

  debug.info('webhook', 'Client profile:', profile);
  debug.info('webhook', `Found ${webhooks?.length || 0} active webhooks`);
  debug.debug('webhook', 'Active webhooks:', webhooks);

  if (!webhooks || webhooks.length === 0) {
    debug.warn('webhook', `No active webhooks found for client "${clientName}"`);
  }

  debug.groupEnd('webhook');
  return webhooks || [];
}

export async function sendWebhookNotification(payload: WebhookPayload): Promise<void> {
  const requestKey = getRequestKey(payload);
  
  if (pendingRequests.has(requestKey)) {
    debug.info('webhook', `Request already pending for ${requestKey}, waiting for completion`);
    return pendingRequests.get(requestKey);
  }

  const requestPromise = (async () => {
    try {
      debug.group('webhook', `Sending notification for ${requestKey}`);
      debug.debug('webhook', 'Initial payload:', payload);

      if (!payload.client_name) {
        debug.warn('webhook', 'No client name provided in payload', { payload });
        return;
      }

      // Get global webhook config and client webhooks in parallel
      const [globalConfig, clientWebhooks] = await Promise.all([
        getGlobalWebhookConfig(),
        getClientWebhooks(payload.client_name)
      ]);

      debug.group('webhook', 'Webhook configurations loaded');
      debug.info('webhook', 'Configuration summary:', {
        hasGlobalConfig: !!globalConfig,
        clientWebhooksCount: clientWebhooks.length
      });
      debug.debug('webhook', 'Global config:', globalConfig);
      debug.debug('webhook', 'Client webhooks:', clientWebhooks);
      debug.groupEnd('webhook');

      
      // Send to global webhook first
      if (webhookConfig.url) {
        debug.info('webhook', 'Sending to global webhook');
        try {
          await sendWebhookRequest(
          webhookConfig.url,
          payload,
          globalConfig || undefined,
          1,
          true
          );
          debug.info('webhook', '✅ Global webhook sent successfully to:', webhookConfig.url);
        } catch (error) {
          debug.error('webhook', '❌ Failed to send to global webhook', error);
          // Continue with client webhooks even if global webhook fails
        }
      }

      // Then send to client webhooks
      if (clientWebhooks.length > 0) {
        debug.info('webhook', `Sending to ${clientWebhooks.length} client webhooks:`, {
          clientName: payload.client_name,
          webhookUrls: clientWebhooks.map(w => w.webhook_url)
        });
        debug.debug('webhook', 'Client webhooks:', clientWebhooks);
        const clientResults = await Promise.allSettled(
          clientWebhooks.map(webhook => sendWebhookRequest(
            webhook.webhook_url,
            payload,
            webhook.payload_config || globalConfig || undefined,
            1, 
            false
          ))
        );
      
        const successful = clientResults.filter(r => r.status === 'fulfilled').length;
        const failed = clientResults.filter(r => r.status === 'rejected').length;
      
        debug.info('webhook', 
          `Client webhook notifications completed:\n` +
          `✨ Total client webhooks: ${clientWebhooks.length}\n` +
          `✅ Successful: ${successful}\n` +
          `❌ Failed: ${failed}`
        );
        debug.debug('webhook', 'Client webhook results:', clientResults);
      
        if (failed > 0) {
          const failedResults = clientResults
            .map((result, index) => ({ 
              result,
              webhook: clientWebhooks[index]
            }))
            .filter(({ result }) => result.status === 'rejected')
            .map(({ result, webhook }) => ({
              error: result.reason,
              webhookUrl: webhook.webhook_url,
              clientName: webhook.client?.client_name
            }));
        
          debug.error('webhook', '❌ Failed client webhook notifications:', failedResults);
        }
      }
    } catch (error) {
      debug.error('webhook', 'Failed to send notifications', error);
    } finally {
      debug.groupEnd('webhook');
      pendingRequests.delete(requestKey);
      debug.info('webhook', `Request ${requestKey} completed and removed from pending`);
    }
  })();

  pendingRequests.set(requestKey, requestPromise);
  
  return requestPromise;
}