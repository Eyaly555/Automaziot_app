# Technical Requirements Research: Integration Services (31-40)

Research conducted for Discovery Assistant Phase 2 implementation specifications.

---

## 31. integration-simple - אינטגרציה פשוטה (2 מערכות)

**מה השירות עושה**: חיבור בין 2 כלים פופולריים עם סנכרון בסיסי בכיוון אחד

**דרישות טכניות**:
- API credentials לשתי המערכות (API Key או OAuth 2.0)
- הרשאות read/write בהתאם לכיוון הסנכרון
- HTTPS endpoints בלבד (לא HTTP)
- Webhook support אם נדרש סנכרון real-time
- Rate limits: 100-1000 requests לדקה (תלוי במערכות)
- Token refresh mechanism (אם משתמשים ב-OAuth)
- API version compatibility check

**מערכות שצריך גישה אליהן**:
- System A (מקור הנתונים) - לקריאת הנתונים
- System B (יעד הנתונים) - לכתיבת הנתונים
- n8n/workflow platform - לבניית ההעברה

**אינטגרציות נדרשות**:
- System A → System B: העברת נתונים בכיוון אחד (unidirectional)
- סנכרון יכול להיות: real-time (webhooks), scheduled (polling every X minutes), או manual trigger

**Prerequisites (מה צריך להיות מוכן מראש)**:
- חשבונות פעילים בשתי המערכות
- API keys או OAuth credentials מוכנים
- הגדרת webhook endpoints (אם רוצים real-time)
- בדיקת rate limits של כל מערכת
- מיפוי שדות: איזה שדה ממערכת A הולך לאיזה שדה במערכת B
- החלטה על טיפול בשגיאות: retry logic, notification על כשלים

**הערות חשובות**:
- OAuth 2.1 הוא הסטנדרט החדש לשנת 2025 (מחליף את OAuth 2.0)
- אם אחת המערכות מגיעה ל-rate limit, צריך exponential backoff (1s, 2s, 4s...)
- כדאי להטמיע HMAC-SHA256 signature verification לוובהוקס
- Access tokens בדרך כלל פגים אחרי שעה - צריך refresh logic
- SSL/TLS (HTTPS) הוא חובה לכל API calls
- Standard Webhooks specification (כמו JWT עבור webhooks) הופך לסטנדרט בתעשייה
- שמירת event ID ייחודי למניעת replay attacks
- תיעוד מפורט של כל trigger, data mapping, ו-transaction logs

---

## 32. integration-complex - אינטגרציה מורכבת (3+ מערכות)

**מה השירות עושה**: חיבור מספר מערכות (3+) עם סנכרון דו-כיווני ותלויות מורכבות

**דרישות טכניות**:
- OAuth 2.1 או API Keys לכל מערכת
- Webhook endpoints לכל מערכת (לעדכונים real-time)
- Rate limit management: tracking למספר מערכות בו-זמנית
- Conflict resolution strategy (last-write-wins, source-of-truth, manual review)
- Change detection mechanism: timestamps, version numbers, או webhooks
- Transaction logging לכל העברת נתונים
- Rollback mechanism במקרה של כשלון
- Data validation rules לכל שדה

**מערכות שצריך גישה אליהן**:
- System A - מערכת מרכזית (לרוב CRM)
- System B - מערכת משנית (Marketing/Accounting/Support)
- System C - מערכת נוספת
- n8n/workflow platform - orchestration layer
- Logging/monitoring system - לניטור ואזעקות

**אינטגרציות נדרשות**:
- System A ↔ System B: סנכרון דו-כיווני
- System A ↔ System C: סנכרון דו-כיווני
- System B → System C: העברת נתונים (לפי הצורך)
- All Systems → Logging: כל פעולה מתועדת

**Prerequisites (מה צריך להיות מוכן מראש)**:
- API credentials לכל המערכות (3+)
- החלטה על "source of truth" לכל סוג נתון
- מיפוי שדות מפורט בין כל זוג מערכות
- Conflict resolution policy מוגדרת מראש
- Field-level resolution strategy (האם conflict ברמת השורה או השדה)
- Webhook configuration לכל מערכת
- Backup and recovery mechanism
- Change log tracking (מי שינה מה ומתי)

