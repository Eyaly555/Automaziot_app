# Integration Services - Technical Requirements Documentation
**Services 31-40: Integration Services**

Research completed: October 2025
Based on: Official API documentation, industry best practices, and real-world implementation patterns

---

## 31. integration-simple - אינטגרציה פשוטה (2 מערכות)

**מה השירות עושה**: חיבור חד-כיווני בין 2 מערכות פופולריות עם סנכרון נתונים בסיסי וללא טרנספורמציות מורכבות.

**דרישות טכניות**:
- Authentication: OAuth 2.0 או API Key (תלוי במערכות)
- API credentials: Client ID + Client Secret או API Key בלבד
- Rate limits: תלוי במערכת היעד (בדרך כלל 60-100 קריאות לדקה)
- Webhook support: לא חובה - ניתן להשתמש ב-polling כל 5-15 דקות
- API version: שימוש ב-latest stable version של כל מערכת
- n8n workflow: 3-5 nodes בממוצע
- Data format: JSON (רוב המערכות המודרניות)

**מערכות שצריך גישה אליהן**:
- Source System (מערכת מקור) - לקריאת נתונים
- Target System (מערכת יעד) - לכתיבת נתונים
- n8n workflow platform - לביצוע האוטומציה

**אינטגרציות נדרשות**:
- Source → Target: העברת נתונים חד-כיוונית, בדרך כלל real-time או כל 5-15 דקות
- דוגמאות: Typeform → Google Sheets, Gmail → Slack, Web Form → CRM

**Prerequisites (מה צריך להיות מוכן מראש)**:
- הרשמה לשתי המערכות + הרשאות admin
- יצירת API credentials במערכת המקור והיעד
- זיהוי השדות המדויקים שצריכים להעתיק (field mapping)
- החלטה על תדירות הסנכרון (real-time עם webhook או polling)
- בדיקת rate limits של שתי המערכות

**הערות חשובות**:
- Rate limits טיפוסיים: Google APIs (60 requests/minute), Slack (1 request/second per method), Zoho CRM (60 concurrent calls)
- Polling interval מומלץ: לא פחות מ-5 דקות כדי לא להגיע ל-rate limits
- Error handling: retry logic עם 3 ניסיונות (1s, 2s, 4s delays)
- Data validation: חובה לבדוק שהשדות הנדרשים קיימים לפני השליחה
- Monitoring: התראה למייל במקרה של 3 כשלונות רצופים
- Cost: רוב ה-APIs בחינם עד 1,000-10,000 קריאות ליום

---

## 32. integration-complex - אינטגרציה מורכבת (3+ מערכות)

**מה השירות עושה**: חיבור מספר מערכות (3 ומעלה) עם סנכרון דו-כיווני, טרנספורמציות נתונים מורכבות, ולוגיקה עסקית מותנית.

**דרישות טכניות**:
- Authentication: OAuth 2.0 עבור כל מערכת (token refresh automation נדרש)
- API credentials: נדרשים עבור כל מערכת + webhook endpoints
- Rate limits: ניהול מרובה concurrent connections - 60+ calls/minute סה"כ
- Webhook support: חובה עבור real-time sync - configuration per system
- API versioning: version control strategy לכל מערכת
- n8n workflow: 15-25 nodes עם error handling מורכב
- Data transformation: field mapping, type conversion, validation rules
- Conflict resolution: timestamp-based או manual review strategy

**מערכות שצריך גישה אליהן**:
- 3+ Business Systems (CRM, Marketing, Support, etc.) - קריאה וכתיבה
- n8n workflow platform - orchestration
- Supabase או database - conflict logging & sync state tracking
- Monitoring tool (optional) - alerting & dashboards

**אינטגרציות נדרשות**:
- System A ↔ System B: bi-directional sync, real-time with webhooks
- System B ↔ System C: bi-directional sync, real-time with webhooks
- System A ↔ System C: optional direct sync או דרך System B
- All Systems → Database: sync state logging + conflict resolution data

**Prerequisites (מה צריך להיות מוכן מראש)**:
- OAuth 2.0 setup לכל מערכת עם automatic token refresh
- Webhook endpoints configuration (SSL certificate נדרש)
- Data mapping document: field mappings בין כל זוג מערכות
- Conflict resolution policy: last-write-wins או manual review
- Change detection mechanism: timestamp fields בכל מערכת
- Database schema: sync_log, conflict_queue tables
- Error notification channels: email, Slack, SMS

**הערות חשובות**:
- Circular updates prevention: שמירת sync_source_id כדי למנוע loops
- Rate limit management: exponential backoff עם circuit breaker pattern
- Data consistency: transaction log לכל שינוי + rollback capability
- Webhook retry: 3 attempts with exponential backoff (5s, 25s, 125s)
- Token refresh: automatic refresh 5 דקות לפני expiration (OAuth tokens = 1 hour typically)
- Monitoring critical: daily sync reports + alert on >5% failure rate
- Testing strategy: end-to-end testing בסביבת sandbox של כל מערכת
- Cost implications: API calls יכולים להגיע ל-10,000-50,000 ליום

---

## 33. int-complex - אינטגרציית מערכות מורכבת (גרסה מתקדמת)

**מה השירות עושה**: אינטגרציה ארגונית מורכבת עם 4+ מערכות, data orchestration מתקדם, business rules engine, ו-enterprise-grade error recovery.

**דרישות טכניות**:
- Authentication: OAuth 2.0 + API Gateway עם centralized token management
- Rate limits: distributed rate limiting - 100+ concurrent calls
- Webhook infrastructure: dedicated webhook receiver עם queue system
- Message queue: Redis או RabbitMQ לניהול async operations
- Database: PostgreSQL/Supabase לשמירת sync state, conflicts, audit log
- Monitoring: Grafana/DataDog עם real-time dashboards
- n8n workflows: 30-50 nodes עם sub-workflows ו-error workflows
- API Gateway: optional but recommended - Kong/AWS API Gateway

