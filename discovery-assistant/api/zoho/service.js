// Zoho API Service - Self Client Authentication
// This service handles all Zoho API interactions using server-side authentication

// Token cache - module-level variables persist during the request lifecycle
let cachedAccessToken = null;
let tokenExpiryTime = null;

/**
 * Get a valid access token, refreshing if necessary
 * Uses a 5-minute buffer before expiry to ensure token is always valid
 */
async function getAccessToken() {
  const now = Date.now();
  const fiveMinutesInMs = 5 * 60 * 1000; // 5 minute buffer

  // Check if we have a valid cached token with 5-minute buffer
  if (cachedAccessToken && tokenExpiryTime && (tokenExpiryTime - now) > fiveMinutesInMs) {
    console.log('[Zoho Service] Using cached access token');
    return cachedAccessToken;
  }

  console.log('[Zoho Service] Refreshing access token');

  // Prepare refresh request
  const params = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    grant_type: 'refresh_token'
  });

  try {
    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${error}`);
    }

    const data = await response.json();

    // Cache the new token
    cachedAccessToken = data.access_token;
    // Set expiry time (expires_in is in seconds, convert to milliseconds)
    tokenExpiryTime = now + (data.expires_in * 1000);

    console.log('[Zoho Service] Access token refreshed successfully');
    return cachedAccessToken;

  } catch (error) {
    console.error('[Zoho Service] Failed to refresh access token:', error);
    throw new Error('Failed to authenticate with Zoho');
  }
}

/**
 * Make an authenticated API call to Zoho
 * @param {string} endpoint - The API endpoint (relative to api_domain)
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<any>} - The API response data
 */
async function zohoAPI(endpoint, options = {}) {
  // Ensure we have environment variables
  if (!process.env.ZOHO_REFRESH_TOKEN || !process.env.ZOHO_CLIENT_ID || !process.env.ZOHO_CLIENT_SECRET) {
    throw new Error('Missing Zoho credentials in environment variables');
  }

  let retryCount = 0;
  const maxRetries = 1;

  while (retryCount <= maxRetries) {
    try {
      // Get a valid access token
      const accessToken = await getAccessToken();

      // Construct full URL
      const apiDomain = process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com';
      const url = `${apiDomain}${endpoint}`;

      // Make the API call
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Handle 401 - token might be expired
      if (response.status === 401 && retryCount < maxRetries) {
        console.log('[Zoho Service] Got 401, invalidating token and retrying...');
        cachedAccessToken = null;
        tokenExpiryTime = null;
        retryCount++;
        continue;
      }

      // Check for other errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Zoho API error (${response.status}): ${errorText}`);
      }

      // Parse and return the response
      const data = await response.json();
      return data;

    } catch (error) {
      if (retryCount < maxRetries && error.message.includes('401')) {
        retryCount++;
        continue;
      }
      throw error;
    }
  }
}

/**
 * Get CRM modules (for testing connection)
 */
async function getModules() {
  return zohoAPI('/crm/v6/settings/modules');
}

/**
 * Search for deals
 * @param {Object} criteria - Search criteria
 */
async function searchDeals(criteria) {
  const params = new URLSearchParams(criteria);
  return zohoAPI(`/crm/v6/Deals/search?${params}`);
}

/**
 * Get a specific deal by ID
 * @param {string} dealId - The deal ID
 */
async function getDeal(dealId) {
  return zohoAPI(`/crm/v6/Deals/${dealId}`);
}

/**
 * Update a deal
 * @param {string} dealId - The deal ID
 * @param {Object} data - The update data
 */
async function updateDeal(dealId, data) {
  return zohoAPI(`/crm/v6/Deals/${dealId}`, {
    method: 'PUT',
    body: JSON.stringify({ data: [data] })
  });
}

/**
 * Create a new deal
 * @param {Object} data - The deal data
 */
async function createDeal(data) {
  return zohoAPI('/crm/v6/Deals', {
    method: 'POST',
    body: JSON.stringify({ data: [data] })
  });
}

/**
 * Get records from any module
 * @param {string} module - The module name (Leads, Contacts, etc.)
 * @param {Object} params - Query parameters
 */
async function getRecords(module, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = `/crm/v6/${module}${queryString ? `?${queryString}` : ''}`;
  return zohoAPI(endpoint);
}

/**
 * Update a record in any module
 * @param {string} module - The module name
 * @param {string} recordId - The record ID
 * @param {Object} data - The update data
 */
async function updateRecord(module, recordId, data) {
  return zohoAPI(`/crm/v6/${module}/${recordId}`, {
    method: 'PUT',
    body: JSON.stringify({ data: [data] })
  });
}

// Export the service functions
module.exports = {
  getAccessToken,
  zohoAPI,
  getModules,
  searchDeals,
  getDeal,
  updateDeal,
  createDeal,
  getRecords,
  updateRecord
};