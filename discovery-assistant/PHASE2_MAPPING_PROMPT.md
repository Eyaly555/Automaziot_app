# Phase 2 Service-to-Technical Requirements Mapping - AI Generation Prompt

## 🎯 Mission

Generate a comprehensive mapping file that connects **each of the 59 services** to their exact technical requirements for Phase 2 (Implementation Specification). This mapping will guide developers on what information to collect from clients to successfully implement each purchased service.

---

## 📚 Context: Application Architecture

### Business Flow
1. **Phase 1 (Discovery)**: Client fills out 9 modules about their business
2. **Proposal Generation**: `proposalEngine.ts` analyzes Phase 1 data and suggests 59 possible services
3. **Client Approval**: Client selects which services to purchase → saved as `purchasedServices`
4. **Phase 2 (Implementation Spec)**: Collect detailed technical specs needed to implement ONLY the purchased services
5. **Phase 3 (Development)**: Developers receive complete specification to implement

### Current Problem
Phase 2 currently has 5 sections:
1. ✅ **Requirements** - Works correctly (filtered by purchasedServices)
2. ❌ **Systems** - Not filtered, manual selection
3. ❌ **Integrations** - Not filtered, manual creation
4. ⚠️ **AI Agents** - Partially filtered (category level only)
5. ⚠️ **Acceptance Criteria** - Too generic

### Desired Solution
Create a mapping where for each service, we define:
- **Systems Required** - Which systems need deep dive (auth, modules, data migration)
- **Integrations Required** - Which system-to-system flows are needed
- **AI Agents Required** - Which AI agents need detailed specification
- **Acceptance Criteria** - Service-specific success criteria
- **Additional Technical Fields** - Any extra technical details needed beyond the requirements questionnaire

---

## 📋 Input Data You Have Access To

### 1. Complete Service Catalog
Location: `src/config/servicesDatabase.ts`
- 59 services across 5 categories
- Categories: automations, ai_agents, integrations, system_implementation, additional_services

### 2. Existing Requirements Templates
Location: `src/config/serviceRequirementsTemplates.ts` (4,112 lines)
- 18 services already have detailed questionnaires
- These questionnaires collect business requirements (what the client needs)
- Examples: CRM Implementation, AI Chatbot, WhatsApp Automation, Lead Workflow

### 3. Phase 1 Discovery Modules
What information is ALREADY collected in Phase 1:
- **Overview**: Business type, employees, budget, main challenge, industry
- **Leads & Sales**: Lead sources, volumes, sales process, follow-up, routing
- **Customer Service**: Support channels, response times, FAQ, ticket volume
- **Operations**: Work processes, document management, bottlenecks
- **Reporting**: Current reports, KPIs, dashboard needs
- **AI Agents**: AI use cases by department (sales, service, operations)
- **Systems**: Current systems, integrations, API/webhook usage
- **ROI**: Success metrics, time savings goals, revenue targets

### 4. Phase 2 Data Structures
Location: `src/types/phase2.ts`

**DetailedSystemSpec** includes:
- systemId, systemName
- authentication (method, credentials, API endpoint, rate limits)
- modules (system modules, fields, custom fields, field mapping)
- dataMigration (record count, method, cleanup, rollback plan)
- technicalNotes

**IntegrationFlow** includes:
- name, sourceSystem, targetSystem
- trigger (webhook, schedule, new_record, etc.)
- steps (fetch, transform, create, update)
- frequency, direction (one-way/bidirectional)
- errorHandling (retry, skip, stop)
- testCases

**DetailedAIAgentSpec** includes:
- name, department (sales/service/operations)
- knowledgeBase (sources, update frequency, document count)
- conversationFlow (greeting, intents, fallback, escalation)
- integrations (CRM, email, calendar, webhooks)
- training (FAQ, conversation examples, tone, language)
- model (GPT-4, Claude, Gemini, temperature, maxTokens)

**AcceptanceCriteria** includes:
- functional (requirements with priority, test scenarios)
- performance (metrics, targets, test methods)
- security (requirements, verification methods)
- usability (user roles, success criteria)

---

## 🎯 What You Need to Generate

### Output Format: TypeScript Mapping File