**מערכות שצריך גישה אליהן**:
- 4+ Enterprise Systems (CRM, ERP, Marketing, Support, Analytics) - full CRUD access
- n8n platform - enterprise edition מומלץ
- Message Queue (Redis/RabbitMQ) - async processing
- Database (Supabase/PostgreSQL) - state management
- API Gateway - centralized authentication & rate limiting
- Monitoring platform - observability & alerting
- Object Storage (S3) - webhook payload backup

**אינטגרציות נדרשות**:
- Hub-and-Spoke pattern: מערכת מרכזית (CRM) ← → כל המערכות האחרות
- Real-time bi-directional sync בין כל המערכות
- Event-driven architecture: webhooks trigger workflows
- Batch processing: daily/weekly reconciliation jobs
- Audit trail: כל שינוי נרשם עם user, timestamp, source

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Enterprise API access לכל המערכות (לא free tiers)
- Dedicated server/VPS להרצת webhooks (minimum 2GB RAM)
- SSL certificates עבור webhook endpoints
- Database schema: sync_state, conflict_queue, audit_log, retry_queue tables
- Data governance policy: מי יכול לשנות מה ובאיזה מערכת
- Conflict resolution matrix: rules per object type + manual override option
- Monitoring dashboards: API health, sync status, error rates
- Disaster recovery plan: backup strategy + rollback procedures
- Load testing results: ability to handle peak load (3x normal)

**הערות חשובות**:
- Concurrency control: implement distributed locks (Redis) למניעת race conditions
- Rate limiting strategy: token bucket algorithm עם per-system limits
- Zoho CRM specific: concurrency limit = 10, credit-based system (1 credit per call)
- Circuit breaker pattern: auto-disable failing endpoints אחרי 10 consecutive failures
- Retry queue: DLQ (Dead Letter Queue) לכשלונות אחרי 5 retries
- Data validation: JSON schema validation לכל payload
- Webhook security: HMAC signature verification (SHA256) לכל incoming webhook
- Token management: rotate API keys כל 90 יום
- Idempotency: use unique request IDs למניעת duplicate operations
- Cost: expect 50,000-200,000 API calls/day - check pricing tiers
- Performance: webhook response time < 200ms, end-to-end sync < 5s
- Scalability: horizontal scaling capability with load balancer

---

## 34. whatsapp-api-setup - הקמת WhatsApp Business API

**מה השירות עושה**: הקמה מלאה של WhatsApp Business API עם Meta, כולל business verification, הגדרת message templates, webhook configuration, וחיבור ל-CRM/n8n.

