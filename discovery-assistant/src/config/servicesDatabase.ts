import { ServiceCategory, ServiceCategoryId, ServiceItem } from '../types/proposal';

// Service Categories
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'automations',
    name: 'n8n Automations',
    nameHe: 'אוטומציות n8n',
    priority: 'primary',
    icon: '⚡',
    description: 'Workflow automation using n8n',
    descriptionHe: 'אוטומציות תהליכים באמצעות n8n'
  },
  {
    id: 'ai_agents',
    name: 'AI Agents',
    nameHe: 'סוכני AI',
    priority: 'primary',
    icon: '🤖',
    description: 'Intelligent AI agents for sales, service, and operations',
    descriptionHe: 'סוכני AI חכמים למכירות, שירות ותפעול'
  },
  {
    id: 'integrations',
    name: 'Integrations',
    nameHe: 'אינטגרציות',
    priority: 'secondary',
    icon: '🔗',
    description: 'Connect systems and automate data flow',
    descriptionHe: 'חיבור מערכות ואוטומציה של זרימת נתונים'
  },
  {
    id: 'system_implementation',
    name: 'System Implementation',
    nameHe: 'הטמעת מערכות',
    priority: 'secondary',
    icon: '💼',
    description: 'Setup and implementation of business systems',
    descriptionHe: 'הקמה והטמעה של מערכות עסקיות'
  },
  {
    id: 'additional_services',
    name: 'Additional Services',
    nameHe: 'שירותים נוספים',
    priority: 'optional',
    icon: '💡',
    description: 'Data cleaning, reporting, training, and support',
    descriptionHe: 'ניקוי נתונים, דוחות, הדרכה ותמיכה'
  }
];

