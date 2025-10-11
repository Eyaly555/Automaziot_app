// AI Proposal JSON Schema for structured output
// Used with OpenAI GPT-5 Responses API for deterministic proposal generation

export interface AiProposalDoc {
  executiveSummary: string[];
  services: {
    serviceId: string;
    titleHe: string;
    whyRelevantHe: string;
    whatIncludedHe: string;
  }[];
  financialSummary: {
    totalPrice: number;
    totalDays: number;
    monthlySavings?: number;
    expectedROIMonths?: number;
  };
  terms: string[];
  nextSteps: string[];
}

export const AiProposalJsonSchema = {
  name: 'AiProposalDoc',
  schema: {
    type: 'object',
    properties: {
      executiveSummary: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Executive summary paragraphs in Hebrew, 3-4 paragraphs explaining the business value and solution overview'
      },
      services: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            serviceId: {
              type: 'string',
              description: 'Unique service identifier'
            },
            titleHe: {
              type: 'string',
              description: 'Service title in Hebrew'
            },
            whyRelevantHe: {
              type: 'string',
              description: 'Explanation in Hebrew why this service is relevant to the client'
            },
            whatIncludedHe: {
              type: 'string',
              description: 'Detailed description in Hebrew of what is included in this service'
            }
          },
          required: ['serviceId', 'titleHe', 'whyRelevantHe', 'whatIncludedHe']
        },
        description: 'Array of selected services with their detailed descriptions'
      },
      financialSummary: {
        type: 'object',
        properties: {
          totalPrice: {
            type: 'number',
            description: 'Total price in ILS (without VAT)'
          },
          totalDays: {
            type: 'number',
            description: 'Total estimated implementation days'
          },
          monthlySavings: {
            type: 'number',
            description: 'Expected monthly savings in ILS (optional, based on ROI analysis)'
          },
          expectedROIMonths: {
            type: 'number',
            description: 'Expected ROI period in months (optional, based on savings)'
          }
        },
        required: ['totalPrice', 'totalDays']
      },
      terms: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Array of contract terms and conditions in Hebrew'
      },
      nextSteps: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Array of next steps for the client in Hebrew'
      }
    },
    required: ['executiveSummary', 'services', 'financialSummary', 'terms', 'nextSteps']
  },
  strict: true
} as const;

