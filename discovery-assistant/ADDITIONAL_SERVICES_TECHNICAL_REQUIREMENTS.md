# Technical Requirements: Additional Services (50-59)

## 50. data-cleanup - ניקוי והסרת כפילויות בנתונים

**מה השירות עושה**: ניקוי כפילויות, איחוד נתונים, תיקון שגיאות ושיפור איכות הנתונים במערכות

**דרישות טכניות**:
- Data deduplication tools: DataMatch Enterprise, WinPure, Match Data Pro
- Fuzzy matching algorithms: Levenshtein Distance, Jaro-Winkler, Damerau-Levenshtein, Soundex, Double Metaphone
- Data quality frameworks: ML-based detection, AI data matching algorithms
- Data profiling tools for analysis: identify patterns, duplicates, anomalies
- Data validation engines: business rules engines (DecisionRules, Drools, Higson)
- Export/Import capabilities: CSV, Excel, JSON, SQL databases
- Batch processing for large datasets (60% of organizations face data duplication issues)
- Python/Node.js scripts for custom cleaning logic
- Data backup and version control before cleanup operations

**מערכות שצריך גישה אליהן**:
- CRM systems (Zoho, Salesforce, HubSpot, Pipedrive) - לגישה לרשומות לקוחות ולידים
- Database systems (MySQL, PostgreSQL, SQL Server) - לניקוי נתונים ישירות במסד נתונים
- Spreadsheet files (Excel, Google Sheets) - לעיבוד קבצים חיצוניים
- Marketing automation platforms - לניקוי רשימות תפוצה
- API access to all systems containing duplicated data

**אינטגרציות נדרשות**:
- Source system → Staging database: ייצוא נתונים לניתוח
- Data profiling tool → Report generation: תוצאות ניתוח איכות נתונים
- Cleaning tool → Source system: העלאת נתונים מנוקים חזרה
- Validation engine → Business rules: בדיקת תקינות לפי כללי עסק

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Backup מלא של כל הנתונים לפני תחילת תהליך הניקוי
- הגדרת כללים עסקיים למיזוג רשומות (איזה שדה מנצח בקונפליקט)
- אישור מנהל מערכת/בעלים לגישה למערכות
- זיהוי השדות המרכזיים לזיהוי כפילויות (שם, אימייל, טלפון, מזהה)
- קבלת הסכמה למחיקת/מיזוג רשומות
- סביבת Staging לבדיקות לפני הפעלה בייצור

**הערות חשובות**:
- Deliverables: דוח איכות נתונים לפני/אחרי, קובץ Excel עם כפילויות שזוהו, נתונים מנוקים במערכת
- 95% של עסקים רואים השפעות שליליות מאיכות נתונים ירודה (Experian)
- Duration: 3-7 ימים תלוי בכמות נתונים (עד 100K רשומות: 3 ימים, 100K-1M: 5-7 ימים)
- Success metrics: % כפילויות שהוסרו, שיפור בשיעור מייל bounce, הפחתת רשומות ריקות
- Common risks: מחיקת נתונים טעונה, מיזוג שגוי של רשומות שונות - mitigation: תמיד לשמור backup, לבצע Dry Run, לקבל אישור ידני על מיזוגים מסוימים
- Best practice: לבצע profiling מקדים כדי להבין את היקף הבעיה
- כדאי להריץ validation rules אחרי הניקוי לוודא תקינות

---

## 51. data-migration - העברת נתונים

**מה השירות עושה**: העברת נתונים בין מערכות (CRM ישן לחדש, Excel ל-CRM, מיזוג מספר מקורות)

**דרישות טכניות**:
- ETL platforms: Talend Open Studio, Pentaho Data Integration, Microsoft SSIS, AWS Glue, Azure Data Factory
- Data transformation tools: custom Python scripts, Node.js, Apache NiFi
- Data mapping and field matching capabilities
- API connectors: REST APIs, GraphQL, SOAP for system integration
- Bulk data operations: CSV/Excel import, API batch processing (typically 500-5000 records per batch)
- Data validation frameworks: schema validation, referential integrity checks
- Migration tools: native import/export features of target systems
- Rollback and recovery procedures: snapshot before migration, transaction logs
- Testing environments for dry-run migrations

