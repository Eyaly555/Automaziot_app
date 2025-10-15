# Technical Requirements Research - Automation Services (1-20)

This document provides comprehensive technical requirements for all automation services in the Discovery Assistant platform.

---

## 1. auto-lead-response - תגובה אוטומטית ללידים

**מה השירות עושה**: שליחת תגובה אוטומטית מיידית כשליד חדש נכנס מטופס באתר

**דרישות טכניות**:
- Webhook endpoint או Form API key מהאתר (Wix/WordPress/Custom)
- Email service credentials (SMTP או SendGrid API Key או Mailgun API Key)
- CRM API credentials (Zoho CRM OAuth Token או Salesforce API Key)
- n8n instance עם HTTPS endpoint לקבלת webhooks
- Rate limits: SendGrid - 100 emails/day (free), Mailgun - 5,000 emails/month (free)

**מערכות שצריך גישה אליהן**:
- Form platform (Wix Forms/WordPress/Elementor/Google Forms) - לקבלת הלידים
- Email service (SendGrid/Mailgun/SMTP) - לשליחת האימיילים
- CRM (Zoho/Salesforce/HubSpot) - לשמירת הליד ולוג התגובה
- n8n - לבניית האוטומציה

**אינטגרציות נדרשות**:
- Form → n8n: webhook trigger כשטופס נשלח
- n8n → Email Service: שליחת אימייל תגובה
- n8n → CRM: יצירת ליד חדש ועדכון סטטוס "responded"

**Prerequisites (מה צריך להיות מוכן מראש)**:
- טופס פעיל באתר עם אפשרות webhook
- תבנית אימייל מוכנה (HTML template)
- Email service account מאומת עם domain verification (SPF/DKIM)
- CRM module setup עם שדות מותאמים ללידים

**הערות חשובות**:
- טפסים רבים לא תומכים ב-webhooks (Wix דורש Velo, WordPress צריך plugin)
- אימיילים אוטומטיים עלולים ליפול לספאם - חובה domain verification
- זמן תגובה קריטי - צריך להגיב תוך 2-5 דקות מקס
- צריך fallback mechanism אם Email service נופל

---

## 2. auto-sms-whatsapp - SMS/WhatsApp אוטומטי ללידים

**מה השירות עושה**: שליחת הודעות WhatsApp או SMS אוטומטית ללידים חדשים

**דרישות טכניות**:
- WhatsApp Business API account (לא WhatsApp Business App!)
- Phone Number ID מ-Meta Business Suite
- WhatsApp Business Account ID (WABA ID)
- Access Token (System User Token, permanent, לא 24-hour token)
- Message Templates מאושרים על ידי Meta (approval: 24-72 שעות)
- Webhook Verification Token + Callback URL (HTTPS חובה)
- או: Twilio Account SID + Auth Token (לSMS/WhatsApp)
- Rate limits WhatsApp: 1,000 הודעות/יום (Tier 1), 10,000 (Tier 2), 100,000 (Tier 3)
- Rate limits Twilio: תלוי בפלאן, בדרך כלל 200 SMS/שעה

**מערכות שצריך גישה אליהן**:
- Meta Business Suite - ניהול WhatsApp Business API
- Twilio Console (אופציה חלופית) - ניהול SMS/WhatsApp
- CRM (Zoho/Salesforce) - משם באים הלידים והטלפונים
- n8n - לבניית האוטומציה

**אינטגרציות נדרשות**:
- CRM → n8n: webhook כשליד חדש נוצר
- n8n → WhatsApp Business API: שליחת message template
- WhatsApp → n8n → CRM: קבלת תשובות ועדכון סטטוס

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Meta Business Account מאומת (Business Verification - לוקח 3-7 ימים)
- מספר טלפון ייעודי (לא ניתן להשתמש במספר רגיל של WhatsApp App)
- תבניות הודעות כתובות ונשלחות לאישור (דורשות שם, משתנים, CTA)
- CRM עם שדות טלפון בפורמט בינלאומי (+972501234567)

**הערות חשובות**:
- WhatsApp לא מאפשר הודעות חופשיות ללידים חדשים - רק message templates מאושרים
- אחרי 24 שעות מתגובת הליד, חלון השיחה נסגר (צריך template חדש)
- מספר טלפון MUST be international format, אחרת ההודעה תיכשל
- Opt-in נדרש - הליד חייב להסכים לקבל הודעות
- WhatsApp Template rejection rate גבוה - לא לשים links או מחירים בתבנית