**הערות חשובות**:
- סנכרון דו-כיווני יוצר סיבוכיות אקספוננציאלית עם כל מערכת נוספת
- אסור לסמוך על timestamps בלבד - צריך גם version numbers
- Exponential backoff חובה: אם rate limit, חכה 1s, 2s, 4s, 8s...
- Webhook payload size limit: בדרך כלל 16MB (n8n), אבל תלוי במערכת
- אם עדכון נכשל באמצע, צריך rollback logic כדי לא להשאיר נתונים חלקיים
- Field-level conflict resolution עדיף על record-level (פחות data loss)
- Real-time webhooks עדיפים על polling, אבל צריך fallback polling למקרה של webhook failure
- תיעוד מפורט של כל trigger, data scheme, ו-transaction חובה
- Idempotency keys למניעת duplicate operations
- Circuit breaker pattern: אם מערכת נופלת, אל תמשיך לנסות - חכה X זמן

---

## 33. int-complex - אינטגרציה מורכבת מתקדמת

**מה השירות עושה**: אינטגרציה עמוקה עם טרנספורמציה מורכבת של נתונים, לוגיקה מותנית, ו-orchestration מתקדם

**דרישות טכניות**:
- OAuth 2.1 עם scope management מתקדם
- API Gateway לניהול מרוכז של rate limits
- Complex data transformation engine (מיפוי, חישובים, concatenation)
- Conditional logic engine (if-then-else, switch-case)
- State management: שמירת מצב בין transactions
- Queue system לעיבוד אסינכרוני (Redis, RabbitMQ)
- Dead letter queue (DLQ) לטיפול בכשלונות
- Monitoring and alerting (Prometheus, Grafana)
- Version control לכל workflow definition

**מערכות שצריך גישה אליהן**:
- Multiple source systems (CRM, ERP, Marketing, etc.)
- Multiple destination systems
- n8n/workflow platform - orchestration
- Database/Cache (Redis, PostgreSQL) - לשמירת state
- Queue system (RabbitMQ, AWS SQS) - לעיבוד אסינכרוני
- Monitoring platform (Datadog, New Relic)

**אינטגרציות נדרשות**:
- Multi-system bidirectional sync עם תלות הדדית
- Data transformation pipelines: טרנספורמציות מורכבות
- Conditional routing: נתונים זורמים למערכות שונות לפי תנאים
- Error handling workflows: retry, escalate, או notify
- Audit trail: כל פעולה מתועדת למעקב

**Prerequisites (מה צריך להיות מוכן מראש)**:
- ארכיטקטורה מוגדרת: איך הנתונים זורמים בין המערכות
- Data mapping spreadsheet מפורט (כולל transformations)
- Business rules מוגדרות (מתי לעשות מה)
- Decision trees: מתי לנתב לאן
- Error handling policy: כמה retries, מתי להתריע, מתי לעצור
- SLA definitions: כמה זמן תהליך יכול לקחת
- Testing environment בכל המערכות
- Rollback plan במקרה של כשלון קריטי

**הערות חשובות**:
- Complexity-based rate limiting ל-GraphQL APIs (לא רק count requests)
- Token bucket algorithm טוב יותר מ-fixed window לrate limiting
- Transaction logging חייב לכלול: timestamp, user, action, before/after values
- Circuit breaker pattern חיוני: אם מערכת נופלת, עצור נסיונות ל-X דקות
- Idempotency keys למניעת duplicate operations (שליחת אותו request פעמיים)
- Data consistency: eventual consistency לרוב מספיקה, strong consistency רק למקרים קריטיים
- Monitoring metrics: success rate, latency, error rate, throughput
- Alerting thresholds: error rate > 5%, latency > 2s, throughput drop > 20%
- Graceful degradation: אם מערכת נופלת, המשך לעבוד עם fallback
- Schema versioning: כל שינוי ב-data structure צריך version חדש
- GraphQL rate limiting צריך להיות complexity-based, לא request-based

---

## 34. whatsapp-api-setup - הקמת WhatsApp Business API

**מה השירות עושה**: הקמה מלאה של WhatsApp Business API עם תבניות הודעות, webhooks, ואינטגרציה מלאה

**דרישות טכניות**:
- Meta Business Account מאומת
- Phone Number ID (ייעודי, לא ניתן להשתמש במספר רגיל)
- WhatsApp Business Account ID
- Access Token (permanent token, לא temporary - expires < 24h)
- Message Templates מאושרים מ-Meta (אישור: 24-48 שעות)
- Webhook Verification Token (לקבלת תגובות ועדכונים)
- HTTPS endpoint לקבלת webhooks (חובה HTTPS, לא HTTP!)
- HMAC-SHA256 signature verification לוובהוקס
- Business Verification documents: תעודת עוסק, מספר ח.פ.