Create `serviceToSystemMapping.ts` with this structure:

```typescript
export interface ServiceTechnicalRequirements {
  serviceId: string;
  serviceName: string;
  serviceNameHe: string;

  // Systems that need detailed specification
  requiredSystems: SystemRequirement[];

  // Integrations that need to be built
  requiredIntegrations: IntegrationRequirement[];

  // AI agents that need detailed spec (if applicable)
  requiredAIAgents: AIAgentRequirement[];

  // Service-specific acceptance criteria
  acceptanceCriteria: {
    functional: string[];
    performance: string[];
    security: string[];
    usability?: string[];
  };

  // Additional technical questions beyond the requirements template
  additionalTechnicalFields?: TechnicalField[];

  // Dependencies on other services
  dependencies?: {
    serviceId: string;
    reason: string;
  }[];

  // Pre-requisites that must exist
  prerequisites?: {
    type: 'system' | 'integration' | 'data';
    description: string;
  }[];
}

interface SystemRequirement {
  systemType: string; // e.g., 'crm', 'whatsapp', 'email', 'erp', 'project_management'
  specificSystem?: string; // e.g., 'zoho-crm', 'hubspot', 'salesforce' (if known)
  reason: string; // Why this system is needed
  priority: 'must_have' | 'should_have' | 'optional';

  // What needs to be collected for this system
  requiredDetails: {
    authentication: boolean;
    modules: boolean;
    dataMigration: boolean;
    customFields?: string[]; // Specific custom fields to collect
  };
}

interface IntegrationRequirement {
  name: string;
  nameHe: string;
  sourceSystem: string;
  targetSystem: string;
  direction: 'one_way' | 'bidirectional';
  purpose: string; // What this integration accomplishes
  priority: 'critical' | 'high' | 'medium' | 'low';

  // Pre-filled template for this integration
  suggestedTrigger?: string;
  suggestedSteps?: string[];
  suggestedFrequency?: string;
}

interface AIAgentRequirement {
  department: 'sales' | 'service' | 'operations';
  agentType: string; // e.g., 'faq_bot', 'sales_assistant', 'service_agent'
  purpose: string;
  priority: 'must_have' | 'should_have' | 'optional';

  // Pre-filled suggestions
  suggestedKnowledgeSources?: string[];
  suggestedIntents?: string[];
  suggestedIntegrations?: string[];
}

interface TechnicalField {
  id: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'list';
  label: string;
  labelHe: string;
  required: boolean;
  purpose: string; // Why developers need this information
  options?: { value: string; label: string; labelHe: string }[];
}
```

---

## 📝 Instructions for AI Generation

### Step 1: Understand Each Service
For EACH of the 59 services, analyze:
1. What does this service do? (from servicesDatabase.ts)
2. What already exists in the requirements template? (from serviceRequirementsTemplates.ts)
3. What Phase 1 data is relevant? (from discovery modules)
4. What technical components are needed to implement it?

### Step 2: Determine Technical Requirements

For each service, think through:

**Systems:**
- What systems does a developer need API access to?
- Example: "Auto CRM Update" needs CRM system (Zoho/HubSpot/Salesforce)
- Example: "WhatsApp Automation" needs WhatsApp Business API + CRM
- Example: "Email Templates" needs email provider (Gmail/Outlook) + CRM

**Integrations:**
- What data flows between systems?
- Example: "Auto Lead Response" → Website Form → CRM → Email/WhatsApp
- Example: "Lead Workflow" → CRM → Lead Scoring → Assignment → Notification
- Example: "Document Generation" → CRM → Document Template → Google Drive/Dropbox

**AI Agents:**
- Does this service require AI?
- Example: "AI Sales Agent" → needs AI agent spec with sales department focus
- Example: "AI FAQ Bot" → needs AI agent spec with FAQ knowledge base
- Example: "Auto CRM Update" → does NOT need AI agent

**Acceptance Criteria:**
- How do we know this service was successfully implemented?
- Functional: "Lead arrives → WhatsApp sent within 5 minutes"
- Performance: "API response time < 200ms"
- Security: "API keys stored encrypted, HTTPS only"
- Usability: "User can edit templates without code"

### Step 3: Identify Dependencies and Prerequisites