---

## 3. auto-crm-update - עדכון CRM אוטומטי מטפסים

**מה השירות עושה**: עדכון אוטומטי של רכשומות ב-CRM כשטפסים מוגשים

**דרישות טכניות**:
- CRM API credentials (Zoho: OAuth 2.0 Client ID, Client Secret, Refresh Token)
- Salesforce: Consumer Key, Consumer Secret, Username, Password, Security Token
- HubSpot: API Key או Private App Token
- Form webhook או API integration (depends on form platform)
- Data mapping configuration (form fields → CRM fields)
- Rate limits: Zoho - 10,000 API calls/day, Salesforce - 15,000-100,000 (depends on edition)

**מערכות שצריך גישה אליהן**:
- Form platform (website forms, landing pages)
- CRM (Zoho/Salesforce/HubSpot) - יעד העדכון
- n8n - automation engine
- Optional: Data validation service

**אינטגרציות נדרשות**:
- Form → n8n: webhook trigger או polling
- n8n → CRM: Create/Update API call
- n8n → Form: confirmation response (optional)

**Prerequisites (מה צריך להיות מוכן מראש)**:
- CRM API access enabled (בחלק מהפלאנים זה תוסף בתשלום)
- Custom fields בCRM מוכנים ומותאמים לשדות הטופס
- Field mapping document (איזה שדה בטופס = איזה שדה ב-CRM)
- Duplicate detection rules ב-CRM (למנוע כפילויות)

**הערות חשובות**:
- Data validation קריטי - שדה לא תקין יכול לגרום לכל ה-sync ליפול
- Zoho דורש refresh token renewal כל 3 חודשים (אם לא עושים Self Client)
- Salesforce מגביל API calls - צריך batch updates אם יש הרבה טפסים
- חובה error handling - מה קורה אם CRM down או API limit reached

---

## 4. auto-team-alerts - התראות לצוות על לידים חשובים

**מה השירות עושה**: שליחת התראות מיידיות לחברי צוות כשמגיע ליד בעדיפות גבוהה

**דרישות טכניות**:
- Notification channels: Slack Webhook URL או Teams Incoming Webhook
- Email SMTP credentials (למייל)
- SMS service: Twilio Account SID + Auth Token (אופציונלי)
- Push notifications: OneSignal API Key או Firebase Cloud Messaging (אופציונלי)
- CRM API access - לזהות לידים חשובים
- Lead scoring rules/logic (JSON או conditional expressions)

**מערכות שצריך גישה אליהן**:
- CRM (Zoho/Salesforce) - זיהוי לידים חשובים
- Slack או Microsoft Teams - התראות לצוות
- Email service - התראות במייל
- n8n - routing logic

**אינטגרציות נדרשות**:
- CRM → n8n: real-time webhook כשליד נוצר/מתעדכן
- n8n → Slack/Teams: הודעה עם פרטי הליד
- n8n → Email: התראה למנהל מכירות
- n8n → SMS (optional): התראה למובייל

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Lead scoring criteria מוגדרים (budget > X, industry = Y, etc.)
- Slack Workspace עם incoming webhooks enabled
- Teams channel עם webhook connector מותקן
- רשימת אנשי צוות + ערוצי התראה מועדפים

**הערות חשובות**:
- Alert fatigue - אם יש יותר מדי התראות, הצוות יתעלם
- Priority logic צריך להיות ברור - לא כל ליד הוא "חשוב"
- Slack rate limit: 1 message/second per webhook
- Teams webhooks לפעמים נכשלים - צריך retry mechanism
- Do Not Disturb hours - לא לשלוח התראות בלילה/סופ"ש

---

## 5. auto-lead-workflow - workflow מלא לניהול לידים

**מה השירות עושה**: ניהול מקצה לקצה של לידים - קליטה, חלוקה לסוכנים, מעקב אוטומטי

**דרישות טכניות**:
- CRM API full access (Create, Read, Update, Assign)
- Lead assignment logic (round-robin, territory-based, skill-based)
- Email automation credentials (SendGrid/Mailgun)
- WhatsApp/SMS API (Twilio או WhatsApp Business API)
- Calendar API (Google Calendar API Key או Microsoft Graph API)
- Task management system API (optional - Asana/Monday/ClickUp)
- Rate limits: תלוי במספר הלידים, בדרך כלל 1,000-5,000 leads/month

