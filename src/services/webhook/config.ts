import type { WebhookConfig } from './types';

export const webhookConfig: WebhookConfig = {
  url: 'https://open.feishu.cn/open-apis/bot/v2/hook/91d41f9a-f61d-4fd5-9c5a-016a9e0c61a4',
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};