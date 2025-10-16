// System Specification Database
// Comprehensive list of systems by category with specific options

export interface SystemOption {
  value: string;
  label: string;
  labelHebrew: string;
  versions?: string[];
  typicalApiAccess?: 'full' | 'limited' | 'none';
  marketShare?: 'high' | 'medium' | 'low';
}

export interface SystemCategory {
  id: string;
  label: string;
  labelHebrew: string;
  systems: SystemOption[];
}

export const SYSTEM_CATEGORIES: SystemCategory[] = [
  {
    id: 'crm',
    label: 'CRM (Customer Relationship Management)',
    labelHebrew: 'CRM (מערכת ניהול קשרי לקוחות)',
    systems: [
      {
        value: 'salesforce',
        label: 'Salesforce',
        labelHebrew: 'Salesforce',
        versions: ['Essentials', 'Professional', 'Enterprise', 'Unlimited'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'hubspot',
        label: 'HubSpot CRM',
        labelHebrew: 'HubSpot CRM',
        versions: ['Free', 'Starter', 'Professional', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'zoho_crm',
        label: 'Zoho CRM',
        labelHebrew: 'Zoho CRM',
        versions: [
          'Free',
          'Standard',
          'Professional',
          'Enterprise',
          'Ultimate',
        ],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
      {
        value: 'pipedrive',
        label: 'Pipedrive',
        labelHebrew: 'Pipedrive',
        versions: [
          'Essential',
          'Advanced',
          'Professional',
          'Power',
          'Enterprise',
        ],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
      {
        value: 'monday_crm',
        label: 'monday.com CRM',
        labelHebrew: 'monday.com CRM',
        versions: ['Basic', 'Standard', 'Pro', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
      {
        value: 'dynamics365',
        label: 'Microsoft Dynamics 365',
        labelHebrew: 'Microsoft Dynamics 365',
        versions: ['Sales Professional', 'Sales Enterprise', 'Sales Premium'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'freshsales',
        label: 'Freshsales (Freshworks)',
        labelHebrew: 'Freshsales (Freshworks)',
        versions: ['Free', 'Growth', 'Pro', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
      {
        value: 'custom_crm',
        label: 'Custom/Proprietary CRM',
        labelHebrew: 'מערכת CRM מותאמת אישית',
        versions: ['In-house Development'],
        typicalApiAccess: 'limited',
        marketShare: 'low',
      },
    ],
  },
  {
    id: 'erp',
    label: 'ERP (Enterprise Resource Planning)',
    labelHebrew: 'ERP (מערכת ניהול משאבים)',
    systems: [
      {
        value: 'sap',
        label: 'SAP',
        labelHebrew: 'SAP',
        versions: ['SAP Business One', 'SAP S/4HANA', 'SAP ECC'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'oracle_erp',
        label: 'Oracle ERP Cloud',
        labelHebrew: 'Oracle ERP Cloud',
        versions: ['Standard', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'netsuite',
        label: 'NetSuite',
        labelHebrew: 'NetSuite',
        versions: ['Standard', 'Premium'],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
      {
        value: 'microsoft_dynamics_erp',
        label: 'Microsoft Dynamics 365 Business Central',
        labelHebrew: 'Microsoft Dynamics 365 Business Central',
        versions: ['Essentials', 'Premium'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'odoo',
        label: 'Odoo',
        labelHebrew: 'Odoo',
        versions: ['Community', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
      {
        value: 'priority',
        label: 'Priority (Israeli)',
        labelHebrew: 'פריוריטי',
        versions: ['Standard', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
    ],
  },
  {
    id: 'marketing_automation',
    label: 'Marketing Automation',
    labelHebrew: 'אוטומציית שיווק',
    systems: [
      {
        value: 'hubspot_marketing',
        label: 'HubSpot Marketing Hub',
        labelHebrew: 'HubSpot Marketing Hub',
        versions: ['Free', 'Starter', 'Professional', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'marketo',
        label: 'Adobe Marketo',
        labelHebrew: 'Adobe Marketo',
        versions: ['Select', 'Prime', 'Ultimate'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'mailchimp',
        label: 'Mailchimp',
        labelHebrew: 'Mailchimp',
        versions: ['Free', 'Essentials', 'Standard', 'Premium'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'activecampaign',
        label: 'ActiveCampaign',
        labelHebrew: 'ActiveCampaign',
        versions: ['Lite', 'Plus', 'Professional', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
      {
        value: 'pardot',
        label: 'Salesforce Pardot',
        labelHebrew: 'Salesforce Pardot',
        versions: ['Growth', 'Plus', 'Advanced', 'Premium'],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
    ],
  },
  {
    id: 'helpdesk',
    label: 'Helpdesk / Customer Support',
    labelHebrew: 'מערכת תמיכה / כרטוס',
    systems: [
      {
        value: 'zendesk',
        label: 'Zendesk',
        labelHebrew: 'Zendesk',
        versions: [
          'Suite Team',
          'Suite Growth',
          'Suite Professional',
          'Suite Enterprise',
        ],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'freshdesk',
        label: 'Freshdesk',
        labelHebrew: 'Freshdesk',
        versions: ['Free', 'Growth', 'Pro', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
      {
        value: 'intercom',
        label: 'Intercom',
        labelHebrew: 'Intercom',
        versions: ['Starter', 'Pro', 'Premium'],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
      {
        value: 'servicenow',
        label: 'ServiceNow',
        labelHebrew: 'ServiceNow',
        versions: ['Standard', 'Professional', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'jira_service_desk',
        label: 'Jira Service Management',
        labelHebrew: 'Jira Service Management',
        versions: ['Free', 'Standard', 'Premium', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
    ],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    labelHebrew: 'מערכת הנהלת חשבונות',
    systems: [
      {
        value: 'quickbooks',
        label: 'QuickBooks',
        labelHebrew: 'QuickBooks',
        versions: ['Simple Start', 'Essentials', 'Plus', 'Advanced'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'xero',
        label: 'Xero',
        labelHebrew: 'Xero',
        versions: ['Starter', 'Standard', 'Premium'],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
      {
        value: 'sage',
        label: 'Sage',
        labelHebrew: 'Sage',
        versions: ['Sage 50', 'Sage 100', 'Sage Intacct'],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
      {
        value: 'hashavshevet',
        label: 'Hashavshevet (Israeli)',
        labelHebrew: 'חשבשבת',
        versions: ['Standard', 'Pro'],
        typicalApiAccess: 'limited',
        marketShare: 'high',
      },
      {
        value: 'meitav',
        label: 'Meitav Dash (Israeli)',
        labelHebrew: 'מיטב דש',
        versions: ['Standard'],
        typicalApiAccess: 'limited',
        marketShare: 'medium',
      },
    ],
  },
  {
    id: 'project_management',
    label: 'Project Management',
    labelHebrew: 'ניהול פרויקטים',
    systems: [
      {
        value: 'jira',
        label: 'Jira',
        labelHebrew: 'Jira',
        versions: ['Free', 'Standard', 'Premium', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'asana',
        label: 'Asana',
        labelHebrew: 'Asana',
        versions: ['Basic', 'Premium', 'Business', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'monday',
        label: 'monday.com',
        labelHebrew: 'monday.com',
        versions: ['Basic', 'Standard', 'Pro', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'trello',
        label: 'Trello',
        labelHebrew: 'Trello',
        versions: ['Free', 'Standard', 'Premium', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'clickup',
        label: 'ClickUp',
        labelHebrew: 'ClickUp',
        versions: ['Free', 'Unlimited', 'Business', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
    ],
  },
  {
    id: 'hr_system',
    label: 'HR System',
    labelHebrew: 'מערכת משאבי אנוש',
    systems: [
      {
        value: 'workday',
        label: 'Workday HCM',
        labelHebrew: 'Workday HCM',
        versions: ['Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'bamboohr',
        label: 'BambooHR',
        labelHebrew: 'BambooHR',
        versions: ['Essentials', 'Advantage'],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
      {
        value: 'hibob',
        label: 'HiBob',
        labelHebrew: 'HiBob',
        versions: ['Standard', 'Premium'],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
      {
        value: 'adp',
        label: 'ADP Workforce',
        labelHebrew: 'ADP Workforce',
        versions: ['Standard', 'Enterprise'],
        typicalApiAccess: 'limited',
        marketShare: 'high',
      },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory Management',
    labelHebrew: 'ניהול מלאי',
    systems: [
      {
        value: 'tradegecko',
        label: 'TradeGecko (QuickBooks Commerce)',
        labelHebrew: 'TradeGecko',
        versions: ['Standard', 'Professional', 'Premium'],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
      {
        value: 'cin7',
        label: 'Cin7',
        labelHebrew: 'Cin7',
        versions: ['Core', 'Omni'],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
      {
        value: 'fishbowl',
        label: 'Fishbowl',
        labelHebrew: 'Fishbowl',
        versions: ['Advanced', 'Warehouse'],
        typicalApiAccess: 'full',
        marketShare: 'low',
      },
    ],
  },
  {
    id: 'ecommerce',
    label: 'E-commerce Platform',
    labelHebrew: 'מסחר אלקטרוני',
    systems: [
      {
        value: 'shopify',
        label: 'Shopify',
        labelHebrew: 'Shopify',
        versions: ['Basic', 'Shopify', 'Advanced', 'Plus'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'woocommerce',
        label: 'WooCommerce',
        labelHebrew: 'WooCommerce',
        versions: ['Open Source'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'magento',
        label: 'Magento (Adobe Commerce)',
        labelHebrew: 'Magento (Adobe Commerce)',
        versions: ['Open Source', 'Commerce', 'Commerce Cloud'],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
      {
        value: 'bigcommerce',
        label: 'BigCommerce',
        labelHebrew: 'BigCommerce',
        versions: ['Standard', 'Plus', 'Pro', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
    ],
  },
  {
    id: 'bi_analytics',
    label: 'BI & Analytics',
    labelHebrew: 'BI וניתוח נתונים',
    systems: [
      {
        value: 'tableau',
        label: 'Tableau',
        labelHebrew: 'Tableau',
        versions: ['Creator', 'Explorer', 'Viewer'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'power_bi',
        label: 'Microsoft Power BI',
        labelHebrew: 'Microsoft Power BI',
        versions: ['Pro', 'Premium', 'Embedded'],
        typicalApiAccess: 'full',
        marketShare: 'high',
      },
      {
        value: 'looker',
        label: 'Looker (Google)',
        labelHebrew: 'Looker (Google)',
        versions: ['Standard', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'medium',
      },
      {
        value: 'metabase',
        label: 'Metabase',
        labelHebrew: 'Metabase',
        versions: ['Open Source', 'Pro', 'Enterprise'],
        typicalApiAccess: 'full',
        marketShare: 'low',
      },
    ],
  },
];

// Helper function to get systems by category
export const getSystemsByCategory = (categoryId: string): SystemOption[] => {
  const category = SYSTEM_CATEGORIES.find((cat) => cat.id === categoryId);
  return category?.systems || [];
};

// Helper function to get system label
export const getSystemLabel = (
  categoryId: string,
  hebrew: boolean = true
): string => {
  const category = SYSTEM_CATEGORIES.find((cat) => cat.id === categoryId);
  return category
    ? hebrew
      ? category.labelHebrew
      : category.label
    : categoryId;
};

// Helper to get specific system details
export const getSystemDetails = (
  categoryId: string,
  systemValue: string
): SystemOption | undefined => {
  const systems = getSystemsByCategory(categoryId);
  return systems.find((sys) => sys.value === systemValue);
};

// Pain point templates per system type
export const COMMON_PAIN_POINTS: Record<string, string[]> = {
  crm: [
    'נתונים לא מעודכנים',
    'כפילויות של רשומות',
    'משתמשים לא מזינים מידע',
    'חסר אינטגרציה עם מערכות אחרות',
    'דוחות לא מספקים',
    'תהליך ידני למעקב אחר לידים',
    'אין אוטומציה לפעולות חוזרות',
  ],
  erp: [
    'תהליכים איטיים',
    'חסר אינטגרציה עם מערכות אחרות',
    'דוחות כבדים ואיטיים',
    'קושי בהתאמה אישית',
    'עלויות תחזוקה גבוהות',
    'ממשק משתמש מסורבל',
  ],
  marketing_automation: [
    'קמפיינים לא ממוקדים',
    'חסר אינטגרציה עם CRM',
    'נתוני תוצאות לא ברורים',
    'קושי ביצירת אוטומציות מורכבות',
    'חסר פרסונליזציה',
  ],
  helpdesk: [
    'זמני מענה ארוכים',
    'פניות נופלות בין הכיסאות',
    'אין מעקב אחר SLA',
    'חסר אינטגרציה עם CRM',
    'דוחות לא מספקים',
    'אין אוטומציה לפניות נפוצות',
  ],
  accounting: [
    'הזנה ידנית של חשבוניות',
    'טעויות בהתאמות בנק',
    'דוחות אורכים זמן רב להכנה',
    'חסר אינטגרציה עם מערכות אחרות',
    'תהליכי אישור ידניים',
  ],
};

export const CRITICAL_FEATURES_BY_CATEGORY: Record<string, string[]> = {
  crm: [
    'ניהול לידים',
    'מעקב אחר הזדמנויות',
    'ניהול איש קשר',
    'דוחות ומעקבים',
    'אוטומציית תהליכים',
    'אינטגרציות',
    'ניהול צינור מכירות',
  ],
  erp: [
    'ניהול כספים',
    'ניהול מלאי',
    'ניהול הזמנות',
    'דוחות פיננסיים',
    'ניהול ספקים',
    'ניהול לקוחות',
    'תכנון משאבים',
  ],
  marketing_automation: [
    'אוטומציית אימיילים',
    'ניהול קמפיינים',
    'טיפוח לידים',
    'דירוג לידים',
    'דוחות וניתוח',
    'פילוח קהל',
    'בדיקות A/B',
  ],
};
