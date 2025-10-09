# Required Files to Read for Phase 2 Mapping Generation

## 📂 Files You Must Read Before Generating the Mapping

### 1. Service Catalog
**File**: `src/config/servicesDatabase.ts`
- Contains all 59 services
- Service categories, names (EN/HE), descriptions
- Base prices, estimated days, complexity level
- Tags for each service

**What to extract**: Complete list of services with their IDs, categories, and descriptions

---

### 2. Requirements Templates (CRITICAL)
**File**: `src/config/serviceRequirementsTemplates.ts` (4,112 lines)
- Detailed questionnaires for 18 services
- Field types, validation rules, examples
- Hebrew translations

**What to extract**:
- Which services already have requirements templates
- What information is already being collected
- What's MISSING that developers need

**Services with templates**:
1. impl-crm (CRM Implementation) - 8 sections, ~50 fields
2. ai-faq-bot (FAQ Bot) - 6 sections
3. ai-service-agent (Service Agent) - 7 sections
4. ai-sales-agent (Sales Agent) - 7 sections
5. auto-lead-workflow (Lead Workflow) - 9 sections
6. auto-sms-whatsapp (WhatsApp Automation) - 5 sections
7. auto-crm-update (CRM Auto Update) - 4 sections
8. auto-system-sync (System Integration) - 6 sections
9. auto-document-mgmt (Document Management) - 5 sections
10. auto-reports (Automated Reports) - 5 sections
11. auto-email-templates (Email Templates) - 4 sections
12. auto-approval-workflow (Approval Workflow) - 5 sections
13. auto-meeting-scheduler (Meeting Scheduler) - 5 sections
14. impl-marketing-automation (Marketing Automation) - 6 sections
15. impl-project-management (Project Management) - 5 sections
16. data-cleanup (Data Cleanup) - 4 sections
17. support-ongoing (Ongoing Support) - 3 sections
18. training-workshops (Training Workshops) - 4 sections

---

### 3. Phase 2 Type Definitions
**File**: `src/types/phase2.ts` (515 lines)
- Complete TypeScript interfaces for Phase 2
- DetailedSystemSpec structure
- IntegrationFlow structure
- DetailedAIAgentSpec structure
- AcceptanceCriteria structure

**What to extract**:
- Exact field names and types
- Nested structures
- Optional vs required fields

---

### 4. Phase 1 Module Types
**File**: `src/types/index.ts`
- Meeting structure
- All 9 discovery modules
- What data is collected in Phase 1

**Modules to understand**:
- OverviewModule: businessType, employees, budget, mainChallenge
- LeadsAndSalesModule: leadSources, volumes, routing, followUp
- CustomerServiceModule: channels, responseTime, FAQ
- OperationsModule: workProcesses, documentManagement
- ReportingModule: scheduledReports, kpis, dashboards
- AIAgentsModule: useCases by department
- SystemsModule: currentSystems, integrations, apiWebhooks
- ROIModule: successMetrics, timeGoals

**What to extract**: What information is ALREADY available from Phase 1

---

### 5. Proposal Engine Logic
**File**: `src/utils/proposalEngine.ts` (150+ lines shown)
- How services are suggested based on Phase 1 data
- Cross-module intelligence rules
- Service recommendation logic

**What to extract**:
- Why each service is suggested
- What triggers service recommendations
- Relationships between Phase 1 data and services

---

### 6. Requirements Pre-fill Engine
**File**: `src/utils/requirementsPrefillEngine.ts` (897 lines)
- How Phase 1 data pre-fills Phase 2 requirements
- 18 different pre-fill functions (one per service with template)
- Smart mapping logic

**What to extract**:
- What Phase 1 data maps to which Phase 2 fields
- Examples of intelligent pre-filling
- Patterns to replicate for remaining services

---

### 7. Systems Auth Database (if exists)
**File**: `src/config/systemsAuthDatabase.ts`
- System-specific authentication methods
- API endpoints for common systems
- Rate limits and auth requirements

