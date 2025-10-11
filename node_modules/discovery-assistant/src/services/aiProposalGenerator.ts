import { Meeting } from '../types';
import { SelectedService, ProposalSummary } from '../types/proposal';
import { AiProposalDoc, AiProposalJsonSchema, buildDynamicProposalSchema } from '../schemas/aiProposal.schema';
import { callOpenAIThroughProxy } from './openaiProxy';

// System prompt for proposal generation in Hebrew
const buildSystemPrompt = (hasROI: boolean) => {
  let prompt = `אתה מומחה בכתיבת הצעות מחיר מקצועיות לעסקים ישראליים. אתה כותב בעברית בלבד, במקצועיות ובנימה ידידותית.

עקרונות הכתיבה:
- שמור על שפה עסקית מקצועית אך ידידותית ונגישה
- הדגש את הערך העסקי והחיסכון ללקוח
- השתמש במטבע הישראלי (₪) בלבד
- אל תשנה מחירים או משכי זמן - השתמש בנתונים המסופקים בדיוק
- סיכום מנהלים: 3-4 פסקאות קצרות וממוקדות
- התמקד בתוצאות וביתרונות המעשיים ללקוח

דרישות אורך מינימלי (חשוב מאוד):
- כל פסקה בסיכום המנהלים חייבת להכיל לפחות 30 תווים
- כל תיאור שירות (למה רלוונטי / מה כלול) חייב להכיל לפחות 15 תווים
- כל תנאי וצעד הבא חייבים להכיל לפחות 5 תווים
- אל תשאיר שדות ריקים - תמיד ספק תוכן משמעותי

מבנה ההצעה הנדרש:
1. סיכום מנהלים - הסבר מה הבעיה, הפתרון והערך ללקוח
2. פירוט השירותים - מה כלול בכל שירות ומדוע הוא רלוונטי
3. סיכום פיננסי - השקעה כוללת ותקופת החזר (אם רלוונטי)
4. תנאים - תנאי התקשרות ותוקף ההצעה
5. צעדים הבאים - מה הלקוח צריך לעשות הלאה`;

  if (!hasROI) {
    prompt += `\nחשוב: אין לכלול שדות או חישובי ROI בסיכום הפיננסי (monthlySavings, expectedROIMonths).`;
  }

  return prompt;
};

interface ProposalGenerationOptions {
  meeting: Meeting;
  selectedServices: SelectedService[];
  pmNote?: string;
  additionalInstructions?: string;
  model?: string;
}

interface ProposalGenerationResult {
  success: boolean;
  sections?: AiProposalDoc;
  error?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  model?: string;
}

/**
 * AI Proposal Generator using GPT-5 Responses API
 * Generates structured proposal content in Hebrew
 */
export class AIProposalGenerator {
  private static instance: AIProposalGenerator;
  private retryCount = 3;
  private baseDelay = 1000; // 1 second

  static getInstance(): AIProposalGenerator {
    if (!AIProposalGenerator.instance) {
      AIProposalGenerator.instance = new AIProposalGenerator();
    }
    return AIProposalGenerator.instance;
  }

