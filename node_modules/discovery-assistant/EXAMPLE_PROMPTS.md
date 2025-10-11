# Example Implementation Prompts

Ready-to-use prompts for implementing specific services. Just copy and paste into a new Claude Code chat!

---

## Example 1: Service #1 - Auto Lead Response (Simple Automation)

```markdown
# IMPLEMENTATION REQUEST

### Service to Implement

**Service ID**: `auto-lead-response`
**Service Name**: תגובה אוטומטית ללידים (Automatic Lead Response)
**Category**: Automations
**Service Number**: 1
**Research File**: `discovery-assistant/AUTOMATIONS_TECHNICAL_REQUIREMENTS.md`

---

### Context: Discovery Assistant Codebase

I'm working on the Discovery Assistant application at:
`C:\Users\eyaly\Desktop\Businesses\eym-group_n8n\internal_app\discovery-assistant`

Tech Stack: React 19.1.1 + TypeScript 5.8.3 + Zustand + Supabase + Zoho CRM
Production: https://automaziot-app.vercel.app/

Please read `CLAUDE.md` for complete project documentation.

---

### Your Task

Implement **Service #1: auto-lead-response** based on the technical requirements research.

**STEP 1**: Read `discovery-assistant/AUTOMATIONS_TECHNICAL_REQUIREMENTS.md` and find service #1.

**STEP 2**: Implement requirements gathering for Phase 2 (Implementation Specification).

---

### What to Build

Based on the research for service #1, I need:

**1. Type Definition** (`src/types/serviceRequirements.ts`):
```typescript
interface AutoLeadResponseConfig {
  formPlatform: 'wix' | 'wordpress' | 'elementor' | 'google-forms' | 'custom';
  webhookUrl?: string;
  formApiKey?: string;

  emailService: 'sendgrid' | 'mailgun' | 'smtp';
  emailApiKey?: string;
  smtpConfig?: {
    host: string;
    port: number;
    username: string;
    password: string;
  };

  crmSystem: 'zoho' | 'salesforce' | 'hubspot';
  crmApiKey?: string;
  crmOAuthToken?: string;

  n8nEndpoint: string;
  emailTemplate: string;
  responseTimeTarget: number; // minutes

  domainVerification: {
    spfRecord: boolean;
    dkimRecord: boolean;
  };
}
```

**2. Requirements Form Component** (`src/components/Phase2/ServiceRequirements/AutoLeadResponseRequirements.tsx`):
- Form fields for all configuration options
- Validation for required fields
- Helper text explaining each field
- Bilingual support (Hebrew labels)

**3. Integration**:
- Add to Phase 2 requirements workflow
- Save configuration to meeting store
- Validate before allowing progression

---

### Key Technical Requirements (from research)

**Required Systems Access**:
- Form platform (Wix/WordPress/Elementor/Google Forms)
- Email service (SendGrid/Mailgun/SMTP)
- CRM (Zoho/Salesforce/HubSpot)
- n8n workflow platform

**Important Notes**:
- Response time is critical (2-5 minutes max)
- Domain verification required (SPF/DKIM) to avoid spam
- Rate limits: SendGrid free = 100 emails/day, Mailgun free = 5,000 emails/month
- Many forms don't support webhooks (Wix needs Velo, WordPress needs plugin)

**Prerequisites**:
- Active form on website with webhook capability
- Email template ready (HTML)
- Email service account verified with domain
- CRM module setup with custom fields
- Fallback mechanism if email service fails

---

### Deliverables

1. ✅ TypeScript interface for service configuration
2. ✅ React form component for Phase 2
3. ✅ Validation logic
4. ✅ Integration with ImplementationSpecDashboard
5. ✅ Documentation (setup guide)

Start by reading the research file, then implement step by step.
```

---

## Example 2: Service #21 - AI FAQ Bot (AI Service)