**מערכות שצריך גישה אליהן**:
- CRM - ניהול לידים ומשימות
- Email service - follow-up אוטומטי
- WhatsApp/SMS - תקשורת ישירה
- Calendar - תזמון פגישות
- n8n - workflow orchestration
- Optional: Lead enrichment API (Clearbit, Hunter.io)

**אינטגרציות נדרשות**:
- Form/Website → CRM: lead capture
- CRM → n8n: trigger on new lead
- n8n → CRM: assign lead to sales rep
- n8n → Email/WhatsApp: first contact automation
- n8n → Calendar: schedule follow-up tasks
- CRM → n8n: stage change triggers (contacted, qualified, etc.)

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Lead stages מוגדרים ב-CRM (New, Contacted, Qualified, Demo, Closed)
- Assignment rules - איזה ליד הולך לאיזה סוכן
- Email/WhatsApp templates לכל שלב בprocess
- SLA definitions (זמן תגובה מקסימלי לכל שלב)
- Sales team roster עם availability ו-territories

**הערות חשובות**:
- Workflow מורכב = נקודות כשל רבות, צריך monitoring
- Lead assignment צריך fallback - מה אם סוכן לא זמין?
- Data sync issues - מה אם CRM לא מתעדכן?
- Circular triggers - workflow שמפעיל את עצמו (endless loop)
- Performance - בודק שlarge volume של לידים לא שובר את המערכת

---

## 6. auto-smart-followup - אוטומציית מעקבים חכמה

**מה השירות עושה**: מעקבים אוטומטיים ב-WhatsApp/SMS/Email על בסיס התנהגות הליד

**דרישות טכניות**:
- Behavioral tracking data source (CRM activity log, website tracking)
- Email open/click tracking (SendGrid Event Webhook או Mailgun Events API)
- WhatsApp read receipts (WhatsApp Business API)
- AI/ML logic או decision tree rules (n8n conditional logic)
- Multi-channel API access (Email + WhatsApp + SMS)
- Lead engagement scoring algorithm
- Rate limits: depends on volume, typically 500-2,000 follow-ups/day

**מערכות שצריך גישה אליהן**:
- CRM - lead behavior data
- Email service עם event tracking
- WhatsApp Business API
- SMS provider (Twilio)
- n8n - decision engine
- Optional: Analytics platform (Google Analytics, Mixpanel)

**אינטגרציות נדרשות**:
- CRM → n8n: lead activity stream
- Email Service → n8n: open/click events
- WhatsApp → n8n: read receipts
- n8n → Multi-channel: send follow-up based on behavior
- n8n → CRM: log follow-up attempts

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Lead engagement scoring rules (opened email = +5, clicked link = +10, etc.)
- Follow-up cadence plan (Day 1: Email, Day 3: WhatsApp, Day 7: Call)
- Content templates לכל ערוץ וכל שלב
- Opt-out mechanism - הליד יכול להפסיק מעקבים
- Engagement threshold - מתי להפסיק לעקוב (אחרי X ניסיונות)

**הערות חשובות**:
- אל תהיה spammy - מעקבים חכמים ≠ מעקבים אגרסיביים
- Channel preference - לידים מעדיפים ערוצים שונים
- Time zone awareness - לא לשלוח בלילה
- Engagement decay - אם ליד לא מגיב, להפחית תדירות
- Legal compliance - GDPR, CAN-SPAM, Israeli Privacy Law

---

## 7. auto-meeting-scheduler - תזמון פגישות חכם

**מה השירות עושה**: תזמון פגישות אוטומטי עם סנכרון ללוח שנה ותזכורות

**דרישות טכניות**:
- Calendar API: Google Calendar API (Client ID, Client Secret, Refresh Token)
- Microsoft Graph API (Tenant ID, Client ID, Client Secret) - לOutlook/Office 365
- Scheduling tool integration: Calendly API Key או Cal.com API
- Video conferencing: Zoom API Key + Secret או Google Meet API
- Email service: תזכורות ואישורים
- CRM API: לעדכון פגישות מתוזמנות
- Timezone handling library (moment-timezone או date-fns-tz)