**מערכות שצריך גישה אליהן**:
- Meta Business Suite - לניהול WhatsApp Business Account
- WhatsApp Business API (Cloud API או On-Premises)
- CRM (Zoho/HubSpot) - מקור מספרי הטלפון והנתונים
- n8n/workflow platform - לבניית אוטומציות
- Webhook endpoint server - לקבלת תשובות מלידים

**אינטגרציות נדרשות**:
- CRM → WhatsApp: ליד חדש → שלח הודעת WhatsApp
- WhatsApp → CRM: ליד ענה → עדכן סטטוס ב-CRM
- WhatsApp → CRM: שמור את כל השיחה ב-CRM
- Webhook → n8n → CRM: עיבוד תגובות והפעלת workflows

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Meta Business Account מוקם ומאומת (verification עסקי)
- מספר טלפון ייעודי (לא אפשר להשתמש באותו מספר ב-WhatsApp App רגיל)
- תבניות הודעות כתובות ונשלחות לאישור ב-Meta Business Manager
- Webhook endpoint מוכן ומאובטח (HTTPS + signature verification)
- CRM פעיל עם נתוני לידים ומספרי טלפון
- הסכמה משפטית לשלוח הודעות (GDPR/תקנות)
- Budget לעלויות API (Meta מחייבת לפי conversation)

**הערות חשובות**:
- Rate limits: Tier 1 = 1,000 הודעות/24h, Tier 2 = 10,000, Tier 3 = 100,000 (צריך approval)
- WhatsApp לא מאפשר הודעות חופשיות! רק Message Templates מאושרים
- יש "24-hour window": אחרי 24h מתגובת הליד, אי אפשר לשלוח יותר (עד שהוא יתחיל שיחה)
- פורמט מספר חייב להיות בינלאומי: +972501234567 (לא 050-123-4567)
- Message Templates נחלקים ל: Marketing, Utility, Authentication, Service
- אישור template לוקח 24-48 שעות - תכנן מראש!
- אסור לשלוח spam - Meta תחסום את המספר
- טיפול בשגיאות נפוצות: מספר לא תקין, הודעה נחסמה, ליד חסם אותנו, template לא מאושר
- Webhook signature verification חובה: base64(HMACSHA256(timestamp + body))
- Access Token temporary פג תוך 24 שעות - צריך להמיר ל-permanent
- Media files מוגבלים: תמונות 5MB, וידאו 16MB, מסמכים 100MB
- Template variables מוגבלים ל-4 משתנים בלבד לכל template
- Cost: $0.005-0.05 לשיחה (conversation) תלוי במדינה ובקטגוריה

---

## 35. int-crm-marketing - אינטגרציית CRM-Marketing

**מה השירות עושה**: סנכרון דו-כיווני בין CRM (Zoho/HubSpot/Salesforce) לפלטפורמת Marketing (Mailchimp/HubSpot/ActiveCampaign)

**דרישות טכניות**:
- OAuth 2.0/2.1 לשתי המערכות
- Mailchimp: OAuth 2 + Integration Partner Program (25+ active users לרישום ב-Marketplace)
- HubSpot: OAuth token management (access + refresh tokens)
- Zoho CRM: OAuth 2.0, access token פג כל שעה
- API permissions: read/write ל-Contacts, Lists, Campaigns, Tags
- Webhook support לעדכונים real-time
- Rate limits: Mailchimp (varies by plan), HubSpot (10,000/day free, 160 requests/10s), Zoho (100-150 calls/min)

**מערכות שצריך גישה אליהן**:
- CRM Platform (Zoho/HubSpot/Salesforce) - מקור הלידים והקונטקטים
- Marketing Automation Platform (Mailchimp/HubSpot/ActiveCampaign) - לניהול קמפיינים
- n8n/workflow platform - לאורקסטרציה של הסנכרון
- Analytics platform - למעקב אחר ביצועים

**אינטגרציות נדרשות**:
- CRM → Marketing: סנכרון Contacts, Leads, Tags, Custom Fields
- Marketing → CRM: עדכון Campaign engagement (opens, clicks, unsubscribes)
- CRM → Marketing: העברת Leads חדשים אוטומטית לרשימות מתאימות
- Marketing → CRM: עדכון Lead Score על בסיס engagement
- Bidirectional: סנכרון Tags, Segmentation, Unsubscribe status