```markdown
# IMPLEMENTATION REQUEST

### Service to Implement

**Service ID**: `ai-faq-bot`
**Service Name**: צ'אטבוט למענה על שאלות נפוצות (FAQ Chatbot)
**Category**: AI Agents
**Service Number**: 21
**Research File**: `discovery-assistant/AI_AGENTS_TECHNICAL_REQUIREMENTS.md`

---

### Context: Discovery Assistant Codebase

Project: `C:\Users\eyaly\Desktop\Businesses\eym-group_n8n\internal_app\discovery-assistant`
Read `CLAUDE.md` for full documentation.

---

### Your Task

Implement Service #21: ai-faq-bot based on comprehensive research.

**STEP 1**: Read `discovery-assistant/AI_AGENTS_TECHNICAL_REQUIREMENTS.md` section for service #21.

**STEP 2**: Create requirements gathering form for Phase 2.

---

### What to Build

**Type Definition**:
```typescript
interface AIFaqBotConfig {
  aiProvider: 'openai' | 'anthropic';
  model: 'gpt-4o-mini' | 'gpt-3.5-turbo' | 'claude-3.5-sonnet';
  apiKey: string;

  vectorDatabase: 'supabase-pgvector' | 'pinecone';
  vectorDbConfig: {
    apiKey?: string;
    endpoint?: string;
  };

  embeddingModel: 'text-embedding-3-small' | 'text-embedding-ada-002';

  knowledgeBase: {
    faqCount: number;
    sources: string[]; // PDFs, docs, website URLs
    maxDocuments: number; // limit 100-200
  };

  ragConfig: {
    topK: number; // 3-5 recommended
    hybridSearch: boolean; // FAQ-links + RAG fallback
  };

  contextWindow: number; // 128K tokens for GPT-4o

  handoffRules: {
    failedAttempts: number; // 2-3 before human handoff
    specificKeywords: string[]; // keywords triggering handoff
  };

  gdprCompliance: {
    retentionDays: number; // 30 days recommended
    encryptAtRest: boolean;
    allowUserDeletion: boolean;
  };

  estimatedVolume: number; // conversations per day
  budgetPerMonth: number; // based on volume
}
```

---

### Key Technical Requirements (from research)

**AI Provider Pricing (2025)**:
- OpenAI GPT-4o Mini: $0.15 input / $0.60 output per 1M tokens (20x cheaper than GPT-4)
- Claude 3.5 Sonnet: $3/$15 per 1M tokens (with 90% prompt caching savings)
- Embeddings: $0.02 per 1M tokens

**Vector Database**:
- Supabase pgvector: Free up to 500MB
- Pinecone: Free tier (1M reads, 2M writes/month)

**Important Notes**:
- GPT-4o Mini sufficient for FAQ (cheaper and fast)
- Prompt caching saves 75-90% on repeated data
- MUST use hybrid approach: FAQ-links (vetted answers) + RAG fallback
- GDPR: 30-day retention max, encryption, user deletion rights
- Rate limits: GPT-4o Mini = 30K RPM Tier 1 (enough for 500 concurrent users)
- Don't scale beyond 100 FAQs - use delegation or categorization instead

**Success Metrics**:
- Resolution rate >70%
- Fallback rate <20%
- User satisfaction (CSAT)

---

### Deliverables

1. ✅ TypeScript interface
2. ✅ Requirements form (React component)
3. ✅ Validation (100-200 FAQs max, API key format, etc.)
4. ✅ Cost calculator based on estimated volume
5. ✅ Setup guide with API key instructions

Read the research first, then implement!
```

---

## Example 3: Service #34 - WhatsApp Business API (Integration)

```markdown
# IMPLEMENTATION REQUEST

### Service to Implement

**Service ID**: `whatsapp-api-setup`
**Service Name**: הקמת WhatsApp Business API
**Category**: Integrations
**Service Number**: 34
**Research File**: `discovery-assistant/INTEGRATIONS_TECHNICAL_REQUIREMENTS.md`

---

### Context

Project: `discovery-assistant/`
Documentation: `CLAUDE.md`

---

### Task

Implement Service #34: whatsapp-api-setup requirements gathering.

**STEP 1**: Read `discovery-assistant/INTEGRATIONS_TECHNICAL_REQUIREMENTS.md` service #34.

**STEP 2**: Build comprehensive requirements form.

---

### Type Definition

```typescript
interface WhatsAppBusinessAPIConfig {
  apiType: 'cloud-api' | 'on-premise-api';

  metaBusiness: {
    businessManagerId: string;
    businessVerified: boolean;
    facebookAppId: string;
    appSecret: string;
  };

