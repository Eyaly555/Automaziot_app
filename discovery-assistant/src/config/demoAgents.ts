/**
 * Demo Agents Configuration
 * Defines the AI agents available for demonstration
 */

import { DemoAgent } from '../types/demoAgents';

export const DEMO_AGENTS: DemoAgent[] = [
  {
    id: 'real-estate-agent',
    name: 'סוכן נדלן',
    description: 'סוכן AI המתמחה בשירותי נדלן. ממלא תפקיד של יועץ נדלן מקצועי שעוזר בחיפוש נכסים, הערכת מחירים, וביעוץ בהשקעות נדלן.',
    category: 'נדלן',
    icon: 'Building2',
    webhookUrl: 'https://eyaly555.app.n8n.cloud/webhook/2fb86276-fc97-4f79-9f0e-33e2945140ee/chat',
    color: 'from-blue-500 to-blue-600',
    initialMessages: [
      'שלום! 👋',
      'אני סוכן הנדלן שלך. כיצד אוכל לעזור לך היום? האם אתה מעוניין לקנות, למכור, או לשכור נכס?'
    ],
    disabled: false
  },
  {
    id: 'sales-agent',
    name: 'סוכן מכירות כללי',
    description: 'סוכן AI המתמחה במכירות כלליות. עוזר בשאלות מוצרים, טיפול בהצעות, וסגירת עסקאות עם לקוחות פוטנציאליים.',
    category: 'מכירות',
    icon: 'TrendingUp',
    webhookUrl: 'https://eyaly555.app.n8n.cloud/webhook/placeholder-sales/chat',
    color: 'from-green-500 to-green-600',
    initialMessages: [
      'היי! 👋',
      'אני סוכן המכירות שלך. בעזרתי תוכל לגלות את המוצרים שלנו ולמצוא את הפתרון המתאים לך.'
    ],
    disabled: true,
    disabledReason: 'בהכנה - עדכון webhook URL נדרש'
  },
  {
    id: 'customer-service-agent',
    name: 'שירות לקוחות כללי',
    description: 'סוכן AI המתמחה בשירות לקוחות. עוזר בתשובות לשאלות נפוצות, פתרון בעיות, ותמיכה טכנית כללית.',
    category: 'שירות לקוחות',
    icon: 'Headphones',
    webhookUrl: 'https://eyaly555.app.n8n.cloud/webhook/placeholder-support/chat',
    color: 'from-purple-500 to-purple-600',
    initialMessages: [
      'שלום! 👋',
      'ברוכים הבאים לשירות הלקוחות שלנו. בעזרתי אוכל לעזור לך בכל שאלה או בעיה שיש לך.'
    ],
    disabled: true,
    disabledReason: 'בהכנה - עדכון webhook URL נדרש'
  }
];

/**
 * Get an agent by ID
 */
export const getDemoAgentById = (id: string): DemoAgent | undefined => {
  return DEMO_AGENTS.find(agent => agent.id === id);
};

/**
 * Get all enabled agents
 */
export const getEnabledDemoAgents = (): DemoAgent[] => {
  return DEMO_AGENTS.filter(agent => !agent.disabled);
};

/**
 * Get agents grouped by category
 */
export const getDemoAgentsByCategory = (): Record<string, DemoAgent[]> => {
  const grouped: Record<string, DemoAgent[]> = {};

  DEMO_AGENTS.forEach(agent => {
    if (!grouped[agent.category]) {
      grouped[agent.category] = [];
    }
    grouped[agent.category].push(agent);
  });

  return grouped;
};
