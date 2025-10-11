import { SelectOption } from '../types';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface Recommendation {
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  category: string;
}

export class CustomValuesService {
  /**
   * Validate custom entries based on field type and existing values
   */
  static validateCustomValue(
    value: string,
    fieldType: string,
    existingValues: string[]
  ): ValidationResult {
    // Check for empty value
    if (!value || value.trim().length === 0) {
      return { valid: false, error: 'הערך לא יכול להיות ריק' };
    }

    // Check for duplicates (case insensitive)
    const normalizedValue = value.trim().toLowerCase();
    const isDuplicate = existingValues.some(
      existing => existing.toLowerCase() === normalizedValue
    );

    if (isDuplicate) {
      return { valid: false, error: 'ערך זה כבר קיים ברשימה' };
    }

    // Check minimum length
    if (value.trim().length < 2) {
      return { valid: false, error: 'הערך חייב להכיל לפחות 2 תווים' };
    }

    // Check maximum length
    if (value.trim().length > 100) {
      return { valid: false, error: 'הערך ארוך מדי (מקסימום 100 תווים)' };
    }

    // Field-specific validation
    switch (fieldType) {
      case 'system':
        return this.validateSystemName(value);
      case 'role':
        return this.validateRoleName(value);
      case 'leadSource':
        return this.validateLeadSource(value);
      case 'serviceChannel':
        return this.validateServiceChannel(value);
      case 'process':
        return this.validateProcessName(value);
      case 'integration':
        return this.validateIntegrationName(value);
      default:
        return { valid: true };
    }
  }