  whatsappAccount: {
    wabaId: string; // WhatsApp Business Account ID
    phoneNumberId: string;
    phoneNumber: string; // in international format
    displayName: string;
  };

  authentication: {
    accessToken: string; // System User Token (permanent)
    tokenType: 'temporary-24h' | 'permanent-system-user';
  };

  webhooks: {
    callbackUrl: string; // HTTPS required
    verifyToken: string;
    sslCertificate: boolean;
  };

  messageTemplates: Array<{
    name: string;
    category: 'marketing' | 'utility' | 'authentication';
    language: string;
    status: 'pending' | 'approved' | 'rejected';
    approvalTime: string; // 24-48 hours
  }>;

  rateLimits: {
    tier: 1 | 2 | 3 | 'unlimited';
    messagesPerDay: number; // Tier 1: 1K, Tier 2: 10K, Tier 3: 100K
    messagesPerSecond: number; // Cloud API: 80/second
  };

  businessVerification: {
    verified: boolean;
    verificationTime: string; // 3-7 days typical
    businessWebsite: string;
    privacyPolicyUrl: string;
  };

  integrations: {
    crmSystem: 'zoho' | 'salesforce' | 'hubspot' | 'none';
    n8nWorkflow: boolean;
  };

  compliance: {
    messageWindow24h: boolean; // understood
    templateApprovalProcess: boolean; // understood
    qualityRating: 'high' | 'medium' | 'low'; // maintain high
  };
}
```

---

### Key Requirements (from research)

**Critical Notes**:
- 24-hour window rule: Free responses only within 24h of customer's last message
- Message templates required for all proactive messages (outside 24h window)
- Template approval: 24-48 hours (verified businesses = instant)
- Business verification: 3-7 days process
- Phone number must be dedicated (can't use personal WhatsApp number)
- Rate limits tier system: start at Tier 1 (1K/day), scale to unlimited
- Pricing (from July 2025): pay-per-message, varies by country (~$0.05-0.10 in Israel)

**Prerequisites**:
- Meta Business Manager verified account
- Dedicated phone number with active subscription
- Business website with company name in footer
- Privacy policy URL
- HTTPS webhook endpoint (SSL certificate)
- 5-10 message templates ready for approval

**Template Categories**:
- Marketing: promotional content
- Utility: account updates, order status
- Authentication: OTP, verification codes

**Common Errors**:
- (131026) Message undeliverable
- (131047) Re-engagement message

---

### Deliverables

1. ✅ Complete TypeScript interface
2. ✅ Multi-step requirements form (business info → phone setup → templates → webhooks)
3. ✅ Validation (international phone format, HTTPS URL, etc.)
4. ✅ Template builder UI for creating message templates
5. ✅ Setup guide with Meta Business verification steps
6. ✅ Troubleshooting guide for common errors

This is a complex service - read the research thoroughly!
```

---

## Example 4: Service #45 - ERP Implementation (System Implementation)

```markdown
# IMPLEMENTATION REQUEST

### Service to Implement

**Service ID**: `impl-erp`
**Service Name**: הטמעת ERP
**Category**: System Implementations
**Service Number**: 45
**Research File**: `discovery-assistant/SYSTEM_IMPLEMENTATION_REQUIREMENTS.md`

---

### Context

Project: `discovery-assistant/`
Full docs: `CLAUDE.md`

---

### Task

Implement Service #45: impl-erp requirements specification.

**STEP 1**: Read `discovery-assistant/SYSTEM_IMPLEMENTATION_REQUIREMENTS.md` service #45.

**STEP 2**: Create comprehensive implementation requirements form.

---

### Type Definition

```typescript
interface ERPImplementationConfig {
  erpSystem: 'sap-s4hana' | 'oracle-netsuite' | 'microsoft-dynamics' | 'other';

  sapConfig?: {
    rfcUser: string;
    communicationRole: 'SAP_DMIS_MC_DT_REMOTE';
    dmisAddonInstalled: boolean;
    administratorAccess: boolean;
  };

  netsuiteConfig?: {
    administratorRole: boolean;
    sandboxCount: number;
    restWebServicesEnabled: boolean;
    suiteScriptDeployment: boolean;
  };

  dynamicsConfig?: {
    systemAdministrator: boolean;
    azureAdPermissions: boolean;
    apiAccess: 'web-api' | 'organization-service' | 'both';
  };

