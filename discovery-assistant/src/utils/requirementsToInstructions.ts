/**
 * Requirements to Instructions Converter
 *
 * Transforms raw collected requirements into detailed, actionable developer instructions.
 * This is the "smart" layer that converts field values into comprehensive implementation specs.
 */

import { Meeting } from '../types';
import { extractBusinessContext } from './fieldMapper';

export interface DeveloperInstructions {
  businessContext: string;
  technicalSteps: TechnicalStep[];
  acceptanceCriteria: string[];
  testingChecklist: string[];
  securityNotes: string[];
  estimatedComplexity: 'simple' | 'medium' | 'complex';
  estimatedHours: number;
}

export interface TechnicalStep {
  stepNumber: number;
  title: string;
  description: string;
  details: string[];
  warnings?: string[];
  dependencies?: string[];
}

/**
 * Generate comprehensive developer instructions for Auto Lead Response service
 */
export function generateAutoLeadResponseInstructions(
  requirements: any,
  meeting: Meeting
): DeveloperInstructions {
  const businessCtx = extractBusinessContext(meeting);

  // Build business context section
  const businessContext = `
BUSINESS CONTEXT:
• Client: ${meeting.clientName}
• Industry: ${businessCtx.industry || 'Not specified'}
• Monthly Lead Volume: ${businessCtx.monthlyLeadVolume || 'Unknown'}
• Current Response Time: ${businessCtx.currentResponseTime || 'Unknown'}
• Target: Automated response within 5 minutes
• Main Challenge: ${businessCtx.mainChallenge || 'Improving lead response time'}

WHY THIS MATTERS:
Studies show that responding to leads within 5 minutes increases conversion rates by 400%.
Client is currently ${businessCtx.currentResponseTime || 'slow to respond'}, losing potential sales.
  `.trim();

  // Build technical steps
  const technicalSteps: TechnicalStep[] = [];

  // Step 1: Form Platform Integration
  const formPlatform =
    requirements?.formPlatformAccess?.platform || 'Unknown Platform';
  const webhookCapability = requirements?.formPlatformAccess?.webhookCapability;
  const apiKey = requirements?.formPlatformAccess?.apiKey;

  technicalSteps.push({
    stepNumber: 1,
    title: `Configure ${formPlatform} Webhook Integration`,
    description: `Set up webhook connection from ${formPlatform} to n8n`,
    details: [
      `Platform: ${formPlatform}`,
      webhookCapability
        ? '✓ Platform supports native webhooks (use webhook trigger)'
        : '⚠️ Platform does NOT support webhooks - will need to use polling or plugin',
      apiKey
        ? `✓ API Key provided (${apiKey.substring(0, 10)}...)`
        : '❌ API Key NOT provided - collect before implementation',
      `Test webhook URL: ${requirements?.n8nWorkflow?.webhookEndpoint || 'Not configured'}`,
    ],
    warnings: !webhookCapability
      ? [
          'Polling-based solutions introduce latency - response time will be slower than target',
        ]
      : undefined,
    dependencies: ['n8n instance must be accessible via HTTPS'],
  });

  // Step 2: Email Service Setup
  const emailProvider =
    requirements?.emailServiceAccess?.provider || 'Unknown Provider';
  const dailyLimit = requirements?.emailServiceAccess?.rateLimits?.daily || 0;
  const monthlyLimit =
    requirements?.emailServiceAccess?.rateLimits?.monthly || 0;
  const domainVerified = requirements?.emailServiceAccess?.domainVerified;

  technicalSteps.push({
    stepNumber: 2,
    title: `Set up ${emailProvider} Email Service`,
    description: `Configure automated email sending via ${emailProvider}`,
    details: [
      `Provider: ${emailProvider}`,
      `Authentication: ${requirements?.emailServiceAccess?.apiKey ? 'API Key provided' : 'API Key MISSING - collect before implementation'}`,
      `Rate Limits: ${dailyLimit}/day, ${monthlyLimit}/month`,
      domainVerified
        ? '✓ Domain verified - emails will have high deliverability'
        : '⚠️ Domain NOT verified - MUST verify before go-live to avoid spam folder',
      `Expected volume: ~${businessCtx.monthlyLeadVolume || 100}/month = ~${Math.ceil((businessCtx.monthlyLeadVolume || 100) / 30)}/day`,
    ],
    warnings: [
      !domainVerified
        ? 'Unverified domain emails often go to spam - CRITICAL to verify'
        : '',
      dailyLimit < (businessCtx.monthlyLeadVolume || 100) / 30
        ? `Daily limit (${dailyLimit}) may be exceeded with current volume (${Math.ceil((businessCtx.monthlyLeadVolume || 100) / 30)}/day)`
        : '',
    ].filter(Boolean),
  });

  // Step 3: CRM Integration
  const crmSystem =
    requirements?.crmAccess?.system || businessCtx.crmSystem || 'Unknown CRM';
  const crmModule = requirements?.crmAccess?.module || 'Leads';
  const crmAuthMethod = requirements?.crmAccess?.authMethod || 'oauth';

  technicalSteps.push({
    stepNumber: 3,
    title: `Configure ${crmSystem} CRM Integration`,
    description: `Set up lead creation in ${crmSystem}`,
    details: [
      `System: ${crmSystem}`,
      `Module: ${crmModule}`,
      `Authentication: ${crmAuthMethod}`,
      `Field Mapping:`,
      `  • Name → ${crmModule}.Full_Name`,
      `  • Email → ${crmModule}.Email`,
      `  • Phone → ${crmModule}.Phone`,
      `  • Source → ${crmModule}.Lead_Source (set to "${formPlatform} Form")`,
      `  • Status → ${crmModule}.Lead_Status (set to "New - Uncontacted")`,
    ],
    warnings:
      crmAuthMethod === 'oauth'
        ? [
            'OAuth requires user consent - ensure client grants permission before go-live',
          ]
        : undefined,
    dependencies: [`${crmSystem} API credentials`, 'CRM field names verified'],
  });

  // Step 4: n8n Workflow Construction
  const n8nInstance =
    requirements?.n8nWorkflow?.instanceUrl || 'Not configured';
  const webhookEndpoint =
    requirements?.n8nWorkflow?.webhookEndpoint || 'Not configured';
  const retryAttempts =
    requirements?.n8nWorkflow?.errorHandling?.retryAttempts || 3;
  const alertEmail =
    requirements?.n8nWorkflow?.errorHandling?.alertEmail || 'Not configured';
  const httpsEnabled = requirements?.n8nWorkflow?.httpsEnabled !== false;

  technicalSteps.push({
    stepNumber: 4,
    title: 'Build n8n Automation Workflow',
    description: 'Create the complete automation workflow in n8n',
    details: [
      `n8n Instance: ${n8nInstance}`,
      `Webhook URL: ${webhookEndpoint}`,
      `HTTPS: ${httpsEnabled ? '✓ Enabled (secure)' : '❌ DISABLED - CRITICAL SECURITY RISK'}`,
      '',
      'WORKFLOW STEPS:',
      `1. Webhook Trigger (Listen for form submissions)`,
      `2. Data Validation (Check required fields: name, email)`,
      `3. Duplicate Detection (Search CRM for existing email)`,
      `4. IF new lead → Create CRM record`,
      `5. Send welcome email via ${emailProvider}`,
      `6. Error Handler (Retry ${retryAttempts}x, alert ${alertEmail})`,
      `7. Log result to monitoring`,
    ],
    warnings: !httpsEnabled
      ? [
          'CRITICAL: HTTPS is DISABLED - form data will be transmitted unencrypted. MUST enable before go-live.',
        ]
      : undefined,
  });

  // Build acceptance criteria
  const acceptanceCriteria = [
    'Form submission triggers webhook within 30 seconds',
    'Email sent to lead within 5 minutes of form submission',
    `Lead created in ${crmSystem} ${crmModule} module with all mapped fields`,
    'Duplicate emails are detected and handled (skip or update existing record)',
    `Error notifications sent to ${alertEmail} on failure`,
    'Workflow logs all executions for debugging',
    domainVerified
      ? 'Emails delivered to inbox (not spam)'
      : 'Email domain verified before go-live',
  ];

  // Build testing checklist
  const testingChecklist = [
    '[ ] Submit test form with valid data',
    '[ ] Verify webhook received within 30 seconds',
    '[ ] Confirm email sent and delivered',
    `[ ] Check ${crmSystem} for new lead record`,
    '[ ] Verify all fields mapped correctly (Name, Email, Phone, Source, Status)',
    '[ ] Test duplicate submission (same email twice)',
    '[ ] Confirm duplicate handling works (skip or update)',
    '[ ] Simulate webhook failure (disconnect n8n)',
    `[ ] Verify retry logic (${retryAttempts} attempts)`,
    `[ ] Confirm error alert sent to ${alertEmail}`,
    '[ ] Test with missing required fields (should fail gracefully)',
    `[ ] Load test: Submit ${Math.min(dailyLimit, 50)} forms in 1 hour`,
    '[ ] Verify no rate limit errors',
  ];

  // Build security notes
  const securityNotes = [
    httpsEnabled
      ? 'HTTPS enabled for webhook (secure)'
      : '⚠️ CRITICAL: Enable HTTPS for webhook',
    'API keys stored as environment variables (not in code)',
    'Email authentication uses secure API key (not password)',
    crmAuthMethod === 'oauth'
      ? 'OAuth tokens refreshed automatically'
      : `${crmSystem} credentials secure`,
    domainVerified
      ? 'Email domain verified (SPF/DKIM configured)'
      : '⚠️ Verify email domain before production',
    'Webhook endpoint should use authentication (API key or signature)',
    'Personal data (name, email, phone) handled according to GDPR',
  ];

  // Estimate complexity
  const complexityFactors = {
    webhookSupport: webhookCapability ? 0 : 1, // Polling adds complexity
    domainVerified: domainVerified ? 0 : 1, // Domain verification adds work
    crmAuth: crmAuthMethod === 'oauth' ? 1 : 0, // OAuth is more complex
    apiKeysMissing:
      !requirements?.emailServiceAccess?.apiKey || !apiKey ? 1 : 0,
  };

  const totalComplexity = Object.values(complexityFactors).reduce(
    (sum, val) => sum + val,
    0
  );

  let estimatedComplexity: 'simple' | 'medium' | 'complex';
  let estimatedHours: number;

  if (totalComplexity === 0) {
    estimatedComplexity = 'simple';
    estimatedHours = 8;
  } else if (totalComplexity <= 2) {
    estimatedComplexity = 'medium';
    estimatedHours = 12;
  } else {
    estimatedComplexity = 'complex';
    estimatedHours = 16;
  }

  return {
    businessContext,
    technicalSteps,
    acceptanceCriteria,
    testingChecklist,
    securityNotes,
    estimatedComplexity,
    estimatedHours,
  };
}