**Dependencies:**
- "WhatsApp Automation" depends on "CRM Implementation" (needs CRM to exist)
- "AI Sales Agent" depends on "CRM Implementation" (needs CRM integration)
- "Advanced Reporting" depends on having systems with data

**Prerequisites:**
- "Data Migration" requires source system API access
- "Email Templates" requires email provider credentials
- "AI Agent" requires knowledge base content

### Step 4: Map Additional Technical Fields

Beyond the requirements template, what TECHNICAL details do developers need?

Example for "WhatsApp Automation":
```typescript
additionalTechnicalFields: [
  {
    id: 'whatsapp_business_account_id',
    type: 'text',
    label: 'WhatsApp Business Account ID',
    labelHe: 'מזהה חשבון WhatsApp Business',
    required: true,
    purpose: 'Developers need this to connect to WhatsApp API'
  },
  {
    id: 'webhook_verification_token',
    type: 'text',
    label: 'Webhook Verification Token',
    labelHe: 'טוקן אימות Webhook',
    required: true,
    purpose: 'Required for WhatsApp webhook setup'
  }
]
```

---

## 🔍 Analysis Framework - Apply to Each Service

Use this framework for ALL 59 services:

### 1. Service Analysis
- **Service Name**: [from servicesDatabase.ts]
- **Category**: automations | ai_agents | integrations | system_implementation | additional_services
- **Complexity**: simple | medium | complex
- **What it does**: [1-2 sentence description]

### 2. Systems Required
Think: "To implement this service, developers need access to which systems?"
- List each system
- Explain why it's needed
- Mark priority

### 3. Integrations Required
Think: "What data needs to flow between systems?"
- Source → Target
- What data moves
- When/how often
- Error handling needs

### 4. AI Agents Required (if applicable)
Think: "Does this need an AI agent? What type?"
- Department focus
- Knowledge sources needed
- Integrations needed

### 5. Acceptance Criteria
Think: "How will we know this service works correctly?"
- Functional tests
- Performance benchmarks
- Security requirements
- User experience goals

### 6. Additional Technical Fields
Think: "What technical details aren't in the requirements template but developers need?"
- API keys, tokens, IDs
- Webhook URLs
- Configuration values
- Technical constraints

### 7. Dependencies & Prerequisites
Think: "What must exist before we can implement this?"
- Other services needed first
- Data requirements
- Access requirements

---

## 📊 Reference Examples

### Example 1: CRM Implementation

