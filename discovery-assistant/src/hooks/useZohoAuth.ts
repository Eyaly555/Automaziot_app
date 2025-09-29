import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeetingStore } from '../store/useMeetingStore';
import { tokenManager } from '../services/tokenManager';

// Generate cryptographically random string for PKCE
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Generate PKCE challenge from verifier
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
  // Convert to URL-safe base64
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export const useZohoAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setZohoToken } = useMeetingStore();

  // Initialize token from storage
  useEffect(() => {
    const tokenData = tokenManager.getToken();
    if (tokenData) {
      setToken(tokenData.accessToken);
      setZohoToken(tokenData.accessToken);
    }

    // Listen for token changes from other tabs
    const unsubscribe = tokenManager.onTokenChange((event) => {
      if (event.type === 'token_updated' && event.data) {
        setToken(event.data.accessToken);
        setZohoToken(event.data.accessToken);
      } else if (event.type === 'token_cleared') {
        setToken(null);
        setZohoToken('');
      }
    });

    return unsubscribe;
  }, [setZohoToken]);

  // Start OAuth flow with PKCE
  const startAuth = async () => {
    try {
      setLoading(true);

      // Generate PKCE pair
      const verifier = generateRandomString(64);
      const challenge = await generateCodeChallenge(verifier);
      const state = generateRandomString(32);

      // Store temporarily in sessionStorage for better security
      sessionStorage.setItem('zoho_pkce_verifier', verifier);
      sessionStorage.setItem('zoho_auth_state', state);

      // Store return URL to redirect back after auth
      const currentUrl = window.location.href;
      const returnUrl = currentUrl.split('?')[0] + (window.location.search || '');
      sessionStorage.setItem('zoho_return_url', returnUrl);

      // Build authorization URL
      const authParams = new URLSearchParams({
        scope: 'ZohoCRM.modules.potentials.READ,ZohoCRM.modules.potentials.UPDATE',
        client_id: import.meta.env.VITE_ZOHO_CLIENT_ID || '',
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
        redirect_uri: import.meta.env.VITE_ZOHO_REDIRECT_URI || '',
        state: state,
        code_challenge: challenge,
        code_challenge_method: 'S256'
      });

      const authUrl = `https://accounts.zoho.com/oauth/v2/auth?${authParams.toString()}`;

      // Redirect to Zoho auth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to start auth flow:', error);
      setLoading(false);
    }
  };

  // Handle OAuth callback
  const handleCallback = async (code: string, verifier: string) => {
    try {
      setLoading(true);

      const response = await fetch('/api/zoho/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, verifier })
      });

      if (!response.ok) {
        throw new Error('Token exchange failed');
      }

      const data = await response.json();

      // Store using tokenManager for secure storage and multi-tab sync
      tokenManager.setToken({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        scope: data.scope
      });

      // Update local state
      setToken(data.access_token);
      setZohoToken(data.access_token);

      // Clean up temporary storage
      sessionStorage.removeItem('zoho_pkce_verifier');
      sessionStorage.removeItem('zoho_auth_state');

      // Navigate back to root
      navigate('/', { replace: true });
    } catch (error) {
      console.error('OAuth callback error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh access token
  const refreshToken = async () => {
    try {
      setLoading(true);
      const newToken = await tokenManager.refreshToken();

      if (newToken) {
        // Update local state
        setToken(newToken);
        setZohoToken(newToken);
      }

      return newToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check for OAuth callback on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      // Validate state
      const storedState = sessionStorage.getItem('zoho_auth_state');
      if (state === storedState) {
        const verifier = sessionStorage.getItem('zoho_pkce_verifier');
        if (verifier) {
          handleCallback(code, verifier);
        }
      } else {
        console.error('State mismatch - possible CSRF attack');
        sessionStorage.removeItem('zoho_pkce_verifier');
        sessionStorage.removeItem('zoho_auth_state');
      }
    }
  }, []);

  return {
    startAuth,
    token,
    loading,
    refreshToken
  };
};