**דרישות טכניות**:
- Authentication: Access Token מ-Meta (Facebook App ID + App Secret)
- WhatsApp Business Platform: Cloud API (מומלץ) או On-Premise API
- Business verification: Meta Business Manager verified account
- Phone number: dedicated number (לא פרטי) עם מנוי פעיל
- Message templates: pre-approved templates לכל שימוש
- Webhook endpoint: HTTPS with valid SSL certificate (Let's Encrypt מספיק)
- Rate limits (Cloud API): 80 messages/second, 1,000,000 messages/day per number
- Rate limits (On-Premise): 600 messages/second בתצורה מקסימלית
- API version: v18.0+ (נכון ל-2025)
- Media support: images (5MB), videos (16MB), documents (100MB)

**מערכות שצריך גישה אליהן**:
- Meta Business Manager - business verification & app creation
- WhatsApp Business Account (WABA) - phone number registration
- WhatsApp Cloud API או Business Solution Provider
- n8n platform - webhook receiver & message sending
- Zoho CRM - contact data & conversation logging
- Supabase - message history & template storage

**אינטגרציות נדרשות**:
- WhatsApp → n8n: incoming messages via webhook (real-time)
- n8n → WhatsApp: send messages via API (max 80/second)
- n8n → CRM: log conversations, update contact status
- CRM → WhatsApp: trigger automated messages based on CRM events
- Template approval flow: create in Meta Business Manager, sync to n8n

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Meta Business Manager account (verified - דורש business email + website)
- Facebook Developer Account + App creation
- Dedicated phone number (לא בשימוש ב-WhatsApp אישי)
- Business website with official business name in footer
- Webhook server: HTTPS endpoint with SSL, response time < 5 seconds
- Message templates: draft 5-10 templates לאישור Meta
- Business Display Name: ייצג את העסק ב-WhatsApp
- Privacy policy URL: נדרש לאישור templates

**הערות חשובות**:
- 24-hour window rule: תגובות חופשיות רק תוך 24 שעות מהודעה אחרונה של הלקוח
- Message templates נדרשים: לכל הודעה יוזמת מחוץ ל-24 שעות
- Template approval time: 24-48 שעות (verified businesses = instant)
- Template categories: Marketing, Utility, Authentication
- Messaging tiers: Tier 1 (1K users/day) → Tier 2 (10K) → Tier 3 (100K) → Unlimited
- Pricing model 2025: pay-per-message (החל מ-1 ביולי 2025), varies by country
- Israel pricing: ~$0.05-0.10 per message (marketing), $0.03-0.05 (utility)
- Webhook verification: Meta sends GET request עם verify_token לפני activation
- Webhook signature: verify X-Hub-Signature-256 header (HMAC SHA256)
- Media handling: download media via API, max 30 days storage
- Character limits: 1,024 characters per message
- Phone number limits: 2 numbers (unverified) או 20 numbers (verified business)
- Common errors: (131026) Message undeliverable, (131047) Re-engagement message
- Quality rating: maintain "High" quality - avoid spam complaints
- Testing: use test numbers before production rollout

---

## 35. int-crm-marketing - אינטגרציית CRM למערכת Marketing Automation

**מה השירות עושה**: סנכרון דו-כיווני בין מערכת CRM (Zoho) למערכת Marketing Automation (HubSpot/Mailchimp/ActiveCampaign) לניהול leads, רשימות תפוצה, campaigns, ו-tracking.

**דרישות טכניות**:
- Authentication: OAuth 2.0 עבור שתי המערכות
- Zoho CRM API: v8, OAuth 2.0, token expires after 1 hour
- HubSpot API: OAuth 2.0, 100 requests/10 seconds (free), 200 requests/10 seconds (paid)
- Mailchimp API: API Key authentication, 10 concurrent requests
- ActiveCampaign API: API Key + Account URL, no public rate limit (fair use policy)
- Webhook support: bi-directional (CRM ↔ Marketing platform)
- Data sync: contacts, lists, campaigns, email opens, clicks, conversions
- Rate limits: manage combined limits של שתי המערכות

**מערכות שצריך גישה אליהן**:
- Zoho CRM - Contacts, Leads, Accounts modules (read/write)
- Marketing Platform (HubSpot/Mailchimp/ActiveCampaign) - contacts, lists, campaigns
- n8n workflow platform - orchestration
- Supabase - sync state, mapping table, duplicate detection

**אינטגרציות נדרשות**:
- CRM → Marketing: new leads/contacts, contact updates, segmentation tags
- Marketing → CRM: email opens, clicks, unsubscribes, campaign responses, conversions
- Bi-directional: contact data (name, email, phone, company, custom fields)
- Campaign tracking: link campaign IDs between systems

**Prerequisites (מה צריך להיות מוכן מראש)**:
- OAuth credentials לשתי המערכות
- Field mapping document: CRM fields ↔ Marketing platform fields
- List segmentation rules: אילו contacts מסונכרנים לאיזו רשימה
- Duplicate handling strategy: email as unique key
- Custom field mapping: CRM custom fields → Marketing custom properties
- Unsubscribe sync policy: respect unsubscribes באופן מיידי
- GDPR compliance: consent management + data retention policy
- Campaign naming convention: consistent IDs בין מערכות

**הערות חשובות**:
- Email uniqueness: use email as primary key, handle duplicates gracefully
- Unsubscribe critical: sync unsubscribes תוך דקות (legal requirement)
- Rate limit Mailchimp: 10 concurrent connections - use queue system
- HubSpot contact properties: limit of 1,000 custom properties
- Two-way sync conflict: marketing platform = source of truth לנתוני engagement
- Batch operations: sync contacts in batches of 100-500
- Marketing automation triggers: CRM status changes → campaign enrollment
- Lead scoring: sync score from marketing platform → CRM custom field
- Campaign ROI: track conversions back to CRM deals/opportunities
- List hygiene: automatically remove bounced emails from CRM
- Compliance: include opt-in date, opt-in source in sync
- Testing: use test lists before production sync
- Cost: HubSpot pricing based on contacts, Mailchimp on subscriber count

---

## 36. int-crm-accounting - אינטגרציית CRM למערכת הנהלת חשבונות

**מה השירות עושה**: סנכרון נתונים בין CRM (Zoho) למערכת הנהלת חשבונות (QuickBooks/Xero) לניהול לקוחות, חשבוניות, תשלומים, ודוחות פיננסיים.

**דרישות טכניות**:
- Authentication: OAuth 2.0 עבור שתי המערכות (חובה - no API keys)
- Zoho CRM API: v8, OAuth 2.0, concurrency-based limits
- QuickBooks Online API: OAuth 2.0, 10 concurrent requests/second per Realm ID
- Xero API: OAuth 2.0, 60 calls/minute, 5,000 calls/day, 5 concurrent requests
- Token refresh: QuickBooks tokens expire after 1 hour, refresh token valid 100 days
- Xero tokens: expire after 30 minutes
- Webhook support: both directions (real-time for critical operations)
- Data entities: Customers, Invoices, Payments, Credit Notes, Products

**מערכות שצריך גישה אליהן**:
- Zoho CRM - Accounts, Deals, Contacts, Products modules
- Accounting System (QuickBooks/Xero) - Customers, Invoices, Payments, Items
- n8n workflow platform - orchestration & transformation
- Supabase - sync state, invoice mapping, reconciliation log

**אינטגרציות נדרשות**:
- CRM → Accounting: new customers, won deals → invoices, contact updates
- Accounting → CRM: payment status, invoice status, outstanding balance
- Products: sync product catalog both directions
- Financial data: attach accounting customer ID to CRM account

**Prerequisites (מה צריך להיות מוכן מראש)**:
- OAuth 2.0 setup לשתי המערכות (sandbox environments for testing)
- Chart of accounts mapping: CRM deal categories → accounting income accounts
- Tax configuration: VAT/GST rates mapping
- Currency handling: multi-currency support if needed
- Customer matching logic: company name + email matching rules
- Invoice template: CRM deal → invoice line items mapping
- Payment terms: default terms per customer type
- Product/service mapping: CRM products → accounting items
- Approval workflow: when to automatically create invoices vs. manual approval

**הערות חשובות**:
- QuickBooks rate limit: 10 concurrent requests per company - queue is essential
- Xero daily limit: 5,000 calls - monitor usage closely
- Invoice immutability: some systems don't allow editing posted invoices
- Payment reconciliation: manual matching may be needed for partial payments
- Multi-currency: exchange rate sync + revaluation handling
- Tax complexity: different tax rules per region (Israel VAT = 17%)
- Batch invoicing: batch create with error handling per invoice
- Duplicate prevention: use CRM deal ID as reference number
- Data validation: amount, customer, line items בדיקה לפני יצירת חשבונית
- Chart of accounts: don't auto-create accounts - require manual setup
- Financial reporting: sync data for dashboards, don't rely on API for real-time reports
- Reconciliation: daily reconciliation report להשוואת סכומים
- Error handling: financial errors need immediate alert (email + SMS)
- Compliance: audit trail לכל שינוי פיננסי
- Testing: use sandbox with test companies, don't test on production data
- Cost: QuickBooks Online from $30/month, Xero from $15/month

---

## 37. int-crm-support - אינטגרציית CRM למערכת תמיכת לקוחות

**מה השירות עושה**: חיבור בין CRM (Zoho) למערכת Support (Zendesk/Freshdesk/Intercom) לסנכרון פניות שירות, tickets, היסטוריית לקוח, ו-SLA tracking.

**דרישות טכניות**:
- Authentication: API Key (Zendesk/Freshdesk) או OAuth 2.0 (Intercom)
- Zendesk API: Basic Auth או Bearer token, 700 requests/minute (Enterprise)
- Freshdesk API: API Key in header, 1,000 requests/hour (Garden plan)
- Intercom API: Bearer token, rate limits vary by endpoint (100-1000 calls/minute)
- Webhook support: חובה - real-time ticket updates
- Webhook security: HMAC signature verification (Zendesk), API key auth (Freshdesk)
- Data entities: Contacts, Tickets, Comments, Organizations, Custom Fields

**מערכות שצריך גישה אליהן**:
- Zoho CRM - Accounts, Contacts, Cases/Tickets modules
- Support Platform (Zendesk/Freshdesk/Intercom) - tickets, users, organizations
- n8n workflow platform - webhook receiver & orchestration
- Supabase - ticket history, SLA tracking, customer 360 view

**אינטגרציות נדרשות**:
- Support → CRM: new tickets → CRM cases, ticket status updates, customer satisfaction
- CRM → Support: new contacts → support users, account updates → organization updates
- Bi-directional: contact information, ticket/case status, priority levels
- Real-time: ticket creation, status changes, agent assignment

**Prerequisites (מה צריך להיות מוכן מראש)**:
- API credentials לשתי המערכות
- Webhook endpoints: SSL certificate, <5s response time
- Field mapping: ticket fields ↔ CRM case fields
- Priority mapping: support priority levels → CRM priority levels
- Status workflow: support statuses → CRM case statuses
- Agent mapping: support agents → CRM users (for assignment)
- Custom fields: sync custom fields between systems
- Ticket routing rules: when to create CRM case vs. keep only in support
- SLA definitions: response time, resolution time per priority
- Escalation rules: when to notify CRM sales team

**הערות חשובות**:
- Webhook reliability: Zendesk retries up to 3 times with exponential backoff
- Freshdesk webhooks: require authentication (API key in headers)
- Ticket history: sync full conversation thread to CRM (can be large)
- Attachment handling: files can be large - consider size limits
- Agent workload: don't create duplicates - check if ticket exists
- Customer context: pull CRM data into support platform for agent view
- SLA tracking: sync SLA breach warnings to CRM
- Satisfaction scores: CSAT/NPS data from support → CRM custom fields
- Ticket assignment: match agents by email between systems
- Priority escalation: auto-update CRM when ticket escalated
- Response templates: optionally sync canned responses
- Reporting: pull support metrics into CRM dashboard
- Rate limits Zendesk: 700/min (Enterprise), 200/min (Professional)
- Rate limits Freshdesk: 1,000/hour - use batching for bulk operations
- Error handling: retry failed ticket creations (idempotency key needed)
- Testing: use sandbox/test accounts before production

---

## 38. int-calendar - אינטגרציית Calendar APIs

**מה השירות עושה**: סנכרון אירועים ופגישות בין מערכות לוח שנה (Google Calendar, Outlook Calendar) ו-CRM/מערכות אחרות, כולל תזמון אוטומטי ותזכורות.

**דרישות טכניות**:
- Authentication: OAuth 2.0 (Google Calendar, Microsoft Graph)
- Google Calendar API: OAuth 2.0, 1,000,000 queries/day (default), per-user quotas
- Microsoft Graph (Outlook): OAuth 2.0, throttling varies by resource type
- Webhook support: Google Calendar (push notifications), Microsoft Graph (subscriptions)
- Webhook expiration: Google ~24 hours, Microsoft ~3 days (max 4230 minutes)
- Timezone handling: IANA timezone format (e.g., "Asia/Jerusalem")
- Recurring events: RRULE format (RFC 5545)
- API versions: Google Calendar v3, Microsoft Graph v1.0

**מערכות שצריך גישה אליהן**:
- Google Calendar - calendar read/write access
- Microsoft Outlook Calendar - Calendar.ReadWrite permission
- Zoho CRM - Events/Meetings module
- n8n platform - webhook receiver & event orchestration
- Supabase - webhook subscription management, event sync state

**אינטגרציות נדרשות**:
- CRM → Calendar: create meetings when scheduled in CRM
- Calendar → CRM: update CRM when meeting time changes or is cancelled
- Bi-directional: meeting attendees, time, location, description
- Reminders: sync CRM tasks/reminders to calendar events
- Availability: check calendar availability before booking (Google/Outlook)

**Prerequisites (מה צריך להיות מוכן מראש)**:
- OAuth 2.0 credentials (Google Cloud Project או Azure App Registration)
- Webhook endpoint: HTTPS with SSL, must respond to verification challenge
- Webhook renewal cron job: renew Google webhooks every 20 hours, Microsoft every 3 days
- Timezone configuration: default timezone for organization
- Calendar selection: primary calendar או specific shared calendar
- Attendee management: how to handle external attendees
- Conflict resolution: prefer calendar changes או CRM changes
- Event categories: map CRM meeting types to calendar categories
- Privacy settings: public/private event handling
- Recurring events: handle recurring meeting series

**הערות חשובות**:
- Google Calendar rate limits: 1M queries/day, per-user quotas enforced
- Microsoft Graph throttling: very strict, implement exponential backoff
- Webhook expiration: Google ~24h, Microsoft ~3 days - auto-renew essential
- Webhook verification: Google sends token, Microsoft sends validation token
- Timezone complexity: always use IANA format, convert user timezones
- Recurring events: use RRULE, don't create individual events
- Attendee sync: Google allows external attendees, Microsoft requires Graph permissions
- Meeting updates: detect changes using lastModified timestamp
- Calendar conflicts: check freebusy before creating events
- All-day events: handle differently (no timezone)
- Event reminders: Google (minutes before), Outlook (minutes before)
- Attachment support: Google Calendar supports attachments, Outlook via OneDrive links
- Video conferencing: Google Meet auto-add, Microsoft Teams integration
- Shared calendars: handle permissions carefully
- Retry logic: 429 errors = back off, use exponential backoff (1s, 2s, 4s, 8s)
- Batch operations: Google supports batch (50 requests), Microsoft prefers individual
- Testing: use test calendars, don't mess with production calendars
- Cost: Google Calendar API free up to quota, Microsoft Graph included in Microsoft 365

---

## 39. int-ecommerce - אינטגרציית פלטפורמות eCommerce

**מה השירות עושה**: סנכרון מלאי, הזמנות, לקוחות, ומוצרים בין פלטפורמת eCommerce (Shopify/WooCommerce) ו-CRM/ERP/מערכות ניהול מלאי.

**דרישות טכניות**:
- Authentication: API Key + Secret (Shopify), OAuth 1.0a או JWT (WooCommerce)
- Shopify API: REST Admin API (2 requests/second) או GraphQL (1,000 points/minute)
- WooCommerce API: OAuth 1.0a, no official rate limits (server-dependent)
- Webhook support: חובה - real-time order notifications
- Webhook security: Shopify (HMAC SHA256 in header), WooCommerce (webhook secret)
- Data entities: Products, Variants, Orders, Customers, Inventory Levels, Fulfillments
- Rate limits: Shopify strict (2/sec REST, cost-based GraphQL), WooCommerce flexible

**מערכות שצריך גישה אליהן**:
- eCommerce Platform (Shopify/WooCommerce) - full store access
- Zoho CRM - Accounts, Contacts, Products, Sales Orders modules
- Inventory Management System (optional) - stock levels
- n8n workflow platform - webhook receiver & orchestration
- Supabase - order sync state, inventory tracking, customer mapping

**אינטגרציות נדרשות**:
- eCommerce → CRM: new orders → CRM sales orders, new customers → CRM contacts
- CRM → eCommerce: product updates, inventory sync, customer updates
- eCommerce → Inventory: order placed → reduce stock
- Inventory → eCommerce: stock level updates → update available quantity
- Real-time: order placement, payment status, fulfillment status

**Prerequisites (מה צריך להיות מוכן מראש)**:
- eCommerce platform admin access + API credentials
- Webhook endpoints: SSL, <2s response time (Shopify requirement)
- Product mapping: eCommerce product IDs → CRM product IDs
- Customer matching: email-based matching + de-duplication rules
- Order status workflow: eCommerce statuses → CRM order stages
- Inventory sync direction: eCommerce as master או inventory system as master
- Payment gateway: handle payment status updates
- Tax calculation: sync tax rules if applicable
- Shipping methods: map shipping options between systems
- Refund handling: process refunds in both systems

**הערות חשובות**:
- Shopify rate limits: 2 requests/second REST, burst allowed up to 40 requests
- Shopify GraphQL: cost-based (1,000 points/minute), calculate query cost before running
- WooCommerce rate limits: depends on hosting - start with 60 requests/minute assumption
- Webhook failures: Shopify retries with exponential backoff (max 48 hours)
- Order ID mapping: store Shopify/WooCommerce order ID in CRM for reference
- Inventory accuracy: use webhooks + hourly reconciliation job
- Product variants: handle SKU-level tracking for variants
- Multi-location inventory: Shopify supports multiple locations
- Payment reconciliation: match payment gateway transactions to orders
- Abandoned carts: optionally sync abandoned cart data for remarketing
- Order fulfillment: update tracking numbers in eCommerce when shipped
- Customer lifetime value: calculate in CRM from order history
- Shipping webhooks: track fulfillment status changes
- Refund processing: immediate sync (financial impact)
- Product sync: batch updates (100-500 products), don't sync one-by-one
- Image handling: sync product images (can be large - 5-10MB each)
- Error handling: order creation failures need immediate alert
- Testing: use Shopify development stores, WooCommerce staging sites
- Cost: Shopify API free (included in plan), WooCommerce free (self-hosted costs)

---

## 40. int-custom - אינטגרציית API מותאמת אישית

**מה השירות עושה**: פיתוח והטמעת API מותאם אישית לצרכים ייחודיים, כולל API design, documentation, authentication, versioning, ו-integration עם מערכות קיימות.

**דרישות טכניות**:
- API Architecture: RESTful API (מומלץ) או GraphQL (למקרים מורכבים)
- Authentication: OAuth 2.0 (user-facing) או API Key (server-to-server)
- API Gateway: Kong, AWS API Gateway, או Azure API Management (optional)
- Rate limiting: token bucket algorithm, 100-1000 requests/minute per client
- Versioning strategy: URI path versioning (/v1/, /v2/) מומלץ
- Documentation: OpenAPI/Swagger 3.0 specification
- HTTP methods: GET, POST, PUT, PATCH, DELETE (RESTful standards)
- Response format: JSON (default), support for pagination, filtering, sorting
- Error handling: standard HTTP status codes + detailed error messages
- Security: HTTPS only, input validation, SQL injection prevention, XSS protection

**מערכות שצריך גישה אליהן**:
- Custom Application/System - source of data או target for data
- Database (PostgreSQL/Supabase) - data storage
- API Gateway (optional) - centralized management
- n8n platform - API orchestration & integration with other systems
- Documentation platform - API docs (Swagger UI, Postman)
- Monitoring - API analytics, error tracking (DataDog, New Relic)

**אינטגרציות נדרשות**:
- Custom API ↔ CRM: bi-directional data sync
- Custom API ↔ Internal Systems: integration with legacy systems
- Custom API ↔ Third-party services: external API consumption
- Webhook support: event-driven notifications to consuming applications
- Batch operations: bulk data import/export endpoints

**Prerequisites (מה צריך להיות מוכן מראש)**:
- API requirements document: endpoints, methods, data models
- Data model design: entities, relationships, validation rules
- Authentication strategy: OAuth 2.0 setup או API key management
- Database schema: optimized for API access patterns
- Rate limiting policy: per-client limits, throttling rules
- Versioning policy: deprecation timeline, backward compatibility rules
- Error handling standards: error codes, messages, localization
- Security audit: penetration testing, vulnerability assessment
- API documentation: OpenAPI spec, code examples, postman collection
- Monitoring setup: logging, metrics, alerting
- SLA definition: uptime target (99.9%), response time (<200ms), error rate (<0.1%)

**הערות חשובות**:
- RESTful principles: use proper HTTP verbs, status codes, resource naming
- URI structure: /api/v1/resources/{id} - plural nouns, no verbs
- HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 429 (Too Many Requests), 500 (Server Error)
- Pagination: use limit & offset או cursor-based for large datasets
- Filtering: support query parameters (?status=active&created_after=2025-01-01)
- Sorting: ?sort=created_at:desc
- Field selection: ?fields=id,name,email (reduce payload size)
- Rate limiting headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- API versioning: increment major version for breaking changes only
- Deprecation: announce 6 months in advance, maintain old version for 12 months
- OAuth 2.0 flows: Authorization Code (user apps), Client Credentials (server-to-server)
- Token expiration: access tokens = 1 hour, refresh tokens = 30-90 days
- Webhook delivery: retry 3 times with exponential backoff (5s, 25s, 125s)
- Webhook signatures: HMAC SHA256, include timestamp to prevent replay attacks
- Input validation: validate all inputs, reject malformed requests with 400
- SQL injection: use parameterized queries, never string concatenation
- XSS prevention: sanitize output, set Content-Security-Policy headers
- CORS: configure allowed origins, don't use wildcard (*) in production
- Response time: target <200ms for GET requests, <500ms for POST/PUT
- Database optimization: indexes on frequently queried fields, connection pooling
- Caching: implement Redis caching for frequently accessed data
- Load testing: test with 10x expected load before launch
- Monitoring: track error rates, response times, rate limit hits
- Logging: structured logs (JSON), include request ID for tracing
- Error messages: user-friendly messages, detailed logs for debugging
- Documentation: keep OpenAPI spec in sync with code, provide code examples
- Testing: unit tests (80%+ coverage), integration tests, end-to-end tests
- CI/CD: automated testing, staging environment, blue-green deployment
- Cost: development 20-40 hours (simple API), 100-200 hours (complex API)

---

## Implementation Checklist (All Integration Services)

**Phase 1: Planning & Setup**
- [ ] Identify all systems involved in integration
- [ ] Obtain API credentials for all systems (OAuth, API keys)
- [ ] Create sandbox/test environments for each system
- [ ] Document field mappings between systems
- [ ] Define data flow direction (one-way vs. bi-directional)
- [ ] Establish sync frequency requirements (real-time vs. batch)
- [ ] Define conflict resolution strategy
- [ ] Plan error handling and retry logic

**Phase 2: Authentication & Connectivity**
- [ ] Implement OAuth 2.0 flows or API key management
- [ ] Set up automatic token refresh mechanisms
- [ ] Configure webhook endpoints with SSL certificates
- [ ] Verify webhook security (HMAC signatures)
- [ ] Test API connectivity for all systems
- [ ] Validate rate limits and quotas
- [ ] Set up API gateway (if applicable)

**Phase 3: Data Mapping & Transformation**
- [ ] Create field mapping configuration
- [ ] Implement data type conversions
- [ ] Build validation rules for all data points
- [ ] Handle null/empty values gracefully
- [ ] Set up duplicate detection logic
- [ ] Configure custom field handling
- [ ] Test data transformations end-to-end

**Phase 4: Workflow Development**
- [ ] Build n8n workflows with error handling
- [ ] Implement retry logic with exponential backoff
- [ ] Set up webhook receivers
- [ ] Configure batch operations for bulk sync
- [ ] Create sub-workflows for complex logic
- [ ] Implement circuit breaker patterns
- [ ] Add logging and monitoring nodes

**Phase 5: Testing & Validation**
- [ ] Unit test individual workflow nodes
- [ ] Integration test full data flows
- [ ] Load test with expected volume (+ 3x buffer)
- [ ] Test error scenarios and recovery
- [ ] Validate data accuracy in both systems
- [ ] Test conflict resolution logic
- [ ] Verify webhook reliability
- [ ] Check rate limit handling

**Phase 6: Monitoring & Maintenance**
- [ ] Set up monitoring dashboards
- [ ] Configure error alerting (email/Slack/SMS)
- [ ] Implement daily reconciliation reports
- [ ] Track sync success rates
- [ ] Monitor API usage vs. quotas
- [ ] Set up uptime monitoring
- [ ] Schedule regular health checks
- [ ] Plan for token rotation and credential updates

**Phase 7: Documentation & Handoff**
- [ ] Document integration architecture
- [ ] Create runbooks for common issues
- [ ] Document field mappings
- [ ] Provide API credential access procedures
- [ ] Create user guides (if applicable)
- [ ] Document troubleshooting steps
- [ ] Train support team

---

## Risk Assessment & Mitigation Strategies

### Risk 1: Rate Limit Violations
**Impact**: High - Can cause integration downtime, data sync delays
**Probability**: Medium-High
**Mitigation**:
- Implement token bucket rate limiting on client side
- Use exponential backoff for retry logic (1s, 2s, 4s, 8s, 16s)
- Monitor API usage in real-time (Grafana dashboard)
- Set up alerts at 80% of rate limit threshold
- Use batch operations instead of individual API calls
- Implement request queuing for high-volume operations
- Consider upgrading to higher API tiers if consistently hitting limits

### Risk 2: OAuth Token Expiration
**Impact**: Critical - Stops all API communication
**Probability**: High (if not handled properly)
**Mitigation**:
- Implement automatic token refresh 5 minutes before expiration
- Set up monitoring for token refresh failures
- Store refresh tokens securely (encrypted in database)
- Implement fallback authentication mechanism
- Alert admin if refresh fails 3 consecutive times
- Test token refresh logic thoroughly
- Document manual token renewal procedures

### Risk 3: Data Conflicts in Bi-Directional Sync
**Impact**: Medium-High - Data inconsistency between systems
**Probability**: Medium
**Mitigation**:
- Implement timestamp-based conflict resolution (last-write-wins)
- Store conflict records in separate table for manual review
- Use sync_source_id to prevent circular updates
- Implement field-level merging for non-conflicting changes
- Set up daily conflict reports for manual resolution
- Define master system for critical fields
- Use version numbers or ETags for optimistic locking

### Risk 4: Webhook Delivery Failures
**Impact**: Medium - Missed real-time updates, data delays
**Probability**: Medium
**Mitigation**:
- Implement webhook retry queue with exponential backoff
- Set up monitoring for webhook failures
- Use Dead Letter Queue (DLQ) for failed webhooks after 5 retries
- Implement hourly reconciliation job as backup
- Monitor webhook endpoint health and response times
- Set up redundant webhook endpoints
- Log all webhook payloads for replay capability

### Risk 5: API Changes & Deprecation
**Impact**: High - Breaking changes can stop integration
**Probability**: Low-Medium
**Mitigation**:
- Subscribe to API changelog notifications from all providers
- Test against beta/sandbox APIs before updates
- Implement API versioning strategy (use specific versions, not "latest")
- Set up automated tests to detect breaking changes
- Maintain fallback to previous API version
- Plan quarterly API upgrade reviews
- Budget time for API migration work

### Risk 6: Data Volume Exceeding Expectations
**Impact**: High - Performance degradation, timeouts
**Probability**: Medium
**Mitigation**:
- Implement pagination for large datasets (500-1000 records per page)
- Use batch operations with appropriate batch sizes
- Set up database indexes for frequently queried fields
- Implement caching for frequently accessed data (Redis)
- Monitor database query performance
- Plan horizontal scaling capability
- Load test with 10x expected volume

### Risk 7: Security Vulnerabilities
**Impact**: Critical - Data breach, unauthorized access
**Probability**: Low-Medium
**Mitigation**:
- Use HTTPS for all API communications
- Implement HMAC signature verification for webhooks
- Store API credentials encrypted (Supabase Vault or AWS Secrets Manager)
- Rotate API keys/tokens every 90 days
- Implement IP whitelisting where supported
- Conduct security audit before production launch
- Use least-privilege access principles
- Monitor for suspicious API activity patterns

### Risk 8: Third-Party Service Outages
**Impact**: High - Integration downtime
**Probability**: Low-Medium
**Mitigation**:
- Implement circuit breaker pattern (stop trying after 10 consecutive failures)
- Set up service health monitoring for all integrated platforms
- Create fallback workflows for critical operations
- Use queue systems to buffer operations during outages
- Set up multi-region redundancy where available
- Monitor third-party status pages
- Document incident response procedures
- Have manual fallback processes documented

### Risk 9: Data Quality Issues
**Impact**: Medium - Incorrect data in systems
**Probability**: Medium-High
**Mitigation**:
- Implement comprehensive input validation
- Use JSON schema validation for API payloads
- Set up data quality checks in workflows
- Implement data cleansing rules (trim whitespace, normalize formats)
- Monitor data quality metrics (completion rates, format violations)
- Set up alerts for data quality issues
- Implement manual review queue for suspicious data
- Regular data quality audits

### Risk 10: Cost Overruns from API Usage
**Impact**: Medium - Budget overruns
**Probability**: Medium
**Mitigation**:
- Monitor API usage against quotas daily
- Set up billing alerts at 50%, 75%, 90% of budget
- Implement caching to reduce API calls
- Use webhooks instead of polling where possible
- Optimize workflows to minimize redundant calls
- Review API pricing tiers quarterly
- Budget 20% buffer for growth
- Consider annual plans for cost savings

---

## Integration Platform Comparison Matrix

| Feature | Google APIs | Zoho CRM | Shopify | WhatsApp API | QuickBooks | Xero |
|---------|-------------|----------|---------|--------------|------------|------|
| **Auth Method** | OAuth 2.0 | OAuth 2.0 | API Key | OAuth 2.0 | OAuth 2.0 | OAuth 2.0 |
| **Rate Limit** | 1M/day | 60 concurrent | 2/second | 80/second | 10 concurrent/sec | 60/minute |
| **Webhook Support** | Yes | Yes | Yes | Yes | Limited | Yes |
| **Token Expiry** | 1 hour | 1 hour | N/A | 24 hours | 1 hour | 30 minutes |
| **Batch Operations** | Yes (50) | Yes | Limited | No | No | No |
| **Sandbox** | Yes | Yes | Yes | Yes | Yes | Yes |
| **API Version** | v3 (Calendar) | v8 | REST/GraphQL | v18.0+ | v3 | 2.0 |
| **Documentation** | Excellent | Good | Excellent | Good | Good | Excellent |
| **Cost** | Free (quota) | Included | Included | Pay-per-message | Included | Included |

---

## Recommended Tools & Platforms

**Workflow Automation:**
- n8n (open-source, self-hosted, 400+ integrations)
- Zapier (cloud, 5,000+ integrations, expensive)
- Make (formerly Integromat) - visual builder

**API Development & Testing:**
- Postman - API testing, documentation, collections
- Insomnia - REST client, GraphQL support
- Swagger UI - OpenAPI documentation

**Monitoring & Observability:**
- Grafana - open-source dashboards
- DataDog - enterprise monitoring (expensive)
- Sentry - error tracking
- UptimeRobot - uptime monitoring (free tier)

**Database & Storage:**
- Supabase - PostgreSQL + real-time + auth
- Redis - caching, rate limiting, queues
- AWS S3 - file storage for attachments

**Message Queues:**
- Redis Queue (RQ) - simple Python queue
- RabbitMQ - enterprise message broker
- AWS SQS - managed queue service

**Security & Secrets:**
- Supabase Vault - encrypted storage
- AWS Secrets Manager - enterprise secret management
- HashiCorp Vault - open-source secrets

---

## Platform-Specific Implementation Notes

### WhatsApp Business API
- Always verify webhook signatures (HMAC SHA256)
- Implement template caching (templates don't change often)
- Handle 24-hour window strictly (legal requirement)
- Quality rating affects delivery - monitor complaints
- Test with test numbers before production
- Budget for message costs (varies by country)

### Zoho CRM
- Use concurrency-based limits (10 concurrent max)
- Implement credit tracking (1 credit per call usually)
- Use bulk APIs for batch operations
- OAuth tokens expire hourly - auto-refresh essential
- Custom modules require API names (not display names)
- Test in sandbox organization first

### Google Calendar
- Webhook renewal every 24 hours is CRITICAL
- Use batch operations for multiple events (up to 50)
- Always specify timezone explicitly
- Free/busy queries are separate from event queries
- Recurring events use RRULE format (RFC 5545)
- Test timezone handling thoroughly (Israel = Asia/Jerusalem)

### Accounting Systems (QuickBooks/Xero)
- Never auto-create chart of accounts
- Financial data errors need immediate alerts
- Use sandbox environments extensively
- Invoice modifications may be restricted after posting
- Multi-currency requires careful exchange rate handling
- Tax calculations are complex - verify regional rules

### eCommerce (Shopify/WooCommerce)
- Shopify rate limits are STRICT (2/second REST)
- Use GraphQL for complex queries (cost-based limits)
- Webhook failures = order processing delays
- Inventory sync requires careful concurrency control
- Product variants need SKU-level tracking
- Test with development store (Shopify) or staging (WooCommerce)

### Marketing Automation
- Unsubscribe sync is legally critical (GDPR/CAN-SPAM)
- Email is unique key - handle duplicates carefully
- List segmentation rules need careful design
- Campaign tracking requires consistent naming
- Test with small test lists first
- Monitor email deliverability rates

---

## Best Practices Summary

1. **Always Use Webhooks When Available** - Real-time is better than polling
2. **Implement Exponential Backoff** - 1s, 2s, 4s, 8s, 16s for retries
3. **Monitor Rate Limits** - Alert at 80% of limit, not when hitting it
4. **Test in Sandbox** - Never test integrations on production data
5. **Document Field Mappings** - Maintain updated mapping documentation
6. **Use Idempotency Keys** - Prevent duplicate operations
7. **Log Everything** - Structured logs with request IDs for tracing
8. **Set Up Alerts** - Email + Slack + SMS for critical failures
9. **Regular Reconciliation** - Daily/weekly data consistency checks
10. **Security First** - HTTPS, encryption, signature verification, token rotation

---

## Support & Resources

**Official Documentation:**
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp
- Zoho CRM API: https://www.zoho.com/crm/developer/docs/api/v8/
- Google Calendar API: https://developers.google.com/calendar
- Microsoft Graph: https://learn.microsoft.com/en-us/graph/
- Shopify API: https://shopify.dev/docs/api
- QuickBooks API: https://developer.intuit.com/
- Xero API: https://developer.xero.com/

**Community Resources:**
- n8n Community: https://community.n8n.io/
- Stack Overflow: Integration-specific tags
- GitHub: API client libraries and examples

**Professional Support:**
- n8n Enterprise Support
- Platform-specific support channels
- Integration consulting services

---

**Document Version**: 1.0
**Last Updated**: October 2025
**Maintained By**: Integration Architecture Team
**Review Frequency**: Quarterly (or when major API changes occur)