**מערכות שצריך גישה אליהן**:
- Google Calendar או Outlook Calendar - זמינות הצוות
- CRM - רישום פגישות
- Video conferencing platform (Zoom/Meet/Teams)
- Email service - אישורים ותזכורות
- n8n - orchestration

**אינטגרציות נדרשות**:
- CRM/Form → n8n: בקשה לפגישה
- n8n → Calendar API: בדיקת זמינות
- n8n → Calendar API: יצירת אירוע
- n8n → Video platform: יצירת meeting link
- n8n → Email: שליחת אישור + קישור
- Calendar → n8n: תזכורות לפני הפגישה

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Google Workspace או Microsoft 365 account
- Zoom account עם API access (Pro plan minimum)
- Calendar availability rules (working hours, buffer time)
- Meeting types מוגדרים (15min intro, 30min demo, 60min consultation)
- Email templates: אישור פגישה, תזכורת 24h, תזכורת 1h

**הערות חשובות**:
- Timezone bugs הם הבעיה #1 - תמיד להציג timezone ללקוח
- Double-booking prevention - sync בין מספר calendars
- Cancellation/Rescheduling flow - מה קורה אם מישהו מבטל
- No-show handling - תזכורות לפני, follow-up אחרי
- Calendar API rate limits: Google = 1,000,000 requests/day, Microsoft = varies by plan

---

## 8. auto-form-to-crm - הגשות טפסים → עדכון אוטומטי ב-CRM

**מה השירות עושה**: עדכון אוטומטי של CRM כשטפסים באתר מוגשים

**דרישות טכניות**:
- Form platform webhook או API (Wix, WordPress, Elementor, Typeform, Google Forms)
- CRM API credentials (Zoho OAuth, Salesforce API, HubSpot API)
- Field mapping configuration (JSON mapping)
- Data validation rules
- Duplicate detection logic
- Rate limits: תלוי ב-CRM, Zoho = 10,000 calls/day

**מערכות שצריך גישה אליהן**:
- Form platform (website/landing page)
- CRM - destination for data
- n8n - data transformation and routing
- Optional: Data enrichment services (Clearbit, Hunter.io)

**אינטגרציות נדרשות**:
- Form → n8n: webhook trigger
- n8n → CRM: upsert (create or update) record
- n8n → Email: confirmation to lead (optional)
- n8n → Analytics: track conversion (optional)

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Form fields מותאמים לשדות CRM
- CRM module structure מוכנה (Leads, Contacts, Accounts)
- Duplicate handling strategy (merge, skip, create new)
- Data validation rules (email format, phone format, required fields)
- Error notification - מי מקבל alert אם sync נכשל

**הערות חשובות**:
- Form spam - בוטים ממלאים טפסים, צריך captcha
- Invalid data - email לא תקין, טלפון לא במבנה נכון
- Missing fields - מה אם שדה required ב-CRM לא בטופס?
- API failures - צריך retry mechanism + error logging
- Data privacy - GDPR compliance, לא לשמור מידע רגיש ללא הסכמה

---

## 9. auto-email-templates - תבניות אימייל אוטומטיות

**מה השירות עושה**: יצירה ואוטומציה של תבניות אימייל עם התאמה אישית

**דרישות טכניות**:
- Email service provider: SendGrid API Key או Mailgun API Key
- Template engine: Handlebars או Liquid syntax
- CRM API: לנתונים דינמיים (שם, חברה, etc.)
- HTML/CSS email coding skills
- Email testing tool: Litmus או Email on Acid (optional)
- Personalization variables support
- Rate limits: SendGrid free = 100/day, paid = 40,000-100,000/day

**מערכות שצריך גישה אליהן**:
- Email service provider (SendGrid/Mailgun)
- CRM - data source for personalization
- n8n - template rendering and sending
- Optional: Design tool (Stripo, BeeFree)

**אינטגרציות נדרשות**:
- CRM → n8n: data for personalization
- n8n → Template engine: render template with data
- n8n → Email service: send personalized email
- Email service → n8n: delivery/open/click events

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Email templates designed (HTML + inline CSS)
- Personalization fields identified ({{firstName}}, {{companyName}}, etc.)
- Email categories (welcome, follow-up, proposal, invoice, etc.)
- Domain verification (SPF, DKIM, DMARC records)
- Unsubscribe mechanism (required by law)