**What to extract**:
- Common authentication patterns
- System-specific technical requirements

---

### 8. Existing Implementation Spec Components
**Files to scan**:
- `src/components/Phase2/SystemDeepDive.tsx` (lines 1-150)
- `src/components/Phase2/IntegrationFlowBuilder.tsx` (scan structure)
- `src/components/Phase2/AIAgentDetailedSpec.tsx` (lines 1-150)

**What to extract**:
- What fields are actually being collected in the UI
- Data structures being used
- Validation patterns

---

## 📊 Reading Order (Recommended)

### Step 1: Understand the Service Catalog
Read: `servicesDatabase.ts`
Goal: Get complete list of 59 services and their basic info

### Step 2: See What's Already Covered
Read: `serviceRequirementsTemplates.ts`
Goal: Understand what information is already being collected for 18 services

### Step 3: Understand Phase 2 Data Structures
Read: `phase2.ts`
Goal: Know exactly what fields exist for systems, integrations, AI agents, acceptance criteria

### Step 4: Understand Phase 1 Data Available
Read: `index.ts` (Meeting and module types)
Goal: Know what information is already collected and available

### Step 5: See Pre-fill Logic Patterns
Read: `requirementsPrefillEngine.ts`
Goal: Understand how to map Phase 1 data to Phase 2 needs

### Step 6: Understand Service Selection Logic
Read: `proposalEngine.ts`
Goal: Understand why services are suggested and their relationships

---

## 🎯 Key Questions to Answer While Reading

### About Each Service:
1. What does this service actually do?
2. Is there a requirements template for it already?
3. What systems does it interact with?
4. What Phase 1 data is relevant?
5. What technical details are missing?

### About Systems:
1. Which systems are commonly needed? (CRM, email, WhatsApp, etc.)
2. What authentication methods do they use?
3. What modules/objects do we typically access?
4. Do they require data migration?

### About Integrations:
1. What are common integration patterns? (form→CRM, CRM→email, etc.)
2. What triggers make sense? (webhook, schedule, new_record)
3. What error handling is needed?
4. What frequency is typical?

### About AI Agents:
1. Which services actually need AI agents?
2. What department focus? (sales, service, operations)
3. What knowledge sources are needed?
4. What integrations does the AI need?

### About Acceptance Criteria:
1. How do we measure success for each service?
2. What are realistic performance targets?
3. What security requirements are standard?
4. What makes good usability?

---

## 📝 Notes for AI Generation

### Don't Duplicate
- If something is already in the requirements template, DON'T add it to additionalTechnicalFields
- Only add technical fields that developers need but aren't in the questionnaire

### Be Specific
- "CRM system" is too vague → specify Zoho/HubSpot/Salesforce
- "Email integration" → specify Gmail/Outlook and what data syncs
- "AI agent" → specify department, knowledge sources, intents

### Think Dependencies
- WhatsApp Automation → needs CRM (for lead data)
- AI Sales Agent → needs CRM (for customer history)
- Advanced Reporting → needs systems with data

### Consider Prerequisites
- WhatsApp → needs approved templates
- AI Agent → needs knowledge base content
- Data Migration → needs source system API access

---

## ✅ Validation Before Generation

Before generating the mapping, confirm:
- [ ] You've read all 59 services from servicesDatabase.ts
- [ ] You understand the 18 existing requirements templates
- [ ] You know the Phase 2 data structures from phase2.ts
- [ ] You know what Phase 1 data is available from index.ts
- [ ] You've seen the pre-fill patterns from requirementsPrefillEngine.ts
- [ ] You understand service relationships from proposalEngine.ts

---

## 🚀 Ready to Generate

Once you've read these files and understand the patterns, you're ready to generate the complete `serviceToSystemMapping.ts` file with all 59 services mapped according to the framework in `PHASE2_MAPPING_PROMPT.md`.
