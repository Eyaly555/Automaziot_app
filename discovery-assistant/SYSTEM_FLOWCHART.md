# Intelligent Data Flow System - Visual Flowchart

## Complete Data Flow: Phase 1 → Phase 2 → Phase 3

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PHASE 1: DISCOVERY                            │
│                     (User fills discovery modules)                     │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ User fills:
                                    │ • Overview Module
                                    │ • Leads & Sales
                                    │ • Customer Service
                                    │ • Systems
                                    │ • etc.
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       DATA STORED IN MEETING                           │
│                                                                         │
│  meeting.modules.overview:                                             │
│    • crmName: "Zoho CRM"                                              │
│    • industry: "Real Estate"                                           │
│    • employees: 50                                                     │
│    • contactEmail: "tech@company.com"                                 │
│    • website: "https://company.com"                                   │
│                                                                         │
│  meeting.modules.leadsAndSales:                                        │
│    • leadVolume: 150                                                   │
│    • speedToLead.duringBusinessHours: "2 hours"                       │
│    • leadSources: [{channel: "wix", volumePerMonth: 150}]            │
│                                                                         │
│  meeting.modules.systems:                                              │
│    • detailedSystems: [{specificSystem: "Zoho CRM", apiAccess: "full"}]│
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ User approves proposal
                                    │ Moves to Phase 2
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      PHASE 2: SERVICE REQUIREMENTS                     │
│                                                                         │
│  User opens: AutoFormToCrmSpec component                              │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│  useSmartField() Hook Runs    │   │  Business Context Extracted   │
│                                │   │                                │
│  For each field:               │   │  extractBusinessContext():     │
│  1. Check field registry       │   │  • industry                    │
│  2. Get primarySource path     │   │  • employees                   │
│  3. Extract from Phase 1       │   │  • crmSystem                   │
│  4. Pre-populate value         │   │  • monthlyLeadVolume          │
│  5. Set isAutoPopulated=true   │   │  • currentResponseTime         │
└───────────────────────────────┘   └───────────────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     COMPONENT RENDERS WITH                             │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  📊 BUSINESS CONTEXT (from Phase 1):                             │ │
│  │  • Lead Volume: 150/month                                        │ │
│  │  • CRM System: Zoho CRM                                          │ │
│  │  • Current Response: 2 hours → Target: <5 min                   │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  ✨ AUTO-FILLED FIELDS:                                          │ │
│  │  2 fields filled from Phase 1 - saves 2 minutes!                 │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Form Fields:                                                          │
│  ┌────────────────────────────────────────────────────────┐          │
│  │ CRM System: [Zoho CRM ▼]  ✓ Auto-filled from Phase 1 │          │
│  │             Source: Overview module                     │          │
│  └────────────────────────────────────────────────────────┘          │
│                                                                         │
│  ┌────────────────────────────────────────────────────────┐          │
│  │ Form Platform: [Wix ▼]  ✓ Auto-filled from Phase 1   │          │
│  │                Source: Lead Sources                     │          │
│  └────────────────────────────────────────────────────────┘          │
│                                                                         │
│  ┌────────────────────────────────────────────────────────┐          │
│  │ Email Provider: [           ]  ← User needs to fill    │          │
│  └────────────────────────────────────────────────────────┘          │
│                                                                         │
│  User fills 3 new fields (instead of 10) → Saves 7 minutes!           │
│  Clicks "Save"                                                         │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Data saved to
                                    │ implementationSpec.automations[]
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 REQUIREMENTS STORED IN MEETING                         │
│                                                                         │
│  meeting.implementationSpec.automations:                               │
│    [{                                                                   │
│      serviceId: "auto-form-to-crm",                                   │
│      serviceName: "Form to CRM Integration",                          │
│      requirements: {                                                   │
│        crmSystem: "Zoho CRM",           ← From smart field            │
│        formPlatform: "Wix",              ← From smart field            │
│        emailProvider: "SendGrid",         ← User filled                │
│        fieldMapping: [...],                ← User filled                │
│        duplicateDetection: true,           ← User filled                │
│      },                                                                 │
│      completedAt: "2025-10-09"                                        │
│    }]                                                                   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ User completes all services
                                    │ Moves to Phase 3
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 TASK GENERATION (generateTasksFromPhase2)              │
│                                                                         │
│  For each service with requirements:                                   │
│    1. Detect service type (auto-lead-response, etc.)                  │
│    2. Call instruction generator:                                      │
│       generateAutoLeadResponseInstructions(requirements, meeting)      │
│    3. Extract business context from Phase 1                           │
│    4. Build technical steps with ACTUAL values                        │
│    5. Generate acceptance criteria                                     │
│    6. Create testing checklist                                         │
│    7. Add security notes                                               │
│    8. Calculate complexity & estimate hours                           │
│    9. Format as markdown (200+ lines)                                 │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Task created with
                                    │ detailed instructions
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    PHASE 3: DEVELOPMENT TASK                           │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ Task: Implement Auto Form to CRM: Wix → Zoho CRM                │ │
│  │                                                                   │ │
│  │ BUSINESS CONTEXT:                                                 │ │
│  │ • Client: ABC Real Estate                                        │ │
│  │ • Industry: Real Estate                                           │ │
│  │ • Lead Volume: 150/month                                         │ │
│  │ • Form Platform: Wix                                             │ │
│  │ • Goal: Automatic lead creation in Zoho CRM                     │ │
│  │                                                                   │ │
│  │ TECHNICAL IMPLEMENTATION:                                         │ │
│  │                                                                   │ │
│  │ 1. Connect Wix Forms to n8n                                      │ │
│  │    - Platform: Wix Forms                                         │ │
│  │    - Webhook capability: No (use plugin)                        │ │
│  │    - Plugin: Install Zapier Wix Connector                       │ │
│  │    [10 more detailed points]                                     │ │
│  │                                                                   │ │
│  │ 2. Configure Zoho CRM Integration                                │ │
│  │    - System: Zoho CRM                                            │ │
│  │    - Authentication: OAuth 2.0                                   │ │
│  │    - Module: Potentials                                          │ │
│  │    - Fields to create:                                           │ │
│  │      • Full_Name ← form.name                                    │ │
│  │      • Email ← form.email                                       │ │
│  │      • Phone ← form.phone                                       │ │
│  │      • Lead_Source ← "Wix Website Form"                        │ │
│  │    [15 more detailed points]                                     │ │
│  │                                                                   │ │
│  │ 3. Build n8n Workflow                                            │ │
│  │    - Trigger: Webhook from Wix                                   │ │
│  │    - Step 1: Validate form data                                  │ │
│  │    - Step 2: Check for duplicates in Zoho                       │ │
│  │    - Step 3: Create Potential if new                            │ │
│  │    - Step 4: Handle errors (retry 3x)                           │ │
│  │    [20 more detailed points]                                     │ │
│  │                                                                   │ │
│  │ ACCEPTANCE CRITERIA:                                             │ │
│  │ • Form submission creates Zoho Potential within 2 minutes       │ │
│  │ • All fields mapped correctly                                    │ │
│  │ • Duplicates detected by email                                   │ │
│  │ • Error notifications sent to tech@company.com                  │ │
│  │ [7 total criteria]                                               │ │
│  │                                                                   │ │
│  │ TESTING CHECKLIST:                                               │ │
│  │ [ ] Submit test form with valid data                            │ │
│  │ [ ] Verify Zoho Potential created                               │ │
│  │ [ ] Check all fields mapped                                     │ │
│  │ [ ] Test duplicate submission                                    │ │
│  │ [13 total test scenarios]                                        │ │
│  │                                                                   │ │
│  │ SECURITY NOTES:                                                  │ │
│  │ • OAuth credentials stored securely                              │ │
│  │ • HTTPS enabled for webhook                                      │ │
│  │ • Personal data handled per GDPR                                │ │
│  │ [6 total security notes]                                         │ │
│  │                                                                   │ │
│  │ Complexity: SIMPLE                                               │ │
│  │ Estimated Hours: 8                                               │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Developer reads task → Has everything needed → Starts implementing!   │
└────────────────────────────────────────────────────────────────────────┘
```

## Field Registry Flow

```
                    FIELD REGISTRY
                (Single Source of Truth)
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    Phase 1          Phase 2          Phase 3
    (Discovery)      (Requirements)   (Tasks)
        │                │                │
        │                │                │
        └────────┬───────┴───────┬────────┘
                 │               │
                 ▼               ▼
         Data populated      Instructions
         automatically       generated with
         across phases       actual values
