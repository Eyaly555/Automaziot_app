/**
 * Smart Validation Messages
 * Provides contextual, actionable error messages
 */

import { Meeting, MeetingPhase } from '../types';
import { validateServiceRequirements } from './serviceRequirementsValidation';
import { validateAllModules } from './validationGuards';

export interface SmartValidationMessage {
  severity: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  actionItems: Array<{
    text: string;
    route?: string; // Where to navigate
    action?: () => void; // What to do
  }>;
  estimatedTime?: string; // How long to fix
}

/**
 * Get smart validation messages for phase transition
 */
export function getSmartValidationMessages(
  meeting: Meeting,
  targetPhase: MeetingPhase
): SmartValidationMessage[] {
  const messages: SmartValidationMessage[] = [];

  // Phase 1 → 2 validation
  if (meeting.phase === 'discovery' && targetPhase === 'implementation_spec') {
    const moduleValidation = validateAllModules(meeting);
    const progress = moduleValidation.overall.completionPercentage;

    if (progress < 70) {
      messages.push({
        severity: 'error',
        title: 'גילוי דרישות לא הושלם',
        message: `יש להשלים לפחות 70% מגילוי הדרישות. כרגע: ${progress}%`,
        actionItems: [
          {
            text: `השלם ${moduleValidation.overall.requiredFieldsMissing.length} שדות חסרים`,
            route: '/dashboard',
          },
          {
            text: 'הצג רשימת שדות חסרים',
            action: () =>
              console.table(moduleValidation.overall.requiredFieldsMissing),
          },
        ],
        estimatedTime: `${Math.ceil(moduleValidation.overall.requiredFieldsMissing.length * 2)} דקות`,
      });
    }

    if (meeting.status !== 'client_approved') {
      messages.push({
        severity: 'error',
        title: 'נדרש אישור לקוח',
        message: 'לא ניתן לעבור למפרט יישום ללא אישור הלקוח להצעה',
        actionItems: [
          {
            text: 'סקור הצעה מסחרית',
            route: '/proposal',
          },
          {
            text: 'שלח הצעה ללקוח',
            route: '/proposal/send',
          },
        ],
        estimatedTime: '1-2 ימי עסקים (בהמתנה ללקוח)',
      });
    }
  }

  // Phase 2 → 3 validation
  if (
    meeting.phase === 'implementation_spec' &&
    targetPhase === 'development'
  ) {
    const purchasedServices =
      meeting.modules?.proposal?.purchasedServices || [];

    if (purchasedServices.length === 0) {
      messages.push({
        severity: 'error',
        title: 'לא נרכשו שירותים',
        message: 'לא ניתן להתחיל פיתוח ללא שירותים שנרכשו',
        actionItems: [
          {
            text: 'חזור להצעה ובחר שירותים',
            route: '/proposal',
          },
        ],
        estimatedTime: '30 דקות',
      });
    } else {
      const serviceValidation = validateServiceRequirements(
        purchasedServices,
        meeting.implementationSpec || {}
      );

      if (!serviceValidation.isValid) {
        messages.push({
          severity: 'error',
          title: 'דרישות טכניות חסרות',
          message: `${serviceValidation.missingServices.length} שירותים חסרים דרישות טכניות`,
          actionItems: serviceValidation.missingServices.map((serviceName) => ({
            text: `השלם דרישות עבור: ${serviceName}`,
            route: '/phase2/service-requirements',
          })),
          estimatedTime: `${serviceValidation.missingServices.length * 15} דקות`,
        });
      }
    }

    const specProgress = meeting.implementationSpec?.completionPercentage || 0;
    if (specProgress < 100) {
      messages.push({
        severity: 'warning',
        title: 'מפרט לא הושלם במלואו',
        message: `מפרט היישום הושלם ב-${specProgress}% בלבד. מומלץ להשלים ל-100%`,
        actionItems: [
          {
            text: 'עבור למפרט יישום',
            route: '/phase2',
          },
        ],
        estimatedTime: '1-2 שעות',
      });
    }
  }

  return messages;
}

/**
 * Format messages for display
 */
export function formatValidationMessagesForUI(
  messages: SmartValidationMessage[]
): string {
  let output = '';

  messages.forEach((msg, index) => {
    const icon =
      msg.severity === 'error'
        ? '❌'
        : msg.severity === 'warning'
          ? '⚠️'
          : 'ℹ️';

    output += `\n${icon} ${msg.title}\n`;
    output += `   ${msg.message}\n`;

    if (msg.estimatedTime) {
      output += `   ⏱️ זמן משוער: ${msg.estimatedTime}\n`;
    }

    if (msg.actionItems.length > 0) {
      output += `   📋 פעולות נדרשות:\n`;
      msg.actionItems.forEach((action, i) => {
        output += `      ${i + 1}. ${action.text}\n`;
      });
    }

    if (index < messages.length - 1) {
      output += '\n';
    }
  });

  return output;
}
