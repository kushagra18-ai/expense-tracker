/**
 * Google Auth Service — Uses Google Identity Services (GIS) Token Client
 * No backend needed, no client secrets in code.
 */

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

let tokenClient = null;
let accessToken = null;
let tokenExpiry = null;
let onAuthChange = null;

/**
 * Load the GIS script if not already loaded
 */
function loadGISScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

/**
 * Initialize the token client
 */
export async function initGoogleAuth(clientId, callback) {
  onAuthChange = callback;
  await loadGISScript();
  
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        console.error('Auth error:', tokenResponse);
        onAuthChange?.({ authenticated: false, error: tokenResponse.error });
        return;
      }
      accessToken = tokenResponse.access_token;
      // Token expires in ~1 hour
      tokenExpiry = Date.now() + (tokenResponse.expires_in * 1000);
      onAuthChange?.({ authenticated: true, token: accessToken });
    },
  });
}

/**
 * Request access token (opens Google consent popup)
 */
export function signIn() {
  if (!tokenClient) {
    throw new Error('Google Auth not initialized. Set your Client ID in Settings first.');
  }
  tokenClient.requestAccessToken({ prompt: 'consent' });
}

/**
 * Revoke access token
 */
export function signOut() {
  if (accessToken) {
    window.google.accounts.oauth2.revoke(accessToken, () => {
      accessToken = null;
      tokenExpiry = null;
      onAuthChange?.({ authenticated: false });
    });
  }
}

/**
 * Get current access token (or null)
 */
export function getAccessToken() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }
  return null;
}

/**
 * Check if authenticated
 */
export function isAuthenticated() {
  return !!getAccessToken();
}

/**
 * Refresh token by requesting a new one (silent if possible)
 */
export function refreshToken() {
  if (!tokenClient) return;
  tokenClient.requestAccessToken({ prompt: '' });
}
