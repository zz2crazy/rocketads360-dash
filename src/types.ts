import type { Profile } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  role: 'customer' | 'employee' | 'super_admin';
  nickname?: string;
  client_name?: string;
  created_at: string;
}

export interface BusinessManager {
  id: string;
  provider_id: string;
  bm_id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  last_sync: string;
  created_at: string;
  error_message?: string;
  provider?: BMProvider;
}

export interface BMProvider {
  id: string;
  name: string;
  api_key?: string;
  api_secret?: string;
  status: 'active' | 'inactive';
  created_at: string;
  created_by: string;
  created_by_profile?: Profile;
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