/**
 * Format instructions as markdown for task description
 */
export function formatInstructionsAsMarkdown(
  instructions: DeveloperInstructions
): string {
  let markdown = '';

  // Business Context
  markdown += '## BUSINESS CONTEXT\n\n';
  markdown += instructions.businessContext + '\n\n';

  // Technical Steps
  markdown += '## TECHNICAL IMPLEMENTATION\n\n';
  for (const step of instructions.technicalSteps) {
    markdown += `### ${step.stepNumber}. ${step.title}\n\n`;
    markdown += `${step.description}\n\n`;

    for (const detail of step.details) {
      markdown += `- ${detail}\n`;
    }
    markdown += '\n';

    if (step.warnings && step.warnings.length > 0) {
      markdown += '**⚠️ WARNINGS:**\n';
      for (const warning of step.warnings) {
        markdown += `- ${warning}\n`;
      }
      markdown += '\n';
    }

    if (step.dependencies && step.dependencies.length > 0) {
      markdown += '**Dependencies:**\n';
      for (const dep of step.dependencies) {
        markdown += `- ${dep}\n`;
      }
      markdown += '\n';
    }
  }

  // Acceptance Criteria
  markdown += '## ACCEPTANCE CRITERIA\n\n';
  for (const criteria of instructions.acceptanceCriteria) {
    markdown += `- ${criteria}\n`;
  }
  markdown += '\n';

  // Testing Checklist
  markdown += '## TESTING CHECKLIST\n\n';
  for (const test of instructions.testingChecklist) {
    markdown += `${test}\n`;
  }
  markdown += '\n';

  // Security Notes
  markdown += '## SECURITY NOTES\n\n';
  for (const note of instructions.securityNotes) {
    markdown += `- ${note}\n`;
  }
  markdown += '\n';

  // Complexity & Estimate
  markdown += `## COMPLEXITY & ESTIMATE\n\n`;
  markdown += `- **Complexity**: ${instructions.estimatedComplexity.toUpperCase()}\n`;
  markdown += `- **Estimated Hours**: ${instructions.estimatedHours}h\n`;

  return markdown;
}

