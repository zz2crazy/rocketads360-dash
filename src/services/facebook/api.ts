import { debug } from '../../lib/debug';
import { getStoredAccessToken } from './auth';

const FB_API_VERSION = 'v18.0';
const FB_API_BASE = `https://graph.facebook.com/${FB_API_VERSION}`;

export async function checkBusinessManager(bmId: string) {
  try {
    debug.group('facebook', `Checking BM ${bmId}`);
    
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
      debug.info('facebook', 'No valid token found');
      return null;
    }

    const response = await fetch(
      `${FB_API_BASE}/${bmId}?access_token=${accessToken}&fields=id,name,verification_status`
    );

    if (!response.ok) {
      const error = await response.json();
      debug.error('facebook', 'BM check failed:', error);
      
      if (error.error?.code === 190) { // Invalid/expired token
        debug.info('facebook', 'Token expired');
        return null;
      }
      
      throw new Error(error.error?.message || 'Failed to check BM status');
    }

    const data = await response.json();
    debug.info('facebook', 'BM check successful:', data);
    
    return {
      id: data.id,
      name: data.name,
      status: data.verification_status === 'verified' ? 'active' : 'inactive'
    };
  } catch (error) {
    debug.error('facebook', 'BM check error:', error);
    throw error;
  } finally {
    debug.groupEnd('facebook');
  }
}