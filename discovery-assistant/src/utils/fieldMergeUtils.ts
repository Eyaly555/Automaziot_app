import type {
  ExtractedFields,
  FieldMergeResult,
  MergeSummary,
} from '../types/conversation';
import type {
  OverviewModule,
  LeadsAndSalesModule,
  CustomerServiceModule,
  AIAgentsModule,
  ROIModule,
  Modules,
} from '../types';

/**
 * Checks if a field value is considered empty
 */
export function isFieldEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * Merges extracted fields into existing module data, only filling empty fields
 */
export function mergeModuleFields<T extends Record<string, any>>(
  existingData: T,
  extractedData: Partial<T>,
  moduleName: string
): { merged: T; fieldsFilled: string[]; fieldsSkipped: string[] } {
  const fieldsFilled: string[] = [];
  const fieldsSkipped: string[] = [];
  const merged = { ...existingData };

  for (const [key, value] of Object.entries(extractedData)) {
    if (value === undefined) continue;

    const existingValue = existingData[key as keyof T];

    if (isFieldEmpty(existingValue)) {
      // Field is empty, fill it
      (merged as any)[key] = value;
      fieldsFilled.push(key);
    } else {
      // Field already has data, skip it
      fieldsSkipped.push(key);
    }
  }

  return { merged, fieldsFilled, fieldsSkipped };
}

/**
 * Merges all extracted fields into existing modules
 */
export function mergeExtractedFields(
  currentModules: Modules,
  extractedFields: ExtractedFields
): { updatedModules: Partial<Modules>; summary: MergeSummary } {
  const moduleResults: FieldMergeResult[] = [];
  const updatedModules: Partial<Modules> = {};

  // Merge Overview module
  if (extractedFields.overview) {
    const existing = currentModules.overview || {};
    const { merged, fieldsFilled, fieldsSkipped } = mergeModuleFields(
      existing,
      extractedFields.overview,
      'overview'
    );

    if (fieldsFilled.length > 0) {
      updatedModules.overview = merged as OverviewModule;
    }

    moduleResults.push({
      moduleName: 'overview',
      fieldsFilled,
      fieldsSkipped,
      totalFields: fieldsFilled.length + fieldsSkipped.length,
    });
  }

  // Merge Leads & Sales module
  if (extractedFields.leadsAndSales) {
    const existing = currentModules.leadsAndSales || {};
    const { merged, fieldsFilled, fieldsSkipped } = mergeModuleFields(
      existing,
      extractedFields.leadsAndSales,
      'leadsAndSales'
    );

    if (fieldsFilled.length > 0) {
      updatedModules.leadsAndSales = merged as LeadsAndSalesModule;
    }

    moduleResults.push({
      moduleName: 'leadsAndSales',
      fieldsFilled,
      fieldsSkipped,
      totalFields: fieldsFilled.length + fieldsSkipped.length,
    });
  }

  // Merge Customer Service module
  if (extractedFields.customerService) {
    const existing = currentModules.customerService || {};
    const { merged, fieldsFilled, fieldsSkipped } = mergeModuleFields(
      existing,
      extractedFields.customerService,
      'customerService'
    );

    if (fieldsFilled.length > 0) {
      updatedModules.customerService = merged as CustomerServiceModule;
    }

    moduleResults.push({
      moduleName: 'customerService',
      fieldsFilled,
      fieldsSkipped,
      totalFields: fieldsFilled.length + fieldsSkipped.length,
    });
  }

  // Merge AI Agents module
  if (extractedFields.aiAgents) {
    const existing = currentModules.aiAgents || {};
    const { merged, fieldsFilled, fieldsSkipped } = mergeModuleFields(
      existing,
      extractedFields.aiAgents,
      'aiAgents'
    );

    if (fieldsFilled.length > 0) {
      updatedModules.aiAgents = merged as AIAgentsModule;
    }

    moduleResults.push({
      moduleName: 'aiAgents',
      fieldsFilled,
      fieldsSkipped,
      totalFields: fieldsFilled.length + fieldsSkipped.length,
    });
  }

  // Merge ROI module
  if (extractedFields.roi) {
    const existing = currentModules.roi || {};
    const { merged, fieldsFilled, fieldsSkipped } = mergeModuleFields(
      existing,
      extractedFields.roi,
      'roi'
    );

    if (fieldsFilled.length > 0) {
      updatedModules.roi = merged as ROIModule;
    }

    moduleResults.push({
      moduleName: 'roi',
      fieldsFilled,
      fieldsSkipped,
      totalFields: fieldsFilled.length + fieldsSkipped.length,
    });
  }

  // Calculate summary
  const totalFieldsFilled = moduleResults.reduce(
    (sum, m) => sum + m.fieldsFilled.length,
    0
  );
  const totalFieldsSkipped = moduleResults.reduce(
    (sum, m) => sum + m.fieldsSkipped.length,
    0
  );

  const summary: MergeSummary = {
    totalFieldsFilled,
    totalFieldsSkipped,
    moduleResults,
    timestamp: new Date().toISOString(),
  };

  return { updatedModules, summary };
}

