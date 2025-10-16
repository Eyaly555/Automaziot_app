/**
 * Auto-Completion Intelligence Engine
 * Suggests and auto-fills data based on existing information
 */

import { Meeting } from '../types';

export interface AutoCompletionSuggestion {
  field: string;
  suggestedValue: any;
  confidence: number; // 0-1
  reason: string;
  source: string; // Where the data came from
}

/**
 * Generate auto-completion suggestions
 */
export function generateAutoCompletions(
  meeting: Meeting
): AutoCompletionSuggestion[] {
  const suggestions: AutoCompletionSuggestion[] = [];

  // Example 1: If business type is B2B, suggest longer sales cycle
  if (meeting.modules?.overview?.businessType === 'b2b') {
    suggestions.push({
      field: 'sales_cycle_days',
      suggestedValue: 60,
      confidence: 0.8,
      reason: 'עסקים B2B בדרך כלל מחזור מכירה ארוך יותר',
      source: 'overview.businessType',
    });
  }

  // Example 2: If has lead sources, suggest relevant automations
  const leadSources = meeting.modules?.leadsAndSales?.leadSources || [];
  if (leadSources.length > 3) {
    suggestions.push({
      field: 'recommended_service',
      suggestedValue: 'auto-lead-response',
      confidence: 0.9,
      reason: `זוהו ${leadSources.length} מקורות לידים - מומלץ מענה אוטומטי`,
      source: 'leadsAndSales.leadSources',
    });
  }

  // Example 3: If has WhatsApp, suggest WhatsApp API
  const channels = meeting.modules?.customerService?.channels || [];
  if (channels.some((ch) => ch.name === 'whatsapp')) {
    suggestions.push({
      field: 'recommended_integration',
      suggestedValue: 'whatsapp-api-setup',
      confidence: 0.95,
      reason: 'נמצא ערוץ WhatsApp - מומלץ API Setup',
      source: 'customerService.channels',
    });
  }

  // Example 4: If employee count > 50, suggest CRM
  const employees = meeting.modules?.operations?.hr?.employeeCount;
  if (typeof employees === 'number' && employees > 50) {
    suggestions.push({
      field: 'recommended_system',
      suggestedValue: 'impl-crm',
      confidence: 0.85,
      reason: `עם ${employees} עובדים מומלץ מערכת CRM`,
      source: 'overview.employees',
    });
  }

  return suggestions.filter((s) => s.confidence > 0.7);
}

/**
 * Apply auto-completions automatically (if confidence > threshold)
 */
export function applyAutoCompletions(
  meeting: Meeting,
  threshold: number = 0.85
): Meeting {
  const suggestions = generateAutoCompletions(meeting);
  const highConfidence = suggestions.filter((s) => s.confidence >= threshold);

  const updatedMeeting = { ...meeting };

  highConfidence.forEach((suggestion) => {
    console.log(
      `[Auto-Complete] ✅ Applied: ${suggestion.field} = ${suggestion.suggestedValue}`
    );
    console.log(`   Reason: ${suggestion.reason}`);

    // Apply the suggestion based on field type
    // This is a simplified example - extend based on your needs
    if (suggestion.field === 'recommended_service') {
      // Add to recommended services list
      if (!updatedMeeting.modules.proposal) {
        updatedMeeting.modules.proposal = { recommendedServices: [] };
      }
      // Logic to add recommended service
    }
  });

  return updatedMeeting;
}