// Service Items Database
export const SERVICES_DATABASE: ServiceItem[] = [
  // ==================== AUTOMATIONS (PRIMARY) ====================
  // Quick Wins
  {
    id: 'auto-lead-response',
    category: 'automations',
    name: 'Auto Lead Response',
    nameHe: 'תגובה אוטומטית ללידים',
    description: 'Automatic response to new leads from forms',
    descriptionHe: 'תגובה אוטומטית ללידים חדשים מטפסים',
    basePrice: 700,
    estimatedDays: 1,
    complexity: 'simple',
    tags: ['leads', 'forms', 'response', 'quick-win']
  },
  {
    id: 'auto-sms-whatsapp',
    category: 'automations',
    name: 'Auto SMS/WhatsApp to Leads',
    nameHe: 'SMS/WhatsApp אוטומטי ללידים',
    description: 'Send automatic SMS/WhatsApp to new leads',
    descriptionHe: 'שליחת SMS/WhatsApp אוטומטית ללידים חדשים',
    basePrice: 1000,
    estimatedDays: 2,
    complexity: 'simple',
    tags: ['leads', 'sms', 'whatsapp', 'communication', 'quick-win']
  },
  {
    id: 'auto-crm-update',
    category: 'automations',
    name: 'Auto CRM Update from Forms',
    nameHe: 'עדכון CRM אוטומטי מטפסים',
    description: 'Automatically update CRM from website forms',
    descriptionHe: 'עדכון אוטומטי של CRM מטפסי אתר',
    basePrice: 1200,
    estimatedDays: 2,
    complexity: 'simple',
    tags: ['crm', 'forms', 'data-entry', 'quick-win']
  },
  {
    id: 'auto-team-alerts',
    category: 'automations',
    name: 'Team Alerts on Important Leads',
    nameHe: 'התראות לצוות על לידים חשובים',
    description: 'Alert team members about high-priority leads',
    descriptionHe: 'התראות לחברי צוות על לידים בעדיפות גבוהה',
    basePrice: 800,
    estimatedDays: 1,
    complexity: 'simple',
    tags: ['alerts', 'notifications', 'leads', 'quick-win']
  },
  {
    id: 'auto-appointment-reminders',
    category: 'automations',
    name: 'Appointment Reminders',
    nameHe: 'תזכורות אוטומטיות לפגישות',
    description: 'Automatic reminders before appointments',
    descriptionHe: 'תזכורות אוטומטיות לפני פגישות',
    basePrice: 900,
    estimatedDays: 2,
    complexity: 'simple',
    tags: ['appointments', 'reminders', 'calendar', 'quick-win']
  },
  {
    id: 'auto-welcome-email',
    category: 'automations',
    name: 'Welcome Email Automation',
    nameHe: 'אימייל ברוכים הבאים אוטומטי',
    description: 'Send welcome email to new leads/customers',
    descriptionHe: 'שליחת אימייל ברוכים הבאים ללידים/לקוחות חדשים',
    basePrice: 700,
    estimatedDays: 1,
    complexity: 'simple',
    tags: ['email', 'welcome', 'onboarding', 'quick-win']
  },

  // Medium Automations
  {
    id: 'auto-lead-workflow',
    category: 'automations',
    name: 'Complete Lead Management Workflow',
    nameHe: 'workflow מלא לניהול לידים',
    description: 'End-to-end lead management: capture → distribute → follow-up',
    descriptionHe: 'ניהול לידים מקצה לקצה: קליטה → חלוקה → מעקב',
    basePrice: 3500,
    estimatedDays: 5,
    complexity: 'medium',
    tags: ['leads', 'workflow', 'crm', 'sales', 'distribution']
  },
  {
    id: 'auto-smart-followup',
    category: 'automations',
    name: 'Smart Follow-up Automation',
    nameHe: 'אוטומציית מעקבים חכמה',
    description: 'Intelligent follow-up via WhatsApp/SMS/Email based on behavior',
    descriptionHe: 'מעקבים חכמים ב-WhatsApp/SMS/Email על בסיס התנהגות',
    basePrice: 2500,
    estimatedDays: 4,
    complexity: 'medium',
    tags: ['followup', 'whatsapp', 'sms', 'email', 'leads']
  },
  {
    id: 'auto-system-sync',
    category: 'automations',
    name: 'Multi-System Data Sync',
    nameHe: 'סנכרון נתונים בין 2-3 מערכות',
    description: 'Sync data between 2-3 systems automatically',
    descriptionHe: 'סנכרון אוטומטי של נתונים בין 2-3 מערכות',
    basePrice: 3000,
    estimatedDays: 5,
    complexity: 'medium',
    tags: ['integration', 'sync', 'data', 'systems']
  },
  {
    id: 'auto-service-workflow',
    category: 'automations',
    name: 'Customer Service Automation',
    nameHe: 'אוטומציית תהליך שירות לקוחות',
    description: 'Automate customer service ticket management and routing',
    descriptionHe: 'אוטומציה של ניהול ונתוב פניות שירות',
    basePrice: 2800,
    estimatedDays: 4,
    complexity: 'medium',
    tags: ['service', 'tickets', 'routing', 'support']
  },
  {
    id: 'auto-reports',
    category: 'automations',
    name: 'Automated Reports',
    nameHe: 'דוחות יומיים/שבועיים אוטומטיים',
    description: 'Generate and send daily/weekly reports automatically',
    descriptionHe: 'יצירה ושליחה אוטומטית של דוחות',
    basePrice: 2000,
    estimatedDays: 3,
    complexity: 'medium',
    tags: ['reports', 'analytics', 'dashboard', 'kpi']
  },
  {
    id: 'auto-document-mgmt',
    category: 'automations',
    name: 'Document Management Automation',
    nameHe: 'ניהול מסמכים אוטומטי',
    description: 'Receive, process, and store documents automatically',
    descriptionHe: 'קבלה, עיבוד ושמירה אוטומטית של מסמכים',
    basePrice: 2500,
    estimatedDays: 4,
    complexity: 'medium',
    tags: ['documents', 'files', 'storage', 'processing']
  },
  {
    id: 'auto-approval-workflow',
    category: 'automations',
    name: 'Approval Workflow Automation',
    nameHe: 'אוטומציית תהליך אישורים',
    description: 'Automated approval workflows with routing and notifications',
    descriptionHe: 'תהליכי אישור אוטומטיים עם ניתוב והתראות',
    basePrice: 2200,
    estimatedDays: 4,
    complexity: 'medium',
    tags: ['approvals', 'workflow', 'routing', 'notifications']
  },

  // NEW: Additional automation services
  {
    id: 'whatsapp-api-setup',
    category: 'integrations',
    name: 'WhatsApp Business API Setup',
    nameHe: 'הקמת WhatsApp Business API',
    description: 'Complete WhatsApp Business API setup with templates',
    descriptionHe: 'הקמה מלאה של WhatsApp Business API עם תבניות',
    basePrice: 2000,
    estimatedDays: 3,
    complexity: 'medium',
    tags: ['whatsapp', 'api', 'messaging', 'setup']
  },
  {
    id: 'auto-email-templates',
    category: 'automations',
    name: 'Automated Email Templates',
    nameHe: 'תבניות אימייל אוטומטיות',
    description: 'Create and automate email templates with personalization',
    descriptionHe: 'יצירה ואוטומציה של תבניות אימייל עם התאמה אישית',
    basePrice: 1200,
    estimatedDays: 2,
    complexity: 'simple',
    tags: ['email', 'templates', 'automation', 'marketing']
  },
  {
    id: 'auto-notifications',
    category: 'automations',
    name: 'Smart Notifications System',
    nameHe: 'מערכת התראות חכמה',
    description: 'Intelligent notification system across multiple channels',
    descriptionHe: 'מערכת התראות חכמה במגוון ערוצים',
    basePrice: 1500,
    estimatedDays: 3,
    complexity: 'medium',
    tags: ['notifications', 'alerts', 'multichannel']
  },
  {
    id: 'auto-data-sync',
    category: 'automations',
    name: 'Bi-directional Data Sync',
    nameHe: 'סנכרון דו-כיווני של נתונים',
    description: 'Real-time bi-directional data synchronization',
    descriptionHe: 'סנכרון דו-כיווני של נתונים בזמן אמת',
    basePrice: 2500,
    estimatedDays: 4,
    complexity: 'medium',
    tags: ['sync', 'data', 'bidirectional', 'realtime']
  },
  {
    id: 'auto-form-to-crm',
    category: 'automations',
    name: 'Form Submissions → CRM Auto-Update',
    nameHe: 'הגשות טפסים → עדכון אוטומטי ב-CRM',
    description: 'Automatically update CRM from form submissions',
    descriptionHe: 'עדכון אוטומטי של CRM מהגשות טפסים',
    basePrice: 1200,
    estimatedDays: 2,
    complexity: 'simple',
    tags: ['forms', 'crm', 'automation', 'data-entry']
  },
  {
    id: 'auto-document-generation',
    category: 'automations',
    name: 'Document Automation (Contracts/Invoices)',
    nameHe: 'אוטומציית מסמכים (חוזים/חשבוניות)',
    description: 'Generate contracts, invoices, and documents automatically',
    descriptionHe: 'יצירה אוטומטית של חוזים, חשבוניות ומסמכים',
    basePrice: 2500,
    estimatedDays: 4,
    complexity: 'medium',
    tags: ['documents', 'contracts', 'invoices', 'generation']
  },
  {
    id: 'auto-meeting-scheduler',
    category: 'automations',
    name: 'Smart Meeting Scheduler',
    nameHe: 'תזמון פגישות חכם',
    description: 'Automated meeting scheduling with calendar integration',
    descriptionHe: 'תזמון פגישות אוטומטי עם אינטגרציית לוח שנה',
    basePrice: 1800,
    estimatedDays: 3,
    complexity: 'medium',
    tags: ['meetings', 'scheduling', 'calendar', 'automation']
  },
  {
    id: 'reports-automated',
    category: 'automations',
    name: 'Automated Reports & Dashboards',
    nameHe: 'דוחות ודשבורדים אוטומטיים',
    description: 'Automated report generation and real-time dashboards',
    descriptionHe: 'יצירת דוחות אוטומטית ודשבורדים בזמן אמת',
    basePrice: 3000,
    estimatedDays: 5,
    complexity: 'medium',
    tags: ['reports', 'dashboards', 'analytics', 'automation']
  },

  // Advanced Automations
  {
    id: 'auto-end-to-end',
    category: 'automations',
    name: 'End-to-End Process Automation',
    nameHe: 'אוטומציה מקצה לקצה של תהליך שלם',
    description: 'Complete automation of entire business process from start to finish',
    descriptionHe: 'אוטומציה מלאה של תהליך עסקי שלם מתחילה ועד סוף',
    basePrice: 8000,
    estimatedDays: 10,
    complexity: 'complex',
    tags: ['workflow', 'process', 'end-to-end', 'complex']
  },
  {
    id: 'auto-multi-system',
    category: 'automations',
    name: 'Multi-System Integration (4+ systems)',
    nameHe: 'אינטגרציה מלאה של 4+ מערכות',
    description: 'Full integration and automation across 4 or more systems',
    descriptionHe: 'אינטגרציה ואוטומציה מלאה על פני 4 מערכות ומעלה',
    basePrice: 7000,
    estimatedDays: 10,
    complexity: 'complex',
    tags: ['integration', 'systems', 'complex', 'sync']
  },
  {
    id: 'auto-complex-logic',
    category: 'automations',
    name: 'Complex Business Logic Automation',
    nameHe: 'לוגיקה עסקית מורכבת',
    description: 'Automation with complex conditional logic and rules',
    descriptionHe: 'אוטומציה עם לוגיקה מותנית מורכבת וכללים',
    basePrice: 6000,
    estimatedDays: 8,
    complexity: 'complex',
    tags: ['logic', 'rules', 'complex', 'conditional']
  },
  {
    id: 'auto-sales-pipeline',
    category: 'automations',
    name: 'Complete Sales Pipeline with Dashboard',
    nameHe: 'Pipeline מכירות מלא עם דשבורד',
    description: 'Full sales pipeline automation with real-time dashboard',
    descriptionHe: 'אוטומציה מלאה של pipeline מכירות עם דשבורד real-time',
    basePrice: 9000,
    estimatedDays: 12,
    complexity: 'complex',
    tags: ['sales', 'pipeline', 'dashboard', 'crm']
  },
  {
    id: 'auto-cross-dept',
    category: 'automations',
    name: 'Cross-Department Automation',
    nameHe: 'אוטומציה בין-מחלקתית',
    description: 'Automation spanning multiple departments with handoffs',
    descriptionHe: 'אוטומציה בין מספר מחלקות עם העברות',
    basePrice: 7500,
    estimatedDays: 10,
    complexity: 'complex',
    tags: ['departments', 'workflow', 'complex', 'handoffs']
  },
  {
    id: 'auto-financial',
    category: 'automations',
    name: 'Financial Process Automation',
    nameHe: 'אוטומציית תהליכים פיננסיים',
    description: 'Invoicing, payments, reconciliation automation',
    descriptionHe: 'אוטומציה של חשבוניות, תשלומים והתאמות',
    basePrice: 6500,
    estimatedDays: 9,
    complexity: 'complex',
    tags: ['finance', 'invoicing', 'payments', 'accounting']
  },
  {
    id: 'auto-project-mgmt',
    category: 'automations',
    name: 'Project Management Automation',
    nameHe: 'מערכת ניהול פרויקטים אוטומטית',
    description: 'Automated project creation, task allocation, tracking',
    descriptionHe: 'יצירת פרויקטים, הקצאת משימות ומעקב אוטומטי',
    basePrice: 5500,
    estimatedDays: 8,
    complexity: 'complex',
    tags: ['projects', 'tasks', 'tracking', 'management']
  },
  {
    id: 'auto-sla-tracking',
    category: 'automations',
    name: 'SLA Tracking & Alerts',
    nameHe: 'מעקב והתראות SLA',
    description: 'Track SLAs and send alerts when approaching deadlines',
    descriptionHe: 'מעקב אחר SLA והתראות בעת התקרבות לדדליינים',
    basePrice: 2000,
    estimatedDays: 3,
    complexity: 'medium',
    tags: ['sla', 'tracking', 'alerts', 'monitoring']
  },
  {
    id: 'auto-custom',
    category: 'automations',
    name: 'Custom Automation',
    nameHe: 'אוטומציה מותאמת אישית',
    description: 'Custom automation tailored to specific business needs',
    descriptionHe: 'אוטומציה מותאמת אישית לצרכים עסקיים ספציפיים',
    basePrice: 5000,
    estimatedDays: 7,
    complexity: 'complex',
    tags: ['custom', 'automation', 'tailored', 'specific']
  },

  // ==================== AI AGENTS (PRIMARY) ====================
  // Basic AI
  {
    id: 'ai-faq-bot',
    category: 'ai_agents',
    name: 'FAQ Chatbot',
    nameHe: 'צ\'אטבוט למענה על שאלות נפוצות',
    description: 'AI chatbot to answer frequently asked questions',
    descriptionHe: 'צ\'אטבוט AI למענה על שאלות נפוצות',
    basePrice: 2500,
    estimatedDays: 3,
    complexity: 'simple',
    tags: ['ai', 'chatbot', 'faq', 'support']
  },
  {
    id: 'ai-lead-qualifier',
    category: 'ai_agents',
    name: 'AI Lead Qualifier',
    nameHe: 'AI לאיסוף מידע ראשוני מלידים',
    description: 'AI agent to collect initial information from leads',
    descriptionHe: 'סוכן AI לאיסוף מידע ראשוני מלידים',
    basePrice: 3000,
    estimatedDays: 4,
    complexity: 'simple',
    tags: ['ai', 'leads', 'qualification', 'intake']
  },
  {
    id: 'ai-form-assistant',
    category: 'ai_agents',
    name: 'AI Form Assistant',
    nameHe: 'AI למילוי טפסים עם ליווי',
    description: 'AI assistant to guide users through form completion',
    descriptionHe: 'עוזר AI לליווי משתמשים במילוי טפסים',
    basePrice: 2800,
    estimatedDays: 4,
    complexity: 'simple',
    tags: ['ai', 'forms', 'assistant', 'guidance']
  },
  {
    id: 'ai-triage',
    category: 'ai_agents',
    name: 'AI Inquiry Triage',
    nameHe: 'AI לסינון פניות ראשוני',
    description: 'AI to categorize and route inquiries',
    descriptionHe: 'AI לסיווג וניתוב פניות',
    basePrice: 2500,
    estimatedDays: 3,
    complexity: 'simple',
    tags: ['ai', 'triage', 'routing', 'categorization']
  },

  // Advanced AI
  {
    id: 'ai-sales-agent',
    category: 'ai_agents',
    name: 'Sales AI Agent',
    nameHe: 'סוכן AI למכירות',
    description: 'Complete AI sales agent from intake to appointment scheduling',
    descriptionHe: 'סוכן מכירות AI מלא מקליטה ועד זימון פגישה',
    basePrice: 7000,
    estimatedDays: 7,
    complexity: 'medium',
    tags: ['ai', 'sales', 'agent', 'appointments', 'crm']
  },
  {
    id: 'ai-service-agent',
    category: 'ai_agents',
    name: 'Customer Service AI Agent',
    nameHe: 'סוכן AI לשירות לקוחות',
    description: 'AI service agent with access to CRM and systems',
    descriptionHe: 'סוכן שירות AI עם גישה ל-CRM ומערכות',
    basePrice: 8000,
    estimatedDays: 8,
    complexity: 'medium',
    tags: ['ai', 'service', 'support', 'crm', 'integration']
  },
  {
    id: 'ai-complex-workflow',
    category: 'ai_agents',
    name: 'AI Agent with Complex Workflows',
    nameHe: 'סוכן AI עם תהליכי עבודה מורכבים',
    description: 'AI agent with complex conditional workflows',
    descriptionHe: 'סוכן AI עם זרימות עבודה מורכבות ומותנות',
    basePrice: 10000,
    estimatedDays: 10,
    complexity: 'complex',
    tags: ['ai', 'workflows', 'complex', 'conditional']
  },
  {
    id: 'ai-action-agent',
    category: 'ai_agents',
    name: 'AI Agent with Action Capabilities',
    nameHe: 'AI עם יכולות פעולה',
    description: 'AI that can take actions: update CRM, create tasks, etc.',
    descriptionHe: 'AI שיכול לבצע פעולות: עדכון CRM, יצירת משימות וכו\'',
    basePrice: 9000,
    estimatedDays: 9,
    complexity: 'medium',
    tags: ['ai', 'actions', 'automation', 'integration']
  },
  {
    id: 'ai-learning',
    category: 'ai_agents',
    name: 'Self-Learning AI Agent',
    nameHe: 'AI עם למידה מתמשכת',
    description: 'AI agent that learns and improves over time',
    descriptionHe: 'סוכן AI שלומד ומשתפר לאורך זמן',
    basePrice: 10000,
    estimatedDays: 10,
    complexity: 'medium',
    tags: ['ai', 'learning', 'ml', 'improvement']
  },

  // Custom AI
  {
    id: 'ai-multi-agent',
    category: 'ai_agents',
    name: 'Multi-Agent AI System',
    nameHe: 'מספר סוכני AI משתפי פעולה',
    description: 'Multiple AI agents working together',
    descriptionHe: 'מספר סוכני AI שמשתפים פעולה',
    basePrice: 15000,
    estimatedDays: 15,
    complexity: 'complex',
    tags: ['ai', 'multi-agent', 'complex', 'system']
  },
  {
    id: 'ai-branded',
    category: 'ai_agents',
    name: 'Brand-Personalized AI',
    nameHe: 'AI עם אישיות מותאמת למותג',
    description: 'AI with personality tailored to your brand',
    descriptionHe: 'AI עם אישיות המותאמת למותג שלך',
    basePrice: 12000,
    estimatedDays: 12,
    complexity: 'complex',
    tags: ['ai', 'branding', 'personality', 'custom']
  },
  {
    id: 'ai-full-integration',
    category: 'ai_agents',
    name: 'Fully Integrated AI System',
    nameHe: 'אינטגרציה עמוקה עם כל המערכות',
    description: 'AI deeply integrated with all business systems',
    descriptionHe: 'AI משולב עמוק עם כל מערכות העסק',
    basePrice: 18000,
    estimatedDays: 18,
    complexity: 'complex',
    tags: ['ai', 'integration', 'systems', 'complex']
  },
  {
    id: 'ai-multimodal',
    category: 'ai_agents',
    name: 'Multimodal AI (Docs/Images/Voice)',
    nameHe: 'AI עם עיבוד מסמכים/תמונות/קול',
    description: 'AI with document, image, and voice processing',
    descriptionHe: 'AI עם יכולות עיבוד מסמכים, תמונות וקול',
    basePrice: 20000,
    estimatedDays: 16,
    complexity: 'complex',
    tags: ['ai', 'multimodal', 'documents', 'images', 'voice']
  },
  {
    id: 'ai-predictive',
    category: 'ai_agents',
    name: 'Predictive AI with Analytics',
    nameHe: 'AI עם יכולות ניתוח וחיזוי',
    description: 'AI with predictive analytics and forecasting',
    descriptionHe: 'AI עם ניתוח חזוי ותחזיות',
    basePrice: 22000,
    estimatedDays: 20,
    complexity: 'complex',
    tags: ['ai', 'analytics', 'prediction', 'forecasting']
  },

  // ==================== INTEGRATIONS (SECONDARY) ====================
  {
    id: 'integration-simple',
    category: 'integrations',
    name: 'Simple Integration (2 systems)',
    nameHe: 'אינטגרציה פשוטה (2 מערכות)',
    description: 'Connect 2 popular tools with basic sync',
    descriptionHe: 'חיבור בין 2 כלים פופולריים עם סנכרון בסיסי',
    basePrice: 1000,
    estimatedDays: 2,
    complexity: 'simple',
    tags: ['integration', 'sync', 'simple']
  },
  {
    id: 'int-webhook',
    category: 'integrations',
    name: 'Webhook Setup',
    nameHe: 'הגדרת Webhook',
    description: 'Configure webhook for real-time data transfer',
    descriptionHe: 'הגדרת webhook להעברת נתונים בזמן אמת',
    basePrice: 800,
    estimatedDays: 1,
    complexity: 'simple',
    tags: ['webhook', 'realtime', 'integration']
  },
  {
    id: 'integration-complex',
    category: 'integrations',
    name: 'Complex Integration (3+ systems)',
    nameHe: 'אינטגרציה מורכבת (3+ מערכות)',
    description: 'Connect multiple systems with bidirectional sync',
    descriptionHe: 'חיבור מספר מערכות עם סנכרון דו-כיווני',
    basePrice: 3500,
    estimatedDays: 6,
    complexity: 'medium',
    tags: ['integration', 'complex', 'sync', 'bidirectional']
  },
  {
    id: 'int-transform',
    category: 'integrations',
    name: 'Integration with Data Transformation',
    nameHe: 'אינטגרציה עם טרנספורמציה של נתונים',
    description: 'Integration with data mapping and transformation',
    descriptionHe: 'אינטגרציה עם מיפוי וטרנספורמציה של נתונים',
    basePrice: 2500,
    estimatedDays: 4,
    complexity: 'medium',
    tags: ['integration', 'transformation', 'mapping']
  },
  {
    id: 'int-custom-api',
    category: 'integrations',
    name: 'Custom API Development',
    nameHe: 'פיתוח API מותאם אישית',
    description: 'Develop custom API for unique integration needs',
    descriptionHe: 'פיתוח API ייעודי לצרכי אינטגרציה ייחודיים',
    basePrice: 7000,
    estimatedDays: 8,
    complexity: 'complex',
    tags: ['api', 'development', 'custom', 'integration']
  },
  {
    id: 'int-legacy',
    category: 'integrations',
    name: 'Legacy System Integration',
    nameHe: 'אינטגרציה עם מערכות ישנות',
    description: 'Connect with older/legacy systems',
    descriptionHe: 'חיבור למערכות ישנות',
    basePrice: 5000,
    estimatedDays: 7,
    complexity: 'complex',
    tags: ['legacy', 'old-systems', 'integration']
  },
  {
    id: 'int-crm-marketing',
    category: 'integrations',
    name: 'CRM ↔ Marketing Platform Integration',
    nameHe: 'אינטגרציה CRM ↔ פלטפורמת שיווק',
    description: 'Sync leads and campaigns between CRM and marketing tools',
    descriptionHe: 'סנכרון לידים וקמפיינים בין CRM וכלי שיווק',
    basePrice: 2500,
    estimatedDays: 4,
    complexity: 'medium',
    tags: ['crm', 'marketing', 'integration', 'sync']
  },
  {
    id: 'int-crm-accounting',
    category: 'integrations',
    name: 'CRM ↔ Accounting System Integration',
    nameHe: 'אינטגרציה CRM ↔ מערכת חשבונאות',
    description: 'Sync customer data and invoices between CRM and accounting',
    descriptionHe: 'סנכרון נתוני לקוחות וחשבוניות בין CRM וחשבונאות',
    basePrice: 3000,
    estimatedDays: 5,
    complexity: 'medium',
    tags: ['crm', 'accounting', 'integration', 'invoices']
  },
  {
    id: 'int-crm-support',
    category: 'integrations',
    name: 'CRM ↔ Support System Integration',
    nameHe: 'אינטגרציה CRM ↔ מערכת תמיכה',
    description: 'Sync customer tickets between CRM and helpdesk',
    descriptionHe: 'סנכרון פניות לקוחות בין CRM ומערכת תמיכה',
    basePrice: 2500,
    estimatedDays: 4,
    complexity: 'medium',
    tags: ['crm', 'support', 'helpdesk', 'integration', 'tickets']
  },
  {
    id: 'int-calendar',
    category: 'integrations',
    name: 'Calendar Integration (Google/Outlook)',
    nameHe: 'אינטגרציית לוח שנה (Google/Outlook)',
    description: 'Sync appointments and events with calendar systems',
    descriptionHe: 'סנכרון פגישות ואירועים עם מערכות לוח שנה',
    basePrice: 1500,
    estimatedDays: 3,
    complexity: 'simple',
    tags: ['calendar', 'google', 'outlook', 'integration', 'appointments']
  },
  {
    id: 'int-ecommerce',
    category: 'integrations',
    name: 'E-commerce Platform Integration',
    nameHe: 'אינטגרציית פלטפורמת מסחר אלקטרוני',
    description: 'Integrate with Shopify, WooCommerce, or other e-commerce platforms',
    descriptionHe: 'אינטגרציה עם Shopify, WooCommerce או פלטפורמות מסחר אחרות',
    basePrice: 3000,
    estimatedDays: 5,
    complexity: 'medium',
    tags: ['ecommerce', 'shopify', 'woocommerce', 'integration', 'orders']
  },

  // ==================== SYSTEM IMPLEMENTATION (SECONDARY) ====================
  {
    id: 'impl-crm',
    category: 'system_implementation',
    name: 'CRM Implementation',
    nameHe: 'הטמעת CRM',
    description: 'Setup and configure CRM (Zoho/HubSpot/Pipedrive)',
    descriptionHe: 'הקמה והגדרה של CRM',
    basePrice: 3000,
    estimatedDays: 5,
    complexity: 'medium',
    tags: ['crm', 'implementation', 'setup']
  },
  {
    id: 'impl-marketing',
    category: 'system_implementation',
    name: 'Marketing Tools Implementation',
    nameHe: 'הטמעת כלי שיווק',
    description: 'Setup email marketing or social media tools',
    descriptionHe: 'הטמעת כלי Email Marketing או ניהול רשתות חברתיות',
    basePrice: 1500,
    estimatedDays: 3,
    complexity: 'simple',
    tags: ['marketing', 'email', 'social', 'implementation']
  },
  {
    id: 'impl-erp',
    category: 'system_implementation',
    name: 'ERP Implementation',
    nameHe: 'הטמעת ERP',
    description: 'Setup and configure ERP system',
    descriptionHe: 'הקמה והגדרה של מערכת ERP',
    basePrice: 6000,
    estimatedDays: 8,
    complexity: 'complex',
    tags: ['erp', 'implementation', 'setup']
  },
  {
    id: 'impl-project-management',
    category: 'system_implementation',
    name: 'Project Management System',
    nameHe: 'מערכת ניהול פרויקטים',
    description: 'Setup project management tools (Asana/Monday/ClickUp)',
    descriptionHe: 'הטמעת כלי ניהול פרויקטים',
    basePrice: 2000,
    estimatedDays: 4,
    complexity: 'medium',
    tags: ['project-management', 'implementation', 'setup']
  },
  {
    id: 'impl-helpdesk',
    category: 'system_implementation',
    name: 'Helpdesk System Implementation',
    nameHe: 'הטמעת מערכת תמיכה',
    description: 'Setup and configure helpdesk/ticketing system',
    descriptionHe: 'הקמה והגדרה של מערכת תמיכה/טיקטים',
    basePrice: 2500,
    estimatedDays: 4,
    complexity: 'medium',
    tags: ['helpdesk', 'support', 'tickets', 'implementation']
  },
  {
    id: 'impl-ecommerce',
    category: 'system_implementation',
    name: 'E-commerce Platform Implementation',
    nameHe: 'הטמעת פלטפורמת מסחר אלקטרוני',
    description: 'Setup and configure e-commerce platform (Shopify/WooCommerce)',
    descriptionHe: 'הקמה והגדרה של פלטפורמת מסחר אלקטרוני',
    basePrice: 4000,
    estimatedDays: 6,
    complexity: 'medium',
    tags: ['ecommerce', 'shopify', 'woocommerce', 'implementation']
  },
  {
    id: 'impl-workflow-platform',
    category: 'system_implementation',
    name: 'Workflow Platform Implementation',
    nameHe: 'הטמעת פלטפורמת תהליכי עבודה',
    description: 'Setup and configure workflow automation platform (n8n/Zapier/Make)',
    descriptionHe: 'הקמה והגדרה של פלטפורמת אוטומציה',
    basePrice: 3000,
    estimatedDays: 5,
    complexity: 'medium',
    tags: ['workflow', 'automation', 'platform', 'implementation']
  },
  {
    id: 'impl-analytics',
    category: 'system_implementation',
    name: 'Analytics Platform Implementation',
    nameHe: 'הטמעת פלטפורמת אנליטיקס',
    description: 'Setup and configure analytics and BI tools',
    descriptionHe: 'הקמה והגדרה של כלי אנליטיקס ו-BI',
    basePrice: 3500,
    estimatedDays: 5,
    complexity: 'medium',
    tags: ['analytics', 'bi', 'reporting', 'implementation']
  },
  {
    id: 'impl-custom',
    category: 'system_implementation',
    name: 'Custom System Implementation',
    nameHe: 'הטמעת מערכת מותאמת אישית',
    description: 'Custom system setup and implementation',
    descriptionHe: 'הקמה והטמעה של מערכת מותאמת אישית',
    basePrice: 5000,
    estimatedDays: 7,
    complexity: 'complex',
    tags: ['custom', 'implementation', 'system']
  },

  // ==================== ADDITIONAL SERVICES (OPTIONAL) ====================
  {
    id: 'data-cleanup',
    category: 'additional_services',
    name: 'Data Cleaning & Deduplication',
    nameHe: 'ניקוי והסרת כפילויות בנתונים',
    description: 'Clean duplicates and consolidate data',
    descriptionHe: 'ניקוי כפילויות ואיחוד נתונים',
    basePrice: 2500,
    estimatedDays: 5,
    complexity: 'medium',
    tags: ['data', 'cleaning', 'deduplication']
  },
  {
    id: 'add-dashboard',
    category: 'additional_services',
    name: 'Real-Time Dashboard',
    nameHe: 'דשבורד real-time',
    description: 'Build custom real-time analytics dashboard',
    descriptionHe: 'בניית דשבורד ניתוח real-time מותאם',
    basePrice: 2000,
    estimatedDays: 4,
    complexity: 'medium',
    tags: ['dashboard', 'analytics', 'reporting']
  },
  {
    id: 'add-custom-reports',
    category: 'additional_services',
    name: 'Custom Automated Reports',
    nameHe: 'דוחות אוטומטיים מותאמים',
    description: 'Create custom automated reports',
    descriptionHe: 'יצירת דוחות אוטומטיים מותאמים אישית',
    basePrice: 1500,
    estimatedDays: 3,
    complexity: 'medium',
    tags: ['reports', 'custom', 'automation']
  },
  {
    id: 'training-workshops',
    category: 'additional_services',
    name: 'Training & Workshops',
    nameHe: 'הדרכות וסדנאות',
    description: 'Train team and create documentation',
    descriptionHe: 'הדרכת צוות ויצירת תיעוד',
    basePrice: 1000,
    estimatedDays: 2,
    complexity: 'simple',
    tags: ['training', 'documentation', 'workshops']
  },
  {
    id: 'support-ongoing',
    category: 'additional_services',
    name: 'Ongoing Support & Maintenance',
    nameHe: 'תמיכה ותחזוקה שוטפת',
    description: 'Monthly support and maintenance package',
    descriptionHe: 'חבילת תמיכה ותחזוקה חודשית',
    basePrice: 1500,
    estimatedDays: 0, // ongoing
    complexity: 'simple',
    tags: ['support', 'maintenance', 'ongoing']
  },
  {
    id: 'data-migration',
    category: 'additional_services',
    name: 'Data Migration',
    nameHe: 'העברת נתונים בין מערכות',
    description: 'Transfer data between systems with ETL, mapping, and validation',
    descriptionHe: 'העברת נתונים בין מערכות עם ETL, מיפוי ואימות',
    basePrice: 3000,
    estimatedDays: 5,
    complexity: 'medium',
    tags: ['data', 'migration', 'etl', 'transfer']
  },
  {
    id: 'training-ongoing',
    category: 'additional_services',
    name: 'Ongoing Training & Support',
    nameHe: 'הדרכה מתמשכת ותמיכה בלמידה',
    description: 'Continuous training, updated materials, and learning support',
    descriptionHe: 'הדרכה מתמשכת, חומרים מעודכנים ותמיכה בלמידה',
    basePrice: 2000,
    estimatedDays: 0, // ongoing
    complexity: 'simple',
    tags: ['training', 'ongoing', 'support', 'learning']
  }
];

// Helper functions
export const getServicesByCategory = (categoryId: ServiceCategoryId): ServiceItem[] => {
  return SERVICES_DATABASE.filter(service => service.category === categoryId);
};

export const getServiceById = (serviceId: string): ServiceItem | undefined => {
  return SERVICES_DATABASE.find(service => service.id === serviceId);
};

export const getServicesByTags = (tags: string[]): ServiceItem[] => {
  return SERVICES_DATABASE.filter(service =>
    tags.some(tag => service.tags.includes(tag))
  );
};

export const getCategoryById = (categoryId: ServiceCategoryId): ServiceCategory | undefined => {
  return SERVICE_CATEGORIES.find(cat => cat.id === categoryId);
};