**מערכות שצריך גישה אליהן**:
- Source system(s) - מערכת המקור: גישת קריאה, יכולת ייצוא
- Target system(s) - מערכת היעד: גישת כתיבה, הרשאות admin
- Staging database - למיפוי והמרת נתונים
- API credentials לשתי המערכות
- FTP/SFTP access אם נדרש להעלאת קבצים

**אינטגרציות נדרשות**:
- Source system → ETL platform: extraction של נתונים (via API או export)
- ETL platform → Staging: transformation ו-validation
- Staging → Target system: loading של נתונים (via API או bulk import)
- Validation tools → Both systems: השוואת נתונים לאחר migration

**Prerequisites (מה צריך להיות מוכן מראש)**:
- Data cleanup במערכת המקור (להסיר כפילויות לפני העברה)
- מיפוי שדות מלא: Source field → Target field mapping document
- החלטה על migration strategy: Big Bang (בבת אחת) vs. Phased (בשלבים)
- Backup מלא של מערכת היעד לפני ההעברה
- הגדרת success criteria: % records migrated, data accuracy, referential integrity
- זמינות צוות למעקב במהלך ההעברה
- Freeze על מערכת המקור במהלך ההעברה (למנוע שינויים)

**הערות חשובות**:
- Deliverables: מסמך data mapping, סקריפטים להעברה, דוח validation (before/after comparison), documented rollback procedure
- Migration phases: 1) Data preparation & cleanup, 2) Proof-of-concept (POC) migration (10-100 records), 3) Testing & validation, 4) Production migration, 5) Post-migration verification
- Duration: POC (1-2 days), Full migration (3-10 days depending on data volume)
- Testing approach: מומלץ להעביר קבוצת pilot קטנה תחילה, לאמת נכונות, רק אחר כך full migration
- Success metrics: 100% data transferred, <1% errors, all relationships intact, user acceptance
- Common risks: data loss, broken relationships, duplicate records in target system
- Mitigation: always backup, use staging environment, validate after each phase
- Excel limitations: 1M rows max, לעיתים נדרש לפצל קבצים גדולים
- Best practice: document everything, use version control for scripts

---

## 52. add-dashboard - הוספת דשבורד

**מה השירות עושה**: בניית דשבורד real-time מותאם אישית להצגת נתוני עסק, KPIs, ומדדים

**דרישות טכניות**:
- BI platforms: Power BI, Tableau, Looker, Qlik Sense
- Custom development: React + D3.js, Chart.js, Recharts, Apache Superset
- Embedded analytics: Power BI Embedded, Tableau JavaScript API, Looker Embedded (PBL)
- Data connectors: direct database connections (SQL, PostgreSQL, MongoDB), API connectors, CSV/Excel imports
- Real-time data refresh capabilities (webhooks, scheduled refresh every 15min-1hour)
- Dashboard design tools: Figma for wireframes
- Authentication and access control (role-based permissions)
- Export capabilities: PDF, PNG, Excel export from dashboards
- Mobile responsiveness for dashboard viewing

**מערכות שצריך גישה אליהן**:
- Data sources: CRM, ERP, databases, spreadsheets - read access לנתוני המקור
- Database systems - לשאילתות ישירות או views
- API endpoints - לשליפת נתונים בזמן אמת
- Authentication systems - לאימות משתמשים
- Hosting environment - לפרסום dashboard (cloud או on-premise)

**אינטגרציות נדרשות**:
- Data sources → BI platform: חיבור למקורות נתונים (via ODBC/JDBC, REST APIs, native connectors)
- ETL pipeline → Dashboard: הזנת נתונים מעובדים
- Dashboard → User authentication: SSO או login system
- Dashboard → Export services: שליחת דוחות אוטומטית

