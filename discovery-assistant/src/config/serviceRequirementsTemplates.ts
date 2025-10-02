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
    serviceNameHe: 'הגשות טפסים ← עדכון אוטומטי ב-CRM',
    estimatedTimeMinutes: 10,
    sections: [
      {
        id: 'form-crm-config',
        title: 'Configuration',
        titleHe: 'הגדרה',
        order: 1,
        fields: [
          {
            id: 'form_sources',
            type: 'multiselect',
            label: 'Form sources',
            labelHe: 'מקורות טפסים',
            required: true,
            options: [
              { value: 'website', label: 'Website Forms', labelHe: 'טפסי אתר' },
              { value: 'facebook', label: 'Facebook Lead Ads', labelHe: 'Facebook Lead Ads' },
              { value: 'google', label: 'Google Forms', labelHe: 'Google Forms' },
              { value: 'typeform', label: 'Typeform', labelHe: 'Typeform' },
              { value: 'jotform', label: 'JotForm', labelHe: 'JotForm' }
            ]
          },
          {
            id: 'crm_system',
            type: 'text',
            label: 'CRM System',
            labelHe: 'מערכת CRM',
            required: true,
            placeholderHe: 'לדוגמא: Zoho CRM, Salesforce, HubSpot...'
          },
          {
            id: 'create_as',
            type: 'radio',
            label: 'Create submission as:',
            labelHe: 'צור הגשה בתור:',
            required: true,
            options: [
              { value: 'lead', label: 'Lead', labelHe: 'ליד' },
              { value: 'contact', label: 'Contact', labelHe: 'איש קשר' },
              { value: 'deal', label: 'Deal/Opportunity', labelHe: 'עסקה/הזדמנות' }
            ]
          },
          {
            id: 'duplicate_check',
            type: 'checkbox',
            label: 'Check for duplicates before creating',
            labelHe: 'בדוק כפילויות לפני יצירה',
            required: false,
            helperTextHe: 'אם הליד כבר קיים, מעדכן אותו במקום ליצור חדש'
          },
          {
            id: 'auto_assign',
            type: 'checkbox',
            label: 'Auto-assign to sales rep',
            labelHe: 'הקצאה אוטומטית לנציג מכירות',
            required: false
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
