import { debug } from '../../lib/debug';

const FB_APP_ID = import.meta.env.VITE_FB_APP_ID;
const FB_APP_SECRET = import.meta.env.VITE_FB_APP_SECRET;
const FB_REDIRECT_URI = import.meta.env.VITE_FB_REDIRECT_URI;

export interface FacebookAuthResponse {
  accessToken: string;
  expiresIn: number;
  userId: string;
}

export class FacebookAuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'FacebookAuthError';
  }
}

export function initiateFacebookAuth() {
  if (!FB_APP_ID) {
    throw new FacebookAuthError('Facebook App ID not configured');
  }

  const scopes = [
    'business_management',
    'ads_management',
    'ads_read',
    'read_insights'
  ].join(',');

  const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  authUrl.searchParams.append('client_id', FB_APP_ID);
  authUrl.searchParams.append('redirect_uri', FB_REDIRECT_URI);
  authUrl.searchParams.append('scope', scopes);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('state', generateState());

  debug.info('facebook', 'Initiating Facebook OAuth flow');
  window.location.href = authUrl.toString();
}

export async function handleFacebookCallback(code: string, state: string): Promise<FacebookAuthResponse> {
  debug.group('facebook', 'Handling Facebook OAuth callback');
  
  try {
    if (!validateState(state)) {
      throw new FacebookAuthError('Invalid state parameter');
    }

    // Exchange code for access token
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.append('client_id', FB_APP_ID);
    tokenUrl.searchParams.append('client_secret', FB_APP_SECRET);
    tokenUrl.searchParams.append('redirect_uri', FB_REDIRECT_URI);
    tokenUrl.searchParams.append('code', code);

    const tokenResponse = await fetch(tokenUrl.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      debug.error('facebook', 'Token exchange failed:', error);
      throw new FacebookAuthError(error.error?.message || 'Failed to exchange code for token');
    }

    const data = await tokenResponse.json();
    debug.info('facebook', 'Successfully obtained access token');

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      userId: data.user_id
    };
  } catch (error) {
    debug.error('facebook', 'OAuth callback error:', error);
    throw error;
  } finally {
    debug.groupEnd('facebook');
  }
}

// Generate a random state parameter for CSRF protection
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const state = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  sessionStorage.setItem('fb_auth_state', state);
  return state;
}

// Validate the state parameter
function validateState(state: string): boolean {
  const savedState = sessionStorage.getItem('fb_auth_state');
  sessionStorage.removeItem('fb_auth_state');
  return state === savedState;
}

// Store the access token securely
export function storeAccessToken(token: string, expiresIn: number): void {
  const expiresAt = Date.now() + (expiresIn * 1000);
  sessionStorage.setItem('fb_access_token', token);
  sessionStorage.setItem('fb_token_expires_at', expiresAt.toString());
}

// Get the stored access token if it's still valid
export function getStoredAccessToken(): string | null {
  const token = sessionStorage.getItem('fb_access_token');
  const expiresAt = sessionStorage.getItem('fb_token_expires_at');

  if (!token || !expiresAt) {
    return null;
  }

  if (Date.now() >= parseInt(expiresAt, 10)) {
    sessionStorage.removeItem('fb_access_token');
    sessionStorage.removeItem('fb_token_expires_at');
    return null;
  }

  return token;
}