**Prerequisites (מה צריך להיות מוכן מראש)**:
- הגדרת KPIs ומדדים: אילו מדדים לעקוב? (revenue, leads, conversion rate, etc.)
- Data model: מבנה הנתונים וקשרים בין טבלאות
- Wireframes או mockups של הדשבורד הרצוי
- הרשאות גישה למקורות נתונים
- קבלת דוגמאות דשבורדים שאהבתם (לעיצוב)
- החלטה: embedded בתוך מערכת קיימת או standalone?
- הגדרת target audience: מי יצפה בדשבורד? (מנכ"ל, מנהל מכירות, צוות תפעול)

**הערות חשובות**:
- Deliverables: דשבורד מתפקד, מדריך שימוש (PDF), access credentials, documentation של data sources
- Platform comparison: Power BI (משתלב עם Microsoft, מחיר נמוך יותר), Tableau (visualization מתקדם, עלות גבוהה), Looker (LookML, embedded חזק)
- Duration: Simple dashboard (3-5 days), Complex dashboard with multiple data sources (7-10 days)
- Performance optimization: use aggregated views, index database columns, limit real-time queries
- Success metrics: dashboard load time <3 seconds, data refresh success rate >99%, user adoption rate
- Common pitfalls: too many metrics on one screen (visual overload), no mobile optimization, slow data refresh
- Best practices: start with 5-7 key metrics, use consistent color scheme, enable drill-down capabilities, add filters
- Cost considerations: Power BI Pro ($10/user/month), Tableau Creator ($70/user/month), Looker (custom pricing)
- Embedding: Power BI Embedded משתנה לפי usage, Looker PBL full functionality

---

## 53. add-custom-reports - דוחות מותאמים

**מה השירות עושה**: יצירת דוחות מותאמים אישית עם פילוחים, נתונים וחישובים ייחודיים לעסק

**דרישות טכניות**:
- Report generation tools: SSRS (SQL Server Reporting Services), Crystal Reports, Power BI Report Builder
- Custom development: Python (Pandas, Matplotlib), Node.js (PDFKit, ExcelJS), R (knitr, rmarkdown)
- Template engines: Jinja2 (Python), Handlebars (JavaScript)
- Export formats: PDF (best for distribution), Excel (data manipulation), CSV (data analysis), Word (documentation)
- SQL skills: complex queries, joins, aggregations, window functions
- Visualization libraries: Matplotlib, Seaborn, Plotly (Python), Chart.js (JavaScript)
- Scheduling capabilities: cron jobs, Task Scheduler, n8n workflows
- Data transformation: pivot tables, calculated fields, custom formulas

**מערכות שצריך גישה אליהן**:
- Data sources: CRM, ERP, databases, spreadsheets - read access
- Database management systems - לשאילתות SQL
- Reporting server - לפרסום דוחות (SSRS server, Power BI Service)
- Email system - לשליחת דוחות
- File storage - לשמירת דוחות היסטוריים (SharePoint, Google Drive, network drives)

**אינטגרציות נדרשות**:
- Database → Report query: שליפת נתונים
- Report engine → Template: מיזוג נתונים עם תבנית עיצוב
- Report generator → Export service: המרה ל-PDF/Excel
- Report → Distribution channels: שליחה באימייל או שמירה ב-storage

**Prerequisites (מה צריך להיות מוכן מראש)**:
- הגדרה מדויקת של דרישות הדוח: אילו נתונים? אילו פילוחים? (by date, by region, by product)
- Sample report או mockup של הפורמט הרצוי
- החלטה על frequency: daily, weekly, monthly, on-demand
- רשימת recipients: מי יקבל את הדוח?
- Data access permissions למקורות הנתונים
- הגדרת business rules: חישובים, סינונים, aggregations
- Format preference: PDF (professional), Excel (editable), Dashboard (interactive)

**הערות חשובות**:
- Deliverables: דוח לדוגמה, תבנית דוח (template), מסמך טכני של source queries, הוראות הרצה
- Duration: Simple report (1-2 days), Complex report with calculations (3-5 days)
- SSRS considerations: can generate dashboards, charts, and graphs; allows scheduling and automation; criticism for complexity
- Crystal Reports: traditional choice, has scheduler tools (Smart Report Organizer, remiCrystal)
- Custom development benefits: full control, any format, complex business logic
- Success metrics: report accuracy (100% match to source data), generation time <5 minutes, stakeholder satisfaction
- Common issues: slow query performance (optimize SQL), misaligned data (validate joins), incorrect calculations
- Best practices: use views or stored procedures for complex queries, add report generation timestamp, include data source info in footer
- Testing: always validate report data against source database, test edge cases (empty results, large datasets)

---

## 54. reports-automated - דיווח אוטומטי

**מה השירות עושה**: הפקה ושליחה אוטומטית של דוחות בתזמון קבוע (יומי, שבועי, חודשי) ללא התערבות ידנית

**דרישות טכניות**:
- Scheduling platforms: Power Automate, n8n, Apache Airflow, Windows Task Scheduler, cron (Linux)
- Report automation tools: Power BI Service (built-in scheduling), Crystal Reports Distributor (CRD), Smart Report Organizer, remiCrystal
- Distribution channels: Email (SMTP), FTP/SFTP, SharePoint libraries, network drives, cloud storage (Dropbox, OneDrive)
- Dynamic parameters: date ranges (yesterday, last week, last month), filters (by region, by team)
- Data-driven scheduling: event-based triggers (new data available, threshold reached)
- Bursting capabilities: generate separate reports per recipient/region/department
- Format conversion: automatic export to PDF, Excel, CSV, Word
- Error handling and notifications: alert on failure, retry logic
- Logging and audit trail: track when reports were sent, to whom

**מערכות שצריך גישה אליהן**:
- Data sources - למשיכת נתונים עדכניים
- Report generation platform - להפקת הדוח
- Email server (SMTP credentials) - לשליחת דוחות
- File storage systems (FTP, SharePoint) - לשמירת דוחות
- Scheduler platform - להפעלת הדוח בזמן מתוכנן
- Authentication systems - לגישה אוטומטית למערכות

**אינטגרציות נדרשות**:
- Scheduler → Report engine: trigger הפקת דוח
- Report engine → Data sources: שליפת נתונים
- Report generator → Distribution service: שליחת דוח
- Error handler → Notification system: התראה על כשלון

**Prerequisites (מה צריך להיות מוכן מראש)**:
- דוח בסיסי מוכן (מתוך שירות 53 - add-custom-reports)
- הגדרת תזמון: כל יום ב-8:00? כל שבוע ביום שני? סוף חודש?
- רשימת תפוצה: email addresses של המקבלים
- הגדרת פרמטרים דינמיים: "דוח אתמול", "השבוע האחרון"
- קונפיגורציה של SMTP או FTP credentials
- בדיקת גודל קובץ: אם הדוח גדול מדי לאימייל, לשקול FTP או link
- הגדרת naming convention: Report_Sales_2024-01-15.pdf

**הערות חשובות**:
- Deliverables: דוח אוטומטי פעיל, לוח זמנים (schedule), מסמך תיעוד של הקונפיגורציה, access למערכת scheduling
- Duration: 2-4 ימים (הקמת scheduling, בדיקות, fine-tuning)
- Modern solutions support: time-based scheduling AND event-driven (when data changes)
- Distribution flexibility: email directly to stakeholders, save to shared location, integrate with collaboration tools (Teams, Slack)
- Bursting example: דוח מכירות נפרד לכל מנהל אזור עם הנתונים של האזור שלו בלבד
- Success metrics: 99%+ on-time delivery, zero missed reports, <5 min delay from scheduled time
- Common pitfalls: incorrect timezone settings, email size limits (>25MB), broken authentication tokens
- Best practices: send test email first, monitor first week actively, set up failure alerts, keep historical archive
- Cost considerations: Power BI Pro includes scheduling, third-party tools like remiCrystal ~$500-1000/year
- Recommendation: use n8n for full flexibility (free, self-hosted)

---

## 55. training-workshops - הדרכות

**מה השירות עושה**: הדרכת צוות על מערכות, תהליכים ואוטומציות חדשות דרך סדנאות מעשיות

**דרישות טכניות**:
- Video conferencing: Zoom, Microsoft Teams, Google Meet (for virtual workshops)
- Screen recording: Loom, Camtasia, OBS Studio (for creating tutorial videos)
- Documentation tools: Confluence, Notion, Google Docs, SharePoint (for written guides)
- LMS platforms (if needed): Moodle Workplace, TalentLMS, Absorb LMS (for structured learning paths)
- Hands-on lab environments: demo/sandbox systems for practice
- Presentation tools: PowerPoint, Google Slides, Canva
- Interactive elements: Miro (whiteboarding), Mentimeter (polls), Kahoot (quizzes)
- Video hosting: YouTube (unlisted), Vimeo, Wistia
- Step-by-step guides: screenshots, annotations, written procedures

**מערכות שצריך גישה אליהן**:
- Production systems - לתיעוד מסכים ותהליכים אמיתיים
- Demo/Sandbox environment - לתרגול hands-on בלי פגיעה בייצור
- Video conferencing platform - לסדנאות מקוונות
- Documentation repository - לשמירת חומרי הדרכה
- LMS platform (אם רלוונטי) - להעלאת קורסים

**אינטגרציות נדרשות**:
- Screen recording tool → Video editor: עריכת סרטוני הדרכה
- Video files → Hosting platform: העלאה ושיתוף
- Documentation → Knowledge base: פרסום מדריכים
- LMS → SSO/Authentication: אם יש LMS, אינטגרציה עם מערכת זיהוי

**Prerequisites (מה צריך להיות מוכן מראש)**:
- זיהוי קהל יעד: מי משתתף? (admins, end-users, power users)
- הגדרת learning objectives: מה המשתתפים צריכים לדעת לעשות בסוף?
- בחירת format: in-person, virtual, hybrid
- הכנת demo data במערכת לתרגול
- תיאום זמינות משתתפים (2-4 שעות workshop)
- הכנת use cases ותרחישים אמיתיים
- בדיקת ציוד טכני: מקרופון, מצלמה, חיבור אינטרנט

**הערות חשובות**:
- Deliverables: recorded workshop videos (1-3 videos, 30-60 min each), PDF/Word documentation (step-by-step guide), FAQ document, hands-on exercises, certificate of completion (אופציונלי)
- Duration: preparation (2-3 days), workshop delivery (half-day to full-day), follow-up (1 day for Q&A and materials)
- Workshop structure: 1) Introduction & overview (15 min), 2) Demo & walkthrough (45 min), 3) Hands-on practice (60 min), 4) Q&A (30 min)
- Virtual vs. in-person: virtual easier to record and share, in-person better engagement
- Success metrics: attendance rate, completion rate, post-training quiz scores, user satisfaction survey (NPS)
- Common pitfalls: too much information too fast, no hands-on practice, outdated screenshots in docs
- Best practices: use real business scenarios, encourage questions, provide sandbox for experimentation, record everything for absent team members
- Role-based training: admins need configuration training, end-users need usage training, power users need advanced features
- Follow-up: schedule check-in after 2 weeks to answer questions
- LMS integration: if training >5 modules, consider LMS for tracking progress