**Prerequisites (מה צריך להיות מוכן מראש)**:
- חשבונות פעילים ב-CRM וב-Marketing Platform
- API credentials מוכנים (OAuth apps registered)
- Field mapping מוגדר: איזה שדה ב-CRM = איזה שדה ב-Marketing
- List management strategy: אילו לידים הולכים לאיזו רשימה
- Unsubscribe handling: איך מטפלים בהסרה מרשימת תפוצה
- Data cleanup: הסרת duplicates לפני סנכרון
- Compliance: GDPR consent, CAN-SPAM, תקנות מקומיות

**הערות חשובות**:
- Mailchimp Integration Partner Program דורש 25+ משתמשים אקטיביים ב-90 הימים האחרונים
- HubSpot rate limit: 10,000 requests ליום (free), 160 requests לכל 10 שניות
- Zoho CRM: 100 calls/דקה (free tier), 150 (paid)
- OAuth tokens: HubSpot tokens פגים, צריך refresh mechanism
- Unsubscribe sync הוא קריטי: אם מישהו unsubscribe ב-Marketing, עדכן ב-CRM (ולהפך)
- List segmentation: כדאי לסנכרן Tags/Custom Fields לצורך segmentation
- Lead scoring: אפשר לעדכן score ב-CRM על בסיס email engagement
- Campaign tracking: לשמור Campaign ID ב-CRM לניתוח ROI
- Data validation: ודא שכתובות email תקינות לפני סנכרון
- Duplicate handling: Mailchimp מזהה duplicates לפי email, צריך merge logic
- Custom fields: לא כל פלטפורמה תומכת בכל השדות, צריך data transformation
- Webhook security: HMAC signature verification עבור Mailchimp webhooks
- Error handling: email bounced, undeliverable, spam complaint - צריך לעדכן ב-CRM

---

## 36. int-crm-accounting - אינטגרציית CRM-חשבונאות

**מה השירות עושה**: סנכרון דו-כיווני בין CRM לתוכנת חשבונאות (Zoho-Xero, Zoho-QuickBooks, HubSpot-QuickBooks)

**דרישות טכניות**:
- OAuth 2.0 לשתי המערכות
- QuickBooks: OAuth 2.0, access tokens פגים אחרי 6 חודשים (צריך auto-refresh!)
- Xero: OAuth 2.0, API access enabled
- Zoho CRM: OAuth 2.0, Enterprise edition+ (Free edition לא תומך!)
- API permissions: Invoices, Products/Items, Contacts/Customers, Payments
- Rate limits: QuickBooks (500,000 CorePlus calls/month Builder Tier), Xero (varies)
- Multi-currency support (אם רלוונטי)
- Tax handling (VAT, Sales Tax)

**מערכות שצריך גישה אליהן**:
- CRM Platform (Zoho/HubSpot) - מקור הלקוחות וה-Deals
- Accounting Software (QuickBooks/Xero) - מערכת החשבונאות
- n8n/workflow platform - orchestration
- Payment Gateway (אם רלוונטי) - לסנכרון תשלומים

**אינטגרציות נדרשות**:
- CRM → Accounting: סנכרון Accounts, Contacts, Deals (כ-Invoices)
- Accounting → CRM: עדכון Invoice status (Paid, Overdue, Due)
- CRM → Accounting: Products/Services לסנכרון Items
- Accounting → CRM: Payment tracking ועדכון ב-CRM
- Bidirectional: Customer information, multi-currency transactions

**Prerequisites (מה צריך להיות מוכן מראש)**:
- חשבונות פעילים ב-CRM וב-Accounting
- Zoho CRM: Enterprise edition ומעלה (Free לא תומך!)
- OAuth apps מוגדרים ב-QuickBooks/Xero Developer Console
- Chart of Accounts מוגדר בתוכנת החשבונאות
- Field mapping: Customer (CRM) = Customer (Accounting), Deal = Invoice
- Tax configuration: איך מטפלים במע"מ/Sales Tax
- Multi-currency: אם עובדים עם מטבעות שונים
- Product catalog sync: אותם מוצרים בשתי המערכות
- Invoice numbering strategy: מי קובע את מספר החשבונית