```typescript
{
  serviceId: 'impl-crm',
  serviceName: 'CRM Implementation',
  serviceNameHe: 'הטמעת CRM',

  requiredSystems: [
    {
      systemType: 'crm',
      specificSystem: undefined, // Will be chosen in requirements (Zoho/HubSpot/Salesforce)
      reason: 'Core system being implemented',
      priority: 'must_have',
      requiredDetails: {
        authentication: true, // Need API access, OAuth setup
        modules: true, // Need to configure Contacts, Deals, Activities
        dataMigration: true, // Need to import existing customer data
        customFields: [
          'Lead Source Tracking',
          'Sales Pipeline Stages',
          'Custom Fields List'
        ]
      }
    }
  ],

  requiredIntegrations: [
    {
      name: 'Website Forms to CRM',
      nameHe: 'טפסי אתר ל-CRM',
      sourceSystem: 'website_forms',
      targetSystem: 'crm',
      direction: 'one_way',
      purpose: 'Automatically create leads in CRM from website form submissions',
      priority: 'critical',
      suggestedTrigger: 'webhook',
      suggestedSteps: [
        'Receive form submission webhook',
        'Validate required fields',
        'Map form fields to CRM fields',
        'Create lead in CRM',
        'Send confirmation email'
      ],
      suggestedFrequency: 'realtime'
    },
    {
      name: 'Email Sync to CRM',
      nameHe: 'סנכרון אימייל ל-CRM',
      sourceSystem: 'email',
      targetSystem: 'crm',
      direction: 'bidirectional',
      purpose: 'Sync emails with CRM contacts and log email history',
      priority: 'high',
      suggestedTrigger: 'realtime',
      suggestedSteps: [
        'Monitor email inbox',
        'Match email to CRM contact',
        'Log email activity',
        'Update last contact date'
      ],
      suggestedFrequency: 'realtime'
    }
  ],

  requiredAIAgents: [], // CRM implementation doesn't require AI by default

  acceptanceCriteria: {
    functional: [
      'All lead sources configured and tracking correctly',
      'Sales pipeline stages match business process',
      'Data migration completed with 100% accuracy',
      'Email integration syncing bidirectionally',
      'Website form creates lead within 10 seconds',
      'All team members can log in and access their leads',
      'Custom fields appear correctly in all views',
      'Reports show accurate pipeline data'
    ],
    performance: [
      'Lead creation from form < 10 seconds',
      'Search response time < 2 seconds',
      'Dashboard loads < 3 seconds',
      'Email sync delay < 5 minutes'
    ],
    security: [
      'API credentials stored encrypted',
      'Role-based access control configured',
      'Data encrypted in transit (HTTPS)',
      'Regular backup schedule established',
      'Audit log enabled for data changes'
    ],
    usability: [
      'Sales team can complete basic tasks without training',
      'Mobile app accessible for field sales',
      'Custom fields labeled clearly in Hebrew',
      'Error messages helpful and actionable'
    ]
  },

  additionalTechnicalFields: [
    {
      id: 'crm_api_key',
      type: 'text',
      label: 'CRM API Key',
      labelHe: 'מפתח API של CRM',
      required: true,
      purpose: 'Developers need API key for programmatic access to CRM'
    },
    {
      id: 'crm_webhook_url',
      type: 'text',
      label: 'CRM Webhook URL',
      labelHe: 'URL Webhook של CRM',
      required: false,
      purpose: 'For real-time notifications when CRM data changes'
    },
    {
      id: 'data_migration_source',
      type: 'select',
      label: 'Current Data Location',
      labelHe: 'מיקום נתונים נוכחי',
      required: true,
      purpose: 'Developers need to know where to import data from',
      options: [
        { value: 'excel', label: 'Excel Spreadsheet', labelHe: 'גיליון Excel' },
        { value: 'google_sheets', label: 'Google Sheets', labelHe: 'Google Sheets' },
        { value: 'old_crm', label: 'Old CRM System', labelHe: 'מערכת CRM ישנה' },
        { value: 'csv', label: 'CSV Files', labelHe: 'קבצי CSV' }
      ]
    }
  ],

  dependencies: [],

  prerequisites: [
    {
      type: 'system',
      description: 'CRM platform subscription active (Zoho/HubSpot/Salesforce)'
    },
    {
      type: 'data',
      description: 'Existing customer/lead data organized and ready for import'
    }
  ]
}
```

### Example 2: WhatsApp Automation