---

## 56. training-ongoing - הדרכה שוטפת

**מה השירות עושה**: הדרכה מתמשכת, תמיכה בשאלות, עדכון חומרי לימוד ותוכן חדש לאורך זמן

**דרישות טכניות**:
- LMS platforms: Moodle Workplace, TalentLMS, LearnUpon, Docebo (for centralized learning management)
- Knowledge base software: Zendesk Guide, Confluence, Notion, Helpjuice
- Video library: YouTube (private/unlisted playlists), Vimeo, Wistia
- Communication channels: Slack, Microsoft Teams (for Q&A channel)
- Screen recording for updates: Loom, Snagit (quick tutorial videos)
- Competency tracking tools: CYPHER Learning, TalentGuard, Cloud Assess
- Assessment tools: Google Forms, Typeform, LMS built-in quizzes
- Certification management: track renewals, issue certificates
- Analytics: LMS reporting, video view statistics, competency dashboards

**מערכות שצריך גישה אליהן**:
- LMS platform - להעלאת קורסים ועדכונים
- Production systems - לתיעוד עדכונים ושינויים
- Knowledge base - לעדכון מאמרים ומדריכים
- Communication platform - לתמיכה בזמן אמת
- Video hosting - לפרסום סרטוני הדרכה חדשים

**אינטגרציות נדרשות**:
- LMS → HR system: sync employee data, track mandatory training
- Knowledge base → Search engine: enable employees to find answers
- LMS → SSO: single sign-on for easy access
- Competency tracking → Performance reviews: link skills to evaluations

