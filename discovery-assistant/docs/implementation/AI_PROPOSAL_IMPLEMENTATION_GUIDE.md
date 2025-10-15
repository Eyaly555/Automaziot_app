# AI-Driven Proposal Generation - Complete Implementation Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture Overview](#architecture-overview)
4. [Implementation Phases](#implementation-phases)
5. [Testing Strategy](#testing-strategy)
6. [Deployment Checklist](#deployment-checklist)
7. [Rollback Plan](#rollback-plan)
8. [Success Metrics](#success-metrics)

---

## Overview

### What We're Building

A smart AI-powered proposal generation system that:
- Adds a PM note field for contextual input
- Replaces two CTA buttons with a single "Generate Proposal" button
- Uses AI to create personalized Hebrew proposals
- Shows a preview before sending/downloading
- Falls back gracefully to static generation if AI fails

### Key Benefits

- **Personalization**: Each proposal tailored to specific client data
- **Time Savings**: Automated content generation (5-10 min → 30 sec)
- **Quality**: Professional, consistent, data-driven proposals
- **Flexibility**: Preview/edit before sending
- **Reliability**: Graceful fallback ensures no disruption

### Estimated Timeline

- **Total Implementation**: 12-14 hours
- **Testing**: 3-4 hours
- **Documentation**: 1-2 hours
- **Total**: ~18 hours (2-3 work days)

---

## Prerequisites

### Required Knowledge

- TypeScript/React
- Your existing codebase architecture
- Zustand state management
- Basic AI/LLM concepts

### Environment Setup

**Check AI Configuration:**

```bash
# Verify these environment variables exist
VITE_ENABLE_AI_FEATURES=true
VITE_AI_PROVIDER=openai  # or anthropic
VITE_AI_API_KEY=your-api-key
VITE_AI_MODEL=gpt-4  # or claude-3-opus-20240229
```

**Install Dependencies (if needed):**

```bash
# All dependencies should already be installed
# If not, add:
npm install
```

**Backup Current State:**

```bash
# Create a git branch for this work
git checkout -b feature/ai-proposal-generation
git add .
git commit -m "Checkpoint: Before AI proposal implementation"
```

---

## Architecture Overview

### Data Flow Diagram

```
User Input (PM Note + Services)
    ↓
[Generate Proposal Button]
    ↓
aiProposalGenerator.ts
    ↓
AIService.ts (OpenAI/Anthropic)
    ↓
Parse JSON Response
    ↓
Store in meeting.modules.proposal.aiProposal
    ↓
[Preview Modal] → User Decision
    ↓
[Send] or [Download PDF]
    ↓
ProposalHTMLTemplate.tsx (uses AI content)
    ↓
PDF Generation
```

### Files We'll Modify/Create

**New Files (3):**
- `src/utils/aiProposalGenerator.ts` - Core AI generation logic
- `src/components/Modules/Proposal/AIProposalPreviewModal.tsx` - Preview UI
- `AI_PROPOSAL_IMPLEMENTATION_GUIDE.md` - This document

**Modified Files (3):**
- `src/types/proposal.ts` - Add new types
- `src/services/AIService.ts` - Make callAI public
- `src/components/Modules/Proposal/ProposalModule.tsx` - UI changes
- `src/components/PDF/ProposalHTMLTemplate.tsx` - Use AI content

---

## Implementation Phases

## Phase 1: Type System & Data Model (30 minutes)

### Step 1.1: Update ProposalData Interface

**File: `src/types/proposal.ts`**

**Location:** Line 62, within the `ProposalData` interface

**Add these fields after `customNotes`:**

```typescript
export interface ProposalData {
  meetingId: string;
  generatedAt: Date;
  summary: ProposalSummary;
  proposedServices: ProposedService[];
  selectedServices: SelectedService[];
  purchasedServices?: SelectedService[];
  totalPrice: number;
  totalPriceWithVat: number;
  totalDays: number;
  expectedROIMonths: number;
  monthlySavings: number;
  customNotes?: string; // Keep for backward compatibility

  // ✅ NEW: PM Note
  pmNote?: string;

  // ✅ NEW: AI-Generated Proposal
  aiProposal?: AIProposalData;

  // הנחות ומחירים מיוחדים
  discountPercentage?: number;
  discountedPrice?: number;
  finalPriceWithVat?: number;

  // Client approval fields
  approvalSignature?: string;
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;
  rejectionFeedback?: string;
  rejectedAt?: string;

  // Proposal sent tracking
  proposalSent?: boolean;
  proposalSentAt?: string;
}
```

**Add new interfaces at the end of the file (after line 126):**

```typescript
// AI Proposal Types
export interface AIProposalData {
  createdAt: string; // ISO timestamp
  model?: string; // e.g., "gpt-4", "claude-3-opus-20240229"
  status: 'generating' | 'success' | 'failed';
  error?: string; // Error message if failed
  sections?: AIProposalSections;
  rawMarkdown?: string; // Optional: full markdown version
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  // ✅ NEW: Regeneration history
  regenerationHistory?: RegenerationInstruction[];
  regenerationCount?: number;
}

export interface RegenerationInstruction {
  instruction: string;
  timestamp: string;
  generationNumber: number;
}

export interface AIProposalSections {
  executiveSummary: string[]; // Array of paragraphs
  services: AIServiceDescription[];
  financialSummary: {
    totalPrice: number;
    totalDays: number;
    monthlySavings?: number;
    expectedROIMonths?: number;
  };
  terms: string[]; // Array of terms/conditions
  nextSteps: string[]; // What happens next
}

export interface AIServiceDescription {
  serviceId: string;
  titleHe: string;
  whyRelevantHe: string; // Why this service matters to THIS client
  whatIncludedHe: string; // What's included in implementation
}
```

**Verification:**

```bash
# Run TypeScript check
npm run build:typecheck
```

You should see no errors related to `proposal.ts`.

---

## Phase 2: AI Proposal Generator (2 hours)

### Step 2.1: Create AI Proposal Generator Utility

**File: `src/utils/aiProposalGenerator.ts` (NEW FILE)**

**Full file content:**

```typescript
import { Meeting } from '../types';
import { SelectedService } from '../types/proposal';
import { aiService } from '../services/AIService';

/**
 * Data structure for AI prompt
 */
export interface AiProposalPromptData {
  companyName: string;
  businessType: string;
  employeeCount: number;
  modules: {
    overview: any;
    leadsAndSales: any;
    customerService: any;
    operations: any;
    systems: any;
    roi: any;
  };
  selectedServices: {
    id: string;
    nameHe: string;
    descriptionHe: string;
    reasonSuggestedHe: string;
    basePrice: number;
    customPrice?: number;
    estimatedDays: number;
    customDuration?: number;
  }[];
  pmNote?: string;
  totalPrice: number;
  totalDays: number;
  monthlySavings?: number;
}

/**
 * Generate AI-powered proposal content
 *
 * @param meeting - Current meeting data
 * @param selectedServices - Services selected for proposal
 * @param pmNote - Optional project manager contextual note
 * @param regenerationInstructions - Array of accumulated regeneration instructions
 * @param regenerationCount - Current regeneration attempt number
 * @returns AI proposal data or error
 */
export async function generateAIProposal(
  meeting: Meeting,
  selectedServices: SelectedService[],
  pmNote?: string,
  regenerationInstructions?: string[],
  regenerationCount: number = 0
): Promise<any> {
  console.log('[AI Proposal] Starting generation...', {
    company: meeting.clientName,
    servicesCount: selectedServices.length,
    hasPmNote: !!pmNote,
    regenerationCount,
    hasRegenerationInstructions: !!regenerationInstructions && regenerationInstructions.length > 0,
  });

  // 1. Validate inputs
  if (!meeting || !selectedServices || selectedServices.length === 0) {
    throw new Error('Meeting and services are required');
  }

  // 2. Check if AI is available
  if (!aiService.isAvailable()) {
    console.warn('[AI Proposal] AI service not available, returning error');
    return {
      status: 'failed',
      error: 'AI service not configured. Please check environment variables.',
      createdAt: new Date().toISOString(),
    };
  }

  // 3. Build prompt data
  const promptData = buildPromptData(meeting, selectedServices, pmNote);

  // 4. Build system + user prompts
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(promptData, regenerationInstructions);

  // 5. Call AI
  try {
    console.log('[AI Proposal] Calling AI service...');
    const response = await aiService.callAI(systemPrompt + '\n\n' + userPrompt);

    if (!response.success) {
      throw new Error(response.error || 'AI generation failed');
    }

    console.log('[AI Proposal] AI response received, parsing...');

    // 6. Parse response
    const parsed = parseAIResponse(response.data);

    // 7. Validate parsed data
    validateParsedResponse(parsed);

    console.log('[AI Proposal] Generation successful');

    return {
      status: 'success',
      sections: parsed,
      model: aiService.getConfig()?.model || 'unknown',
      usage: response.usage,
      createdAt: new Date().toISOString(),
      regenerationCount: regenerationCount + 1,
      regenerationHistory: regenerationInstructions?.map((instruction, index) => ({
        instruction,
        timestamp: new Date().toISOString(),
        generationNumber: index + 1,
      })) || [],
    };

  } catch (error) {
    console.error('[AI Proposal] Generation failed:', error);
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Build prompt data from meeting and services
 */
function buildPromptData(
  meeting: Meeting,
  selectedServices: SelectedService[],
  pmNote?: string
): AiProposalPromptData {
  // Calculate totals
  const totalPrice = selectedServices.reduce((sum, s) => sum + (s.customPrice || s.basePrice), 0);
  const totalDays = Math.max(...selectedServices.map(s => s.customDuration || s.estimatedDays));
  const monthlySavings = meeting.modules.roi?.monthlySavings || 0;

  return {
    companyName: meeting.modules.overview?.companyName || meeting.clientName,
    businessType: meeting.modules.overview?.businessType || 'לא צוין',
    employeeCount: meeting.modules.overview?.employeeCount || 0,
    modules: {
      overview: sanitizeModuleData(meeting.modules.overview),
      leadsAndSales: sanitizeModuleData(meeting.modules.leadsAndSales),
      customerService: sanitizeModuleData(meeting.modules.customerService),
      operations: sanitizeModuleData(meeting.modules.operations),
      systems: sanitizeModuleData(meeting.modules.systems),
      roi: sanitizeModuleData(meeting.modules.roi),
    },
    selectedServices: selectedServices.map(s => ({
      id: s.id,
      nameHe: s.nameHe,
      descriptionHe: s.descriptionHe,
      reasonSuggestedHe: s.reasonSuggestedHe,
      basePrice: s.customPrice || s.basePrice,
      estimatedDays: s.customDuration || s.estimatedDays,
    })),
    pmNote: pmNote?.trim() || undefined,
    totalPrice,
    totalDays,
    monthlySavings,
  };
}

/**
 * Build system prompt for AI
 */
function buildSystemPrompt(): string {
  return `אתה כותב הצעות מחיר מומחה בעברית עבור פתרונות אוטומציה ו-AI.

הנחיות:
- טון: רשמי אך חברותי, ישיר ומקצועי
- שפה: עברית בלבד (למעט מונחים טכניים באנגלית)
- מטבע: רק ₪ (ILS) - אל תשתמש במטבעות אחרים
- תמיד הדגש ROI ותועלות עסקיות מדידות
- הצעה תמציתית: 3-4 פסקאות לתקציר מנהלים
- עבור כל שירות: הסבר ממוקד למה הוא רלוונטי דווקא ללקוח הזה (לא גנרי)
- אל תשנה מחירים או זמני יישום שסופקו
- החזר JSON בלבד, בלי טקסט לפני או אחרי
- וודא שכל הפלט בעברית תקנית`;
}

/**
 * Build user prompt with meeting data
 */
function buildUserPrompt(data: AiProposalPromptData, regenerationInstructions?: string[]): string {
  const basePrompt = `צור הצעת מחיר מקצועית על בסיס הנתונים הבאים:

**פרטי החברה:**
- שם: ${data.companyName}
- סוג עסק: ${data.businessType}
- מספר עובדים: ${data.employeeCount}

**תהליכי מכירות ולידים:**
${JSON.stringify(data.modules.leadsAndSales, null, 2)}

**שירות לקוחות:**
${JSON.stringify(data.modules.customerService, null, 2)}

**תהליכים תפעוליים:**
${JSON.stringify(data.modules.operations, null, 2)}

**מערכות קיימות:**
${JSON.stringify(data.modules.systems, null, 2)}

**ROI מזוהה:**
${JSON.stringify(data.modules.roi, null, 2)}

**שירותים שנבחרו (${data.selectedServices.length} שירותים):**
${data.selectedServices.map((s, i) => `
${i + 1}. ${s.nameHe}
   - תיאור: ${s.descriptionHe}
   - למה הוצע: ${s.reasonSuggestedHe}
   - מחיר: ₪${s.basePrice.toLocaleString()}
   - זמן: ${s.estimatedDays} ימים
`).join('\n')}

${data.pmNote ? `**הערת מנהל הפרויקט:**
${data.pmNote}
` : ''}

**סיכום כספי:**
- מחיר כולל: ₪${data.totalPrice.toLocaleString()}
- זמן יישום: ${data.totalDays} ימים
- חיסכון חודשי: ₪${data.monthlySavings?.toLocaleString() || '0'}

**החזר JSON בפורמט הבא בדיוק:**

\`\`\`json
{
  "executiveSummary": [
    "פסקה 1: התחל בהקשר - מה מאפיין את החברה הזו ואת האתגרים שלה",
    "פסקה 2: הסבר מה זיהינו ואיך זה פותר את הבעיות שלהם",
    "פסקה 3: הדגש את התשואה והערך העסקי"
  ],
  "services": [
    {
      "serviceId": "${data.selectedServices[0]?.id}",
      "titleHe": "${data.selectedServices[0]?.nameHe}",
      "whyRelevantHe": "התייחס ישירות לנתונים שלהם - למה דווקא השירות הזה פותר את הבעיה שזיהינו אצלם",
      "whatIncludedHe": "מה כלול ביישום - 3-4 נקודות מרכזיות: הקמה, אינטגרציה, הדרכה, תמיכה"
    }
  ],
  "financialSummary": {
    "totalPrice": ${data.totalPrice},
    "totalDays": ${data.totalDays},
    "monthlySavings": ${data.monthlySavings || 0},
    "expectedROIMonths": ${Math.ceil(data.totalPrice / (data.monthlySavings || 1))}
  },
  "terms": [
    "תנאי תשלום: 50% במקדמה, 50% בסיום",
    "תוקף ההצעה: 30 ימים מתאריך שליחה",
    "אחריות: 3 חודשי תמיכה מלאה לאחר יישום"
  ],
  "nextSteps": [
    "סקירת ההצעה ושאלות הבהרה",
    "תיאום פגישת קיק-אוף",
    "חתימה על הסכם",
    "תשלום מקדמה והתחלת עבודה"
  ]
}
\`\`\`

**חשוב מאוד:**
1. אל תשנה את המחירים או זמני היישום - השתמש בערכים המדויקים שסופקו
2. התייחס ישירות לנתונים של החברה (למשל: "כיוון שיש לכם X לידים בחודש...")
3. עבור כל שירות: הסבר ממוקד למה הוא רלוונטי דווקא ללקוח הזה (לא תיאור גנרי)
4. שמור על טון מקצועי אך חברותי
5. החזר **רק** את ה-JSON בלי שום טקסט נוסף לפני או אחרי`;

  // ✅ NEW: Add regeneration instructions if provided
  if (regenerationInstructions && regenerationInstructions.length > 0) {
    const instructionsText = regenerationInstructions
      .map((instruction, i) => `${i + 1}. ${instruction}`)
      .join('\n');

    return basePrompt + `

**הנחיות נוספות מהמשתמש (בקשות שיפור):**
${instructionsText}

**חשוב:** שלב את ההנחיות הנוספות בתוכן ההצעה. אלו בקשות ממשתמש שלא היה מרוצה מהגרסה הקודמת.`;
  }

  return basePrompt;
}

/**
 * Parse AI response (extract JSON from markdown if needed)
 */
function parseAIResponse(data: string): any {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = data.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
    const jsonString = jsonMatch ? jsonMatch[1] : data;

    // Parse JSON
    const parsed = JSON.parse(jsonString.trim());

    console.log('[AI Proposal] Successfully parsed response');
    return parsed;

  } catch (error) {
    console.error('[AI Proposal] Failed to parse response:', error);
    console.error('[AI Proposal] Raw data:', data);
    throw new Error('Failed to parse AI response as JSON. AI may have returned invalid format.');
  }
}

/**
 * Validate parsed response structure
 */
function validateParsedResponse(data: any): void {
  const required = ['executiveSummary', 'services', 'financialSummary', 'terms', 'nextSteps'];
  const missing = required.filter(key => !data[key]);

  if (missing.length > 0) {
    throw new Error(`AI response missing required fields: ${missing.join(', ')}`);
  }

  if (!Array.isArray(data.executiveSummary) || data.executiveSummary.length === 0) {
    throw new Error('executiveSummary must be a non-empty array');
  }

  if (!Array.isArray(data.services) || data.services.length === 0) {
    throw new Error('services must be a non-empty array');
  }

  console.log('[AI Proposal] Validation passed');
}

/**
 * Sanitize module data (remove sensitive PII if needed)
 */
function sanitizeModuleData(moduleData: any): any {
  if (!moduleData) return {};

  // Create a copy
  const sanitized = { ...moduleData };

  // Remove any sensitive fields (add more as needed)
  delete sanitized.contactEmail;
  delete sanitized.contactPhone;
  delete sanitized.personalNotes;

  return sanitized;
}
```

**Verification:**

```bash
# Check for syntax errors
npm run build:typecheck

# Test import
# Add this to any file temporarily:
# import { generateAIProposal } from './utils/aiProposalGenerator';
```

---

### Step 2.2: Make AIService.callAI Public

**File: `src/services/AIService.ts`**

**Location:** Line 203 (the `callAI` method)

**Change from:**

```typescript
// Call AI API based on provider
private async callAI(prompt: string): Promise<AIResponse> {
```

**Change to:**

```typescript
// Call AI API based on provider
// Made public to allow direct use by aiProposalGenerator
async callAI(prompt: string): Promise<AIResponse> {
```

**Verification:**

```bash
npm run build:typecheck
```

---

## Phase 3: Preview Modal Component (1.5 hours)

### Step 3.1: Create Preview Modal Component

**File: `src/components/Modules/Proposal/AIProposalPreviewModal.tsx` (NEW FILE)**

**Full file content:**

```typescript
import React, { useState } from 'react';
import { X, Send, FileText, RefreshCw, MessageSquare, History } from 'lucide-react';
import { AIProposalData } from '../../../types/proposal';

interface AIProposalPreviewModalProps {
  aiProposal: AIProposalData;
  onClose: () => void;
  onSend: () => void;
  onDownload: () => void;
  onRegenerate: (newInstruction?: string) => void;
  isProcessing?: boolean;
}

export const AIProposalPreviewModal: React.FC<AIProposalPreviewModalProps> = ({
  aiProposal,
  onClose,
  onSend,
  onDownload,
  onRegenerate,
  isProcessing = false,
}) => {
  // ✅ NEW: State for regeneration instruction
  const [regenerationInstruction, setRegenerationInstruction] = useState('');
  const [showInstructionInput, setShowInstructionInput] = useState(false);

  if (!aiProposal.sections) {
    return null;
  }

  const { sections } = aiProposal;
  const regenerationCount = aiProposal.regenerationCount || 0;
  const hasHistory = aiProposal.regenerationHistory && aiProposal.regenerationHistory.length > 0;

  const handleRegenerate = () => {
    const instruction = regenerationInstruction.trim();
    if (instruction) {
      onRegenerate(instruction);
      setRegenerationInstruction(''); // Clear after use
    } else {
      onRegenerate(); // Regenerate without new instruction
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">תצוגה מקדימה - הצעת מחיר</h2>
              <p className="text-sm text-gray-500 mt-1">
                נוצר באמצעות AI • {aiProposal.model || 'AI Model'}
                {regenerationCount > 0 && ` • גרסה ${regenerationCount}`}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="סגור"
            >
              <X size={24} />
            </button>
          </div>

          {/* ✅ NEW: Regeneration History Badge */}
          {hasHistory && (
            <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
              <History size={14} />
              <span>נוצרה מחדש {regenerationCount} פעמים</span>
              <button
                onClick={() => setShowInstructionInput(!showInstructionInput)}
                className="mr-auto text-blue-600 hover:text-blue-700 font-medium"
              >
                {showInstructionInput ? 'הסתר הנחיות' : 'הצג הנחיות'}
              </button>
            </div>
          )}

          {/* ✅ NEW: Show regeneration history */}
          {showInstructionInput && hasHistory && (
            <div className="mt-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">הנחיות קודמות:</h4>
              <ul className="space-y-2">
                {aiProposal.regenerationHistory!.map((item, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-blue-600 font-semibold">{i + 1}.</span>
                    <span>{item.instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8" dir="rtl">
          {/* Executive Summary */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-blue-600 rounded"></div>
              <h3 className="text-xl font-bold text-blue-600">תקציר מנהלים</h3>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              {sections.executiveSummary.map((para: string, i: number) => (
                <p key={i} className="mb-3 text-gray-700 leading-relaxed last:mb-0">
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-purple-600 rounded"></div>
              <h3 className="text-xl font-bold text-purple-600">פירוט שירותים</h3>
            </div>
            <div className="space-y-4">
              {sections.services.map((service: any, i: number) => (
                <div
                  key={i}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-bold text-lg mb-3 text-gray-900 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full text-sm">
                      {i + 1}
                    </span>
                    {service.titleHe}
                  </h4>

                  <div className="mb-3 bg-white rounded-lg p-4 border-l-4 border-purple-400">
                    <span className="font-semibold text-sm text-purple-700 flex items-center gap-1 mb-2">
                      💡 למה זה רלוונטי לך
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed">{service.whyRelevantHe}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border-l-4 border-blue-400">
                    <span className="font-semibold text-sm text-blue-700 flex items-center gap-1 mb-2">
                      📋 מה כלול
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed">{service.whatIncludedHe}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-green-600 rounded"></div>
              <h3 className="text-xl font-bold text-green-600">סיכום כספי</h3>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <span className="text-xs text-gray-600 block mb-1">מחיר כולל (ללא מע"מ)</span>
                  <p className="text-2xl font-bold text-green-600">
                    ₪{sections.financialSummary.totalPrice.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <span className="text-xs text-gray-600 block mb-1">זמן יישום</span>
                  <p className="text-2xl font-bold text-blue-600">
                    {sections.financialSummary.totalDays} ימים
                  </p>
                </div>
                {sections.financialSummary.monthlySavings && sections.financialSummary.monthlySavings > 0 && (
                  <>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <span className="text-xs text-gray-600 block mb-1">חיסכון חודשי</span>
                      <p className="text-xl font-bold text-emerald-600">
                        ₪{sections.financialSummary.monthlySavings.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <span className="text-xs text-gray-600 block mb-1">החזר השקעה</span>
                      <p className="text-xl font-bold text-orange-600">
                        {sections.financialSummary.expectedROIMonths} חודשים
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gray-600 rounded"></div>
              <h3 className="text-xl font-bold text-gray-600">תנאים</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <ul className="space-y-2">
                {sections.terms.map((term: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Next Steps */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-indigo-600 rounded"></div>
              <h3 className="text-xl font-bold text-indigo-600">השלבים הבאים</h3>
            </div>
            <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
              <ol className="space-y-3">
                {sections.nextSteps.map((step: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex items-center justify-center w-6 h-6 bg-indigo-600 text-white rounded-full text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="mt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-6 rounded-b-xl">
          {/* ✅ NEW: Regeneration instruction input */}
          <div className="mb-4 bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={16} className="text-purple-600" />
              <h4 className="text-sm font-semibold text-gray-700">רוצה לשפר משהו?</h4>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              הוסף הנחיות ספציפיות ליצירה מחדש (אופציונלי)
            </p>
            <textarea
              value={regenerationInstruction}
              onChange={(e) => setRegenerationInstruction(e.target.value)}
              placeholder="למשל: הדגש יותר את החיסכון בזמן, הוסף דוגמאות קונקרטיות, שפר את הניסוח של השירות השני..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
              rows={2}
              dir="rtl"
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 טיפ: ההנחיות יצטברו עם כל יצירה מחדש. אין הגבלה על מספר הניסיונות.
            </p>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handleRegenerate}
              disabled={isProcessing}
              className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
            >
              <RefreshCw size={20} className={isProcessing ? 'animate-spin' : ''} />
              {isProcessing ? 'מייצר...' : regenerationInstruction.trim() ? 'ייצר מחדש עם הנחיות' : 'ייצר מחדש'}
            </button>

            <div className="flex gap-3">
              <button
                onClick={onDownload}
                disabled={isProcessing}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <FileText size={20} />
                הורד PDF
              </button>
              <button
                onClick={onSend}
                disabled={isProcessing}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-semibold"
              >
                <Send size={20} />
                שלח ללקוח
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

**Verification:**

```bash
npm run build:typecheck
```

---

## Phase 4: ProposalModule UI Updates (2.5 hours)

### Step 4.1: Add State Management

**File: `src/components/Modules/Proposal/ProposalModule.tsx`**

**Location:** After line 83 (after existing state declarations)

**Add these imports at the top:**

```typescript
import { Sparkles, Pencil, Send } from 'lucide-react'; // Add these to existing imports
import { generateAIProposal } from '../../../utils/aiProposalGenerator';
import { AIProposalPreviewModal } from './AIProposalPreviewModal';
import { AIProposalData } from '../../../types/proposal';
```

**Add new state variables (after line 103):**

```typescript
// ✅ NEW: AI Proposal Generation State
const [pmNote, setPmNote] = useState<string>('');
const [isGeneratingAI, setIsGeneratingAI] = useState(false);
const [showPreviewModal, setShowPreviewModal] = useState(false);
const [aiProposal, setAiProposal] = useState<AIProposalData | null>(null);
const [regenerationInstructions, setRegenerationInstructions] = useState<string[]>([]);
```

---

### Step 4.2: Load Existing Data

**Location:** After line 165 (end of first useEffect)

**Add this useEffect:**

```typescript
// ✅ NEW: Load PM note and AI proposal from existing data
useEffect(() => {
  const existingProposal = currentMeeting?.modules?.proposal;
  if (existingProposal) {
    if (existingProposal.pmNote) {
      setPmNote(existingProposal.pmNote);
    }
    if (existingProposal.aiProposal) {
      setAiProposal(existingProposal.aiProposal);
      // Load regeneration history if exists
      if (existingProposal.aiProposal.regenerationHistory) {
        const instructions = existingProposal.aiProposal.regenerationHistory.map(h => h.instruction);
        setRegenerationInstructions(instructions);
      }
    }
  }
}, [currentMeeting?.modules?.proposal]);
```

---

### Step 4.3: Add AI Generation Handler

**Location:** After line 395 (after handleDownloadPDF function)

**Add this function:**

```typescript
// ✅ NEW: Handle AI proposal generation
const handleGenerateProposal = async (additionalInstruction?: string) => {
  console.log('[ProposalModule] Starting AI proposal generation...');
  setIsGeneratingAI(true);

  try {
    // Validate we have services
    const servicesForProposal = selectedServices.filter(s => s.selected);
    if (servicesForProposal.length === 0) {
      alert('❌ אנא בחר לפחות שירות אחד לפני יצירת הצעה');
      setIsGeneratingAI(false);
      return;
    }

    // ✅ NEW: Accumulate regeneration instructions
    let currentInstructions = [...regenerationInstructions];
    if (additionalInstruction?.trim()) {
      currentInstructions.push(additionalInstruction.trim());
      setRegenerationInstructions(currentInstructions);
    }

    // Generate AI proposal
    console.log('[ProposalModule] Calling generateAIProposal...', {
      instructionsCount: currentInstructions.length,
    });

    const result = await generateAIProposal(
      currentMeeting!,
      servicesForProposal,
      pmNote,
      currentInstructions.length > 0 ? currentInstructions : undefined,
      aiProposal?.regenerationCount || 0
    );

    console.log('[ProposalModule] AI generation result:', result.status);
    setAiProposal(result);

    // Save to meeting store
    const proposalData = currentMeeting?.modules?.proposal || {};
    updateModule('proposal', {
      ...proposalData,
      pmNote,
      aiProposal: result,
    });

    // Handle result
    if (result.status === 'success') {
      console.log('[ProposalModule] AI generation successful, showing preview...');
      setShowPreviewModal(true);
    } else {
      // AI failed - show error and offer fallback
      const errorMsg = result.error || 'שגיאה לא ידועה';
      const shouldFallback = window.confirm(
        `⚠️ יצירת הצעה עם AI נכשלה.\n\nשגיאה: ${errorMsg}\n\nהאם להמשיך עם הצעה סטנדרטית?`
      );

      if (shouldFallback) {
        console.log('[ProposalModule] User chose fallback, downloading standard PDF...');
        await handleDownloadPDF();
      }
    }
  } catch (error) {
    console.error('[ProposalModule] AI generation error:', error);
    const errorMsg = error instanceof Error ? error.message : 'שגיאה לא ידועה';

    const shouldFallback = window.confirm(
      `❌ שגיאה ביצירת הצעה.\n\nשגיאה: ${errorMsg}\n\nהאם להמשיך עם הצעה סטנדרטית?`
    );

    if (shouldFallback) {
      await handleDownloadPDF();
    }
  } finally {
    setIsGeneratingAI(false);
  }
};

// ✅ NEW: Handle regenerate from preview modal with optional new instruction
const handleRegenerateProposal = async (newInstruction?: string) => {
  setShowPreviewModal(false);
  await handleGenerateProposal(newInstruction);
};
```

---

### Step 4.4: Add PM Note UI

**Location:** Find line 942 (the "Total Summary" section header)

**Insert BEFORE the Total Summary section:**

```typescript
{/* ✅ NEW: PM Note Section */}
<div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6 mb-6 border-2 border-amber-300 shadow-sm">
  <div className="flex items-center gap-3 mb-3">
    <div className="p-2 bg-amber-500 rounded-lg">
      <Pencil className="w-5 h-5 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800">הערת מנהל פרויקט</h3>
  </div>
  <p className="text-sm text-gray-600 mb-3">
    הוסף הקשר, הערות או פרטים נוספים שיעזרו ל-AI ליצור הצעה מותאמת יותר עבור הלקוח
  </p>
  <textarea
    value={pmNote}
    onChange={(e) => setPmNote(e.target.value)}
    placeholder="למשל: הלקוח מדגיש צורך דחוף באוטומציה של תהליכי מכירות. יש להם צוות קטן (5 אנשים) ועומס עבודה גבוה. חשוב להדגיש חיסכון בזמן..."
    className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none bg-white"
    rows={4}
    dir="rtl"
  />
  <p className="text-xs text-gray-500 mt-2">
    💡 טיפ: ככל שתספק יותר הקשר, כך ההצעה תהיה יותר מותאמת אישית
  </p>
</div>
```

---

### Step 4.5: Replace CTA Buttons

**Location:** Find lines 1039-1075 (the two buttons: "שלח הצעת מחיר ללקוח" and "הורד PDF")

**Replace the entire button section with:**

```typescript
{/* ✅ NEW: Single Generate Proposal Button */}
<button
  onClick={handleGenerateProposal}
  disabled={isGeneratingAI || cartServices.length === 0}
  className="px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-3 font-semibold text-lg"
>
  {isGeneratingAI ? (
    <>
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      <span>מייצר הצעת מחיר...</span>
    </>
  ) : (
    <>
      <Sparkles className="w-6 h-6" />
      <span>ייצר הצעת מחיר</span>
    </>
  )}
</button>

{/* Keep the Save button */}
<button
  onClick={handleSaveProposal}
  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
>
  <Check className="w-5 h-5" />
  שמור והשלם שלב 1
</button>
```

---

### Step 4.6: Add Preview Modal

**Location:** At the very end of the component, just before the closing `</div>` tag (around line 1255)

**Add:**

```typescript
{/* ✅ NEW: AI Proposal Preview Modal */}
{showPreviewModal && aiProposal && (
  <AIProposalPreviewModal
    aiProposal={aiProposal}
    onClose={() => setShowPreviewModal(false)}
    onSend={async () => {
      setShowPreviewModal(false);
      await handleSendProposal();
    }}
    onDownload={async () => {
      setShowPreviewModal(false);
      await handleDownloadPDF();
    }}
    onRegenerate={handleRegenerateProposal}
    isProcessing={isGeneratingPDF || isGeneratingAI}
  />
)}
```

**Verification:**

```bash
npm run build:typecheck
npm run dev
# Visit http://localhost:5176 and navigate to Proposal module
```

---

## Phase 5: PDF Template Updates (1 hour)

### Step 5.1: Update Executive Summary Section

**File: `src/components/PDF/ProposalHTMLTemplate.tsx`**

**Location:** Lines 117-126 (Executive Summary section)

**Replace with:**

```typescript
<h2 style={{ color: COMPANY_BRANDING.secondaryColor, marginTop: '30px', marginBottom: '15px' }}>
  תקציר מנהלים
</h2>

{/* ✅ NEW: Use AI content if available, otherwise fallback to static */}
{proposalData.aiProposal?.sections?.executiveSummary ? (
  <>
    {proposalData.aiProposal.sections.executiveSummary.map((para, i) => (
      <p key={i} style={{ fontSize: '11px', lineHeight: '1.8', marginBottom: '10px' }}>
        {para}
      </p>
    ))}
  </>
) : (
  <p style={{ fontSize: '11px', lineHeight: '1.8' }}>
    לאחר ניתוח מעמיק של תהליכי העבודה שלכם, זיהינו {proposalData.summary.totalServices} פתרונות
    אוטומציה ו-AI. ההשקעה הכוללת: {formatPrice(proposalData.totalPrice)}
    {proposalData.monthlySavings > 0 &&
      `, שיחסכו לכם ${formatPrice(proposalData.monthlySavings)} בחודש עם החזר השקעה תוך ${proposalData.expectedROIMonths} חודשים`}
    .
  </p>
)}
```

---

### Step 5.2: Update Service Details Section

**Location:** Lines 170-210 (Service details loop)

**Replace the service mapping section with:**

```typescript
{services.map((service, index) => {
  // ✅ NEW: Find AI-generated content for this service
  const aiServiceData = proposalData.aiProposal?.sections?.services?.find(
    s => s.serviceId === service.id
  );

  return (
    <div key={service.id} style={{ background: '#fafbfc', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '20px', margin: '15px 0' }}>
      <div style={{ color: COMPANY_BRANDING.primaryColor, fontSize: '16px', fontWeight: '700', marginBottom: '12px', paddingBottom: '8px', borderBottom: `2px solid ${COMPANY_BRANDING.primaryColor}` }}>
        {index + 1}. {service.nameHe}
      </div>

      {/* ✅ Use AI content if available */}
      <div style={{ marginBottom: '12px' }}>
        <p style={{ fontWeight: '600', marginBottom: '5px' }}>💡 למה זה רלוונטי לך:</p>
        <p style={{ paddingRight: '15px' }}>
          {aiServiceData?.whyRelevantHe || service.reasonSuggestedHe}
        </p>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <p style={{ fontWeight: '600', marginBottom: '5px' }}>📋 מה זה כולל:</p>
        <p style={{ paddingRight: '15px' }}>
          {aiServiceData?.whatIncludedHe || service.descriptionHe}
        </p>
      </div>

      {service.notes && (
        <div style={{ marginBottom: '12px' }}>
          <p style={{ color: '#666' }}>💬 הערה: {service.notes}</p>
        </div>
      )}

      <div style={{ marginTop: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <p style={{ fontSize: '11px', color: '#666' }}>מחיר בסיס (כבר מופחת ב-30%, ללא מע"מ):</p>
          <p style={{ fontWeight: '700', color: COMPANY_BRANDING.secondaryColor }}>
            {formatPrice(service.customPrice || service.basePrice)}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '11px', color: '#666' }}>מחיר סופי כולל מע"מ (18%):</p>
          <p style={{ fontWeight: '700', color: COMPANY_BRANDING.primaryColor }}>
            {formatPrice((service.customPrice || service.basePrice) * 1.18)}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <p style={{ fontSize: '11px', color: '#666' }}>⏱️ זמן יישום:</p>
          <p style={{ fontSize: '11px', color: '#666' }}>{Math.max(1, (service.customDuration || service.estimatedDays || 0) - 1)} ימים</p>
        </div>
      </div>
    </div>
  );
})}
```

**Verification:**

```bash
npm run build:typecheck
```

---

## Phase 6: Testing (3-4 hours)

### Test Plan Checklist

#### 6.1 Environment Setup Tests

**Test Case 1: AI Disabled**

```bash
# In .env
VITE_ENABLE_AI_FEATURES=false
```

**Expected:**
- ✅ Generate button should show
- ✅ Clicking it should immediately fall back to standard PDF
- ✅ No AI calls made
- ✅ Console shows: `[AI Proposal] AI service not available`

---

**Test Case 2: AI Enabled but Invalid API Key**

```bash
# In .env
VITE_ENABLE_AI_FEATURES=true
VITE_AI_API_KEY=invalid-key
```

**Expected:**
- ✅ Generate button works
- ✅ API call fails with 401/403 error
- ✅ User sees error popup with fallback option
- ✅ Fallback to standard PDF works

---

**Test Case 3: AI Enabled with Valid Key**

```bash
# In .env
VITE_ENABLE_AI_FEATURES=true
VITE_AI_API_KEY=your-valid-key
VITE_AI_PROVIDER=openai
VITE_AI_MODEL=gpt-4
```

**Expected:**
- ✅ Generate button works
- ✅ Shows "מייצר הצעת מחיר..." spinner
- ✅ Preview modal opens after 10-30 seconds
- ✅ Preview shows AI-generated content

---

#### 6.2 UI/UX Tests

**Test Case 4: PM Note Persistence**

1. Enter PM note: "טסט - הלקוח צריך פתרון דחוף"
2. Click "שמור והשלם שלב 1"
3. Navigate away
4. Come back to proposal page

**Expected:**
- ✅ PM note still shows in textarea
- ✅ Data saved in `meeting.modules.proposal.pmNote`

---

**Test Case 5: No Services Selected**

1. Uncheck all services
2. Click "ייצר הצעת מחיר"

**Expected:**
- ✅ Alert: "אנא בחר לפחות שירות אחד"
- ✅ No AI call made

---

**Test Case 6: Preview Modal Actions**

1. Generate proposal with AI
2. Preview modal opens
3. Test all buttons:
   - Close (X) → Modal closes
   - ייצר מחדש → Regenerates proposal
   - הורד PDF → Downloads PDF, modal closes
   - שלח ללקוח → Opens WhatsApp + Gmail, modal closes

**Expected:**
- ✅ All buttons work as described
- ✅ Modal can't be closed while processing

---

#### 6.3 AI Generation Tests

**Test Case 7: Successful AI Generation**

1. Fill in at least 2 modules (overview, leadsAndSales)
2. Select 3-5 services
3. Add PM note (optional)
4. Click "ייצר הצעת מחיר"

**Expected:**
- ✅ Loading state shows
- ✅ API call made (check Network tab)
- ✅ Preview modal opens after 10-30 seconds
- ✅ Executive summary has 3-4 paragraphs
- ✅ Each service has custom `whyRelevantHe` and `whatIncludedHe`
- ✅ Financial summary matches selected services

---

**Test Case 8: AI Timeout/Error**

Simulate by temporarily breaking API key:

**Expected:**
- ✅ Error caught gracefully
- ✅ User sees error message with fallback option
- ✅ Console shows error details
- ✅ No app crash

---

**Test Case 9: PM Note Impact on Content**

Generate two proposals:
1. Without PM note
2. With detailed PM note: "הלקוח עובד בתחום הבריאות, יש להם 50 עובדים, צריכים פתרון שעומד בתקנות HIPAA"

**Expected:**
- ✅ Second proposal should reference PM note content
- ✅ Content should be more personalized

---

#### 6.4 PDF Generation Tests

**Test Case 10: PDF with AI Content**

1. Generate AI proposal
2. Click "הורד PDF" from preview

**Expected:**
- ✅ PDF downloads
- ✅ Executive summary uses AI paragraphs (not static text)
- ✅ Service descriptions use AI content
- ✅ All Hebrew text renders correctly (RTL)
- ✅ Prices and numbers accurate

---

**Test Case 11: PDF without AI (Fallback)**

1. Disable AI or let it fail
2. Generate standard PDF

**Expected:**
- ✅ PDF still generates
- ✅ Uses static template text
- ✅ All data still present
- ✅ No errors

---

#### 6.5 Data Persistence Tests

**Test Case 12: AI Proposal Saved in Store**

1. Generate AI proposal
2. Open DevTools → Application → LocalStorage
3. Find key: `discovery_meeting_store`
4. Search for `aiProposal`

**Expected:**
- ✅ `aiProposal` object exists in `meeting.modules.proposal`
- ✅ Contains `status`, `sections`, `model`, `createdAt`
- ✅ Survives page refresh

---

**Test Case 13: Multiple Regenerations with Instructions**

1. Generate proposal
2. In preview modal, add instruction: "הדגש יותר את החיסכון בזמן"
3. Click "ייצר מחדש"
4. Add another instruction: "הוסף דוגמאות ספציפיות"
5. Click "ייצר מחדש" again
6. Repeat 5+ times

**Expected:**
- ✅ Each generation uses accumulated instructions
- ✅ No limit on regeneration attempts
- ✅ Instructions build on each other
- ✅ Only latest AI proposal stored
- ✅ Usage tokens tracked (if available)
- ✅ Previous instructions visible in history

---

#### 6.6 Edge Cases

**Test Case 14: Empty Module Data**

1. Create new meeting with minimal data
2. Select services
3. Generate proposal

**Expected:**
- ✅ AI still generates proposal
- ✅ Content acknowledges limited data
- ✅ No crash or errors

---

**Test Case 15: Very Long PM Note (>2000 chars)**

1. Paste 3000 character PM note
2. Generate proposal

**Expected:**
- ✅ Note should be truncated to 1000 chars in prompt
- ✅ Or AI handles gracefully
- ✅ No token limit errors

---

**Test Case 16: Special Characters in PM Note**

PM Note: `זה טסט עם "מרכאות" ו'גרש' ו-מקף ו/סלש`

**Expected:**
- ✅ Characters handled correctly
- ✅ No JSON parsing errors
- ✅ Text appears correctly in preview

---

### Testing Script

**File: `scripts/test-ai-proposal.js` (NEW FILE - Optional)**

```javascript
// Quick test script to validate AI proposal generation
// Run with: node scripts/test-ai-proposal.js

import { generateAIProposal } from '../src/utils/aiProposalGenerator.js';

const mockMeeting = {
  meetingId: 'test-123',
  clientName: 'חברת טסט בע"מ',
  modules: {
    overview: {
      companyName: 'חברת טסט',
      businessType: 'B2B',
      employeeCount: 50,
    },
    leadsAndSales: {
      leadVolume: 100,
      speedToLead: 120,
    },
    customerService: {
      ticketVolume: 200,
    },
    operations: {},
    systems: {
      currentCRM: 'excel',
    },
    roi: {
      monthlySavings: 15000,
    },
  },
};

const mockServices = [
  {
    id: 'auto-lead-response',
    nameHe: 'מענה אוטומטי ללידים',
    descriptionHe: 'מערכת מענה אוטומטית',
    reasonSuggestedHe: 'זמן תגובה ארוך',
    basePrice: 8000,
    estimatedDays: 10,
  },
];

console.log('🧪 Testing AI Proposal Generation...\n');

generateAIProposal(mockMeeting, mockServices, 'טסט PM note')
  .then((result) => {
    console.log('✅ Test Result:', result.status);
    if (result.status === 'success') {
      console.log('📝 Executive Summary:', result.sections.executiveSummary[0]);
      console.log('💰 Total Price:', result.sections.financialSummary.totalPrice);
    } else {
      console.log('❌ Error:', result.error);
    }
  })
  .catch((error) => {
    console.error('❌ Test Failed:', error.message);
  });
```

---

## Phase 7: Deployment (30 minutes)

### Pre-Deployment Checklist

**Step 7.1: Environment Variables**

Ensure production `.env` has:

```bash
VITE_ENABLE_AI_FEATURES=true
VITE_AI_PROVIDER=openai  # or anthropic
VITE_AI_API_KEY=your-production-key
VITE_AI_MODEL=gpt-4
VITE_AI_MAX_TOKENS=4000
VITE_AI_TEMPERATURE=0.7
```

---

**Step 7.2: Build and Test**

```bash
# Clean build
rm -rf dist/
npm run build

# Preview production build
npm run preview

# Test on preview server
# Visit all proposal flows
```

---

**Step 7.3: Git Commit**

```bash
git add .
git commit -m "feat: Add AI-driven proposal generation with PM note

- Add pmNote and aiProposal fields to ProposalData type
- Create aiProposalGenerator utility with smart prompt building
- Make AIService.callAI public for direct use
- Add AIProposalPreviewModal component for preview/edit
- Replace two CTA buttons with single 'Generate Proposal' button
- Add PM note textarea above proposal summary
- Update PDF template to prefer AI content over static
- Add graceful fallback to static generation on AI failure
- Add comprehensive error handling and user feedback

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

**Step 7.4: Deploy**

```bash
# If using Vercel
vercel --prod

# Or push to main to trigger deployment
git push origin feature/ai-proposal-generation
# Create PR, review, merge to main
```

---

**Step 7.5: Post-Deployment Verification**

1. Visit production URL
2. Create test meeting
3. Navigate to Proposal module
4. Test full flow:
   - Add PM note
   - Select services
   - Generate AI proposal
   - Preview modal
   - Download PDF
   - Verify PDF contains AI content

**Expected:**
- ✅ All features work on production
- ✅ AI calls succeed
- ✅ PDFs generate correctly
- ✅ No console errors

---

## Rollback Plan

### If Something Goes Wrong

**Quick Rollback (5 minutes):**

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback in Vercel dashboard
# Deployments → Previous Deployment → Promote to Production
```

---

**Disable AI Feature (1 minute):**

```bash
# In production .env
VITE_ENABLE_AI_FEATURES=false

# Redeploy
vercel --prod
```

This will:
- ✅ Disable AI generation
- ✅ Fall back to standard PDF generation
- ✅ Keep all other functionality working

---

**Partial Rollback (Keep Types, Remove UI):**

If types are fine but UI has issues:

```bash
# Revert just ProposalModule.tsx
git checkout HEAD~1 -- src/components/Modules/Proposal/ProposalModule.tsx

# Commit and deploy
git commit -m "Rollback: Revert ProposalModule UI changes"
git push
```

---

## Success Metrics

### Track These KPIs

**Technical Metrics:**

| Metric | Target | How to Track |
|--------|--------|--------------|
| AI Success Rate | > 95% | Log AI responses (success/fail) |
| AI Response Time | < 30 sec | Track time between API call and response |
| PDF Generation Time | < 5 sec | Track PDF generation duration |
| Error Rate | < 2% | Monitor Sentry or logs |
| Fallback Rate | < 10% | Track fallback to static |

**Business Metrics:**

| Metric | Target | How to Track |
|--------|--------|--------------|
| Proposals Generated | +30% | Compare before/after |
| Time to Generate | -80% | User surveys |
| Proposal Quality | 4.5/5 | User feedback |
| Client Satisfaction | +20% | Client surveys |

---

### Monitoring & Logging

**Add to `aiProposalGenerator.ts`:**

```typescript
// At start of generateAIProposal:
console.log('[AI Proposal] Generation started', {
  meetingId: meeting.meetingId,
  servicesCount: selectedServices.length,
  hasPmNote: !!pmNote,
  timestamp: new Date().toISOString(),
});

// On success:
console.log('[AI Proposal] Generation succeeded', {
  meetingId: meeting.meetingId,
  duration: endTime - startTime,
  tokensUsed: result.usage?.totalTokens,
});

// On error:
console.error('[AI Proposal] Generation failed', {
  meetingId: meeting.meetingId,
  error: error.message,
  duration: endTime - startTime,
});
```

---

## FAQ & Troubleshooting

### Q1: AI returns invalid JSON

**Symptom:** `Failed to parse AI response as JSON`

**Solution:**
- Check `parseAIResponse` function is extracting from code blocks
- Try different AI model (gpt-4 more reliable than gpt-3.5-turbo)
- Adjust system prompt to emphasize JSON-only output

---

### Q2: Hebrew text appears broken in PDF

**Symptom:** Hebrew shows as boxes or RTL issues

**Solution:**
- Verify Rubik font is loaded (check Network tab)
- Check `dir="rtl"` on PDF elements
- Ensure `fontFamily: "'Rubik', sans-serif"` in styles

---

### Q3: AI generates generic content

**Symptom:** Content doesn't reference specific client data

**Solution:**
- Add more context to PM note
- Ensure modules have rich data
- Adjust user prompt to emphasize data usage
- Example: "התייחס ישירות לנתונים: יש להם X לידים בחודש..."

---

### Q4: Modal doesn't close

**Symptom:** Preview modal stuck open

**Solution:**
- Check `isProcessing` state is reset after actions
- Verify button handlers call `setShowPreviewModal(false)`
- Check for JavaScript errors in console

---

### Q5: PM note not saving

**Symptom:** PM note disappears after refresh

**Solution:**
- Verify `updateModule('proposal', { pmNote })` is called
- Check localStorage has `pmNote` field
- Ensure Zustand persist middleware is working

---

## Additional Resources

### Useful Commands

```bash
# Check TypeScript errors
npm run build:typecheck

# Run dev server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Check bundle size
npm run build -- --analyze

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### File Structure Reference

```
src/
├── types/
│   └── proposal.ts                    # ✅ Modified - Added AIProposalData types
├── services/
│   └── AIService.ts                   # ✅ Modified - Made callAI public
├── utils/
│   └── aiProposalGenerator.ts         # ✅ NEW - Core AI logic
├── components/
│   ├── Modules/
│   │   └── Proposal/
│   │       ├── ProposalModule.tsx     # ✅ Modified - UI changes
│   │       └── AIProposalPreviewModal.tsx  # ✅ NEW - Preview modal
│   └── PDF/
│       └── ProposalHTMLTemplate.tsx   # ✅ Modified - Use AI content
└── config/
    └── companyBranding.ts             # No changes
```

---

## Next Steps After Implementation

### Phase 2: Analytics & Optimization

1. **Add Analytics:**
   - Track AI success/failure rates
   - Measure proposal conversion rates
   - A/B test with/without AI

2. **Cost Optimization:**
   - Implement caching for similar prompts
   - Rate limiting per user
   - Monitor token usage

3. **Content Improvement:**
   - Collect user feedback on AI quality
   - Refine prompts based on feedback
   - Add ability to edit AI content before finalizing

---

### Phase 3: Advanced Features

1. **Multi-language Support:**
   - English proposals for international clients
   - Detect client language preference

2. **Template Library:**
   - Save successful proposals as templates
   - Industry-specific prompt templates

3. **Learning System:**
   - Track which proposals get accepted
   - Fine-tune prompts based on success patterns

---

## Support & Contacts

**Technical Issues:**
- Check CLAUDE.md for codebase guidance
- Review AI_PROPOSAL_IMPLEMENTATION_GUIDE.md (this file)

**AI Provider Issues:**
- OpenAI: https://platform.openai.com/docs
- Anthropic: https://docs.anthropic.com

---

## Conclusion

This implementation adds significant value to your proposal generation workflow while maintaining backward compatibility and providing graceful fallbacks. The AI-powered system will:

- ✅ Save 5-10 minutes per proposal
- ✅ Improve proposal personalization
- ✅ Maintain professional quality
- ✅ Scale effortlessly with your business

**Estimated ROI:**
- Development time: ~18 hours
- Time saved per proposal: 8 minutes
- Break-even: ~135 proposals
- With 10 proposals/week: ROI in ~3 months

---

**Document Version:** 1.0
**Last Updated:** 2025-10-10
**Author:** Claude Code Implementation Guide

---

## Appendix A: Environment Variables Reference

```bash
# AI Configuration
VITE_ENABLE_AI_FEATURES=true                    # Enable/disable AI features
VITE_AI_PROVIDER=openai                         # openai | anthropic | cohere
VITE_AI_API_KEY=sk-...                          # Your API key
VITE_AI_MODEL=gpt-4                             # Model to use
VITE_AI_MAX_TOKENS=4000                         # Max tokens per request
VITE_AI_TEMPERATURE=0.7                         # Creativity (0-1)

# Existing Variables (unchanged)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ENABLE_ZOHO_SYNC=true
```

---

## Appendix B: API Cost Estimates

**OpenAI GPT-4 (Recommended):**
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens
- Average proposal: ~3K input + 2K output = $0.21/proposal
- 100 proposals/month: ~$21/month

**Anthropic Claude 3 Opus:**
- Input: $0.015 per 1K tokens
- Output: $0.075 per 1K tokens
- Average proposal: ~3K input + 2K output = $0.195/proposal
- 100 proposals/month: ~$19.50/month

**Cost Optimization Tips:**
1. Cache similar prompts (15 min TTL)
2. Use gpt-4-turbo instead of gpt-4 (50% cheaper)
3. Rate limit to prevent abuse
4. Monitor token usage per user

---

## Appendix C: Prompt Engineering Tips

**To improve AI output quality:**

1. **Be specific:**
   ```
   Bad:  "Create a proposal"
   Good: "Create a 3-paragraph executive summary referencing the client's 100 leads/month and 2-hour response time"
   ```

2. **Use examples:**
   Include 1-2 example outputs in system prompt

3. **Constrain format:**
   Require JSON, specify exact field names

4. **Iterate:**
   Test prompts with real data, refine based on output

---

## Appendix D: Unlimited Regeneration Feature

### How It Works

The regeneration feature allows unlimited iterations with cumulative instructions:

**User Journey:**

1. **Initial Generation:**
   - User clicks "ייצר הצעת מחיר"
   - AI generates proposal based on meeting data + PM note
   - Preview modal opens

2. **First Regeneration:**
   - User sees preview, not satisfied
   - Adds instruction: "הדגש יותר את החיסכון בזמן"
   - Clicks "ייצר מחדש עם הנחיות"
   - AI regenerates with original prompt + new instruction

3. **Second Regeneration:**
   - User still not satisfied
   - Adds another instruction: "הוסף דוגמאות קונקרטיות"
   - Clicks "ייצר מחדש עם הנחיות"
   - AI regenerates with original prompt + **both** instructions

4. **N Regenerations:**
   - Process continues indefinitely
   - Each instruction builds on previous ones
   - Instructions visible in history
   - Version number displayed: "גרסה 3", "גרסה 4", etc.

---

### Technical Implementation

**Data Structure:**

```typescript
aiProposal: {
  regenerationCount: 3,
  regenerationHistory: [
    {
      instruction: "הדגש יותר את החיסכון בזמן",
      timestamp: "2025-01-10T14:30:00Z",
      generationNumber: 1
    },
    {
      instruction: "הוסף דוגמאות קונקרטיות",
      timestamp: "2025-01-10T14:35:00Z",
      generationNumber: 2
    },
    {
      instruction: "שפר את הניסוח של השירות השני",
      timestamp: "2025-01-10T14:40:00Z",
      generationNumber: 3
    }
  ]
}
```

**Prompt Construction:**

Each regeneration sends:
```
Base Prompt (meeting data + services + PM note)
+
**הנחיות נוספות מהמשתמש:**
1. הדגש יותר את החיסכון בזמן
2. הוסף דוגמאות קונקרטיות
3. שפר את הניסוח של השירות השני

**חשוב:** שלב את ההנחיות הנוספות בתוכן ההצעה.
```

---

### UI Elements

**Preview Modal Header:**
- Shows version number: "גרסה 3"
- "נוצרה מחדש 3 פעמים" badge
- "הצג הנחיות" toggle to see history

**Regeneration Input:**
- Textarea for new instruction
- Placeholder with examples
- Tip: "ההנחיות יצטברו עם כל יצירה מחדש"
- Button text changes: "ייצר מחדש" vs "ייצר מחדש עם הנחיות"

**History View:**
```
הנחיות קודמות:
1. הדגש יותר את החיסכון בזמן
2. הוסף דוגמאות קונקרטיות
3. שפר את הניסוח של השירות השני
```

---

### Benefits

1. **No Limits:** User can iterate as many times as needed
2. **Cumulative Learning:** Each iteration builds on previous feedback
3. **Full Control:** User guides AI to exact desired output
4. **Transparency:** Full history visible
5. **Fast Iteration:** No need to re-enter all context

---

### Cost Considerations

**Token Usage:**
- Each regeneration costs ~3K-5K tokens
- With accumulated instructions: +100 tokens per instruction
- Example: 5 regenerations = ~20K tokens = $0.60-1.20

**Optimization Tips:**
1. Educate users to be specific in first PM note
2. Show token usage in dev mode
3. Consider soft limits for very high regeneration counts (e.g., warning at 10+)
4. Cache similar prompts (15 min TTL)

---

### Example Use Cases

**Scenario 1: Emphasis Adjustment**
```
Iteration 1: Good, but too technical
Instruction: "פחות טכני, יותר עסקי"

Iteration 2: Better, but needs urgency
Instruction: "הדגש את הדחיפות - הם מאבדים לידים כל יום"

Result: Perfect proposal emphasizing business impact and urgency
```

**Scenario 2: Service-Specific Changes**
```
Iteration 1: General descriptions
Instruction: "עבור שירות האוטומציה של הלידים - הוסף את המספר 100 לידים בחודש"

Iteration 2: More specific
Instruction: "הסבר איך נפתור את בעיית זמן התגובה של 2 שעות"

Result: Highly personalized, data-driven proposal
```

**Scenario 3: Tone Adjustment**
```
Iteration 1: Too formal
Instruction: "טון יותר חברותי ונגיש"

Iteration 2: Better, but add personality
Instruction: "הוסף משפט על הניסיון שלנו עם חברות דומות"

Result: Professional but approachable proposal
```

---

**End of Implementation Guide**
