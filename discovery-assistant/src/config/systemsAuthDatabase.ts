/**
 * systemsAuthDatabase.ts
 *
 * Authentication templates and configuration for common business systems.
 * Used in Phase 2 to pre-fill authentication details when collecting system deep dive information.
 */

export interface SystemAuthTemplate {
  systemName: string;
  defaultAuthMethod: 'oauth' | 'api_key' | 'basic_auth' | 'jwt' | 'custom';
  apiEndpoint: string;
  rateLimits: string;
  documentation: string;
  commonModules?: string[];
  authGuide: string;
  requiredScopes?: string[];
  notes?: string;
}

export const SYSTEM_AUTH_TEMPLATES: Record<string, SystemAuthTemplate> = {
  // ==================== CRM SYSTEMS ====================
  'zoho-crm': {
    systemName: 'Zoho CRM',
    defaultAuthMethod: 'oauth',
    apiEndpoint: 'https://www.zohoapis.com/crm/v2',
    rateLimits: '5000 credits/day (refreshes daily)',
    documentation: 'https://www.zoho.com/crm/developer/docs/api/v2/',
    commonModules: ['Leads', 'Contacts', 'Accounts', 'Deals', 'Tasks', 'Calls', 'Meetings', 'Products', 'Quotes', 'Invoices'],
    requiredScopes: ['ZohoCRM.modules.ALL', 'ZohoCRM.settings.ALL', 'ZohoCRM.users.ALL'],
    authGuide: `הנחיות לקבלת OAuth Token ל-Zoho CRM:
1. היכנס ל-Zoho API Console: https://api-console.zoho.com/
2. צור Self Client (Server-Based Application)
3. העתק Client ID ו-Client Secret
4. הוסף Redirect URI: https://oauth.zoho.com/oauth/v2/auth
5. בקש הרשאות: ZohoCRM.modules.ALL, ZohoCRM.settings.ALL
6. צור Refresh Token באמצעות Authorization Code Flow`,
    notes: 'שים לב: Data Center יכול להיות .com, .eu, .in, .com.au - חשוב לבדוק איזה Data Center החשבון נמצא בו'
  },

  'salesforce': {
    systemName: 'Salesforce',
    defaultAuthMethod: 'oauth',
    apiEndpoint: 'https://[instance].my.salesforce.com/services/data/v58.0',
    rateLimits: '15,000 API calls per 24 hours (Enterprise), 5,000 (Professional)',
    documentation: 'https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/',
    commonModules: ['Lead', 'Contact', 'Account', 'Opportunity', 'Case', 'Task', 'Event', 'Campaign', 'Product2', 'Quote'],
    requiredScopes: ['api', 'refresh_token', 'full'],
    authGuide: `הנחיות לקבלת OAuth Token ל-Salesforce:
1. היכנס ל-Setup → Apps → App Manager
2. צור New Connected App
3. אפשר OAuth Settings
4. בחר scopes: Full access (full), Perform requests at any time (refresh_token)
5. העתק Consumer Key ו-Consumer Secret
6. המתן 2-10 דקות לאקטיבציה`,
    notes: 'Instance URL משתנה לפי הארגון (e.g., na50, eu11, ap5). בדוק ב-URL של החשבון שלך'
  },

  'hubspot': {
    systemName: 'HubSpot',
    defaultAuthMethod: 'api_key',
    apiEndpoint: 'https://api.hubapi.com',
    rateLimits: '100 requests per 10 seconds',
    documentation: 'https://developers.hubspot.com/docs/api/overview',
    commonModules: ['Contacts', 'Companies', 'Deals', 'Tickets', 'Products', 'Line Items', 'Quotes', 'Meetings', 'Calls', 'Emails'],
    authGuide: `הנחיות לקבלת API Key ל-HubSpot:
1. היכנס ל-Settings → Integrations → Private Apps
2. Create a private app
3. הגדר הרשאות נדרשות (CRM, Contacts, Companies, Deals)
4. Generate token
5. העתק את ה-Access Token`,
    notes: 'מומלץ להשתמש ב-Private Apps במקום API Key הישן (deprecated)'
  },

  'pipedrive': {
    systemName: 'Pipedrive',
    defaultAuthMethod: 'api_key',
    apiEndpoint: 'https://api.pipedrive.com/v1',
    rateLimits: '100 requests per 10 seconds',
    documentation: 'https://developers.pipedrive.com/docs/api/v1',
    commonModules: ['Persons', 'Organizations', 'Deals', 'Activities', 'Products', 'Leads', 'Pipelines', 'Stages'],
    authGuide: `הנחיות לקבלת API Token ל-Pipedrive:
1. היכנס ל-Settings → Personal Preferences → API
2. העתק את ה-API Token הקיים או צור חדש
3. שים לב ל-Company Domain (ה-subdomain שלך)`,
    notes: 'שמור את ה-Company Domain - הוא חלק מה-API endpoint'
  },

  'monday': {
    systemName: 'Monday.com',
    defaultAuthMethod: 'api_key',
    apiEndpoint: 'https://api.monday.com/v2',
    rateLimits: '60 requests per minute (Standard), 120 rpm (Pro), 240 rpm (Enterprise)',
    documentation: 'https://developer.monday.com/api-reference/docs',
    commonModules: ['boards', 'items', 'updates', 'users', 'teams', 'workspaces'],
    authGuide: `הנחיות לקבלת API Token ל-Monday.com:
1. היכנס ל-Profile Picture → Admin → API
2. Generate API Token
3. העתק את ה-Token`,
    notes: 'Monday.com משתמשת ב-GraphQL API (לא REST)'
  },

  // ==================== MARKETING AUTOMATION ====================
  'mailchimp': {
    systemName: 'Mailchimp',
    defaultAuthMethod: 'api_key',
    apiEndpoint: 'https://<dc>.api.mailchimp.com/3.0',
    rateLimits: '10 requests per second',
    documentation: 'https://mailchimp.com/developer/marketing/api/',
    commonModules: ['lists', 'campaigns', 'automation', 'reports', 'templates'],
    authGuide: `הנחיות לקבלת API Key ל-Mailchimp:
1. היכנס ל-Account → Extras → API Keys
2. Create A Key
3. העתק את ה-API Key
4. זהה את ה-Data Center (dc) מהסוף של ה-API Key (e.g., us19)`,
    notes: 'ה-Data Center (dc) חייב להיות חלק מה-endpoint URL'
  },

  'activecampaign': {
    systemName: 'ActiveCampaign',
    defaultAuthMethod: 'api_key',
    apiEndpoint: 'https://<account>.api-us1.com/api/3',
    rateLimits: '5 requests per second',
    documentation: 'https://developers.activecampaign.com/reference/overview',
    commonModules: ['contacts', 'deals', 'accounts', 'campaigns', 'automation', 'tags'],
    authGuide: `הנחיות לקבלת API Key ל-ActiveCampaign:
1. היכנס ל-Settings → Developer
2. העתק את ה-API URL וה-API Key
3. שים לב לשם החשבון (account name)`,
    notes: 'Account name חייב להיות חלק מה-API URL'
  },

  // ==================== PROJECT MANAGEMENT ====================
  'asana': {
    systemName: 'Asana',
    defaultAuthMethod: 'oauth',
    apiEndpoint: 'https://app.asana.com/api/1.0',
    rateLimits: '1500 requests per minute',
    documentation: 'https://developers.asana.com/docs/overview',
    commonModules: ['tasks', 'projects', 'workspaces', 'teams', 'users', 'portfolios'],
    requiredScopes: ['default'],
    authGuide: `הנחיות לקבלת OAuth Token ל-Asana:
1. היכנס ל-Developer Console: https://app.asana.com/0/developer-console
2. Create New App
3. קבע Redirect URL
4. העתק Client ID ו-Client Secret
5. השתמש ב-OAuth 2.0 flow`,
    notes: 'אפשר גם להשתמש ב-Personal Access Token לטסטים'
  },

  'jira': {
    systemName: 'Jira',
    defaultAuthMethod: 'api_key',
    apiEndpoint: 'https://<your-domain>.atlassian.net/rest/api/3',
    rateLimits: 'No documented rate limit',
    documentation: 'https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/',
    commonModules: ['issues', 'projects', 'users', 'workflows', 'boards', 'sprints'],
    authGuide: `הנחיות לקבלת API Token ל-Jira:
1. היכנס ל-Account Settings → Security → API tokens
2. Create API token
3. העתק את ה-Token
4. שמור את ה-Email שלך (נדרש לאימות)
5. שימוש: Basic Auth עם email:token`,
    notes: 'צריך את שם ה-Domain (site name) + Email + API Token'
  },

  'trello': {
    systemName: 'Trello',
    defaultAuthMethod: 'api_key',
    apiEndpoint: 'https://api.trello.com/1',
    rateLimits: '100 requests per 10 seconds per token',
    documentation: 'https://developer.atlassian.com/cloud/trello/rest/api-group-actions/',
    commonModules: ['boards', 'lists', 'cards', 'members', 'organizations', 'checklists'],
    authGuide: `הנחיות לקבלת API Key ל-Trello:
1. היכנס ל-https://trello.com/power-ups/admin
2. Create New Power-Up or use existing
3. Generate API Key
4. Generate Token עם ההרשאות הנדרשות`,
    notes: 'צריך גם API Key וגם Token לכל בקשה'
  },

  // ==================== COMMUNICATION ====================
  'slack': {
    systemName: 'Slack',
    defaultAuthMethod: 'oauth',
    apiEndpoint: 'https://slack.com/api',
    rateLimits: 'Tier 1: 1 per minute, Tier 2: 20 per minute, Tier 3: 50 per minute, Tier 4: 100 per minute',
    documentation: 'https://api.slack.com/docs',
    commonModules: ['channels', 'users', 'messages', 'files', 'conversations'],
    requiredScopes: ['channels:read', 'channels:write', 'chat:write', 'users:read'],
    authGuide: `הנחיות לקבלת OAuth Token ל-Slack:
1. היכנס ל-https://api.slack.com/apps
2. Create New App
3. הוסף Bot Token Scopes
4. Install App to Workspace
5. העתק Bot User OAuth Token`,
    notes: 'יש Bot Token (למשימות אוטומטיות) ו-User Token (למשימות של משתמש)'
  },

  'google-workspace': {
    systemName: 'Google Workspace',
    defaultAuthMethod: 'oauth',
    apiEndpoint: 'https://www.googleapis.com',
    rateLimits: 'Varies by service (typically 100-1000 requests per 100 seconds)',
    documentation: 'https://developers.google.com/workspace',
    commonModules: ['Gmail', 'Calendar', 'Drive', 'Sheets', 'Docs', 'Contacts'],
    requiredScopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/drive'],
    authGuide: `הנחיות לקבלת OAuth Token ל-Google Workspace:
1. היכנס ל-Google Cloud Console: https://console.cloud.google.com
2. Create New Project
3. Enable APIs (Gmail, Calendar, Drive, etc.)
4. Create OAuth 2.0 Client ID
5. הוסף Redirect URIs
6. Download credentials JSON`,
    notes: 'כל שירות (Gmail, Calendar, Drive) דורש הפעלה נפרדת ב-API Library'
  },

  'microsoft-365': {
    systemName: 'Microsoft 365',
    defaultAuthMethod: 'oauth',
    apiEndpoint: 'https://graph.microsoft.com/v1.0',
    rateLimits: '10,000 requests per 10 minutes per app per tenant',
    documentation: 'https://learn.microsoft.com/en-us/graph/overview',
    commonModules: ['Outlook', 'Calendar', 'OneDrive', 'Teams', 'SharePoint', 'Users'],
    requiredScopes: ['Mail.Read', 'Calendars.ReadWrite', 'Files.ReadWrite', 'User.Read'],
    authGuide: `הנחיות לקבלת OAuth Token ל-Microsoft 365:
1. היכנס ל-Azure Portal: https://portal.azure.com
2. Azure Active Directory → App registrations
3. New registration
4. Add API permissions (Microsoft Graph)
5. Create Client Secret
6. העתק Application (client) ID, Directory (tenant) ID, Client Secret`,
    notes: 'צריך Tenant ID + Application ID + Client Secret'
  },

  // ==================== ECOMMERCE ====================
  'shopify': {
    systemName: 'Shopify',
    defaultAuthMethod: 'api_key',
    apiEndpoint: 'https://<shop-name>.myshopify.com/admin/api/2024-01',
    rateLimits: '2 requests per second (Bucket size: 40)',
    documentation: 'https://shopify.dev/docs/api/admin-rest',
    commonModules: ['products', 'orders', 'customers', 'inventory', 'collections', 'fulfillments'],
    authGuide: `הנחיות לקבלת API Token ל-Shopify:
1. היכנס ל-Settings → Apps and sales channels
2. Develop apps → Create an app
3. Configure Admin API scopes
4. Install app
5. העתק Admin API access token`,
    notes: 'שם החנות (shop-name) חייב להיות חלק מה-endpoint'
  },

  'woocommerce': {
    systemName: 'WooCommerce',
    defaultAuthMethod: 'api_key',
    apiEndpoint: 'https://<your-site>/wp-json/wc/v3',
    rateLimits: 'No official limit (depends on WordPress hosting)',
    documentation: 'https://woocommerce.github.io/woocommerce-rest-api-docs/',
    commonModules: ['products', 'orders', 'customers', 'coupons', 'refunds', 'categories'],
    authGuide: `הנחיות לקבלת API Keys ל-WooCommerce:
1. WooCommerce → Settings → Advanced → REST API
2. Add key
3. בחר הרשאות (Read, Write, Read/Write)
4. Generate API Key
5. העתק Consumer key ו-Consumer secret`,
    notes: 'נדרש לאפשר Pretty Permalinks ב-WordPress'
  },

  // ==================== ACCOUNTING ====================
  'quickbooks': {
    systemName: 'QuickBooks Online',
    defaultAuthMethod: 'oauth',
    apiEndpoint: 'https://quickbooks.api.intuit.com/v3',
    rateLimits: '500 requests per minute per realm',
    documentation: 'https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/account',
    commonModules: ['customers', 'invoices', 'payments', 'items', 'vendors', 'bills'],
    requiredScopes: ['com.intuit.quickbooks.accounting'],
    authGuide: `הנחיות לקבלת OAuth Token ל-QuickBooks:
1. היכנס ל-Intuit Developer Portal: https://developer.intuit.com/
2. Create an app
3. Add QuickBooks Online API
4. Get Client ID and Client Secret
5. Redirect URI configuration
6. OAuth 2.0 flow for access token`,
    notes: 'צריך Realm ID (Company ID) לכל בקשה'
  },

  'xero': {
    systemName: 'Xero',
    defaultAuthMethod: 'oauth',
    apiEndpoint: 'https://api.xero.com/api.xro/2.0',
    rateLimits: '60 API calls per minute',
    documentation: 'https://developer.xero.com/documentation/api/accounting/overview',
    commonModules: ['contacts', 'invoices', 'payments', 'items', 'accounts', 'bank-transactions'],
    requiredScopes: ['accounting.transactions', 'accounting.contacts', 'accounting.settings'],
    authGuide: `הנחיות לקבלת OAuth Token ל-Xero:
1. היכנס ל-Xero Developer Portal: https://developer.xero.com/
2. My Apps → New app
3. OAuth 2.0
4. Add scopes
5. Get Client ID and Client Secret
6. Redirect URI configuration`,
    notes: 'צריך Tenant ID (Organisation ID) לכל בקשה'
  },

  // ==================== PAYMENT PROCESSING ====================
  'stripe': {
    systemName: 'Stripe',
    defaultAuthMethod: 'api_key',
    apiEndpoint: 'https://api.stripe.com/v1',
    rateLimits: 'No published rate limit (monitored for abuse)',
    documentation: 'https://stripe.com/docs/api',
    commonModules: ['customers', 'payments', 'subscriptions', 'invoices', 'products', 'charges'],
    authGuide: `הנחיות לקבלת API Key ל-Stripe:
1. היכנס ל-Dashboard → Developers → API keys
2. Reveal test key או Reveal live key
3. העתק Secret key (sk_test_... או sk_live_...)`,
    notes: 'יש Test Mode ו-Live Mode - שני API keys נפרדים'
  },

  'paypal': {
    systemName: 'PayPal',
    defaultAuthMethod: 'oauth',
    apiEndpoint: 'https://api-m.paypal.com',
    rateLimits: 'Varies by endpoint',
    documentation: 'https://developer.paypal.com/api/rest/',
    commonModules: ['payments', 'orders', 'invoices', 'subscriptions', 'payouts'],
    requiredScopes: ['openid', 'email', 'profile'],
    authGuide: `הנחיות לקבלת API Credentials ל-PayPal:
1. היכנס ל-PayPal Developer Dashboard: https://developer.paypal.com/
2. Apps & Credentials
3. Create App
4. Get Client ID and Secret
5. בחר sandbox או live`,
    notes: 'יש Sandbox environment לטסטים'
  }
};

/**
 * Get authentication template for a system by name
 */
export const getSystemAuthTemplate = (systemName: string): SystemAuthTemplate | null => {
  // Normalize system name to match keys
  const normalizedName = systemName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  // Try exact match first
  if (SYSTEM_AUTH_TEMPLATES[normalizedName]) {
    return SYSTEM_AUTH_TEMPLATES[normalizedName];
  }

  // Try partial match
  const partialMatch = Object.keys(SYSTEM_AUTH_TEMPLATES).find(key =>
    normalizedName.includes(key) || key.includes(normalizedName)
  );

  if (partialMatch) {
    return SYSTEM_AUTH_TEMPLATES[partialMatch];
  }

  return null;
};

/**
 * Get suggested modules for a system
 */
export const getSuggestedModules = (systemName: string): string[] => {
  const template = getSystemAuthTemplate(systemName);
  return template?.commonModules || [];
};
