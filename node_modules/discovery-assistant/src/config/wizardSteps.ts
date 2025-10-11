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
  // ==================== OVERVIEW MODULE ====================
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
          label: 'תהליכים עסקיים עיקריים',
          options: [
            { value: 'sales', label: 'מכירות' },
            { value: 'marketing', label: 'שיווק' },
            { value: 'service', label: 'שירות לקוחות' },
            { value: 'operations', label: 'תפעול' },
            { value: 'finance', label: 'כספים' },
            { value: 'hr', label: 'משאבי אנוש' }
          ],
          columns: 2
        }
      },
      {
        name: 'currentSystems',
        component: CheckboxGroup,
        props: {
          label: 'מערכות קיימות',
          options: [
            { value: 'crm', label: 'CRM' },
            { value: 'erp', label: 'ERP' },
            { value: 'excel', label: 'Excel' },
            { value: 'accounting', label: 'חשבונאות' },
            { value: 'marketing', label: 'שיווק' },
            { value: 'ecommerce', label: 'מסחר אלקטרוני' },
            { value: 'none', label: 'אין' }
          ],
          columns: 2
        }
      },
      {
        name: 'mainGoals',
        component: CheckboxGroup,
        props: {
          label: 'מטרות עיקריות',
          options: [
            { value: 'save_time', label: 'חיסכון בזמן' },
            { value: 'reduce_errors', label: 'הפחתת טעויות' },
            { value: 'improve_service', label: 'שיפור שירות' },
            { value: 'increase_sales', label: 'הגדלת מכירות' },
            { value: 'better_data', label: 'נתונים טובים יותר' },
            { value: 'scale', label: 'התרחבות' }
          ],
          columns: 2
        }
      },
      {
        name: 'budget',
        component: SelectField,
        props: {
          label: 'טווח תקציב',
          options: [
            { value: 'under_10k', label: 'עד 10,000 ₪' },
            { value: '10k-30k', label: '10,000-30,000 ₪' },
            { value: '30k-50k', label: '30,000-50,000 ₪' },
            { value: '50k-100k', label: '50,000-100,000 ₪' },
            { value: 'over_100k', label: 'מעל 100,000 ₪' },
            { value: 'flexible', label: 'גמיש' }
          ]
        }
      }
    ],
    isOptional: false
  },

  // ==================== LEADS AND SALES MODULE ====================
  // 2.1 מקורות וקליטת לידים
  {
    id: 'leads-sources-intake',
    moduleId: 'leadsAndSales',
    sectionName: '2.1 מקורות וקליטת לידים',
    fields: [
      {
        name: 'leadSources.channels',
        component: CheckboxGroup,
        props: {
          label: 'ערוצי כניסה של לידים',
          options: [
            { value: 'website', label: 'אתר אינטרנט' },
            { value: 'facebook', label: 'פייסבוק' },
            { value: 'google', label: 'גוגל' },
            { value: 'referrals', label: 'המלצות' },
            { value: 'phone', label: 'טלפון' },
            { value: 'email', label: 'אימייל' },
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'instagram', label: 'אינסטגרם' },
            { value: 'linkedin', label: 'לינקדאין' },
            { value: 'tiktok', label: 'טיקטוק' },
            { value: 'youtube', label: 'יוטיוב' },
            { value: 'events', label: 'תערוכות/אירועים' },
            { value: 'partners', label: 'שותפים עסקיים' }
          ],
          columns: 2
        }
      },
      {
        name: 'leadSources.centralizationSystem',
        component: SelectField,
        props: {
          label: 'איפה מרוכזים כל הלידים?',
          options: [
            { value: 'crm', label: 'CRM' },
            { value: 'excel', label: 'Excel' },
            { value: 'manual', label: 'רישום ידני' },
            { value: 'scattered', label: 'מפוזר במקומות שונים' }
          ]
        }
      },
      {
        name: 'leadSources.commonIssues',
        component: CheckboxGroup,
        props: {
          label: 'בעיות נפוצות בקליטת לידים',
          options: [
            { value: 'channels_miss', label: 'יש ערוצים שהלידים מהם נופלים בין הכיסאות' },
            { value: 'duplicates', label: 'כפילויות - אותו ליד נכנס כמה פעמים' },
            { value: 'incomplete_info', label: 'מידע חסר בהרבה לידים' },
            { value: 'slow_processing', label: 'זמן רב עד שליד מטופל' },
            { value: 'lead_loss', label: 'לידים נופלים לגמרי' }
          ],
          columns: 2
        }
      },
      {
        name: 'leadSources.processingTime',
        component: NumberField,
        props: {
          label: 'זמן ממוצע לעיבוד ליד חדש (דקות)',
          min: 0,
          suffix: 'דקות'
        }
      },
      {
        name: 'leadSources.lostLeadCost',
        component: NumberField,
        props: {
          label: 'עלות ליד שנפל (₪)',
          min: 0,
          suffix: '₪'
        }
      }
    ],
    isOptional: false
  },

  // 2.2 Speed to Lead
  {
    id: 'leads-speed-to-lead',
    moduleId: 'leadsAndSales',
    sectionName: '2.2 מהירות תגובה (Speed to Lead)',
    fields: [
      {
        name: 'speedToLead.duringBusinessHours',
        component: SelectField,
        props: {
          label: 'זמן תגובה בשעות עבודה',
          options: [
            { value: 'immediate', label: 'מיידי (עד 5 דקות)' },
            { value: 'quick', label: 'מהיר (5-30 דקות)' },
            { value: 'moderate', label: 'בינוני (30-60 דקות)' },
            { value: 'slow', label: 'איטי (1-3 שעות)' },
            { value: 'very_slow', label: 'איטי מאוד (מעל 3 שעות)' }
          ]
        }
      },
      {
        name: 'speedToLead.responseTimeUnit',
        component: SelectField,
        props: {
          label: 'יחידת מדידה לזמן תגובה',
          options: [
            { value: 'minutes', label: 'דקות' },
            { value: 'hours', label: 'שעות' },
            { value: 'days', label: 'ימים' }
          ]
        }
      },
      {
        name: 'speedToLead.afterHours',
        component: SelectField,
        props: {
          label: 'מענה אחרי שעות עבודה',
          options: [
            { value: 'no_response', label: 'אין מענה' },
            { value: 'partial', label: 'מענה חלקי (בוט/הודעה אוטומטית)' },
            { value: 'full', label: 'מענה מלא' }
          ]
        }
      },
      {
        name: 'speedToLead.weekendHolidays',
        component: SelectField,
        props: {
          label: 'מענה בסופ"ש וחגים',
          options: [
            { value: 'no', label: 'לא' },
            { value: 'limited', label: 'מוגבל' },
            { value: 'yes', label: 'כן' }
          ]
        }
      },
      {
        name: 'speedToLead.unansweredPercentage',
        component: NumberField,
        props: {
          label: 'אחוז לידים שלא זוכים למענה כלל',
          min: 0,
          max: 100,
          suffix: '%'
        }
      },
      {
        name: 'speedToLead.whenUnavailable',
        component: TextAreaField,
        props: {
          label: 'מה קורה כאשר אף אחד לא זמין?',
          rows: 2,
          placeholder: 'תאר מה קורה ללידים כשאף אחד לא זמין...'
        }
      },
      {
        name: 'speedToLead.urgentVsRegular',
        component: RadioGroup,
        props: {
          label: 'האם יש הבדלה בין לידים דחופים לרגילים?',
          options: [
            { value: 'yes', label: 'כן - יש תהליך להבדיל' },
            { value: 'no', label: 'לא - כולם מטופלים אותו דבר' }
          ]
        }
      },
      {
        name: 'speedToLead.urgentHandling',
        component: TextAreaField,
        props: {
          label: 'איך מטפלים בלידים דחופים באופן שונה?',
          rows: 2,
          placeholder: 'תאר את ההבדל בטיפול בלידים דחופים...'
        }
      },
      {
        name: 'speedToLead.opportunity',
        component: TextAreaField,
        props: {
          label: 'הזדמנות לשיפור במהירות תגובה',
          rows: 2,
          placeholder: 'איפה רואים הזדמנות לשפר את מהירות התגובה?'
        }
      }
    ],
    isOptional: false
  },

  // 2.3 ניתוב וסיווג לידים
  {
    id: 'leads-routing-classification',
    moduleId: 'leadsAndSales',
    sectionName: '2.3 ניתוב וסיווג לידים',
    fields: [
      {
        name: 'leadRouting.method',
        component: CheckboxGroup,
        props: {
          label: 'שיטות חלוקת לידים (ניתן לבחור מספר)',
          options: [
            { value: 'rotation', label: 'תורנות/רוטציה' },
            { value: 'expertise', label: 'לפי התמחות' },
            { value: 'territory', label: 'לפי טריטוריה' },
            { value: 'load_balancing', label: 'איזון עומסים' },
            { value: 'manual', label: 'ידני' }
          ],
          columns: 2
        }
      },
      {
        name: 'leadRouting.methodDetails',
        component: TextAreaField,
        props: {
          label: 'פירוט שיטת החלוקה',
          rows: 2,
          placeholder: 'תאר בפירוט איך עובדת שיטת חלוקת הלידים...'
        }
      },
      {
        name: 'leadRouting.unavailableHandler',
        component: TextAreaField,
        props: {
          label: 'מה קורה כשהנציג הרלוונטי לא זמין?',
          rows: 2
        }
      },
      {
        name: 'leadRouting.hotLeadCriteria',
        component: CheckboxGroup,
        props: {
          label: 'קריטריונים ללידים "חמים"',
          options: [
            { value: 'budget', label: 'תקציב גבוה' },
            { value: 'urgency', label: 'דחיפות' },
            { value: 'fit', label: 'התאמה מושלמת למוצר' },
            { value: 'decision_maker', label: 'מקבל החלטות' },
            { value: 'referral', label: 'הגיע מהמלצה' },
            { value: 'large_org', label: 'ארגון גדול' }
          ],
          columns: 2
        }
      },
      {
        name: 'leadRouting.customHotLeadCriteria',
        component: TextAreaField,
        props: {
          label: 'קריטריונים נוספים ללידים חמים (אופציונלי)',
          rows: 2,
          placeholder: 'תאר קריטריונים ספציפיים נוספים שלכם...'
        }
      },
      {
        name: 'leadRouting.hotLeadPriority',
        component: TextAreaField,
        props: {
          label: 'איך מתעדפים לידים חמים?',
          rows: 2,
          placeholder: 'תאר את תהליך התעדוף והטיפול בלידים חמים...'
        }
      },
      {
        name: 'leadRouting.aiPotential',
        component: TextAreaField,
        props: {
          label: 'פוטנציאל ל-AI בניתוב לידים',
          rows: 2,
          placeholder: 'איפה AI יכול לסייע בניתוב וסיווג הלידים?'
        }
      }
    ],
    isOptional: false
  },

  // 2.4 מעקבים (Follow-up)
  {
    id: 'leads-followup',
    moduleId: 'leadsAndSales',
    sectionName: '2.4 מעקבים (Follow-up)',
    fields: [
      {
        name: 'followUp.attempts',
        component: NumberField,
        props: {
          label: 'כמה ניסיונות מעקב בממוצע?',
          min: 1,
          max: 20
        }
      },
      {
        name: 'followUp.day1Interval',
        component: RadioGroup,
        props: {
          label: 'יום 1 - מתי המעקב הראשון?',
          options: [
            { value: 'immediate', label: 'מיד אחרי הפנייה' },
            { value: 'same_day', label: 'באותו יום' },
            { value: 'next_day', label: 'יום למחרת' }
          ],
          orientation: 'horizontal'
        }
      },
      {
        name: 'followUp.day3Interval',
        component: RadioGroup,
        props: {
          label: 'יום 3 - תדירות מעקב',
          options: [
            { value: 'twice_daily', label: 'פעמיים ביום' },
            { value: 'daily', label: 'פעם ביום' },
            { value: 'every_two_days', label: 'כל יומיים' },
            { value: 'none', label: 'לא עושים מעקב ביום 3' }
          ],
          orientation: 'horizontal'
        }
      },
      {
        name: 'followUp.day7Interval',
        component: RadioGroup,
        props: {
          label: 'יום 7 - תדירות מעקב',
          options: [
            { value: 'daily', label: 'יומי' },
            { value: 'every_few_days', label: 'כל כמה ימים' },
            { value: 'weekly', label: 'שבועי' },
            { value: 'none', label: 'לא עושים מעקב ביום 7' }
          ],
          orientation: 'horizontal'
        }
      },
      {
        name: 'followUp.channels',
        component: CheckboxGroup,
        props: {
          label: 'ערוצי מעקב',
          options: [
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'sms', label: 'SMS' },
            { value: 'email', label: 'אימייל' },
            { value: 'phone', label: 'טלפון' },
            { value: 'linkedin', label: 'LinkedIn' },
            { value: 'facebook', label: 'Facebook Messenger' }
          ],
          columns: 3
        }
      },
      {
        name: 'followUp.dropoffRate',
        component: NumberField,
        props: {
          label: 'אחוז נשירה מחוסר מעקב',
          min: 0,
          max: 100,
          suffix: '%'
        }
      },
      {
        name: 'followUp.notNowHandling',
        component: TextAreaField,
        props: {
          label: 'איך מטפלים בלידים ש"לא עכשיו"?',
          rows: 2,
          placeholder: 'תאר את תהליך הטיפול בלידים שלא מוכנים כרגע...'
        }
      },
      {
        name: 'followUp.nurturing',
        component: RadioGroup,
        props: {
          label: 'האם יש תהליך Nurturing (חימום לידים)?',
          options: [
            { value: 'yes', label: 'כן - יש תהליך מסודר' },
            { value: 'partial', label: 'חלקי - עושים קצת' },
            { value: 'no', label: 'לא - אין תהליך' }
          ]
        }
      },
      {
        name: 'followUp.nurturingDescription',
        component: TextAreaField,
        props: {
          label: 'תיאור תהליך הנרטורינג',
          rows: 2,
          placeholder: 'תאר את תהליך חימום הלידים (אם קיים)...'
        }
      },
      {
        name: 'followUp.customerJourneyOpportunity',
        component: TextAreaField,
        props: {
          label: 'הזדמנות לשיפור במסע הלקוח',
          rows: 2,
          placeholder: 'איפה רואים הזדמנות לשפר את מסע הלקוח?'
        }
      }
    ],
    isOptional: false
  },

  // 2.5 קביעת פגישות וזימונים
  {
    id: 'leads-appointments',
    moduleId: 'leadsAndSales',
    sectionName: '2.5 קביעת פגישות וזימונים',
    fields: [
      {
        name: 'appointments.avgSchedulingTime',
        component: NumberField,
        props: {
          label: 'זמן ממוצע לתיאום פגישה (בדקות)',
          min: 1,
          max: 120,
          suffix: 'דקות'
        }
      },
      {
        name: 'appointments.messagesPerScheduling',
        component: NumberField,
        props: {
          label: 'כמה הודעות/שיחות לתיאום בממוצע?',
          min: 1,
          max: 50
        }
      },
      {
        name: 'appointments.cancellationRate',
        component: NumberField,
        props: {
          label: 'אחוז ביטולים',
          min: 0,
          max: 100,
          suffix: '%'
        }
      },
      {
        name: 'appointments.noShowRate',
        component: NumberField,
        props: {
          label: 'אחוז No-Show (לא הגיעו)',
          min: 0,
          max: 100,
          suffix: '%'
        }
      },
      {
        name: 'appointments.multipleParticipants',
        component: RadioGroup,
        props: {
          label: 'האם פגישות דורשות תיאום של מספר משתתפים?',
          options: [
            { value: 'yes', label: 'כן - לעיתים קרובות' },
            { value: 'sometimes', label: 'לפעמים' },
            { value: 'no', label: 'לא' }
          ]
        }
      },
      {
        name: 'appointments.changesPerWeek',
        component: NumberField,
        props: {
          label: 'כמה שינויים/דחיות בשבוע?',
          min: 0
        }
      },
      {
        name: 'appointments.reminders',
        component: CheckboxGroup,
        props: {
          label: 'מתי שולחים תזכורות?',
          options: [
            { value: 'day_before', label: 'יום לפני' },
            { value: 'hour_before', label: 'שעה לפני' },
            { value: 'morning_of', label: 'בבוקר של היום' },
            { value: 'other', label: 'אחר' }
          ],
          columns: 2
        }
      },
      {
        name: 'appointments.reminderChannels',
        component: CheckboxGroup,
        props: {
          label: 'ערוצי תזכורות',
          options: [
            { value: 'sms', label: 'SMS' },
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'email', label: 'אימייל' },
            { value: 'phone', label: 'שיחת טלפון' }
          ],
          columns: 2
        }
      },
      {
        name: 'appointments.reminders.customTime',
        component: TextField,
        props: {
          label: 'זמן תזכורת מותאם אישית (אופציונלי)',
          placeholder: 'לדוגמה: שעתיים לפני, 30 דקות לפני...'
        }
      },
      {
        name: 'appointments.criticalPain',
        component: RadioGroup,
        props: {
          label: 'האם תיאום פגישות הוא נקודת כאב קריטית?',
          options: [
            { value: 'yes', label: 'כן - זה מאתגר מאוד' },
            { value: 'somewhat', label: 'במידה מסוימת' },
            { value: 'no', label: 'לא - זה זורם טוב' }
          ]
        }
      }
    ],
    isOptional: false
  },

  // ==================== CUSTOMER SERVICE MODULE ====================
  // 3.1 ערוצי שירות רב-ערוצי
  {
    id: 'service-multichannel',
    moduleId: 'customerService',
    sectionName: '3.1 ערוצי שירות רב-ערוצי',
    fields: [
      {
        name: 'channels.active',
        component: CheckboxGroup,
        props: {
          label: 'באילו ערוצים אתם נותנים שירות?',
          options: [
            { value: 'phone', label: 'טלפון' },
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'email', label: 'אימייל' },
            { value: 'facebook', label: 'פייסבוק' },
            { value: 'instagram', label: 'אינסטגרם' },
            { value: 'chat', label: 'צ\'אט באתר' },
            { value: 'sms', label: 'SMS' },
            { value: 'inperson', label: 'פרונטלי' },
            { value: 'telegram', label: 'טלגרם' },
            { value: 'tiktok', label: 'טיקטוק' },
            { value: 'linkedin', label: 'לינקדאין' }
          ],
          columns: 2
        }
      },
      {
        name: 'channels.crossChannelIssue',
        component: RadioGroup,
        props: {
          label: 'האם לקוחות פונים באותו נושא בכמה ערוצים?',
          options: [
            { value: 'critical', label: 'כן, זו בעיה קריטית' },
            { value: 'minor', label: 'קורה, אבל לא משהו קריטי' },
            { value: 'no', label: 'לא, אין כזו בעיה' }
          ]
        }
      },
      {
        name: 'multiChannelIssue',
        component: TextAreaField,
        props: {
          label: 'תיאור בעיית ריבוי ערוצים',
          rows: 2,
          placeholder: 'תאר מה קורה כשלקוח פונה בכמה ערוצים על אותו נושא...'
        }
      },
      {
        name: 'channels.unificationMethod',
        component: RadioGroup,
        props: {
          label: 'איך מאחדים פניות מערוצים שונים?',
          options: [
            { value: 'unified_system', label: 'מערכת מאוחדת - הכל במקום אחד' },
            { value: 'manual', label: 'ידני - עוברים בין מערכות' },
            { value: 'none', label: 'לא מאחדים - כל ערוץ עובד בנפרד' }
          ]
        }
      }
    ],
    isOptional: false
  },

  // 3.2 מענה אוטומטי ושאלות נפוצות
  {
    id: 'service-autoresponse',
    moduleId: 'customerService',
    sectionName: '3.2 מענה אוטומטי ושאלות נפוצות',
    fields: [
      {
        name: 'autoResponse.repeatingRequests',
        component: CheckboxGroup,
        props: {
          label: 'בקשות שירות חוזרות',
          options: [
            { value: 'status_check', label: 'בדיקת סטטוס הזמנה' },
            { value: 'update_details', label: 'עדכון פרטים' },
            { value: 'generate_docs', label: 'הפקת מסמכים' },
            { value: 'cancel_service', label: 'ביטול שירות' },
            { value: 'schedule', label: 'קביעת תור' },
            { value: 'payment_inquiry', label: 'בירור תשלום' },
            { value: 'technical_support', label: 'תמיכה טכנית' },
            { value: 'refund', label: 'בקשת החזר כספי' }
          ],
          columns: 2
        }
      },
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
    isOptional: false
  },

  // 3.3 תקשורת יזומה ועדכונים
  {
    id: 'service-proactive',
    moduleId: 'customerService',
    sectionName: '3.3 תקשורת יזומה ועדכונים',
    fields: [
      {
        name: 'proactiveCommunication.updateTriggers',
        component: CheckboxGroup,
        props: {
          label: 'מה מעורר צורך בעדכון ללקוח?',
          options: [
            { value: 'post_purchase', label: 'אחרי רכישה' },
            { value: 'during_process', label: 'במהלך תהליך' },
            { value: 'before_completion', label: 'לפני סיום' },
            { value: 'periodic', label: 'תקופתי' },
            { value: 'milestones', label: 'באבני דרך' },
            { value: 'post_resolution', label: 'אחרי פתרון בעיה' }
          ],
          columns: 2
        }
      },
      {
        name: 'proactiveCommunication.updateChannelMapping',
        component: TextAreaField,
        props: {
          label: 'איזה עדכון באיזה ערוץ?',
          rows: 3,
          placeholder: 'תאר איזה סוג עדכונים שולחים באיזה ערוץ (SMS, WhatsApp, Email, וכו...)...'
        }
      },
      {
        name: 'proactiveCommunication.whatMattersToCustomers',
        component: TextAreaField,
        props: {
          label: 'מה באמת חשוב ללקוחות לדעת?',
          rows: 3,
          placeholder: 'תאר את המידע הכי חשוב שלקוחות רוצים לקבל...'
        }
      },
      {
        name: 'proactiveCommunication.customerNeeds',
        component: TextAreaField,
        props: {
          label: 'מה חשוב ללקוחות לדעת?',
          rows: 3,
          placeholder: 'תאר מה הלקוחות רוצים לדעת בכל שלב...'
        }
      },
      {
        name: 'proactiveCommunication.frequency',
        component: SelectField,
        props: {
          label: 'תדירות תקשורת עם לקוחות',
          options: [
            { value: 'daily', label: 'יומי' },
            { value: 'weekly', label: 'שבועי' },
            { value: 'monthly', label: 'חודשי' },
            { value: 'quarterly', label: 'רבעוני' },
            { value: 'rarely', label: 'נדיר' },
            { value: 'never', label: 'אף פעם' }
          ]
        }
      },
      {
        name: 'proactiveCommunication.contentType',
        component: CheckboxGroup,
        props: {
          label: 'סוג תקשורת',
          options: [
            { value: 'marketing', label: 'שיווקית' },
            { value: 'value', label: 'ערך מוסף' },
            { value: 'updates', label: 'עדכונים' },
            { value: 'educational', label: 'חינוכי' },
            { value: 'seasonal', label: 'עונתי' }
          ],
          columns: 2
        }
      },
      {
        name: 'proactiveCommunication.preparationHours',
        component: NumberField,
        props: {
          label: 'שעות הכנת עדכונים בשבוע',
          min: 0,
          suffix: 'שעות'
        }
      }
    ],
    isOptional: false
  },

  // 3.4 ניהול קהילות ואירועים
  {
    id: 'service-community',
    moduleId: 'customerService',
    sectionName: '3.4 ניהול קהילות ואירועים',
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
      },
      {
        name: 'communityManagement.size',
        component: NumberField,
        props: {
          label: 'גודל הקהילה',
          min: 0
        },
        skipCondition: (data) => data.modules.customerService?.communityManagement?.exists !== 'yes'
      },
      {
        name: 'communityManagement.platforms',
        component: CheckboxGroup,
        props: {
          label: 'פלטפורמות',
          options: [
            { value: 'facebook', label: 'Facebook Group' },
            { value: 'whatsapp', label: 'WhatsApp Groups' },
            { value: 'telegram', label: 'Telegram' },
            { value: 'discord', label: 'Discord' },
            { value: 'slack', label: 'Slack' },
            { value: 'forum', label: 'פורום' },
            { value: 'instagram', label: 'Instagram' },
            { value: 'youtube', label: 'YouTube' }
          ],
          columns: 2
        },
        skipCondition: (data) => data.modules.customerService?.communityManagement?.exists !== 'yes'
      },
      {
        name: 'communityManagement.challenges',
        component: CheckboxGroup,
        props: {
          label: 'אתגרים בניהול הקהילה',
          options: [
            { value: 'list_management', label: 'ניהול רשימות' },
            { value: 'personalization', label: 'תקשורת מותאמת אישית' },
            { value: 'low_engagement', label: 'Engagement נמוך' },
            { value: 'moderation', label: 'מודרציה' },
            { value: 'spam', label: 'ספאם' },
            { value: 'multiple_platforms', label: 'ניהול מספר פלטפורמות' }
          ],
          columns: 2
        },
        skipCondition: (data) => data.modules.customerService?.communityManagement?.exists !== 'yes'
      },
      {
        name: 'communityManagement.eventsPerMonth',
        component: NumberField,
        props: {
          label: 'אירועים/וובינרים לחודש',
          min: 0
        }
      },
      {
        name: 'communityManagement.registrationManagement',
        component: RadioGroup,
        props: {
          label: 'ניהול הרשמות',
          options: [
            { value: 'manual', label: 'ידני' },
            { value: 'system', label: 'מערכת' },
            { value: 'mixed', label: 'משולב' }
          ]
        }
      },
      {
        name: 'communityManagement.attendanceRate',
        component: NumberField,
        props: {
          label: 'אחוז הגעה בפועל',
          min: 0,
          max: 100,
          suffix: '%'
        }
      }
    ],
    isOptional: false
  },

  // 3.5 ניהול מוניטין ומשוב
  {
    id: 'service-reputation',
    moduleId: 'customerService',
    sectionName: '3.5 ניהול מוניטין ומשוב',
    fields: [
      {
        name: 'reputationManagement.feedbackTiming',
        component: CheckboxGroup,
        props: {
          label: 'מתי אוספים משוב?',
          options: [
            { value: 'post_purchase', label: 'אחרי רכישה' },
            { value: 'periodic', label: 'תקופתי' },
            { value: 'post_service', label: 'אחרי שירות' },
            { value: 'post_complaint', label: 'אחרי תלונה' },
            { value: 'random', label: 'אקראי' }
          ],
          columns: 2
        }
      },
      {
        name: 'reputationManagement.collectionMethod',
        component: CheckboxGroup,
        props: {
          label: 'איך אוספים משוב?',
          options: [
            { value: 'form', label: 'טופס' },
            { value: 'call', label: 'שיחת טלפון' },
            { value: 'sms', label: 'SMS' },
            { value: 'email', label: 'אימייל' },
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'app', label: 'אפליקציה' }
          ],
          columns: 3
        }
      },
      {
        name: 'reputationManagement.responseRate',
        component: NumberField,
        props: {
          label: 'אחוז תגובה למשוב',
          min: 0,
          max: 100,
          suffix: '%'
        }
      },
      {
        name: 'reputationManagement.actionTaken',
        component: TextAreaField,
        props: {
          label: 'מה עושים עם המשוב?',
          rows: 2,
          placeholder: 'תאר איך משתמשים במשוב שנאסף...'
        }
      },
      {
        name: 'reputationManagement.reviewsPerMonth',
        component: NumberField,
        props: {
          label: 'כמה ביקורות מקבלים בחודש?',
          min: 0
        }
      },
      {
        name: 'reputationManagement.platforms',
        component: CheckboxGroup,
        props: {
          label: 'פלטפורמות ביקורות',
          options: [
            { value: 'google', label: 'Google' },
            { value: 'facebook', label: 'Facebook' },
            { value: 'website', label: 'אתר' },
            { value: 'tripadvisor', label: 'TripAdvisor' },
            { value: 'yelp', label: 'Yelp' },
            { value: 'zap', label: 'זאפ' }
          ],
          columns: 3
        }
      },
      {
        name: 'reputationManagement.encouragementStrategy',
        component: TextAreaField,
        props: {
          label: 'אסטרטגיה לעידוד ביקורות חיוביות',
          rows: 2
        }
      },
      {
        name: 'reputationManagement.negativeHandling',
        component: TextAreaField,
        props: {
          label: 'איך מטפלים בביקורות שליליות?',
          rows: 2
        }
      }
    ],
    isOptional: false
  },

  // 3.6 Onboarding לקוחות חדשים
  {
    id: 'service-onboarding',
    moduleId: 'customerService',
    sectionName: '3.6 תהליך הטמעה (Onboarding)',
    fields: [
      {
        name: 'onboarding.steps',
        component: TextAreaField,
        props: {
          label: 'תאר את תהליך ההטמעה של לקוחות חדשים',
          rows: 3,
          placeholder: 'תאר את השלבים מרגע שלקוח חדש מצטרף...'
        }
      },
      {
        name: 'onboarding.followUpChecks',
        component: CheckboxGroup,
        props: {
          label: 'בדיקות Follow-up',
          options: [
            { value: '3_days', label: 'אחרי 3 ימים' },
            { value: '1_week', label: 'אחרי שבוע' },
            { value: '2_weeks', label: 'אחרי שבועיים' },
            { value: '1_month', label: 'אחרי חודש' },
            { value: '3_months', label: 'אחרי 3 חודשים' },
            { value: '6_months', label: 'אחרי חצי שנה' }
          ],
          columns: 3
        }
      },
      {
        name: 'onboarding.missingDataAlerts',
        component: RadioGroup,
        props: {
          label: 'האם יש התראות על חוסרים בתהליך?',
          options: [
            { value: 'yes', label: 'כן - יש מערכת התראות' },
            { value: 'no', label: 'לא - אין התראות' }
          ]
        }
      },
      {
        name: 'onboarding.commonIssues',
        component: TextAreaField,
        props: {
          label: 'בעיות נפוצות בקליטה',
          rows: 2,
          placeholder: 'תאר בעיות נפוצות שמתעוררות בתהליך הקליטה...'
        }
      }
    ],
    isOptional: false
  },

  // ==================== OPERATIONS MODULE ====================
  // 4.1 תהליכי עבודה
  {
    id: 'operations-workflows',
    moduleId: 'operations',
    sectionName: '4.1 תהליכי עבודה',
    fields: [
      {
        name: 'workProcesses.commonFailures',
        component: CheckboxGroup,
        props: {
          label: 'נקודות כשל נפוצות',
          options: [
            { value: 'manual_errors', label: 'טעויות אנוש' },
            { value: 'system_crashes', label: 'קריסות מערכת' },
            { value: 'missing_info', label: 'מידע חסר' },
            { value: 'communication', label: 'תקשורת לקויה' },
            { value: 'approval_delays', label: 'עיכובי אישורים' },
            { value: 'resource_shortage', label: 'מחסור במשאבים' }
          ],
          columns: 2
        }
      },
      {
        name: 'workProcesses.errorTrackingSystem',
        component: SelectField,
        props: {
          label: 'מערכת מעקב שגיאות',
          options: [
            { value: 'none', label: 'אין מעקב' },
            { value: 'manual', label: 'רישום ידני' },
            { value: 'excel', label: 'Excel' },
            { value: 'system', label: 'מערכת ייעודית' },
            { value: 'crm', label: 'ב-CRM' }
          ]
        }
      },
      {
        name: 'workProcesses.processDocumentation',
        component: TextAreaField,
        props: {
          label: 'תיעוד תהליכים',
          rows: 3,
          placeholder: 'איך מתועדים התהליכים בארגון? האם יש נהלי עבודה כתובים?'
        }
      },
      {
        name: 'workProcesses.automationReadiness',
        component: NumberField,
        props: {
          label: 'בשלות לאוטומציה (0-100%)',
          min: 0,
          max: 100,
          suffix: '%'
        }
      }
    ],
    isOptional: false
  },

  // 4.2 ניהול מסמכים
  {
    id: 'operations-documents',
    moduleId: 'operations',
    sectionName: '4.2 ניהול מסמכים',
    fields: [
      {
        name: 'documentManagement.storageLocations',
        component: CheckboxGroup,
        props: {
          label: 'מיקומי אחסון',
          options: [
            { value: 'google_drive', label: 'Google Drive' },
            { value: 'dropbox', label: 'Dropbox' },
            { value: 'sharepoint', label: 'SharePoint' },
            { value: 'local_server', label: 'שרת מקומי' },
            { value: 'physical', label: 'ארכיב פיזי' },
            { value: 'cloud', label: 'ענן אחר' }
          ],
          columns: 3
        }
      },
      {
        name: 'documentManagement.searchDifficulties',
        component: TextAreaField,
        props: {
          label: 'קשיים באיתור מסמכים',
          rows: 3,
          placeholder: 'תאר קשיים באיתור מסמכים, זמן חיפוש ממוצע, בעיות בארגון התיקיות...'
        }
      },
      {
        name: 'documentManagement.versionControlMethod',
        component: SelectField,
        props: {
          label: 'בקרת גרסאות',
          options: [
            { value: 'none', label: 'אין בקרת גרסאות' },
            { value: 'manual_naming', label: 'שמות ידניים (v1, v2)' },
            { value: 'system', label: 'מערכת אוטומטית' },
            { value: 'sharepoint', label: 'SharePoint versions' },
            { value: 'git', label: 'Git או דומה' }
          ]
        }
      },
      {
        name: 'documentManagement.approvalWorkflow',
        component: TextAreaField,
        props: {
          label: 'תהליכי אישור',
          rows: 2,
          placeholder: 'תאר את שרשרת האישורים הנדרשת למסמכים שונים'
        }
      },
      {
        name: 'documentManagement.documentRetention',
        component: NumberField,
        props: {
          label: 'תקופת שמירת מסמכים (שנים)',
          min: 0,
          suffix: 'שנים'
        }
      }
    ],
    isOptional: false
  },

  // 4.3 ניהול פרויקטים
  {
    id: 'operations-projects',
    moduleId: 'operations',
    sectionName: '4.3 ניהול פרויקטים',
    fields: [
      {
        name: 'projectManagement.tools',
        component: CheckboxGroup,
        props: {
          label: 'כלי ניהול פרויקטים',
          options: [
            { value: 'monday', label: 'Monday.com' },
            { value: 'asana', label: 'Asana' },
            { value: 'trello', label: 'Trello' },
            { value: 'jira', label: 'Jira' },
            { value: 'notion', label: 'Notion' },
            { value: 'excel', label: 'Excel' },
            { value: 'ms_project', label: 'MS Project' }
          ],
          columns: 3
        }
      },
      {
        name: 'projectManagement.taskCreationSources',
        component: CheckboxGroup,
        props: {
          label: 'מקורות יצירת משימות',
          options: [
            { value: 'email', label: 'אימייל' },
            { value: 'meetings', label: 'ישיבות' },
            { value: 'phone', label: 'שיחות טלפון' },
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'crm', label: 'CRM' },
            { value: 'customers', label: 'פניות לקוחות' },
            { value: 'internal', label: 'יוזמות פנימיות' }
          ],
          columns: 2
        }
      },
      {
        name: 'projectManagement.resourceAllocationMethod',
        component: SelectField,
        props: {
          label: 'שיטת הקצאת משאבים',
          options: [
            { value: 'none', label: 'אין שיטה מסודרת' },
            { value: 'manual', label: 'ידני לפי זמינות' },
            { value: 'rotation', label: 'תורנות' },
            { value: 'skills', label: 'לפי כישורים' },
            { value: 'automated', label: 'אוטומטי במערכת' }
          ]
        }
      },
      {
        name: 'projectManagement.timelineAccuracy',
        component: NumberField,
        props: {
          label: 'דיוק בהערכת זמנים (0-100%)',
          min: 0,
          max: 100,
          suffix: '%'
        }
      },
      {
        name: 'projectManagement.projectVisibility',
        component: RadioGroup,
        props: {
          label: 'שקיפות סטטוס פרויקטים',
          options: [
            { value: 'none', label: 'אין שקיפות' },
            { value: 'meetings', label: 'רק בישיבות' },
            { value: 'dashboard', label: 'דשבורד משותף' },
            { value: 'realtime', label: 'עדכון בזמן אמת' }
          ],
          orientation: 'horizontal'
        }
      },
      {
        name: 'projectManagement.deadlineMissRate',
        component: NumberField,
        props: {
          label: 'אחוז פרויקטים שחורגים מלוח הזמנים',
          min: 0,
          max: 100,
          suffix: '%'
        }
      }
    ],
    isOptional: false
  },

  // 4.4 משאבי אנוש
  {
    id: 'operations-hr',
    moduleId: 'operations',
    sectionName: '4.4 משאבי אנוש',
    fields: [
      {
        name: 'hr.onboardingSteps',
        component: NumberField,
        props: {
          label: 'מספר שלבים בקליטת עובד',
          min: 0
        }
      },
      {
        name: 'hr.onboardingDuration',
        component: NumberField,
        props: {
          label: 'משך קליטת עובד (ימים)',
          min: 0,
          suffix: 'ימים'
        }
      },
      {
        name: 'hr.trainingRequirements',
        component: CheckboxGroup,
        props: {
          label: 'דרישות הדרכה',
          options: [
            { value: 'product', label: 'הכרת המוצר' },
            { value: 'systems', label: 'הכרת מערכות' },
            { value: 'procedures', label: 'נהלי עבודה' },
            { value: 'safety', label: 'בטיחות' },
            { value: 'compliance', label: 'ציות ורגולציה' },
            { value: 'soft_skills', label: 'מיומנויות רכות' },
            { value: 'technical', label: 'הכשרה טכנית' }
          ],
          columns: 2
        }
      },
      {
        name: 'hr.performanceReviewFrequency',
        component: SelectField,
        props: {
          label: 'תדירות הערכות עובדים',
          options: [
            { value: 'none', label: 'אין הערכות' },
            { value: 'annual', label: 'שנתי' },
            { value: 'biannual', label: 'חצי שנתי' },
            { value: 'quarterly', label: 'רבעוני' },
            { value: 'monthly', label: 'חודשי' }
          ]
        }
      },
      {
        name: 'hr.employeeTurnoverRate',
        component: NumberField,
        props: {
          label: 'שיעור תחלופת עובדים שנתי',
          min: 0,
          max: 100,
          suffix: '%'
        }
      },
      {
        name: 'hr.hrSystemsInUse',
        component: CheckboxGroup,
        props: {
          label: 'מערכות HR בשימוש',
          options: [
            { value: 'hilan', label: 'חילן' },
            { value: 'priority', label: 'Priority' },
            { value: 'sap', label: 'SAP' },
            { value: 'workday', label: 'Workday' },
            { value: 'excel', label: 'Excel' },
            { value: 'paper', label: 'ידני/נייר' }
          ],
          columns: 3
        }
      }
    ],
    isOptional: false
  },

  // 4.5 לוגיסטיקה
  {
    id: 'operations-logistics',
    moduleId: 'operations',
    sectionName: '4.5 לוגיסטיקה',
    fields: [
      {
        name: 'logistics.inventoryMethod',
        component: SelectField,
        props: {
          label: 'שיטת ניהול מלאי',
          options: [
            { value: 'none', label: 'אין ניהול מלאי' },
            { value: 'manual', label: 'ספירה ידנית' },
            { value: 'excel', label: 'Excel' },
            { value: 'erp', label: 'מערכת ERP' },
            { value: 'wms', label: 'מערכת WMS' },
            { value: 'rfid', label: 'RFID/ברקוד' }
          ]
        }
      },
      {
        name: 'logistics.shippingProcesses',
        component: CheckboxGroup,
        props: {
          label: 'תהליכי משלוח',
          options: [
            { value: 'self_delivery', label: 'משלוח עצמי' },
            { value: 'courier', label: 'חברות שליחויות' },
            { value: 'post', label: 'דואר ישראל' },
            { value: 'pickup', label: 'איסוף עצמי' },
            { value: 'dropshipping', label: 'Dropshipping' },
            { value: 'third_party', label: 'צד שלישי' }
          ],
          columns: 2
        }
      },
      {
        name: 'logistics.supplierCount',
        component: NumberField,
        props: {
          label: 'מספר ספקים פעילים',
          min: 0
        }
      },
      {
        name: 'logistics.orderFulfillmentTime',
        component: NumberField,
        props: {
          label: 'זמן ממוצע למימוש הזמנה (ימים)',
          min: 0,
          suffix: 'ימים'
        }
      },
      {
        name: 'logistics.warehouseOperations',
        component: CheckboxGroup,
        props: {
          label: 'פעולות מחסן',
          options: [
            { value: 'receiving', label: 'קבלת סחורה' },
            { value: 'quality_check', label: 'בדיקת איכות' },
            { value: 'storage', label: 'אחסון' },
            { value: 'picking', label: 'ליקוט' },
            { value: 'packing', label: 'אריזה' },
            { value: 'shipping', label: 'משלוח' },
            { value: 'returns', label: 'החזרות' }
          ],
          columns: 2
        }
      },
      {
        name: 'logistics.deliveryIssues',
        component: TextAreaField,
        props: {
          label: 'בעיות במשלוחים',
          rows: 3,
          placeholder: 'תאר בעיות נפוצות במשלוחים, איחורים, נזקים...'
        }
      },
      {
        name: 'logistics.returnProcessTime',
        component: NumberField,
        props: {
          label: 'זמן טיפול בהחזרה (ימים)',
          min: 0,
          suffix: 'ימים'
        }
      },
      {
        name: 'logistics.inventoryAccuracy',
        component: NumberField,
        props: {
          label: 'דיוק מלאי (0-100%)',
          min: 0,
          max: 100,
          suffix: '%'
        }
      }
    ],
    isOptional: false
  },

  // ==================== REPORTING MODULE ====================
  // 5.1 התראות בזמן אמת
  {
    id: 'reporting-alerts',
    moduleId: 'reporting',
    sectionName: '5.1 התראות בזמן אמת',
    fields: [
      {
        name: 'criticalAlerts',
        component: CheckboxGroup,
        props: {
          label: 'התראות קריטיות שחייבות להיות',
          options: [
            { value: 'new_lead', label: 'ליד חדש' },
            { value: 'payment_received', label: 'תשלום התקבל' },
            { value: 'payment_failed', label: 'תשלום נכשל' },
            { value: 'system_error', label: 'תקלת מערכת' },
            { value: 'customer_complaint', label: 'תלונת לקוח' },
            { value: 'stock_low', label: 'מלאי נמוך' },
            { value: 'deadline_approaching', label: 'דדליין מתקרב' }
          ],
          columns: 2
        }
      }
    ],
    isOptional: false
  },

  // 5.2 דוחות מתוזמנים
  {
    id: 'reporting-reports',
    moduleId: 'reporting',
    sectionName: '5.2 דוחות מתוזמנים',
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
          ],
          columns: 2
        }
      }
    ],
    isOptional: false
  },

  // 5.3 KPIs ודשבורדים
  {
    id: 'reporting-kpis',
    moduleId: 'reporting',
    sectionName: '5.3 KPIs ודשבורדים',
    fields: [
      {
        name: 'kpis',
        component: TextAreaField,
        props: {
          label: 'מהם ה-KPIs העיקריים שאתם מודדים?',
          rows: 3,
          placeholder: 'רשום את המדדים המרכזיים...'
        }
      },
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
            { value: 'yes', label: 'כן, מתעדכן אוטומטית' },
            { value: 'no', label: 'לא, עדכון ידני' }
          ]
        },
        skipCondition: (data) => data.modules.reporting?.dashboards?.exists !== 'yes'
      },
      {
        name: 'dashboards.anomalyDetection',
        component: RadioGroup,
        props: {
          label: 'זיהוי חריגות',
          options: [
            { value: 'automatic', label: 'אוטומטי' },
            { value: 'manual', label: 'ידני' },
            { value: 'none', label: 'אין' }
          ],
          orientation: 'horizontal'
        },
        skipCondition: (data) => data.modules.reporting?.dashboards?.exists !== 'yes'
      }
    ],
    isOptional: false
  },

  // ==================== AI AGENTS MODULE ====================
  // 6.1 AI במכירות
  {
    id: 'ai-sales',
    moduleId: 'aiAgents',
    sectionName: '6.1 AI במכירות',
    fields: [
      {
        name: 'sales.useCases',
        component: CheckboxGroup,
        props: {
          label: 'מקרי שימוש אפשריים',
          options: [
            { value: 'lead_qualification', label: 'סיווג לידים אוטומטי' },
            { value: 'first_contact', label: 'שיחה ראשונית עם לידים' },
            { value: 'appointment_scheduling', label: 'תיאום פגישות אוטומטי' },
            { value: 'price_quotes', label: 'הצעות מחיר אוטומטיות' },
            { value: 'follow_up', label: 'מעקבים אוטומטיים' },
            { value: 'nurturing', label: 'טיפוח לידים ארוך טווח' },
            { value: 'sales_insights', label: 'ניתוח ותובנות מכירות' },
            { value: 'personalization', label: 'התאמה אישית ללקוחות' },
            { value: 'predictive', label: 'חיזוי סגירת עסקאות' },
            { value: 'chatbot', label: 'בוט מכירות חכם' }
          ],
          columns: 2
        }
      },
      {
        name: 'sales.customUseCase',
        component: TextField,
        props: {
          label: 'מקרה שימוש נוסף',
          placeholder: 'תאר מקרה שימוש ספציפי נוסף...'
        }
      },
      {
        name: 'sales.potential',
        component: RatingField,
        props: {
          label: 'פוטנציאל השפעה על המכירות (1-5)',
          helperText: 'עד כמה AI יכול להשפיע על תהליכי המכירות?'
        }
      },
      {
        name: 'sales.readiness',
        component: SelectField,
        props: {
          label: 'מוכנות ליישום',
          options: [
            { value: '', label: 'בחר...' },
            { value: 'immediate', label: 'מיידי - אפשר להתחיל מחר' },
            { value: 'short', label: 'טווח קצר - תוך 3 חודשים' },
            { value: 'medium', label: 'טווח בינוני - תוך 6 חודשים' },
            { value: 'long', label: 'טווח ארוך - מעל 6 חודשים' },
            { value: 'not_ready', label: 'לא מוכנים כרגע' }
          ]
        }
      }
    ],
    isOptional: false
  },

  // 6.2 AI בשירות
  {
    id: 'ai-service',
    moduleId: 'aiAgents',
    sectionName: '6.2 AI בשירות לקוחות',
    fields: [
      {
        name: 'service.useCases',
        component: CheckboxGroup,
        props: {
          label: 'מקרי שימוש אפשריים',
          options: [
            { value: 'chatbot', label: "צ'אטבוט 24/7" },
            { value: 'sentiment', label: 'ניתוח סנטימנט' },
            { value: 'auto_response', label: 'תגובות אוטומטיות' },
            { value: 'routing', label: 'ניתוב חכם לנציגים' },
            { value: 'knowledge_base', label: 'מאגר ידע חכם' },
            { value: 'voice_assistant', label: 'עוזר קולי' },
            { value: 'ticket_classification', label: 'סיווג פניות אוטומטי' },
            { value: 'priority', label: 'תעדוף אוטומטי' },
            { value: 'translation', label: 'תרגום אוטומטי' },
            { value: 'summary', label: 'סיכום שיחות' }
          ],
          columns: 2
        }
      },
      {
        name: 'service.customUseCase',
        component: TextField,
        props: {
          label: 'מקרה שימוש נוסף',
          placeholder: 'תאר מקרה שימוש ספציפי נוסף...'
        }
      },
      {
        name: 'service.potential',
        component: RatingField,
        props: {
          label: 'פוטנציאל השפעה על השירות (1-5)',
          helperText: 'עד כמה AI יכול לשפר את השירות?'
        }
      },
      {
        name: 'service.readiness',
        component: SelectField,
        props: {
          label: 'מוכנות ליישום',
          options: [
            { value: '', label: 'בחר...' },
            { value: 'immediate', label: 'מיידי - אפשר להתחיל מחר' },
            { value: 'short', label: 'טווח קצר - תוך 3 חודשים' },
            { value: 'medium', label: 'טווח בינוני - תוך 6 חודשים' },
            { value: 'long', label: 'טווח ארוך - מעל 6 חודשים' },
            { value: 'not_ready', label: 'לא מוכנים כרגע' }
          ]
        }
      }
    ],
    isOptional: false
  },

  // 6.3 AI בתפעול
  {
    id: 'ai-operations',
    moduleId: 'aiAgents',
    sectionName: '6.3 AI בתפעול',
    fields: [
      {
        name: 'operations.useCases',
        component: CheckboxGroup,
        props: {
          label: 'מקרי שימוש אפשריים',
          options: [
            { value: 'document_processing', label: 'עיבוד מסמכים אוטומטי' },
            { value: 'data_entry', label: 'הזנת נתונים אוטומטית' },
            { value: 'invoice_processing', label: 'עיבוד חשבוניות' },
            { value: 'email_sorting', label: 'מיון וניתוב מיילים' },
            { value: 'report_generation', label: 'יצירת דוחות אוטומטית' },
            { value: 'scheduling', label: 'תזמון משימות חכם' },
            { value: 'quality_control', label: 'בקרת איכות אוטומטית' },
            { value: 'inventory', label: 'ניהול מלאי חכם' },
            { value: 'predictive_maintenance', label: 'תחזוקה חזויה' },
            { value: 'workflow_optimization', label: 'אופטימיזציה של תהליכים' }
          ],
          columns: 2
        }
      },
      {
        name: 'operations.customUseCase',
        component: TextField,
        props: {
          label: 'מקרה שימוש נוסף',
          placeholder: 'תאר מקרה שימוש ספציפי נוסף...'
        }
      },
      {
        name: 'operations.potential',
        component: RatingField,
        props: {
          label: 'פוטנציאל השפעה על התפעול (1-5)',
          helperText: 'עד כמה AI יכול לייעל את התפעול?'
        }
      },
      {
        name: 'operations.readiness',
        component: SelectField,
        props: {
          label: 'מוכנות ליישום',
          options: [
            { value: '', label: 'בחר...' },
            { value: 'immediate', label: 'מיידי - אפשר להתחיל מחר' },
            { value: 'short', label: 'טווח קצר - תוך 3 חודשים' },
            { value: 'medium', label: 'טווח בינוני - תוך 6 חודשים' },
            { value: 'long', label: 'טווח ארוך - מעל 6 חודשים' },
            { value: 'not_ready', label: 'לא מוכנים כרגע' }
          ]
        }
      }
    ],
    isOptional: false
  },

  // 6.4 הגדרות AI כלליות
  {
    id: 'ai-general',
    moduleId: 'aiAgents',
    sectionName: '6.4 הגדרות AI כלליות',
    fields: [
      {
        name: 'priority',
        component: RadioGroup,
        props: {
          label: 'עדיפות להתחלה',
          options: [
            { value: 'sales', label: 'AI במכירות - להגדיל הכנסות' },
            { value: 'service', label: 'AI בשירות - לשפר חווית לקוח' },
            { value: 'operations', label: 'AI בתפעול - לחסוך עלויות' },
            { value: 'all', label: 'כל התחומים במקביל' },
            { value: 'pilot', label: 'פיילוט קטן בתחום אחד' }
          ]
        }
      },
      {
        name: 'naturalLanguageImportance',
        component: RatingField,
        props: {
          label: 'חשיבות שפה טבעית בעברית (1-5)',
          helperText: 'עד כמה חשוב שה-AI יבין וידבר עברית טבעית?'
        }
      },
      {
        name: 'currentAITools',
        component: CheckboxGroup,
        props: {
          label: 'כלי AI בשימוש כיום',
          options: [
            { value: 'chatgpt', label: 'ChatGPT' },
            { value: 'claude', label: 'Claude' },
            { value: 'gemini', label: 'Google Gemini' },
            { value: 'copilot', label: 'Microsoft Copilot' },
            { value: 'custom', label: 'פתרון מותאם אישית' },
            { value: 'none', label: 'אין שימוש כרגע' }
          ],
          columns: 2
        }
      },
      {
        name: 'aiBarriers',
        component: CheckboxGroup,
        props: {
          label: 'חסמים להטמעת AI',
          options: [
            { value: 'budget', label: 'תקציב' },
            { value: 'skills', label: 'חוסר בידע/מיומנויות' },
            { value: 'data', label: 'איכות או זמינות נתונים' },
            { value: 'integration', label: 'קושי באינטגרציה' },
            { value: 'resistance', label: 'התנגדות לשינוי' },
            { value: 'security', label: 'חששות אבטחה' },
            { value: 'regulation', label: 'רגולציה' },
            { value: 'trust', label: 'חוסר אמון בטכנולוגיה' }
          ],
          columns: 2
        }
      },
      {
        name: 'teamSkillLevel',
        component: RatingField,
        props: {
          label: 'רמת מיומנות הצוות בטכנולוגיה (1-5)',
          helperText: 'עד כמה הצוות מוכן טכנולוגית?'
        }
      }
    ],
    isOptional: false
  },

  // ==================== SYSTEMS MODULE ====================
  // 7.1 מערכות קיימות
  {
    id: 'systems-current',
    moduleId: 'systems',
    sectionName: '7.1 מערכות קיימות',
    fields: [
      {
        name: 'currentSystems',
        component: CheckboxGroup,
        props: {
          label: 'אילו מערכות קיימות בארגון?',
          options: [
            { value: 'crm', label: 'CRM (מערכת ניהול קשרי לקוחות)' },
            { value: 'erp', label: 'ERP (מערכת ניהול משאבים)' },
            { value: 'marketing_automation', label: 'אוטומציית שיווק' },
            { value: 'helpdesk', label: 'מערכת תמיכה/כרטוס' },
            { value: 'accounting', label: 'מערכת הנהלת חשבונות' },
            { value: 'project_management', label: 'ניהול פרויקטים' },
            { value: 'hr_system', label: 'מערכת משאבי אנוש' },
            { value: 'inventory', label: 'ניהול מלאי' },
            { value: 'ecommerce', label: 'מסחר אלקטרוני' },
            { value: 'bi_analytics', label: 'BI וניתוח נתונים' }
          ],
          columns: 2,
          allowCustom: true
        }
      },
      {
        name: 'customSystems',
        component: TextField,
        props: {
          label: 'מערכות נוספות (אם יש)',
          placeholder: 'רשום מערכות נוספות מופרדות בפסיק...'
        }
      }
    ],
    isOptional: false
  },

  // 7.2 אינטגרציות
  {
    id: 'systems-integrations',
    moduleId: 'systems',
    sectionName: '7.2 אינטגרציות',
    fields: [
      {
        name: 'integrations.level',
        component: RadioGroup,
        props: {
          label: 'רמת אינטגרציה בין מערכות',
          options: [
            { value: 'full', label: 'מלאה - הכל מסונכרן אוטומטית' },
            { value: 'partial', label: 'חלקית - חלק מהמערכות מחוברות' },
            { value: 'minimal', label: 'מינימלית - רוב המערכות נפרדות' },
            { value: 'none', label: 'אין - כל מערכת עובדת בנפרד' }
          ]
        }
      },
      {
        name: 'integrations.issues',
        component: CheckboxGroup,
        props: {
          label: 'בעיות באינטגרציה',
          options: [
            { value: 'sync_delays', label: 'עיכובים בסנכרון' },
            { value: 'data_loss', label: 'אובדן מידע במעבר' },
            { value: 'duplicate_entry', label: 'הזנות כפולות' },
            { value: 'format_issues', label: 'בעיות פורמט/תאימות' },
            { value: 'limited_fields', label: 'העברת שדות מוגבלת' },
            { value: 'manual_updates', label: 'צורך בעדכון ידני' }
          ],
          columns: 2
        }
      },
      {
        name: 'integrations.manualDataTransfer',
        component: RadioGroup,
        props: {
          label: 'כמה זמן מושקע בהעברת נתונים ידנית?',
          options: [
            { value: 'none', label: 'אין צורך - הכל אוטומטי' },
            { value: '1-2_hours', label: '1-2 שעות בשבוע' },
            { value: '3-5_hours', label: '3-5 שעות בשבוע' },
            { value: '6-10_hours', label: '6-10 שעות בשבוע' },
            { value: 'over_10', label: 'מעל 10 שעות בשבוע' }
          ]
        }
      }
    ],
    isOptional: false
  },

  // 7.3 איכות נתונים
  {
    id: 'systems-dataquality',
    moduleId: 'systems',
    sectionName: '7.3 איכות נתונים',
    fields: [
      {
        name: 'dataQuality.overall',
        component: RadioGroup,
        props: {
          label: 'איכות נתונים כללית',
          options: [
            { value: 'excellent', label: 'מצוינת - נתונים נקיים ומדויקים' },
            { value: 'good', label: 'טובה - בעיות מינוריות' },
            { value: 'average', label: 'בינונית - יש בעיות שצריך לטפל' },
            { value: 'poor', label: 'גרועה - הרבה בעיות ואי דיוקים' }
          ]
        }
      },
      {
        name: 'dataQuality.duplicates',
        component: RadioGroup,
        props: {
          label: 'כמות נתונים כפולים',
          options: [
            { value: 'none', label: 'אין כפילויות' },
            { value: 'minimal', label: 'מעט (פחות מ-5%)' },
            { value: 'moderate', label: 'בינוני (5-15%)' },
            { value: 'high', label: 'הרבה (מעל 15%)' }
          ]
        }
      },
      {
        name: 'dataQuality.completeness',
        component: RadioGroup,
        props: {
          label: 'שלמות הנתונים',
          options: [
            { value: 'complete', label: 'מלא - כל השדות החשובים מלאים' },
            { value: 'mostly_complete', label: 'רוב השדות מלאים' },
            { value: 'partial', label: 'חלקי - חסרים הרבה נתונים' },
            { value: 'poor', label: 'חסר - רוב השדות ריקים' }
          ]
        }
      }
    ],
    isOptional: false
  },

  // 7.4 ממשקי API ו-Webhooks
  {
    id: 'systems-api',
    moduleId: 'systems',
    sectionName: '7.4 ממשקי API ו-Webhooks',
    fields: [
      {
        name: 'apiWebhooks.usage',
        component: RadioGroup,
        props: {
          label: 'שימוש ב-API',
          options: [
            { value: 'extensive', label: 'נרחב - משתמשים בהרבה ממשקים' },
            { value: 'moderate', label: 'בינוני - כמה ממשקים פעילים' },
            { value: 'minimal', label: 'מינימלי - שימוש בסיסי' },
            { value: 'none', label: 'אין שי��וש בכלל' }
          ]
        }
      },
      {
        name: 'apiWebhooks.webhooks',
        component: RadioGroup,
        props: {
          label: 'שימוש ב-Webhooks',
          options: [
            { value: 'active', label: 'פעיל - מקבלים התראות בזמן אמת' },
            { value: 'limited', label: 'מוגבל - רק לדברים קריטיים' },
            { value: 'none', label: 'אין שימוש' },
            { value: 'dont_know', label: 'לא יודע מה זה' }
          ]
        }
      },
      {
        name: 'apiWebhooks.needs',
        component: CheckboxGroup,
        props: {
          label: 'צרכי ממשקים',
          options: [
            { value: 'real_time_sync', label: 'סנכרון בזמן אמת' },
            { value: 'automated_workflows', label: 'תהליכי עבודה אוטומטיים' },
            { value: 'external_integrations', label: 'חיבור לשירותים חיצוניים' },
            { value: 'data_export', label: 'ייצוא נתונים אוטומטי' },
            { value: 'event_triggers', label: 'טריגרים לאירועים' },
            { value: 'custom_reports', label: 'דוחות מותאמים אישית' }
          ],
          columns: 2
        }
      }
    ],
    isOptional: false
  },

  // 7.5 תשתית ואבטחה
  {
    id: 'systems-infrastructure',
    moduleId: 'systems',
    sectionName: '7.5 תשתית ואבטחה',
    fields: [
      {
        name: 'infrastructure.hosting',
        component: RadioGroup,
        props: {
          label: 'סוג אירוח',
          options: [
            { value: 'cloud', label: 'ענן מלא (AWS, Azure, Google)' },
            { value: 'hybrid', label: 'היברידי - חלק ענן חלק מקומי' },
            { value: 'on_premise', label: 'מקומי - שרתים בארגון' },
            { value: 'mixed_saas', label: 'שילוב של שירותי SaaS' }
          ]
        }
      },
      {
        name: 'infrastructure.security',
        component: CheckboxGroup,
        props: {
          label: 'אמצעי אבטחה',
          options: [
            { value: 'ssl', label: 'הצפנת SSL' },
            { value: '2fa', label: 'אימות דו-שלבי' },
            { value: 'regular_backups', label: 'גיבויים סדירים' },
            { value: 'access_control', label: 'בקרת גישה והרשאות' },
            { value: 'audit_logs', label: 'לוגים וביקורת' },
            { value: 'encryption', label: 'הצפנת נתונים' },
            { value: 'vpn', label: 'גישה דרך VPN' },
            { value: 'firewall', label: 'חומת אש' }
          ],
          columns: 2
        }
      },
      {
        name: 'infrastructure.backup',
        component: RadioGroup,
        props: {
          label: 'תדירות גיבויים',
          options: [
            { value: 'real_time', label: 'זמן אמת - רפליקציה מתמדת' },
            { value: 'hourly', label: 'כל שעה' },
            { value: 'daily', label: 'יומי' },
            { value: 'weekly', label: 'שבועי' },
            { value: 'monthly', label: 'חודשי' },
            { value: 'none', label: 'אין גיבויים קבועים' }
          ]
        }
      }
    ],
    isOptional: false
  },

  // ==================== ROI MODULE ====================
  // 8.1 עלויות נוכחיות
  {
    id: 'roi-current-costs',
    moduleId: 'roi',
    sectionName: '8.1 ניתוח עלויות נוכחיות',
    fields: [
      {
        name: 'currentCosts.manualHours',
        component: NumberField,
        props: {
          label: 'שעות עבודה ידנית בשבוע',
          min: 0,
          placeholder: 'לדוגמה: 40'
        }
      },
      {
        name: 'currentCosts.hourlyCost',
        component: NumberField,
        props: {
          label: 'עלות שעת עבודה ממוצעת (₪)',
          min: 0,
          suffix: '₪',
          placeholder: 'לדוגמה: 100'
        }
      },
      {
        name: 'currentCosts.toolsCost',
        component: NumberField,
        props: {
          label: 'עלות כלים וסופטוור חודשית (₪)',
          min: 0,
          suffix: '₪',
          placeholder: 'לדוגמה: 5000'
        }
      },
      {
        name: 'currentCosts.errorCost',
        component: NumberField,
        props: {
          label: 'עלות טעויות וטיפול בהן לחודש (₪)',
          min: 0,
          suffix: '₪',
          placeholder: 'לדוגמה: 2000'
        }
      },
      {
        name: 'currentCosts.lostOpportunities',
        component: NumberField,
        props: {
          label: 'הערכת הפסדים מהחמצת הזדמנויות לחודש (₪)',
          min: 0,
          suffix: '₪',
          placeholder: 'לקוחות שלא טופלו, עסקאות שלא נסגרו...'
        }
      }
    ],
    isOptional: false
  },

  // 8.2 פוטנציאל חיסכון בזמן
  {
    id: 'roi-time-savings',
    moduleId: 'roi',
    sectionName: '8.2 פוטנציאל חיסכון בזמן',
    fields: [
      {
        name: 'timeSavings.estimatedHoursSaved',
        component: NumberField,
        props: {
          label: 'הערכה: כמה שעות עבודה בשבוע ניתן לחסוך באוטומציה?',
          helperText: 'הערכה של סך השעות שניתן לחסוך מכל התהליכים המועמדים לאוטומציה',
          min: 0,
          suffix: 'שעות/שבוע'
        }
      },
      {
        name: 'timeSavings.processes',
        component: CheckboxGroup,
        props: {
          label: 'תהליכים עיקריים לאוטומציה',
          options: [
            { value: 'lead_management', label: 'ניהול וטיפול בלידים' },
            { value: 'customer_service', label: 'שירות לקוחות' },
            { value: 'data_entry', label: 'הזנת נתונים' },
            { value: 'reporting', label: 'הפקת דוחות' },
            { value: 'invoicing', label: 'הפקת חשבוניות' },
            { value: 'email_marketing', label: 'שיווק באימייל' },
            { value: 'appointment_scheduling', label: 'תיאום פגישות' },
            { value: 'document_processing', label: 'עיבוד מסמכים' },
            { value: 'inventory_management', label: 'ניהול מלאי' },
            { value: 'hr_processes', label: 'תהליכי HR' }
          ],
          columns: 2
        }
      },
      {
        name: 'timeSavings.implementation',
        component: RadioGroup,
        props: {
          label: 'קצב יישום האוטומציה',
          options: [
            { value: 'immediate', label: 'מיידי - תוך חודש' },
            { value: 'quick', label: 'מהיר - תוך 3 חודשים' },
            { value: 'moderate', label: 'מתון - תוך 6 חודשים' },
            { value: 'gradual', label: 'הדרגתי - תוך שנה' }
          ]
        }
      }
    ],
    isOptional: false
  },

  // 8.3 השקעה והחזר
  {
    id: 'roi-investment',
    moduleId: 'roi',
    sectionName: '8.3 השקעה והחזר',
    fields: [
      {
        name: 'investment.range',
        component: RadioGroup,
        props: {
          label: 'טווח השקעה מתוכנן',
          options: [
            { value: 'under_10k', label: 'עד 10,000 ₪' },
            { value: '10k_50k', label: '10,000 - 50,000 ₪' },
            { value: '50k_100k', label: '50,000 - 100,000 ₪' },
            { value: '100k_250k', label: '100,000 - 250,000 ₪' },
            { value: 'over_250k', label: 'מעל 250,000 ₪' }
          ]
        }
      },
      {
        name: 'investment.paybackExpectation',
        component: RadioGroup,
        props: {
          label: 'ציפייה לזמן החזר השקעה',
          options: [
            { value: '3_months', label: 'עד 3 חודשים' },
            { value: '6_months', label: 'עד 6 חודשים' },
            { value: '12_months', label: 'עד שנה' },
            { value: '18_months', label: 'עד שנה וחצי' },
            { value: '24_months', label: 'עד שנתיים' },
            { value: 'over_24', label: 'מעל שנתיים' }
          ]
        }
      },
      {
        name: 'investment.budgetAvailable',
        component: RadioGroup,
        props: {
          label: 'זמינות תקציב',
          options: [
            { value: 'immediate', label: 'זמין מיידית' },
            { value: 'next_quarter', label: 'ברבעון הבא' },
            { value: 'next_year', label: 'בשנה הבאה' },
            { value: 'needs_approval', label: 'דורש אישור מיוחד' },
            { value: 'not_available', label: 'אין תקציב כרגע' }
          ]
        }
      }
    ],
    isOptional: false
  },

  // 8.4 מדדי הצלחה
  {
    id: 'roi-success-metrics',
    moduleId: 'roi',
    sectionName: '8.4 מדדי הצלחה',
    fields: [
      {
        name: 'successMetrics',
        component: CheckboxGroup,
        props: {
          label: 'מדדים לבחינת הצלחה',
          options: [
            { value: 'time_saved', label: 'חיסכון בזמן' },
            { value: 'cost_reduction', label: 'הפחתת עלויות' },
            { value: 'revenue_increase', label: 'גידול בהכנסות' },
            { value: 'customer_satisfaction', label: 'שביעות רצון לקוחות' },
            { value: 'employee_satisfaction', label: 'שביעות רצון עובדים' },
            { value: 'error_reduction', label: 'הפחתת טעויות' },
            { value: 'process_speed', label: 'מהירות תהליכים' },
            { value: 'lead_conversion', label: 'המרת לידים' },
            { value: 'response_time', label: 'זמן תגובה' },
            { value: 'data_quality', label: 'איכות נתונים' }
          ],
          columns: 2
        }
      },
      {
        name: 'measurementFrequency',
        component: RadioGroup,
        props: {
          label: 'תדירות מדידה',
          options: [
            { value: 'daily', label: 'יומי' },
            { value: 'weekly', label: 'שבועי' },
            { value: 'monthly', label: 'חודשי' },
            { value: 'quarterly', label: 'רבעוני' },
            { value: 'annually', label: 'שנתי' }
          ],
          orientation: 'horizontal'
        }
      }
    ],
    isOptional: false
  }

  // Note: Proposal module is handled separately in the ProposalModule component
  // It's not part of the wizard steps, but shown after all wizard steps are completed
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
    'roi'
    // Note: 'proposal' is not in wizard - shown separately after completion
  ],
  conditional: {
    'b2b': ['overview', 'leadsAndSales', 'operations', 'systems', 'reporting', 'aiAgents', 'roi'],
    'b2c': ['overview', 'customerService', 'operations', 'systems', 'reporting', 'aiAgents', 'roi'],
    'b2b2c': ['overview', 'leadsAndSales', 'customerService', 'operations', 'systems', 'reporting', 'aiAgents', 'roi'],
    'marketplace': ['overview', 'leadsAndSales', 'customerService', 'operations', 'systems', 'reporting', 'aiAgents', 'roi'],
    'saas': ['overview', 'customerService', 'operations', 'systems', 'reporting', 'aiAgents', 'roi']
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