**הערות חשובות**:
- Email deliverability - טמפלייט עם הרבה תמונות/לינקים = ספאם
- Mobile responsive - 60%+ פותחים במובייל
- A/B testing - איזה subject line עובד יותר טוב
- Personalization mistakes - שגיאה ב-template שולחת "Hi {{firstName}}"
- Legal requirements - unsubscribe link, physical address, privacy policy

---

## 10. auto-notifications - מערכת התראות חכמה

**מה השירות עושה**: מערכת התראות חכמה במגוון ערוצים (Email, SMS, Push, Slack)

**דרישות טכניות**:
- Multi-channel APIs:
  - Email: SendGrid/Mailgun API
  - SMS: Twilio Account SID + Auth Token
  - Push: OneSignal API Key או Firebase Cloud Messaging
  - Slack: Webhook URL או Bot Token
  - Teams: Incoming Webhook URL
- Notification preferences storage (database או CRM custom fields)
- Priority/urgency classification logic
- Rate limiting and throttling
- Delivery tracking and retry mechanism

**מערכות שצריך גישה אליהן**:
- All notification channels (Email, SMS, Push, Chat)
- CRM - user preferences and contact info
- Event source systems (CRM, forms, etc.)
- n8n - routing and delivery logic
- Optional: Database for notification logs

**אינטגרציות נדרשות**:
- Event source → n8n: trigger notification
- n8n → Notification channels: send based on preferences
- n8n → CRM/DB: log delivery status
- User → n8n: update notification preferences

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Notification types catalog (lead assigned, task due, payment received, etc.)
- Channel preference system (user chooses email/SMS/both)
- Priority levels (critical, high, medium, low)
- Rate limiting rules (max 5 SMS/day per user)
- Quiet hours configuration (no notifications 10PM-8AM)

**הערות חשובות**:
- Notification fatigue - יותר מדי התראות = המשתמש מכבה הכל
- Channel costs - SMS יקר, Push זול, Email ביניים
- Delivery timing - לא לשלוח בלילה או בסופ"ש (אלא אם critical)
- User preferences - תמיד לתת אפשרות לכבות
- Retry strategy - אם SMS נכשל, האם לנסות Email?

---

## 11. auto-approval-workflow - אוטומציית תהליך אישורים

**מה השירות עושה**: תהליכי אישור אוטומטיים עם ניתוב והתראות

**דרישות טכניות**:
- Workflow state management (database או CRM)
- Approval routing logic (conditional rules)
- Email notification system
- Approval UI או email-based approval (magic links)
- Escalation timer logic
- Multi-level approval support
- Audit trail logging

**מערכות שצריך גישה אליהן**:
- CRM או Document Management System - item pending approval
- Email service - שליחת בקשות אישור
- n8n - workflow orchestration
- Database - approval state tracking
- Optional: E-signature platform (DocuSign, PandaDoc)

**אינטגרציות נדרשות**:
- Source system → n8n: item submitted for approval
- n8n → Email: send approval request to manager
- Approver → n8n: approve/reject action
- n8n → Source system: update status
- n8n → Requestor: notification of decision

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Approval hierarchy defined (who approves what)
- Escalation rules (if no response in X hours, escalate to Y)
- Approval types (discount approval, PTO approval, expense approval)
- Email templates (approval request, approval granted, approval denied)
- Audit requirements (who approved what when)

**הערות חשובות**:
- Approval bottlenecks - אם מנהל בחופשה, מי מאשר?
- Email-based approval security - magic links can be forwarded
- Timeout handling - מה אם אף אחד לא מאשר?
- Version control - מה אם המסמך משתנה אחרי שנשלח לאישור?
- Mobile access - מנהלים צריכים לאשר מהמובייל

---

## 12. auto-document-generation - אוטומציית מסמכים (חוזים/חשבוניות)

**מה השירות עושה**: יצירה אוטומטית של חוזים, חשבוניות, הצעות מחיר

**דרישות טכניות**:
- Document generation API:
  - Docmosis API Key (PDF generation)
  - PandaDoc API Key (contracts, e-signatures)
  - Google Docs API (template-based)
  - Carbone.io (open source alternative)
- Template storage (Google Drive, Dropbox, S3)
- Data source API (CRM, ERP)
- PDF manipulation library (for merging, signing)
- Storage solution for generated documents

