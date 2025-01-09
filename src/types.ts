export interface Profile {
  id: string;
  email: string;
  role: 'customer' | 'employee' | 'super_admin';
  nickname?: string;
  client_name?: string;
  created_at: string;
}

export interface WebhookSetting {
  id: string;
  client_id: string;
  webhook_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  payload_config?: WebhookPayloadConfig;
  client?: Profile;
}

export interface WebhookPayloadConfig {
  orderCreated: string;
  orderUpdated: string;
}

export interface Order {
  id: string;
  user_id: string;
  client_name: string;
  account_count: number;
  timezone: string;
  account_name_spec?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
}

export interface TimezoneStats {
  timezone: string;
  total: number;
}

export interface UserWithProfile extends Profile {
  last_sign_in_at: string | null;
}

export const TIMEZONES = [
  'GMT-12:00', 'GMT-11:00', 'GMT-10:00', 'GMT-09:00', 'GMT-08:00',
  'GMT-07:00', 'GMT-06:00', 'GMT-05:00', 'GMT-04:00', 'GMT-03:00',
  'GMT-02:00', 'GMT-01:00', 'GMT+00:00', 'GMT+01:00', 'GMT+02:00', 
  'GMT+03:00', 'GMT+03:30', 'GMT+04:00', 'GMT+04:30', 'GMT+05:00',
  'GMT+05:30', 'GMT+05:45', 'GMT+06:00', 'GMT+06:30', 'GMT+07:00',
  'GMT+08:00', 'GMT+08:45', 'GMT+09:00', 'GMT+09:30', 'GMT+10:00',
  'GMT+10:30', 'GMT+11:00', 'GMT+12:00', 'GMT+12:45', 'GMT+13:00',
  'GMT+14:00'
];