**Prerequisites (מה צריך להיות מוכן מראש)**:
- הדרכה ראשונית הושלמה (משירות 55 - training-workshops)
- הקמת LMS או knowledge base (אם לא קיים)
- הגדרת תוכנית תוכן: אילו נושאים לכסות? באיזו תדירות?
- הקצאת budget חודשי/שנתי לשעות תמיכה
- הגדרת KPIs: skill level, certification rates, question response time
- בחירת נציג מהארגון (super user) לתיאום צרכים
- תזמון: כמה שעות תמיכה בחודש? (4-8 שעות)

**הערות חשובות**:
- Deliverables: monthly/quarterly new content (videos, docs), updated knowledge base articles, competency reports, Q&A support (via email/chat/calls), quarterly skill assessments
- Duration: ongoing (monthly retainer), typical commitment 6-12 months minimum
- Content refresh cycle: update materials when system changes, add new use cases monthly, refresh videos annually
- Competency tracking: CYPHER can map 5,000+ pre-included competencies, create skills matrix, track progress over time
- Support structure: dedicated Slack/Teams channel for questions, monthly office hours (live Q&A), email support (48h response time)
- Success metrics: knowledge base article views, average time to competency, certification completion rate, reduction in support tickets
- Common needs: onboarding new employees (need training access), system updates (require new tutorials), feature requests (training on new capabilities)
- Best practices: create learning paths for different roles, gamify learning (badges, points), celebrate certifications
- Pricing model: monthly retainer ($500-2000/month) or hourly ($100-200/hour)
- TA teams met only 47.9% hiring goals in 2024, driving need for better onboarding training

