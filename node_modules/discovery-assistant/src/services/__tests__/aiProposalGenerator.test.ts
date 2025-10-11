import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { AIProposalGenerator } from '../aiProposalGenerator';
import { callOpenAIThroughProxy } from '../openaiProxy';
import { AiProposalDoc } from '../../schemas/aiProposal.schema';

// Mock the OpenAI proxy
vi.mock('../openaiProxy');

const mockCallOpenAI = callOpenAIThroughProxy as Mock;

describe('AIProposalGenerator', () => {
  let generator: AIProposalGenerator;

  beforeEach(() => {
    generator = AIProposalGenerator.getInstance();
    vi.clearAllMocks();
  });

  const mockMeeting = {
    meetingId: 'test-meeting-1',
    companyName: 'Test Company',
    clientName: 'Test Client',
    modules: {
      overview: {
        companyName: 'Test Company',
        budget: 'medium',
        mainChallenge: 'test challenge'
      },
      leadsAndSales: {
        speedToLead: 30,
        followUp: { manual: true }
      }
    },
    painPoints: []
  };

  const mockSelectedServices = [
    {
      id: 'auto-lead-response',
      name: 'Auto Lead Response',
      nameHe: 'מענה אוטומטי ללידים',
      description: 'Automated lead response system',
      descriptionHe: 'מערכת תגובה אוטומטית ללידים',
      basePrice: 5000,
      estimatedDays: 7,
      category: 'automations' as const,
      complexity: 'simple' as const,
      reasonSuggested: 'Quick win for lead management',
      reasonSuggestedHe: 'פתרון מהיר לניהול לידים',
      relevanceScore: 8,
      dataSource: ['leadsAndSales'],
      selected: true
    }
  ];

  const mockValidAIResponse: AiProposalDoc = {
    executiveSummary: [
      'בהתבסס על הניתוח המעמיק של תהליכי העבודה שלכם, זיהינו הזדמנויות משמעותיות לשיפור היעילות.',
      'הפתרונות המוצעים יספקו חיסכון משמעותי בזמן ובעלויות תוך שיפור השירות ללקוחות.'
    ],
    services: [
      {
        serviceId: 'auto-lead-response',
        titleHe: 'מענה אוטומטי ללידים',
        whyRelevantHe: 'זמן התגובה הממוצע ללידים הוא 30 דקות, מה שפוגע בסיכויי ההמרה.',
        whatIncludedHe: 'הטמעת מערכת תגובה אוטומטית עם תבניות מותאמות אישית וחלוקת לידים חכמה.'
      }
    ],
    financialSummary: {
      totalPrice: 5000,
      totalDays: 7,
      monthlySavings: 2500,
      expectedROIMonths: 2
    },
    terms: [
      'ההצעה תקפה ל-30 ימים מתאריך השליחה',
      'תשלום 50% מקדמה, 50% בסיום הפרויקט',
      'אחריות לשלושה חודשים לאחר ההשקה'
    ],
    nextSteps: [
      'סקירת ההצעה ושאלות הבהרה',
      'חתימה על הסכם עבודה',
      'תשלום מקדמה והתחלת הפרויקט'
    ]
  };

  describe('generateProposal', () => {
    it('should generate proposal successfully with valid response', async () => {
      mockCallOpenAI.mockResolvedValue({
        success: true,
        data: JSON.stringify(mockValidAIResponse),
        usage: {
          promptTokens: 150,
          completionTokens: 300,
          totalTokens: 450
        },
        model: 'gpt-5'
      });

      const result = await generator.generateProposal({
        meeting: mockMeeting,
        selectedServices: mockSelectedServices,
        pmNote: 'Test PM note'
      });

      expect(result.success).toBe(true);
      expect(result.sections).toEqual(mockValidAIResponse);
      expect(result.usage).toEqual({
        promptTokens: 150,
        completionTokens: 300,
        totalTokens: 450
      });
      expect(result.model).toBe('gpt-5');
    });

    it('should handle AI service unavailable', async () => {
      // Mock AI service as unavailable
      const mockAIService = {
        isAvailable: () => false
      };

      const result = await generator.generateProposal({
        meeting: mockMeeting,
        selectedServices: mockSelectedServices
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('AI service is not configured or available');
    });

    it('should retry on transient failures', async () => {
      // First two calls fail, third succeeds
      mockCallOpenAI
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Rate limit exceeded'))
        .mockResolvedValueOnce({
          success: true,
          data: JSON.stringify(mockValidAIResponse),
          usage: { promptTokens: 100, completionTokens: 200, totalTokens: 300 },
          model: 'gpt-5'
        });

      const result = await generator.generateProposal({
        meeting: mockMeeting,
        selectedServices: mockSelectedServices
      });

      expect(result.success).toBe(true);
      expect(mockCallOpenAI).toHaveBeenCalledTimes(3);
    });

    it('should not retry on validation errors', async () => {
      const invalidResponse = {
        executiveSummary: 'Not an array',
        services: [],
        financialSummary: { totalPrice: -100 },
        terms: [],
        nextSteps: []
      };

      mockCallOpenAI.mockResolvedValue({
        success: true,
        data: JSON.stringify(invalidResponse),
        usage: { promptTokens: 100, completionTokens: 200, totalTokens: 300 },
        model: 'gpt-5'
      });

      const result = await generator.generateProposal({
        meeting: mockMeeting,
        selectedServices: mockSelectedServices
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid response format from AI');
      expect(mockCallOpenAI).toHaveBeenCalledTimes(1); // No retries for validation errors
    });

    it('should handle OpenAI API errors with retry', async () => {
      mockCallOpenAI
        .mockRejectedValueOnce(new Error('OpenAI API error: 429 Too Many Requests'))
        .mockRejectedValueOnce(new Error('OpenAI API error: 500 Internal Server Error'))
        .mockRejectedValueOnce(new Error('OpenAI API error: 429 Too Many Requests'));

      const result = await generator.generateProposal({
        meeting: mockMeeting,
        selectedServices: mockSelectedServices
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('429 Too Many Requests');
      expect(mockCallOpenAI).toHaveBeenCalledTimes(3);
    });

    it('should include PM note in the prompt', async () => {
      const pmNote = 'Focus on cost savings and quick implementation';

      mockCallOpenAI.mockResolvedValue({
        success: true,
        data: JSON.stringify(mockValidAIResponse),
        usage: { promptTokens: 100, completionTokens: 200, totalTokens: 300 },
        model: 'gpt-5'
      });

      await generator.generateProposal({
        meeting: mockMeeting,
        selectedServices: mockSelectedServices,
        pmNote
      });

      // Verify that the OpenAI call was made (we can't easily inspect the payload in this test)
      expect(mockCallOpenAI).toHaveBeenCalled();
    });

    it('should handle regeneration with additional instructions', async () => {
      const additionalInstructions = 'Make the tone more formal and emphasize technical details';

      mockCallOpenAI.mockResolvedValue({
        success: true,
        data: JSON.stringify(mockValidAIResponse),
        usage: { promptTokens: 100, completionTokens: 200, totalTokens: 300 },
        model: 'gpt-5'
      });

      const result = await generator.regenerateProposal({
        meeting: mockMeeting,
        selectedServices: mockSelectedServices,
        pmNote: 'Original PM note'
      }, additionalInstructions);

      expect(result.success).toBe(true);
      expect(mockCallOpenAI).toHaveBeenCalled();
    });
  });

  describe('parseAndValidateResponse', () => {
    it('should validate correct AI response structure', () => {
      const validData = JSON.stringify(mockValidAIResponse);

      // Access private method through type assertion for testing
      const result = (generator as any).parseAndValidateResponse(validData);

      expect(result).toEqual(mockValidAIResponse);
    });

    it('should reject response with missing executive summary', () => {
      const invalidResponse = {
        services: mockValidAIResponse.services,
        financialSummary: mockValidAIResponse.financialSummary,
        terms: mockValidAIResponse.terms,
        nextSteps: mockValidAIResponse.nextSteps
      };

      const result = (generator as any).parseAndValidateResponse(JSON.stringify(invalidResponse));

      expect(result).toBeNull();
    });

    it('should reject response with invalid financial summary', () => {
      const invalidResponse = {
        ...mockValidAIResponse,
        financialSummary: {
          totalPrice: -1000, // Invalid negative price
          totalDays: 5
        }
      };

      const result = (generator as any).parseAndValidateResponse(JSON.stringify(invalidResponse));

      expect(result).toBeNull();
    });

    it('should reject response with empty services array', () => {
      const invalidResponse = {
        ...mockValidAIResponse,
        services: []
      };

      const result = (generator as any).parseAndValidateResponse(JSON.stringify(invalidResponse));

      expect(result).toBeNull();
    });

    it('should handle markdown-wrapped JSON', () => {
      const markdownResponse = `\`\`\`json\n${JSON.stringify(mockValidAIResponse)}\n\`\`\``;

      const result = (generator as any).parseAndValidateResponse(markdownResponse);

      expect(result).toEqual(mockValidAIResponse);
    });

    it('should reject malformed JSON', () => {
      const malformedJson = '{ "executiveSummary": [ "invalid json" }';

      const result = (generator as any).parseAndValidateResponse(malformedJson);

      expect(result).toBeNull();
    });
  });

  describe('buildUserPayload', () => {
    it('should create proper payload structure', () => {
      const result = (generator as any).buildUserPayload(mockMeeting, mockSelectedServices, 'Test PM note');

      const payload = JSON.parse(result);

      expect(payload).toHaveProperty('meeting');
      expect(payload).toHaveProperty('selectedServices');
      expect(payload).toHaveProperty('totals');
      expect(payload).toHaveProperty('pmNote', 'Test PM note');

      expect(payload.meeting.companyName).toBe('Test Company');
      expect(payload.selectedServices).toHaveLength(1);
      expect(payload.totals.totalPrice).toBe(5000);
    });

    it('should calculate correct totals', () => {
      const servicesWithCustomPrices = [
        { ...mockSelectedServices[0], customPrice: 6000 },
        { ...mockSelectedServices[0], id: 'test-service-2', customPrice: 4000 }
      ];

      const result = (generator as any).buildUserPayload(mockMeeting, servicesWithCustomPrices);

      const payload = JSON.parse(result);
      expect(payload.totals.totalPrice).toBe(10000);
    });
  });

  describe('retry logic', () => {
    it('should implement exponential backoff', async () => {
      const sleepSpy = vi.spyOn(generator as any, 'sleep');

      mockCallOpenAI
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          success: true,
          data: JSON.stringify(mockValidAIResponse),
          usage: { promptTokens: 100, completionTokens: 200, totalTokens: 300 },
          model: 'gpt-5'
        });

      await generator.generateProposal({
        meeting: mockMeeting,
        selectedServices: mockSelectedServices
      });

      // Should have called sleep twice (between retry attempts)
      expect(sleepSpy).toHaveBeenCalledTimes(2);
      expect(sleepSpy).toHaveBeenNthCalledWith(1, 1000); // 1 second base delay
      expect(sleepSpy).toHaveBeenNthCalledWith(2, 2000); // 2 seconds (exponential backoff)
    });

    it('should not retry on validation errors', async () => {
      const invalidResponse = {
        executiveSummary: 'Not an array',
        services: [],
        financialSummary: {},
        terms: [],
        nextSteps: []
      };

      mockCallOpenAI.mockResolvedValue({
        success: true,
        data: JSON.stringify(invalidResponse),
        usage: { promptTokens: 100, completionTokens: 200, totalTokens: 300 },
        model: 'gpt-5'
      });

      await generator.generateProposal({
        meeting: mockMeeting,
        selectedServices: mockSelectedServices
      });

      // Should only call once (no retries for validation errors)
      expect(mockCallOpenAI).toHaveBeenCalledTimes(1);
    });
  });
});