**הערות חשובות**:
- QuickBooks access tokens פגים אחרי 6 חודשים! צריך automatic refresh logic
- QuickBooks rate limit: 500,000 CorePlus API calls לחודש (Builder Tier)
- Zoho CRM QuickBooks extension זמין רק מ-Enterprise edition ומעלה
- Invoice status sync הוא קריטי: Paid, Overdue, Due - צריך לעדכן ב-CRM
- Multi-currency support: QuickBooks Online ו-Zoho CRM תומכים, צריך exchange rate handling
- Tax handling: VAT/Sales Tax חייבים להיות מוגדרים נכון בשתי המערכות
- Payment reconciliation: לסנכרן payments מ-Accounting ל-CRM
- Custom fields: לא כל השדות נתמכים, צריך data transformation
- Duplicate prevention: Customer נוצר פעם אחת, לא כל פעם מחדש
- Error handling: invoice failed, payment failed, customer already exists
- Data validation: amounts, dates, customer info - לוודא תקינות
- Audit trail: לשמור מי יצר/עדכן מה ומתי
- Bidirectional sync: שינויים בשתי המערכות, צריך conflict resolution
- Chart of Accounts: לוודא שהחשבונות נכונים ב-Accounting software
- Void/Delete handling: מה קורה אם invoice מבוטל/נמחק

---

## 37. int-crm-support - אינטגרציית CRM-תמיכה

**מה השירות עושה**: סנכרון דו-כיווני בין CRM (Zoho/HubSpot) לפלטפורמת Customer Support (Zendesk/Freshdesk/Zoho Desk)

**דרישות טכניות**:
- Zendesk: API Key, Basic Auth, או Bearer Token (רק HTTPS!)
- Freshdesk: API Key (זמין מ-Blossom plan ומעלה, לא Sprout/Free)
- Zoho CRM: OAuth 2.0, access token פג כל שעה
- API permissions: Tickets, Contacts, Organizations, Comments
- Webhook support עבור ticket events (created, updated, closed)
- Webhook authentication: HMAC-SHA256 signature verification
- Rate limits: Zendesk (10 webhooks limit בטריאל), Freshdesk (תלוי בחבילה)

**מערכות שצריך גישה אליהן**:
- CRM Platform (Zoho/HubSpot) - מקור הלקוחות והעסקאות
- Support Platform (Zendesk/Freshdesk/Zoho Desk) - לניהול פניות
- n8n/workflow platform - orchestration
- Knowledge Base (אם רלוונטי) - למאמרי עזרה

**אינטגרציות נדרשות**:
- CRM → Support: סנכרון Contacts, Organizations, Account history
- Support → CRM: יצירת Tickets כ-Activities/Cases ב-CRM
- Support → CRM: עדכון Customer satisfaction, SLA compliance
- CRM → Support: העברת לידים/לקוחות מ-CRM ל-Support
- Bidirectional: Comment sync, ticket status updates

**Prerequisites (מה צריך להיות מוכן מראש)**:
- חשבונות פעילים ב-CRM וב-Support platform
- Freshdesk: Blossom plan ומעלה (API לא זמין ב-Sprout/Free)
- API credentials מוכנים
- Field mapping: Contact (CRM) = Contact (Support), Account = Organization
- Ticket routing rules: אילו פניות הולכות לאן
- SLA definitions: זמני תגובה ופתרון
- Agent assignment logic: מי מטפל במה
- Escalation rules: מתי להעלות סטטוס
- Knowledge base content (אם רלוונטי)

**הערות חשובות**:
- Zendesk webhooks מוגבלים ל-10 בטריאל, unlimited ב-paid plans
- Zendesk webhook timeout: 10 שניות - אם לא עונה, זה נכשל
- Freshdesk API לא זמין ב-Sprout (free) plan, צריך Blossom+
- Freshdesk rate limiting: webhooks מבוצעים לפי API rate limit של החשבון
- Zoho CRM OAuth: access token פג אחרי שעה, צריך refresh
- Webhook signature verification חובה: base64(HMACSHA256(timestamp + body))
- Ticket ID sync: לשמור Ticket ID ב-CRM לקישור בין המערכות
- Customer 360: לקוח צריך לראות את כל ה-tickets שלו ב-CRM
- SLA tracking: לעקוב אחר SLA compliance ב-CRM
- Agent assignment: לסנכרן מי האגנט האחראי
- Ticket status sync: New, In Progress, Pending, Resolved, Closed
- Custom fields: Custom ticket fields צריכים להימפות ל-CRM
- Attachment handling: קבצים מצורפים צריכים להישמר
- Email threading: לשמור את כל השיחה המייל בתיק
- Satisfaction surveys: לסנכרן תוצאות סקרי שביעות רצון ל-CRM
- Escalation notifications: להתריע ב-CRM אם ticket מועלה
- Multi-channel support: אם Support תומך ב-Email, Chat, Phone - לסנכרן הכל