---

## 57. support-ongoing - תמיכה שוטפת

**מה השירות עושה**: תמיכה טכנית שוטפת, תחזוקה, תיקון באגים, שדרוגים קטנים ותגובה לבעיות

**דרישות טכניות**:
- Ticketing systems: Zendesk, Freshdesk, Jira Service Management, HubSpot Service Hub
- Knowledge base: integrated with ticketing (Zendesk Guide, Freshdesk Knowledge Base)
- Remote access tools: TeamViewer, AnyDesk, Chrome Remote Desktop (for troubleshooting)
- Monitoring tools: n8n execution logs, Sentry (error tracking), UptimeRobot (uptime monitoring)
- Communication channels: email, phone, live chat, Slack/Teams integration
- Issue tracking: Jira, Linear, GitHub Issues (for bug/feature tracking)
- SLA management: built-in ticketing system SLAs
- Escalation procedures: tier 1 (basic support) → tier 2 (advanced) → tier 3 (development)
- Backup and recovery tools: automated backups, rollback capabilities

**מערכות שצריך גישה אליהן**:
- Production systems - לאבחון ותיקון בעיות
- Database systems - לחקירת בעיות נתונים
- n8n workflows - לבדיקת executions ולתיקון
- Admin panels של כל המערכות המשולבות
- Monitoring dashboards - לזיהוי בעיות פרואקטיבי
- Logs and error tracking systems

**אינטגרציות נדרשות**:
- Ticketing system → Email: קבלת פניות ושליחת עדכונים
- Monitoring tool → Alerting system: התראות על בעיות
- Ticketing → Knowledge base: קישור למאמרי עזרה
- Issue tracker → Development team: escalation של באגים מורכבים

**Prerequisites (מה צריך להיות מוכן מראש)**:
- הגדרת SLA tiers: Priority levels ו-response times
  - P1 (Critical): production down, affects all users → response: 15-60 min, resolution: 4 hours
  - P2 (High): major functionality broken, affects multiple users → response: 2-4 hours, resolution: 8 hours
  - P3 (Medium): minor issue, workaround exists → response: 8 hours, resolution: 48 hours
  - P4 (Low): feature request, cosmetic issue → response: 24 hours, resolution: 1 week
- הגדרת support channels: email? phone? chat? (Zendesk meets people on channels they use most)
- support hours: business hours (9-5) או 24/7? timezone?
- הקמת ticketing system עם SLA automation
- הכשרת צוות הלקוח בפתיחת tickets נכון
- הגדרת escalation path: מתי להעביר לזמינות גבוהה יותר?

**הערות חשובות**:
- Deliverables: monthly support hours (10-40 hours/month), ticket resolution reports, uptime reports, maintenance windows schedule, quarterly system health check
- Pricing models: hourly ($100-200/hour), monthly retainer with included hours ($1500-5000/month for 10-40 hours)
- SLA best practices: UCSF IT responds to system-wide issues within 1 hour if impacting operations, 15 min for critical outages
- Support metrics: MTTR (Mean Time To Resolve), First Response Time, Customer Satisfaction (CSAT), Ticket Volume Trends
- Proactive support: scheduled maintenance, performance optimization, security updates, feature enhancement suggestions
- Success metrics: SLA compliance >95%, first response time <target, resolution time <target, customer satisfaction >4.5/5
- Common pitfalls: unclear priority definitions, no after-hours coverage for critical issues, poor documentation leading to repeated questions
- Best practices: maintain runbook for common issues, use ticket templates, document all resolutions in knowledge base, conduct post-incident reviews
- Maintenance windows: schedule monthly (typically 3rd Sunday night), communicate 1 week in advance, minimize downtime
- Ticketing system features: both Zendesk and Freshdesk offer robust knowledge bases, multichannel support, and SLA automation
- Cost: Zendesk from $25/agent/month, Freshdesk from $19/agent/month (Freshdesk has free plan for up to 10 agents)