```typescript
{
  serviceId: 'auto-sms-whatsapp',
  serviceName: 'Auto SMS/WhatsApp to Leads',
  serviceNameHe: 'SMS/WhatsApp אוטומטי ללידים',

  requiredSystems: [
    {
      systemType: 'whatsapp',
      specificSystem: 'whatsapp-business-api',
      reason: 'Required to send WhatsApp messages programmatically',
      priority: 'must_have',
      requiredDetails: {
        authentication: true,
        modules: false,
        dataMigration: false,
        customFields: [
          'WhatsApp Business Account ID',
          'Phone Number ID',
          'Webhook Verification Token'
        ]
      }
    },
    {
      systemType: 'crm',
      reason: 'Source of lead data and phone numbers',
      priority: 'must_have',
      requiredDetails: {
        authentication: true,
        modules: true, // Need Contacts/Leads module
        dataMigration: false
      }
    }
  ],

  requiredIntegrations: [
    {
      name: 'New Lead to WhatsApp',
      nameHe: 'ליד חדש ל-WhatsApp',
      sourceSystem: 'crm',
      targetSystem: 'whatsapp',
      direction: 'one_way',
      purpose: 'Send automatic WhatsApp message when new lead is created',
      priority: 'critical',
      suggestedTrigger: 'new_record',
      suggestedSteps: [
        'Detect new lead in CRM',
        'Extract phone number and name',
        'Format phone number to international format',
        'Get WhatsApp template message',
        'Personalize message with lead name',
        'Send via WhatsApp Business API',
        'Log delivery status in CRM'
      ],
      suggestedFrequency: 'realtime'
    }
  ],

  requiredAIAgents: [], // Basic automation doesn't need AI

  acceptanceCriteria: {
    functional: [
      'WhatsApp sent within 5 minutes of lead creation',
      'Message personalized with lead name',
      'Delivery status logged back to CRM',
      'Failed messages retry 3 times',
      'Business hours respected (no messages at night)',
      'Opt-out mechanism working'
    ],
    performance: [
      'Message delivery rate > 95%',
      'Delivery time < 5 minutes from lead creation',
      'Webhook response time < 1 second'
    ],
    security: [
      'WhatsApp API token encrypted',
      'Phone numbers validated before sending',
      'GDPR compliance - user consent tracked',
      'Message logs retained per regulations'
    ],
    usability: [
      'User can edit message templates without code',
      'Clear dashboard showing sent/failed messages',
      'Easy to pause/resume automation'
    ]
  },

  additionalTechnicalFields: [
    {
      id: 'whatsapp_business_account_id',
      type: 'text',
      label: 'WhatsApp Business Account ID',
      labelHe: 'מזהה חשבון WhatsApp Business',
      required: true,
      purpose: 'Required for WhatsApp Business API authentication'
    },
    {
      id: 'whatsapp_phone_number_id',
      type: 'text',
      label: 'WhatsApp Phone Number ID',
      labelHe: 'מזהה מספר טלפון WhatsApp',
      required: true,
      purpose: 'Identifies which phone number sends messages'
    },
    {
      id: 'whatsapp_api_token',
      type: 'text',
      label: 'WhatsApp API Access Token',
      labelHe: 'טוקן גישה API של WhatsApp',
      required: true,
      purpose: 'Authentication token for WhatsApp Business API'
    },
    {
      id: 'message_template_ids',
      type: 'list',
      label: 'Approved WhatsApp Template IDs',
      labelHe: 'מזהי תבניות WhatsApp מאושרות',
      required: true,
      purpose: 'WhatsApp requires pre-approved templates for automated messages'
    },
    {
      id: 'business_hours',
      type: 'text',
      label: 'Business Hours for Sending',
      labelHe: 'שעות פעילות לשליחה',
      required: true,
      purpose: 'Prevent sending messages outside business hours'
    }
  ],

  dependencies: [
    {
      serviceId: 'impl-crm',
      reason: 'WhatsApp automation requires CRM as source of lead data'
    }
  ],

  prerequisites: [
    {
      type: 'system',
      description: 'WhatsApp Business Account verified and active'
    },
    {
      type: 'system',
      description: 'WhatsApp message templates approved by WhatsApp'
    },
    {
      type: 'data',
      description: 'CRM contains valid phone numbers in international format'
    }
  ]
}
```

### Example 3: AI Sales Agent