  /**
   * Validate system name
   */
  private static validateSystemName(value: string): ValidationResult {
    // Check for special characters that might cause issues
    const invalidChars = /[<>:"\/\\|?*]/;
    if (invalidChars.test(value)) {
      return { valid: false, error: 'שם המערכת מכיל תווים לא חוקיים' };
    }

    // Check if it looks like a valid system name
    if (value.length < 2) {
      return { valid: false, error: 'שם המערכת קצר מדי' };
    }

    return { valid: true };
  }

  /**
   * Validate role/position name
   */
  private static validateRoleName(value: string): ValidationResult {
    // Check for numbers only
    if (/^\d+$/.test(value)) {
      return { valid: false, error: 'שם התפקיד לא יכול להכיל רק מספרים' };
    }

    return { valid: true };
  }

  /**
   * Validate lead source
   */
  private static validateLeadSource(value: string): ValidationResult {
    // Basic validation for lead sources
    if (value.length < 2) {
      return { valid: false, error: 'שם מקור הליד קצר מדי' };
    }

    return { valid: true };
  }

  /**
   * Validate service channel
   */
  private static validateServiceChannel(value: string): ValidationResult {
    // Basic validation for service channels
    if (value.length < 2) {
      return { valid: false, error: 'שם ערוץ השירות קצר מדי' };
    }

    return { valid: true };
  }

  /**
   * Validate process name
   */
  private static validateProcessName(value: string): ValidationResult {
    // Check for meaningful process name
    if (value.length < 3) {
      return { valid: false, error: 'שם התהליך קצר מדי' };
    }

    return { valid: true };
  }

  /**
   * Validate integration name
   */
  private static validateIntegrationName(value: string): ValidationResult {
    // Check for valid integration name
    if (value.length < 2) {
      return { valid: false, error: 'שם האינטגרציה קצר מדי' };
    }

    return { valid: true };
  }

  /**
   * Process custom values for ROI calculations
   */
  static processCustomForROI(
    customValues: SelectOption[],
    category: string
  ): number {
    if (!customValues || customValues.length === 0) {
      return 0;
    }

    let impact = 0;

    switch (category) {
      case 'systems':
        // Each unknown/custom system potentially needs integration
        // Estimate 20 hours per custom system for integration
        impact = customValues.length * 20 * 100; // 20 hours * 100 NIS/hour
        break;

      case 'leadSources':
        // Custom lead sources might need special handling
        // Estimate 5 hours per custom lead source for setup
        impact = customValues.length * 5 * 100;
        break;

      case 'serviceChannels':
        // Custom service channels need setup and training
        // Estimate 10 hours per custom channel
        impact = customValues.length * 10 * 100;
        break;

      case 'processes':
        // Custom processes need analysis and automation
        // Estimate 15 hours per custom process
        impact = customValues.length * 15 * 100;
        break;

      default:
        // Default estimation for unknown categories
        impact = customValues.length * 8 * 100;
        break;
    }

    return impact;
  }

  /**
   * Generate recommendations for custom values
   */
  static generateCustomRecommendations(
    customValues: SelectOption[],
    category: string
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (!customValues || customValues.length === 0) {
      return recommendations;
    }

    switch (category) {
      case 'systems':
        customValues.forEach(system => {
          recommendations.push({
            title: `אינטגרציה עבור ${system.label}`,
            description: `המערכת "${system.label}" אינה מוכרת במאגר שלנו. מומלץ לבדוק אפשרויות אינטגרציה באמצעות API או Webhooks`,
            priority: 'medium',
            effort: 'high',
            category: 'integration'
          });

          recommendations.push({
            title: `מיפוי תהליכים עבור ${system.label}`,
            description: `יש למפות את התהליכים העסקיים הקשורים למערכת "${system.label}" כדי לזהות הזדמנויות לאוטומציה`,
            priority: 'high',
            effort: 'medium',
            category: 'analysis'
          });
        });
        break;

      case 'leadSources':
        customValues.forEach(source => {
          recommendations.push({
            title: `אוטומציה למקור לידים: ${source.label}`,
            description: `מקור הלידים "${source.label}" דורש הגדרת תהליך אוטומטי לקליטה וניתוב`,
            priority: 'high',
            effort: 'medium',
            category: 'automation'
          });

          recommendations.push({
            title: `מעקב ביצועים עבור ${source.label}`,
            description: `הגדרת KPIs ומעקב אחר ביצועי מקור הלידים "${source.label}"`,
            priority: 'medium',
            effort: 'low',
            category: 'analytics'
          });
        });
        break;

      case 'serviceChannels':
        customValues.forEach(channel => {
          recommendations.push({
            title: `הגדרת ערוץ שירות: ${channel.label}`,
            description: `יש להגדיר תהליכי עבודה ו-SLA עבור ערוץ השירות "${channel.label}"`,
            priority: 'high',
            effort: 'medium',
            category: 'service'
          });

          recommendations.push({
            title: `אוטומציית מענה ב-${channel.label}`,
            description: `בחינת אפשרויות למענה אוטומטי או חצי-אוטומטי בערוץ "${channel.label}"`,
            priority: 'medium',
            effort: 'high',
            category: 'automation'
          });
        });
        break;

      case 'processes':
        customValues.forEach(process => {
          recommendations.push({
            title: `אוטומציית תהליך: ${process.label}`,
            description: `התהליך "${process.label}" זוהה כהזדמנות לאוטומציה. נדרש ניתוח מעמיק`,
            priority: 'high',
            effort: 'high',
            category: 'automation'
          });

          recommendations.push({
            title: `תיעוד תהליך: ${process.label}`,
            description: `יש לתעד את התהליך "${process.label}" באופן מלא לפני אוטומציה`,
            priority: 'critical',
            effort: 'low',
            category: 'documentation'
          });
        });
        break;

      default:
        customValues.forEach(value => {
          recommendations.push({
            title: `ניתוח ערך מותאם: ${value.label}`,
            description: `הערך המותאם "${value.label}" דורש ניתוח נוסף להבנת ההשפעה העסקית`,
            priority: 'medium',
            effort: 'medium',
            category: 'analysis'
          });
        });
        break;
    }

    return recommendations;
  }

  /**
   * Categorize custom value for analysis
   */
  static categorizeCustomValue(value: string, context: string): string {
    // Try to categorize based on keywords
    const lowerValue = value.toLowerCase();

    // System-related keywords
    if (context === 'systems' ||
        lowerValue.includes('crm') ||
        lowerValue.includes('erp') ||
        lowerValue.includes('system') ||
        lowerValue.includes('מערכת')) {
      return 'system';
    }

    // Lead/Sales related
    if (context === 'leadSources' ||
        lowerValue.includes('lead') ||
        lowerValue.includes('ליד') ||
        lowerValue.includes('מכירה')) {
      return 'lead';
    }

    // Service related
    if (context === 'serviceChannels' ||
        lowerValue.includes('service') ||
        lowerValue.includes('שירות') ||
        lowerValue.includes('תמיכה')) {
      return 'service';
    }

    // Process related
    if (context === 'processes' ||
        lowerValue.includes('process') ||
        lowerValue.includes('תהליך') ||
        lowerValue.includes('workflow')) {
      return 'process';
    }

    // Default category
    return 'general';
  }

  /**
   * Estimate automation potential for custom value
   */
  static estimateAutomationPotential(
    value: string,
    category: string
  ): number {
    // Return a percentage (0-100) of automation potential

    const categoryPotentials: Record<string, number> = {
      'system': 70,      // Systems can usually be integrated
      'lead': 80,        // Lead processes are highly automatable
      'service': 75,     // Service channels can be automated
      'process': 85,     // Processes are prime for automation
      'general': 50      // Unknown items have average potential
    };

    const basePotential = categoryPotentials[category] || 50;

    // Adjust based on specific keywords
    const lowerValue = value.toLowerCase();
    let adjustment = 0;

    // Positive indicators (increase potential)
    if (lowerValue.includes('manual') || lowerValue.includes('ידני')) {
      adjustment += 15;
    }
    if (lowerValue.includes('excel') || lowerValue.includes('אקסל')) {
      adjustment += 10;
    }
    if (lowerValue.includes('email') || lowerValue.includes('מייל')) {
      adjustment += 10;
    }

    // Negative indicators (decrease potential)
    if (lowerValue.includes('complex') || lowerValue.includes('מורכב')) {
      adjustment -= 10;
    }
    if (lowerValue.includes('custom') || lowerValue.includes('מותאם')) {
      adjustment -= 5;
    }

    // Calculate final potential (0-100)
    const finalPotential = Math.max(0, Math.min(100, basePotential + adjustment));

    return finalPotential;
  }

  /**
   * Merge custom values with predefined options
   */
  static mergeWithPredefined(
    predefined: SelectOption[],
    custom: SelectOption[]
  ): SelectOption[] {
    // Create a map to avoid duplicates
    const mergedMap = new Map<string, SelectOption>();

    // Add predefined first
    predefined.forEach(option => {
      mergedMap.set(option.value.toLowerCase(), option);
    });

    // Add custom, checking for duplicates
    custom.forEach(option => {
      const key = option.value.toLowerCase();
      if (!mergedMap.has(key)) {
        mergedMap.set(key, { ...option, isCustom: true });
      }
    });

    // Return as array, maintaining order (predefined first, then custom)
    return Array.from(mergedMap.values());
  }
}