  licensing: {
    type: 'perpetual' | 'subscription';
    modules: string[];
    userCount: number;
    creditMigration?: number; // SAP: 70-80% in 2024-2025
  };

  infrastructure: {
    hosting: 'cloud' | 'on-premise' | 'hybrid';
    databaseAccess: boolean;
    networkAccess: boolean;
  };

  dataMigration: {
    legacySystems: string[];
    dataVolume: string; // GB/TB
    cleanupRequired: boolean;
    historicalDataYears: number; // 6-12 months minimum
  };

  businessProcesses: {
    chartOfAccountsReady: boolean;
    organizationalStructure: string; // companies, departments, cost centers
    masterDataLists: string[]; // vendors, customers, items, warehouses
    workflowApprovals: string[];
  };

  implementation: {
    approach: 'big-bang' | 'phased-rollout';
    estimatedDuration: string; // 6-18 months
    teamComposition: {
      itManager: boolean;
      projectManager: boolean;
      businessAnalysts: number;
      functionalLeads: number;
    };
  };

  environments: {
    sandbox: boolean;
    test: boolean;
    uat: boolean;
    production: boolean;
  };

  integrations: {
    crm: boolean;
    ecommerce: boolean;
    banking: boolean;
    hrPayroll: boolean;
  };
}
```

---

### Key Requirements (from research)

**2025 Critical Updates**:
- **SAP Licensing**: Credit migration dropped to 70-80% (from 100%), may go to 50-60%
- **SAP S/4HANA**: 7018538 removed, now need 7018652
- **NetSuite**: Sandbox includes setup, data, customizations (admin-only access)
- **DMIS Add-on**: Required for SAP data migration

**Complexity Level**: HIGHEST (most complex service)
- Duration: 6-18 months (SMB: 6-9, Enterprise: 12-18+)
- Budget: Add 20-30% buffer over planned budget

**Prerequisites**:
- Complete data cleanup before migration
- Chart of accounts approved by finance
- Business process mapping completed
- Organizational structure defined
- Master data lists prepared
- User roles and permissions planned
- IT infrastructure ready
- Backup and rollback strategy documented

**Change Management**:
- Executive sponsorship required
- Comprehensive training for all users
- Post go-live support (24/7 for 2 weeks)

**Go-Live Strategy**:
- Big Bang: Fast but risky (24-48h downtime)
- Phased: Safer but complex (4-8 weeks)

---

### Deliverables

1. ✅ Comprehensive TypeScript interface
2. ✅ Multi-phase requirements form (system selection → licensing → data → processes → implementation plan)
3. ✅ Prerequisites checklist component
4. ✅ Timeline estimator based on organization size
5. ✅ Budget calculator with 30% buffer
6. ✅ Implementation roadmap template
7. ✅ Risk assessment checklist
8. ✅ Go-live preparation guide

This is the most complex implementation - study the research carefully!
```

---

## Quick Copy Template (Fill in the blanks)

```markdown
# IMPLEMENTATION REQUEST

**Service ID**: `[ID]`
**Service Name**: [Hebrew Name] ([English Name])
**Category**: [Category]
**Service Number**: [1-59]
**Research File**: `discovery-assistant/[FILE].md`

---

Context: Discovery Assistant at `discovery-assistant/`
Read: `CLAUDE.md` for project docs

Task: Implement Service #[NUMBER] based on technical research.

STEP 1: Read `discovery-assistant/[FILE].md` service #[NUMBER]
STEP 2: Build requirements form for Phase 2

[Copy key requirements from research here]

Deliverables:
1. TypeScript interface
2. React form component
3. Validation logic
4. Integration with Phase 2
5. Documentation

Start by reading research!
```

---

## Pro Tips for Using These Prompts

1. **Always include the service number and research file** - Claude needs to know where to look
2. **Paste the key requirements** from the research into the prompt - saves Claude time
3. **Be specific about deliverables** - Forms? API clients? Both?
4. **Start simple** - Begin with just the requirements form, add complexity later
5. **Test incrementally** - Don't build everything before testing

---

**Created**: October 8, 2025
**Purpose**: Accelerate implementation of all 59 services
**Usage**: Copy → Customize → Paste → Implement
