import type { Order } from '../../types';

export interface WebhookPayload {
  event_type: 'order_created' | 'order_updated';
  order_id: string;
  client_name: string;
  account_count: number;
  timezone: string;
  status: Order['status'];
  previous_status?: Order['status'];
  timestamp: string;
}

export interface WebhookConfig {
  url: string;
  maxRetries: number;
  retryDelay: number;
}

export const DEFAULT_MESSAGE_TEMPLATES = {
  orderCreated: '收到新订单啦! 订单号: {order_id}, 客户名: {client_name}, 账户数量: {account_count}, 时区: {timezone}. {timestamp}. 赶紧处理吧~',
  orderUpdated: '订单更新! 订单号: {order_id}, 状态由{nickname}从 {previous_status} 更新为 {status}. {timestamp}'
} as const;