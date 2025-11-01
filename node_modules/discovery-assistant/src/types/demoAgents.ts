/**
 * Types for Demo Page Agents
 * Defines the structure for AI agents displayed in the demo page
 */

export interface DemoAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  webhookUrl: string;
  color: string;
  initialMessages: string[];
  disabled?: boolean;
  disabledReason?: string;
  airtableEmbedUrl?: string;
  airtableTitle?: string;
}

export interface DemoAgentCategory {
  id: string;
  name: string;
  description: string;
}

export interface N8NChatConfig {
  webhookUrl: string;
  agentName: string;
  initialMessages: string[];
  theme?: 'light' | 'dark';
}