  /**
   * Generate AI proposal content with retry logic and error handling
   */
  async generateProposal(options: ProposalGenerationOptions): Promise<ProposalGenerationResult> {
    const { meeting, selectedServices, pmNote, additionalInstructions, model } = options;

    let lastError: Error | null = null;

    // Get proposal summary early to determine ROI data presence
    const proposalSummary = this.calculateProposalSummary(meeting, selectedServices);
    const hasROI = this.hasROIData(meeting, proposalSummary);

    const systemPrompt = buildSystemPrompt(hasROI);

    // Build user payload
    const userPayload = this.buildUserPayload(meeting, selectedServices, pmNote, proposalSummary);

    // Build messages array
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPayload }
    ];

    // Add regeneration instructions if provided
    let currentAdditionalInstructions = additionalInstructions || '';
    if (hasROI) {
      currentAdditionalInstructions += (currentAdditionalInstructions ? '\n' : '') + 'כלול ROI וחישובי החזר השקעה בסיכום הפיננסי.';
    } else {
      currentAdditionalInstructions += (currentAdditionalInstructions ? '\n' : '') + 'אל תכלול שדות ROI (monthlySavings, expectedROIMonths) בסיכום הפיננסי.';
    }

    if (currentAdditionalInstructions) {
      messages.push({
        role: 'user' as const,
        content: `הוראות נוספות לשיפור ההצעה:\n${currentAdditionalInstructions}`
      });
    }

    // Retry with exponential backoff
    for (let attempt = 0; attempt < this.retryCount; attempt++) {
      try {
        // Use the AI service to call OpenAI Responses API
        const response = await this.callOpenAIResponsesAPI({
          model: model || import.meta.env.VITE_AI_MODEL || 'gpt-5-mini-2025-08-07',
          messages,
          seed: 7,
          max_output_tokens: 1800,
          // Note: temperature not specified - uses model default (1.0 for gpt-5-mini)
          response_format: {
            type: 'json_schema',
            json_schema: buildDynamicProposalSchema(hasROI)
          }
        });

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to generate proposal');
        }

        // Parse and validate the response
        const sections = this.parseAndValidateResponse(response.data);

        if (!sections) {
          throw new Error('Invalid response format from AI - check console for detailed validation errors');
        }

        return {
          success: true,
          sections,
          usage: response.usage,
          model: response.model
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error occurred');
        console.warn(`[AI Proposal] Generation attempt ${attempt + 1} failed:`, lastError.message);

        // Don't retry on rate limits or quotas, but do retry on validation errors 
        // since they might be intermittent
        if (lastError.message.includes('rate limit') ||
            lastError.message.includes('quota')) {
          console.error('[AI Proposal] Rate limit or quota exceeded, stopping retries');
          break;
        }
        
        // For validation errors, retry but log that we're doing so
        if (lastError.message.includes('Invalid response format')) {
          console.log(`[AI Proposal] Validation failed on attempt ${attempt + 1}, will retry...`);
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.retryCount - 1) {
          const delay = this.baseDelay * Math.pow(2, attempt);
          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    console.error('AI proposal generation failed after all retries:', lastError);
    return {
      success: false,
      error: lastError?.message || 'Failed to generate proposal after multiple attempts'
    };
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate the proposal summary including totals and potential savings.
   */
  private calculateProposalSummary(meeting: Meeting, selectedServices: SelectedService[]): ProposalSummary {
    const totals = selectedServices.reduce(
      (acc, service) => ({
        totalPrice: acc.totalPrice + (service.customPrice || service.basePrice),
        totalDays: Math.max(acc.totalDays, service.customDuration || service.estimatedDays)
      }),
      { totalPrice: 0, totalDays: 0 }
    );

    const meetingROI = meeting.modules?.roi;
    const potentialMonthlySavings =
      (typeof meetingROI?.summary?.totalMonthlySaving === 'number' && meetingROI.summary.totalMonthlySaving > 0)
        ? meetingROI.summary.totalMonthlySaving
        : (typeof meetingROI?.estimatedCostSavings === 'number' && meetingROI.estimatedCostSavings > 0)
          ? meetingROI.estimatedCostSavings
          : 0;

    return {
      totalServices: selectedServices.length,
      totalAutomations: selectedServices.filter(s => s.category === 'automations').length,
      totalAIAgents: selectedServices.filter(s => s.category === 'ai_agents').length,
      totalIntegrations: selectedServices.filter(s => s.category === 'integrations').length,
      identifiedProcesses: 0, // This would come from meeting.modules.operations or similar
      potentialMonthlySavings,
      potentialWeeklySavingsHours: 0, // Placeholder for now, can be calculated later if needed
      totalPrice: totals.totalPrice,
      totalDays: totals.totalDays,
    };
  }

  /**
   * Call OpenAI Responses API through proxy
   */
  private async callOpenAIResponsesAPI(params: {
    model: string;
    messages: Array<{ role: 'system' | 'user'; content: string }>;
    seed?: number; // Optional for models that don't support seed
    max_output_tokens: number;
    temperature?: number; // Optional for models that don't support custom temperature
    response_format: {
      type: 'json_schema';
      json_schema: typeof AiProposalJsonSchema;
    };
  }) {
    // Build request body dynamically based on model support
    const requestBody: any = {
      model: params.model,
      messages: params.messages,
      max_tokens: params.max_output_tokens,
      response_format: params.response_format
    };

    // Add seed if supported (most modern models support it)
    if (params.seed !== undefined) {
      requestBody.seed = params.seed;
    }

    // Add temperature only if provided (for models that support custom temperature)
    if (params.temperature !== undefined) {
      requestBody.temperature = params.temperature;
    }

    const response = await callOpenAIThroughProxy(requestBody);

    if (!response.success) {
      throw new Error(response.error || 'OpenAI API call failed');
    }

    return response;
  }

  /**
   * Build user payload for AI generation
   */
  private buildUserPayload(meeting: Meeting, selectedServices: SelectedService[], pmNote?: string, proposalSummary?: ProposalSummary): string {
    // Serialize meeting data
    const meetingData = {
      companyName: meeting.modules.overview.companyName,
      clientName: meeting.clientName,
      modules: meeting.modules,
      painPoints: meeting.painPoints
    };

    // Serialize selected services
    const servicesData = selectedServices.map(service => ({
      id: service.id,
      nameHe: service.nameHe,
      descriptionHe: service.descriptionHe,
      reasonSuggestedHe: service.reasonSuggestedHe,
      basePrice: service.basePrice,
      customPrice: service.customPrice,
      estimatedDays: service.estimatedDays,
      customDuration: service.customDuration
    }));

    // Build comprehensive payload
    const payload = {
      meeting: meetingData,
      selectedServices: servicesData,
      totals: {
        totalPrice: proposalSummary?.totalPrice || 0,
        totalDays: proposalSummary?.totalDays || 0
      },
      proposalSummary: proposalSummary,
      pmNote: pmNote || 'אין הערות מיוחדות'
    };

    return JSON.stringify(payload, null, 2);
  }

  /**
   * Determines if there is sufficient ROI data to include ROI fields in the proposal.
   * Checks multiple potential sources for ROI related savings.
   */
  private hasROIData(meeting: Meeting, proposalSummary?: ProposalSummary): boolean {
    const meetingROI = meeting.modules?.roi;
    const totalMonthlySavingFromMeeting = meetingROI?.summary?.totalMonthlySaving;
    const estimatedCostSavingsFromMeeting = meetingROI?.estimatedCostSavings;
    const potentialMonthlySavingsFromSummary = proposalSummary?.potentialMonthlySavings; // This will now be populated by calculateProposalSummary

    // Consider ROI data present if any of the key fields indicate a positive saving
    return (
      (typeof totalMonthlySavingFromMeeting === 'number' && totalMonthlySavingFromMeeting > 0) ||
      (typeof estimatedCostSavingsFromMeeting === 'number' && estimatedCostSavingsFromMeeting > 0) ||
      (typeof potentialMonthlySavingsFromSummary === 'number' && potentialMonthlySavingsFromSummary > 0)
    );
  }

  /**
   * Sanitize AI response data before validation
   * Cleans up common issues that might cause validation failures
   */
  private sanitizeResponse(parsed: any): any {
    try {
      // Clean executive summary
      if (Array.isArray(parsed.executiveSummary)) {
        parsed.executiveSummary = parsed.executiveSummary
          .map((p: any) => typeof p === 'string' ? p.trim() : '')
          .filter((p: string) => p.length > 0);
      }

      // Clean services
      if (Array.isArray(parsed.services)) {
        parsed.services = parsed.services.map((service: any) => ({
          ...service,
          titleHe: typeof service.titleHe === 'string' ? service.titleHe.trim() : '',
          whyRelevantHe: typeof service.whyRelevantHe === 'string' ? service.whyRelevantHe.trim() : '',
          whatIncludedHe: typeof service.whatIncludedHe === 'string' ? service.whatIncludedHe.trim() : '',
        }));
      }

      // Clean terms
      if (Array.isArray(parsed.terms)) {
        parsed.terms = parsed.terms
          .map((t: any) => typeof t === 'string' ? t.trim() : '')
          .filter((t: string) => t.length > 0);
      }

      // Clean next steps
      if (Array.isArray(parsed.nextSteps)) {
        parsed.nextSteps = parsed.nextSteps
          .map((s: any) => typeof s === 'string' ? s.trim() : '')
          .filter((s: string) => s.length > 0);
      }

      return parsed;
    } catch (error) {
      console.warn('Error sanitizing response, returning as-is:', error);
      return parsed;
    }
  }

  /**
   * Parse and validate AI response with comprehensive error handling
   */
  private parseAndValidateResponse(data: string): AiProposalDoc | null {
    try {
      // Log raw response for debugging
      console.log('[AI Proposal] Raw response received (first 500 chars):', data.substring(0, 500));
      
      // Clean the response data (remove markdown code blocks if present)
      let cleanData = data.trim();
      if (cleanData.startsWith('```json')) {
        cleanData = cleanData.replace(/```json\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleanData);
      console.log('[AI Proposal] JSON parsed successfully');
      
      // Sanitize the parsed response
      const sanitized = this.sanitizeResponse(parsed);
      console.log('[AI Proposal] Response sanitized');

      // Comprehensive validation
      const errors: string[] = [];

      // Validate executive summary
      if (!sanitized.executiveSummary || !Array.isArray(sanitized.executiveSummary)) {
        errors.push('Executive summary must be an array of strings');
      } else if (sanitized.executiveSummary.length < 2 || sanitized.executiveSummary.length > 6) {
        errors.push(`Executive summary must have 2-6 paragraphs (received ${sanitized.executiveSummary.length})`);
      } else {
        // Validate each paragraph with relaxed requirements
        for (let i = 0; i < sanitized.executiveSummary.length; i++) {
          if (typeof sanitized.executiveSummary[i] !== 'string' || sanitized.executiveSummary[i].trim().length < 30) {
            errors.push(`Executive summary paragraph ${i + 1} must have at least 30 characters (received ${sanitized.executiveSummary[i]?.length || 0})`);
          }
        }
      }

      // Validate services array
      if (!sanitized.services || !Array.isArray(sanitized.services)) {
        errors.push('Services must be an array');
      } else if (sanitized.services.length === 0) {
        errors.push('At least one service must be included');
      } else {
        // Validate each service with relaxed requirements
        for (let i = 0; i < sanitized.services.length; i++) {
          const service = sanitized.services[i];
          if (!service.serviceId || typeof service.serviceId !== 'string') {
            errors.push(`Service ${i + 1} must have a valid serviceId`);
          }
          if (!service.titleHe || typeof service.titleHe !== 'string' || service.titleHe.trim().length < 5) {
            errors.push(`Service ${i + 1} must have a valid Hebrew title (received ${service.titleHe?.length || 0} chars)`);
          }
          if (!service.whyRelevantHe || typeof service.whyRelevantHe !== 'string' || service.whyRelevantHe.trim().length < 15) {
            errors.push(`Service ${i + 1} whyRelevant must have at least 15 characters (received ${service.whyRelevantHe?.length || 0})`);
          }
          if (!service.whatIncludedHe || typeof service.whatIncludedHe !== 'string' || service.whatIncludedHe.trim().length < 15) {
            errors.push(`Service ${i + 1} whatIncluded must have at least 15 characters (received ${service.whatIncludedHe?.length || 0})`);
          }
        }
      }

      // Validate financial summary
      if (!sanitized.financialSummary || typeof sanitized.financialSummary !== 'object') {
        errors.push('Financial summary must be an object');
      } else {
        if (typeof sanitized.financialSummary.totalPrice !== 'number' || sanitized.financialSummary.totalPrice <= 0) {
          errors.push(`Financial summary must have valid total price > 0 (received ${sanitized.financialSummary.totalPrice})`);
        }
        if (typeof sanitized.financialSummary.totalDays !== 'number' || sanitized.financialSummary.totalDays <= 0) {
          errors.push(`Financial summary must have valid total days > 0 (received ${sanitized.financialSummary.totalDays})`);
        }
        if (sanitized.financialSummary.monthlySavings !== undefined &&
            (typeof sanitized.financialSummary.monthlySavings !== 'number' || sanitized.financialSummary.monthlySavings < 0)) {
          errors.push(`Monthly savings must be non-negative if provided (received ${sanitized.financialSummary.monthlySavings})`);
        }
        if (sanitized.financialSummary.expectedROIMonths !== undefined &&
            (typeof sanitized.financialSummary.expectedROIMonths !== 'number' || sanitized.financialSummary.expectedROIMonths <= 0)) {
          errors.push(`Expected ROI months must be positive if provided (received ${sanitized.financialSummary.expectedROIMonths})`);
        }
      }

      // Validate terms
      if (!sanitized.terms || !Array.isArray(sanitized.terms)) {
        errors.push('Terms must be an array');
      } else if (sanitized.terms.length === 0) {
        errors.push('At least one term must be included');
      } else {
        for (let i = 0; i < sanitized.terms.length; i++) {
          if (typeof sanitized.terms[i] !== 'string' || sanitized.terms[i].trim().length < 5) {
            errors.push(`Term ${i + 1} must have at least 5 characters (received ${sanitized.terms[i]?.length || 0})`);
          }
        }
      }

      // Validate next steps
      if (!sanitized.nextSteps || !Array.isArray(sanitized.nextSteps)) {
        errors.push('Next steps must be an array');
      } else if (sanitized.nextSteps.length === 0) {
        errors.push('At least one next step must be included');
      } else {
        for (let i = 0; i < sanitized.nextSteps.length; i++) {
          if (typeof sanitized.nextSteps[i] !== 'string' || sanitized.nextSteps[i].trim().length < 5) {
            errors.push(`Next step ${i + 1} must have at least 5 characters (received ${sanitized.nextSteps[i]?.length || 0})`);
          }
        }
      }

      // If there are validation errors, log them and return null
      if (errors.length > 0) {
        console.error('[AI Proposal] Validation failed with errors:', errors);
        console.error('[AI Proposal] Sanitized response structure:', JSON.stringify(sanitized, null, 2));
        return null;
      }

      console.log('[AI Proposal] Validation successful');
      return sanitized as AiProposalDoc;
    } catch (error) {
      console.error('Failed to parse AI response JSON:', error);
      console.error('Raw response data:', data);
      return null;
    }
  }

  /**
   * Regenerate proposal with additional instructions
   */
  async regenerateProposal(
    originalOptions: ProposalGenerationOptions,
    additionalInstructions: string
  ): Promise<ProposalGenerationResult> {
    return this.generateProposal({
      ...originalOptions,
      additionalInstructions
    });
  }

  /**
   * Validate proposal sections against schema
   */
  validateProposalSections(sections: any): sections is AiProposalDoc {
    try {
      // Basic structure validation
      return (
        sections &&
        Array.isArray(sections.executiveSummary) &&
        Array.isArray(sections.services) &&
        typeof sections.financialSummary === 'object' &&
        Array.isArray(sections.terms) &&
        Array.isArray(sections.nextSteps) &&
        typeof sections.financialSummary.totalPrice === 'number' &&
        typeof sections.financialSummary.totalDays === 'number'
      );
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const aiProposalGenerator = AIProposalGenerator.getInstance();
