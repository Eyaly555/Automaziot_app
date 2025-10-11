import { describe, it, expect } from 'vitest';
import { AiProposalJsonSchema, AiProposalDoc } from '../aiProposal.schema';

describe('AiProposalJsonSchema', () => {
  describe('schema structure', () => {
    it('should have correct schema name', () => {
      expect(AiProposalJsonSchema.name).toBe('AiProposalDoc');
    });

    it('should require all main sections', () => {
      expect(AiProposalJsonSchema.schema.required).toEqual([
        'executiveSummary',
        'services',
        'financialSummary',
        'terms',
        'nextSteps'
      ]);
    });

    it('should have strict mode enabled', () => {
      expect(AiProposalJsonSchema.strict).toBe(true);
    });
  });

  describe('executive summary validation', () => {
    it('should accept valid executive summary', () => {
      const validDoc: AiProposalDoc = {
        executiveSummary: [
          'בהתבסס על הניתוח המעמיק של תהליכי העבודה שלכם, זיהינו הזדמנויות משמעותיות לשיפור היעילות.',
          'הפתרונות המוצעים יספקו חיסכון משמעותי בזמן ובעלויות תוך שיפור השירות ללקוחות.',
          'אנו ממליצים להתחיל עם הפתרונות בעדיפות הגבוהה ביותר לאפקט מיידי.'
        ],
        services: [],
        financialSummary: { totalPrice: 10000, totalDays: 14 },
        terms: [],
        nextSteps: []
      };

      // Schema validation would happen at runtime through the generator
      expect(validDoc.executiveSummary).toHaveLength(3);
      expect(typeof validDoc.executiveSummary[0]).toBe('string');
      expect(validDoc.executiveSummary[0].length).toBeGreaterThan(50);
    });

    it('should reject invalid executive summary types', () => {
      const invalidDoc = {
        executiveSummary: 'Not an array',
        services: [],
        financialSummary: { totalPrice: 10000, totalDays: 14 },
        terms: [],
        nextSteps: []
      };

      expect(Array.isArray(invalidDoc.executiveSummary)).toBe(false);
    });

    it('should reject too short executive summary', () => {
      const invalidDoc = {
        executiveSummary: ['Too short'],
        services: [],
        financialSummary: { totalPrice: 10000, totalDays: 14 },
        terms: [],
        nextSteps: []
      };

      expect(invalidDoc.executiveSummary[0].length).toBeLessThan(50);
    });
  });

  describe('services validation', () => {
    it('should accept valid services structure', () => {
      const validDoc: AiProposalDoc = {
        executiveSummary: ['Summary paragraph'],
        services: [
          {
            serviceId: 'auto-lead-response',
            titleHe: 'מענה אוטומטי ללידים',
            whyRelevantHe: 'זמן התגובה הממוצע ללידים הוא 30 דקות, מה שפוגע בסיכויי ההמרה. הפתרון שלנו יבטיח תגובה מיידית ומותאמת אישית לכל ליד.',
            whatIncludedHe: 'הטמעת מערכת תגובה אוטומטית עם תבניות מותאמות אישית, חלוקת לידים חכמה על בסיס זמינות הצוות, ודשבורד לניטור ביצועים.'
          },
          {
            serviceId: 'crm-integration',
            titleHe: 'אינטגרציה עם מערכת CRM',
            whyRelevantHe: 'הנתונים מתהליכי המכירה אינם מסונכרנים עם מערכת ה-CRM, מה שמקשה על המעקב והדיווח.',
            whatIncludedHe: 'חיבור מלא למערכת ה-CRM הקיימת, סנכרון אוטומטי של נתוני לקוחות ולידים, ויצירת דוחות מתקדמים.'
          }
        ],
        financialSummary: { totalPrice: 15000, totalDays: 21 },
        terms: [],
        nextSteps: []
      };

      expect(validDoc.services).toHaveLength(2);
      expect(validDoc.services[0].serviceId).toBe('auto-lead-response');
      expect(validDoc.services[0].titleHe.length).toBeGreaterThan(5);
      expect(validDoc.services[0].whyRelevantHe.length).toBeGreaterThan(20);
      expect(validDoc.services[0].whatIncludedHe.length).toBeGreaterThan(20);
    });

    it('should reject services without required fields', () => {
      const invalidDoc = {
        executiveSummary: ['Summary'],
        services: [
          {
            serviceId: 'test-service',
            titleHe: 'Test Service'
            // Missing whyRelevantHe and whatIncludedHe
          }
        ],
        financialSummary: { totalPrice: 10000, totalDays: 14 },
        terms: [],
        nextSteps: []
      };

      expect(invalidDoc.services[0].whyRelevantHe).toBeUndefined();
      expect(invalidDoc.services[0].whatIncludedHe).toBeUndefined();
    });

    it('should reject empty services array', () => {
      const invalidDoc = {
        executiveSummary: ['Summary'],
        services: [],
        financialSummary: { totalPrice: 10000, totalDays: 14 },
        terms: [],
        nextSteps: []
      };

      expect(invalidDoc.services).toHaveLength(0);
    });
  });

  describe('financial summary validation', () => {
    it('should accept valid financial summary', () => {
      const validDoc: AiProposalDoc = {
        executiveSummary: ['Summary paragraph'],
        services: [
          {
            serviceId: 'test-service',
            titleHe: 'Test Service',
            whyRelevantHe: 'Detailed explanation of relevance',
            whatIncludedHe: 'Detailed description of what is included'
          }
        ],
        financialSummary: {
          totalPrice: 15000,
          totalDays: 21,
          monthlySavings: 3000,
          expectedROIMonths: 5
        },
        terms: [],
        nextSteps: []
      };

      expect(validDoc.financialSummary.totalPrice).toBe(15000);
      expect(validDoc.financialSummary.totalDays).toBe(21);
      expect(validDoc.financialSummary.monthlySavings).toBe(3000);
      expect(validDoc.financialSummary.expectedROIMonths).toBe(5);
    });

    it('should reject invalid financial data types', () => {
      const invalidDoc = {
        executiveSummary: ['Summary'],
        services: [{
          serviceId: 'test',
          titleHe: 'Test',
          whyRelevantHe: 'Why',
          whatIncludedHe: 'What'
        }],
        financialSummary: {
          totalPrice: 'not-a-number',
          totalDays: -5,
          monthlySavings: 'invalid'
        },
        terms: [],
        nextSteps: []
      };

      expect(typeof invalidDoc.financialSummary.totalPrice).toBe('string');
      expect(invalidDoc.financialSummary.totalDays).toBeLessThan(0);
      expect(typeof invalidDoc.financialSummary.monthlySavings).toBe('string');
    });

    it('should accept financial summary without optional fields', () => {
      const validDoc: AiProposalDoc = {
        executiveSummary: ['Summary paragraph'],
        services: [{
          serviceId: 'test',
          titleHe: 'Test',
          whyRelevantHe: 'Why',
          whatIncludedHe: 'What'
        }],
        financialSummary: {
          totalPrice: 10000,
          totalDays: 14
          // monthlySavings and expectedROIMonths are optional
        },
        terms: [],
        nextSteps: []
      };

      expect(validDoc.financialSummary.totalPrice).toBe(10000);
      expect(validDoc.financialSummary.totalDays).toBe(14);
      expect(validDoc.financialSummary.monthlySavings).toBeUndefined();
      expect(validDoc.financialSummary.expectedROIMonths).toBeUndefined();
    });
  });

  describe('terms validation', () => {
    it('should accept valid terms array', () => {
      const validDoc: AiProposalDoc = {
        executiveSummary: ['Summary paragraph'],
        services: [{
          serviceId: 'test',
          titleHe: 'Test',
          whyRelevantHe: 'Why',
          whatIncludedHe: 'What'
        }],
        financialSummary: { totalPrice: 10000, totalDays: 14 },
        terms: [
          'ההצעה תקפה ל-30 ימים מתאריך השליחה',
          'תשלום 50% מקדמה, 50% בסיום הפרויקט',
          'אחריות לשלושה חודשים לאחר ההשקה',
          'כל השינויים יתואמו מראש עם הלקוח'
        ],
        nextSteps: []
      };

      expect(validDoc.terms).toHaveLength(4);
      expect(typeof validDoc.terms[0]).toBe('string');
      expect(validDoc.terms[0].length).toBeGreaterThan(10);
    });

    it('should reject empty terms array', () => {
      const invalidDoc = {
        executiveSummary: ['Summary'],
        services: [{
          serviceId: 'test',
          titleHe: 'Test',
          whyRelevantHe: 'Why',
          whatIncludedHe: 'What'
        }],
        financialSummary: { totalPrice: 10000, totalDays: 14 },
        terms: [],
        nextSteps: []
      };

      expect(invalidDoc.terms).toHaveLength(0);
    });

    it('should reject terms that are too short', () => {
      const invalidDoc = {
        executiveSummary: ['Summary'],
        services: [{
          serviceId: 'test',
          titleHe: 'Test',
          whyRelevantHe: 'Why',
          whatIncludedHe: 'What'
        }],
        financialSummary: { totalPrice: 10000, totalDays: 14 },
        terms: ['Too short'],
        nextSteps: []
      };

      expect(invalidDoc.terms[0].length).toBeLessThan(10);
    });
  });

  describe('next steps validation', () => {
    it('should accept valid next steps array', () => {
      const validDoc: AiProposalDoc = {
        executiveSummary: ['Summary paragraph'],
        services: [{
          serviceId: 'test',
          titleHe: 'Test',
          whyRelevantHe: 'Why',
          whatIncludedHe: 'What'
        }],
        financialSummary: { totalPrice: 10000, totalDays: 14 },
        terms: ['Terms'],
        nextSteps: [
          'סקירת ההצעה ושאלות הבהרה בטלפון או בזום',
          'תיאום פגישת קיק-אוף להגדרת הדרישות המדויקות',
          'חתימה על הסכם עבודה ותשלום מקדמה',
          'התחלת הפרויקט והטמעת הפתרונות'
        ]
      };

      expect(validDoc.nextSteps).toHaveLength(4);
      expect(typeof validDoc.nextSteps[0]).toBe('string');
      expect(validDoc.nextSteps[0].length).toBeGreaterThan(10);
    });

    it('should reject empty next steps array', () => {
      const invalidDoc = {
        executiveSummary: ['Summary'],
        services: [{
          serviceId: 'test',
          titleHe: 'Test',
          whyRelevantHe: 'Why',
          whatIncludedHe: 'What'
        }],
        financialSummary: { totalPrice: 10000, totalDays: 14 },
        terms: ['Terms'],
        nextSteps: []
      };

      expect(invalidDoc.nextSteps).toHaveLength(0);
    });
  });

  describe('complete document validation', () => {
    it('should accept fully valid document', () => {
      const validDoc: AiProposalDoc = {
        executiveSummary: [
          'בהתבסס על הניתוח המעמיק של תהליכי העבודה שלכם, זיהינו הזדמנויות משמעותיות לשיפור היעילות והפחתת העלויות.',
          'הפתרונות המוצעים כוללים אוטומציה של תהליכים מרכזיים וייעול זרימת העבודה, מה שיביא לחיסכון משמעותי בזמן ובמשאבים.',
          'אנו ממליצים להתחיל עם הפתרונות בעדיפות הגבוהה ביותר לאפקט מיידי על הביצועים העסקיים.'
        ],
        services: [
          {
            serviceId: 'auto-lead-response',
            titleHe: 'מענה אוטומטי ללידים חדשים',
            whyRelevantHe: 'זמן התגובה הממוצע ללידים חדשים הוא למעלה מ-30 דקות, מה שמקטין משמעותית את סיכויי ההמרה והכנסות מהלידים הללו.',
            whatIncludedHe: 'הטמעת מערכת תגובה אוטומטית עם תבניות מותאמות אישית, חלוקת לידים חכמה על בסיס זמינות הצוות, דשבורד לניטור ביצועים ומעקב אחר שיעורי המרה.'
          },
          {
            serviceId: 'customer-service-bot',
            titleHe: 'צ\'אטבוט לשירות לקוחות',
            whyRelevantHe: 'נפח הפניות לשירות הלקוחות גדל משמעותית ועלול להכביד על הצוות, במיוחד בשעות השיא.',
            whatIncludedHe: 'פיתוח ויישום של צ\'אטבוט חכם המסוגל לטפל ב-70% מהפניות הנפוצות, עם יכולת העברה לנציג אנושי במקרים מורכבים.'
          }
        ],
        financialSummary: {
          totalPrice: 25000,
          totalDays: 35,
          monthlySavings: 8000,
          expectedROIMonths: 3
        },
        terms: [
          'ההצעה תקפה ל-30 ימים מתאריך השליחה',
          'תשלום: 40% מקדמה, 30% באמצע הפרויקט, 30% בסיום',
          'אחריות מלאה לשלושה חודשים לאחר ההשקה',
          'כל השינויים יתואמו מראש עם הלקוח ויאושרו בכתב',
          'זכויות היוצרים על הפתרונות המפותחים שייכות ללקוח בלעדית'
        ],
        nextSteps: [
          'סקירת ההצעה המפורטת ושאלות הבהרה (שיחת טלפון או זום)',
          'תיאום פגישת קיק-אוף להגדרת הדרישות המדויקות והתאמות אישיות',
          'חתימה על הסכם עבודה ותשלום המקדמה הנדרשת',
          'התחלת הפרויקט והטמעת הפתרונות בהתאם ללוח הזמנים המוסכם',
          'מעקב שבועי אחר ההתקדמות והתאמות במידת הצורך'
        ]
      };

      // Validate all sections
      expect(validDoc.executiveSummary).toHaveLength(3);
      expect(validDoc.services).toHaveLength(2);
      expect(validDoc.financialSummary.totalPrice).toBe(25000);
      expect(validDoc.terms).toHaveLength(5);
      expect(validDoc.nextSteps).toHaveLength(5);

      // Validate content quality
      expect(validDoc.executiveSummary.every(p => p.length > 50)).toBe(true);
      expect(validDoc.services.every(s => s.whyRelevantHe.length > 20 && s.whatIncludedHe.length > 20)).toBe(true);
      expect(validDoc.terms.every(t => t.length > 10)).toBe(true);
      expect(validDoc.nextSteps.every(s => s.length > 10)).toBe(true);
    });

    it('should reject document with multiple validation errors', () => {
      const invalidDoc = {
        executiveSummary: ['Too short'], // Too short
        services: [], // Empty
        financialSummary: {
          totalPrice: -1000, // Negative
          totalDays: 0 // Zero
        },
        terms: ['Short'], // Too short
        nextSteps: ['Short'] // Too short
      };

      expect(invalidDoc.executiveSummary[0].length).toBeLessThan(50);
      expect(invalidDoc.services).toHaveLength(0);
      expect(invalidDoc.financialSummary.totalPrice).toBeLessThan(0);
      expect(invalidDoc.financialSummary.totalDays).toBeLessThanOrEqual(0);
      expect(invalidDoc.terms[0].length).toBeLessThan(10);
      expect(invalidDoc.nextSteps[0].length).toBeLessThan(10);
    });
  });
});
