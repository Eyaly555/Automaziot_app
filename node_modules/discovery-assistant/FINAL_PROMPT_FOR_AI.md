# 🎯 Generate Service-to-Technical Requirements Mapping

## Mission
Generate a comprehensive TypeScript mapping file (`serviceToSystemMapping.ts`) that connects **each of the 73 services** in the Discovery Assistant application to their exact technical requirements for Phase 2 (Implementation Specification).

---

## 📖 Background Reading Required

### MUST READ (in this order):

1. **[PHASE2_MAPPING_PROMPT.md](./PHASE2_MAPPING_PROMPT.md)**
   - Complete instructions and framework
   - 3 detailed examples
   - Output format specification
   - Read this FIRST to understand the full scope

2. **[PHASE2_REQUIRED_FILES.md](./PHASE2_REQUIRED_FILES.md)**
   - List of all files you need to read from the codebase
   - Reading order and what to extract from each file
   - Validation checklist

3. **Codebase Files** - Read these from the repository:
   - `src/config/servicesDatabase.ts` - All 73 services
   - `src/config/serviceRequirementsTemplates.ts` - Existing requirements (4,112 lines)
   - `src/types/phase2.ts` - Phase 2 data structures
   - `src/types/index.ts` - Phase 1 modules and Meeting structure
   - `src/utils/requirementsPrefillEngine.ts` - Pre-fill logic patterns
   - `src/utils/proposalEngine.ts` - Service recommendation logic

---

## 🎯 Your Task

For **ALL 73 services**, create a mapping that defines:

### 1. Required Systems
Which systems need detailed specification (authentication, modules, data migration)?
- Example: "WhatsApp Automation" needs WhatsApp Business API + CRM

### 2. Required Integrations
Which system-to-system flows need to be built?
- Example: "Auto Lead Response" needs Website Form → CRM → Email flow

### 3. Required AI Agents (if applicable)
Which AI agents need detailed specification?
- Example: "AI Sales Agent" needs sales department AI agent spec

### 4. Acceptance Criteria
How do we measure successful implementation?
- Functional requirements (features that must work)
- Performance benchmarks (speed, reliability)
- Security requirements (encryption, authentication)
- Usability goals (user experience)

### 5. Additional Technical Fields
What technical details do developers need beyond the requirements questionnaire?
- API keys, tokens, webhook URLs
- Configuration values
- Technical constraints

### 6. Dependencies & Prerequisites
What must exist before this service can be implemented?
- Other services needed first
- Required system access
- Required data/content

---

## 📋 Complete Service List (73 Services)

### Automations (20)
auto-lead-response, auto-sms-whatsapp, auto-crm-update, auto-team-alerts, auto-lead-workflow, auto-smart-followup, auto-meeting-scheduler, auto-form-to-crm, auto-email-templates, auto-notifications, auto-approval-workflow, auto-document-generation, auto-document-mgmt, auto-data-sync, auto-system-sync, auto-reports, auto-multi-system, auto-end-to-end, auto-sla-tracking, auto-custom

### AI Agents (10)
ai-faq-bot, ai-service-agent, ai-sales-agent, ai-complex-workflow, ai-action-agent, ai-data-extraction, ai-sentiment, ai-predictive, ai-full-integration, ai-custom

### Integrations (10)
integration-simple, integration-complex, int-complex, whatsapp-api-setup, int-crm-marketing, int-crm-accounting, int-crm-support, int-calendar, int-ecommerce, int-custom

### System Implementation (9)
impl-crm, impl-marketing-automation, impl-project-management, impl-helpdesk, impl-erp, impl-ecommerce, impl-analytics, impl-workflow-platform, impl-custom

### Additional Services (10)
data-cleanup, data-migration, add-dashboard, add-custom-reports, reports-automated, training-workshops, training-ongoing, support-ongoing, consulting-process, consulting-strategy

---

## 💡 Key Guidelines

### Think Like a Developer
For each service, ask:
- "What systems do I need API access to?"
- "What data flows between systems?"
- "What could block implementation?"
- "What technical details are missing?"

### Avoid Duplication
- If information is already in `serviceRequirementsTemplates.ts`, don't duplicate it
- Only add technical fields that developers need but aren't in the questionnaire

### Be Specific
- Not "CRM system" → Specify "Zoho CRM" or "choice between Zoho/HubSpot/Salesforce"
- Not "Email integration" → Specify "Gmail/Outlook bidirectional sync with CRM"
- Not "AI agent" → Specify "Sales department agent with CRM integration"

### Consider Real Implementation
- What authentication is needed?
- What rate limits exist?
- What data migrations are required?
- What error handling is needed?
- What testing is required?

---

## 📤 Expected Output

Generate complete TypeScript code for `src/config/serviceToSystemMapping.ts`:

```typescript
import { /* types from phase2.ts */ } from '../types/phase2';

export interface ServiceTechnicalRequirements {
  serviceId: string;
  serviceName: string;
  serviceNameHe: string;
  requiredSystems: SystemRequirement[];
  requiredIntegrations: IntegrationRequirement[];
  requiredAIAgents: AIAgentRequirement[];
  acceptanceCriteria: {
    functional: string[];
    performance: string[];
    security: string[];
    usability?: string[];
  };
  additionalTechnicalFields?: TechnicalField[];
  dependencies?: { serviceId: string; reason: string }[];
  prerequisites?: { type: 'system' | 'integration' | 'data'; description: string }[];
}

// ... interface definitions (see PHASE2_MAPPING_PROMPT.md for complete types)

export const SERVICE_TECHNICAL_REQUIREMENTS: ServiceTechnicalRequirements[] = [
  // Map all 73 services here
  {
    serviceId: 'auto-lead-response',
    // ... complete mapping
  },
  {
    serviceId: 'auto-sms-whatsapp',
    // ... complete mapping
  },
  // ... 57 more services
];

// Helper functions
export const getRequiredSystems = (purchasedServiceIds: string[]): SystemRequirement[] => {
  return purchasedServiceIds
    .flatMap(serviceId => {
      const service = SERVICE_TECHNICAL_REQUIREMENTS.find(s => s.serviceId === serviceId);
      return service?.requiredSystems || [];
    })
    .filter((system, index, self) =>
      index === self.findIndex(s => s.systemType === system.systemType)
    ); // Deduplicate
};

export const getRequiredIntegrations = (purchasedServiceIds: string[]): IntegrationRequirement[] => {
  return purchasedServiceIds.flatMap(serviceId => {
    const service = SERVICE_TECHNICAL_REQUIREMENTS.find(s => s.serviceId === serviceId);
    return service?.requiredIntegrations || [];
  });
};

export const getRequiredAIAgents = (purchasedServiceIds: string[]): AIAgentRequirement[] => {
  return purchasedServiceIds.flatMap(serviceId => {
    const service = SERVICE_TECHNICAL_REQUIREMENTS.find(s => s.serviceId === serviceId);
    return service?.requiredAIAgents || [];
  });
};

export const getAcceptanceCriteria = (purchasedServiceIds: string[]): AcceptanceCriteria => {
  const allCriteria = purchasedServiceIds.map(serviceId => {
    const service = SERVICE_TECHNICAL_REQUIREMENTS.find(s => s.serviceId === serviceId);
    return service?.acceptanceCriteria;
  }).filter(Boolean);

  return {
    functional: allCriteria.flatMap(c => c.functional),
    performance: allCriteria.flatMap(c => c.performance),
    security: allCriteria.flatMap(c => c.security),
    usability: allCriteria.flatMap(c => c.usability || [])
  };
};

export const getServiceById = (serviceId: string): ServiceTechnicalRequirements | undefined => {
  return SERVICE_TECHNICAL_REQUIREMENTS.find(s => s.serviceId === serviceId);
};
```

---

## ✅ Validation Checklist

Your output must have:
- [ ] All 73 services mapped
- [ ] Each service has required systems identified (or explicitly marked as none)
- [ ] Integration flows specified with source/target/direction/priority
- [ ] AI agent requirements clear (or marked N/A)
- [ ] Acceptance criteria specific and measurable (not generic)
- [ ] Additional technical fields justify why developers need them
- [ ] Dependencies between services identified
- [ ] Prerequisites clearly stated
- [ ] Hebrew translations for all user-facing text
- [ ] Valid TypeScript that compiles without errors
- [ ] Helper functions implemented correctly
- [ ] No duplication of information already in requirements templates

---

## 🚀 Instructions

1. **Read** PHASE2_MAPPING_PROMPT.md completely
2. **Read** PHASE2_REQUIRED_FILES.md for reading order
3. **Read** all required files from the codebase
4. **Analyze** each service using the framework
5. **Generate** the complete TypeScript mapping file
6. **Validate** using the checklist above

**Use extended thinking** for this complex task. Consider:
- Business logic and real-world implementation needs
- Technical dependencies and prerequisites
- Common patterns across similar services
- Developer perspective: "What would I need to implement this?"

---

## 📞 Context for AI

This mapping file will power Phase 2 of the Discovery Assistant application. When a client purchases specific services (e.g., "CRM Implementation" + "WhatsApp Automation" + "AI Sales Agent"), Phase 2 needs to automatically:

1. **Guide system selection**: "You need to detail: Zoho CRM, WhatsApp Business API"
2. **Suggest integrations**: "Build these flows: Website→CRM, CRM↔WhatsApp, AI Agent→CRM"
3. **Identify AI needs**: "Create detailed spec for: Sales AI Agent (not Service or Operations)"
4. **Set success criteria**: "Test that: WhatsApp sends in <5min, AI handles 70% of chats, CRM has all data"

Currently, Phase 2 requires too much manual work. This mapping makes it intelligent and automated.

---

**GENERATE THE COMPLETE MAPPING FILE NOW.**