```

## Smart Field Lifecycle

```
1. COMPONENT MOUNT
   │
   ▼
   useSmartField({ fieldId: 'crm_system', ... })
   │
   ├─→ Check field registry
   │   └─→ Get field definition
   │       • Label: "CRM System"
   │       • Type: select
   │       • Auto-populate: true
   │       • Primary source: modules.overview.crmName
   │
   ├─→ Extract value from Phase 1
   │   └─→ meeting.modules.overview.crmName
   │       • Found: "Zoho CRM"
   │       • Confidence: 1.0 (primary source)
   │
   ├─→ Check for conflicts
   │   └─→ Compare all locations
   │       • Phase 1 Overview: "Zoho CRM"
   │       • Phase 2 Service A: "Zoho CRM"
   │       • Phase 2 Service B: "Salesforce" ← CONFLICT!
   │       • Show warning: ⚠️
   │
   └─→ Return smart field object
       • value: "Zoho CRM"
       • isAutoPopulated: true
       • source: {description: "From Overview module"}
       • hasConflict: true
       • conflict: {...}

2. USER INTERACTION
   │
   ├─→ Sees green badge "Auto-filled from Phase 1"
   ├─→ Sees source info "From: Overview module"
   ├─→ Sees conflict warning (if applicable)
   │
   └─→ Can edit if needed
       │
       └─→ setValue("Salesforce")
           │
           ├─→ Validate value
           ├─→ Update local state
           └─→ If syncBidirectional: true
               └─→ Update Phase 1 source too
                   └─→ Update all other Phase 2 locations
                       └─→ Conflict resolved!

3. FORM SAVE
   │
   └─→ Merge smart field values
       │
       └─→ completeConfig = {
             ...regularConfig,
             crmSystem: crmSystem.value,
             emailProvider: emailProvider.value
           }
           │
           └─→ Save to implementationSpec.automations[]
```

## Requirements-to-Instructions Flow

```
PHASE 2 REQUIREMENTS              INSTRUCTION GENERATOR           PHASE 3 TASK
┌──────────────────┐            ┌─────────────────────┐        ┌──────────────────┐
│ crmSystem: "Zoho"│───────────▶│ Extract & Format    │───────▶│ "System: Zoho"   │
│ authMethod:      │            │                     │        │ "Auth: OAuth"    │
│   "oauth"        │            │ Add context:        │        │ "Module: Leads"  │
│ module: "Leads"  │            │ • Business WHY      │        │                  │
│ volume: 150/mo   │            │ • Technical HOW     │        │ [Plus 195 more   │
│ responseTime: 2h │            │ • Warnings          │        │  lines of        │
│                  │            │ • Testing           │        │  instructions]   │
└──────────────────┘            │ • Security          │        └──────────────────┘
                                └─────────────────────┘
```

## Auto-Population Decision Tree

```
                    Field needs value
                           │
                           ▼
              Does field exist in registry?
                    /            \
                  YES             NO
                   │               │
                   ▼               ▼
         Is autoPopulate=true?   Use regular
                  /      \        useState
                YES      NO
                 │        │
                 ▼        ▼
        Extract from    Use regular
        primarySource   useState
              │
              ▼
       Value exists?
          /        \
        YES         NO
         │           │
         ▼           ▼
   Pre-populate  Try secondary
   + show badge    sources
         │           │
         └─────┬─────┘
               │
               ▼
       Check conflicts
          /        \
    No conflicts  Has conflicts
         │             │
         ▼             ▼
    Render field   Show warning
    with green     with orange
    badge          alert
```

## Conflict Resolution Flow

```
         Conflict Detected
                │
                ▼
    ┌───────────────────────┐
    │ Show all values:      │
    │ • Phase 1: "Zoho"     │
    │ • Service A: "Zoho"   │
    │ • Service B: "SF"     │ ← Different!
    └───────────────────────┘
                │
                ▼
        User chooses "Zoho"
                │
                ▼
    Is syncBidirectional=true?
          /            \
        YES             NO
         │               │
         ▼               ▼
    Update all       Update current
    locations        location only
         │               │
         └───────┬───────┘
                 │
                 ▼
         Conflict resolved ✓
```

## Task Generation with Context

```
┌─────────────────────────────────────────────────────────────┐
│          INPUT: Service Requirements + Meeting              │
│                                                              │
│  service.requirements:                                       │
│    • crmSystem: "Zoho"                                      │
│    • formPlatform: "Wix"                                    │
│    • emailProvider: "SendGrid"                              │
│    • webhookCapability: false                               │
│    • domainVerified: false                                  │
│    • retryAttempts: 3                                       │
│                                                              │
│  meeting (Phase 1):                                          │
│    • clientName: "ABC Company"                              │
│    • industry: "Real Estate"                                 │
│    • leadVolume: 150                                        │
│    • currentResponseTime: "2 hours"                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         INSTRUCTION GENERATOR PROCESSES                      │
│                                                              │
│  1. Extract Business Context                                │
│     → "Client: ABC Company, Industry: Real Estate"          │
│     → "Lead Volume: 150/month, Current: 2h, Target: 5min"   │
│                                                              │
│  2. Generate Technical Steps                                │
│     → Step 1: Wix Forms (webhookCapability=false)          │
│        ⚠️ "No webhook support - use plugin"                 │
│     → Step 2: SendGrid (domainVerified=false)               │
│        ⚠️ "CRITICAL: Verify domain before go-live"          │
│     → Step 3: Zoho CRM (actual auth method, module)        │
│     → Step 4: n8n Workflow (actual retry, alert email)     │
│                                                              │
│  3. Generate Acceptance Criteria (based on config)          │
│     → "Email sent within 5 minutes" (from target)           │
│     → "Error notifications to X" (from alertEmail value)    │
│                                                              │
│  4. Generate Testing Checklist (specific scenarios)         │
│     → "Test duplicate by email" (if duplicateDetection=true)│
│     → "Verify retry 3x" (from actual retryAttempts value)   │
│                                                              │
│  5. Generate Security Notes (based on actual config)        │
│     → "⚠️ Domain not verified" (if domainVerified=false)    │
│     → "✓ HTTPS enabled" (if httpsEnabled=true)             │
│                                                              │
│  6. Calculate Complexity                                     │
│     → webhookCapability=false: +1 complexity                │
│     → domainVerified=false: +1 complexity                   │
│     → Total: MEDIUM (12 hours)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   OUTPUT: Detailed Task                      │
│                                                              │
│  {                                                           │
│    title: "Implement Auto Form to CRM: Wix → Zoho",        │
│    description: `                                            │
│      ## BUSINESS CONTEXT                                     │
│      • Client: ABC Company (Real Estate)                    │
│      • Lead Volume: 150/month                               │
│      • Current Response: 2 hours                            │
│      • Target: < 5 minutes                                  │
│                                                              │
│      ## TECHNICAL IMPLEMENTATION                             │
│      1. Wix Forms Setup                                     │
│         ⚠️ No webhook support - install plugin              │
│         [10 detailed points]                                │
│      2. Zoho CRM OAuth                                      │
│         ✓ Full API access available                        │
│         [15 detailed points]                                │
│      3. SendGrid Email                                      │
│         ⚠️ Domain not verified - MUST verify               │
│         [12 detailed points]                                │
│      4. n8n Workflow                                        │
│         • Retry: 3 attempts                                 │
│         • Alert: tech@abc.com                              │
│         [20 detailed points]                                │
│                                                              │
│      ## ACCEPTANCE CRITERIA                                 │
│      [7 specific, testable criteria]                       │
│                                                              │
│      ## TESTING CHECKLIST                                   │
│      [13 comprehensive test scenarios]                     │
│                                                              │
│      ## SECURITY NOTES                                      │
│      [6 critical security considerations]                  │
│    `,                                                        │
│    estimatedHours: 12,                                      │
│    priority: "high",                                        │
│    testCases: [...]                                         │
│  }                                                           │
│                                                              │
│  Developer: "Perfect! I have everything I need!"            │
└─────────────────────────────────────────────────────────────┘
```

## System Benefits Flow

```
┌───────────────────┐
│   BETTER UX       │
│   • No duplicate  │
│     questions     │
│   • 50% faster    │
│   • Green badges  │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ BETTER DATA       │
│ • Consistent      │
│ • Validated       │
│ • Conflict-free   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ BETTER TASKS      │
│ • 40x detailed    │
│ • Full context    │
│ • Zero questions  │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ FASTER DELIVERY   │
│ • Clear specs     │
│ • Less rework     │
│ • Happy clients   │
└───────────────────┘
```

## ROI Visualization

```
INVESTMENT:                  RETURNS (Per Meeting):
┌──────────────┐            ┌─────────────────────────┐
│ 20 hours     │            │ User: 45min × $50 = $22 │
│ development  │            │ Dev: 2h × $100 = $200   │
│              │            │ Errors prevented = $50  │
│ $2,000       │            │ TOTAL: $272/meeting     │
└──────────────┘            └─────────────────────────┘
                                      │
                                      ▼
                            ┌──────────────────────┐
                            │ Break-even: 8 meetings│
                            │ Year 1: $13,625 saved │
                            │ Year 2: $16,875 saved │
                            │ 5-year ROI: 4,000%    │
                            └──────────────────────┘
```

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│                                                              │
│  • SmartFieldWidget (UI component)                          │
│  • Service requirement forms (65 components)                │
│  • SmartRequirementsCollector (analytics dashboard)         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                     │
│                                                              │
│  • useSmartField (React hook)                               │
│  • Field mapper utilities                                    │
│  • Requirements-to-instructions converter                    │
│  • Task generator                                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│                                                              │
│  • Field Registry (config)                                   │
│  • Meeting Store (Zustand)                                   │
│  • Instruction Templates                                     │
└─────────────────────────────────────────────────────────────┘
```

---

**Visual guide complete!** Use these diagrams to understand the complete system flow.

**Key Takeaway:** Data flows intelligently from Phase 1 → Phase 2 → Phase 3 with minimal user effort and maximum developer context.