---

## 58. consulting-process - ייעוץ תהליכים

**מה השירות עושה**: ניתוח, אופטימיזציה ושיפור תהליכים עסקיים לייעול ואוטומציה

**דרישות טכניות**:
- Process mapping tools: Lucidchart, Miro, Draw.io, Microsoft Visio
- BPMN software: Bizagi Modeler, Camunda Modeler, ProcessMaker
- Lean Six Sigma tools: Minitab, JMP, SigmaXL (for statistical analysis)
- Value Stream Mapping: LeanKit, VSM templates
- Data collection: surveys (Google Forms, SurveyMonkey), interviews, observation
- Analysis frameworks: DMAIC (Define, Measure, Analyze, Improve, Control), 5 Whys, Root Cause Analysis
- Documentation: Confluence, SharePoint, Google Docs (for deliverables)
- Presentation tools: PowerPoint, Prezi (for recommendations presentation)
- Time tracking: Toggl, Clockify (for measuring current state)

**מערכות שצריך גישה אליהן**:
- Process documentation systems - לגישה לתהליכים קיימים
- Observation access to workflows - לצפייה בעבודה בפועל
- Data systems - לניתוח זמנים, כמויות, שגיאות
- Stakeholder interviews - גישה לעובדים בכל שלבי התהליך
- Historical data - לניתוח מגמות ובעיות חוזרות

**אינטגרציות נדרשות**:
- Data extraction → Analysis tools: ייצוא נתונים לניתוח
- Process mapping → Presentation: הצגת ממצאים
- Current state analysis → Future state design: מעבר מ-As-Is ל-To-Be
- Recommendations → Implementation plan: תרגום להמלצות מעשיות

**Prerequisites (מה צריך להיות מוכן מראש)**:
- זיהוי תהליך לשיפור: lead-to-sale, order-to-cash, service request management
- הקצאת stakeholders זמינים לראיונות (2-5 people, 1-2 hours each)
- גישה לנתונים היסטוריים: כמה פניות בחודש? זמן טיפול ממוצע? שיעור שגיאות?
- הגדרת מטרות ייעול: להפחית זמן ב-X%? להגדיל throughput? להפחית שגיאות?
- אישור הנהלה לשינויים במידת הצורך
- זמינות צוות לסדנאות (workshops) לתיעדוף שיפורים
- budget לשיפורים (אוטומציה, מערכות חדשות)

