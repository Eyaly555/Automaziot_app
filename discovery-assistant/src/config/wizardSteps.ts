import { WizardStep } from '../types';
import {
  TextField,
  SelectField,
  CheckboxGroup,
  RadioGroup,
  NumberField,
  TextAreaField,
  RatingField
} from '../components/Common/FormFields';

export const WIZARD_STEPS: WizardStep[] = [
  // Overview Module Steps
  {
    id: 'overview-basics',
    moduleId: 'overview',
    sectionName: 'פרטי עסק בסיסיים',
    fields: [
      {
        name: 'businessType',
        component: SelectField,
        props: {
          label: 'סוג העסק',
          options: [
            { value: 'b2b', label: 'B2B - עסק לעסק' },
            { value: 'b2c', label: 'B2C - עסק לצרכן' },
            { value: 'b2b2c', label: 'B2B2C - משולב' },
            { value: 'marketplace', label: 'מרקטפלייס' },
            { value: 'saas', label: 'SaaS' },
            { value: 'other', label: 'אחר' }
          ],
          required: true
        }
      },
      {
        name: 'employees',
        component: SelectField,
        props: {
          label: 'מספר עובדים',
          options: [
            { value: '1-10', label: '1-10' },
            { value: '11-50', label: '11-50' },
            { value: '51-200', label: '51-200' },
            { value: '200-500', label: '200-500' },
            { value: '500+', label: '500+' }
          ],
          required: true
        }
      }
    ],
    isOptional: false
  },
  {
    id: 'overview-challenges',
    moduleId: 'overview',
    sectionName: 'אתגרים ומטרות',
    fields: [
      {
        name: 'mainChallenge',
        component: TextAreaField,
        props: {
          label: 'מהו האתגר המרכזי שלכם היום?',
          rows: 3
        }
      },
      {
        name: 'processes',
        component: CheckboxGroup,
        props: {
          label: 'תהליכים עיקריים בעסק',
          options: [
            { value: 'sales', label: 'מכירות' },
            { value: 'service', label: 'שירות לקוחות' },
            { value: 'marketing', label: 'שיווק' },
            { value: 'operations', label: 'תפעול' },
            { value: 'hr', label: 'משאבי אנוש' },
            { value: 'finance', label: 'כספים' }
          ]
        }
      },
      {
        name: 'mainGoals',
        component: CheckboxGroup,
        props: {
          label: 'מטרות עיקריות לשנה הקרובה',
          options: [
            { value: 'efficiency', label: 'שיפור יעילות' },
            { value: 'growth', label: 'צמיחה' },
            { value: 'customer_satisfaction', label: 'שיפור שביעות רצון לקוחות' },
            { value: 'cost_reduction', label: 'הפחתת עלויות' },
            { value: 'innovation', label: 'חדשנות' }
          ]
        }
      }
    ],
    isOptional: false
  },

  // Leads and Sales Module Steps
  {
    id: 'leads-sources',
    moduleId: 'leadsAndSales',
    sectionName: 'מקורות לידים',
    fields: [
      {
        name: 'leadSources',
        component: CheckboxGroup,
        props: {
          label: 'מאילו מקורות מגיעים הלידים שלכם?',
          options: [
            { value: 'website', label: 'אתר אינטרנט' },
            { value: 'facebook', label: 'פייסבוק' },
            { value: 'google', label: 'גוגל' },
            { value: 'referrals', label: 'המלצות' },
            { value: 'events', label: 'אירועים' },
            { value: 'cold', label: 'פנייה קרה' },
            { value: 'partners', label: 'שותפים' }
          ]
        }
      }
    ],
    isOptional: false
  },
  {
    id: 'leads-response',
    moduleId: 'leadsAndSales',
    sectionName: 'מהירות תגובה',
    fields: [
      {
        name: 'speedToLead.duringBusinessHours',
        component: SelectField,
        props: {
          label: 'מהירות תגובה בשעות העבודה',
          options: [
            { value: 'immediate', label: 'מיידי (עד 5 דקות)' },
            { value: 'quick', label: 'מהיר (עד 30 דקות)' },
            { value: 'moderate', label: 'בינוני (עד שעה)' },
            { value: 'slow', label: 'איטי (מעל שעה)' }
          ]
        }
      },
      {
        name: 'speedToLead.afterHours',
        component: SelectField,
        props: {
          label: 'תגובה אחרי שעות העבודה',
          options: [
            { value: 'no_response', label: 'אין תגובה' },
            { value: 'partial', label: 'תגובה חלקית' },
            { value: 'full', label: 'תגובה מלאה' }
          ]
        }
      },
      {
        name: 'speedToLead.unansweredPercentage',
        component: NumberField,
        props: {
          label: 'אחוז לידים שלא נענים כלל',
          min: 0,
          max: 100,
          suffix: '%'
        }
      }
    ],
    isOptional: false
  },
  {
    id: 'leads-routing',
    moduleId: 'leadsAndSales',
    sectionName: 'ניתוב לידים',
    fields: [
      {
        name: 'leadRouting.method',
        component: SelectField,
        props: {
          label: 'איך מחלקים לידים בין נציגים?',
          options: [
            { value: 'rotation', label: 'רוטציה' },
            { value: 'expertise', label: 'לפי התמחות' },
            { value: 'territory', label: 'לפי טריטוריה' },
            { value: 'manual', label: 'ידני' }
          ]
        }
      }
    ],
    isOptional: true
  },
  {
    id: 'leads-followup',
    moduleId: 'leadsAndSales',
    sectionName: 'אסטרטגיית מעקב',
    fields: [
      {
        name: 'followUp.attempts',
        component: NumberField,
        props: {
          label: 'כמה ניסיונות מעקב נעשים?',
          min: 1,
          max: 20
        }
      },
      {
        name: 'followUp.channels',
        component: CheckboxGroup,
        props: {
          label: 'ערוצי מעקב',
          options: [
            { value: 'whatsapp', label: 'וואטסאפ' },
            { value: 'sms', label: 'SMS' },
            { value: 'email', label: 'אימייל' },
            { value: 'phone', label: 'טלפון' }
          ]
        }
      },
      {
        name: 'followUp.nurturing',
        component: RadioGroup,
        props: {
          label: 'האם יש תהליך טיפוח לידים?',
          options: [
            { value: 'yes', label: 'כן' },
            { value: 'no', label: 'לא' }
          ]
        }
      }
    ],
    isOptional: false
  },
  {
    id: 'leads-appointments',
    moduleId: 'leadsAndSales',
    sectionName: 'ניהול פגישות',
    fields: [
      {
        name: 'appointments.avgSchedulingTime',
        component: NumberField,
        props: {
          label: 'זמן ממוצע לתיאום פגישה (בדקות)',
          min: 1,
          max: 60
        }
      },
      {
        name: 'appointments.noShowRate',
        component: NumberField,
        props: {
          label: 'אחוז אי הגעה לפגישות',
          min: 0,
          max: 100,
          suffix: '%'
        }
      }
    ],
    isOptional: true
  },

  // Customer Service Module Steps
  {
    id: 'service-channels',
    moduleId: 'customerService',
    sectionName: 'ערוצי שירות',
    fields: [
      {
        name: 'channels',
        component: CheckboxGroup,
        props: {
          label: 'באילו ערוצים אתם נותנים שירות?',
          options: [
            { value: 'phone', label: 'טלפון' },
            { value: 'email', label: 'אימייל' },
            { value: 'whatsapp', label: 'וואטסאפ' },
            { value: 'chat', label: 'צ\'אט באתר' },
            { value: 'social', label: 'רשתות חברתיות' },
            { value: 'inperson', label: 'פרונטלי' }
          ]
        }
      }
    ],
    isOptional: false
  },
  {
    id: 'service-autoresponse',
    moduleId: 'customerService',
    sectionName: 'מענה אוטומטי',
    fields: [
      {
        name: 'autoResponse.automationPotential',
        component: NumberField,
        props: {
          label: 'אחוז שאלות שחוזרות על עצמן',
          min: 0,
          max: 100,
          suffix: '%'
        }
      }
    ],
    isOptional: true
  },
  {
    id: 'service-proactive',
    moduleId: 'customerService',
    sectionName: 'תקשורת יזומה',
    fields: [
      {
        name: 'proactiveCommunication.frequency',
        component: SelectField,
        props: {
          label: 'תדירות תקשורת יזומה',
          options: [
            { value: 'daily', label: 'יומי' },
            { value: 'weekly', label: 'שבועי' },
            { value: 'monthly', label: 'חודשי' },
            { value: 'rarely', label: 'נדיר' },
            { value: 'never', label: 'אף פעם' }
          ]
        }
      }
    ],
    isOptional: true
  },
  {
    id: 'service-community',
    moduleId: 'customerService',
    sectionName: 'ניהול קהילה',
    fields: [
      {
        name: 'communityManagement.exists',
        component: RadioGroup,
        props: {
          label: 'האם יש לכם קהילת לקוחות?',
          options: [
            { value: 'yes', label: 'כן' },
            { value: 'no', label: 'לא' }
          ]
        }
      }
    ],
    isOptional: true
  },
  {
    id: 'service-reputation',
    moduleId: 'customerService',
    sectionName: 'ניהול מוניטין',
    fields: [
      {
        name: 'reputationManagement.reviewsPerMonth',
        component: NumberField,
        props: {
          label: 'כמה ביקורות מקבלים בחודש?',
          min: 0,
          max: 1000
        }
      }
    ],
    isOptional: true
  },
  {
    id: 'service-onboarding',
    moduleId: 'customerService',
    sectionName: 'תהליך הטמעה',
    fields: [
      {
        name: 'onboarding.steps',
        component: TextAreaField,
        props: {
          label: 'תאר את תהליך ההטמעה של לקוחות חדשים',
          rows: 3
        }
      }
    ],
    isOptional: true
  },

  // Operations Module Steps
  {
    id: 'operations-systems',
    moduleId: 'operations',
    sectionName: 'סנכרון מערכות',
    fields: [
      {
        name: 'systemSync.manualWork',
        component: NumberField,
        props: {
          label: 'שעות עבודה ידנית בשבוע על העברת נתונים',
          min: 0,
          max: 168
        }
      },
      {
        name: 'systemSync.duplicateData',
        component: RadioGroup,
        props: {
          label: 'האם יש כפילויות במידע בין מערכות?',
          options: [
            { value: 'yes', label: 'כן' },
            { value: 'no', label: 'לא' }
          ]
        }
      }
    ],
    isOptional: false
  },
  {
    id: 'operations-documents',
    moduleId: 'operations',
    sectionName: 'ניהול מסמכים',
    fields: [
      {
        name: 'documentManagement.storage',
        component: SelectField,
        props: {
          label: 'איפה שומרים מסמכים?',
          options: [
            { value: 'cloud', label: 'ענן (Google Drive, Dropbox)' },
            { value: 'local', label: 'שרת מקומי' },
            { value: 'mixed', label: 'משולב' },
            { value: 'physical', label: 'פיזי בלבד' }
          ]
        }
      },
      {
        name: 'documentManagement.organization',
        component: SelectField,
        props: {
          label: 'רמת ארגון המסמכים',
          options: [
            { value: 'organized', label: 'מאורגן' },
            { value: 'messy', label: 'לא מאורגן' }
          ]
        }
      }
    ],
    isOptional: true
  },
  {
    id: 'operations-projects',
    moduleId: 'operations',
    sectionName: 'ניהול פרויקטים',
    fields: [
      {
        name: 'projectManagement.trackingTool',
        component: TextField,
        props: {
          label: 'באיזה כלי משתמשים לניהול פרויקטים?',
          placeholder: 'Monday, Asana, Excel...'
        }
      },
      {
        name: 'projectManagement.bottlenecks',
        component: TextAreaField,
        props: {
          label: 'מהם הצווארי בקבוק העיקריים?',
          rows: 2
        }
      }
    ],
    isOptional: true
  },
  {
    id: 'operations-financial',
    moduleId: 'operations',
    sectionName: 'תהליכים פיננסיים',
    fields: [
      {
        name: 'financialProcesses.invoicing.volumePerMonth',
        component: NumberField,
        props: {
          label: 'כמה חשבוניות בחודש?',
          min: 0,
          max: 10000
        }
      },
      {
        name: 'financialProcesses.invoicing.avgTimePerInvoice',
        component: NumberField,
        props: {
          label: 'זמן ממוצע להפקת חשבונית (דקות)',
          min: 1,
          max: 60
        }
      }
    ],
    isOptional: true
  },
  {
    id: 'operations-hr',
    moduleId: 'operations',
    sectionName: 'תהליכי HR',
    fields: [
      {
        name: 'hr.onboarding.totalTime',
        component: NumberField,
        props: {
          label: 'זמן כולל לקליטת עובד חדש (שעות)',
          min: 1,
          max: 200
        }
      },
      {
        name: 'hr.management.attendance',
        component: SelectField,
        props: {
          label: 'איך מנהלים נוכחות?',
          options: [
            { value: 'system', label: 'מערכת נוכחות' },
            { value: 'excel', label: 'אקסל' },
            { value: 'manual', label: 'ידני' },
            { value: 'none', label: 'לא מנהלים' }
          ]
        }
      }
    ],
    isOptional: true
  },
  {
    id: 'operations-crossdept',
    moduleId: 'operations',
    sectionName: 'תהליכים בין מחלקות',
    fields: [
      {
        name: 'crossDepartment.statusChecks.timePerDay',
        component: NumberField,
        props: {
          label: 'זמן יומי על בדיקת סטטוסים (דקות)',
          min: 0,
          max: 480
        }
      }
    ],
    isOptional: true
  },

  // Reporting Module Steps
  {
    id: 'reporting-alerts',
    moduleId: 'reporting',
    sectionName: 'התראות בזמן אמת',
    fields: [
      {
        name: 'realTimeAlerts',
        component: CheckboxGroup,
        props: {
          label: 'על מה תרצו לקבל התראות?',
          options: [
            { value: 'new_lead', label: 'ליד חדש' },
            { value: 'sale', label: 'מכירה' },
            { value: 'complaint', label: 'תלונה' },
            { value: 'system_error', label: 'תקלה במערכת' },
            { value: 'target_achievement', label: 'השגת יעד' }
          ]
        }
      }
    ],
    isOptional: true
  },
  {
    id: 'reporting-reports',
    moduleId: 'reporting',
    sectionName: 'דוחות קבועים',
    fields: [
      {
        name: 'scheduledReports',
        component: CheckboxGroup,
        props: {
          label: 'אילו דוחות אתם מפיקים?',
          options: [
            { value: 'sales', label: 'דוח מכירות' },
            { value: 'marketing', label: 'דוח שיווק' },
            { value: 'service', label: 'דוח שירות' },
            { value: 'financial', label: 'דוח פיננסי' },
            { value: 'operations', label: 'דוח תפעולי' }
          ]
        }
      }
    ],
    isOptional: true
  },
  {
    id: 'reporting-kpis',
    moduleId: 'reporting',
    sectionName: 'מדדי ביצוע',
    fields: [
      {
        name: 'kpis',
        component: TextAreaField,
        props: {
          label: 'מהם ה-KPIs העיקריים שאתם מודדים?',
          rows: 3,
          placeholder: 'רשום את המדדים המרכזיים...'
        }
      }
    ],
    isOptional: true
  },
  {
    id: 'reporting-dashboards',
    moduleId: 'reporting',
    sectionName: 'דשבורדים',
    fields: [
      {
        name: 'dashboards.exists',
        component: RadioGroup,
        props: {
          label: 'האם יש לכם דשבורדים?',
          options: [
            { value: 'yes', label: 'כן' },
            { value: 'no', label: 'לא' }
          ]
        }
      },
      {
        name: 'dashboards.realTime',
        component: RadioGroup,
        props: {
          label: 'האם הדשבורדים בזמן אמת?',
          options: [
            { value: 'yes', label: 'כן' },
            { value: 'no', label: 'לא' }
          ]
        },
        skipCondition: (data) => !data.modules.reporting?.dashboards?.exists
      }
    ],
    isOptional: true
  },

  // AI Agents Module Steps
  {
    id: 'ai-sales',
    moduleId: 'aiAgents',
    sectionName: 'AI במכירות',
    fields: [
      {
        name: 'sales.useCases',
        component: CheckboxGroup,
        props: {
          label: 'אילו תהליכים במכירות מתאימים לאוטומציה?',
          options: [
            { value: 'lead_qualification', label: 'סינון לידים' },
            { value: 'first_contact', label: 'פנייה ראשונה' },
            { value: 'appointment_scheduling', label: 'תיאום פגישות' },
            { value: 'price_quotes', label: 'הצעות מחיר' },
            { value: 'followup', label: 'מעקב' }
          ]
        }
      },
      {
        name: 'sales.potential',
        component: SelectField,
        props: {
          label: 'פוטנציאל AI במכירות',
          options: [
            { value: 'high', label: 'גבוה' },
            { value: 'medium', label: 'בינוני' },
            { value: 'low', label: 'נמוך' }
          ]
        }
      }
    ],
    isOptional: true
  },
  {
    id: 'ai-service',
    moduleId: 'aiAgents',
    sectionName: 'AI בשירות',
    fields: [
      {
        name: 'service.useCases',
        component: CheckboxGroup,
        props: {
          label: 'אילו תהליכי שירות מתאימים לאוטומציה?',
          options: [
            { value: 'chatbot', label: 'צ\'אטבוט 24/7' },
            { value: 'sentiment', label: 'ניתוח סנטימנט' },
            { value: 'auto_response', label: 'מענה אוטומטי' },
            { value: 'routing', label: 'ניתוב פניות' },
            { value: 'knowledge', label: 'מאגר ידע חכם' }
          ]
        }
      },
      {
        name: 'service.potential',
        component: SelectField,
        props: {
          label: 'פוטנציאל AI בשירות',
          options: [
            { value: 'high', label: 'גבוה' },
            { value: 'medium', label: 'בינוני' },
            { value: 'low', label: 'נמוך' }
          ]
        }
      }
    ],
    isOptional: true
  },
  {
    id: 'ai-operations',
    moduleId: 'aiAgents',
    sectionName: 'AI בתפעול',
    fields: [
      {
        name: 'operations.useCases',
        component: CheckboxGroup,
        props: {
          label: 'אילו תהליכי תפעול מתאימים לאוטומציה?',
          options: [
            { value: 'document_processing', label: 'עיבוד מסמכים' },
            { value: 'data_entry', label: 'הזנת נתונים' },
            { value: 'invoice_processing', label: 'עיבוד חשבוניות' },
            { value: 'email_sorting', label: 'מיון אימיילים' },
            { value: 'report_generation', label: 'הפקת דוחות' }
          ]
        }
      },
      {
        name: 'operations.potential',
        component: SelectField,
        props: {
          label: 'פוטנציאל AI בתפעול',
          options: [
            { value: 'high', label: 'גבוה' },
            { value: 'medium', label: 'בינוני' },
            { value: 'low', label: 'נמוך' }
          ]
        }
      }
    ],
    isOptional: true
  },
  {
    id: 'ai-general',
    moduleId: 'aiAgents',
    sectionName: 'הגדרות AI כלליות',
    fields: [
      {
        name: 'priority',
        component: SelectField,
        props: {
          label: 'איפה הכי חשוב להטמיע AI?',
          options: [
            { value: 'sales', label: 'מכירות' },
            { value: 'service', label: 'שירות' },
            { value: 'operations', label: 'תפעול' }
          ]
        }
      },
      {
        name: 'naturalLanguageImportance',
        component: SelectField,
        props: {
          label: 'חשיבות עיבוד שפה טבעית בעברית',
          options: [
            { value: 'critical', label: 'קריטי' },
            { value: 'important', label: 'חשוב' },
            { value: 'less_important', label: 'פחות חשוב' }
          ]
        }
      }
    ],
    isOptional: false
  },

  // Systems Module Steps
  {
    id: 'systems-current',
    moduleId: 'systems',
    sectionName: 'מערכות קיימות',
    fields: [
      {
        name: 'currentSystems',
        component: CheckboxGroup,
        props: {
          label: 'אילו מערכות קיימות בארגון?',
          options: [
            { value: 'crm', label: 'CRM' },
            { value: 'erp', label: 'ERP' },
            { value: 'marketing', label: 'מערכת שיווק' },
            { value: 'helpdesk', label: 'מערכת תמיכה' },
            { value: 'accounting', label: 'מערכת הנהלת חשבונות' },
            { value: 'project', label: 'ניהול פרויקטים' },
            { value: 'hr', label: 'מערכת HR' },
            { value: 'inventory', label: 'מערכת מלאי' }
          ],
          allowCustom: true // Enable custom entries
        }
      }
    ],
    isOptional: false
  },
  {
    id: 'systems-integrations',
    moduleId: 'systems',
    sectionName: 'אינטגרציות',
    fields: [
      {
        name: 'integrations',
        component: TextAreaField,
        props: {
          label: 'תאר את האינטגרציות הקיימות והבעיות',
          rows: 3,
          placeholder: 'למשל: CRM לא מסונכרן עם מערכת החשבוניות...'
        }
      }
    ],
    isOptional: true
  },
  {
    id: 'systems-dataquality',
    moduleId: 'systems',
    sectionName: 'איכות נתונים',
    fields: [
      {
        name: 'dataQuality.duplicates',
        component: SelectField,
        props: {
          label: 'כמות כפילויות במערכות',
          options: [
            { value: 'many', label: 'הרבה' },
            { value: 'some', label: 'קצת' },
            { value: 'none', label: 'אין' }
          ]
        }
      },
      {
        name: 'dataQuality.accuracy',
        component: SelectField,
        props: {
          label: 'רמת דיוק הנתונים',
          options: [
            { value: 'high', label: 'גבוהה' },
            { value: 'medium', label: 'בינונית' },
            { value: 'low', label: 'נמוכה' }
          ]
        }
      },
      {
        name: 'dataQuality.completeness',
        component: NumberField,
        props: {
          label: 'אחוז שלמות הנתונים',
          min: 0,
          max: 100,
          suffix: '%'
        }
      }
    ],
    isOptional: true
  },

  // ROI Module Steps
  {
    id: 'roi-current-costs',
    moduleId: 'roi',
    sectionName: 'עלויות נוכחיות',
    fields: [
      {
        name: 'calculations',
        component: TextAreaField,
        props: {
          label: 'הערות לגבי עלויות נוכחיות',
          rows: 2,
          placeholder: 'עלויות נוספות שיש לקחת בחשבון...'
        }
      }
    ],
    isOptional: true
  },
  {
    id: 'roi-summary',
    moduleId: 'roi',
    sectionName: 'סיכום ROI',
    fields: [
      {
        name: 'summary',
        component: TextAreaField,
        props: {
          label: 'הערות נוספות לחישוב ROI',
          rows: 2
        }
      }
    ],
    isOptional: true
  },

  // Planning Module Steps
  {
    id: 'planning-vision',
    moduleId: 'planning',
    sectionName: 'חזון ומטרות',
    fields: [
      {
        name: 'vision',
        component: TextAreaField,
        props: {
          label: 'מהו החזון שלכם לאוטומציה בארגון?',
          rows: 3
        }
      }
    ],
    isOptional: false
  },
  {
    id: 'planning-priorities',
    moduleId: 'planning',
    sectionName: 'סדרי עדיפויות',
    fields: [
      {
        name: 'priorities',
        component: CheckboxGroup,
        props: {
          label: 'מהן 3 העדיפויות העליונות?',
          options: [
            { value: 'sales_automation', label: 'אוטומציית מכירות' },
            { value: 'service_improvement', label: 'שיפור שירות' },
            { value: 'operational_efficiency', label: 'יעילות תפעולית' },
            { value: 'reporting_dashboards', label: 'דוחות ודשבורדים' },
            { value: 'system_integration', label: 'אינטגרציה בין מערכות' },
            { value: 'ai_implementation', label: 'הטמעת AI' }
          ],
          max: 3
        }
      }
    ],
    isOptional: false
  },
  {
    id: 'planning-kpis',
    moduleId: 'planning',
    sectionName: 'יעדים ומדדים',
    fields: [
      {
        name: 'kpis',
        component: TextAreaField,
        props: {
          label: 'מהם היעדים המדידים שתרצו להשיג?',
          rows: 3,
          placeholder: 'למשל: הפחתת זמן תגובה ב-50%, הגדלת מכירות ב-20%...'
        }
      }
    ],
    isOptional: true
  },
  {
    id: 'planning-nextsteps',
    moduleId: 'planning',
    sectionName: 'צעדים הבאים',
    fields: [
      {
        name: 'nextSteps',
        component: TextAreaField,
        props: {
          label: 'מהם הצעדים הבאים שצריך לעשות?',
          rows: 3
        }
      }
    ],
    isOptional: false
  },
  {
    id: 'planning-questions',
    moduleId: 'planning',
    sectionName: 'שאלות פתוחות',
    fields: [
      {
        name: 'openQuestions',
        component: TextAreaField,
        props: {
          label: 'האם יש שאלות פתוחות שנותרו?',
          rows: 2
        }
      }
    ],
    isOptional: true
  }
];