**מערכות שצריך גישה אליהן**:
- CRM/ERP - data source
- Document generation service
- Cloud storage (Google Drive, Dropbox, OneDrive)
- Email service - sending documents
- n8n - orchestration
- Optional: E-signature (DocuSign, HelloSign)

**אינטגרציות נדרשות**:
- CRM → n8n: trigger (deal won, invoice due, etc.)
- n8n → Doc generation: create document from template
- n8n → Storage: save document
- n8n → Email: send to client
- n8n → CRM: attach document to record

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Document templates prepared (Word/Google Docs with merge fields)
- Data mapping (CRM fields → document placeholders)
- Legal review of contract templates
- File naming convention (Invoice_2025_001.pdf)
- Storage folder structure

**הערות חשובות**:
- Template complexity - tables, images, signatures מסבכים
- Hebrew/RTL support - לא כל כלי תומך טוב בעברית
- PDF size - מסמכים גדולים יכולים לקחת זמן ליצור
- Version control - לשמור גרסאות של templates
- Data validation - שגיאה בdata = מסמך לא תקין

---

## 13. auto-document-mgmt - ניהול מסמכים אוטומטי

**מה השירות עושה**: קבלה, עיבוד ושמירה אוטומטית של מסמכים

**דרישות טכניות**:
- Document storage: Google Drive API, Dropbox API, או SharePoint API
- OCR service: Google Cloud Vision API או AWS Textract (לסריקת מסמכים)
- Document classification AI או rule-based logic
- Metadata extraction
- File naming automation
- Webhook from email (Gmail API, Office 365 API)
- Rate limits: Google Drive = 20,000 requests/100sec

**מערכות שצריך גישה אליהן**:
- Email - receiving documents
- Cloud storage - storing documents
- OCR service - extracting text
- CRM/ERP - linking documents to records
- n8n - workflow automation

**אינטגרציות נדרשות**:
- Email → n8n: receive document attachment
- n8n → OCR: extract text/data
- n8n → Storage: save with metadata
- n8n → CRM: link document to client/deal
- Storage → n8n: trigger on new file (for existing storage)

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Folder structure in storage (by client, by type, by date)
- File naming convention (ClientName_DocType_Date.pdf)
- Document types taxonomy (invoice, contract, ID, etc.)
- Metadata schema (what data to extract and store)
- Access permissions (who can see what)

**הערות חשובות**:
- OCR accuracy - בעברית פחות טוב מאנגלית
- File formats - PDF, Word, Excel, images - צריך לטפל בכולם
- Sensitive data - לא לשמור מספרי אשראי, ת"ז ללא הצפנה
- Storage costs - cloud storage מצטבר, צריך cleanup policy
- Search capability - מסמכים בלי search = אבודים

---

## 14. auto-data-sync - סנכרון דו-כיווני של נתונים

**מה השירות עושה**: סנכרון דו-כיווני של נתונים בזמן אמת בין מערכות

**דרישות טכניות**:
- Both systems' APIs (read + write access)
- Conflict resolution logic (what if both systems changed same record?)
- Change tracking (timestamps, version numbers)
- Sync state database (what was synced when)
- Webhook support from both systems (for real-time sync)
- Rate limits: depends on systems, plan for 1,000-10,000 syncs/day
- Idempotency handling (prevent duplicate syncs)

**מערכות שצריך גישה אליהן**:
- System A (e.g., CRM)
- System B (e.g., ERP)
- n8n - sync orchestration
- Database - sync state tracking
- Monitoring - sync health dashboard

**אינטגרציות נדרשות**:
- System A → n8n: record changed webhook
- n8n → System B: update record
- System B → n8n: record changed webhook
- n8n → System A: update record
- n8n → Database: log sync transaction

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Field mapping (System A field X = System B field Y)
- Master data source defined (which system wins on conflict?)
- Sync frequency (real-time, every 5min, hourly)
- Initial data load strategy (how to sync existing data)
- Exclusion rules (what NOT to sync)

**הערות חשובות**:
- Circular syncs - A updates B, B updates A, endless loop!
- Conflict resolution - same record changed in both systems
- API rate limits - bi-directional doubles the API calls
- Data drift - over time, data can diverge despite sync
- Monitoring critical - silent sync failures = data inconsistency

---