**הערות חשובות**:
- Deliverables: current state process map (BPMN), value stream map, gap analysis report, future state process design, improvement roadmap with priorities, ROI analysis for recommended changes, implementation plan
- Duration: small process (5-7 days), medium process (10-14 days), complex cross-departmental (3-4 weeks)
- Lean Six Sigma approach: DMAIC (Define → Measure → Analyze → Improve → Control)
  - Define: מהו התהליך ומהן הבעיות?
  - Measure: איסוף נתונים - זמנים, עלויות, שגיאות
  - Analyze: זיהוי root causes (80-90% of tasks are wasteful - don't add value)
  - Improve: תכנון שיפורים (automation, consolidation, elimination)
  - Control: הגדרת KPIs ומעקב שוטף
- Value Stream Mapping: visualize entire process, identify waste, bottlenecks, handoffs
- Success metrics: cycle time reduction, cost per transaction, error rate reduction, customer satisfaction improvement
- Common findings: manual data entry (automate), excessive approvals (streamline), lack of visibility (dashboards), duplicate efforts (consolidate)
- 2024 trends: AI integration, data-driven decision-making, customer-centric approaches (BPM blog)
- Best practices: involve frontline employees (they know pain points), use real data not assumptions, prioritize quick wins alongside strategic changes
- Consulting firms: Accenture, Deloitte offer Lean Six Sigma consulting for process improvement
- Tools: BPMN for precise notation, Lean for waste elimination, Six Sigma for quality improvement

---

## 59. consulting-strategy - ייעוץ אסטרטגי

**מה השירות עושה**: ייעוץ ברמה אסטרטגית: תכנון דיגיטלי, roadmap אוטומציה, תעדוף פרויקטים, ROI modeling

**דרישות טכניות**:
- Strategic planning frameworks: Balanced Scorecard, OKRs, SWOT, PESTEL
- Analysis tools: Excel (financial modeling), Tableau/Power BI (data visualization)
- Roadmapping tools: ProductPlan, Roadmunk, Aha!, Miro
- OKR software: Lattice, 15Five, Workboard (for objectives tracking)
- Business case templates: ROI calculator, NPV analysis, payback period
- Stakeholder mapping: influence/interest matrix
- Change management: Prosci ADKAR, Kotter's 8 Steps
- Presentation: PowerPoint, Google Slides (executive summaries)
- Collaboration: Miro (strategic workshops), Notion (strategy documentation)

**מערכות שצריך גישה אליהן**:
- Business data: financial reports, sales data, operational metrics
- Current technology stack: להבנת מה קיים ומה חסר
- Stakeholder access: executive team, department heads (for interviews)
- Industry benchmarks: לרגע השוואה לתחום
- Competitive intelligence: מה המתחרים עושים?

**אינטגרציות נדרשות**:
- Business data → Analysis tools: financial modeling and ROI analysis
- Strategic objectives → OKR platform: tracking progress on goals
- Roadmap → Project management: execution של initiatives
- Strategy documents → Communication platforms: sharing with organization

**Prerequisites (מה צריך להיות מוכן מראש)**:
- הגדרת business context: industry, size, growth stage, challenges
- זמינות executive team לראיונות (CEO, CTO, CFO, COO - 2 hours each)
- גישה לנתונים עסקיים: financial performance, operational metrics, customer data
- הגדרת strategic questions: אילו החלטות צריכות להתקבל?
  - האם להשקיע באוטומציה או בצוות?
  - אילו מערכות להחליף תחילה?
  - מהי אסטרטגיית ה-AI שלנו?
- הגדרת timeline: תכנון ל-1 שנה? 3 שנים? 5 שנים?
- budget constraints: כמה ניתן להשקיע בטרנספורמציה דיגיטלית?
- זמינות להשתתפות בסדנאות אסטרטגיות (2-3 sessions, 3-4 hours each)

**הערות חשובות**:
- Deliverables: strategic assessment report, SWOT analysis, digital transformation roadmap (12-36 months), prioritized initiatives with ROI, OKRs framework, implementation governance model, change management plan, executive presentation
- Duration: short engagement (2 weeks), comprehensive strategy (4-6 weeks)
- Balanced Scorecard: view performance from 4 perspectives:
  1. Financial (or Stewardship): revenue growth, cost reduction, profitability
  2. Customer/Stakeholder: satisfaction, retention, NPS
  3. Internal Process: efficiency, quality, automation rate
  4. Organizational Capacity (Learning & Growth): skills, innovation, employee engagement
- OKRs framework: used by Google, Intel, LinkedIn, Spotify
  - Objectives: ambitious goals (e.g., "Become industry leader in automation")
  - Key Results: measurable outcomes (e.g., "Reduce manual tasks by 50%", "Implement 10 automations")
  - Tracking: set quarterly, reviewed weekly/monthly
- SWOT Analysis: Strengths, Weaknesses, Opportunities, Threats (best for small businesses, minimal resources required)
- Strategic frameworks combination: use SWOT for situation analysis within Balanced Scorecard implementation
- Success metrics: strategic clarity (team alignment), roadmap adoption, initiative completion rate, ROI realization
- 2024-2025 trends: AI/ML integration into strategic planning, real-time balanced scorecard monitoring, combining BSC with OKRs for comprehensive performance management
- Common deliverables: automation maturity assessment, system consolidation roadmap, AI readiness evaluation, technology investment prioritization
- Best practices: align strategy with business goals, involve key stakeholders early, balance quick wins with long-term initiatives, establish governance for decision-making
- Change management critical: 70% of transformations fail due to change resistance, need structured approach (Prosci ADKAR, Kotter's 8 Steps)
- Pricing: typically project-based ($5,000-20,000) or daily rate ($1,000-3,000/day)
- Consulting firms: Balanced Scorecard Institute offers strategic planning, BSC, KPI, and OKR consulting

---
