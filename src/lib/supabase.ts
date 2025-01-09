import { createClient } from '@supabase/supabase-js';
import { debug } from './debug';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
}

// Clear any stale auth data on init
try {
  localStorage.removeItem('auth-store');
} catch (error) {
  console.warn('Failed to clear stale auth data:', error);
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || '';

const storageConfig = {
  db: {
    schema: 'public'
  },
  persistSession: true,
  autoRefreshToken: false,
  detectSessionInUrl: false,
  storage: {
    getItem: (key: string) => {
      try {
        const item = localStorage.getItem(key);
        if (!item || item === 'undefined' || item === 'null') {
          localStorage.removeItem(key);
          return null;
        }
        return item;
      } catch (error) {
        console.error('Error accessing localStorage:', error);
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        if (!value || value === 'undefined' || value === 'null') {
          return;
        }
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error setting localStorage:', error);
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
      }
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    ...storageConfig,
    storageKey: 'auth-store'
  }
});

// Admin client with service role key for privileged operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});