## 15. auto-system-sync - סנכרון נתונים בין 2-3 מערכות

**מה השירות עושה**: סנכרון אוטומטי של נתונים בין 2-3 מערכות שונות

**דרישות טכניות**:
- API credentials for all systems
- One-way או bi-directional sync logic
- Data transformation/mapping layer
- Sync scheduling (real-time, periodic)
- Error handling and retry
- Deduplication logic
- Rate limits: varies by systems

**מערכות שצריך גישה אליהן**:
- System 1 (e.g., Zoho CRM)
- System 2 (e.g., Shopify)
- System 3 (e.g., Xero Accounting)
- n8n - sync engine
- Optional: Database for sync logs

**אינטגרציות נדרשות**:
- System 1 → n8n: data changed
- n8n → System 2: sync data
- n8n → System 3: sync data
- All systems → n8n: webhooks for changes

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Data flow diagram (which data goes where)
- Field mapping for all systems
- Master data definitions (customer ID, product SKU, etc.)
- Sync direction rules (one-way vs bi-directional)
- Initial sync strategy (bulk import existing data)

**הערות חשובות**:
- More systems = more complexity (exponentially)
- Each system has different rate limits
- Data formats differ (dates, currencies, etc.)
- Timezone handling across systems
- Partial failures - System 2 synced but System 3 failed

---

## 16. auto-reports - דוחות יומיים/שבועיים אוטומטיים

**מה השירות עושה**: יצירה ושליחה אוטומטית של דוחות תקופתיים

**דרישות טכניות**:
- Data source APIs (CRM, Analytics, Database)
- Report generation tool:
  - Google Sheets API (for spreadsheet reports)
  - Chart.js או D3.js (for visual reports)
  - PDF generation (jsPDF, Puppeteer)
- Scheduling (cron jobs in n8n)
- Email service (for delivery)
- Data aggregation and calculation logic
- Template storage

**מערכות שצריך גישה אליהן**:
- CRM/ERP - data source
- Analytics platform (Google Analytics, Mixpanel)
- Database - raw data
- n8n - scheduling and generation
- Email service - delivery
- Cloud storage - report archive

**אינטגרציות נדרשות**:
- n8n cron → Data sources: fetch data
- n8n → Report generator: create report
- n8n → Email: send to recipients
- n8n → Storage: archive report

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Report requirements (KPIs, metrics, charts)
- Report templates (design/layout)
- Recipient lists (who gets what report)
- Schedule definition (daily at 8AM, weekly on Monday)
- Data retention policy (archive for X months)

**הערות חשובות**:
- Timezone for scheduling - 8AM in which timezone?
- Data freshness - report shows data as of when?
- Performance - complex queries can be slow
- Report accuracy - validate calculations before sending
- Alternative delivery - dashboard vs email attachment

---

## 17. auto-multi-system - אינטגרציה מלאה של 4+ מערכות

**מה השירות עושה**: אינטגרציה ואוטומציה מלאה על פני 4 מערכות ומעלה

**דרישות טכניות**:
- API access for all 4+ systems
- Central data model/schema
- Complex data transformation logic
- Orchestration platform (n8n Pro או enterprise)
- Error handling and monitoring
- Transaction management (rollback capability)
- Rate limit management across all systems
- Extensive logging

**מערכות שצריך גישה אליהן**:
- System 1 (e.g., Zoho CRM)
- System 2 (e.g., Shopify E-commerce)
- System 3 (e.g., Xero Accounting)
- System 4 (e.g., Shippo Shipping)
- System 5+ (additional systems)
- n8n - orchestration
- Database - data warehouse/sync state

**אינטגרציות נדרשות**:
- All systems → n8n: bidirectional webhooks
- n8n → All systems: CRUD operations
- n8n → Database: centralized logging
- n8n → Monitoring: health checks

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Complete integration architecture diagram
- Data flow mapping for all systems
- Master data management strategy
- API credentials and rate limits documented
- Fallback plans for each system
- Comprehensive testing environment

**הערות חשובות**:
- Complexity increases exponentially with each system
- Single point of failure risk - if one system down, cascade failures
- Version control - API changes in one system break integration
- Cost - more API calls, more storage, more monitoring
- Documentation critical - team needs to understand the whole flow

---

## 18. auto-end-to-end - אוטומציה מקצה לקצה של תהליך שלם