---

## 38. int-calendar - אינטגרציית לוח שנה

**מה השירות עושה**: סנכרון דו-כיווני בין מערכות לוח שנה (Google Calendar, Outlook/Microsoft 365) ל-CRM או מערכות אחרות

**דרישות טכניות**:
- Google Calendar: OAuth 2.0, Google Cloud Console credentials
- Microsoft Graph (Outlook): OAuth 2.0, Azure AD app registration
- API permissions: Calendars.ReadWrite, Calendars.ReadWrite.Shared
- Microsoft: delegated permissions לגישה כמשתמש, application permissions לbackground service
- Token management: Access tokens פגים אחרי שעה (Google), refresh token logic
- Webhook/Push notifications לעדכונים real-time
- Timezone handling (UTC, local timezones)
- Recurring events support

**מערכות שצריך גישה אליהן**:
- Google Calendar API - לוח שנה של Google
- Microsoft Graph API - לוח שנה של Outlook/Microsoft 365
- CRM (Zoho/HubSpot) - לסנכרון פגישות
- n8n/workflow platform - orchestration
- Notification service - להתראות לפני פגישות

**אינטגרציות נדרשות**:
- CRM → Calendar: יצירת אירוע בלוח השנה מפגישה ב-CRM
- Calendar → CRM: עדכון פגישה ב-CRM אם שונה בלוח השנה
- Calendar → CRM: שמירת attendees, notes, location ב-CRM
- CRM → Calendar: ביטול פגישה בלוח השנה אם בוטלה ב-CRM
- Bidirectional: סנכרון מלא של שינויים

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Google: Google Cloud Console project, OAuth 2.0 credentials
- Microsoft: Azure AD app registration, OAuth 2.0 credentials
- Google: הפעלת Google Calendar API
- Microsoft: הרשאות Calendars.ReadWrite ב-Microsoft Graph
- CRM עם שדות לניהול פגישות (date, time, attendees, location)
- Timezone strategy: לשמור הכל ב-UTC או local time?
- Recurring events handling: איך מטפלים באירועים חוזרים
- Conflict detection: מה קורה אם יש התנגשות?
- Invitation strategy: מי שולח את ההזמנות לפגישה