/**
 * Gets a user-friendly description of merge results
 */
export function getMergeDescription(summary: MergeSummary): string {
  const { totalFieldsFilled, totalFieldsSkipped, moduleResults } = summary;

  if (totalFieldsFilled === 0) {
    return 'לא נמצאו שדות ריקים למילוי. כל השדות הרלוונטיים כבר מכילים מידע.';
  }

  const modulesWithChanges = moduleResults.filter(
    (m) => m.fieldsFilled.length > 0
  );

  if (modulesWithChanges.length === 0) {
    return 'לא בוצעו שינויים במודולים.';
  }

  const moduleNames = modulesWithChanges
    .map((m) => getModuleHebrewName(m.moduleName))
    .join(', ');

  let description = `מולאו ${totalFieldsFilled} שדות ב-${modulesWithChanges.length} מודולים: ${moduleNames}.`;

  if (totalFieldsSkipped > 0) {
    description += ` ${totalFieldsSkipped} שדות דולגו כי כבר מכילים מידע.`;
  }

  return description;
}

/**
 * Gets Hebrew name for module
 */
export function getModuleHebrewName(moduleName: keyof ExtractedFields): string {
  const names: Record<keyof ExtractedFields, string> = {
    overview: 'סקירה כללית',
    leadsAndSales: 'לידים ומכירות',
    customerService: 'שירות לקוחות',
    aiAgents: 'סוכני AI',
    roi: 'ROI',
  };
  return names[moduleName] || moduleName;
}

/**
 * Gets Hebrew field name for display
 */
export function getFieldHebrewName(fieldName: string): string {
  const fieldNames: Record<string, string> = {
    // Overview fields
    businessType: 'סוג העסק',
    employees: 'מספר עובדים',
    mainChallenge: 'אתגר מרכזי',
    budget: 'תקציב',

    // Leads & Sales fields
    leadCaptureChannels: 'ערוצי קליטת לידים',
    leadStorageMethod: 'שיטת אחסון לידים',
    salesCycle: 'מחזור מכירה',
    conversionRate: 'שיעור המרה',

    // Customer Service fields
    serviceVolume: 'נפח פניות',
    serviceSystemExists: 'קיימת מערכת שירות',
    avgResponseTime: 'זמן תגובה ממוצע',
    mainServiceIssues: 'בעיות שירות עיקריות',

    // AI Agents fields
    interestedInAI: 'עניין ב-AI',
    aiUseCases: 'תרחישי שימוש ב-AI',
    currentAutomation: 'אוטומציה נוכחית',

    // ROI fields
    expectedOutcomes: 'תוצאות צפויות',
    successMetrics: 'מדדי הצלחה',
    timeline: 'ציר זמן',
    currentCosts: 'עלויות נוכחיות',
  };

  return fieldNames[fieldName] || fieldName;
}

/**
 * Formats field merge results for display
 */
export function formatMergeResults(summary: MergeSummary): string[] {
  const lines: string[] = [];

  for (const moduleResult of summary.moduleResults) {
    if (moduleResult.fieldsFilled.length === 0) continue;

    const moduleName = getModuleHebrewName(moduleResult.moduleName);
    lines.push(`\n**${moduleName}:**`);

    for (const fieldName of moduleResult.fieldsFilled) {
      const hebrewName = getFieldHebrewName(fieldName);
      lines.push(`✓ ${hebrewName}`);
    }
  }

  return lines;
}