```typescript
{
  serviceId: 'ai-sales-agent',
  serviceName: 'AI Sales Agent',
  serviceNameHe: 'סוכן AI למכירות',

  requiredSystems: [
    {
      systemType: 'crm',
      reason: 'AI agent needs to read/write lead data',
      priority: 'must_have',
      requiredDetails: {
        authentication: true,
        modules: true, // Contacts, Deals, Activities
        dataMigration: false
      }
    }
  ],

  requiredIntegrations: [
    {
      name: 'AI Agent to CRM',
      nameHe: 'סוכן AI ל-CRM',
      sourceSystem: 'ai_agent',
      targetSystem: 'crm',
      direction: 'bidirectional',
      purpose: 'AI reads customer data, writes conversation notes and updates',
      priority: 'critical',
      suggestedTrigger: 'event',
      suggestedSteps: [
        'Customer message arrives',
        'AI retrieves customer history from CRM',
        'AI generates contextual response',
        'AI logs conversation in CRM',
        'AI updates lead score/status if needed'
      ],
      suggestedFrequency: 'realtime'
    },
    {
      name: 'Website Chat Widget',
      nameHe: 'ווידג\'ט צ\'אט באתר',
      sourceSystem: 'website',
      targetSystem: 'ai_agent',
      direction: 'bidirectional',
      purpose: 'Embed AI chat on website for visitor engagement',
      priority: 'high',
      suggestedTrigger: 'manual',
      suggestedSteps: [
        'Visitor opens chat widget',
        'AI sends greeting',
        'Conversation handled by AI',
        'Create lead if visitor provides contact info'
      ],
      suggestedFrequency: 'realtime'
    }
  ],

  requiredAIAgents: [
    {
      department: 'sales',
      agentType: 'sales_assistant',
      purpose: 'Engage with leads, qualify them, and book meetings',
      priority: 'must_have',
      suggestedKnowledgeSources: [
        'Product catalog and pricing',
        'Company overview and value proposition',
        'Common objections and responses',
        'FAQ about products/services',
        'Case studies and success stories'
      ],
      suggestedIntents: [
        'request_quote',
        'ask_about_pricing',
        'book_meeting',
        'ask_about_features',
        'ask_about_integration',
        'check_availability',
        'request_demo',
        'compare_products'
      ],
      suggestedIntegrations: [
        'CRM (read customer history, write notes)',
        'Calendar (check availability, book meetings)',
        'Email (send follow-up emails)',
        'Knowledge Base (retrieve product info)'
      ]
    }
  ],

  acceptanceCriteria: {
    functional: [
      'AI handles 70% of sales inquiries without human intervention',
      'AI correctly qualifies leads based on budget/timeline/authority',
      'AI books meetings only when availability confirmed',
      'AI escalates complex cases to human sales rep',
      'AI remembers conversation context across sessions',
      'AI creates CRM lead with captured information',
      'AI sends follow-up emails automatically',
      'AI speaks both Hebrew and English fluently'
    ],
    performance: [
      'Response time < 3 seconds',
      'Conversation completion rate > 60%',
      'Lead capture rate > 40%',
      'Meeting booking rate > 15%',
      'Uptime > 99.5%'
    ],
    security: [
      'Customer data encrypted in transit and at rest',
      'AI follows GDPR guidelines for data collection',
      'Conversation logs retained per company policy',
      'API keys secured in environment variables',
      'Rate limiting to prevent abuse'
    ],
    usability: [
      'Customer satisfaction score > 4/5',
      'Escalation to human smooth and transparent',
      'Chat widget loads in < 2 seconds',
      'Works on mobile and desktop',
      'Easy to update AI knowledge base'
    ]
  },

  additionalTechnicalFields: [
    {
      id: 'ai_model_selection',
      type: 'select',
      label: 'AI Model',
      labelHe: 'מודל AI',
      required: true,
      purpose: 'Determines AI capabilities and cost',
      options: [
        { value: 'gpt-4', label: 'GPT-4 (Most capable)', labelHe: 'GPT-4 (הכי מתקדם)' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 (Fast & economical)', labelHe: 'GPT-3.5 (מהיר וחסכוני)' },
        { value: 'claude-3-opus', label: 'Claude 3 Opus', labelHe: 'Claude 3 Opus' },
        { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', labelHe: 'Claude 3 Sonnet' }
      ]
    },
    {
      id: 'knowledge_base_urls',
      type: 'list',
      label: 'Knowledge Base URLs',
      labelHe: 'כתובות URL למסד ידע',
      required: true,
      purpose: 'AI will crawl these URLs to learn about products/services'
    },
    {
      id: 'escalation_email',
      type: 'text',
      label: 'Escalation Email Address',
      labelHe: 'כתובת אימייל להעברה',
      required: true,
      purpose: 'Where to send conversations that need human intervention'
    },
    {
      id: 'max_conversation_length',
      type: 'number',
      label: 'Max Conversation Turns Before Escalation',
      labelHe: 'מספר מקסימלי של תגובות לפני העברה',
      required: true,
      purpose: 'Prevent endless conversations, escalate after X messages'
    }
  ],

  dependencies: [
    {
      serviceId: 'impl-crm',
      reason: 'AI agent needs CRM to store leads and conversation history'
    }
  ],

  prerequisites: [
    {
      type: 'data',
      description: 'Product/service information and pricing documented'
    },
    {
      type: 'data',
      description: 'FAQ content prepared for AI training'
    },
    {
      type: 'system',
      description: 'OpenAI or Anthropic API key obtained'
    }
  ]
}
```