**הערות חשובות**:
- Google Calendar API: access token פג אחרי שעה, צריך refresh token
- Microsoft Graph: access token פג אחרי שעה, refresh token בתוקף יותר זמן
- Microsoft: Admin approval נדרש לרוב ההרשאות בארגונים
- Publisher verification נדרש ל-multi-tenant apps (למניעת "unverified" warning)
- Timezone handling הוא קריטי: לשמור הכל ב-UTC + timezone offset
- Recurring events: לשמור recurrence rule (RRULE) ולא ליצור אירוע לכל מופע
- Attendees sync: לשמור מי המשתתפים (email + response status)
- Push notifications: Google ו-Microsoft תומכים בwebhooks לעדכונים real-time
- Conflict detection: לבדוק overlapping events לפני יצירת פגישה
- Free/Busy sync: לסנכרן זמינות בלי לחשוף פרטי הפגישה
- Calendar permissions: לוודא שיש גישה ל-shared calendars אם נדרש
- Rate limits: Google (unlimited לרוב), Microsoft (rate throttling exists)
- Event reminders: לסנכרן תזכורות (15 דקות לפני, וכו')
- All-day events: לטפל בהם נכון (ללא שעה ספציפית)
- Location sync: לשמור מיקום פיזי או Zoom/Teams link
- Cancellation handling: לעדכן ב-CRM ולשלוח cancellation notices
- Invitation management: מי שולח הזמנות - CRM או Calendar?

---

## 39. int-ecommerce - אינטגרציית eCommerce

**מה השירות עושה**: סנכרון דו-כיווני בין פלטפורמות eCommerce (WooCommerce, Shopify) ל-CRM, Inventory, או Accounting

**דרישות טכניות**:
- WooCommerce: API Keys (Consumer Key + Consumer Secret)
- Shopify: Admin API access token, App credentials
- API permissions: read_product_listings, write_product_listings (Shopify)
- WooCommerce: WordPress permalinks חייבים להיות human-readable (לא Plain)
- Webhook support לעדכונים real-time (orders, inventory changes)
- Rate limits: תלוי בפלטפורמה ובחבילה
- Inventory location management (Shopify תומך במספר מיקומים)

**מערכות שצריך גישה אליהן**:
- eCommerce Platform (WooCommerce/Shopify) - החנות המקוונת
- CRM (Zoho/HubSpot) - לניהול לקוחות וזמנויות
- Inventory Management - לסנכרון מלאי
- Accounting (QuickBooks/Xero) - לסנכרון הזמנות וחשבוניות
- n8n/workflow platform - orchestration

**אינטגרציות נדרשות**:
- eCommerce → CRM: הזמנה חדשה → ליד/לקוח חדש ב-CRM
- eCommerce ↔ Inventory: סנכרון דו-כיווני של מלאי real-time
- eCommerce → Accounting: הזמנה → חשבונית באוטומציה
- eCommerce ↔ eCommerce: סנכרון בין WooCommerce ל-Shopify (multi-channel)
- Inventory → eCommerce: עדכון מלאי אוטומטי בכל הערוצים

**Prerequisites (מה צריך להיות מוכן מראש)**:
- חשבונות פעילים בכל הפלטפורמות
- WooCommerce: API keys נוצרו ב-WooCommerce > Settings > Advanced > REST API
- Shopify: App credentials מהמערכת
- Shopify: Access scopes מוגדרים נכון (read/write products, orders)
- Product catalog מסונכרן בין המערכות (SKU matching)
- Inventory locations מוגדרים (אם רלוונטי)
- Tax settings מוגדרים בכל הפלטפורמות
- Shipping methods מוגדרים
- Payment gateway integration

**הערות חשובות**:
- WooCommerce API: maximum payload size תלוי בהגדרות השרת
- Shopify API: rate limits תלויים בחבילה
- SKU matching הוא קריטי: אותו SKU = אותו מוצר בכל הפלטפורמות
- Inventory sync צריך להיות real-time למניעת overselling
- Two-way inventory reduction: הזמנה ב-WooCommerce מורידה גם ב-Shopify
- Product data sync: Category, Description, Title, SKU, Price, Stock, Image, Attributes
- Order status sync: Pending, Processing, Completed, Cancelled, Refunded
- Customer data sync: שם, אימייל, טלפון, כתובת → CRM
- Multi-location inventory: Shopify תומך, צריך לבחור מיקום לכל הזמנה
- Stock levels: לעדכן בכל המקומות בו-זמנית
- Product variations: לטפל ב-variants (צבע, מידה) נכון
- Image sync: לסנכרן תמונות מוצר (URL או upload)
- Webhook payload size: בדרך כלל 16MB
- Error handling: product not found, out of stock, payment failed
- Duplicate prevention: לא ליצור אותו order פעמיים
- Refund handling: לעדכן ב-CRM וב-Accounting
- Shipping tracking: לסנכרן מספרי מעקב (tracking numbers)
- Tax calculation: לוודא שמע"מ מחושב נכון בכל הפלטפורמות

---

## 40. int-custom - אינטגרציה מותאמת אישית

**מה השירות עושה**: פיתוח API מותאם אישית ואינטגרציה ייחודית לצרכי העסק הספציפיים

**דרישות טכניות**:
- API Design: REST או GraphQL (להחליט לפי use case)
- Authentication: OAuth 2.1, JWT, או API Keys (לפי צורך)
- Rate limiting algorithm: Token Bucket או Sliding Window (לא Fixed Window!)
- GraphQL: Complexity-based rate limiting (לא רק request count)
- API versioning strategy: URL versioning (/v1/, /v2/) או Header versioning
- OpenAPI 3.2 specification למסמכי API
- HTTPS/TLS חובה לכל endpoints
- Input validation למניעת injection attacks
- Error handling standardization: HTTP status codes + error messages
- Logging and monitoring: request/response logs, error tracking

**מערכות שצריך גישה אליהן**:
- Source System(s) - המערכות המקוריות
- Destination System(s) - מערכות היעד
- API Gateway (AWS API Gateway, Kong, Tyk) - לניהול מרוכז
- Database (PostgreSQL, MongoDB) - לאחסון נתונים אם נדרש
- Cache layer (Redis) - לביצועים
- Queue system (RabbitMQ, AWS SQS) - לעיבוד אסינכרוני
- Monitoring (Datadog, New Relic) - למעקב

**אינטגרציות נדרשות**:
- Custom API endpoints לפי הצורך
- Data transformation pipelines
- Authentication and authorization layer
- Rate limiting and throttling
- Webhook handlers
- Batch processing capabilities
- Real-time sync mechanisms

**Prerequisites (מה צריך להיות מוכן מראש)**:
- ארכיטקטורה מוגדרת: REST vs. GraphQL, monolithic vs. microservices
- API documentation: OpenAPI 3.2 spec
- Authentication strategy: OAuth, JWT, API Keys - מה מתאים
- Rate limiting policy: כמה requests מותר לכל client
- Versioning strategy: איך מטפלים ב-breaking changes
- Error handling standards: איזה status codes, איזה error format
- Security requirements: encryption, HTTPS, input validation
- Testing environment: Sandbox לבדיקות
- Monitoring plan: אילו metrics לעקוב (latency, error rate, throughput)
- Documentation: developer portal עם examples

**הערות חשובות**:
- GraphQL rate limiting צריך להיות complexity-based, לא request-based
- Token Bucket algorithm עדיף על Fixed Window (מאפשר bursts)
- OpenAPI 3.2 תומך טוב יותר ב-webhooks ו-security schemas
- JWT tokens: לכלול expiration (exp), issued at (iat), issuer (iss)
- API versioning: אל תפרק versions ישנות מהר מדי (backward compatibility)
- Rate limiting: להשאיר headroom (85% של capacity, לא 100%)
- CORS configuration: לאפשר רק domains מורשים
- Input validation: לבדוק type, format, length, allowed values
- Error responses: להחזיר error code + human-readable message + optional details
- Pagination: cursor-based עדיף על offset-based (ביצועים)
- Caching strategy: CDN לstatic content, Redis לdynamic content
- Idempotency: לתמוך ב-idempotency keys ל-POST/PUT/DELETE
- Webhook security: HMAC signatures, IP whitelisting
- API documentation: interactive docs (Swagger UI) + code examples
- Testing: unit tests, integration tests, load tests
- Monitoring metrics: latency (p50, p95, p99), error rate, throughput, availability
- Circuit breaker: אם downstream service נופל, להפסיק נסיונות
- Retry logic: exponential backoff (1s, 2s, 4s, 8s...)
- Schema evolution: לאפשר הוספת שדות בלי לשבור backward compatibility
- GraphQL: להגביל depth ו-complexity של queries למניעת abuse
- Authentication: לתמוך ב-refresh tokens למניעת re-authentication מתמיד

---

## Summary: Key Takeaways for All Integration Services

### Common Authentication Requirements:
- OAuth 2.1 הוא הסטנדרט החדש (2025)
- Access tokens פגים (בדרך כלל שעה), צריך refresh mechanism
- HTTPS חובה לכל API calls ו-webhooks
- HMAC-SHA256 signature verification לוובהוקס

### Common Rate Limiting Patterns:
- Exponential backoff: 1s, 2s, 4s, 8s... אחרי כשלון
- Token Bucket algorithm טוב יותר מ-Fixed Window
- GraphQL: complexity-based rate limiting, לא רק request count
- לשמור headroom (85% capacity, לא 100%)

### Common Data Sync Challenges:
- Conflict resolution: last-write-wins, source-of-truth, או manual review
- Field-level resolution עדיף על record-level
- Webhook timeouts: 10 שניות בדרך כלל
- Idempotency keys למניעת duplicate operations
- Audit trail: לשמור מי שינה מה ומתי

### Common Error Handling:
- Circuit breaker pattern: אם מערכת נופלת, עצור נסיונות ל-X זמן
- Dead letter queue לטיפול בכשלונות קריטיים
- Monitoring alerts: error rate > 5%, latency > 2s
- Graceful degradation: להמשיך לעבוד אם מערכת עזר נופלת

### Common Prerequisites:
- API credentials לכל המערכות
- Field mapping מפורט
- Testing environment בכל הפלטפורמות
- Rollback plan במקרה של כשלון
- Documentation מלאה של כל workflow

---

**End of Technical Requirements Research: Integration Services 31-40**
