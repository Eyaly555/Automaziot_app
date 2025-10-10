import { Meeting } from '../types';
import { SelectedService } from '../types/proposal';
import { AiProposalDoc, AiProposalJsonSchema } from '../schemas/aiProposal.schema';
import { callOpenAIThroughProxy } from './openaiProxy';

// System prompt for proposal generation in Hebrew
const SYSTEM_PROMPT_HE = `אתה מומחה בכתיבת הצעות מחיר מקצועיות לעסקים ישראליים. אתה כותב בעברית בלבד, במקצועיות ובנימה ידידותית.

עקרונות הכתיבה:
- שמור על שפה עסקית מקצועית אך ידידותית ונגישה
- הדגש את הערך העסקי והחיסכון ללקוח
- השתמש במטבע הישראלי (₪) בלבד
- אל תשנה מחירים או משכי זמן - השתמש בנתונים המסופקים בדיוק
- סיכום מנהלים: 3-4 פסקאות קצרות וממוקדות
- התמקד בתוצאות וביתרונות המעשיים ללקוח

מבנה ההצעה הנדרש:
1. סיכום מנהלים - הסבר מה הבעיה, הפתרון והערך ללקוח
2. פירוט השירותים - מה כלול בכל שירות ומדוע הוא רלוונטי
3. סיכום פיננסי - השקעה כוללת ותקופת החזר (אם רלוונטי)
4. תנאים - תנאי התקשרות ותוקף ההצעה
5. צעדים הבאים - מה הלקוח צריך לעשות הלאה`;

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

    // Retry with exponential backoff
    for (let attempt = 0; attempt < this.retryCount; attempt++) {
      try {
        // Build user payload
        const userPayload = this.buildUserPayload(meeting, selectedServices, pmNote);

        // Build messages array
        const messages = [
          { role: 'system' as const, content: SYSTEM_PROMPT_HE },
          { role: 'user' as const, content: userPayload }
        ];

        // Add regeneration instructions if provided
        if (additionalInstructions) {
          messages.push({
            role: 'user' as const,
            content: `הוראות נוספות לשיפור ההצעה:\n${additionalInstructions}`
          });
        }

        // Use the AI service to call OpenAI Responses API
        const response = await this.callOpenAIResponsesAPI({
          model: model || import.meta.env.VITE_AI_MODEL || 'gpt-5-mini-2025-08-07',
          messages,
          seed: 7,
          max_output_tokens: 1800,
          temperature: 0.4,
          response_format: {
            type: 'json_schema',
            json_schema: AiProposalJsonSchema
          }
        });

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to generate proposal');
        }

        // Parse and validate the response
        const sections = this.parseAndValidateResponse(response.data);

        if (!sections) {
          throw new Error('Invalid response format from AI');
        }

        return {
          success: true,
          sections,
          usage: response.usage,
          model: response.model
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error occurred');
        console.warn(`AI proposal generation attempt ${attempt + 1} failed:`, lastError.message);

        // Don't retry on validation errors or rate limits
        if (lastError.message.includes('Invalid response format') ||
            lastError.message.includes('rate limit') ||
            lastError.message.includes('quota')) {
          break;
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
   * Call OpenAI Responses API through proxy
   */
  private async callOpenAIResponsesAPI(params: {
    model: string;
    messages: Array<{ role: 'system' | 'user'; content: string }>;
    seed: number;
    max_output_tokens: number;
    temperature: number;
    response_format: {
      type: 'json_schema';
      json_schema: typeof AiProposalJsonSchema;
    };
  }) {
    const response = await callOpenAIThroughProxy({
      model: params.model,
      messages: params.messages,
      seed: params.seed,
      max_output_tokens: params.max_output_tokens,
      temperature: params.temperature,
      response_format: params.response_format
    });

    if (!response.success) {
      throw new Error(response.error || 'OpenAI API call failed');
    }

    return response;
  }

  /**
   * Build user payload for AI generation
   */
  private buildUserPayload(meeting: Meeting, selectedServices: SelectedService[], pmNote?: string): string {
    // Serialize meeting data
    const meetingData = {
      companyName: meeting.companyName,
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

    // Calculate totals
    const totals = selectedServices.reduce(
      (acc, service) => ({
        totalPrice: acc.totalPrice + (service.customPrice || service.basePrice),
        totalDays: Math.max(acc.totalDays, service.customDuration || service.estimatedDays)
      }),
      { totalPrice: 0, totalDays: 0 }
    );

    // Build comprehensive payload
    const payload = {
      meeting: meetingData,
      selectedServices: servicesData,
      totals,
      pmNote: pmNote || 'אין הערות מיוחדות'
    };

    return JSON.stringify(payload, null, 2);
  }

  /**
   * Parse and validate AI response with comprehensive error handling
   */
  private parseAndValidateResponse(data: string): AiProposalDoc | null {
    try {
      // Clean the response data (remove markdown code blocks if present)
      let cleanData = data.trim();
      if (cleanData.startsWith('```json')) {
        cleanData = cleanData.replace(/```json\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleanData);

      // Comprehensive validation
      const errors: string[] = [];

      // Validate executive summary
      if (!parsed.executiveSummary || !Array.isArray(parsed.executiveSummary)) {
        errors.push('Executive summary must be an array of strings');
      } else if (parsed.executiveSummary.length < 2 || parsed.executiveSummary.length > 6) {
        errors.push('Executive summary must have 2-6 paragraphs');
      } else {
        // Validate each paragraph
        for (let i = 0; i < parsed.executiveSummary.length; i++) {
          if (typeof parsed.executiveSummary[i] !== 'string' || parsed.executiveSummary[i].trim().length < 50) {
            errors.push(`Executive summary paragraph ${i + 1} must be a non-empty string with at least 50 characters`);
          }
        }
      }

      // Validate services array
      if (!parsed.services || !Array.isArray(parsed.services)) {
        errors.push('Services must be an array');
      } else if (parsed.services.length === 0) {
        errors.push('At least one service must be included');
      } else {
        // Validate each service
        for (let i = 0; i < parsed.services.length; i++) {
          const service = parsed.services[i];
          if (!service.serviceId || typeof service.serviceId !== 'string') {
            errors.push(`Service ${i + 1} must have a valid serviceId`);
          }
          if (!service.titleHe || typeof service.titleHe !== 'string' || service.titleHe.trim().length < 5) {
            errors.push(`Service ${i + 1} must have a valid Hebrew title`);
          }
          if (!service.whyRelevantHe || typeof service.whyRelevantHe !== 'string' || service.whyRelevantHe.trim().length < 20) {
            errors.push(`Service ${i + 1} must have a detailed relevance explanation (at least 20 characters)`);
          }
          if (!service.whatIncludedHe || typeof service.whatIncludedHe !== 'string' || service.whatIncludedHe.trim().length < 20) {
            errors.push(`Service ${i + 1} must have a detailed inclusion description (at least 20 characters)`);
          }
        }
      }

      // Validate financial summary
      if (!parsed.financialSummary || typeof parsed.financialSummary !== 'object') {
        errors.push('Financial summary must be an object');
      } else {
        if (typeof parsed.financialSummary.totalPrice !== 'number' || parsed.financialSummary.totalPrice <= 0) {
          errors.push('Financial summary must have a valid total price greater than 0');
        }
        if (typeof parsed.financialSummary.totalDays !== 'number' || parsed.financialSummary.totalDays <= 0) {
          errors.push('Financial summary must have valid total days greater than 0');
        }
        if (parsed.financialSummary.monthlySavings !== undefined &&
            (typeof parsed.financialSummary.monthlySavings !== 'number' || parsed.financialSummary.monthlySavings < 0)) {
          errors.push('Monthly savings must be a non-negative number if provided');
        }
        if (parsed.financialSummary.expectedROIMonths !== undefined &&
            (typeof parsed.financialSummary.expectedROIMonths !== 'number' || parsed.financialSummary.expectedROIMonths <= 0)) {
          errors.push('Expected ROI months must be a positive number if provided');
        }
      }

      // Validate terms
      if (!parsed.terms || !Array.isArray(parsed.terms)) {
        errors.push('Terms must be an array');
      } else if (parsed.terms.length === 0) {
        errors.push('At least one term must be included');
      } else {
        for (let i = 0; i < parsed.terms.length; i++) {
          if (typeof parsed.terms[i] !== 'string' || parsed.terms[i].trim().length < 10) {
            errors.push(`Term ${i + 1} must be a meaningful string (at least 10 characters)`);
          }
        }
      }

      // Validate next steps
      if (!parsed.nextSteps || !Array.isArray(parsed.nextSteps)) {
        errors.push('Next steps must be an array');
      } else if (parsed.nextSteps.length === 0) {
        errors.push('At least one next step must be included');
      } else {
        for (let i = 0; i < parsed.nextSteps.length; i++) {
          if (typeof parsed.nextSteps[i] !== 'string' || parsed.nextSteps[i].trim().length < 10) {
            errors.push(`Next step ${i + 1} must be a meaningful string (at least 10 characters)`);
          }
        }
      }

      // If there are validation errors, log them and return null
      if (errors.length > 0) {
        console.error('AI response validation failed:', errors);
        console.error('Invalid response structure:', parsed);
        return null;
      }

      return parsed as AiProposalDoc;
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
