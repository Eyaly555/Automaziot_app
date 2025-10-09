import { ServiceRequirementsTemplate } from '../types/serviceRequirements';

/**
 * Comprehensive Requirements Templates for Each Service
 * Based on industry best practices and documentation research (2025)
 */

export const SERVICE_REQUIREMENTS_TEMPLATES: ServiceRequirementsTemplate[] = [
  // ==================== CRM IMPLEMENTATION ====================
  {
    serviceId: 'impl-crm',
    serviceName: 'CRM Implementation',
    serviceNameHe: 'הטמעת CRM',
    estimatedTimeMinutes: 30,
    tips: [
      'Think about your entire sales process from lead to close',
      'Consider which integrations are critical vs nice-to-have',
      'Identify who will be the system admin and power users'
    ],
    tipsHe: [
      'חשוב על כל תהליך המכירה מליד ועד סגירה',
      'שקול אילו אינטגרציות קריטיות לעומת רצויות',
      'זהה מי יהיה מנהל המערכת ומשתמשי העל'
    ],
    sections: [
      {
        id: 'crm-basics',
        title: 'Basic Information',
        titleHe: 'מידע בסיסי',
        order: 1,
        fields: [
          {
            id: 'crm_users_count',
            type: 'number',
            label: 'Number of users who will use the CRM',
            labelHe: 'מספר משתמשים שישתמשו ב-CRM',
            required: true,
            validation: { min: 1, max: 1000 }
          },
          {
            id: 'crm_preference',
            type: 'radio',
            label: 'Do you have a preferred CRM platform?',
            labelHe: 'האם יש לך העדפה לפלטפורמת CRM?',
            required: true,
            options: [
              { value: 'zoho', label: 'Zoho CRM', labelHe: 'Zoho CRM' },
              { value: 'hubspot', label: 'HubSpot', labelHe: 'HubSpot' },
              { value: 'salesforce', label: 'Salesforce', labelHe: 'Salesforce' },
              { value: 'pipedrive', label: 'Pipedrive', labelHe: 'Pipedrive' },
              { value: 'recommend', label: 'I need a recommendation', labelHe: 'אני צריך המלצה' }
            ]
          },
          {
            id: 'budget_range',
            type: 'select',
            label: 'Monthly budget for CRM licenses',
            labelHe: 'תקציב חודשי לרישיונות CRM',
            required: true,
            options: [
              { value: 'under_500', label: 'Under ₪500/month', labelHe: 'מתחת ל-₪500/חודש' },
              { value: '500-2000', label: '₪500-2,000/month', labelHe: '₪500-2,000/חודש' },
              { value: '2000-5000', label: '₪2,000-5,000/month', labelHe: '₪2,000-5,000/חודש' },
              { value: 'over_5000', label: 'Over ₪5,000/month', labelHe: 'מעל ₪5,000/חודש' }
            ]
          }
        ]
      },
      {
        id: 'crm-lead-fields',
        title: 'Lead & Contact Fields',
        titleHe: 'שדות ליד ואיש קשר',
        description: 'What information do you want to capture for each lead?',
        descriptionHe: 'איזה מידע אתה רוצה לתעד עבור כל ליד?',
        order: 2,
        fields: [
          {
            id: 'standard_fields',
            type: 'multiselect',
            label: 'Standard fields (select all that apply)',
            labelHe: 'שדות סטנדרטיים (בחר את כל הרלוונטיים)',
            required: true,
            options: [
              { value: 'name', label: 'Full Name', labelHe: 'שם מלא' },
              { value: 'email', label: 'Email', labelHe: 'אימייל' },
              { value: 'phone', label: 'Phone Number', labelHe: 'טלפון' },
              { value: 'company', label: 'Company Name', labelHe: 'שם חברה' },
              { value: 'position', label: 'Job Title', labelHe: 'תפקיד' },
              { value: 'industry', label: 'Industry', labelHe: 'תעשייה' },
              { value: 'company_size', label: 'Company Size', labelHe: 'גודל חברה' },
              { value: 'website', label: 'Website', labelHe: 'אתר' },
              { value: 'address', label: 'Address', labelHe: 'כתובת' },
              { value: 'social', label: 'Social Media Links', labelHe: 'קישורים לרשתות חברתיות' }
            ]
          },
          {
            id: 'custom_fields',
            type: 'list',
            label: 'Custom fields you need (add as many as needed)',
            labelHe: 'שדות מותאמים אישית שאתה צריך (הוסף כמה שצריך)',
            required: false,
            placeholderHe: 'לדוגמא: תאריך חידוש חוזה, סוג מנוי, מקור ההפניה...',
            placeholder: 'e.g., Contract Renewal Date, Subscription Type, Referral Source...'
          },
          {
            id: 'lead_source_tracking',
            type: 'checkbox',
            label: 'Do you want to track lead source automatically?',
            labelHe: 'האם אתה רוצה לעקוב אחר מקור הליד אוטומטית?',
            required: false,
            helperTextHe: 'נתעד מאיזה ערוץ הגיע כל ליד (פייסבוק, גוגל, אתר וכו\')'
          }
        ]
      },
      {
        id: 'crm-sales-pipeline',
        title: 'Sales Pipeline',
        titleHe: 'צינור מכירות',
        description: 'Define your sales stages',
        descriptionHe: 'הגדר את שלבי המכירה שלך',
        order: 3,
        fields: [
          {
            id: 'pipeline_stages',
            type: 'list',
            label: 'Sales stages (in order)',
            labelHe: 'שלבי מכירה (לפי סדר)',
            required: true,
            examplesHe: ['ליד חדש', 'יצירת קשר', 'פגישה נקבעה', 'הצעת מחיר נשלחה', 'משא ומתן', 'נסגר (won)', 'אבוד (lost)'],
            examples: ['New Lead', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'],
            helperTextHe: 'רשום את כל השלבים שליד עובר מרגע שנכנס ועד סגירה'
          },
          {
            id: 'win_probability',
            type: 'checkbox',
            label: 'Assign win probability to each stage',
            labelHe: 'הקצה אחוז סגירה לכל שלב',
            required: false,
            helperTextHe: 'עוזר לחזות הכנסות - כל שלב יקבל אחוז הצלחה (10%, 25%, 50% וכו\')'
          },
          {
            id: 'deal_value_required',
            type: 'checkbox',
            label: 'Require deal value for every opportunity',
            labelHe: 'חייב ערך עסקה לכל הזדמנות',
            required: false
          }
        ]
      },
      {
        id: 'crm-automation',
        title: 'Automation & Workflows',
        titleHe: 'אוטומציות ו-workflows',
        order: 4,
        fields: [
          {
            id: 'auto_assignment',
            type: 'radio',
            label: 'How should leads be assigned to sales reps?',
            labelHe: 'איך לידים צריכים להתחלק לאנשי מכירות?',
            required: true,
            options: [
              { value: 'round_robin', label: 'Round Robin (Equal Distribution)', labelHe: 'סיבוב אחיד (חלוקה שווה)' },
              { value: 'territory', label: 'By Territory/Region', labelHe: 'לפי אזור' },
              { value: 'source', label: 'By Lead Source', labelHe: 'לפי מקור הליד' },
              { value: 'manual', label: 'Manual Assignment', labelHe: 'הקצאה ידנית' }
            ]
          },
          {
            id: 'notifications',
            type: 'multiselect',
            label: 'When should the team get notified?',
            labelHe: 'מתי הצוות צריך לקבל התראות?',
            required: true,
            options: [
              { value: 'new_lead', label: 'New Lead Arrives', labelHe: 'ליד חדש מגיע' },
              { value: 'hot_lead', label: 'Hot Lead (High Score)', labelHe: 'ליד חם (ציון גבוה)' },
              { value: 'stage_change', label: 'Deal Stage Changes', labelHe: 'שינוי שלב בעסקה' },
              { value: 'no_activity', label: 'No Activity for X Days', labelHe: 'אין פעילות X ימים' },
              { value: 'deal_won', label: 'Deal Won', labelHe: 'עסקה נסגרה' }
            ]
          },
          {
            id: 'email_integration',
            type: 'radio',
            label: 'Email integration',
            labelHe: 'אינטגרציית אימייל',
            required: true,
            options: [
              { value: 'gmail', label: 'Gmail', labelHe: 'Gmail' },
              { value: 'outlook', label: 'Outlook', labelHe: 'Outlook' },
              { value: 'both', label: 'Both', labelHe: 'שניהם' },
              { value: 'none', label: 'Not needed', labelHe: 'לא נדרש' }
            ]
          }
        ]
      },
      {
        id: 'crm-reporting',
        title: 'Reports & Analytics',
        titleHe: 'דוחות וניתוחים',
        order: 5,
        fields: [
          {
            id: 'reports_needed',
            type: 'multiselect',
            label: 'Which reports do you need?',
            labelHe: 'אילו דוחות אתה צריך?',
            required: true,
            options: [
              { value: 'sales_pipeline', label: 'Sales Pipeline Report', labelHe: 'דוח צינור מכירות' },
              { value: 'conversion_rates', label: 'Conversion Rates by Stage', labelHe: 'אחוזי המרה לפי שלב' },
              { value: 'lead_sources', label: 'Lead Sources Performance', labelHe: 'ביצועי מקורות לידים' },
              { value: 'sales_forecast', label: 'Sales Forecast', labelHe: 'תחזית מכירות' },
              { value: 'team_performance', label: 'Team Performance', labelHe: 'ביצועי צוות' },
              { value: 'activity_report', label: 'Activity Report', labelHe: 'דוח פעילות' }
            ]
          },
          {
            id: 'dashboard',
            type: 'checkbox',
            label: 'Create real-time dashboard',
            labelHe: 'צור דשבורד real-time',
            required: false,
            helperTextHe: 'דשבורד שמתעדכן בזמן אמת עם כל המדדים החשובים'
          }
        ]
      },
      {
        id: 'crm-integrations',
        title: 'Integrations Needed',
        titleHe: 'אינטגרציות נדרשות',
        order: 6,
        fields: [
          {
            id: 'integrations',
            type: 'multiselect',
            label: 'Which systems should integrate with CRM?',
            labelHe: 'אילו מערכות צריכות להשתלב עם ה-CRM?',
            required: false,
            options: [
              { value: 'whatsapp', label: 'WhatsApp Business', labelHe: 'WhatsApp Business' },
              { value: 'facebook', label: 'Facebook Lead Ads', labelHe: 'Facebook Lead Ads' },
              { value: 'website', label: 'Website Forms', labelHe: 'טפסי אתר' },
              { value: 'accounting', label: 'Accounting Software', labelHe: 'תוכנת הנהלת חשבונות' },
              { value: 'marketing', label: 'Email Marketing Tool', labelHe: 'כלי Email Marketing' },
              { value: 'calendar', label: 'Calendar (Google/Outlook)', labelHe: 'לוח שנה' },
              { value: 'calling', label: 'Phone System', labelHe: 'מערכת טלפוניה' }
            ]
          }
        ]
      },
      {
        id: 'crm-data-migration',
        title: 'Data Migration',
        titleHe: 'העברת נתונים',
        order: 7,
        fields: [
          {
            id: 'existing_data',
            type: 'radio',
            label: 'Do you have existing customer/lead data to migrate?',
            labelHe: 'האם יש לך נתוני לקוחות/לידים קיימים להעביר?',
            required: true,
            options: [
              { value: 'yes_crm', label: 'Yes, from another CRM', labelHe: 'כן, מ-CRM אחר' },
              { value: 'yes_spreadsheet', label: 'Yes, from spreadsheets', labelHe: 'כן, מגיליונות אלקטרוניים' },
              { value: 'yes_mixed', label: 'Yes, from multiple sources', labelHe: 'כן, ממספר מקורות' },
              { value: 'no', label: 'No, starting fresh', labelHe: 'לא, מתחילים מאפס' }
            ]
          },
          {
            id: 'data_volume',
            type: 'number',
            label: 'Approximately how many records?',
            labelHe: 'כמה רשומות בערך?',
            required: false,
            dependsOn: { fieldId: 'existing_data', value: ['yes_crm', 'yes_spreadsheet', 'yes_mixed'] },
            helperTextHe: 'מספר משוער של לקוחות/לידים שצריך להעביר'
          },
          {
            id: 'data_cleaning',
            type: 'checkbox',
            label: 'Need data cleaning/deduplication before migration?',
            labelHe: 'צריך ניקוי/הסרת כפילויות לפני ההעברה?',
            required: false,
            dependsOn: { fieldId: 'existing_data', value: ['yes_crm', 'yes_spreadsheet', 'yes_mixed'] }
          }
        ]
      }
    ]
  },

  // ==================== AI FAQ CHATBOT ====================
  {
    serviceId: 'ai-faq-bot',
    serviceName: 'FAQ Chatbot',
    serviceNameHe: 'צ\'אטבוט למענה על שאלות נפוצות',
    estimatedTimeMinutes: 20,
    tips: [
      'Collect your top 10-20 most common questions',
      'Think about where customers should be redirected if AI can\'t answer',
      'Consider what tone/personality the bot should have'
    ],
    tipsHe: [
      'אסוף את 10-20 השאלות הכי נפוצות',
      'חשוב לאן לקוחות צריכים להיות מופנים אם הAI לא יכול לענות',
      'שקול איזה טון/אישיות הבוט צריך להיות'
    ],
    sections: [
      {
        id: 'chatbot-basics',
        title: 'Basic Setup',
        titleHe: 'הגדרה בסיסית',
        order: 1,
        fields: [
          {
            id: 'bot_name',
            type: 'text',
            label: 'Bot Name',
            labelHe: 'שם הבוט',
            required: true,
            placeholderHe: 'לדוגמא: עוזר אוטומט, תמיכה אוטומטית',
            helperTextHe: 'השם שהלקוחות יראו כשהם מדברים עם הבוט'
          },
          {
            id: 'channels',
            type: 'multiselect',
            label: 'Where should the chatbot be available?',
            labelHe: 'איפה הצ\'אטבוט צריך להיות זמין?',
            required: true,
            options: [
              { value: 'website', label: 'Website', labelHe: 'אתר' },
              { value: 'whatsapp', label: 'WhatsApp', labelHe: 'WhatsApp' },
              { value: 'facebook', label: 'Facebook Messenger', labelHe: 'Facebook Messenger' },
              { value: 'instagram', label: 'Instagram', labelHe: 'Instagram' }
            ]
          },
          {
            id: 'language',
            type: 'multiselect',
            label: 'Languages',
            labelHe: 'שפות',
            required: true,
            options: [
              { value: 'he', label: 'Hebrew', labelHe: 'עברית' },
              { value: 'en', label: 'English', labelHe: 'אנגלית' },
              { value: 'ar', label: 'Arabic', labelHe: 'ערבית' },
              { value: 'ru', label: 'Russian', labelHe: 'רוסית' }
            ]
          },
          {
            id: 'personality',
            type: 'radio',
            label: 'Bot Personality',
            labelHe: 'אישיות הבוט',
            required: true,
            options: [
              { value: 'professional', label: 'Professional & Formal', labelHe: 'מקצועי ופורמלי' },
              { value: 'friendly', label: 'Friendly & Casual', labelHe: 'ידידותי וחברי' },
              { value: 'enthusiastic', label: 'Enthusiastic & Energetic', labelHe: 'נלהב ואנרגטי' }
            ]
          }
        ]
      },
      {
        id: 'chatbot-knowledge',
        title: 'Knowledge Base',
        titleHe: 'בסיס ידע',
        description: 'What should the chatbot know?',
        descriptionHe: 'מה הצ\'אטבוט צריך לדעת?',
        order: 2,
        fields: [
          {
            id: 'faq_list',
            type: 'list',
            label: 'Frequent Questions & Answers',
            labelHe: 'שאלות ותשובות נפוצות',
            required: true,
            placeholderHe: 'רשום שאלה ותשובה - לדוגמא: "מה שעות הפעילות שלכם?" - "אנחנו פתוחים ימים א\'-ה\' 9:00-17:00"',
            helperTextHe: 'הוסף לפחות 10-15 שאלות ותשובות'
          },
          {
            id: 'product_info',
            type: 'checkbox',
            label: 'Include product/service information',
            labelHe: 'כלול מידע על מוצרים/שירותים',
            required: false
          },
          {
            id: 'pricing_info',
            type: 'checkbox',
            label: 'Include pricing information',
            labelHe: 'כלול מידע על מחירים',
            required: false
          },
          {
            id: 'docs_url',
            type: 'text',
            label: 'Documentation/Help Center URL',
            labelHe: 'קישור למרכז עזרה/תיעוד',
            required: false,
            helperTextHe: 'אם יש לך מרכז עזרה קיים, הבוט יכול ללמוד ממנו'
          }
        ]
      },
      {
        id: 'chatbot-flow',
        title: 'Conversation Flow',
        titleHe: 'זרימת שיחה',
        order: 3,
        fields: [
          {
            id: 'greeting_message',
            type: 'textarea',
            label: 'Welcome Message',
            labelHe: 'הודעת ברוכים הבאים',
            required: true,
            placeholderHe: 'לדוגמא: שלום! אני כאן לעזור לך. במה אוכל לסייע?'
          },
          {
            id: 'quick_actions',
            type: 'list',
            label: 'Quick Action Buttons',
            labelHe: 'כפתורי פעולה מהירה',
            required: false,
            placeholderHe: 'לדוגמא: "שאלות נפוצות", "דבר עם נציג", "בדוק סטטוס הזמנה"',
            helperTextHe: 'כפתורים שהלקוח רואה בתחילת השיחה'
          },
          {
            id: 'fallback_strategy',
            type: 'radio',
            label: 'What happens if bot can\'t answer?',
            labelHe: 'מה קורה אם הבוט לא יכול לענות?',
            required: true,
            options: [
              { value: 'human_handoff', label: 'Transfer to Human Agent', labelHe: 'העברה לנציג אנושי' },
              { value: 'leave_message', label: 'Let customer leave message', labelHe: 'מאפשר ללקוח להשאיר הודעה' },
              { value: 'suggest_faq', label: 'Suggest related FAQ', labelHe: 'מציע שאלות נפוצות רלוונטיות' }
            ]
          },
          {
            id: 'collect_email',
            type: 'checkbox',
            label: 'Collect email for follow-up',
            labelHe: 'אסוף אימייל למעקב',
            required: false
          }
        ]
      },
      {
        id: 'chatbot-handoff',
        title: 'Human Handoff',
        titleHe: 'מעבר לנציג אנושי',
        order: 4,
        fields: [
          {
            id: 'handoff_triggers',
            type: 'multiselect',
            label: 'When should bot transfer to human?',
            labelHe: 'מתי הבוט צריך להעביר לנציג?',
            required: true,
            options: [
              { value: 'request', label: 'Customer Requests', labelHe: 'לקוח מבקש' },
              { value: 'complex', label: 'Complex Question Detected', labelHe: 'שאלה מורכבת התגלתה' },
              { value: 'frustrated', label: 'Customer Seems Frustrated', labelHe: 'לקוח נראה מתוסכל' },
              { value: 'urgent', label: 'Urgent Keywords Detected', labelHe: 'מילות מפתח דחופות' }
            ]
          },
          {
            id: 'business_hours',
            type: 'text',
            label: 'Support Hours',
            labelHe: 'שעות תמיכה',
            required: true,
            placeholderHe: 'לדוגמא: א\'-ה\' 9:00-17:00'
          },
          {
            id: 'after_hours_action',
            type: 'radio',
            label: 'What happens outside business hours?',
            labelHe: 'מה קורה מחוץ לשעות העבודה?',
            required: true,
            options: [
              { value: 'bot_only', label: 'Bot continues alone', labelHe: 'הבוט ממשיך לבד' },
              { value: 'leave_message', label: 'Take message for tomorrow', labelHe: 'לוקח הודעה למחר' },
              { value: 'email_alert', label: 'Send urgent email alert', labelHe: 'שולח התראת אימייל דחופה' }
            ]
          }
        ]
      },
      {
        id: 'chatbot-integration',
        title: 'Integrations',
        titleHe: 'אינטגרציות',
        order: 5,
        fields: [
          {
            id: 'crm_integration',
            type: 'checkbox',
            label: 'Save conversations to CRM',
            labelHe: 'שמור שיחות ב-CRM',
            required: false
          },
          {
            id: 'analytics',
            type: 'checkbox',
            label: 'Track analytics (most asked questions, satisfaction)',
            labelHe: 'עקוב אחר ניתוחים (שאלות נפוצות, שביעות רצון)',
            required: false
          },
          {
            id: 'notification_channel',
            type: 'multiselect',
            label: 'Where to notify when handoff needed?',
            labelHe: 'איפה להתריע כשצריך מעבר לנציג?',
            required: true,
            options: [
              { value: 'email', label: 'Email', labelHe: 'אימייל' },
              { value: 'slack', label: 'Slack', labelHe: 'Slack' },
              { value: 'whatsapp', label: 'WhatsApp', labelHe: 'WhatsApp' },
              { value: 'sms', label: 'SMS', labelHe: 'SMS' }
            ]
          }
        ]
      }
    ]
  },

  // ==================== LEAD WORKFLOW AUTOMATION ====================
  {
    serviceId: 'auto-lead-workflow',
    serviceName: 'Complete Lead Management Workflow',
    serviceNameHe: 'workflow מלא לניהול לידים',
    estimatedTimeMinutes: 25,
    tips: [
      'Map your entire lead journey from capture to close',
      'Think about who should get notified at each stage',
      'Consider how quickly you want to respond to new leads'
    ],
    tipsHe: [
      'מפה את כל מסע הליד מקליטה ועד סגירה',
      'חשוב מי צריך לקבל התראות בכל שלב',
      'שקול כמה מהר אתה רוצה להגיב ללידים חדשים'
    ],
    sections: [
      {
        id: 'lead-sources',
        title: 'Lead Sources',
        titleHe: 'מקורות לידים',
        description: 'Where do your leads come from?',
        descriptionHe: 'מאיפה הלידים מגיעים?',
        order: 1,
        fields: [
          {
            id: 'lead_sources',
            type: 'multiselect',
            label: 'Select all lead sources',
            labelHe: 'בחר את כל מקורות הלידים',
            required: true,
            options: [
              { value: 'website_form', label: 'Website Contact Form', labelHe: 'טופס יצירת קשר באתר' },
              { value: 'facebook_ads', label: 'Facebook Lead Ads', labelHe: 'Facebook Lead Ads' },
              { value: 'google_ads', label: 'Google Ads', labelHe: 'Google Ads' },
              { value: 'linkedin', label: 'LinkedIn', labelHe: 'LinkedIn' },
              { value: 'whatsapp', label: 'WhatsApp Inquiries', labelHe: 'פניות WhatsApp' },
              { value: 'phone', label: 'Phone Calls', labelHe: 'שיחות טלפון' },
              { value: 'email', label: 'Email Inquiries', labelHe: 'פניות אימייל' },
              { value: 'referrals', label: 'Referrals', labelHe: 'המלצות' }
            ]
          },
          {
            id: 'monthly_volume',
            type: 'number',
            label: 'Approximate leads per month (all sources)',
            labelHe: 'לידים משוערים לחודש (כל המקורות)',
            required: true,
            validation: { min: 1, max: 10000 }
          }
        ]
      },
      {
        id: 'lead-capture',
        title: 'Lead Capture & Enrichment',
        titleHe: 'קליטת והעשרת לידים',
        order: 2,
        fields: [
          {
            id: 'auto_response_time',
            type: 'select',
            label: 'How quickly should we respond to new leads?',
            labelHe: 'כמה מהר צריך להגיב ללידים חדשים?',
            required: true,
            options: [
              { value: 'immediate', label: 'Immediately (< 1 minute)', labelHe: 'מיד (< דקה)' },
              { value: '5min', label: 'Within 5 minutes', labelHe: 'תוך 5 דקות' },
              { value: '1hour', label: 'Within 1 hour', labelHe: 'תוך שעה' },
              { value: 'same_day', label: 'Same business day', labelHe: 'באותו יום עבודה' }
            ]
          },
          {
            id: 'auto_response_channel',
            type: 'multiselect',
            label: 'How to respond automatically?',
            labelHe: 'איך להגיב אוטומטית?',
            required: true,
            options: [
              { value: 'email', label: 'Email', labelHe: 'אימייל' },
              { value: 'sms', label: 'SMS', labelHe: 'SMS' },
              { value: 'whatsapp', label: 'WhatsApp', labelHe: 'WhatsApp' }
            ]
          },
          {
            id: 'welcome_message',
            type: 'textarea',
            label: 'Auto-response message template',
            labelHe: 'תבנית הודעת תגובה אוטומטית',
            required: true,
            placeholderHe: 'לדוגמא: תודה על פנייתך! אנחנו נחזור אליך בקרוב...'
          },
          {
            id: 'lead_enrichment',
            type: 'checkbox',
            label: 'Enrich lead data automatically (company info, social profiles)',
            labelHe: 'העשר נתוני ליד אוטומטית (מידע על חברה, פרופילי רשתות)',
            required: false,
            helperTextHe: 'מוסיף מידע נוסף על הליד מבסיסי נתונים חיצוניים'
          }
        ]
      },
      {
        id: 'lead-scoring',
        title: 'Lead Scoring & Qualification',
        titleHe: 'ניקוד וסינון לידים',
        order: 3,
        fields: [
          {
            id: 'use_lead_scoring',
            type: 'radio',
            label: 'Use lead scoring?',
            labelHe: 'להשתמש בניקוד לידים?',
            required: true,
            options: [
              { value: 'yes', label: 'Yes - score and prioritize leads', labelHe: 'כן - נקד ותעדף לידים' },
              { value: 'no', label: 'No - all leads equal priority', labelHe: 'לא - כל הלידים בעדיפות שווה' }
            ]
          },
          {
            id: 'hot_lead_criteria',
            type: 'multiselect',
            label: 'What makes a lead "hot"?',
            labelHe: 'מה הופך ליד ל"חם"?',
            required: false,
            dependsOn: { fieldId: 'use_lead_scoring', value: 'yes' },
            options: [
              { value: 'high_budget', label: 'High Budget Indicated', labelHe: 'תקציב גבוה צוין' },
              { value: 'urgent', label: 'Urgent Need', labelHe: 'צורך דחוף' },
              { value: 'company_size', label: 'Large Company', labelHe: 'חברה גדולה' },
              { value: 'source', label: 'From Premium Source', labelHe: 'ממקור פרימיום' },
              { value: 'engagement', label: 'High Engagement (opened emails, visited site)', labelHe: 'מעורבות גבוהה' }
            ]
          },
          {
            id: 'disqualification_rules',
            type: 'list',
            label: 'Auto-disqualification rules (optional)',
            labelHe: 'כללי פסילה אוטומטית (אופציונלי)',
            required: false,
            placeholderHe: 'לדוגמא: אם התקציב פחות מX, אם מאזור Y...',
            helperTextHe: 'לידים שעונים על הכללים האלה לא יועברו לצוות המכירות'
          }
        ]
      },
      {
        id: 'lead-assignment',
        title: 'Lead Distribution & Assignment',
        titleHe: 'חלוקה והקצאת לידים',
        order: 4,
        fields: [
          {
            id: 'assignment_method',
            type: 'radio',
            label: 'How to assign leads to sales reps?',
            labelHe: 'איך להקצות לידים לאנשי מכירות?',
            required: true,
            options: [
              { value: 'round_robin', label: 'Round Robin (Equal Distribution)', labelHe: 'סיבוב (חלוקה שווה)' },
              { value: 'load_balanced', label: 'Load Balanced (by current workload)', labelHe: 'איזון עומס (לפי עומס נוכחי)' },
              { value: 'territory', label: 'By Territory/Region', labelHe: 'לפי אזור/טריטוריה' },
              { value: 'source', label: 'By Lead Source', labelHe: 'לפי מקור ליד' },
              { value: 'skill', label: 'By Skill/Expertise', labelHe: 'לפי מומחיות' }
            ]
          },
          {
            id: 'hot_lead_handling',
            type: 'radio',
            label: 'Hot leads special handling',
            labelHe: 'טיפול מיוחד בלידים חמים',
            required: true,
            options: [
              { value: 'senior', label: 'Assign to senior/best closer', labelHe: 'הקצה לסוגר מנוסה' },
              { value: 'multiple', label: 'Notify multiple reps simultaneously', labelHe: 'התראה למספר נציגים בו זמנית' },
              { value: 'immediate', label: 'Immediate phone call + SMS alert', labelHe: 'שיחת טלפון מיידית + התראת SMS' },
              { value: 'normal', label: 'Normal assignment', labelHe: 'הקצאה רגילה' }
            ]
          },
          {
            id: 'reassignment_rules',
            type: 'checkbox',
            label: 'Auto-reassign if no response within X hours',
            labelHe: 'הקצאה חוזרת אוטומטית אם אין תגובה תוך X שעות',
            required: false,
            helperTextHe: 'מונע שלידים "ייתקעו" אצל נציג שלא מגיב'
          }
        ]
      },
      {
        id: 'lead-followup',
        title: 'Follow-up & Nurturing',
        titleHe: 'מעקבים וטיפוח',
        order: 5,
        fields: [
          {
            id: 'followup_sequence',
            type: 'radio',
            label: 'Automated follow-up sequence',
            labelHe: 'רצף מעקבים אוטומטי',
            required: true,
            options: [
              { value: 'aggressive', label: 'Aggressive (Day 1, 2, 4, 7)', labelHe: 'אגרסיבי (יום 1, 2, 4, 7)' },
              { value: 'moderate', label: 'Moderate (Day 1, 3, 7, 14)', labelHe: 'מתון (יום 1, 3, 7, 14)' },
              { value: 'gentle', label: 'Gentle (Day 1, 7, 14)', labelHe: 'עדין (יום 1, 7, 14)' },
              { value: 'custom', label: 'Custom Schedule', labelHe: 'לוח זמנים מותאם' }
            ]
          },
          {
            id: 'followup_channels',
            type: 'multiselect',
            label: 'Follow-up channels',
            labelHe: 'ערוצי מעקב',
            required: true,
            options: [
              { value: 'email', label: 'Email', labelHe: 'אימייל' },
              { value: 'whatsapp', label: 'WhatsApp', labelHe: 'WhatsApp' },
              { value: 'sms', label: 'SMS', labelHe: 'SMS' },
              { value: 'phone', label: 'Phone Call', labelHe: 'שיחת טלפון' }
            ]
          },
          {
            id: 'no_response_action',
            type: 'select',
            label: 'What to do if no response after all attempts?',
            labelHe: 'מה לעשות אם אין תגובה אחרי כל הניסיונות?',
            required: true,
            options: [
              { value: 'nurture', label: 'Move to long-term nurturing', labelHe: 'העבר לטיפוח ארוך טווח' },
              { value: 'close_lost', label: 'Mark as Closed Lost', labelHe: 'סמן כאבוד' },
              { value: 'future_followup', label: 'Schedule for 3-6 months follow-up', labelHe: 'תזמן למעקב בעוד 3-6 חודשים' }
            ]
          }
        ]
      },
      {
        id: 'lead-notifications',
        title: 'Notifications & Alerts',
        titleHe: 'התראות',
        order: 6,
        fields: [
          {
            id: 'notify_events',
            type: 'multiselect',
            label: 'When to notify sales team?',
            labelHe: 'מתי להתריע לצוות מכירות?',
            required: true,
            options: [
              { value: 'new_lead', label: 'New Lead Arrives', labelHe: 'ליד חדש מגיע' },
              { value: 'hot_lead', label: 'Hot Lead Detected', labelHe: 'ליד חם זוהה' },
              { value: 'lead_reply', label: 'Lead Replies', labelHe: 'ליד מגיב' },
              { value: 'no_activity', label: 'No Activity for 3 Days', labelHe: 'אין פעילות 3 ימים' },
              { value: 'meeting_booked', label: 'Meeting Booked', labelHe: 'פגישה נקבעה' }
            ]
          },
          {
            id: 'notification_channels',
            type: 'multiselect',
            label: 'Notification channels',
            labelHe: 'ערוצי התראה',
            required: true,
            options: [
              { value: 'email', label: 'Email', labelHe: 'אימייל' },
              { value: 'sms', label: 'SMS', labelHe: 'SMS' },
              { value: 'whatsapp', label: 'WhatsApp', labelHe: 'WhatsApp' },
              { value: 'slack', label: 'Slack', labelHe: 'Slack' },
              { value: 'crm', label: 'In-CRM Notification', labelHe: 'התראה בתוך ה-CRM' }
            ]
          }
        ]
      },
      {
        id: 'lead-reporting',
        title: 'Reporting & Analytics',
        titleHe: 'דיווח וניתוחים',
        order: 7,
        fields: [
          {
            id: 'daily_summary',
            type: 'checkbox',
            label: 'Daily summary report (new leads, response rates, conversions)',
            labelHe: 'דוח סיכום יומי (לידים חדשים, אחוזי תגובה, המרות)',
            required: false
          },
          {
            id: 'weekly_analysis',
            type: 'checkbox',
            label: 'Weekly performance analysis',
            labelHe: 'ניתוח ביצועים שבועי',
            required: false
          },
          {
            id: 'dashboard',
            type: 'checkbox',
            label: 'Real-time dashboard with key metrics',
            labelHe: 'דשבורד real-time עם מדדי מפתח',
            required: false
          }
        ]
      }
    ]
  },

  // ==================== WHATSAPP BUSINESS API ====================
  {
    serviceId: 'whatsapp-api-setup',
    serviceName: 'WhatsApp Business API Setup',
    serviceNameHe: 'הקמת WhatsApp Business API',
    estimatedTimeMinutes: 15,
    sections: [
      {
        id: 'whatsapp-account',
        title: 'WhatsApp Account',
        titleHe: 'חשבון WhatsApp',
        order: 1,
        fields: [
          {
            id: 'has_business_account',
            type: 'radio',
            label: 'Do you have WhatsApp Business already?',
            labelHe: 'האם יש לך WhatsApp Business כבר?',
            required: true,
            options: [
              { value: 'yes', label: 'Yes, using WhatsApp Business app', labelHe: 'כן, משתמש באפליקציית WhatsApp Business' },
              { value: 'no', label: 'No, need to set up', labelHe: 'לא, צריך להקים' }
            ]
          },
          {
            id: 'phone_number',
            type: 'text',
            label: 'Business phone number for WhatsApp',
            labelHe: 'מספר טלפון עסקי ל-WhatsApp',
            required: true,
            helperTextHe: 'המספר שיחובר ל-API (חייב להיות מספר ייעודי)'
          },
          {
            id: 'display_name',
            type: 'text',
            label: 'Business display name',
            labelHe: 'שם עסק להצגה',
            required: true
          }
        ]
      },
      {
        id: 'whatsapp-usage',
        title: 'Usage & Features',
        titleHe: 'שימוש ותכונות',
        order: 2,
        fields: [
          {
            id: 'expected_volume',
            type: 'select',
            label: 'Expected monthly message volume',
            labelHe: 'נפח הודעות חודשי צפוי',
            required: true,
            options: [
              { value: 'under_1000', label: 'Under 1,000 messages/month', labelHe: 'מתחת 1,000 הודעות/חודש' },
              { value: '1000-5000', label: '1,000-5,000 messages/month', labelHe: '1,000-5,000 הודעות/חודש' },
              { value: '5000-10000', label: '5,000-10,000 messages/month', labelHe: '5,000-10,000 הודעות/חודש' },
              { value: 'over_10000', label: 'Over 10,000 messages/month', labelHe: 'מעל 10,000 הודעות/חודש' }
            ]
          },
          {
            id: 'use_cases',
            type: 'multiselect',
            label: 'What will you use WhatsApp for?',
            labelHe: 'למה תשתמש ב-WhatsApp?',
            required: true,
            options: [
              { value: 'customer_support', label: 'Customer Support', labelHe: 'תמיכת לקוחות' },
              { value: 'sales', label: 'Sales & Lead Follow-up', labelHe: 'מכירות ומעקב לידים' },
              { value: 'notifications', label: 'Order/Appointment Notifications', labelHe: 'התראות על הזמנות/פגישות' },
              { value: 'marketing', label: 'Marketing Messages', labelHe: 'הודעות שיווקיות' },
              { value: 'chatbot', label: 'Automated Chatbot', labelHe: 'צ\'אטבוט אוטומטי' }
            ]
          },
          {
            id: 'message_templates',
            type: 'list',
            label: 'Message templates you need (e.g., order confirmation, appointment reminder)',
            labelHe: 'תבניות הודעות שאתה צריך (לדוגמא: אישור הזמנה, תזכורת לפגישה)',
            required: true,
            helperTextHe: 'כל תבנית צריכה אישור מ-WhatsApp לפני שימוש'
          }
        ]
      },
      {
        id: 'whatsapp-integration',
        title: 'Integration',
        titleHe: 'אינטגרציה',
        order: 3,
        fields: [
          {
            id: 'crm_sync',
            type: 'checkbox',
            label: 'Sync conversations with CRM',
            labelHe: 'סנכרן שיחות עם CRM',
            required: false
          },
          {
            id: 'team_inbox',
            type: 'radio',
            label: 'How should team access WhatsApp?',
            labelHe: 'איך הצוות צריך לגשת ל-WhatsApp?',
            required: true,
            options: [
              { value: 'shared', label: 'Shared inbox (multiple users)', labelHe: 'תיבת דואר משותפת (מספר משתמשים)' },
              { value: 'assigned', label: 'Assign conversations to specific agents', labelHe: 'הקצה שיחות לנציגים ספציפיים' },
              { value: 'single', label: 'Single user only', labelHe: 'משתמש יחיד בלבד' }
            ]
          }
        ]
      }
    ]
  },

  // ==================== SIMPLE AUTOMATION SERVICES ====================
  {
    serviceId: 'auto-email-templates',
    serviceName: 'Automated Email Templates',
    serviceNameHe: 'תבניות אימייל אוטומטיות',
    estimatedTimeMinutes: 10,
    sections: [
      {
        id: 'email-templates',
        title: 'Email Templates',
        titleHe: 'תבניות אימייל',
        order: 1,
        fields: [
          {
            id: 'template_list',
            type: 'list',
            label: 'List all email templates needed',
            labelHe: 'רשום את כל תבניות האימייל הנדרשות',
            required: true,
            examplesHe: ['תודה על פנייתך', 'אישור פגישה', 'הצעת מחיר', 'תזכורת'],
            helperTextHe: 'לכל תבנית תהיה אפשרות לערוך תוכן, נושא, ומועד שליחה'
          },
          {
            id: 'personalization',
            type: 'multiselect',
            label: 'What should be personalized?',
            labelHe: 'מה צריך להיות מותאם אישית?',
            required: true,
            options: [
              { value: 'name', label: 'Customer Name', labelHe: 'שם לקוח' },
              { value: 'company', label: 'Company Name', labelHe: 'שם חברה' },
              { value: 'product', label: 'Product/Service Name', labelHe: 'שם מוצר/שירות' },
              { value: 'date', label: 'Appointment/Delivery Date', labelHe: 'תאריך פגישה/משלוח' },
              { value: 'price', label: 'Price/Quote', labelHe: 'מחיר/הצעה' }
            ]
          },
          {
            id: 'trigger',
            type: 'multiselect',
            label: 'When should emails be sent?',
            labelHe: 'מתי אימיילים צריכים להישלח?',
            required: true,
            options: [
              { value: 'lead_submit', label: 'Immediately after lead submission', labelHe: 'מיד אחרי הגשת ליד' },
              { value: 'meeting_booked', label: 'When meeting is booked', labelHe: 'כשפגישה נקבעת' },
              { value: 'quote_sent', label: 'After quote is created', labelHe: 'אחרי יצירת הצעת מחיר' },
              { value: 'reminder', label: 'X days before appointment', labelHe: 'X ימים לפני פגישה' },
              { value: 'followup', label: 'X days after last contact', labelHe: 'X ימים אחרי קשר אחרון' }
            ]
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-notifications',
    serviceName: 'Smart Notifications System',
    serviceNameHe: 'מערכת התראות חכמה',
    estimatedTimeMinutes: 10,
    sections: [
      {
        id: 'notifications-config',
        title: 'Notification Configuration',
        titleHe: 'הגדרת התראות',
        order: 1,
        fields: [
          {
            id: 'events',
            type: 'multiselect',
            label: 'What events trigger notifications?',
            labelHe: 'אילו אירועים מפעילים התראות?',
            required: true,
            options: [
              { value: 'new_lead', label: 'New Lead', labelHe: 'ליד חדש' },
              { value: 'hot_lead', label: 'Hot Lead', labelHe: 'ליד חם' },
              { value: 'new_order', label: 'New Order', labelHe: 'הזמנה חדשה' },
              { value: 'customer_message', label: 'Customer Message', labelHe: 'הודעה מלקוח' },
              { value: 'task_overdue', label: 'Task Overdue', labelHe: 'משימה באיחור' },
              { value: 'deal_won', label: 'Deal Won', labelHe: 'עסקה נסגרה' },
              { value: 'payment_received', label: 'Payment Received', labelHe: 'תשלום התקבל' }
            ]
          },
          {
            id: 'channels',
            type: 'multiselect',
            label: 'Notification channels',
            labelHe: 'ערוצי התראה',
            required: true,
            options: [
              { value: 'email', label: 'Email', labelHe: 'אימייל' },
              { value: 'sms', label: 'SMS', labelHe: 'SMS' },
              { value: 'whatsapp', label: 'WhatsApp', labelHe: 'WhatsApp' },
              { value: 'slack', label: 'Slack', labelHe: 'Slack' },
              { value: 'telegram', label: 'Telegram', labelHe: 'Telegram' }
            ]
          },
          {
            id: 'recipients',
            type: 'text',
            label: 'Who should receive notifications?',
            labelHe: 'מי צריך לקבל התראות?',
            required: true,
            placeholderHe: 'לדוגמא: מנהל מכירות, צוות תמיכה, כל הצוות...'
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-data-sync',
    serviceName: 'Bi-directional Data Sync',
    serviceNameHe: 'סנכרון דו-כיווני של נתונים',
    estimatedTimeMinutes: 15,
    sections: [
      {
        id: 'sync-systems',
        title: 'Systems to Sync',
        titleHe: 'מערכות לסנכרון',
        order: 1,
        fields: [
          {
            id: 'system_a',
            type: 'text',
            label: 'First System',
            labelHe: 'מערכת ראשונה',
            required: true,
            placeholderHe: 'לדוגמא: Zoho CRM'
          },
          {
            id: 'system_b',
            type: 'text',
            label: 'Second System',
            labelHe: 'מערכת שנייה',
            required: true,
            placeholderHe: 'לדוגמא: Google Sheets'
          },
          {
            id: 'data_types',
            type: 'multiselect',
            label: 'What data should sync?',
            labelHe: 'איזה נתונים צריכים להסתנכרן?',
            required: true,
            options: [
              { value: 'contacts', label: 'Contacts', labelHe: 'אנשי קשר' },
              { value: 'leads', label: 'Leads', labelHe: 'לידים' },
              { value: 'deals', label: 'Deals/Opportunities', labelHe: 'עסקאות/הזדמנויות' },
              { value: 'tasks', label: 'Tasks', labelHe: 'משימות' },
              { value: 'orders', label: 'Orders', labelHe: 'הזמנות' },
              { value: 'products', label: 'Products', labelHe: 'מוצרים' }
            ]
          },
          {
            id: 'sync_frequency',
            type: 'select',
            label: 'How often to sync?',
            labelHe: 'באיזו תדירות לסנכרן?',
            required: true,
            options: [
              { value: 'realtime', label: 'Real-time (instant)', labelHe: 'Real-time (מיידי)' },
              { value: '5min', label: 'Every 5 minutes', labelHe: 'כל 5 דקות' },
              { value: '1hour', label: 'Every hour', labelHe: 'כל שעה' },
              { value: 'daily', label: 'Once per day', labelHe: 'פעם ביום' }
            ]
          },
          {
            id: 'conflict_resolution',
            type: 'radio',
            label: 'If data conflicts, which system wins?',
            labelHe: 'אם יש סתירה בנתונים, איזו מערכת "מנצחת"?',
            required: true,
            options: [
              { value: 'system_a', label: 'System A always wins', labelHe: 'מערכת A תמיד מנצחת' },
              { value: 'system_b', label: 'System B always wins', labelHe: 'מערכת B תמיד מנצחת' },
              { value: 'latest', label: 'Latest update wins', labelHe: 'העדכון האחרון מנצח' },
              { value: 'manual', label: 'Manual review needed', labelHe: 'דרוש סקירה ידנית' }
            ]
          }
        ]
      }
    ]
  },

  // ==================== SYSTEM INTEGRATIONS ====================
  {
    serviceId: 'integration-simple',
    serviceName: 'Simple Integration (2 systems)',
    serviceNameHe: 'אינטגרציה פשוטה (2 מערכות)',
    estimatedTimeMinutes: 12,
    sections: [
      {
        id: 'simple-integration',
        title: 'Integration Details',
        titleHe: 'פרטי האינטגרציה',
        order: 1,
        fields: [
          {
            id: 'source_system',
            type: 'text',
            label: 'Source System (where data comes from)',
            labelHe: 'מערכת מקור (מאיפה הנתונים מגיעים)',
            required: true,
            placeholderHe: 'לדוגמא: Facebook Lead Ads'
          },
          {
            id: 'target_system',
            type: 'text',
            label: 'Target System (where data goes to)',
            labelHe: 'מערכת יעד (לאן הנתונים הולכים)',
            required: true,
            placeholderHe: 'לדוגמא: Zoho CRM'
          },
          {
            id: 'trigger_event',
            type: 'text',
            label: 'What triggers this integration?',
            labelHe: 'מה מפעיל את האינטגרציה?',
            required: true,
            placeholderHe: 'לדוגמא: ליד חדש נוצר, טופס נשלח, הזמנה בוצעה...'
          },
          {
            id: 'data_mapping',
            type: 'list',
            label: 'Field Mapping (Source Field → Target Field)',
            labelHe: 'מיפוי שדות (שדה מקור → שדה יעד)',
            required: true,
            examplesHe: ['שם מלא → Full Name', 'אימייל → Email', 'טלפון → Phone'],
            helperTextHe: 'רשום איזה שדה מהמקור הולך לאיזה שדה ביעד'
          },
          {
            id: 'has_api_access',
            type: 'radio',
            label: 'Do you have API access to both systems?',
            labelHe: 'האם יש לך גישת API לשתי המערכות?',
            required: true,
            options: [
              { value: 'yes', label: 'Yes', labelHe: 'כן' },
              { value: 'no', label: 'No, need help setting up', labelHe: 'לא, צריך עזרה להקים' },
              { value: 'partial', label: 'Only for one system', labelHe: 'רק למערכת אחת' }
            ]
          }
        ]
      }
    ]
  },

  {
    serviceId: 'integration-complex',
    serviceName: 'Complex Integration (3+ systems)',
    serviceNameHe: 'אינטגרציה מורכבת (3+ מערכות)',
    estimatedTimeMinutes: 20,
    sections: [
      {
        id: 'complex-systems',
        title: 'Systems to Integrate',
        titleHe: 'מערכות לאינטגרציה',
        order: 1,
        fields: [
          {
            id: 'systems_list',
            type: 'list',
            label: 'List all systems that need to be connected',
            labelHe: 'רשום את כל המערכות שצריכות להתחבר',
            required: true,
            helperTextHe: 'לפחות 3 מערכות'
          },
          {
            id: 'central_system',
            type: 'text',
            label: 'Central/Hub System (if any)',
            labelHe: 'מערכת מרכזית (אם יש)',
            required: false,
            helperTextHe: 'לדוגמא: CRM שמקבל נתונים מכולם'
          }
        ]
      },
      {
        id: 'complex-flow',
        title: 'Data Flow',
        titleHe: 'זרימת נתונים',
        order: 2,
        fields: [
          {
            id: 'flow_description',
            type: 'textarea',
            label: 'Describe the data flow',
            labelHe: 'תאר את זרימת הנתונים',
            required: true,
            placeholderHe: 'לדוגמא: ליד מגיע מפייסבוק → נכנס ל-CRM → מתעדכן בגוגל שיטס → נשלחת הודעה ב-WhatsApp...',
            rows: 4
          },
          {
            id: 'transformations',
            type: 'checkbox',
            label: 'Need data transformations? (format changes, calculations, enrichment)',
            labelHe: 'צריך טרנספורמציות של נתונים? (שינוי פורמט, חישובים, העשרה)',
            required: false
          },
          {
            id: 'error_handling',
            type: 'radio',
            label: 'Error handling strategy',
            labelHe: 'אסטרטגיית טיפול בשגיאות',
            required: true,
            options: [
              { value: 'retry', label: 'Retry automatically', labelHe: 'נסה שוב אוטומטית' },
              { value: 'alert', label: 'Alert team immediately', labelHe: 'התראה לצוות מיידית' },
              { value: 'log', label: 'Log and continue', labelHe: 'תיעוד והמשך' }
            ]
          }
        ]
      }
    ]
  },

  // ==================== AI AGENT VARIATIONS ====================
  {
    serviceId: 'ai-service-agent',
    serviceName: 'Customer Service AI Agent',
    serviceNameHe: 'סוכן AI לשירות לקוחות',
    estimatedTimeMinutes: 25,
    sections: [
      {
        id: 'service-agent-basics',
        title: 'Basic Setup',
        titleHe: 'הגדרה בסיסית',
        order: 1,
        fields: [
          {
            id: 'agent_name',
            type: 'text',
            label: 'Agent Name',
            labelHe: 'שם הסוכן',
            required: true
          },
          {
            id: 'capabilities',
            type: 'multiselect',
            label: 'What should the agent be able to do?',
            labelHe: 'מה הסוכן צריך להיות מסוגל לעשות?',
            required: true,
            options: [
              { value: 'answer_faq', label: 'Answer FAQs', labelHe: 'ענה על שאלות נפוצות' },
              { value: 'check_status', label: 'Check Order/Ticket Status', labelHe: 'בדוק סטטוס הזמנה/פנייה' },
              { value: 'book_appointment', label: 'Book Appointments', labelHe: 'קבע פגישות' },
              { value: 'process_return', label: 'Process Returns/Refunds', labelHe: 'עבד החזרות/זיכויים' },
              { value: 'update_info', label: 'Update Customer Info', labelHe: 'עדכן מידע לקוח' },
              { value: 'escalate', label: 'Escalate to Human', labelHe: 'העבר לנציג אנושי' }
            ]
          },
          {
            id: 'knowledge_sources',
            type: 'multiselect',
            label: 'Knowledge sources for the agent',
            labelHe: 'מקורות ידע לסוכן',
            required: true,
            options: [
              { value: 'faq', label: 'FAQ Document', labelHe: 'מסמך שאלות נפוצות' },
              { value: 'kb', label: 'Knowledge Base', labelHe: 'בסיס ידע' },
              { value: 'docs', label: 'Product Documentation', labelHe: 'תיעוד מוצרים' },
              { value: 'policies', label: 'Company Policies', labelHe: 'מדיניות החברה' },
              { value: 'crm', label: 'CRM Data (customer history)', labelHe: 'נתוני CRM (היסטוריית לקוח)' }
            ]
          }
        ]
      },
      {
        id: 'service-agent-actions',
        title: 'Actions & Tools',
        titleHe: 'פעולות וכלים',
        order: 2,
        fields: [
          {
            id: 'system_access',
            type: 'multiselect',
            label: 'Which systems should agent access?',
            labelHe: 'לאילו מערכות הסוכן צריך גישה?',
            required: true,
            options: [
              { value: 'crm', label: 'CRM', labelHe: 'CRM' },
              { value: 'ticketing', label: 'Ticketing System', labelHe: 'מערכת פניות' },
              { value: 'orders', label: 'Order Management', labelHe: 'ניהול הזמנות' },
              { value: 'calendar', label: 'Calendar/Scheduling', labelHe: 'לוח שנה/תזמון' },
              { value: 'inventory', label: 'Inventory', labelHe: 'מלאי' }
            ]
          },
          {
            id: 'approval_needed',
            type: 'multiselect',
            label: 'Which actions need human approval?',
            labelHe: 'אילו פעולות דורשות אישור אנושי?',
            required: true,
            options: [
              { value: 'refund', label: 'Issue Refund', labelHe: 'ביצוע זיכוי' },
              { value: 'discount', label: 'Apply Discount', labelHe: 'מתן הנחה' },
              { value: 'cancel', label: 'Cancel Order', labelHe: 'ביטול הזמנה' },
              { value: 'none', label: 'No approval needed (full autonomy)', labelHe: 'אין צורך באישור (אוטונומיה מלאה)' }
            ]
          }
        ]
      }
    ]
  },

  {
    serviceId: 'ai-sales-agent',
    serviceName: 'Sales AI Agent',
    serviceNameHe: 'סוכן AI למכירות',
    estimatedTimeMinutes: 25,
    sections: [
      {
        id: 'sales-agent-basics',
        title: 'Sales Agent Setup',
        titleHe: 'הגדרת סוכן מכירות',
        order: 1,
        fields: [
          {
            id: 'sales_approach',
            type: 'radio',
            label: 'Sales approach',
            labelHe: 'גישת מכירה',
            required: true,
            options: [
              { value: 'consultative', label: 'Consultative (ask questions, understand needs)', labelHe: 'ייעוצית (שאל שאלות, הבן צרכים)' },
              { value: 'direct', label: 'Direct (pitch product quickly)', labelHe: 'ישירה (הצג מוצר מהר)' },
              { value: 'educational', label: 'Educational (teach first, sell second)', labelHe: 'חינוכית (לימד קודם, מכור אחר כך)' }
            ]
          },
          {
            id: 'qualification_questions',
            type: 'list',
            label: 'Qualification questions the agent should ask',
            labelHe: 'שאלות סינון שהסוכן צריך לשאול',
            required: true,
            examplesHe: ['מה התקציב שלך?', 'מתי אתה מעוניין להתחיל?', 'מה הבעיה העיקרית שאתה מנסה לפתור?'],
            helperTextHe: 'שאלות שעוזרות לזהות אם הליד מתאים'
          },
          {
            id: 'products_services',
            type: 'list',
            label: 'Products/Services the agent can sell',
            labelHe: 'מוצרים/שירותים שהסוכן יכול למכור',
            required: true
          },
          {
            id: 'pricing_authority',
            type: 'radio',
            label: 'Pricing authority',
            labelHe: 'סמכות תמחור',
            required: true,
            options: [
              { value: 'fixed', label: 'Fixed prices only', labelHe: 'מחירים קבועים בלבד' },
              { value: 'discount_up_to', label: 'Can offer discount up to X%', labelHe: 'יכול להציע הנחה עד X%' },
              { value: 'custom', label: 'Create custom quotes', labelHe: 'יצירת הצעות מחיר מותאמות' },
              { value: 'none', label: 'No pricing authority (human needed)', labelHe: 'אין סמכות תמחור (דרוש אנושי)' }
            ]
          }
        ]
      },
      {
        id: 'sales-agent-process',
        title: 'Sales Process',
        titleHe: 'תהליך מכירה',
        order: 2,
        fields: [
          {
            id: 'meeting_booking',
            type: 'checkbox',
            label: 'Agent can book sales meetings',
            labelHe: 'הסוכן יכול לקבוע פגישות מכירה',
            required: false
          },
          {
            id: 'send_proposals',
            type: 'checkbox',
            label: 'Agent can send proposals/quotes automatically',
            labelHe: 'הסוכן יכול לשלוח הצעות מחיר אוטומטית',
            required: false
          },
          {
            id: 'followup_strategy',
            type: 'radio',
            label: 'Follow-up strategy for non-responses',
            labelHe: 'אסטרטגיית מעקב עבור מי שלא מגיב',
            required: true,
            options: [
              { value: 'persistent', label: 'Persistent (5-7 touches)', labelHe: 'מתמיד (5-7 מגעים)' },
              { value: 'moderate', label: 'Moderate (3-4 touches)', labelHe: 'מתון (3-4 מגעים)' },
              { value: 'light', label: 'Light (1-2 touches)', labelHe: 'קל (1-2 מגעים)' }
            ]
          },
          {
            id: 'handoff_criteria',
            type: 'multiselect',
            label: 'When to hand off to human sales rep?',
            labelHe: 'מתי להעביר לנציג מכירות אנושי?',
            required: true,
            options: [
              { value: 'high_value', label: 'High-value deal (>$X)', labelHe: 'עסקה בעלת ערך גבוה' },
              { value: 'complex', label: 'Complex requirements', labelHe: 'דרישות מורכבות' },
              { value: 'objections', label: 'Multiple objections', labelHe: 'התנגדויות מרובות' },
              { value: 'request', label: 'Customer requests human', labelHe: 'לקוח מבקש נציג אנושי' }
            ]
          }
        ]
      }
    ]
  },

  // ==================== MORE AUTOMATION SERVICES ====================
  {
    serviceId: 'auto-approval-workflow',
    serviceName: 'Approval Workflows',
    serviceNameHe: 'תהליכי אישור',
    estimatedTimeMinutes: 12,
    sections: [
      {
        id: 'approval-config',
        title: 'Approval Configuration',
        titleHe: 'הגדרת אישורים',
        order: 1,
        fields: [
          {
            id: 'workflow_types',
            type: 'multiselect',
            label: 'What needs approval?',
            labelHe: 'מה דורש אישור?',
            required: true,
            options: [
              { value: 'quotes', label: 'Quotes/Proposals', labelHe: 'הצעות מחיר' },
              { value: 'discounts', label: 'Discounts', labelHe: 'הנחות' },
              { value: 'expenses', label: 'Expenses', labelHe: 'הוצאות' },
              { value: 'purchases', label: 'Purchase Orders', labelHe: 'הזמנות רכש' },
              { value: 'contracts', label: 'Contracts', labelHe: 'חוזים' },
              { value: 'time_off', label: 'Time Off Requests', labelHe: 'בקשות חופשה' }
            ]
          },
          {
            id: 'approval_chain',
            type: 'radio',
            label: 'Approval chain structure',
            labelHe: 'מבנה שרשרת אישורים',
            required: true,
            options: [
              { value: 'single', label: 'Single Approver', labelHe: 'מאשר יחיד' },
              { value: 'sequential', label: 'Sequential (one after another)', labelHe: 'רצף (אחד אחרי השני)' },
              { value: 'parallel', label: 'Parallel (all at once)', labelHe: 'מקבילי (כולם ביחד)' },
              { value: 'conditional', label: 'Conditional (based on amount/type)', labelHe: 'מותנה (לפי סכום/סוג)' }
            ]
          },
          {
            id: 'escalation',
            type: 'checkbox',
            label: 'Auto-escalate if no response in X days',
            labelHe: 'העלאה אוטומטית אם אין תגובה תוך X ימים',
            required: false
          },
          {
            id: 'notification_method',
            type: 'multiselect',
            label: 'How to notify approvers?',
            labelHe: 'איך להתריע למאשרים?',
            required: true,
            options: [
              { value: 'email', label: 'Email', labelHe: 'אימייל' },
              { value: 'sms', label: 'SMS', labelHe: 'SMS' },
              { value: 'slack', label: 'Slack', labelHe: 'Slack' },
              { value: 'whatsapp', label: 'WhatsApp', labelHe: 'WhatsApp' }
            ]
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-form-to-crm',
    serviceName: 'Form Submissions → CRM Auto-Update',
    serviceNameHe: 'הגשות טפסים → עדכון אוטומטי ב-CRM',
    estimatedTimeMinutes: 25,
    tips: [
      'Map all form fields to CRM fields before deployment',
      'Test with sample form submissions to verify data flow',
      'Set up spam protection to avoid polluting your CRM',
      'Configure duplicate detection to prevent multiple records for the same lead'
    ],
    tipsHe: [
      'מפה את כל שדות הטופס לשדות ה-CRM לפני הפעלה',
      'בדוק עם הגשות טופס לדוגמא כדי לוודא זרימת נתונים',
      'הגדר הגנת ספאם כדי להימנע מזיהום ה-CRM',
      'הגדר זיהוי כפילויות כדי למנוע רשומות מרובות עבור אותו ליד'
    ],
    sections: [
      {
        id: 'form-crm-basics',
        title: 'Basic Configuration',
        titleHe: 'הגדרה בסיסית',
        order: 1,
        fields: [
          {
            id: 'form_platform',
            type: 'select',
            label: 'Form Platform',
            labelHe: 'פלטפורמת טפסים',
            required: true,
            options: [
              { value: 'wix', label: 'Wix Forms', labelHe: 'טפסי Wix' },
              { value: 'wordpress', label: 'WordPress (Contact Form 7, Gravity Forms)', labelHe: 'WordPress (Contact Form 7, Gravity Forms)' },
              { value: 'elementor', label: 'Elementor Forms', labelHe: 'טפסי Elementor' },
              { value: 'typeform', label: 'Typeform', labelHe: 'Typeform' },
              { value: 'google_forms', label: 'Google Forms', labelHe: 'Google Forms' },
              { value: 'jotform', label: 'JotForm', labelHe: 'JotForm' },
              { value: 'custom', label: 'Custom HTML Form', labelHe: 'טופס HTML מותאם' }
            ]
          },
          {
            id: 'form_url',
            type: 'text',
            label: 'Form URL',
            labelHe: 'כתובת הטופס',
            required: true,
            placeholderHe: 'https://example.com/contact-us',
            helperTextHe: 'הכתובת המלאה של הטופס באתר'
          },
          {
            id: 'webhook_support',
            type: 'radio',
            label: 'Does your form platform support webhooks?',
            labelHe: 'האם פלטפורמת הטפסים תומכת ב-webhooks?',
            required: true,
            options: [
              { value: 'yes', label: 'Yes, native webhook support', labelHe: 'כן, תמיכה מקורית ב-webhooks' },
              { value: 'plugin_required', label: 'Yes, with a plugin/add-on', labelHe: 'כן, עם plugin/תוסף' },
              { value: 'no', label: 'No, need polling/integration workaround', labelHe: 'לא, צריך polling/פתרון חלופי' }
            ],
            helperTextHe: 'Webhooks מאפשרים עדכון מיידי ב-CRM כשטופס מוגש'
          },
          {
            id: 'crm_system',
            type: 'select',
            label: 'CRM System',
            labelHe: 'מערכת CRM',
            required: true,
            options: [
              { value: 'zoho', label: 'Zoho CRM', labelHe: 'Zoho CRM' },
              { value: 'salesforce', label: 'Salesforce', labelHe: 'Salesforce' },
              { value: 'hubspot', label: 'HubSpot', labelHe: 'HubSpot' },
              { value: 'pipedrive', label: 'Pipedrive', labelHe: 'Pipedrive' },
              { value: 'monday', label: 'Monday.com', labelHe: 'Monday.com' },
              { value: 'other', label: 'Other', labelHe: 'אחר' }
            ]
          },
          {
            id: 'crm_credentials_ready',
            type: 'checkbox',
            label: 'CRM API credentials are ready',
            labelHe: 'קרדנשיאלים ל-API של ה-CRM מוכנים',
            required: false,
            helperTextHe: 'Client ID, Client Secret, API Key או Refresh Token'
          },
          {
            id: 'crm_module',
            type: 'select',
            label: 'Create form submissions as:',
            labelHe: 'צור הגשות טופס בתור:',
            required: true,
            options: [
              { value: 'leads', label: 'Leads', labelHe: 'לידים' },
              { value: 'contacts', label: 'Contacts', labelHe: 'אנשי קשר' },
              { value: 'accounts', label: 'Accounts', labelHe: 'חשבונות' },
              { value: 'deals', label: 'Deals/Opportunities', labelHe: 'עסקאות/הזדמנויות' },
              { value: 'custom', label: 'Custom Module', labelHe: 'מודול מותאם' }
            ]
          }
        ]
      },
      {
        id: 'form-crm-field-mapping',
        title: 'Field Mapping',
        titleHe: 'מיפוי שדות',
        description: 'Map form fields to CRM fields',
        descriptionHe: 'מפה שדות טופס לשדות CRM',
        order: 2,
        fields: [
          {
            id: 'form_fields_list',
            type: 'list',
            label: 'List all form fields',
            labelHe: 'רשום את כל שדות הטופס',
            required: true,
            placeholderHe: 'לדוגמא: שם מלא, אימייל, טלפון, הודעה...',
            helperTextHe: 'רשום את כל השדות שהטופס אוסף'
          },
          {
            id: 'crm_fields_ready',
            type: 'checkbox',
            label: 'CRM fields are configured and ready',
            labelHe: 'שדות ה-CRM מוגדרים ומוכנים',
            required: false,
            helperTextHe: 'האם ה-CRM כבר מכיל את כל השדות הנדרשים?'
          },
          {
            id: 'field_mapping_document',
            type: 'textarea',
            label: 'Field Mapping (Form Field → CRM Field)',
            labelHe: 'מיפוי שדות (שדה טופס → שדה CRM)',
            required: true,
            placeholderHe: 'לדוגמא:\nשם מלא → Full_Name\nאימייל → Email\nטלפון → Phone\nחברה → Company',
            helperTextHe: 'כל שורה: שדה טופס ← חץ ← שדה CRM'
          },
          {
            id: 'require_field_transformation',
            type: 'checkbox',
            label: 'Need data transformation (formatting, cleaning)',
            labelHe: 'צריך טרנספורמציה של נתונים (עיצוב, ניקוי)',
            required: false,
            helperTextHe: 'לדוגמא: עיצוב טלפון (+972...), תאריך, אותיות גדולות/קטנות'
          }
        ]
      },
      {
        id: 'form-crm-duplicate-handling',
        title: 'Duplicate Detection',
        titleHe: 'זיהוי כפילויות',
        order: 3,
        fields: [
          {
            id: 'duplicate_detection_enabled',
            type: 'checkbox',
            label: 'Enable duplicate detection',
            labelHe: 'אפשר זיהוי כפילויות',
            required: false,
            helperTextHe: 'בודק אם ליד/איש קשר כבר קיים לפני יצירת רשומה חדשה'
          },
          {
            id: 'duplicate_check_field',
            type: 'radio',
            label: 'Check duplicates by:',
            labelHe: 'בדוק כפילויות לפי:',
            required: false,
            dependsOn: { fieldId: 'duplicate_detection_enabled', value: ['true'] },
            options: [
              { value: 'email', label: 'Email Address', labelHe: 'כתובת אימייל' },
              { value: 'phone', label: 'Phone Number', labelHe: 'מספר טלפון' },
              { value: 'company', label: 'Company Name', labelHe: 'שם חברה' },
              { value: 'custom', label: 'Custom Field', labelHe: 'שדה מותאם' }
            ]
          },
          {
            id: 'duplicate_strategy',
            type: 'radio',
            label: 'What to do when duplicate found?',
            labelHe: 'מה לעשות כשנמצאה כפילות?',
            required: false,
            dependsOn: { fieldId: 'duplicate_detection_enabled', value: ['true'] },
            options: [
              { value: 'update_existing', label: 'Update existing record', labelHe: 'עדכן רשומה קיימת' },
              { value: 'skip', label: 'Skip (don\'t create)', labelHe: 'דלג (אל תיצור)' },
              { value: 'create_new', label: 'Create new anyway', labelHe: 'צור חדש בכל מקרה' },
              { value: 'merge', label: 'Merge data into existing', labelHe: 'מזג נתונים לקיים' }
            ]
          }
        ]
      },
      {
        id: 'form-crm-validation',
        title: 'Data Validation',
        titleHe: 'וולידציה של נתונים',
        description: 'Prevent invalid data from entering your CRM',
        descriptionHe: 'מנע נתונים לא תקינים מלהיכנס ל-CRM',
        order: 4,
        fields: [
          {
            id: 'email_validation',
            type: 'checkbox',
            label: 'Validate email format',
            labelHe: 'וולידציה של פורמט אימייל',
            required: false,
            helperTextHe: 'בודק שכתובת האימייל תקינה לפני יצירת רשומה'
          },
          {
            id: 'phone_validation',
            type: 'checkbox',
            label: 'Validate phone number format',
            labelHe: 'וולידציה של פורמט טלפון',
            required: false
          },
          {
            id: 'phone_format',
            type: 'radio',
            label: 'Required phone format:',
            labelHe: 'פורמט טלפון נדרש:',
            required: false,
            dependsOn: { fieldId: 'phone_validation', value: ['true'] },
            options: [
              { value: 'international', label: 'International (+972...)', labelHe: 'בינלאומי (+972...)' },
              { value: 'local', label: 'Local (0501234567)', labelHe: 'מקומי (0501234567)' },
              { value: 'any', label: 'Any format (will normalize)', labelHe: 'כל פורמט (ינרמל)' }
            ]
          },
          {
            id: 'required_fields',
            type: 'multiselect',
            label: 'Which fields are required?',
            labelHe: 'אילו שדות חובה?',
            required: false,
            options: [
              { value: 'email', label: 'Email', labelHe: 'אימייל' },
              { value: 'phone', label: 'Phone', labelHe: 'טלפון' },
              { value: 'name', label: 'Full Name', labelHe: 'שם מלא' },
              { value: 'company', label: 'Company', labelHe: 'חברה' },
              { value: 'message', label: 'Message/Details', labelHe: 'הודעה/פרטים' }
            ],
            helperTextHe: 'אם שדה חובה חסר, ההגשה תדחה'
          }
        ]
      },
      {
        id: 'form-crm-spam-protection',
        title: 'Spam Protection',
        titleHe: 'הגנת ספאם',
        description: 'Prevent bot submissions from polluting your CRM',
        descriptionHe: 'מנע הגשות בוטים מלזהם את ה-CRM',
        order: 5,
        fields: [
          {
            id: 'captcha_enabled',
            type: 'checkbox',
            label: 'Enable CAPTCHA on form',
            labelHe: 'אפשר CAPTCHA בטופס',
            required: false,
            helperTextHe: 'Google reCAPTCHA, hCaptcha או Cloudflare Turnstile'
          },
          {
            id: 'captcha_type',
            type: 'select',
            label: 'CAPTCHA Type',
            labelHe: 'סוג CAPTCHA',
            required: false,
            dependsOn: { fieldId: 'captcha_enabled', value: ['true'] },
            options: [
              { value: 'recaptcha', label: 'Google reCAPTCHA v3', labelHe: 'Google reCAPTCHA v3' },
              { value: 'hcaptcha', label: 'hCaptcha', labelHe: 'hCaptcha' },
              { value: 'turnstile', label: 'Cloudflare Turnstile', labelHe: 'Cloudflare Turnstile' }
            ]
          },
          {
            id: 'honeypot_field',
            type: 'checkbox',
            label: 'Add honeypot field (hidden spam trap)',
            labelHe: 'הוסף שדה honeypot (מלכודת ספאם נסתרת)',
            required: false,
            helperTextHe: 'שדה נסתר שבוטים ממלאים ובני אדם לא'
          },
          {
            id: 'suspicious_pattern_detection',
            type: 'checkbox',
            label: 'Detect suspicious patterns (gibberish, repeated characters)',
            labelHe: 'זהה דפוסים חשודים (שטויות, תווים חוזרים)',
            required: false
          }
        ]
      },
      {
        id: 'form-crm-error-handling',
        title: 'Error Handling & Retry',
        titleHe: 'טיפול בשגיאות וניסיונות חוזרים',
        order: 6,
        fields: [
          {
            id: 'error_notification_email',
            type: 'text',
            label: 'Send error notifications to:',
            labelHe: 'שלח התראות שגיאה ל:',
            required: true,
            placeholderHe: 'admin@example.com',
            helperTextHe: 'כתובת אימייל לקבלת התראות כשסנכרון נכשל'
          },
          {
            id: 'retry_attempts',
            type: 'number',
            label: 'Number of retry attempts if sync fails',
            labelHe: 'מספר ניסיונות חוזרים אם סנכרון נכשל',
            required: true,
            validation: { min: 1, max: 10 },
            placeholder: '3',
            helperTextHe: 'כמה פעמים לנסות שוב לפני שליחת שגיאה'
          },
          {
            id: 'retry_delay',
            type: 'number',
            label: 'Delay between retries (seconds)',
            labelHe: 'עיכוב בין ניסיונות (שניות)',
            required: true,
            validation: { min: 5, max: 300 },
            placeholder: '30',
            helperTextHe: 'כמה זמן לחכות לפני ניסיון חוזר'
          },
          {
            id: 'log_failed_submissions',
            type: 'checkbox',
            label: 'Log failed submissions for manual review',
            labelHe: 'תעד הגשות שנכשלו לבדיקה ידנית',
            required: false,
            helperTextHe: 'שמור הגשות שנכשלו כדי לטפל בהן מאוחר יותר'
          },
          {
            id: 'fallback_action',
            type: 'select',
            label: 'Fallback action if all retries fail:',
            labelHe: 'פעולת גיבוי אם כל הניסיונות נכשלו:',
            required: true,
            options: [
              { value: 'queue', label: 'Queue for later processing', labelHe: 'תור לעיבוד מאוחר יותר' },
              { value: 'email_admin', label: 'Email admin with submission data', labelHe: 'שלח אימייל למנהל עם הנתונים' },
              { value: 'save_to_spreadsheet', label: 'Save to Google Sheets/Excel', labelHe: 'שמור ב-Google Sheets/Excel' }
            ]
          }
        ]
      },
      {
        id: 'form-crm-success-actions',
        title: 'Success Actions',
        titleHe: 'פעולות הצלחה',
        description: 'What happens after successful form submission',
        descriptionHe: 'מה קורה אחרי הגשת טופס מוצלחת',
        order: 7,
        fields: [
          {
            id: 'send_confirmation_email',
            type: 'checkbox',
            label: 'Send confirmation email to lead',
            labelHe: 'שלח אימייל אישור ללקוח',
            required: false,
            helperTextHe: 'אימייל אוטומטי "קיבלנו את פנייתך"'
          },
          {
            id: 'redirect_url',
            type: 'text',
            label: 'Redirect to URL after submission',
            labelHe: 'הפנה לכתובת אחרי הגשה',
            required: false,
            placeholderHe: 'https://example.com/thank-you',
            helperTextHe: 'דף תודה או דף נחיתה'
          },
          {
            id: 'auto_assign_sales_rep',
            type: 'checkbox',
            label: 'Auto-assign to sales rep in CRM',
            labelHe: 'הקצאה אוטומטית לנציג מכירות ב-CRM',
            required: false,
            helperTextHe: 'מחלק לידים באופן אוטומטי לצוות המכירות'
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-document-generation',
    serviceName: 'Document Automation (Contracts/Invoices)',
    serviceNameHe: 'אוטומציית מסמכים (חוזים/חשבוניות)',
    estimatedTimeMinutes: 15,
    sections: [
      {
        id: 'doc-types',
        title: 'Document Types',
        titleHe: 'סוגי מסמכים',
        order: 1,
        fields: [
          {
            id: 'document_types',
            type: 'multiselect',
            label: 'What documents to automate?',
            labelHe: 'אילו מסמכים לאוטומט?',
            required: true,
            options: [
              { value: 'quotes', label: 'Quotes/Proposals', labelHe: 'הצעות מחיר' },
              { value: 'contracts', label: 'Contracts', labelHe: 'חוזים' },
              { value: 'invoices', label: 'Invoices', labelHe: 'חשבוניות' },
              { value: 'receipts', label: 'Receipts', labelHe: 'קבלות' },
              { value: 'reports', label: 'Reports', labelHe: 'דוחות' },
              { value: 'certificates', label: 'Certificates', labelHe: 'תעודות' }
            ]
          },
          {
            id: 'template_exists',
            type: 'radio',
            label: 'Do you have existing templates?',
            labelHe: 'האם יש לך תבניות קיימות?',
            required: true,
            options: [
              { value: 'yes', label: 'Yes, I have Word/PDF templates', labelHe: 'כן, יש לי תבניות Word/PDF' },
              { value: 'no', label: 'No, need to create templates', labelHe: 'לא, צריך ליצור תבניות' }
            ]
          }
        ]
      },
      {
        id: 'doc-process',
        title: 'Process',
        titleHe: 'תהליך',
        order: 2,
        fields: [
          {
            id: 'data_source',
            type: 'text',
            label: 'Where does document data come from?',
            labelHe: 'מאיפה מגיע מידע למסמך?',
            required: true,
            placeholderHe: 'לדוגמא: CRM, Google Sheets, טופס...'
          },
          {
            id: 'trigger',
            type: 'text',
            label: 'When to generate document?',
            labelHe: 'מתי ליצור מסמך?',
            required: true,
            placeholderHe: 'לדוגמא: כשעסקה מגיעה לשלב "הצעת מחיר נשלחה"'
          },
          {
            id: 'delivery',
            type: 'multiselect',
            label: 'How to deliver generated document?',
            labelHe: 'איך למסור מסמך שנוצר?',
            required: true,
            options: [
              { value: 'email', label: 'Email to Customer', labelHe: 'אימייל ללקוח' },
              { value: 'whatsapp', label: 'WhatsApp', labelHe: 'WhatsApp' },
              { value: 'crm', label: 'Attach to CRM Record', labelHe: 'צרף לרשומה ב-CRM' },
              { value: 'drive', label: 'Save to Google Drive', labelHe: 'שמור ב-Google Drive' },
              { value: 'signature', label: 'Send for Digital Signature', labelHe: 'שלח לחתימה דיגיטלית' }
            ]
          },
          {
            id: 'e_signature',
            type: 'checkbox',
            label: 'Integrate with e-signature platform (DocuSign, etc.)',
            labelHe: 'אינטגרציה עם פלטפורמת חתימה דיגיטלית',
            required: false
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-meeting-scheduler',
    serviceName: 'Smart Meeting Scheduler',
    serviceNameHe: 'תזמון פגישות חכם',
    estimatedTimeMinutes: 12,
    sections: [
      {
        id: 'scheduler-config',
        title: 'Scheduler Configuration',
        titleHe: 'הגדרת תזמון',
        order: 1,
        fields: [
          {
            id: 'meeting_types',
            type: 'list',
            label: 'Types of meetings to schedule',
            labelHe: 'סוגי פגישות לתזמון',
            required: true,
            examplesHe: ['פגישת היכרות (15 דקות)', 'פגישת מכירה (30 דקות)', 'פגישת דמו (45 דקות)']
          },
          {
            id: 'calendar_system',
            type: 'radio',
            label: 'Calendar system',
            labelHe: 'מערכת לוח שנה',
            required: true,
            options: [
              { value: 'google', label: 'Google Calendar', labelHe: 'Google Calendar' },
              { value: 'outlook', label: 'Outlook Calendar', labelHe: 'Outlook Calendar' },
              { value: 'both', label: 'Both', labelHe: 'שניהם' }
            ]
          },
          {
            id: 'availability',
            type: 'text',
            label: 'Default availability hours',
            labelHe: 'שעות זמינות ברירת מחדל',
            required: true,
            placeholderHe: 'לדוגמא: א\'-ה\' 9:00-17:00'
          },
          {
            id: 'buffer_time',
            type: 'number',
            label: 'Buffer time between meetings (minutes)',
            labelHe: 'זמן מרווח בין פגישות (דקות)',
            required: true,
            validation: { min: 0, max: 60 }
          },
          {
            id: 'confirmations',
            type: 'multiselect',
            label: 'Send confirmations/reminders via:',
            labelHe: 'שלח אישורים/תזכורות דרך:',
            required: true,
            options: [
              { value: 'email', label: 'Email', labelHe: 'אימייל' },
              { value: 'sms', label: 'SMS', labelHe: 'SMS' },
              { value: 'whatsapp', label: 'WhatsApp', labelHe: 'WhatsApp' }
            ]
          },
          {
            id: 'video_integration',
            type: 'radio',
            label: 'Video conferencing',
            labelHe: 'שיחות וידאו',
            required: false,
            options: [
              { value: 'zoom', label: 'Zoom', labelHe: 'Zoom' },
              { value: 'meet', label: 'Google Meet', labelHe: 'Google Meet' },
              { value: 'teams', label: 'Microsoft Teams', labelHe: 'Microsoft Teams' },
              { value: 'none', label: 'Not needed', labelHe: 'לא נדרש' }
            ]
          }
        ]
      }
    ]
  },

  // ==================== REPORTING & ANALYTICS ====================
  {
    serviceId: 'reports-automated',
    serviceName: 'Automated Reports & Dashboards',
    serviceNameHe: 'דוחות ודשבורדים אוטומטיים',
    estimatedTimeMinutes: 20,
    sections: [
      {
        id: 'report-types',
        title: 'Report Types',
        titleHe: 'סוגי דוחות',
        order: 1,
        fields: [
          {
            id: 'reports_needed',
            type: 'multiselect',
            label: 'What reports do you need?',
            labelHe: 'אילו דוחות אתה צריך?',
            required: true,
            options: [
              { value: 'sales', label: 'Sales Performance', labelHe: 'ביצועי מכירות' },
              { value: 'leads', label: 'Lead Sources & Conversion', labelHe: 'מקורות לידים והמרות' },
              { value: 'pipeline', label: 'Sales Pipeline Status', labelHe: 'סטטוס צינור מכירות' },
              { value: 'customer', label: 'Customer Service Metrics', labelHe: 'מדדי שירות לקוחות' },
              { value: 'operations', label: 'Operations/Efficiency', labelHe: 'תפעול/יעילות' },
              { value: 'financial', label: 'Financial Summary', labelHe: 'סיכום פיננסי' },
              { value: 'marketing', label: 'Marketing ROI', labelHe: 'תשואת השקעה שיווקית' }
            ]
          },
          {
            id: 'frequency',
            type: 'multiselect',
            label: 'Report frequency',
            labelHe: 'תדירות דוחות',
            required: true,
            options: [
              { value: 'daily', label: 'Daily', labelHe: 'יומי' },
              { value: 'weekly', label: 'Weekly', labelHe: 'שבועי' },
              { value: 'monthly', label: 'Monthly', labelHe: 'חודשי' },
              { value: 'quarterly', label: 'Quarterly', labelHe: 'רבעוני' },
              { value: 'on_demand', label: 'On-Demand', labelHe: 'לפי דרישה' }
            ]
          }
        ]
      },
      {
        id: 'report-data',
        title: 'Data Sources',
        titleHe: 'מקורות נתונים',
        order: 2,
        fields: [
          {
            id: 'data_sources',
            type: 'multiselect',
            label: 'Where does report data come from?',
            labelHe: 'מאיפה מגיעים נתוני הדוח?',
            required: true,
            options: [
              { value: 'crm', label: 'CRM', labelHe: 'CRM' },
              { value: 'sheets', label: 'Google Sheets', labelHe: 'Google Sheets' },
              { value: 'accounting', label: 'Accounting Software', labelHe: 'תוכנת הנהלת חשבונות' },
              { value: 'analytics', label: 'Google Analytics', labelHe: 'Google Analytics' },
              { value: 'ads', label: 'Facebook/Google Ads', labelHe: 'פייסבוק/גוגל Ads' },
              { value: 'other', label: 'Other Systems', labelHe: 'מערכות אחרות' }
            ]
          },
          {
            id: 'kpi_tracking',
            type: 'list',
            label: 'Key KPIs to track',
            labelHe: 'KPIs עיקריים למעקב',
            required: true,
            examplesHe: ['מספר לידים חדשים', 'אחוז המרה', 'זמן תגובה ממוצע', 'הכנסות חודשיות']
          }
        ]
      },
      {
        id: 'report-delivery',
        title: 'Report Delivery',
        titleHe: 'משלוח דוחות',
        order: 3,
        fields: [
          {
            id: 'delivery_method',
            type: 'multiselect',
            label: 'How to deliver reports?',
            labelHe: 'איך למסור דוחות?',
            required: true,
            options: [
              { value: 'email', label: 'Email (PDF/Excel)', labelHe: 'אימייל (PDF/Excel)' },
              { value: 'dashboard', label: 'Live Dashboard (web link)', labelHe: 'דשבורד חי (קישור)' },
              { value: 'slack', label: 'Slack Channel', labelHe: 'ערוץ Slack' },
              { value: 'drive', label: 'Google Drive Folder', labelHe: 'תיקיית Google Drive' }
            ]
          },
          {
            id: 'recipients',
            type: 'text',
            label: 'Who should receive reports?',
            labelHe: 'מי צריך לקבל דוחות?',
            required: true,
            placeholderHe: 'לדוגמא: מנכ"ל, מנהל מכירות, צוות הנהלה...'
          },
          {
            id: 'interactive_dashboard',
            type: 'checkbox',
            label: 'Create interactive dashboard (drill-down, filters)',
            labelHe: 'צור דשבורד אינטראקטיבי (ניתוח מעמיק, פילטרים)',
            required: false
          }
        ]
      }
    ]
  },

  // ==================== SYSTEM IMPLEMENTATIONS ====================
  {
    serviceId: 'impl-marketing-automation',
    serviceName: 'Marketing Automation Setup',
    serviceNameHe: 'הקמת אוטומציית שיווק',
    estimatedTimeMinutes: 25,
    sections: [
      {
        id: 'marketing-platform',
        title: 'Platform Selection',
        titleHe: 'בחירת פלטפורמה',
        order: 1,
        fields: [
          {
            id: 'platform_preference',
            type: 'radio',
            label: 'Preferred marketing platform',
            labelHe: 'פלטפורמת שיווק מועדפת',
            required: true,
            options: [
              { value: 'hubspot', label: 'HubSpot', labelHe: 'HubSpot' },
              { value: 'mailchimp', label: 'Mailchimp', labelHe: 'Mailchimp' },
              { value: 'activecampaign', label: 'ActiveCampaign', labelHe: 'ActiveCampaign' },
              { value: 'recommend', label: 'Need recommendation', labelHe: 'צריך המלצה' }
            ]
          },
          {
            id: 'list_size',
            type: 'select',
            label: 'Approximate contact list size',
            labelHe: 'גודל רשימת אנשי קשר משוער',
            required: true,
            options: [
              { value: 'under_1000', label: 'Under 1,000', labelHe: 'מתחת 1,000' },
              { value: '1000-5000', label: '1,000-5,000', labelHe: '1,000-5,000' },
              { value: '5000-20000', label: '5,000-20,000', labelHe: '5,000-20,000' },
              { value: 'over_20000', label: 'Over 20,000', labelHe: 'מעל 20,000' }
            ]
          }
        ]
      },
      {
        id: 'marketing-campaigns',
        title: 'Campaign Types',
        titleHe: 'סוגי קמפיינים',
        order: 2,
        fields: [
          {
            id: 'campaign_types',
            type: 'multiselect',
            label: 'What campaigns to automate?',
            labelHe: 'אילו קמפיינים לאוטומט?',
            required: true,
            options: [
              { value: 'welcome', label: 'Welcome Series', labelHe: 'סדרת ברוכים הבאים' },
              { value: 'nurture', label: 'Lead Nurturing', labelHe: 'טיפוח לידים' },
              { value: 'promotional', label: 'Promotional Campaigns', labelHe: 'קמפיינים פרומוטיביים' },
              { value: 'abandoned', label: 'Abandoned Cart', labelHe: 'עגלה נטושה' },
              { value: 'reengagement', label: 'Re-engagement', labelHe: 'שיווק חוזר' },
              { value: 'newsletter', label: 'Newsletter', labelHe: 'ניוזלטר' }
            ]
          },
          {
            id: 'segmentation',
            type: 'multiselect',
            label: 'How to segment audience?',
            labelHe: 'איך לפלח קהל?',
            required: true,
            options: [
              { value: 'behavior', label: 'By Behavior (clicks, opens)', labelHe: 'לפי התנהגות' },
              { value: 'demographics', label: 'Demographics', labelHe: 'דמוגרפיה' },
              { value: 'lead_score', label: 'Lead Score', labelHe: 'ניקוד ליד' },
              { value: 'purchase_history', label: 'Purchase History', labelHe: 'היסטוריית רכישות' },
              { value: 'stage', label: 'Sales Stage', labelHe: 'שלב מכירה' }
            ]
          },
          {
            id: 'personalization',
            type: 'checkbox',
            label: 'Dynamic content personalization',
            labelHe: 'התאמה אישית דינמית של תוכן',
            required: false,
            helperTextHe: 'תוכן משתנה לפי פרופיל המקבל'
          }
        ]
      },
      {
        id: 'marketing-integration',
        title: 'Integrations',
        titleHe: 'אינטגרציות',
        order: 3,
        fields: [
          {
            id: 'crm_sync',
            type: 'checkbox',
            label: 'Sync with CRM',
            labelHe: 'סנכרון עם CRM',
            required: false
          },
          {
            id: 'analytics_tracking',
            type: 'checkbox',
            label: 'Track ROI & attribution',
            labelHe: 'עקוב אחר ROI וייחוס',
            required: false
          }
        ]
      }
    ]
  },

  {
    serviceId: 'impl-project-management',
    serviceName: 'Project Management System',
    serviceNameHe: 'מערכת ניהול פרויקטים',
    estimatedTimeMinutes: 20,
    sections: [
      {
        id: 'pm-platform',
        title: 'Platform',
        titleHe: 'פלטפורמה',
        order: 1,
        fields: [
          {
            id: 'platform',
            type: 'radio',
            label: 'Project management platform',
            labelHe: 'פלטפורמת ניהול פרויקטים',
            required: true,
            options: [
              { value: 'asana', label: 'Asana', labelHe: 'Asana' },
              { value: 'monday', label: 'Monday.com', labelHe: 'Monday.com' },
              { value: 'clickup', label: 'ClickUp', labelHe: 'ClickUp' },
              { value: 'notion', label: 'Notion', labelHe: 'Notion' },
              { value: 'recommend', label: 'Need recommendation', labelHe: 'צריך המלצה' }
            ]
          },
          {
            id: 'team_size',
            type: 'number',
            label: 'Number of team members',
            labelHe: 'מספר חברי צוות',
            required: true,
            validation: { min: 1, max: 500 }
          }
        ]
      },
      {
        id: 'pm-features',
        title: 'Features Needed',
        titleHe: 'תכונות נדרשות',
        order: 2,
        fields: [
          {
            id: 'features',
            type: 'multiselect',
            label: 'What features do you need?',
            labelHe: 'אילו תכונות אתה צריך?',
            required: true,
            options: [
              { value: 'tasks', label: 'Task Management', labelHe: 'ניהול משימות' },
              { value: 'timeline', label: 'Timeline/Gantt Chart', labelHe: 'ציר זמן/גנט' },
              { value: 'resources', label: 'Resource Allocation', labelHe: 'הקצאת משאבים' },
              { value: 'time_tracking', label: 'Time Tracking', labelHe: 'מעקב זמן' },
              { value: 'docs', label: 'Documentation', labelHe: 'תיעוד' },
              { value: 'reporting', label: 'Progress Reports', labelHe: 'דוחות התקדמות' }
            ]
          },
          {
            id: 'automation_needs',
            type: 'multiselect',
            label: 'What to automate?',
            labelHe: 'מה לאוטומט?',
            required: false,
            options: [
              { value: 'task_creation', label: 'Auto-create tasks from templates', labelHe: 'יצירת משימות אוטומטית מתבניות' },
              { value: 'assignments', label: 'Auto-assign tasks', labelHe: 'הקצאת משימות אוטומטית' },
              { value: 'notifications', label: 'Smart notifications', labelHe: 'התראות חכמות' },
              { value: 'status_updates', label: 'Status updates from other systems', labelHe: 'עדכוני סטטוס ממערכות אחרות' }
            ]
          }
        ]
      }
    ]
  },

  // ==================== DATA & ANALYTICS ====================
  {
    serviceId: 'data-cleanup',
    serviceName: 'Data Cleanup & Deduplication',
    serviceNameHe: 'ניקוי והסרת כפילויות בנתונים',
    estimatedTimeMinutes: 15,
    sections: [
      {
        id: 'data-scope',
        title: 'Data Scope',
        titleHe: 'היקף הנתונים',
        order: 1,
        fields: [
          {
            id: 'data_location',
            type: 'text',
            label: 'Where is the data stored?',
            labelHe: 'איפה הנתונים מאוחסנים?',
            required: true,
            placeholderHe: 'לדוגמא: Zoho CRM, Google Sheets, Excel...'
          },
          {
            id: 'record_count',
            type: 'select',
            label: 'Approximate number of records',
            labelHe: 'מספר רשומות משוער',
            required: true,
            options: [
              { value: 'under_1000', label: 'Under 1,000', labelHe: 'מתחת 1,000' },
              { value: '1000-10000', label: '1,000-10,000', labelHe: '1,000-10,000' },
              { value: '10000-50000', label: '10,000-50,000', labelHe: '10,000-50,000' },
              { value: 'over_50000', label: 'Over 50,000', labelHe: 'מעל 50,000' }
            ]
          },
          {
            id: 'issues',
            type: 'multiselect',
            label: 'What data issues exist?',
            labelHe: 'אילו בעיות נתונים קיימות?',
            required: true,
            options: [
              { value: 'duplicates', label: 'Duplicate Records', labelHe: 'רשומות כפולות' },
              { value: 'incomplete', label: 'Incomplete Data', labelHe: 'נתונים חלקיים' },
              { value: 'formatting', label: 'Inconsistent Formatting', labelHe: 'פורמט לא אחיד' },
              { value: 'outdated', label: 'Outdated Information', labelHe: 'מידע לא מעודכן' },
              { value: 'invalid', label: 'Invalid Data (bad emails/phones)', labelHe: 'נתונים לא תקינים' }
            ]
          }
        ]
      },
      {
        id: 'cleanup-actions',
        title: 'Cleanup Actions',
        titleHe: 'פעולות ניקוי',
        order: 2,
        fields: [
          {
            id: 'merge_strategy',
            type: 'radio',
            label: 'Duplicate merge strategy',
            labelHe: 'אסטרטגיית מיזוג כפילויות',
            required: true,
            options: [
              { value: 'auto', label: 'Auto-merge (keep most complete)', labelHe: 'מיזוג אוטומטי (שמור הכי מלא)' },
              { value: 'manual', label: 'Flag for manual review', labelHe: 'סמן לבדיקה ידנית' },
              { value: 'rules', label: 'Custom merge rules', labelHe: 'כללי מיזוג מותאמים' }
            ]
          },
          {
            id: 'validation',
            type: 'checkbox',
            label: 'Validate email addresses and phone numbers',
            labelHe: 'אמת כתובות אימייל ומספרי טלפון',
            required: false
          },
          {
            id: 'enrichment',
            type: 'checkbox',
            label: 'Enrich missing data from external sources',
            labelHe: 'השלם נתונים חסרים ממקורות חיצוניים',
            required: false
          }
        ]
      }
    ]
  },

  // ==================== ADVANCED AI AGENTS ====================
  {
    serviceId: 'ai-complex-workflow',
    serviceName: 'AI Agent with Complex Workflows',
    serviceNameHe: 'סוכן AI עם תהליכי עבודה מורכבים',
    estimatedTimeMinutes: 30,
    sections: [
      {
        id: 'complex-ai-purpose',
        title: 'Agent Purpose',
        titleHe: 'מטרת הסוכן',
        order: 1,
        fields: [
          {
            id: 'purpose_description',
            type: 'textarea',
            label: 'Describe what this AI agent should do',
            labelHe: 'תאר מה סוכן ה-AI הזה צריך לעשות',
            required: true,
            rows: 4,
            placeholderHe: 'לדוגמא: לנהל תהליך מורכב של אישורי קרדיט, תיאום בין מספר מחלקות, עיבוד הזמנות מותאמות אישית...'
          },
          {
            id: 'complexity_level',
            type: 'radio',
            label: 'Complexity level',
            labelHe: 'רמת מורכבות',
            required: true,
            options: [
              { value: 'medium', label: 'Medium (3-5 decision points)', labelHe: 'בינונית (3-5 נקודות החלטה)' },
              { value: 'high', label: 'High (6-10 decision points)', labelHe: 'גבוהה (6-10 נקודות החלטה)' },
              { value: 'very_high', label: 'Very High (10+ decision points)', labelHe: 'מאוד גבוהה (10+ נקודות החלטה)' }
            ]
          }
        ]
      },
      {
        id: 'complex-ai-workflow',
        title: 'Workflow Steps',
        titleHe: 'שלבי התהליך',
        order: 2,
        fields: [
          {
            id: 'workflow_steps',
            type: 'list',
            label: 'List main workflow steps',
            labelHe: 'רשום שלבים עיקריים בתהליך',
            required: true,
            helperTextHe: 'לכל שלב יכולות להיות תת-החלטות ופעולות'
          },
          {
            id: 'decision_logic',
            type: 'textarea',
            label: 'Decision logic and conditions',
            labelHe: 'לוגיקת החלטות ותנאים',
            required: true,
            rows: 4,
            placeholderHe: 'לדוגמא: אם סכום > 10,000₪ → דרוש אישור מנהל\nאם לקוח VIP → העבר לנציג בכיר\nאם מלאי < 10 → התראה לרכש'
          },
          {
            id: 'systems_involved',
            type: 'list',
            label: 'Systems/APIs the agent needs access to',
            labelHe: 'מערכות/APIs שהסוכן צריך גישה אליהם',
            required: true
          }
        ]
      },
      {
        id: 'complex-ai-intelligence',
        title: 'Intelligence & Learning',
        titleHe: 'אינטליגנציה ולמידה',
        order: 3,
        fields: [
          {
            id: 'learning',
            type: 'checkbox',
            label: 'Agent should learn from past decisions',
            labelHe: 'הסוכן צריך ללמוד מהחלטות קודמות',
            required: false
          },
          {
            id: 'human_oversight',
            type: 'radio',
            label: 'Human oversight level',
            labelHe: 'רמת פיקוח אנושי',
            required: true,
            options: [
              { value: 'full_autonomy', label: 'Full Autonomy', labelHe: 'אוטונומיה מלאה' },
              { value: 'approval_for_critical', label: 'Approval for critical actions', labelHe: 'אישור לפעולות קריטיות' },
              { value: 'approval_for_all', label: 'Approval for all actions', labelHe: 'אישור לכל הפעולות' }
            ]
          }
        ]
      }
    ]
  },

  {
    serviceId: 'ai-action-agent',
    serviceName: 'AI Action Agent (performs tasks)',
    serviceNameHe: 'סוכן AI פעולתי (מבצע משימות)',
    estimatedTimeMinutes: 25,
    sections: [
      {
        id: 'action-agent-tasks',
        title: 'Tasks & Actions',
        titleHe: 'משימות ופעולות',
        order: 1,
        fields: [
          {
            id: 'actions',
            type: 'multiselect',
            label: 'What actions can the agent perform?',
            labelHe: 'אילו פעולות הסוכן יכול לבצע?',
            required: true,
            options: [
              { value: 'data_entry', label: 'Data Entry', labelHe: 'הזנת נתונים' },
              { value: 'update_records', label: 'Update Records', labelHe: 'עדכון רשומות' },
              { value: 'send_messages', label: 'Send Messages', labelHe: 'שליחת הודעות' },
              { value: 'create_tasks', label: 'Create Tasks', labelHe: 'יצירת משימות' },
              { value: 'schedule', label: 'Schedule Appointments', labelHe: 'קביעת פגישות' },
              { value: 'process_payments', label: 'Process Payments', labelHe: 'עיבוד תשלומים' },
              { value: 'generate_docs', label: 'Generate Documents', labelHe: 'יצירת מסמכים' }
            ]
          },
          {
            id: 'action_triggers',
            type: 'list',
            label: 'What triggers the agent to act?',
            labelHe: 'מה מפעיל את הסוכן לפעולה?',
            required: true,
            examplesHe: ['הגעת אימייל חדש', 'עדכון סטטוס בCRM', 'לקוח ממלא טופס']
          },
          {
            id: 'success_criteria',
            type: 'textarea',
            label: 'How to measure success?',
            labelHe: 'איך למדוד הצלחה?',
            required: true,
            rows: 2,
            placeholderHe: 'לדוגמא: משימה הושלמה, לקוח קיבל תגובה תוך 5 דקות, נתונים עודכנו בהצלחה...'
          }
        ]
      }
    ]
  },

  // ==================== SUPPORT & MAINTENANCE ====================
  {
    serviceId: 'support-ongoing',
    serviceName: 'Ongoing Support & Maintenance',
    serviceNameHe: 'תמיכה ותחזוקה שוטפת',
    estimatedTimeMinutes: 10,
    sections: [
      {
        id: 'support-level',
        title: 'Support Level',
        titleHe: 'רמת תמיכה',
        order: 1,
        fields: [
          {
            id: 'support_hours',
            type: 'radio',
            label: 'Support availability',
            labelHe: 'זמינות תמיכה',
            required: true,
            options: [
              { value: 'business', label: 'Business Hours (9-5, Sun-Thu)', labelHe: 'שעות עבודה (9-17, א\'-ה\')' },
              { value: 'extended', label: 'Extended (8-8, Sun-Thu)', labelHe: 'מורחבות (8-20, א\'-ה\')' },
              { value: '24_5', label: '24/5', labelHe: '24/5' },
              { value: '24_7', label: '24/7', labelHe: '24/7' }
            ]
          },
          {
            id: 'response_time',
            type: 'select',
            label: 'Expected response time',
            labelHe: 'זמן תגובה צפוי',
            required: true,
            options: [
              { value: '1hour', label: 'Within 1 hour', labelHe: 'תוך שעה' },
              { value: '4hours', label: 'Within 4 hours', labelHe: 'תוך 4 שעות' },
              { value: 'same_day', label: 'Same business day', labelHe: 'באותו יום עבודה' },
              { value: 'next_day', label: 'Next business day', labelHe: 'יום עבודה הבא' }
            ]
          },
          {
            id: 'support_channels',
            type: 'multiselect',
            label: 'Support channels',
            labelHe: 'ערוצי תמיכה',
            required: true,
            options: [
              { value: 'email', label: 'Email', labelHe: 'אימייל' },
              { value: 'whatsapp', label: 'WhatsApp', labelHe: 'WhatsApp' },
              { value: 'phone', label: 'Phone', labelHe: 'טלפון' },
              { value: 'slack', label: 'Slack Channel', labelHe: 'ערוץ Slack' }
            ]
          }
        ]
      }
    ]
  },

  {
    serviceId: 'training-workshops',
    serviceName: 'Training & Workshops',
    serviceNameHe: 'הדרכות וסדנאות',
    estimatedTimeMinutes: 10,
    sections: [
      {
        id: 'training-needs',
        title: 'Training Needs',
        titleHe: 'צרכי הדרכה',
        order: 1,
        fields: [
          {
            id: 'training_topics',
            type: 'multiselect',
            label: 'Training topics',
            labelHe: 'נושאי הדרכה',
            required: true,
            options: [
              { value: 'system_basics', label: 'System Basics', labelHe: 'יסודות המערכת' },
              { value: 'advanced_features', label: 'Advanced Features', labelHe: 'תכונות מתקדמות' },
              { value: 'automation_building', label: 'Building Automations', labelHe: 'בניית אוטומציות' },
              { value: 'reporting', label: 'Reports & Analytics', labelHe: 'דוחות וניתוחים' },
              { value: 'ai_usage', label: 'Using AI Features', labelHe: 'שימוש בתכונות AI' }
            ]
          },
          {
            id: 'participants',
            type: 'number',
            label: 'Number of participants',
            labelHe: 'מספר משתתפים',
            required: true,
            validation: { min: 1, max: 100 }
          },
          {
            id: 'format',
            type: 'radio',
            label: 'Training format',
            labelHe: 'פורמט הדרכה',
            required: true,
            options: [
              { value: 'onsite', label: 'On-site', labelHe: 'באתר' },
              { value: 'remote', label: 'Remote (Zoom)', labelHe: 'מרחוק (Zoom)' },
              { value: 'hybrid', label: 'Hybrid', labelHe: 'היברידי' },
              { value: 'recorded', label: 'Recorded Videos', labelHe: 'סרטונים מוקלטים' }
            ]
          }
        ]
      }
    ]
  },

  // ==================== ADDITIONAL AUTOMATION SERVICES ====================

  {
    serviceId: 'auto-lead-response',
    serviceName: 'Auto Lead Response',
    serviceNameHe: 'תגובה אוטומטית ללידים',
    estimatedTimeMinutes: 25,
    tips: [
      'Critical response time: Must respond within 2-5 minutes for best conversion',
      'Domain verification is mandatory to avoid spam filters',
      'Prepare fallback mechanism if primary email service fails',
      'Forms often don\'t support webhooks (Wix needs Velo, WordPress needs plugin)'
    ],
    tipsHe: [
      'זמן תגובה קריטי: חובה להגיב תוך 2-5 דקות להמרה מיטבית',
      'אימות דומיין חובה כדי למנוע מסנני ספאם',
      'הכן מנגנון גיבוי במקרה שהשירות הראשי נכשל',
      'טפסים רבים לא תומכים ב-webhooks (Wix דורש Velo, WordPress צריך plugin)'
    ],
    sections: [
      {
        id: 'basic-info',
        title: 'Basic Information',
        titleHe: 'מידע בסיסי',
        description: 'Core systems and platforms for the automation',
        descriptionHe: 'מערכות ופלטפורמות ליבה לאוטומציה',
        order: 1,
        fields: [
          {
            id: 'form_platform',
            type: 'select',
            label: 'Form platform',
            labelHe: 'פלטפורמת טפסים',
            required: true,
            options: [
              { value: 'wix', label: 'Wix Forms', labelHe: 'Wix Forms' },
              { value: 'wordpress', label: 'WordPress (Contact Form 7/Gravity/WPForms)', labelHe: 'WordPress (Contact Form 7/Gravity/WPForms)' },
              { value: 'elementor', label: 'Elementor Forms', labelHe: 'Elementor Forms' },
              { value: 'google_forms', label: 'Google Forms', labelHe: 'Google Forms' },
              { value: 'typeform', label: 'Typeform', labelHe: 'Typeform' },
              { value: 'custom', label: 'Custom HTML Form', labelHe: 'טופס HTML מותאם' }
            ],
            helperTextHe: 'הפלטפורמה בה הטופס נמצא'
          },
          {
            id: 'email_service',
            type: 'select',
            label: 'Email service provider',
            labelHe: 'ספק שירות אימייל',
            required: true,
            options: [
              { value: 'sendgrid', label: 'SendGrid', labelHe: 'SendGrid' },
              { value: 'mailgun', label: 'Mailgun', labelHe: 'Mailgun' },
              { value: 'smtp', label: 'SMTP (Generic)', labelHe: 'SMTP (כללי)' },
              { value: 'gmail', label: 'Gmail SMTP', labelHe: 'Gmail SMTP' },
              { value: 'outlook', label: 'Outlook/Office 365', labelHe: 'Outlook/Office 365' }
            ],
            helperTextHe: 'השירות שישמש לשליחת אימיילים'
          },
          {
            id: 'crm_system',
            type: 'select',
            label: 'CRM system',
            labelHe: 'מערכת CRM',
            required: true,
            options: [
              { value: 'zoho', label: 'Zoho CRM', labelHe: 'Zoho CRM' },
              { value: 'salesforce', label: 'Salesforce', labelHe: 'Salesforce' },
              { value: 'hubspot', label: 'HubSpot', labelHe: 'HubSpot' },
              { value: 'pipedrive', label: 'Pipedrive', labelHe: 'Pipedrive' },
              { value: 'other', label: 'Other CRM', labelHe: 'CRM אחר' }
            ],
            helperTextHe: 'ה-CRM בו יישמרו הלידים'
          },
          {
            id: 'n8n_access',
            type: 'checkbox',
            label: 'Do you have an n8n instance with HTTPS endpoint?',
            labelHe: 'האם יש לך instance של n8n עם HTTPS endpoint?',
            required: false,
            helperTextHe: 'נדרש לקבלת webhooks מהטופס'
          }
        ]
      },
      {
        id: 'form-config',
        title: 'Form Configuration',
        titleHe: 'הגדרת טופס',
        description: 'Form webhook and field mapping',
        descriptionHe: 'webhook טופס ומיפוי שדות',
        order: 2,
        fields: [
          {
            id: 'webhook_support',
            type: 'radio',
            label: 'Does your form platform support webhooks?',
            labelHe: 'האם פלטפורמת הטפסים תומכת ב-webhooks?',
            required: true,
            options: [
              { value: 'yes', label: 'Yes, webhooks are supported', labelHe: 'כן, webhooks נתמכים' },
              { value: 'plugin', label: 'Needs plugin/extension', labelHe: 'צריך plugin/הרחבה' },
              { value: 'no', label: 'No webhook support', labelHe: 'אין תמיכה ב-webhooks' }
            ],
            helperTextHe: 'Wix דורש Velo, WordPress דורש plugin'
          },
          {
            id: 'form_fields',
            type: 'list',
            label: 'Form fields to capture',
            labelHe: 'שדות טופס לתיעוד',
            required: true,
            placeholderHe: 'לדוגמא: שם, אימייל, טלפון, הודעה...',
            placeholder: 'e.g., Name, Email, Phone, Message...',
            helperTextHe: 'רשום את כל השדות שקיימים בטופס'
          },
          {
            id: 'form_url',
            type: 'text',
            label: 'Form URL (where the form is located)',
            labelHe: 'URL של הטופס (היכן הטופס נמצא)',
            required: true,
            placeholder: 'https://example.com/contact',
            placeholderHe: 'https://example.com/contact'
          }
        ]
      },
      {
        id: 'email-setup',
        title: 'Email Service Setup',
        titleHe: 'הגדרת שירות אימייל',
        description: 'Email provider credentials and configuration',
        descriptionHe: 'אישורי ספק האימייל והגדרות',
        order: 3,
        fields: [
          {
            id: 'email_credentials_ready',
            type: 'checkbox',
            label: 'Do you have email service API credentials ready?',
            labelHe: 'האם יש לך אישורי API של שירות האימייל מוכנים?',
            required: false,
            helperTextHe: 'SendGrid API Key, Mailgun API Key, או SMTP username/password'
          },
          {
            id: 'domain_verified',
            type: 'checkbox',
            label: 'Is your sending domain verified (SPF/DKIM)?',
            labelHe: 'האם הדומיין השולח מאומת (SPF/DKIM)?',
            required: false,
            helperTextHe: 'חובה לאימות דומיין כדי למנוע ספאם. אם לא, נסייע בהגדרה.'
          },
          {
            id: 'email_template',
            type: 'textarea',
            label: 'Email response template (HTML or plain text)',
            labelHe: 'תבנית תגובת אימייל (HTML או טקסט רגיל)',
            required: true,
            placeholder: 'Dear {{name}},\n\nThank you for your inquiry! We received your message and will contact you within 24 hours.\n\nBest regards,\nYour Team',
            placeholderHe: 'שלום {{name}},\n\nתודה על פנייתך! קיבלנו את הודעתך וניצור קשר תוך 24 שעות.\n\nבברכה,\nהצוות שלך',
            helperTextHe: 'השתמש ב-{{name}}, {{email}}, {{phone}} להתאמה אישית'
          },
          {
            id: 'sender_name',
            type: 'text',
            label: 'Sender name (From name)',
            labelHe: 'שם השולח (From name)',
            required: true,
            placeholder: 'Customer Service',
            placeholderHe: 'שירות לקוחות'
          },
          {
            id: 'sender_email',
            type: 'text',
            label: 'Sender email address',
            labelHe: 'כתובת אימייל של השולח',
            required: true,
            placeholder: 'support@example.com',
            placeholderHe: 'support@example.com',
            validation: {
              pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
              message: 'Please enter a valid email address',
              messageHe: 'אנא הזן כתובת אימייל תקינה'
            }
          },
          {
            id: 'rate_limit_known',
            type: 'checkbox',
            label: 'Are you aware of your email service rate limits?',
            labelHe: 'האם את/ה מודע/ת למגבלות קצב השירות?',
            required: false,
            helperTextHe: 'SendGrid Free: 100/יום, Mailgun Free: 5,000/חודש'
          }
        ]
      },
      {
        id: 'crm-integration',
        title: 'CRM Integration',
        titleHe: 'אינטגרציית CRM',
        description: 'CRM API credentials and field mapping',
        descriptionHe: 'אישורי API של CRM ומיפוי שדות',
        order: 4,
        fields: [
          {
            id: 'crm_credentials_ready',
            type: 'checkbox',
            label: 'Do you have CRM API credentials?',
            labelHe: 'האם יש לך אישורי API של ה-CRM?',
            required: false,
            helperTextHe: 'Zoho: OAuth Token, Salesforce: API Key, HubSpot: API Key'
          },
          {
            id: 'crm_module',
            type: 'select',
            label: 'CRM module to create leads in',
            labelHe: 'מודול CRM ליצירת לידים',
            required: true,
            options: [
              { value: 'leads', label: 'Leads', labelHe: 'לידים' },
              { value: 'contacts', label: 'Contacts', labelHe: 'אנשי קשר' },
              { value: 'potentials', label: 'Potentials/Deals', labelHe: 'הזדמנויות/עסקאות' }
            ]
          },
          {
            id: 'crm_field_mapping',
            type: 'list',
            label: 'Field mapping (Form field → CRM field)',
            labelHe: 'מיפוי שדות (שדה טופס → שדה CRM)',
            required: true,
            placeholderHe: 'לדוגמא: name → Full_Name, email → Email, phone → Phone...',
            placeholder: 'e.g., name → Full_Name, email → Email, phone → Phone...',
            helperTextHe: 'ציין איזה שדה בטופס מתאים לאיזה שדה ב-CRM'
          },
          {
            id: 'log_response_in_crm',
            type: 'checkbox',
            label: 'Log auto-response in CRM activity',
            labelHe: 'תעד תגובה אוטומטית בפעילות CRM',
            required: false,
            helperTextHe: 'יתעד שהליד קיבל תגובה אוטומטית'
          }
        ]
      },
      {
        id: 'response-config',
        title: 'Response Configuration',
        titleHe: 'הגדרת תגובה',
        description: 'Response timing and fallback mechanisms',
        descriptionHe: 'תזמון תגובה ומנגנוני גיבוי',
        order: 5,
        fields: [
          {
            id: 'response_time',
            type: 'radio',
            label: 'Target response time',
            labelHe: 'זמן תגובה יעד',
            required: true,
            options: [
              { value: 'immediate', label: 'Immediate (< 1 minute)', labelHe: 'מיידי (< דקה)' },
              { value: '2-5min', label: 'Within 2-5 minutes (recommended)', labelHe: 'תוך 2-5 דקות (מומלץ)' },
              { value: '15min', label: 'Within 15 minutes', labelHe: 'תוך 15 דקות' }
            ],
            helperTextHe: 'מחקרים מראים ש-2-5 דקות הוא האופטימלי'
          },
          {
            id: 'business_hours_only',
            type: 'checkbox',
            label: 'Send responses only during business hours?',
            labelHe: 'לשלוח תגובות רק בשעות עבודה?',
            required: false,
            helperTextHe: 'אם לא, תגובות יישלחו 24/7'
          },
          {
            id: 'fallback_mechanism',
            type: 'radio',
            label: 'Fallback if email service fails',
            labelHe: 'גיבוי במקרה ששירות האימייל נכשל',
            required: true,
            options: [
              { value: 'queue', label: 'Queue and retry later', labelHe: 'שמור בתור ונסה שוב מאוחר יותר' },
              { value: 'alternative', label: 'Use alternative email service', labelHe: 'השתמש בשירות אימייל חלופי' },
              { value: 'alert', label: 'Send alert to admin only', labelHe: 'שלח התראה למנהל בלבד' }
            ]
          },
          {
            id: 'duplicate_check',
            type: 'checkbox',
            label: 'Check for duplicate leads before sending response',
            labelHe: 'בדוק לידים כפולים לפני שליחת תגובה',
            required: false,
            helperTextHe: 'מונע שליחת מספר תגובות לאותו ליד'
          }
        ]
      },
      {
        id: 'n8n-workflow',
        title: 'n8n Workflow Setup',
        titleHe: 'הגדרת תהליך n8n',
        description: 'n8n workflow endpoint and error handling',
        descriptionHe: 'נקודת קצה של תהליך n8n וטיפול בשגיאות',
        order: 6,
        fields: [
          {
            id: 'n8n_endpoint',
            type: 'text',
            label: 'n8n webhook endpoint (if available)',
            labelHe: 'נקודת קצה של webhook ב-n8n (אם זמין)',
            required: false,
            placeholder: 'https://your-n8n-instance.com/webhook/...',
            placeholderHe: 'https://your-n8n-instance.com/webhook/...',
            helperTextHe: 'אם אין לך עדיין, נגדיר ביחד'
          },
          {
            id: 'error_notification_email',
            type: 'text',
            label: 'Email for error notifications',
            labelHe: 'אימייל לקבלת התראות שגיאה',
            required: true,
            placeholder: 'admin@example.com',
            placeholderHe: 'admin@example.com',
            validation: {
              pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
              message: 'Please enter a valid email address',
              messageHe: 'אנא הזן כתובת אימייל תקינה'
            }
          },
          {
            id: 'retry_attempts',
            type: 'number',
            label: 'Number of retry attempts on failure',
            labelHe: 'מספר ניסיונות חוזרים בכשלון',
            required: true,
            validation: { min: 1, max: 5 },
            helperTextHe: 'כמה פעמים לנסות שוב אם שליחה נכשלה'
          },
          {
            id: 'test_mode',
            type: 'checkbox',
            label: 'Start in test mode (send to test email only)',
            labelHe: 'התחל במצב בדיקה (שלח לאימייל בדיקה בלבד)',
            required: false,
            helperTextHe: 'מומלץ לבדוק לפני הפעלה מלאה'
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-sms-whatsapp',
    serviceName: 'Auto SMS/WhatsApp to Leads',
    serviceNameHe: 'SMS/WhatsApp אוטומטי ללידים',
    estimatedTimeMinutes: 20,
    sections: [
      {
        id: 'messaging-setup',
        title: 'Messaging Setup',
        titleHe: 'הגדרת הודעות',
        order: 1,
        fields: [
          {
            id: 'preferred_channel',
            type: 'radio',
            label: 'Preferred messaging channel',
            labelHe: 'ערוץ הודעות מועדף',
            required: true,
            options: [
              { value: 'sms', label: 'SMS only', labelHe: 'SMS בלבד' },
              { value: 'whatsapp', label: 'WhatsApp only', labelHe: 'WhatsApp בלבד' },
              { value: 'both', label: 'Both (SMS first, WhatsApp fallback)', labelHe: 'שניהם (SMS קודם, WhatsApp גיבוי)' }
            ]
          },
          {
            id: 'message_templates',
            type: 'list',
            label: 'Message templates',
            labelHe: 'תבניות הודעות',
            required: true,
            itemFields: [
              { id: 'trigger', type: 'text', label: 'Trigger', labelHe: 'טריגר' },
              { id: 'message', type: 'textarea', label: 'Message', labelHe: 'הודעה' }
            ]
          },
          {
            id: 'daily_limit',
            type: 'number',
            label: 'Daily message limit (to avoid spam)',
            labelHe: 'מגבלת הודעות יומית (למניעת ספאם)',
            required: true,
            validation: { min: 10, max: 1000 }
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-crm-update',
    serviceName: 'Auto CRM Update from Forms',
    serviceNameHe: 'עדכון CRM אוטומטי מטפסים',
    estimatedTimeMinutes: 15,
    sections: [
      {
        id: 'crm-connection',
        title: 'CRM Connection',
        titleHe: 'חיבור CRM',
        order: 1,
        fields: [
          {
            id: 'crm_system',
            type: 'select',
            label: 'CRM system',
            labelHe: 'מערכת CRM',
            required: true,
            options: [
              { value: 'zoho', label: 'Zoho CRM', labelHe: 'Zoho CRM' },
              { value: 'hubspot', label: 'HubSpot', labelHe: 'HubSpot' },
              { value: 'salesforce', label: 'Salesforce', labelHe: 'Salesforce' },
              { value: 'pipedrive', label: 'Pipedrive', labelHe: 'Pipedrive' },
              { value: 'other', label: 'Other', labelHe: 'אחר' }
            ]
          },
          {
            id: 'form_sources',
            type: 'multiselect',
            label: 'Form sources to connect',
            labelHe: 'מקורות טפסים לחיבור',
            required: true,
            options: [
              { value: 'website', label: 'Website Forms', labelHe: 'טפסי אתר' },
              { value: 'facebook', label: 'Facebook Lead Ads', labelHe: 'Facebook Lead Ads' },
              { value: 'google', label: 'Google Ads', labelHe: 'Google Ads' },
              { value: 'landing_pages', label: 'Landing Pages', labelHe: 'דפי נחיתה' }
            ]
          },
          {
            id: 'duplicate_check',
            type: 'checkbox',
            label: 'Check for duplicates before creating new lead',
            labelHe: 'בדוק כפילויות לפני יצירת ליד חדש',
            required: false
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-team-alerts',
    serviceName: 'Team Alerts on Important Leads',
    serviceNameHe: 'התראות לצוות על לידים חשובים',
    estimatedTimeMinutes: 30,
    tips: [
      'Alert fatigue is real - too many alerts means team ignores them all',
      'Priority logic must be clear - not every lead is "important"',
      'Slack rate limit: 1 message/second per webhook',
      'Configure Do Not Disturb hours - don\'t send alerts at night/weekends',
      'Teams webhooks sometimes fail - implement retry mechanism'
    ],
    tipsHe: [
      'עייפות מהתראות היא בעיה אמיתית - יותר מדי התראות = הצוות מתעלם מהכל',
      'לוגיקת העדיפות חייבת להיות ברורה - לא כל ליד הוא "חשוב"',
      'מגבלת קצב Slack: הודעה אחת לשנייה לכל webhook',
      'הגדר שעות אל תפריע - אל תשלח התראות בלילה/סופ"ש',
      'webhooks של Teams לפעמים נכשלים - יש ליישם מנגנון חזרה'
    ],
    sections: [
      {
        id: 'basic-info',
        title: 'Basic Information',
        titleHe: 'מידע בסיסי',
        description: 'Core systems and platforms',
        descriptionHe: 'מערכות ופלטפורמות ליבה',
        order: 1,
        fields: [
          {
            id: 'crm_system',
            type: 'select',
            label: 'CRM system (source of leads)',
            labelHe: 'מערכת CRM (מקור הלידים)',
            required: true,
            options: [
              { value: 'zoho', label: 'Zoho CRM', labelHe: 'Zoho CRM' },
              { value: 'salesforce', label: 'Salesforce', labelHe: 'Salesforce' },
              { value: 'hubspot', label: 'HubSpot', labelHe: 'HubSpot' },
              { value: 'pipedrive', label: 'Pipedrive', labelHe: 'Pipedrive' },
              { value: 'other', label: 'Other CRM', labelHe: 'CRM אחר' }
            ],
            helperTextHe: 'המערכת ממנה יזוהו לידים חשובים'
          },
          {
            id: 'notification_channels',
            type: 'multiselect',
            label: 'Notification channels to use',
            labelHe: 'ערוצי התראה לשימוש',
            required: true,
            options: [
              { value: 'slack', label: 'Slack', labelHe: 'Slack' },
              { value: 'teams', label: 'Microsoft Teams', labelHe: 'Microsoft Teams' },
              { value: 'email', label: 'Email', labelHe: 'אימייל' },
              { value: 'sms', label: 'SMS (Twilio)', labelHe: 'SMS (Twilio)' },
              { value: 'push', label: 'Push Notifications', labelHe: 'התראות Push' }
            ],
            helperTextHe: 'בחר את כל הערוצים שבהם תרצה לקבל התראות'
          },
          {
            id: 'n8n_instance',
            type: 'checkbox',
            label: 'Do you have an n8n instance for routing logic?',
            labelHe: 'האם יש לך instance של n8n ללוגיקת ניתוב?',
            required: false,
            helperTextHe: 'n8n נדרש לניתוב התראות לפי כללים'
          }
        ]
      },
      {
        id: 'lead-scoring',
        title: 'Lead Scoring Rules',
        titleHe: 'כללי ניקוד לידים',
        description: 'Define what makes a lead "important"',
        descriptionHe: 'הגדר מה הופך ליד ל"חשוב"',
        order: 2,
        fields: [
          {
            id: 'scoring_criteria',
            type: 'multiselect',
            label: 'What makes a lead "important"?',
            labelHe: 'מה הופך ליד ל"חשוב"?',
            required: true,
            options: [
              { value: 'high_budget', label: 'High budget/value', labelHe: 'תקציב/ערך גבוה' },
              { value: 'urgent_timeline', label: 'Urgent timeline', labelHe: 'לוח זמנים דחוף' },
              { value: 'decision_maker', label: 'Contact is decision maker', labelHe: 'איש קשר הוא מקבל החלטות' },
              { value: 'specific_industry', label: 'Specific industry/vertical', labelHe: 'תעשייה/ורטיקל ספציפי' },
              { value: 'company_size', label: 'Large company size', labelHe: 'גודל חברה גדול' },
              { value: 'referral', label: 'Referral from existing client', labelHe: 'הפניה מלקוח קיים' },
              { value: 'competitor', label: 'Currently with competitor', labelHe: 'כרגע עם מתחרה' },
              { value: 'form_specific', label: 'Came from specific form/campaign', labelHe: 'הגיע מטופס/קמפיין ספציפי' }
            ],
            helperTextHe: 'בחר את כל הקריטריונים הרלוונטיים'
          },
          {
            id: 'budget_threshold',
            type: 'text',
            label: 'Minimum budget for high-priority alert (if applicable)',
            labelHe: 'תקציב מינימלי להתראת עדיפות גבוהה (אם רלוונטי)',
            required: false,
            placeholder: '₪50,000',
            placeholderHe: '₪50,000',
            helperTextHe: 'השאר ריק אם לא רלוונטי'
          },
          {
            id: 'target_industries',
            type: 'list',
            label: 'Target industries that trigger alerts (if applicable)',
            labelHe: 'תעשיות יעד שמפעילות התראות (אם רלוונטי)',
            required: false,
            placeholder: 'e.g., Healthcare, Finance, Technology',
            placeholderHe: 'לדוגמא: בריאות, פיננסים, טכנולוגיה',
            helperTextHe: 'השאר ריק אם לא רלוונטי'
          },
          {
            id: 'company_size_threshold',
            type: 'select',
            label: 'Minimum company size for alert',
            labelHe: 'גודל חברה מינימלי להתראה',
            required: false,
            options: [
              { value: 'any', label: 'Any size', labelHe: 'כל גודל' },
              { value: '10+', label: '10+ employees', labelHe: '10+ עובדים' },
              { value: '50+', label: '50+ employees', labelHe: '50+ עובדים' },
              { value: '100+', label: '100+ employees', labelHe: '100+ עובדים' },
              { value: '500+', label: '500+ employees', labelHe: '500+ עובדים' }
            ]
          },
          {
            id: 'scoring_logic',
            type: 'textarea',
            label: 'Additional scoring logic/rules',
            labelHe: 'לוגיקת ניקוד/כללים נוספים',
            required: false,
            placeholder: 'e.g., "If budget > ₪100K AND industry = Healthcare, send to CEO"\n"If referral from VIP client, mark as urgent"',
            placeholderHe: 'לדוגמא: "אם תקציב > ₪100K וגם תעשייה = בריאות, שלח למנכ״ל"\n"אם הפניה מלקוח VIP, סמן כדחוף"',
            helperTextHe: 'תאר בעברית את הכללים המיוחדים'
          }
        ]
      },
      {
        id: 'slack-config',
        title: 'Slack Configuration',
        titleHe: 'הגדרות Slack',
        description: 'Slack workspace and webhook setup',
        descriptionHe: 'הגדרת workspace ו-webhook של Slack',
        order: 3,
        conditionalDisplay: {
          fieldId: 'notification_channels',
          operator: 'includes',
          value: 'slack'
        },
        fields: [
          {
            id: 'slack_workspace_ready',
            type: 'checkbox',
            label: 'Do you have a Slack workspace with incoming webhooks enabled?',
            labelHe: 'האם יש לך Slack workspace עם incoming webhooks מופעלים?',
            required: false,
            helperTextHe: 'צריך הרשאות מנהל ב-Slack ליצירת webhooks'
          },
          {
            id: 'slack_webhook_url',
            type: 'text',
            label: 'Slack Webhook URL (if you have one ready)',
            labelHe: 'Slack Webhook URL (אם כבר יש לך)',
            required: false,
            placeholder: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX',
            placeholderHe: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX',
            helperTextHe: 'נוכל לעזור להגדיר אם אין לך'
          },
          {
            id: 'slack_channel_name',
            type: 'text',
            label: 'Slack channel name for alerts',
            labelHe: 'שם ערוץ Slack להתראות',
            required: false,
            placeholder: '#sales-hot-leads',
            placeholderHe: '#sales-hot-leads',
            helperTextHe: 'לדוגמא: #sales-leads, #urgent-leads'
          },
          {
            id: 'slack_message_format',
            type: 'textarea',
            label: 'Slack message template',
            labelHe: 'תבנית הודעת Slack',
            required: false,
            placeholder: '🔥 *Hot Lead Alert!*\nName: {{leadName}}\nCompany: {{companyName}}\nBudget: {{budget}}\nSource: {{source}}',
            placeholderHe: '🔥 *התראת ליד חם!*\nשם: {{leadName}}\nחברה: {{companyName}}\nתקציב: {{budget}}\nמקור: {{source}}',
            helperTextHe: 'השתמש ב-{{משתנים}} להתאמה אישית'
          }
        ]
      },
      {
        id: 'teams-config',
        title: 'Microsoft Teams Configuration',
        titleHe: 'הגדרות Microsoft Teams',
        description: 'Teams channel and webhook setup',
        descriptionHe: 'הגדרת ערוץ ו-webhook של Teams',
        order: 4,
        conditionalDisplay: {
          fieldId: 'notification_channels',
          operator: 'includes',
          value: 'teams'
        },
        fields: [
          {
            id: 'teams_channel_ready',
            type: 'checkbox',
            label: 'Do you have a Teams channel with webhook connector installed?',
            labelHe: 'האם יש לך ערוץ Teams עם webhook connector מותקן?',
            required: false,
            helperTextHe: 'צריך הרשאות בערוץ להוספת connectors'
          },
          {
            id: 'teams_webhook_url',
            type: 'text',
            label: 'Teams Incoming Webhook URL (if you have one ready)',
            labelHe: 'Teams Incoming Webhook URL (אם כבר יש לך)',
            required: false,
            placeholder: 'https://outlook.office.com/webhook/...',
            placeholderHe: 'https://outlook.office.com/webhook/...',
            helperTextHe: 'נוכל לעזור להגדיר אם אין לך'
          },
          {
            id: 'teams_retry_enabled',
            type: 'checkbox',
            label: 'Enable retry mechanism (recommended - Teams webhooks can fail)',
            labelHe: 'הפעל מנגנון חזרה (מומלץ - webhooks של Teams יכולים להיכשל)',
            required: false,
            helperTextHe: 'ינסה שוב אם ההודעה נכשלה בפעם הראשונה'
          }
        ]
      },
      {
        id: 'email-config',
        title: 'Email Alerts Configuration',
        titleHe: 'הגדרות התראות אימייל',
        description: 'Email service for alerts',
        descriptionHe: 'שירות אימייל להתראות',
        order: 5,
        conditionalDisplay: {
          fieldId: 'notification_channels',
          operator: 'includes',
          value: 'email'
        },
        fields: [
          {
            id: 'email_service',
            type: 'select',
            label: 'Email service provider',
            labelHe: 'ספק שירות אימייל',
            required: false,
            options: [
              { value: 'smtp', label: 'SMTP (Generic)', labelHe: 'SMTP (כללי)' },
              { value: 'sendgrid', label: 'SendGrid', labelHe: 'SendGrid' },
              { value: 'mailgun', label: 'Mailgun', labelHe: 'Mailgun' },
              { value: 'gmail', label: 'Gmail SMTP', labelHe: 'Gmail SMTP' }
            ],
            helperTextHe: 'השירות שישמש לשליחת התראות באימייל'
          },
          {
            id: 'email_credentials_ready',
            type: 'checkbox',
            label: 'Do you have email service credentials ready?',
            labelHe: 'האם יש לך אישורי שירות אימייל מוכנים?',
            required: false,
            helperTextHe: 'API Key או SMTP username/password'
          }
        ]
      },
      {
        id: 'sms-config',
        title: 'SMS Configuration',
        titleHe: 'הגדרות SMS',
        description: 'Twilio SMS setup',
        descriptionHe: 'הגדרת Twilio SMS',
        order: 6,
        conditionalDisplay: {
          fieldId: 'notification_channels',
          operator: 'includes',
          value: 'sms'
        },
        fields: [
          {
            id: 'twilio_account',
            type: 'checkbox',
            label: 'Do you have a Twilio account with Account SID and Auth Token?',
            labelHe: 'האם יש לך חשבון Twilio עם Account SID ו-Auth Token?',
            required: false,
            helperTextHe: 'נדרש לשליחת SMS'
          },
          {
            id: 'sms_priority_only',
            type: 'checkbox',
            label: 'Send SMS only for highest priority leads',
            labelHe: 'שלח SMS רק עבור לידים בעדיפות הגבוהה ביותר',
            required: false,
            helperTextHe: 'SMS עולה כסף - מומלץ לשמור רק ללידים הכי חשובים'
          }
        ]
      },
      {
        id: 'push-config',
        title: 'Push Notifications Configuration',
        titleHe: 'הגדרות התראות Push',
        description: 'OneSignal or Firebase setup',
        descriptionHe: 'הגדרת OneSignal או Firebase',
        order: 7,
        conditionalDisplay: {
          fieldId: 'notification_channels',
          operator: 'includes',
          value: 'push'
        },
        fields: [
          {
            id: 'push_service',
            type: 'select',
            label: 'Push notification service',
            labelHe: 'שירות התראות Push',
            required: false,
            options: [
              { value: 'onesignal', label: 'OneSignal', labelHe: 'OneSignal' },
              { value: 'firebase', label: 'Firebase Cloud Messaging', labelHe: 'Firebase Cloud Messaging' }
            ],
            helperTextHe: 'בחר את השירות שבו תשתמש'
          },
          {
            id: 'push_credentials_ready',
            type: 'checkbox',
            label: 'Do you have API credentials for your push service?',
            labelHe: 'האם יש לך אישורי API לשירות ה-Push?',
            required: false,
            helperTextHe: 'OneSignal API Key או Firebase Server Key'
          }
        ]
      },
      {
        id: 'team-config',
        title: 'Team & Recipients',
        titleHe: 'צוות ומקבלי התראות',
        description: 'Who gets what alerts',
        descriptionHe: 'מי מקבל אילו התראות',
        order: 8,
        fields: [
          {
            id: 'team_members',
            type: 'list',
            label: 'Team members who should receive alerts',
            labelHe: 'חברי צוות שצריכים לקבל התראות',
            required: true,
            itemFields: [
              {
                id: 'member_name',
                type: 'text',
                label: 'Name',
                labelHe: 'שם',
                required: true
              },
              {
                id: 'member_role',
                type: 'text',
                label: 'Role',
                labelHe: 'תפקיד',
                placeholder: 'e.g., Sales Manager, CEO',
                placeholderHe: 'לדוגמא: מנהל מכירות, מנכ״ל'
              },
              {
                id: 'member_channels',
                type: 'text',
                label: 'Preferred channels',
                labelHe: 'ערוצים מועדפים',
                placeholder: 'Slack, Email, SMS',
                placeholderHe: 'Slack, אימייל, SMS'
              },
              {
                id: 'member_contact',
                type: 'text',
                label: 'Contact (email/phone)',
                labelHe: 'איש קשר (אימייל/טלפון)'
              }
            ],
            helperTextHe: 'הוסף את כל חברי הצוות שצריכים התראות'
          },
          {
            id: 'routing_rules',
            type: 'textarea',
            label: 'Alert routing rules',
            labelHe: 'כללי ניתוב התראות',
            required: false,
            placeholder: 'e.g., "Budget > ₪200K → notify CEO\nBudget ₪50K-200K → notify Sales Manager\nAll leads → notify to #sales-leads Slack channel"',
            placeholderHe: 'לדוגמא: "תקציב > ₪200K → הודע למנכ״ל\nתקציב ₪50K-200K → הודע למנהל מכירות\nכל הלידים → הודע לערוץ #sales-leads ב-Slack"',
            helperTextHe: 'תאר מי אמור לקבל אילו סוגי התראות'
          }
        ]
      },
      {
        id: 'alert-rules',
        title: 'Alert Rules & Settings',
        titleHe: 'כללים והגדרות התראות',
        description: 'Do Not Disturb, rate limits, and priorities',
        descriptionHe: 'אל תפריע, מגבלות קצב, ועדיפויות',
        order: 9,
        fields: [
          {
            id: 'dnd_enabled',
            type: 'checkbox',
            label: 'Enable Do Not Disturb hours',
            labelHe: 'הפעל שעות אל תפריע',
            required: false,
            helperTextHe: 'מומלץ מאוד - אל תשלח התראות בלילה או בסופ״ש'
          },
          {
            id: 'dnd_hours',
            type: 'text',
            label: 'Do Not Disturb hours (if enabled)',
            labelHe: 'שעות אל תפריע (אם מופעל)',
            required: false,
            placeholder: '22:00-08:00 weekdays, all day Saturday',
            placeholderHe: '22:00-08:00 ימי חול, כל יום שבת',
            helperTextHe: 'מתי לא לשלוח התראות'
          },
          {
            id: 'max_alerts_per_day',
            type: 'number',
            label: 'Maximum alerts per day (to prevent alert fatigue)',
            labelHe: 'מקסימום התראות ליום (למניעת עייפות מהתראות)',
            required: false,
            placeholder: '20',
            placeholderHe: '20',
            validation: { min: 1, max: 200 },
            helperTextHe: 'מגביל כמות התראות כדי שהצוות לא יתעלם'
          },
          {
            id: 'priority_levels',
            type: 'multiselect',
            label: 'Alert priority levels to implement',
            labelHe: 'רמות עדיפות להתראות ליישום',
            required: true,
            options: [
              { value: 'critical', label: 'Critical (immediate action required)', labelHe: 'קריטי (דרוש פעולה מיידית)' },
              { value: 'high', label: 'High (respond within 1 hour)', labelHe: 'גבוה (תגובה תוך שעה)' },
              { value: 'medium', label: 'Medium (respond within 4 hours)', labelHe: 'בינוני (תגובה תוך 4 שעות)' },
              { value: 'low', label: 'Low (informational)', labelHe: 'נמוך (למידע בלבד)' }
            ],
            helperTextHe: 'ככל שיותר רמות, כך יותר מורכב הניהול'
          },
          {
            id: 'alert_deduplication',
            type: 'checkbox',
            label: 'Enable alert deduplication (prevent duplicate alerts for same lead)',
            labelHe: 'הפעל deduplication (מניעת התראות כפולות לאותו ליד)',
            required: false,
            helperTextHe: 'מומלץ - מונע שליחת אותה התראה פעמיים'
          },
          {
            id: 'escalation_enabled',
            type: 'checkbox',
            label: 'Enable escalation (notify manager if no response)',
            labelHe: 'הפעל escalation (הודע למנהל אם אין תגובה)',
            required: false,
            helperTextHe: 'אם נציג לא מגיב תוך X זמן, הודע למנהל'
          },
          {
            id: 'escalation_timeout',
            type: 'number',
            label: 'Escalation timeout (minutes)',
            labelHe: 'זמן עד escalation (דקות)',
            required: false,
            placeholder: '30',
            placeholderHe: '30',
            validation: { min: 5, max: 480 },
            helperTextHe: 'כמה זמן לחכות לפני העברה למנהל'
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-appointment-reminders',
    serviceName: 'Appointment Reminders',
    serviceNameHe: 'תזכורות אוטומטיות לפגישות',
    estimatedTimeMinutes: 15,
    sections: [
      {
        id: 'reminder-schedule',
        title: 'Reminder Schedule',
        titleHe: 'לוח זמנים לתזכורות',
        order: 1,
        fields: [
          {
            id: 'reminder_times',
            type: 'multiselect',
            label: 'When to send reminders?',
            labelHe: 'מתי לשלוח תזכורות?',
            required: true,
            options: [
              { value: '24h', label: '24 hours before', labelHe: '24 שעות לפני' },
              { value: '3h', label: '3 hours before', labelHe: '3 שעות לפני' },
              { value: '1h', label: '1 hour before', labelHe: 'שעה לפני' },
              { value: '30min', label: '30 minutes before', labelHe: '30 דקות לפני' }
            ]
          },
          {
            id: 'reminder_channel',
            type: 'multiselect',
            label: 'Reminder channels',
            labelHe: 'ערוצי תזכורת',
            required: true,
            options: [
              { value: 'email', label: 'Email', labelHe: 'אימייל' },
              { value: 'sms', label: 'SMS', labelHe: 'SMS' },
              { value: 'whatsapp', label: 'WhatsApp', labelHe: 'WhatsApp' }
            ]
          },
          {
            id: 'calendar_system',
            type: 'select',
            label: 'Calendar system',
            labelHe: 'מערכת לוח שנה',
            required: true,
            options: [
              { value: 'google', label: 'Google Calendar', labelHe: 'Google Calendar' },
              { value: 'outlook', label: 'Outlook/Office 365', labelHe: 'Outlook/Office 365' },
              { value: 'zoho', label: 'Zoho Calendar', labelHe: 'Zoho Calendar' }
            ]
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-welcome-email',
    serviceName: 'Welcome Email Automation',
    serviceNameHe: 'אימייל ברוכים הבאים אוטומטי',
    estimatedTimeMinutes: 10,
    sections: [
      {
        id: 'welcome-config',
        title: 'Welcome Email Configuration',
        titleHe: 'הגדרת אימייל ברוכים הבאים',
        order: 1,
        fields: [
          {
            id: 'trigger',
            type: 'select',
            label: 'Send welcome email when...',
            labelHe: 'שלח אימייל ברוכים הבאים כאשר...',
            required: true,
            options: [
              { value: 'lead_submit', label: 'Lead submits form', labelHe: 'ליד מגיש טופס' },
              { value: 'account_created', label: 'Account created', labelHe: 'חשבון נוצר' },
              { value: 'purchase', label: 'First purchase', labelHe: 'רכישה ראשונה' }
            ]
          },
          {
            id: 'email_content',
            type: 'textarea',
            label: 'Email content',
            labelHe: 'תוכן האימייל',
            required: true,
            placeholder: "Welcome! We're excited to have you..."
          },
          {
            id: 'include_next_steps',
            type: 'checkbox',
            label: 'Include next steps/call-to-action',
            labelHe: 'כלול צעדים הבאים/קריאה לפעולה',
            required: false
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-smart-followup',
    serviceName: 'Smart Follow-up Automation',
    serviceNameHe: 'אוטומציית מעקבים חכמה',
    estimatedTimeMinutes: 25,
    sections: [
      {
        id: 'followup-strategy',
        title: 'Follow-up Strategy',
        titleHe: 'אסטרטגיית מעקב',
        order: 1,
        fields: [
          {
            id: 'sequence_length',
            type: 'number',
            label: 'Number of follow-up attempts',
            labelHe: 'מספר ניסיונות מעקב',
            required: true,
            validation: { min: 1, max: 10 }
          },
          {
            id: 'time_intervals',
            type: 'list',
            label: 'Time intervals between follow-ups',
            labelHe: 'מרווחי זמן בין מעקבים',
            required: true,
            itemFields: [
              { id: 'days', type: 'number', label: 'Days', labelHe: 'ימים' }
            ]
          },
          {
            id: 'channels',
            type: 'multiselect',
            label: 'Follow-up channels',
            labelHe: 'ערוצי מעקב',
            required: true,
            options: [
              { value: 'email', label: 'Email', labelHe: 'אימייל' },
              { value: 'whatsapp', label: 'WhatsApp', labelHe: 'WhatsApp' },
              { value: 'sms', label: 'SMS', labelHe: 'SMS' },
              { value: 'phone', label: 'Phone call task', labelHe: 'משימת שיחת טלפון' }
            ]
          },
          {
            id: 'stop_on_reply',
            type: 'checkbox',
            label: 'Stop sequence when lead replies',
            labelHe: 'עצור רצף כאשר ליד עונה',
            required: false
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-system-sync',
    serviceName: 'Multi-System Data Sync',
    serviceNameHe: 'סנכרון נתונים בין 2-3 מערכות',
    estimatedTimeMinutes: 30,
    sections: [
      {
        id: 'sync-setup',
        title: 'Sync Setup',
        titleHe: 'הגדרת סנכרון',
        order: 1,
        fields: [
          {
            id: 'systems_to_sync',
            type: 'list',
            label: 'Systems to sync',
            labelHe: 'מערכות לסנכרון',
            required: true,
            itemFields: [
              { id: 'system_name', type: 'text', label: 'System Name', labelHe: 'שם מערכת' }
            ]
          },
          {
            id: 'sync_frequency',
            type: 'radio',
            label: 'Sync frequency',
            labelHe: 'תדירות סנכרון',
            required: true,
            options: [
              { value: 'realtime', label: 'Real-time (webhook)', labelHe: 'זמן אמת (webhook)' },
              { value: 'hourly', label: 'Every hour', labelHe: 'כל שעה' },
              { value: 'daily', label: 'Daily', labelHe: 'יומי' }
            ]
          },
          {
            id: 'sync_direction',
            type: 'radio',
            label: 'Sync direction',
            labelHe: 'כיוון סנכרון',
            required: true,
            options: [
              { value: 'one_way', label: 'One-way (source → target)', labelHe: 'חד-כיווני (מקור → יעד)' },
              { value: 'bidirectional', label: 'Bi-directional', labelHe: 'דו-כיווני' }
            ]
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-service-workflow',
    serviceName: 'Customer Service Automation',
    serviceNameHe: 'אוטומציית תהליך שירות לקוחות',
    estimatedTimeMinutes: 25,
    sections: [
      {
        id: 'service-flow',
        title: 'Service Flow',
        titleHe: 'זרימת שירות',
        order: 1,
        fields: [
          {
            id: 'ticket_sources',
            type: 'multiselect',
            label: 'Ticket sources',
            labelHe: 'מקורות פניות',
            required: true,
            options: [
              { value: 'email', label: 'Email', labelHe: 'אימייל' },
              { value: 'whatsapp', label: 'WhatsApp', labelHe: 'WhatsApp' },
              { value: 'website', label: 'Website Form', labelHe: 'טופס אתר' },
              { value: 'phone', label: 'Phone', labelHe: 'טלפון' }
            ]
          },
          {
            id: 'auto_categorization',
            type: 'checkbox',
            label: 'Auto-categorize tickets by topic',
            labelHe: 'סווג אוטומטי של פניות לפי נושא',
            required: false
          },
          {
            id: 'routing_method',
            type: 'radio',
            label: 'Routing method',
            labelHe: 'שיטת ניתוב',
            required: true,
            options: [
              { value: 'round_robin', label: 'Round Robin', labelHe: 'Round Robin' },
              { value: 'skill', label: 'By skill/expertise', labelHe: 'לפי מיומנות' },
              { value: 'load', label: 'By workload', labelHe: 'לפי עומס' }
            ]
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-reports',
    serviceName: 'Automated Reports',
    serviceNameHe: 'דוחות יומיים/שבועיים אוטומטיים',
    estimatedTimeMinutes: 20,
    sections: [
      {
        id: 'report-config',
        title: 'Report Configuration',
        titleHe: 'הגדרת דוח',
        order: 1,
        fields: [
          {
            id: 'report_types',
            type: 'multiselect',
            label: 'Report types',
            labelHe: 'סוגי דוחות',
            required: true,
            options: [
              { value: 'sales', label: 'Sales Performance', labelHe: 'ביצועי מכירות' },
              { value: 'leads', label: 'Lead Activity', labelHe: 'פעילות לידים' },
              { value: 'service', label: 'Service Tickets', labelHe: 'פניות שירות' },
              { value: 'marketing', label: 'Marketing Metrics', labelHe: 'מדדי שיווק' }
            ]
          },
          {
            id: 'frequency',
            type: 'radio',
            label: 'Report frequency',
            labelHe: 'תדירות דוח',
            required: true,
            options: [
              { value: 'daily', label: 'Daily', labelHe: 'יומי' },
              { value: 'weekly', label: 'Weekly', labelHe: 'שבועי' },
              { value: 'monthly', label: 'Monthly', labelHe: 'חודשי' }
            ]
          },
          {
            id: 'recipients',
            type: 'list',
            label: 'Report recipients',
            labelHe: 'נמעני דוח',
            required: true,
            itemFields: [
              { id: 'email', type: 'text', label: 'Email', labelHe: 'אימייל' }
            ]
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-document-mgmt',
    serviceName: 'Document Management Automation',
    serviceNameHe: 'ניהול מסמכים אוטומטי',
    estimatedTimeMinutes: 25,
    sections: [
      {
        id: 'document-handling',
        title: 'Document Handling',
        titleHe: 'טיפול במסמכים',
        order: 1,
        fields: [
          {
            id: 'document_types',
            type: 'multiselect',
            label: 'Document types to process',
            labelHe: 'סוגי מסמכים לעיבוד',
            required: true,
            options: [
              { value: 'invoices', label: 'Invoices', labelHe: 'חשבוניות' },
              { value: 'contracts', label: 'Contracts', labelHe: 'חוזים' },
              { value: 'receipts', label: 'Receipts', labelHe: 'קבלות' },
              { value: 'forms', label: 'Forms', labelHe: 'טפסים' },
              { value: 'other', label: 'Other', labelHe: 'אחר' }
            ]
          },
          {
            id: 'storage_location',
            type: 'select',
            label: 'Storage location',
            labelHe: 'מיקום אחסון',
            required: true,
            options: [
              { value: 'google_drive', label: 'Google Drive', labelHe: 'Google Drive' },
              { value: 'dropbox', label: 'Dropbox', labelHe: 'Dropbox' },
              { value: 'onedrive', label: 'OneDrive', labelHe: 'OneDrive' },
              { value: 'zoho', label: 'Zoho WorkDrive', labelHe: 'Zoho WorkDrive' }
            ]
          },
          {
            id: 'auto_extract',
            type: 'checkbox',
            label: 'Auto-extract data from documents',
            labelHe: 'חילוץ אוטומטי של נתונים ממסמכים',
            required: false
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-end-to-end',
    serviceName: 'End-to-End Process Automation',
    serviceNameHe: 'אוטומציה מקצה לקצה של תהליך שלם',
    estimatedTimeMinutes: 45,
    sections: [
      {
        id: 'process-definition',
        title: 'Process Definition',
        titleHe: 'הגדרת תהליך',
        order: 1,
        fields: [
          {
            id: 'process_name',
            type: 'text',
            label: 'Process name',
            labelHe: 'שם תהליך',
            required: true
          },
          {
            id: 'process_steps',
            type: 'textarea',
            label: 'Describe the current manual process step-by-step',
            labelHe: 'תאר את התהליך הידני הנוכחי שלב אחר שלב',
            required: true
          },
          {
            id: 'weekly_volume',
            type: 'number',
            label: 'How many times per week does this process run?',
            labelHe: 'כמה פעמים בשבוע התהליך מתבצע?',
            required: true,
            validation: { min: 1, max: 1000 }
          },
          {
            id: 'time_per_instance',
            type: 'number',
            label: 'Time per instance (minutes)',
            labelHe: 'זמן למופע (דקות)',
            required: true,
            validation: { min: 1, max: 480 }
          },
          {
            id: 'pain_points',
            type: 'textarea',
            label: 'What are the main pain points in this process?',
            labelHe: 'מהן נקודות הכאב העיקריות בתהליך?',
            required: true
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-multi-system',
    serviceName: 'Multi-System Integration (4+ systems)',
    serviceNameHe: 'אינטגרציה מלאה של 4+ מערכות',
    estimatedTimeMinutes: 40,
    sections: [
      {
        id: 'systems-mapping',
        title: 'Systems Mapping',
        titleHe: 'מיפוי מערכות',
        order: 1,
        fields: [
          {
            id: 'systems_list',
            type: 'list',
            label: 'List all systems to integrate',
            labelHe: 'רשימת כל המערכות לאינטגרציה',
            required: true,
            itemFields: [
              { id: 'system', type: 'text', label: 'System', labelHe: 'מערכת' },
              { id: 'role', type: 'text', label: 'Role', labelHe: 'תפקיד' }
            ]
          },
          {
            id: 'data_flow',
            type: 'textarea',
            label: 'Describe the desired data flow between systems',
            labelHe: 'תאר את זרימת הנתונים הרצויה בין המערכות',
            required: true
          },
          {
            id: 'realtime_required',
            type: 'checkbox',
            label: 'Real-time sync required',
            labelHe: 'נדרש סנכרון בזמן אמת',
            required: false
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-complex-logic',
    serviceName: 'Complex Business Logic Automation',
    serviceNameHe: 'לוגיקה עסקית מורכבת',
    estimatedTimeMinutes: 35,
    sections: [
      {
        id: 'logic-definition',
        title: 'Logic Definition',
        titleHe: 'הגדרת לוגיקה',
        order: 1,
        fields: [
          {
            id: 'business_rules',
            type: 'textarea',
            label: 'Describe the business rules and conditional logic',
            labelHe: 'תאר את הכללים העסקיים והלוגיקה המותנית',
            required: true
          },
          {
            id: 'decision_points',
            type: 'list',
            label: 'Key decision points',
            labelHe: 'נקודות החלטה מרכזיות',
            required: true,
            itemFields: [
              { id: 'condition', type: 'text', label: 'Condition', labelHe: 'תנאי' },
              { id: 'action', type: 'text', label: 'Action', labelHe: 'פעולה' }
            ]
          },
          {
            id: 'exceptions',
            type: 'textarea',
            label: 'Edge cases and exceptions to handle',
            labelHe: 'מקרי קצה וחריגים לטיפול',
            required: false
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-sales-pipeline',
    serviceName: 'Complete Sales Pipeline with Dashboard',
    serviceNameHe: 'Pipeline מכירות מלא עם דשבורד',
    estimatedTimeMinutes: 50,
    sections: [
      {
        id: 'pipeline-config',
        title: 'Pipeline Configuration',
        titleHe: 'הגדרת Pipeline',
        order: 1,
        fields: [
          {
            id: 'pipeline_stages',
            type: 'list',
            label: 'Pipeline stages',
            labelHe: 'שלבי Pipeline',
            required: true,
            itemFields: [
              { id: 'stage_name', type: 'text', label: 'Stage Name', labelHe: 'שם שלב' }
            ]
          },
          {
            id: 'kpis',
            type: 'multiselect',
            label: 'KPIs to track',
            labelHe: 'KPIs למעקב',
            required: true,
            options: [
              { value: 'conversion_rate', label: 'Conversion Rate', labelHe: 'שיעור המרה' },
              { value: 'avg_deal_size', label: 'Average Deal Size', labelHe: 'גודל עסקה ממוצע' },
              { value: 'sales_cycle', label: 'Sales Cycle Length', labelHe: 'אורך מחזור מכירות' },
              { value: 'win_rate', label: 'Win Rate', labelHe: 'שיעור זכייה' }
            ]
          },
          {
            id: 'dashboard_users',
            type: 'list',
            label: 'Who needs access to the dashboard?',
            labelHe: 'מי צריך גישה לדשבורד?',
            required: true,
            itemFields: [
              { id: 'name', type: 'text', label: 'Name', labelHe: 'שם' }
            ]
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-cross-dept',
    serviceName: 'Cross-Department Automation',
    serviceNameHe: 'אוטומציה בין-מחלקתית',
    estimatedTimeMinutes: 40,
    sections: [
      {
        id: 'dept-workflow',
        title: 'Department Workflow',
        titleHe: 'זרימת עבודה בין מחלקות',
        order: 1,
        fields: [
          {
            id: 'departments',
            type: 'list',
            label: 'Departments involved',
            labelHe: 'מחלקות מעורבות',
            required: true,
            itemFields: [
              { id: 'dept', type: 'text', label: 'Department', labelHe: 'מחלקה' }
            ]
          },
          {
            id: 'handoff_points',
            type: 'textarea',
            label: 'Describe the handoff points between departments',
            labelHe: 'תאר נקודות העברה בין מחלקות',
            required: true
          },
          {
            id: 'approval_required',
            type: 'checkbox',
            label: 'Approvals required between handoffs',
            labelHe: 'נדרשים אישורים בין העברות',
            required: false
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-financial',
    serviceName: 'Financial Process Automation',
    serviceNameHe: 'אוטומציית תהליכים פיננסיים',
    estimatedTimeMinutes: 35,
    sections: [
      {
        id: 'financial-processes',
        title: 'Financial Processes',
        titleHe: 'תהליכים פיננסיים',
        order: 1,
        fields: [
          {
            id: 'process_types',
            type: 'multiselect',
            label: 'Which financial processes to automate?',
            labelHe: 'אילו תהליכים פיננסיים לאוטומט?',
            required: true,
            options: [
              { value: 'invoicing', label: 'Invoicing', labelHe: 'חשבוניות' },
              { value: 'payments', label: 'Payment Processing', labelHe: 'עיבוד תשלומים' },
              { value: 'reconciliation', label: 'Reconciliation', labelHe: 'התאמות' },
              { value: 'expense', label: 'Expense Management', labelHe: 'ניהול הוצאות' }
            ]
          },
          {
            id: 'accounting_system',
            type: 'select',
            label: 'Accounting system',
            labelHe: 'מערכת הנהלת חשבונות',
            required: true,
            options: [
              { value: 'quickbooks', label: 'QuickBooks', labelHe: 'QuickBooks' },
              { value: 'xero', label: 'Xero', labelHe: 'Xero' },
              { value: 'zoho_books', label: 'Zoho Books', labelHe: 'Zoho Books' },
              { value: 'other', label: 'Other', labelHe: 'אחר' }
            ]
          }
        ]
      }
    ]
  },

  {
    serviceId: 'auto-project-mgmt',
    serviceName: 'Project Management Automation',
    serviceNameHe: 'מערכת ניהול פרויקטים אוטומטית',
    estimatedTimeMinutes: 30,
    sections: [
      {
        id: 'pm-setup',
        title: 'PM Setup',
        titleHe: 'הגדרת ניהול פרויקטים',
        order: 1,
        fields: [
          {
            id: 'pm_system',
            type: 'select',
            label: 'Project management system',
            labelHe: 'מערכת ניהול פרויקטים',
            required: true,
            options: [
              { value: 'asana', label: 'Asana', labelHe: 'Asana' },
              { value: 'monday', label: 'Monday.com', labelHe: 'Monday.com' },
              { value: 'clickup', label: 'ClickUp', labelHe: 'ClickUp' },
              { value: 'jira', label: 'Jira', labelHe: 'Jira' }
            ]
          },
          {
            id: 'auto_project_creation',
            type: 'checkbox',
            label: 'Auto-create projects from CRM deals',
            labelHe: 'יצירה אוטומטית של פרויקטים מעסקאות CRM',
            required: false
          },
          {
            id: 'task_templates',
            type: 'checkbox',
            label: 'Use task templates for recurring projects',
            labelHe: 'שימוש בתבניות משימות לפרויקטים חוזרים',
            required: false
          }
        ]
      }
    ]
  },

  // ==================== ADDITIONAL AI AGENT SERVICES ====================

  {
    serviceId: 'ai-lead-qualifier',
    serviceName: 'AI Lead Qualifier',
    serviceNameHe: 'AI לאיסוף מידע ראשוני מלידים',
    estimatedTimeMinutes: 25,
    sections: [
      {
        id: 'qualification-criteria',
        title: 'Qualification Criteria',
        titleHe: 'קריטריוני הסמכה',
        order: 1,
        fields: [
          {
            id: 'qualifying_questions',
            type: 'list',
            label: 'Qualifying questions',
            labelHe: 'שאלות הסמכה',
            required: true,
            itemFields: [
              { id: 'question', type: 'text', label: 'Question', labelHe: 'שאלה' }
            ]
          },
          {
            id: 'lead_scoring',
            type: 'checkbox',
            label: 'Enable AI lead scoring',
            labelHe: 'אפשר ציון לידים באמצעות AI',
            required: false
          },
          {
            id: 'handoff_threshold',
            type: 'select',
            label: 'When to hand off to human?',
            labelHe: 'מתי להעביר לאדם?',
            required: true,
            options: [
              { value: 'high_score', label: 'High score leads only', labelHe: 'רק לידים עם ציון גבוה' },
              { value: 'request', label: 'When lead requests', labelHe: 'כשליד מבקש' },
              { value: 'always', label: 'After qualification', labelHe: 'אחרי הסמכה' }
            ]
          }
        ]
      }
    ]
  },

  {
    serviceId: 'ai-form-assistant',
    serviceName: 'AI Form Assistant',
    serviceNameHe: 'AI למילוי טפסים עם ליווי',
    estimatedTimeMinutes: 20,
    sections: [
      {
        id: 'form-guidance',
        title: 'Form Guidance',
        titleHe: 'הנחיית טופס',
        order: 1,
        fields: [
          {
            id: 'form_url',
            type: 'text',
            label: 'Form URL',
            labelHe: 'כתובת טופס',
            required: true
          },
          {
            id: 'help_triggers',
            type: 'multiselect',
            label: 'When should AI offer help?',
            labelHe: 'מתי AI צריך להציע עזרה?',
            required: true,
            options: [
              { value: 'field_hover', label: 'User hovers over field', labelHe: 'משתמש מרחף מעל שדה' },
              { value: 'validation_error', label: 'Validation error', labelHe: 'שגיאת ולידציה' },
              { value: 'abandonment', label: 'Abandonment risk', labelHe: 'סיכון לנטישה' }
            ]
          },
          {
            id: 'completion_incentive',
            type: 'text',
            label: 'Completion incentive message',
            labelHe: 'הודעת תמריץ להשלמה',
            required: false
          }
        ]
      }
    ]
  },

  {
    serviceId: 'ai-triage',
    serviceName: 'AI Inquiry Triage',
    serviceNameHe: 'AI לסינון פניות ראשוני',
    estimatedTimeMinutes: 20,
    sections: [
      {
        id: 'triage-rules',
        title: 'Triage Rules',
        titleHe: 'כללי סינון',
        order: 1,
        fields: [
          {
            id: 'categories',
            type: 'list',
            label: 'Inquiry categories',
            labelHe: 'קטגוריות פניות',
            required: true,
            itemFields: [
              { id: 'category', type: 'text', label: 'Category', labelHe: 'קטגוריה' }
            ]
          },
          {
            id: 'routing_rules',
            type: 'list',
            label: 'Routing rules',
            labelHe: 'כללי ניתוב',
            required: true,
            itemFields: [
              { id: 'category', type: 'text', label: 'Category', labelHe: 'קטגוריה' },
              { id: 'route_to', type: 'text', label: 'Route to', labelHe: 'נתב אל' }
            ]
          },
          {
            id: 'urgency_detection',
            type: 'checkbox',
            label: 'Detect urgency and prioritize',
            labelHe: 'זהה דחיפות ותעדף',
            required: false
          }
        ]
      }
    ]
  },

  {
    serviceId: 'ai-learning',
    serviceName: 'Self-Learning AI Agent',
    serviceNameHe: 'AI עם למידה מתמשכת',
    estimatedTimeMinutes: 30,
    sections: [
      {
        id: 'learning-config',
        title: 'Learning Configuration',
        titleHe: 'הגדרת למידה',
        order: 1,
        fields: [
          {
            id: 'learning_sources',
            type: 'multiselect',
            label: 'What should the AI learn from?',
            labelHe: 'ממה ה-AI צריך ללמוד?',
            required: true,
            options: [
              { value: 'conversations', label: 'Successful conversations', labelHe: 'שיחות מוצלחות' },
              { value: 'corrections', label: 'Human corrections', labelHe: 'תיקונים אנושיים' },
              { value: 'feedback', label: 'User feedback', labelHe: 'משוב משתמשים' },
              { value: 'outcomes', label: 'Outcomes (conversions)', labelHe: 'תוצאות (המרות)' }
            ]
          },
          {
            id: 'review_frequency',
            type: 'radio',
            label: 'How often to review and update AI?',
            labelHe: 'באיזו תדירות לבדוק ולעדכן את ה-AI?',
            required: true,
            options: [
              { value: 'weekly', label: 'Weekly', labelHe: 'שבועי' },
              { value: 'biweekly', label: 'Bi-weekly', labelHe: 'דו-שבועי' },
              { value: 'monthly', label: 'Monthly', labelHe: 'חודשי' }
            ]
          }
        ]
      }
    ]
  },

  {
    serviceId: 'ai-multi-agent',
    serviceName: 'Multi-Agent AI System',
    serviceNameHe: 'מספר סוכני AI משתפי פעולה',
    estimatedTimeMinutes: 45,
    sections: [
      {
        id: 'agents-config',
        title: 'Agents Configuration',
        titleHe: 'הגדרת סוכנים',
        order: 1,
        fields: [
          {
            id: 'agent_list',
            type: 'list',
            label: 'AI agents needed',
            labelHe: 'סוכני AI נדרשים',
            required: true,
            itemFields: [
              { id: 'agent_name', type: 'text', label: 'Agent Name', labelHe: 'שם סוכן' },
              { id: 'specialty', type: 'text', label: 'Specialty', labelHe: 'התמחות' }
            ]
          },
          {
            id: 'handoff_rules',
            type: 'textarea',
            label: 'Describe when to hand off between agents',
            labelHe: 'תאר מתי להעביר בין סוכנים',
            required: true
          },
          {
            id: 'unified_knowledge',
            type: 'checkbox',
            label: 'Share knowledge base across agents',
            labelHe: 'שתף מאגר ידע בין סוכנים',
            required: false
          }
        ]
      }
    ]
  },

  {
    serviceId: 'ai-branded',
    serviceName: 'Brand-Personalized AI',
    serviceNameHe: 'AI עם אישיות מותאמת למותג',
    estimatedTimeMinutes: 30,
    sections: [
      {
        id: 'brand-personality',
        title: 'Brand Personality',
        titleHe: 'אישיות מותג',
        order: 1,
        fields: [
          {
            id: 'brand_voice',
            type: 'select',
            label: 'Brand voice',
            labelHe: 'קול מותג',
            required: true,
            options: [
              { value: 'professional', label: 'Professional', labelHe: 'מקצועי' },
              { value: 'friendly', label: 'Friendly', labelHe: 'ידידותי' },
              { value: 'playful', label: 'Playful', labelHe: 'משחקי' },
              { value: 'authoritative', label: 'Authoritative', labelHe: 'סמכותי' }
            ]
          },
          {
            id: 'brand_values',
            type: 'textarea',
            label: 'Brand values to reflect',
            labelHe: 'ערכי מותג לשיקוף',
            required: true
          },
          {
            id: 'prohibited_terms',
            type: 'list',
            label: 'Words/phrases to avoid',
            labelHe: 'מילים/ביטויים להימנע',
            required: false,
            itemFields: [
              { id: 'term', type: 'text', label: 'Term', labelHe: 'ביטוי' }
            ]
          }
        ]
      }
    ]
  },

  {
    serviceId: 'ai-full-integration',
    serviceName: 'Fully Integrated AI System',
    serviceNameHe: 'אינטגרציה עמוקה עם כל המערכות',
    estimatedTimeMinutes: 50,
    sections: [
      {
        id: 'deep-integration',
        title: 'Deep Integration',
        titleHe: 'אינטגרציה עמוקה',
        order: 1,
        fields: [
          {
            id: 'integrated_systems',
            type: 'list',
            label: 'Systems to integrate with',
            labelHe: 'מערכות לאינטגרציה',
            required: true,
            itemFields: [
              { id: 'system', type: 'text', label: 'System', labelHe: 'מערכת' }
            ]
          },
          {
            id: 'ai_actions',
            type: 'multiselect',
            label: 'What actions can AI take?',
            labelHe: 'אילו פעולות AI יכול לבצע?',
            required: true,
            options: [
              { value: 'create_records', label: 'Create records', labelHe: 'יצירת רשומות' },
              { value: 'update_data', label: 'Update data', labelHe: 'עדכון נתונים' },
              { value: 'send_messages', label: 'Send messages', labelHe: 'שליחת הודעות' },
              { value: 'schedule_tasks', label: 'Schedule tasks', labelHe: 'תזמון משימות' }
            ]
          },
          {
            id: 'approval_required',
            type: 'checkbox',
            label: 'Require human approval for AI actions',
            labelHe: 'דרוש אישור אנושי לפעולות AI',
            required: false
          }
        ]
      }
    ]
  },

  {
    serviceId: 'ai-multimodal',
    serviceName: 'Multimodal AI (Docs/Images/Voice)',
    serviceNameHe: 'AI עם עיבוד מסמכים/תמונות/קול',
    estimatedTimeMinutes: 40,
    sections: [
      {
        id: 'multimodal-config',
        title: 'Multimodal Configuration',
        titleHe: 'הגדרת Multimodal',
        order: 1,
        fields: [
          {
            id: 'input_types',
            type: 'multiselect',
            label: 'Input types to support',
            labelHe: 'סוגי קלט לתמיכה',
            required: true,
            options: [
              { value: 'text', label: 'Text', labelHe: 'טקסט' },
              { value: 'voice', label: 'Voice', labelHe: 'קול' },
              { value: 'images', label: 'Images', labelHe: 'תמונות' },
              { value: 'documents', label: 'Documents (PDF)', labelHe: 'מסמכים (PDF)' }
            ]
          },
          {
            id: 'use_cases',
            type: 'textarea',
            label: 'Describe the use cases for each input type',
            labelHe: 'תאר את מקרי השימוש לכל סוג קלט',
            required: true
          },
          {
            id: 'voice_language',
            type: 'multiselect',
            label: 'Voice languages',
            labelHe: 'שפות קול',
            required: false,
            options: [
              { value: 'he', label: 'Hebrew', labelHe: 'עברית' },
              { value: 'en', label: 'English', labelHe: 'אנגלית' },
              { value: 'ar', label: 'Arabic', labelHe: 'ערבית' }
            ]
          }
        ]
      }
    ]
  },

  {
    serviceId: 'ai-predictive',
    serviceName: 'Predictive AI with Analytics',
    serviceNameHe: 'AI עם יכולות ניתוח וחיזוי',
    estimatedTimeMinutes: 45,
    sections: [
      {
        id: 'predictive-models',
        title: 'Predictive Models',
        titleHe: 'מודלים חזוי',
        order: 1,
        fields: [
          {
            id: 'predictions_needed',
            type: 'multiselect',
            label: 'What to predict?',
            labelHe: 'מה לחזות?',
            required: true,
            options: [
              { value: 'churn', label: 'Customer churn', labelHe: 'נטישת לקוחות' },
              { value: 'conversion', label: 'Lead conversion', labelHe: 'המרת לידים' },
              { value: 'revenue', label: 'Revenue forecast', labelHe: 'תחזית הכנסות' },
              { value: 'demand', label: 'Demand forecast', labelHe: 'תחזית ביקוש' }
            ]
          },
          {
            id: 'data_sources',
            type: 'list',
            label: 'Data sources for training',
            labelHe: 'מקורות נתונים לאימון',
            required: true,
            itemFields: [
              { id: 'source', type: 'text', label: 'Source', labelHe: 'מקור' }
            ]
          },
          {
            id: 'alert_threshold',
            type: 'text',
            label: 'When to alert (e.g., "80% churn risk")',
            labelHe: 'מתי להתריע (לדוגמה: "80% סיכון לנטישה")',
            required: false
          }
        ]
      }
    ]
  },

  // ==================== ADDITIONAL INTEGRATION SERVICES ====================

  {
    serviceId: 'int-webhook',
    serviceName: 'Webhook Setup',
    serviceNameHe: 'הגדרת Webhook',
    estimatedTimeMinutes: 15,
    sections: [
      {
        id: 'webhook-config',
        title: 'Webhook Configuration',
        titleHe: 'הגדרת Webhook',
        order: 1,
        fields: [
          {
            id: 'source_system',
            type: 'text',
            label: 'Source system (sending webhook)',
            labelHe: 'מערכת מקור (שולחת webhook)',
            required: true
          },
          {
            id: 'target_system',
            type: 'text',
            label: 'Target system (receiving webhook)',
            labelHe: 'מערכת יעד (מקבלת webhook)',
            required: true
          },
          {
            id: 'events',
            type: 'list',
            label: 'Events to trigger webhook',
            labelHe: 'אירועים להפעלת webhook',
            required: true,
            itemFields: [
              { id: 'event', type: 'text', label: 'Event', labelHe: 'אירוע' }
            ]
          },
          {
            id: 'retry_logic',
            type: 'checkbox',
            label: 'Enable retry logic for failed webhooks',
            labelHe: 'אפשר לוגיקת ניסיון חוזר ל-webhooks כושלים',
            required: false
          }
        ]
      }
    ]
  },

  {
    serviceId: 'int-transform',
    serviceName: 'Integration with Data Transformation',
    serviceNameHe: 'אינטגרציה עם טרנספורמציה של נתונים',
    estimatedTimeMinutes: 30,
    sections: [
      {
        id: 'transformation-rules',
        title: 'Transformation Rules',
        titleHe: 'כללי טרנספורמציה',
        order: 1,
        fields: [
          {
            id: 'field_mapping',
            type: 'list',
            label: 'Field mapping',
            labelHe: 'מיפוי שדות',
            required: true,
            itemFields: [
              { id: 'source_field', type: 'text', label: 'Source Field', labelHe: 'שדה מקור' },
              { id: 'target_field', type: 'text', label: 'Target Field', labelHe: 'שדה יעד' }
            ]
          },
          {
            id: 'transformations',
            type: 'textarea',
            label: 'Describe data transformations needed',
            labelHe: 'תאר טרנספורמציות נתונים נדרשות',
            required: true
          },
          {
            id: 'validation_rules',
            type: 'textarea',
            label: 'Validation rules',
            labelHe: 'כללי ולידציה',
            required: false
          }
        ]
      }
    ]
  },

  {
    serviceId: 'int-custom-api',
    serviceName: 'Custom API Development',
    serviceNameHe: 'פיתוח API מותאם אישית',
    estimatedTimeMinutes: 45,
    sections: [
      {
        id: 'api-requirements',
        title: 'API Requirements',
        titleHe: 'דרישות API',
        order: 1,
        fields: [
          {
            id: 'api_purpose',
            type: 'textarea',
            label: 'API purpose and use case',
            labelHe: 'מטרת API ומקרה שימוש',
            required: true
          },
          {
            id: 'endpoints',
            type: 'list',
            label: 'Endpoints needed',
            labelHe: 'Endpoints נדרשים',
            required: true,
            itemFields: [
              { id: 'endpoint', type: 'text', label: 'Endpoint', labelHe: 'Endpoint' },
              { id: 'method', type: 'text', label: 'Method', labelHe: 'Method' }
            ]
          },
          {
            id: 'authentication',
            type: 'select',
            label: 'Authentication method',
            labelHe: 'שיטת אימות',
            required: true,
            options: [
              { value: 'api_key', label: 'API Key', labelHe: 'API Key' },
              { value: 'oauth', label: 'OAuth 2.0', labelHe: 'OAuth 2.0' },
              { value: 'jwt', label: 'JWT', labelHe: 'JWT' }
            ]
          },
          {
            id: 'rate_limiting',
            type: 'checkbox',
            label: 'Implement rate limiting',
            labelHe: 'יישם הגבלת קצב',
            required: false
          }
        ]
      }
    ]
  },

  {
    serviceId: 'int-legacy',
    serviceName: 'Legacy System Integration',
    serviceNameHe: 'אינטגרציה עם מערכות ישנות',
    estimatedTimeMinutes: 40,
    sections: [
      {
        id: 'legacy-details',
        title: 'Legacy System Details',
        titleHe: 'פרטי מערכת ישנה',
        order: 1,
        fields: [
          {
            id: 'system_name',
            type: 'text',
            label: 'Legacy system name',
            labelHe: 'שם מערכת ישנה',
            required: true
          },
          {
            id: 'system_age',
            type: 'text',
            label: 'System age/version',
            labelHe: 'גיל/גרסה של מערכת',
            required: false
          },
          {
            id: 'access_method',
            type: 'radio',
            label: 'How can we access the system?',
            labelHe: 'איך אפשר לגשת למערכת?',
            required: true,
            options: [
              { value: 'database', label: 'Direct database access', labelHe: 'גישה ישירה לבסיס נתונים' },
              { value: 'file_export', label: 'File export/import', labelHe: 'ייצוא/ייבוא קובץ' },
              { value: 'screen_scraping', label: 'Screen scraping', labelHe: 'Screen scraping' },
              { value: 'api', label: 'Legacy API', labelHe: 'API ישן' }
            ]
          },
          {
            id: 'challenges',
            type: 'textarea',
            label: 'Known challenges or limitations',
            labelHe: 'אתגרים או מגבלות ידועות',
            required: false
          }
        ]
      }
    ]
  },

  // ==================== ADDITIONAL SYSTEM IMPLEMENTATION ====================

  {
    serviceId: 'impl-marketing',
    serviceName: 'Marketing Tools Implementation',
    serviceNameHe: 'הטמעת כלי שיווק',
    estimatedTimeMinutes: 25,
    sections: [
      {
        id: 'marketing-platform',
        title: 'Marketing Platform',
        titleHe: 'פלטפורמת שיווק',
        order: 1,
        fields: [
          {
            id: 'platform',
            type: 'select',
            label: 'Marketing platform',
            labelHe: 'פלטפורמת שיווק',
            required: true,
            options: [
              { value: 'mailchimp', label: 'Mailchimp', labelHe: 'Mailchimp' },
              { value: 'activecampaign', label: 'ActiveCampaign', labelHe: 'ActiveCampaign' },
              { value: 'hubspot', label: 'HubSpot Marketing', labelHe: 'HubSpot Marketing' },
              { value: 'zoho_campaigns', label: 'Zoho Campaigns', labelHe: 'Zoho Campaigns' }
            ]
          },
          {
            id: 'list_size',
            type: 'select',
            label: 'Email list size',
            labelHe: 'גודל רשימת אימיילים',
            required: true,
            options: [
              { value: 'under_1000', label: 'Under 1,000', labelHe: 'מתחת ל-1,000' },
              { value: '1000-5000', label: '1,000-5,000', labelHe: '1,000-5,000' },
              { value: '5000-20000', label: '5,000-20,000', labelHe: '5,000-20,000' },
              { value: 'over_20000', label: 'Over 20,000', labelHe: 'מעל 20,000' }
            ]
          },
          {
            id: 'campaign_types',
            type: 'multiselect',
            label: 'Campaign types',
            labelHe: 'סוגי קמפיינים',
            required: true,
            options: [
              { value: 'welcome', label: 'Welcome series', labelHe: 'סדרת ברוכים הבאים' },
              { value: 'nurture', label: 'Lead nurture', labelHe: 'טיפוח לידים' },
              { value: 'promotional', label: 'Promotional', labelHe: 'קידום מכירות' },
              { value: 'newsletter', label: 'Newsletter', labelHe: 'ניוזלטר' }
            ]
          }
        ]
      }
    ]
  },

  {
    serviceId: 'impl-erp',
    serviceName: 'ERP Implementation',
    serviceNameHe: 'הטמעת ERP',
    estimatedTimeMinutes: 60,
    sections: [
      {
        id: 'erp-selection',
        title: 'ERP Selection',
        titleHe: 'בחירת ERP',
        order: 1,
        fields: [
          {
            id: 'erp_system',
            type: 'select',
            label: 'ERP system',
            labelHe: 'מערכת ERP',
            required: true,
            options: [
              { value: 'odoo', label: 'Odoo', labelHe: 'Odoo' },
              { value: 'netsuite', label: 'NetSuite', labelHe: 'NetSuite' },
              { value: 'sap', label: 'SAP', labelHe: 'SAP' },
              { value: 'microsoft_dynamics', label: 'Microsoft Dynamics', labelHe: 'Microsoft Dynamics' }
            ]
          },
          {
            id: 'modules_needed',
            type: 'multiselect',
            label: 'ERP modules needed',
            labelHe: 'מודולי ERP נדרשים',
            required: true,
            options: [
              { value: 'accounting', label: 'Accounting', labelHe: 'הנהלת חשבונות' },
              { value: 'inventory', label: 'Inventory', labelHe: 'מלאי' },
              { value: 'purchasing', label: 'Purchasing', labelHe: 'רכש' },
              { value: 'sales', label: 'Sales', labelHe: 'מכירות' },
              { value: 'hr', label: 'HR', labelHe: 'משאבי אנוש' },
              { value: 'manufacturing', label: 'Manufacturing', labelHe: 'ייצור' }
            ]
          },
          {
            id: 'company_size',
            type: 'number',
            label: 'Number of employees',
            labelHe: 'מספר עובדים',
            required: true,
            validation: { min: 1, max: 10000 }
          }
        ]
      }
    ]
  },

  // ==================== ADDITIONAL SERVICES ====================

  {
    serviceId: 'add-dashboard',
    serviceName: 'Real-Time Dashboard',
    serviceNameHe: 'דשבורד real-time',
    estimatedTimeMinutes: 30,
    sections: [
      {
        id: 'dashboard-design',
        title: 'Dashboard Design',
        titleHe: 'עיצוב דשבורד',
        order: 1,
        fields: [
          {
            id: 'kpis',
            type: 'list',
            label: 'KPIs to display',
            labelHe: 'KPIs להצגה',
            required: true,
            itemFields: [
              { id: 'kpi', type: 'text', label: 'KPI', labelHe: 'KPI' }
            ]
          },
          {
            id: 'data_sources',
            type: 'list',
            label: 'Data sources',
            labelHe: 'מקורות נתונים',
            required: true,
            itemFields: [
              { id: 'source', type: 'text', label: 'Source', labelHe: 'מקור' }
            ]
          },
          {
            id: 'refresh_rate',
            type: 'radio',
            label: 'Data refresh rate',
            labelHe: 'קצב רענון נתונים',
            required: true,
            options: [
              { value: 'realtime', label: 'Real-time', labelHe: 'זמן אמת' },
              { value: '5min', label: 'Every 5 minutes', labelHe: 'כל 5 דקות' },
              { value: 'hourly', label: 'Hourly', labelHe: 'שעתי' }
            ]
          },
          {
            id: 'access_control',
            type: 'checkbox',
            label: 'Role-based access control',
            labelHe: 'בקרת גישה מבוססת תפקיד',
            required: false
          }
        ]
      }
    ]
  },

  {
    serviceId: 'add-custom-reports',
    serviceName: 'Custom Automated Reports',
    serviceNameHe: 'דוחות אוטומטיים מותאמים',
    estimatedTimeMinutes: 25,
    sections: [
      {
        id: 'report-specs',
        title: 'Report Specifications',
        titleHe: 'מפרט דוח',
        order: 1,
        fields: [
          {
            id: 'report_list',
            type: 'list',
            label: 'Reports needed',
            labelHe: 'דוחות נדרשים',
            required: true,
            itemFields: [
              { id: 'report_name', type: 'text', label: 'Report Name', labelHe: 'שם דוח' },
              { id: 'frequency', type: 'text', label: 'Frequency', labelHe: 'תדירות' }
            ]
          },
          {
            id: 'format',
            type: 'multiselect',
            label: 'Report formats',
            labelHe: 'פורמטי דוח',
            required: true,
            options: [
              { value: 'pdf', label: 'PDF', labelHe: 'PDF' },
              { value: 'excel', label: 'Excel', labelHe: 'Excel' },
              { value: 'email', label: 'Email (HTML)', labelHe: 'אימייל (HTML)' }
            ]
          },
          {
            id: 'recipients',
            type: 'list',
            label: 'Report recipients',
            labelHe: 'נמעני דוח',
            required: true,
            itemFields: [
              { id: 'email', type: 'text', label: 'Email', labelHe: 'אימייל' }
            ]
          }
        ]
      }
    ]
  }
];

// Helper function to get requirements template by service ID
export const getRequirementsTemplate = (serviceId: string): ServiceRequirementsTemplate | null => {
  return SERVICE_REQUIREMENTS_TEMPLATES.find(template => template.serviceId === serviceId) || null;
};

// Helper function to get all templates for selected services
export const getRequirementsForServices = (serviceIds: string[]): ServiceRequirementsTemplate[] => {
  return serviceIds
    .map(id => getRequirementsTemplate(id))
    .filter((template): template is ServiceRequirementsTemplate => template !== undefined);
};