**מה השירות עושה**: אוטומציה מלאה של תהליך עסקי שלם מתחילה ועד סוף

**דרישות טכניות**:
- Multiple API integrations (form, CRM, payment, shipping, etc.)
- Workflow orchestration (n8n workflows with sub-workflows)
- State machine management
- Error handling at every step
- Human-in-the-loop for approvals
- Transaction rollback capability
- Extensive monitoring and alerting

**מערכות שצריך גישה אליהן**:
- All systems in the business process
- n8n - workflow orchestration
- Database - process state tracking
- Monitoring dashboard
- Communication channels (email, SMS, Slack)

**אינטגרציות נדרשות**:
- Form → CRM → Payment → Fulfillment → Shipping → Customer notification
- Each step triggers the next
- Parallel processes where possible
- Rollback capability if step fails

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Complete process documentation (flowchart)
- Every step mapped to system/API
- Exception handling for each step
- Escalation procedures
- Testing scenarios covering happy path + all error cases

**הערות חשובות**:
- Long-running workflows risk timeout
- Partial completion - some steps succeed, others fail
- Audit trail essential - who did what when
- Performance bottlenecks - which step is slowest?
- Change management - process changes require workflow updates

---

## 19. auto-sla-tracking - מעקב אחר SLA אוטומטי

**מה השירות עושה**: מעקב ודיווח אוטומטי על עמידה ב-SLA (זמני תגובה ופתרון)

**דרישות טכניות**:
- Ticketing system API (Zendesk, Freshdesk, Zoho Desk)
- SLA calculation logic (working hours, holidays)
- Real-time monitoring
- Alert triggers (SLA about to breach)
- Reporting dashboard
- Timezone and calendar handling
- Escalation automation

**מערכות שצריך גישה אליהן**:
- Ticketing/Service system
- CRM - customer data
- n8n - monitoring and alerts
- Email/SMS - breach notifications
- Dashboard - SLA metrics

**אינטגרציות נדרשות**:
- Ticketing system → n8n: ticket created/updated
- n8n → SLA calculator: time remaining
- n8n → Alerts: notify if SLA risk
- n8n → Reporting: SLA compliance metrics
- n8n → Escalation: auto-escalate if breach

**Prerequisites (מה צריך להיות מוכן מראש)**:
- SLA definitions (response time, resolution time, by priority)
- Working hours calendar (business days, holidays)
- Escalation matrix (who to notify when)
- Alert thresholds (warn at 80%, critical at 95%)
- Historical baseline (current SLA performance)

**הערות חשובות**:
- Business hours calculation - weekends/holidays don't count
- Timezone complexity - global teams, global customers
- Clock stops - if waiting on customer, pause SLA timer
- SLA gaming - teams close/reopen tickets to game metrics
- Realistic SLAs - too aggressive = always in breach

---

## 20. auto-custom - אוטומציה מותאמת אישית

**מה השירות עושה**: אוטומציה מותאמת לצרכים ייחודיים של העסק

**דרישות טכניות**:
- Requirements depend on use case
- Potentially custom API development
- Integration with proprietary systems
- Custom logic and business rules
- Flexible authentication mechanisms
- Extensive testing requirements
- Documentation for maintenance

**מערכות שצריך גישה אליהן**:
- Systems specific to the business
- n8n - workflow platform
- Potential custom backend
- Databases, APIs, legacy systems

**אינטגרציות נדרשות**:
- Defined based on specific requirements
- May include custom webhooks
- May require API wrapper development
- Integration patterns based on use case

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Detailed requirements document
- Process flow diagram
- System access and credentials
- Business rules documentation
- Success criteria and KPIs

**הערות חשובות**:
- Custom = higher cost and complexity
- Maintenance burden - custom code needs updating
- Documentation critical - team turnover risk
- Testing requirements higher than standard automation
- Consider if standard solution can be adapted vs building custom

---

**סיכום**: 20 שירותי אוטומציה מכסים את כל הצרכים העסקיים - מפשוטים (תגובה אוטומטית) ועד מורכבים (אינטגרציה של מערכות מרובות). הדרישות הטכניות נעות מAPI keys פשוטים ועד ארכיטקטורות מורכבות עם ניהול state, error handling, ו-monitoring. הקפד תמיד לבדוק rate limits, להכין fallback plans, ולתעד הכל.
