import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeetingStore } from '../store/useMeetingStore';

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

  // Start OAuth flow with PKCE
  const startAuth = async () => {
    try {
      setLoading(true);

      // Generate PKCE pair
      const verifier = generateRandomString(64);
      const challenge = await generateCodeChallenge(verifier);
      const state = generateRandomString(32);

      // Store temporarily in localStorage
      localStorage.setItem('zoho_pkce_verifier', verifier);
      localStorage.setItem('zoho_auth_state', state);

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
      const accessToken = data.access_token;

      // Update state and store
      setToken(accessToken);
      setZohoToken(accessToken);

      // Clean up temporary storage
      localStorage.removeItem('zoho_pkce_verifier');
      localStorage.removeItem('zoho_auth_state');

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

      const response = await fetch('/api/zoho/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newToken = data.access_token;

      // Update state and store
      setToken(newToken);
      setZohoToken(newToken);

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
      const storedState = localStorage.getItem('zoho_auth_state');
      if (state === storedState) {
        const verifier = localStorage.getItem('zoho_pkce_verifier');
        if (verifier) {
          handleCallback(code, verifier);
        }
      } else {
        console.error('State mismatch - possible CSRF attack');
        localStorage.removeItem('zoho_pkce_verifier');
        localStorage.removeItem('zoho_auth_state');
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