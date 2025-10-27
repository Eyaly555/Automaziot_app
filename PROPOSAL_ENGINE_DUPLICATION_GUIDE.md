# Proposal Engine Duplication Guide

Complete checklist for duplicating the proposal generation, AI summary, and PDF export logic to another application.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core Architecture](#core-architecture)
3. [Required Files Checklist](#required-files-checklist)
4. [External Dependencies](#external-dependencies)
5. [Configuration Requirements](#configuration-requirements)
6. [API & Backend Setup](#api--backend-setup)
7. [Integration Points](#integration-points)
8. [Testing Checklist](#testing-checklist)

---

## Overview

### What This Engine Does

1. **Service Recommendation Engine** - Analyzes meeting/discovery data and suggests relevant services with relevance scores
2. **AI Proposal Generation** - Uses GPT-5 to generate professional Hebrew proposals with structured sections
3. **PDF Export** - Generates multi-page, branded PDF proposals with print dialog

### Key Features

- ✅ 60+ pre-defined services across 5 categories
- ✅ Multi-module analysis (9 discovery modules)
- ✅ Smart service suggestions with relevance scoring
- ✅ AI-powered proposal content generation (Hebrew)
- ✅ Contract variants (standard/trial)
- ✅ ROI calculations with dynamic schema
- ✅ Professional PDF generation with branding
- ✅ Browser-native PDF export (no external services)

---

## Core Architecture

### Data Flow

```
Meeting Data (9 modules)
    ↓
Proposal Engine (proposalEngine.ts)
    ↓
ProposedServices[] + ProposalSummary
    ↓
User Selects/Edits Services
    ↓
AI Proposal Generator (aiProposalGenerator.ts)
    ↓
OpenAI API (via proxy) → Structured JSON
    ↓
AiProposalDoc (Hebrew sections)
    ↓
PDF Generator (printProposalPDF.ts)
    ↓
HTML Template → Browser Print Dialog
    ↓
Client receives PDF
```

---

## Required Files Checklist

### ✅ 1. Type Definitions

**Priority: CRITICAL** - Start here first

| File | Path | Purpose | Lines |
|------|------|---------|-------|
| `proposal.ts` | `/src/types/proposal.ts` | Core data types for proposals, services, branding | 155 |
| `aiProposal.schema.ts` | `/src/schemas/aiProposal.schema.ts` | AI response schema with ROI variants | ~200 |

**What to copy:**
- All interfaces: `ProposalData`, `SelectedService`, `ProposedService`, `ServiceItem`, `ProposalSummary`, `ContractVersion`
- `AiProposalDoc`, `AiProposalDocWithROI`, `AiProposalDocWithoutROI`
- `buildDynamicProposalSchema()` function

---

### ✅ 2. Configuration Files

**Priority: CRITICAL**

| File | Path | Purpose | Size |
|------|------|---------|------|
| `servicesDatabase.ts` | `/src/config/servicesDatabase.ts` | 60+ service definitions with pricing | ~36,000 lines |
| `companyBranding.ts` | `/src/config/companyBranding.ts` | Company info, colors, terms, trial contract config | ~150 lines |

**What to customize:**
- **servicesDatabase.ts**: Replace services with your own offerings, pricing, categories
- **companyBranding.ts**:
  - Company name, logo, contact info
  - Payment terms (50/50 or custom)
  - Trial contract terms (if applicable)
  - Brand colors, signature path

---

### ✅ 3. Core Engine Logic

**Priority: CRITICAL**

#### A. Proposal Engine

**File:** [src/utils/proposalEngine.ts](src/utils/proposalEngine.ts)

**What it does:**
- Analyzes 9 meeting modules (Overview, Leads, Operations, ROI, etc.)
- Suggests services based on data patterns
- Calculates relevance scores (1-10)
- Applies business logic (budget filters, employee count rules)
- Returns `ProposedService[]` + `ProposalSummary`

**Key function:**
```typescript
generateProposal(meeting: Meeting): {
  summary: ProposalSummary,
  proposedServices: ProposedService[]
}
```

**Dependencies:**
- `SERVICES_DATABASE` from config
- Meeting data structure
- Relevance scoring algorithm

**What to adapt:**
- Module structure (if your discovery differs from 9 modules)
- Scoring logic (customize for your business rules)
- Service matching patterns

---

#### B. AI Proposal Generator

**File:** [src/services/aiProposalGenerator.ts](src/services/aiProposalGenerator.ts) - **661 lines**

**What it does:**
- Singleton class with retry logic (3x exponential backoff)
- Calls OpenAI GPT-5 Responses API via proxy
- Generates structured Hebrew proposal sections
- Validates AI response against schema
- Handles ROI vs non-ROI proposals dynamically

**Key methods:**
```typescript
class AIProposalGenerator {
  // Main generation
  generateProposal(options): Promise<ProposalGenerationResult>

  // Regeneration with instructions
  regenerateProposal(options, instructions): Promise<ProposalGenerationResult>

  // Validation
  parseAndValidateResponse(data): AiProposalDoc | null

  // ROI detection
  private hasROIData(meeting, summary): boolean
}
```

**System Prompt:** Lines 11-40 (Hebrew proposal writing guidelines)

**Dependencies:**
- `callOpenAIThroughProxy()` from `openaiProxy.ts`
- `buildDynamicProposalSchema()` from schema file
- Meeting data structure

**What to customize:**
- System prompt (lines 11-40) - adapt to your brand voice
- Validation rules (lines 454-603) - adjust minimum character counts
- ROI detection logic (lines 357-377) - customize for your data

---

#### C. OpenAI Proxy Service

**File:** [src/services/openaiProxy.ts](src/services/openaiProxy.ts)

**What it does:**
- Proxies OpenAI API calls through your backend (security)
- Hides API key from frontend
- Handles errors and retries
- Tracks token usage

**Key function:**
```typescript
callOpenAIThroughProxy(request): Promise<OpenAIResponse>
```

**Backend endpoint:** `POST /api/openai/responses`

**What to adapt:**
- Backend URL (if different)
- Error handling strategy
- Token tracking (optional)

---

#### D. PDF Generation

**File:** [src/utils/printProposalPDF.ts](src/utils/printProposalPDF.ts) - **662 lines**

**What it does:**
- Generates complete HTML proposal document
- Handles contract variants (standard vs trial)
- Applies company branding
- Opens browser print dialog
- User saves as PDF natively

**Key function:**
```typescript
printProposalPDF(options: ProposalPDFOptions): void
```

**Input:**
```typescript
interface ProposalPDFOptions {
  clientName: string;
  clientCompany?: string;
  services: SelectedService[];
  proposalData: ProposalData;
  aiProposal?: AiProposalDoc;
  contractVersion?: ContractVersion;
}
```

**Features:**
- 6-page structure (header, services table, details, financial, terms, next steps)
- RTL Hebrew layout
- A4 size with print-optimized CSS
- Dynamic terms based on contract version
- ROI highlighting (if applicable)

**What to customize:**
- HTML template structure (lines 117-634)
- Page layout and styling
- Terms section logic (lines 35-96)
- Brand colors and fonts

---

### ✅ 4. UI Components

**Priority: HIGH** (if you need UI)

#### A. Main Proposal Module

**File:** [src/components/Modules/Proposal/ProposalModule.tsx](src/components/Modules/Proposal/ProposalModule.tsx)

**What it does:**
- Complete proposal management UI
- Service selection and filtering
- Inline editing (prices, durations, descriptions)
- AI proposal generation trigger
- PDF export buttons
- Contract version switcher
- PM notes input

**Key features:**
- Service filtering (category, complexity, price range, search)
- Comparison table (2+ services)
- Quick-edit mode
- Manual service addition
- "Generate AI Proposal" button with loading states
- Preview modal for AI proposal
- Regeneration with additional instructions
- Download/Send PDF buttons

**State management:** Uses `useMeetingStore` (Zustand)

**What to adapt:**
- UI framework (if not React)
- State management (if not Zustand)
- Styling (Tailwind classes)

---

#### B. Supporting Modals

**File:** [src/components/Modules/Proposal/ContactCompletionModal.tsx](src/components/Modules/Proposal/ContactCompletionModal.tsx)

**What it does:**
- Validates client contact info before sending proposal
- Email validation
- Israeli phone format validation

---

**File:** [src/components/Modules/Proposal/AddServicesModal.tsx](src/components/Modules/Proposal/AddServicesModal.tsx)

**What it does:**
- Browse full service catalog
- Search and filter
- Add services manually to proposal

---

#### C. PDF HTML Template Component

**File:** [src/components/PDF/ProposalHTMLTemplate.tsx](src/components/PDF/ProposalHTMLTemplate.tsx)

**What it does:**
- React component version of PDF template
- Renders proposal as HTML for preview or export
- Same structure as `printProposalPDF.ts`

**Note:** This is optional - `printProposalPDF.ts` contains the complete HTML template as a string

---

### ✅ 5. Additional Utilities

**Priority: MEDIUM**

| File | Path | Purpose |
|------|------|---------|
| `pdfGenerators.ts` | `/src/utils/pdfGenerators.ts` | Router function for PDF generation methods |
| `smartRecommendationsEngine.ts` | `/src/utils/smartRecommendationsEngine.ts` | Top 3 quick wins with impact scores |
| `discoveryStatusService.ts` | `/src/services/discoveryStatusService.ts` | 5-stage workflow tracking (optional) |

**What to adapt:**
- Remove discovery status tracking if not needed
- Customize smart recommendations algorithm
- Choose PDF generation method (browser print vs html2pdf.js)

---

### ✅ 6. State Management

**File:** [src/store/useMeetingStore.ts](src/store/useMeetingStore.ts)

**What it does:**
- Zustand store for meeting data persistence
- Auto-saves to localStorage
- Auto-syncs to backend (Supabase in your case)

**Key actions:**
```typescript
updateModule(moduleName, data) // Update proposal module
updateMeeting(updates)          // Bulk updates
```

**What to adapt:**
- Backend sync logic (currently Supabase)
- Store structure (if your data model differs)
- Replace with Redux/Context/other if needed

---

## External Dependencies

### Required NPM Packages

```json
{
  "dependencies": {
    // Core AI
    "openai": "^4.x",           // OpenAI SDK (if using backend)

    // State Management
    "zustand": "^4.x",          // State store (or use Redux/Context)

    // PDF Generation (optional - browser print is native)
    "html2pdf.js": "^0.10.x",   // If using html2pdf method
    "jspdf": "^2.x",            // Required by html2pdf
    "html2canvas": "^1.x",      // Required by html2pdf

    // UI (if using React)
    "react": "^18.x",
    "lucide-react": "^0.x",     // Icons

    // Validation
    "zod": "^3.x"               // If using schema validation
  }
}
```

### Optional Dependencies

```json
{
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^20.x"
  }
}
```

---

## Configuration Requirements

### 1. Environment Variables

Create `.env` file:

```env
# OpenAI API Key (backend only - NEVER expose in frontend)
OPENAI_API_KEY=sk-proj-...

# AI Model Configuration
VITE_AI_MODEL=gpt-5-mini-2025-08-07

# Backend API URL (if using proxy)
VITE_API_URL=https://your-backend.com
```

---

### 2. Company Branding Configuration

**File to edit:** `src/config/companyBranding.ts`

```typescript
export const COMPANY_BRANDING = {
  companyName: 'Your Company',
  companyNameHe: 'החברה שלך',
  logoPath: '/path/to/logo.png',
  signaturePath: '/path/to/signature.png',
  address: 'Your Address',
  phone: '050-XXX-XXXX',
  email: 'info@yourcompany.com',
  website: 'www.yourcompany.com',

  // Payment Terms
  paymentTermsHe: 'תשלום 50% מקדמה, 50% בסיום',
  proposalValidity: 7, // days

  // Colors
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',

  // Signature
  signerName: 'Your Name',
  signerTitle: 'CEO',
};

// Trial Contract Terms (if applicable)
export const TRIAL_CONTRACT_TERMS = {
  title: 'תנאי התקשרות',
  highlightedText: 'ללא תשלום למשך 5 ימי עבודה',
  terms: [
    // Array of trial terms
  ],
};
```

---

### 3. Services Database Configuration

**File to edit:** `src/config/servicesDatabase.ts`

**Structure:**

```typescript
export const SERVICES_DATABASE: ServiceItem[] = [
  {
    id: 'unique-service-id',
    category: 'automations', // or 'ai_agents', 'integrations', etc.
    name: 'Service Name',
    nameHe: 'שם השירות',
    description: 'English description',
    descriptionHe: 'תיאור בעברית',
    basePrice: 1200,           // ILS
    estimatedDays: 3,          // Working days
    complexity: 'medium',      // 'simple' | 'medium' | 'complex'
    tags: ['tag1', 'tag2'],   // For matching logic
  },
  // ... 60+ services
];
```

**Categories:**

```typescript
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'automations',
    nameHe: 'אוטומציות n8n',
    icon: '⚡',
    priority: 'primary',
  },
  {
    id: 'ai_agents',
    nameHe: 'סוכני AI',
    icon: '🤖',
    priority: 'primary',
  },
  {
    id: 'integrations',
    nameHe: 'אינטגרציות',
    icon: '🔗',
    priority: 'secondary',
  },
  {
    id: 'system_implementation',
    nameHe: 'הטמעת מערכות',
    icon: '💼',
    priority: 'secondary',
  },
  {
    id: 'additional_services',
    nameHe: 'שירותים נוספים',
    icon: '💡',
    priority: 'optional',
  },
];
```

---

## API & Backend Setup

### Required Backend Endpoints

#### 1. OpenAI Proxy Endpoint

**Endpoint:** `POST /api/openai/responses`

**Purpose:** Securely proxy OpenAI API calls (hide API key from frontend)

**Request Body:**
```typescript
{
  model: 'gpt-5-mini-2025-08-07',
  messages: [
    { role: 'system', content: '...' },
    { role: 'user', content: '...' }
  ],
  max_tokens: 1800,
  seed: 7,
  response_format: {
    type: 'json_schema',
    json_schema: {...}
  }
}
```

**Response:**
```typescript
{
  success: true,
  data: '{"executiveSummary": [...], ...}', // JSON string
  model: 'gpt-5-mini-2025-08-07',
  usage: {
    promptTokens: 1500,
    completionTokens: 800,
    totalTokens: 2300
  }
}
```

**Example Implementation (Node.js + Express):**

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/openai/responses', async (req, res) => {
  try {
    const { model, messages, max_tokens, seed, response_format } = req.body;

    const completion = await openai.chat.completions.create({
      model,
      messages,
      max_tokens,
      seed,
      response_format,
    });

    res.json({
      success: true,
      data: completion.choices[0].message.content,
      model: completion.model,
      usage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
```

---

#### 2. Data Persistence (Optional)

**Your current setup:** Supabase auto-sync

**What to implement:**
- Save proposal data to database when generated
- Update proposal when services changed
- Track proposal versions/history
- Mark proposal as sent

**Example endpoints:**
```
POST /api/proposals              - Create new proposal
PUT /api/proposals/:id           - Update proposal
GET /api/proposals/:id           - Get proposal
POST /api/proposals/:id/send     - Mark as sent
```

---

## Integration Points

### 1. Meeting/Discovery Data Structure

**Your proposal engine expects this structure:**

```typescript
interface Meeting {
  id: string;
  clientName: string;
  modules: {
    overview: {
      companyName: string;
      budget?: number;
      employeeCount?: number;
      // ...
    };
    leads?: {
      // Lead generation data
    };
    operations?: {
      // Operations data
    };
    roi?: {
      summary?: {
        totalMonthlySaving?: number;
      };
      estimatedCostSavings?: number;
    };
    // ... 9 modules total
  };
  painPoints?: string[];
}
```

**What to adapt:**
- If your discovery structure differs, update `proposalEngine.ts` analysis logic (lines 50-500)
- Map your data fields to the analysis modules
- Adjust service matching patterns

---

### 2. State Management Integration

**Current:** Zustand store with localStorage + Supabase sync

**What to integrate:**
```typescript
// Save proposal data
store.updateModule('proposal', {
  summary: proposalSummary,
  proposedServices: proposedServices,
  selectedServices: selectedServices,
  aiProposal: aiProposalData,
  totalPrice: totalPrice,
  // ...
});

// Retrieve proposal data
const proposalData = store.currentMeeting.modules.proposal;
```

**Alternative approaches:**
- Redux: Dispatch actions to update proposal state
- Context API: Use context provider for proposal data
- Direct API calls: Save to backend on every change

---

## Testing Checklist

### 1. Proposal Generation Testing

- [ ] Test with minimal data (few fields filled)
- [ ] Test with complete data (all modules)
- [ ] Test with ROI data present
- [ ] Test with ROI data absent
- [ ] Verify service relevance scores (1-10)
- [ ] Verify correct services suggested based on budget
- [ ] Verify correct services suggested based on employee count

---

### 2. AI Proposal Generation Testing

- [ ] Test Hebrew output quality
- [ ] Test with different service combinations
- [ ] Test with ROI data → verify `monthlySavings` and `expectedROIMonths` included
- [ ] Test without ROI data → verify fields omitted
- [ ] Test retry logic (simulate API failure)
- [ ] Test regeneration with additional instructions
- [ ] Verify validation catches malformed responses
- [ ] Verify character minimum requirements enforced

---

### 3. PDF Export Testing

- [ ] Test standard contract PDF
- [ ] Test trial contract PDF
- [ ] Verify trial terms highlighted correctly
- [ ] Test with AI proposal sections
- [ ] Test without AI proposal (fallback content)
- [ ] Test with ROI → verify ROI box appears
- [ ] Test without ROI → verify no ROI section
- [ ] Test Hebrew RTL layout
- [ ] Test multi-page rendering (6 pages)
- [ ] Test print dialog opens correctly
- [ ] Test "Save as PDF" from browser
- [ ] Verify branding (logo, colors, signature)

---

### 4. Edge Cases

- [ ] Test with 0 services selected
- [ ] Test with 50+ services selected
- [ ] Test with very long service descriptions
- [ ] Test with very high prices (₪1,000,000+)
- [ ] Test with invalid client email/phone
- [ ] Test API timeout/failure
- [ ] Test with missing company branding config
- [ ] Test contract version switching

---

## File Copy Priority

### Priority 1 - MUST HAVE (Core Logic)

Copy these files first - the engine won't work without them:

1. ✅ `src/types/proposal.ts` (155 lines)
2. ✅ `src/schemas/aiProposal.schema.ts` (~200 lines)
3. ✅ `src/config/servicesDatabase.ts` (36,000 lines) - **CUSTOMIZE**
4. ✅ `src/config/companyBranding.ts` (150 lines) - **CUSTOMIZE**
5. ✅ `src/utils/proposalEngine.ts` (full file)
6. ✅ `src/services/aiProposalGenerator.ts` (661 lines)
7. ✅ `src/services/openaiProxy.ts` (full file)
8. ✅ `src/utils/printProposalPDF.ts` (662 lines)

---

### Priority 2 - RECOMMENDED (UI Components)

Copy if you need a complete UI:

9. ✅ `src/components/Modules/Proposal/ProposalModule.tsx`
10. ✅ `src/components/Modules/Proposal/ContactCompletionModal.tsx`
11. ✅ `src/components/Modules/Proposal/AddServicesModal.tsx`
12. ✅ `src/components/PDF/ProposalHTMLTemplate.tsx` (optional - template in printProposalPDF)

---

### Priority 3 - OPTIONAL (Additional Features)

Copy if you want extra features:

13. ✅ `src/utils/smartRecommendationsEngine.ts` (quick wins suggestions)
14. ✅ `src/utils/pdfGenerators.ts` (alternative PDF methods)
15. ✅ `src/services/discoveryStatusService.ts` (workflow tracking)
16. ✅ `src/store/useMeetingStore.ts` (state management)

---

## Quick Start Checklist

### For External Developer/AI

1. **Copy Core Files** (Priority 1 - 8 files above)
2. **Install Dependencies:**
   ```bash
   npm install openai zustand
   # Optional: html2pdf.js jspdf html2canvas
   ```
3. **Configure Environment:**
   - Create `.env` with `OPENAI_API_KEY`
   - Update `companyBranding.ts` with your company info
   - Customize `servicesDatabase.ts` with your services
4. **Set Up Backend:**
   - Implement `/api/openai/responses` proxy endpoint
   - Secure API key server-side
5. **Test Proposal Generation:**
   ```typescript
   import { generateProposal } from './utils/proposalEngine';
   const result = generateProposal(meetingData);
   ```
6. **Test AI Generation:**
   ```typescript
   import { aiProposalGenerator } from './services/aiProposalGenerator';
   const aiResult = await aiProposalGenerator.generateProposal({
     meeting,
     selectedServices,
     pmNote: 'Optional PM notes',
   });
   ```
7. **Test PDF Export:**
   ```typescript
   import { printProposalPDF } from './utils/printProposalPDF';
   printProposalPDF({
     clientName: 'Test Client',
     services: selectedServices,
     proposalData: proposalData,
     aiProposal: aiResult.sections,
     contractVersion: 'standard',
   });
   ```

---

## Architecture Decisions to Understand

### 1. Why GPT-5 Responses API?

- **Structured Output:** JSON schema enforcement ensures valid data
- **Deterministic:** Seed parameter for reproducibility
- **Type Safety:** Direct mapping to TypeScript interfaces

### 2. Why Browser Print Dialog?

- **No External Service:** No PDFMake/Puppeteer/Cloudinary needed
- **Native Quality:** Browser rendering is perfect for Hebrew RTL
- **Zero Cost:** No API calls or cloud services
- **User Control:** Client chooses filename, printer, settings

### 3. Why Dynamic ROI Schema?

- **Flexibility:** Same AI prompt works for ROI and non-ROI projects
- **Validation:** Prevents AI from hallucinating ROI data when none exists
- **Type Safety:** TypeScript knows which fields are present

### 4. Why Service Relevance Scoring?

- **Prioritization:** Show most relevant services first
- **Transparency:** Client sees why each service was suggested
- **Audit Trail:** Track data sources that triggered suggestions

---

## Common Customization Points

### 1. Change Language (Hebrew → English)

**Files to update:**
- `aiProposalGenerator.ts` lines 11-40 (system prompt)
- `printProposalPDF.ts` (all Hebrew text and RTL layout)
- `servicesDatabase.ts` (use `name`/`description` instead of `nameHe`/`descriptionHe`)

### 2. Add New Service Categories

**File:** `servicesDatabase.ts`

```typescript
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  // ... existing categories
  {
    id: 'your_new_category',
    nameHe: 'הקטגוריה החדשה',
    icon: '🎯',
    priority: 'primary',
  },
];
```

### 3. Change Pricing Model

**Current:** Fixed price per service

**To change:**
- Update `ServiceItem.basePrice` to support hourly/monthly/tiered
- Modify `calculateProposalSummary()` in `aiProposalGenerator.ts`
- Update PDF financial section

### 4. Add New Discovery Modules

**File:** `proposalEngine.ts`

Add new analysis function:

```typescript
function analyzeYourNewModule(meeting: Meeting): ProposedService[] {
  const module = meeting.modules.yourNewModule;
  const suggestions: ProposedService[] = [];

  // Your matching logic
  if (module.someField) {
    suggestions.push({
      ...SERVICES_DATABASE.find(s => s.id === 'relevant-service'),
      relevanceScore: 8,
      reasonSuggestedHe: 'נמצא כי...',
      dataSource: ['yourNewModule'],
    });
  }

  return suggestions;
}
```

---

## Security Considerations

### 1. API Key Protection

**❌ NEVER:**
```typescript
// DON'T expose API key in frontend
const openai = new OpenAI({ apiKey: 'sk-proj-...' });
```

**✅ ALWAYS:**
```typescript
// DO use backend proxy
const response = await fetch('/api/openai/responses', {
  method: 'POST',
  body: JSON.stringify({ model, messages }),
});
```

### 2. Input Validation

- Validate client data before AI generation
- Sanitize user input in PM notes
- Validate service selections (prevent negative prices)

### 3. Rate Limiting

- Implement rate limits on `/api/openai/responses`
- Prevent abuse of AI generation (3 retries max)
- Track usage per user/session

---

## Troubleshooting Guide

### Problem: AI returns invalid JSON

**Solution:**
- Check `parseAndValidateResponse()` validation errors in console
- Verify schema matches AI output
- Increase character minimums if AI returns too-short content
- Check system prompt for conflicting instructions

---

### Problem: PDF export blank/broken

**Solution:**
- Verify `COMPANY_BRANDING` config complete
- Check for console errors about missing fonts
- Ensure images (logo, signature) paths are correct
- Test with simpler HTML first (remove sections)

---

### Problem: Services not suggested correctly

**Solution:**
- Debug `proposalEngine.ts` analysis functions
- Add console.logs to see which modules are analyzed
- Verify `SERVICES_DATABASE` tags match your logic
- Check relevance score calculations

---

### Problem: OpenAI API errors

**Solution:**
- Verify API key valid and has credits
- Check rate limits (Tier 1: 500 RPM)
- Ensure model name correct (`gpt-5-mini-2025-08-07`)
- Test with smaller `max_tokens` first

---

## Performance Optimization

### 1. Lazy Load Services Database

```typescript
// Instead of importing all 36k lines at once
const SERVICES_DATABASE = lazy(() => import('./servicesDatabase'));
```

### 2. Debounce AI Generation

```typescript
// Prevent rapid-fire API calls
const debouncedGenerate = debounce(generateProposal, 2000);
```

### 3. Cache AI Responses

```typescript
// Cache by selectedServices hash
const cacheKey = hashServices(selectedServices);
if (proposalCache.has(cacheKey)) {
  return proposalCache.get(cacheKey);
}
```

---

## Final Checklist

Before going live:

- [ ] All 8 Priority 1 files copied and adapted
- [ ] Company branding configured
- [ ] Services database customized with your offerings
- [ ] Backend proxy endpoint implemented and tested
- [ ] OpenAI API key secured (backend only)
- [ ] Environment variables set
- [ ] Hebrew/English language choice made
- [ ] PDF export tested with real data
- [ ] AI proposal generation tested (ROI + non-ROI)
- [ ] Contract variants tested (standard + trial)
- [ ] All validation working (emails, phones, prices)
- [ ] Error handling tested (API failures, timeouts)
- [ ] Rate limiting implemented
- [ ] Security review completed

---

## Support & Contact

**Original Developer:** Eyal (eym-group)

**Project:** Discovery Assistant - Proposal Engine

**Tech Stack:**
- React + TypeScript
- Zustand (state)
- OpenAI GPT-5
- Supabase (optional backend)
- Tailwind CSS (optional styling)

**Estimated Integration Time:**
- Minimal Setup (core logic only): 4-8 hours
- Full Setup (with UI): 16-24 hours
- Custom Adaptations: +8-16 hours

---

## License & Usage

This duplication guide is provided to help migrate the proposal engine logic to other applications within your organization. Ensure compliance with:

- OpenAI API Terms of Service
- Any third-party library licenses
- Your company's code reuse policies

---

**Last Updated:** 2025-10-26

**Version:** 1.0.0

**Status:** ✅ Production-Ready