export const WIZARD_FLOW = {
  linear: [
    'overview',
    'leadsAndSales',
    'customerService',
    'operations',
    'reporting',
    'aiAgents',
    'systems',
    'roi',
    'planning'
  ],
  conditional: {
    'b2b': ['overview', 'leadsAndSales', 'operations', 'systems', 'reporting', 'aiAgents', 'roi', 'planning'],
    'b2c': ['overview', 'customerService', 'operations', 'systems', 'reporting', 'aiAgents', 'roi', 'planning'],
    'b2b2c': ['overview', 'leadsAndSales', 'customerService', 'operations', 'systems', 'reporting', 'aiAgents', 'roi', 'planning'],
    'marketplace': ['overview', 'leadsAndSales', 'customerService', 'operations', 'systems', 'reporting', 'aiAgents', 'roi', 'planning'],
    'saas': ['overview', 'customerService', 'operations', 'systems', 'reporting', 'aiAgents', 'roi', 'planning']
  }
};

export const getWizardStepsByBusinessType = (businessType: string): WizardStep[] => {
  const flow = WIZARD_FLOW.conditional[businessType] || WIZARD_FLOW.linear;
  return WIZARD_STEPS.filter(step => flow.includes(step.moduleId));
};

export const getTotalSteps = (): number => WIZARD_STEPS.length;

export const getStepById = (stepId: string): WizardStep | undefined => {
  return WIZARD_STEPS.find(step => step.id === stepId);
};

export const getNextStep = (currentStepId: string, businessType?: string): WizardStep | undefined => {
  const steps = businessType ? getWizardStepsByBusinessType(businessType) : WIZARD_STEPS;
  const currentIndex = steps.findIndex(step => step.id === currentStepId);
  return currentIndex >= 0 && currentIndex < steps.length - 1 ? steps[currentIndex + 1] : undefined;
};

export const getPreviousStep = (currentStepId: string, businessType?: string): WizardStep | undefined => {
  const steps = businessType ? getWizardStepsByBusinessType(businessType) : WIZARD_STEPS;
  const currentIndex = steps.findIndex(step => step.id === currentStepId);
  return currentIndex > 0 ? steps[currentIndex - 1] : undefined;
};