---

## 📋 Complete List of 59 Services to Map

Process EACH of these services with the framework above:

### Automations (20 services)
1. auto-lead-response
2. auto-sms-whatsapp
3. auto-crm-update
4. auto-team-alerts
5. auto-lead-workflow
6. auto-smart-followup
7. auto-meeting-scheduler
8. auto-form-to-crm
9. auto-email-templates
10. auto-notifications
11. auto-approval-workflow
12. auto-document-generation
13. auto-document-mgmt
14. auto-data-sync
15. auto-system-sync
16. auto-reports
17. auto-multi-system
18. auto-end-to-end
19. auto-sla-tracking
20. auto-custom

### AI Agents (10 services)
21. ai-faq-bot
22. ai-service-agent
23. ai-sales-agent
24. ai-complex-workflow
25. ai-action-agent
26. ai-data-extraction
27. ai-sentiment
28. ai-predictive
29. ai-full-integration
30. ai-custom

### Integrations (10 services)
31. integration-simple
32. integration-complex
33. int-complex
34. whatsapp-api-setup
35. int-crm-marketing
36. int-crm-accounting
37. int-crm-support
38. int-calendar
39. int-ecommerce
40. int-custom

### System Implementation (9 services)
41. impl-crm
42. impl-marketing-automation
43. impl-project-management
44. impl-helpdesk
45. impl-erp
46. impl-ecommerce
47. impl-analytics
48. impl-workflow-platform
49. impl-custom

### Additional Services (10 services)
50. data-cleanup
51. data-migration
52. add-dashboard
53. add-custom-reports
54. reports-automated
55. training-workshops
56. training-ongoing
57. support-ongoing
58. consulting-process
59. consulting-strategy

---

## ✅ Validation Checklist

For your output, ensure:
- [ ] All 59 services mapped
- [ ] Each service has required systems identified
- [ ] Integration flows specified with source/target
- [ ] AI agent requirements clear (or marked as not applicable)
- [ ] Acceptance criteria specific and measurable
- [ ] Additional technical fields justify why developers need them
- [ ] Dependencies between services identified
- [ ] Prerequisites clearly stated
- [ ] Hebrew translations provided for all user-facing text
- [ ] Output is valid TypeScript that compiles

---

## 🎓 Success Criteria for Your Output

Your mapping is successful if:
1. **Comprehensive**: All 59 services covered
2. **Developer-Focused**: Technical fields answer "what do developers need to know?"
3. **Non-Redundant**: Don't ask for info already in requirements templates
4. **Actionable**: Integrations have suggested triggers/steps
5. **Measurable**: Acceptance criteria can be tested
6. **Dependency-Aware**: Service relationships identified
7. **Business-Grounded**: Based on real implementation needs

---

## 💡 Final Notes

**Think like a developer receiving this specification:**
- What questions would you have?
- What could block implementation?
- What technical details are missing?
- What integrations are obvious but unstated?

**Remember:**
- Phase 1 already collected BUSINESS requirements
- Requirements templates collect SERVICE-SPECIFIC details
- This mapping fills in TECHNICAL implementation gaps
- The goal is a complete handoff to developers with zero ambiguity

**Output Format:**
Generate complete TypeScript code for `serviceToSystemMapping.ts` that exports:
```typescript
export const SERVICE_TECHNICAL_REQUIREMENTS: ServiceTechnicalRequirements[] = [
  // ... all 59 services mapped
];

// Helper functions
export const getRequiredSystems = (purchasedServiceIds: string[]) => { /* ... */ };
export const getRequiredIntegrations = (purchasedServiceIds: string[]) => { /* ... */ };
export const getRequiredAIAgents = (purchasedServiceIds: string[]) => { /* ... */ };
export const getAcceptanceCriteria = (purchasedServiceIds: string[]) => { /* ... */ };
```

---

## 🚀 Ready to Generate

You now have:
- Complete context on the application
- Understanding of Phase 1 → Phase 2 flow
- Data structures for Phase 2
- Three detailed examples
- All 59 services to process
- Validation checklist

**Generate the complete mapping file with extended thinking enabled.**
