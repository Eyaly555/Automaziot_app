/**
 * Token Manager Service
 * Handles secure token storage, refresh, and multi-tab synchronization
 */

interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope?: string;
}

interface TokenChangeEvent {
  type: 'token_updated' | 'token_expired' | 'token_cleared';
  data?: TokenData;
}

class TokenManager {
  private static instance: TokenManager;
  private broadcastChannel: BroadcastChannel | null = null;
  private tokenKey = 'zoho_token_data';
  private listeners: Set<(event: TokenChangeEvent) => void> = new Set();
  private refreshTimer: number | null = null;

  private constructor() {
    this.initBroadcastChannel();
    this.initStorageListener();
    this.scheduleTokenRefresh();
  }

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  private initBroadcastChannel() {
    // Use BroadcastChannel if available (modern browsers)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('zoho_token_sync');
        this.broadcastChannel.onmessage = (event) => {
          this.handleTokenChange(event.data);
        };
      } catch (error) {
        console.warn('BroadcastChannel not available:', error);
      }
    }
  }

  private initStorageListener() {
    // Fallback to storage events for cross-tab sync
    window.addEventListener('storage', (event) => {
      if (event.key === this.tokenKey) {
        const newValue = event.newValue ? JSON.parse(event.newValue) : null;
        this.handleTokenChange({
          type: newValue ? 'token_updated' : 'token_cleared',
          data: newValue
        });
      }
    });
  }

  private handleTokenChange(event: TokenChangeEvent) {
    // Notify all listeners
    this.listeners.forEach(listener => listener(event));

    // Reschedule refresh if token updated
    if (event.type === 'token_updated' && event.data) {
      this.scheduleTokenRefresh();
    }
  }

  private broadcast(event: TokenChangeEvent) {
    // Broadcast to other tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(event);
    }

    // Also notify local listeners
    this.handleTokenChange(event);
  }

  /**
   * Store token data securely
   */
  setToken(tokenData: TokenData): void {
    try {
      // Store encrypted in localStorage
      const encrypted = this.encrypt(tokenData);
      localStorage.setItem(this.tokenKey, JSON.stringify(encrypted));

      // Broadcast to other tabs
      this.broadcast({ type: 'token_updated', data: tokenData });

      // Schedule refresh
      this.scheduleTokenRefresh();
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  /**
   * Get current token data
   */
  getToken(): TokenData | null {
    try {
      const stored = localStorage.getItem(this.tokenKey);
      if (!stored) return null;

      const encrypted = JSON.parse(stored);
      const tokenData = this.decrypt(encrypted);

      // Check if expired
      if (tokenData.expiresAt <= Date.now()) {
        this.clearToken();
        return null;
      }

      return tokenData;
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  }

  /**
   * Clear token data
   */
  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.broadcast({ type: 'token_cleared' });

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Check if token is valid and not expired
   */
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Check if token expires in next 5 minutes
    const expiresIn = token.expiresAt - Date.now();
    return expiresIn > 5 * 60 * 1000; // 5 minutes buffer
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const token = this.getToken();
    if (!token || !token.refreshToken) return;

    // Calculate when to refresh (5 minutes before expiry)
    const refreshIn = Math.max(0, token.expiresAt - Date.now() - 5 * 60 * 1000);

    if (refreshIn > 0) {
      this.refreshTimer = window.setTimeout(async () => {
        await this.refreshToken();
      }, refreshIn);
    }
  }

  /**
   * Refresh the access token
   */
  async refreshToken(): Promise<string | null> {
    const currentToken = this.getToken();
    if (!currentToken?.refreshToken) {
      console.error('No refresh token available');
      return null;
    }

    try {
      const response = await fetch('/api/zoho/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: currentToken.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      // Update stored token
      const newTokenData: TokenData = {
        accessToken: data.access_token,
        refreshToken: currentToken.refreshToken, // Keep existing refresh token
        expiresAt: Date.now() + (data.expires_in * 1000),
        scope: data.scope || currentToken.scope
      };

      this.setToken(newTokenData);
      return newTokenData.accessToken;

    } catch (error) {
      console.error('Failed to refresh token:', error);
      this.broadcast({ type: 'token_expired' });
      return null;
    }
  }

  /**
   * Register a listener for token changes
   */
  onTokenChange(callback: (event: TokenChangeEvent) => void): () => void {
    this.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Simple encryption for token storage
   * Note: This is basic obfuscation. For production, consider using Web Crypto API
   */
  private encrypt(data: TokenData): any {
    // Convert to base64 with some obfuscation
    const jsonStr = JSON.stringify(data);
    const encoded = btoa(unescape(encodeURIComponent(jsonStr)));

    // Split and reverse for basic obfuscation
    const mid = Math.floor(encoded.length / 2);
    return {
      a: encoded.substring(0, mid),
      b: encoded.substring(mid).split('').reverse().join('')
    };
  }

  /**
   * Decrypt token data
   */
  private decrypt(encrypted: any): TokenData {
    // Reconstruct from obfuscated parts
    const encoded = encrypted.a + encrypted.b.split('').reverse().join('');
    const jsonStr = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(jsonStr);
  }

  /**
   * Get remaining time until token expiry in milliseconds
   */
  getTimeUntilExpiry(): number {
    const token = this.getToken();
    if (!token) return 0;
    return Math.max(0, token.expiresAt - Date.now());
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance();