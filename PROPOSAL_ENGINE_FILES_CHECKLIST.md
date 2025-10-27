# Proposal Engine - Quick File Reference

A concise checklist of all files needed to duplicate the proposal engine.

---

## 🎯 Priority 1: CRITICAL FILES (Must Copy)

### Type Definitions & Schemas

| # | File Path | Lines | Description |
|---|-----------|-------|-------------|
| 1 | `src/types/proposal.ts` | 155 | All TypeScript interfaces: ProposalData, SelectedService, ProposedService, ServiceItem, ContractVersion, etc. |
| 2 | `src/schemas/aiProposal.schema.ts` | ~200 | AI response schema with ROI variants, buildDynamicProposalSchema() |

### Configuration (MUST CUSTOMIZE)

| # | File Path | Lines | Description |
|---|-----------|-------|-------------|
| 3 | `src/config/servicesDatabase.ts` | 36,141 | **60+ service definitions** with pricing, categories, complexity, tags. Replace with your services. |
| 4 | `src/config/companyBranding.ts` | ~150 | **Company info, logo, colors, payment terms, trial contract config.** Customize fully. |

### Core Engine Logic

| # | File Path | Lines | Description |
|---|-----------|-------|-------------|
| 5 | `src/utils/proposalEngine.ts` | Large | **Main proposal generation engine.** Analyzes 9 discovery modules, suggests services, calculates relevance scores. Adapt module analysis for your data structure. |
| 6 | `src/services/aiProposalGenerator.ts` | 661 | **AI proposal generator class.** GPT-5 integration, retry logic, Hebrew system prompt (lines 11-40), validation, ROI detection. Customize prompt for your brand. |
| 7 | `src/services/openaiProxy.ts` | Small | **Frontend → Backend proxy.** Calls `/api/openai/responses`, hides API key, handles errors. |
| 8 | `src/utils/printProposalPDF.ts` | 662 | **PDF generation via browser print.** Creates HTML template, handles standard/trial contracts, RTL Hebrew layout, 6-page structure. Customize template & branding. |

---

## 🎯 Priority 2: UI COMPONENTS (Optional - if you need UI)

| # | File Path | Description |
|---|-----------|-------------|
| 9 | `src/components/Modules/Proposal/ProposalModule.tsx` | Main proposal UI: service selection, filtering, inline editing, AI generation trigger, PDF export buttons, contract switcher |
| 10 | `src/components/Modules/Proposal/ContactCompletionModal.tsx` | Client contact validation (email, phone) before sending proposal |
| 11 | `src/components/Modules/Proposal/AddServicesModal.tsx` | Browse and manually add services from catalog |
| 12 | `src/components/PDF/ProposalHTMLTemplate.tsx` | React version of PDF template (optional - template is in printProposalPDF.ts) |

---

## 🎯 Priority 3: ADDITIONAL FEATURES (Optional)

| # | File Path | Description |
|---|-----------|-------------|
| 13 | `src/utils/smartRecommendationsEngine.ts` | Top 3 "quick win" recommendations with impact vs effort scores |
| 14 | `src/utils/pdfGenerators.ts` | Router for multiple PDF generation methods (browser print vs html2pdf.js) |
| 15 | `src/services/discoveryStatusService.ts` | 5-stage discovery workflow tracking (discovery_started → proposal → proposal_sent → technical_details → implementation) |
| 16 | `src/store/useMeetingStore.ts` | Zustand state store with localStorage + Supabase sync |

---

## 📦 Dependencies to Install

```bash
npm install openai zustand

# Optional (for alternative PDF method):
npm install html2pdf.js jspdf html2canvas
```

---

## ⚙️ Backend Requirements

### Required Endpoint

**POST /api/openai/responses**

**Purpose:** Secure proxy to OpenAI API (hides API key from frontend)

**Request:**
```json
{
  "model": "gpt-5-mini-2025-08-07",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "max_tokens": 1800,
  "seed": 7,
  "response_format": {
    "type": "json_schema",
    "json_schema": {...}
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": "{\"executiveSummary\": [...], ...}",
  "model": "gpt-5-mini-2025-08-07",
  "usage": {
    "promptTokens": 1500,
    "completionTokens": 800,
    "totalTokens": 2300
  }
}
```

---

## 🔧 Environment Variables

```env
# Backend only - NEVER expose in frontend
OPENAI_API_KEY=sk-proj-...

# Frontend config
VITE_AI_MODEL=gpt-5-mini-2025-08-07
VITE_API_URL=https://your-backend.com
```

