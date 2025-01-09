import type { WebhookPayload } from './types';

export function logWebhookAttempt(payload: WebhookPayload, attempt: number): void {
  console.group('Webhook Debug Info');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Attempt:', attempt);
  console.log('Payload:', JSON.stringify(payload, null, 2));
  console.groupEnd();
}

export function logWebhookError(error: unknown, payload: WebhookPayload, attempt: number): void {
  console.group('Webhook Error');
  console.error('Error Details:', {
    timestamp: new Date().toISOString(),
    attempt,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      cause: error.cause,
      stack: error.stack
    } : error,
    payload
  });
  console.groupEnd();
}