/**
 * Generate instructions for Auto Form to CRM service
 */
export function generateAutoFormToCrmInstructions(
  requirements: any,
  meeting: Meeting
): DeveloperInstructions {
  const businessCtx = extractBusinessContext(meeting);
  const crmSystem = requirements?.crmSystem || businessCtx.crmSystem || 'CRM';
  const formPlatform = requirements?.formPlatform || 'Web Form';

  const businessContext = `
BUSINESS CONTEXT:
• Client: ${meeting.clientName}
• Form Platform: ${formPlatform}
• CRM System: ${crmSystem}
• Lead Volume: ${businessCtx.monthlyLeadVolume || 'Unknown'}/month
• Goal: Automatic form submission → CRM record creation
  `.trim();

  const technicalSteps: TechnicalStep[] = [
    {
      stepNumber: 1,
      title: `Connect ${formPlatform} to n8n`,
      description: 'Set up form submission webhook or polling',
      details: [
        `Platform: ${formPlatform}`,
        'Configure webhook URL or API polling',
        'Test form submission triggers workflow',
      ],
    },
    {
      stepNumber: 2,
      title: `Create ${crmSystem} Integration`,
      description: 'Map form fields to CRM fields',
      details: [
        `System: ${crmSystem}`,
        'Authenticate API access',
        'Map all form fields to CRM fields',
        requirements?.duplicateDetection
          ? '✓ Enable duplicate detection by email'
          : 'No duplicate detection',
        requirements?.dataValidation
          ? '✓ Enable data validation'
          : 'No validation',
      ],
    },
  ];

  return {
    businessContext,
    technicalSteps,
    acceptanceCriteria: [
      'Form submissions create CRM records',
      'All fields mapped correctly',
      requirements?.duplicateDetection
        ? 'Duplicates detected and skipped'
        : 'All submissions create new records',
    ],
    testingChecklist: [
      '[ ] Submit test form',
      '[ ] Verify CRM record created',
      '[ ] Check field mapping accuracy',
    ],
    securityNotes: [
      'API credentials stored securely',
      'HTTPS enabled for webhooks',
    ],
    estimatedComplexity: 'simple',
    estimatedHours: 8,
  };
}