---

## 🔑 Key Customization Points

### 1. Company Branding (`src/config/companyBranding.ts`)

```typescript
export const COMPANY_BRANDING = {
  companyNameHe: 'שם החברה',
  logoPath: '/path/to/logo.png',
  phone: '050-XXX-XXXX',
  email: 'info@company.com',
  primaryColor: '#3B82F6',
  paymentTermsHe: 'תשלום 50% מקדמה',
  // ... etc
};
```

### 2. Services Database (`src/config/servicesDatabase.ts`)

**Replace all 60+ services with yours:**

```typescript
{
  id: 'your-service-id',
  category: 'automations',
  nameHe: 'שם השירות',
  descriptionHe: 'תיאור',
  basePrice: 1200,        // ILS
  estimatedDays: 3,
  complexity: 'medium',
  tags: ['tag1', 'tag2'], // For matching logic
}
```

### 3. AI System Prompt (`src/services/aiProposalGenerator.ts` lines 11-40)

**Customize for your brand voice:**

```typescript
const buildSystemPrompt = (hasROI: boolean) => {
  return `You are an expert at writing professional proposals...
  // Adapt to your business, tone, language
  `;
};
```

### 4. Proposal Engine Logic (`src/utils/proposalEngine.ts`)

**Adapt module analysis for your data structure:**

```typescript
// If your discovery has different modules:
function analyzeYourModule(meeting: Meeting): ProposedService[] {
  // Your custom matching logic
}
```

---

## ✅ Integration Steps

1. **Copy 8 Priority 1 files** → Customize #3, #4, parts of #5, #6, #8
2. **Install dependencies** → `npm install openai zustand`
3. **Set up backend** → Implement `/api/openai/responses` proxy
4. **Configure `.env`** → Add `OPENAI_API_KEY` (backend only)
5. **Test proposal generation** → Run `generateProposal(meetingData)`
6. **Test AI generation** → Run `aiProposalGenerator.generateProposal()`
7. **Test PDF export** → Run `printProposalPDF()`

---

## 📊 Data Flow Summary

```
Meeting Data
    ↓
proposalEngine.ts → Suggests services
    ↓
User selects/edits services
    ↓
aiProposalGenerator.ts → Generates Hebrew content
    ↓
OpenAI API (via proxy) → Returns structured JSON
    ↓
printProposalPDF.ts → Creates HTML → Browser print dialog
    ↓
Client receives PDF
```

---

## 🚨 Security Checklist

- [ ] OpenAI API key **ONLY** on backend (never in frontend code)
- [ ] `/api/openai/responses` endpoint has rate limiting
- [ ] Input validation on all user-provided data
- [ ] CORS configured for backend API
- [ ] Environment variables properly secured

---

## 🧪 Testing Checklist

- [ ] Proposal generation with minimal data
- [ ] Proposal generation with complete data
- [ ] AI generation with ROI data (includes monthlySavings, expectedROIMonths)
- [ ] AI generation without ROI (omits ROI fields)
- [ ] PDF export - standard contract
- [ ] PDF export - trial contract
- [ ] PDF export - Hebrew RTL rendering
- [ ] API retry logic (simulate failure)
- [ ] Validation catches malformed AI responses

---

## 📈 Estimated Integration Time

- **Minimal Setup** (copy core files, basic config): **4-8 hours**
- **Full Setup** (with UI components): **16-24 hours**
- **Custom Adaptations** (different data structure, branding): **+8-16 hours**

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| AI returns invalid JSON | Check console for validation errors. Verify schema matches output. |
| PDF export blank | Verify `COMPANY_BRANDING` config complete. Check logo/signature paths. |
| Services not suggested | Debug `proposalEngine.ts` analysis. Check service tags match logic. |
| OpenAI API errors | Verify API key valid. Check rate limits. Ensure model name correct. |
| Hebrew text broken | Ensure `dir="rtl"` in HTML. Use Rubik font. Check UTF-8 encoding. |

---

## 📝 Notes

- **Language:** Currently Hebrew. To switch to English, update system prompt, PDF template, and use `name`/`description` instead of `nameHe`/`descriptionHe`.
- **PDF Method:** Uses browser native print dialog (no external services). Alternative: html2pdf.js (heavier).
- **State Management:** Uses Zustand. Can replace with Redux/Context/direct API calls.
- **ROI Schema:** Dynamically changes based on whether meeting has ROI data.

---

**Created:** 2025-10-26
**Version:** 1.0.0
**Status:** ✅ Production-Ready
