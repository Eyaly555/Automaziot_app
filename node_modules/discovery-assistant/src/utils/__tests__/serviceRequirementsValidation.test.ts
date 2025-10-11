/**
 * Unit tests for service requirements validation utilities
 *
 * Tests the Phase 2 validation system that ensures all purchased services
 * have completed technical requirement forms before allowing Phase 2 → Phase 3 transition.
 */

import { describe, it, expect } from 'vitest';
import {
  validateServiceRequirements,
  isPhase2Complete,
  getServiceCompletionStatus,
  type ServiceValidationResult
} from '../serviceRequirementsValidation';
import type { Meeting } from '../../types';

describe('serviceRequirementsValidation', () => {
  // ============================================================================
  // validateServiceRequirements
  // ============================================================================

  describe('validateServiceRequirements', () => {
    it('should return valid when all services completed', () => {
      const purchasedServices = [
        { id: 'auto-lead-response', name: 'Auto Lead Response', nameHe: 'תגובה אוטומטית ללידים' },
        { id: 'ai-faq-bot', name: 'FAQ Bot', nameHe: 'בוט FAQ' }
      ];

      const implementationSpec = {
        automations: [
          { serviceId: 'auto-lead-response', requirements: {}, completedAt: '2025-01-01' }
        ],
        aiAgentServices: [
          { serviceId: 'ai-faq-bot', requirements: {}, completedAt: '2025-01-01' }
        ]
      };

      const result = validateServiceRequirements(purchasedServices, implementationSpec);

      expect(result.isValid).toBe(true);
      expect(result.missingServices).toHaveLength(0);
      expect(result.completedCount).toBe(2);
      expect(result.totalCount).toBe(2);
    });

    it('should return invalid when services are missing from automations', () => {
      const purchasedServices = [
        { id: 'auto-lead-response', name: 'Auto Lead Response', nameHe: 'תגובה אוטומטית ללידים' },
        { id: 'ai-faq-bot', name: 'FAQ Bot', nameHe: 'בוט FAQ' }
      ];

      const implementationSpec = {
        automations: [
          { serviceId: 'auto-lead-response', requirements: {}, completedAt: '2025-01-01' }
        ]
        // Missing ai-faq-bot
      };

      const result = validateServiceRequirements(purchasedServices, implementationSpec);

      expect(result.isValid).toBe(false);
      expect(result.missingServices).toContain('בוט FAQ');
      expect(result.completedCount).toBe(1);
      expect(result.totalCount).toBe(2);
    });

    it('should return invalid when services are missing from integrations', () => {
      const purchasedServices = [
        { id: 'zapier-integration', name: 'Zapier Integration', nameHe: 'אינטגרציה Zapier' },
        { id: 'make-integration', name: 'Make.com Integration', nameHe: 'אינטגרציה Make.com' }
      ];

      const implementationSpec = {
        integrationServices: [
          { serviceId: 'zapier-integration', requirements: {} }
        ]
        // Missing make-integration
      };

      const result = validateServiceRequirements(purchasedServices, implementationSpec);

      expect(result.isValid).toBe(false);
      expect(result.missingServices).toContain('אינטגרציה Make.com');
      expect(result.completedCount).toBe(1);
      expect(result.totalCount).toBe(2);
    });

    it('should handle empty purchased services', () => {
      const result = validateServiceRequirements([], {});

      expect(result.isValid).toBe(true);
      expect(result.missingServices).toHaveLength(0);
      expect(result.completedCount).toBe(0);
      expect(result.totalCount).toBe(0);
    });

    it('should handle missing implementationSpec', () => {
      const purchasedServices = [
        { id: 'auto-lead-response', name: 'Auto Lead Response', nameHe: 'תגובה אוטומטית ללידים' }
      ];

      const result = validateServiceRequirements(purchasedServices, undefined);

      expect(result.isValid).toBe(false);
      expect(result.missingServices).toContain('תגובה אוטומטית ללידים');
      expect(result.completedCount).toBe(0);
      expect(result.totalCount).toBe(1);
    });

    it('should handle null implementationSpec', () => {
      const purchasedServices = [
        { id: 'auto-lead-response', name: 'Auto Lead Response', nameHe: 'תגובה אוטומטית ללידים' }
      ];

      const result = validateServiceRequirements(purchasedServices, null);

      expect(result.isValid).toBe(false);
      expect(result.missingServices).toContain('תגובה אוטומטית ללידים');
      expect(result.completedCount).toBe(0);
      expect(result.totalCount).toBe(1);
    });

    it('should detect services from all service categories', () => {
      const purchasedServices = [
        { id: 'service-1', name: 'Automation Service', nameHe: 'שירות אוטומציה' },
        { id: 'service-2', name: 'AI Service', nameHe: 'שירות AI' },
        { id: 'service-3', name: 'Integration Service', nameHe: 'שירות אינטגרציה' },
        { id: 'service-4', name: 'System Implementation', nameHe: 'הטמעת מערכת' },
        { id: 'service-5', name: 'Additional Service', nameHe: 'שירות נוסף' }
      ];

      const implementationSpec = {
        automations: [
          { serviceId: 'service-1', requirements: {} }
        ],
        aiAgentServices: [
          { serviceId: 'service-2', requirements: {} }
        ],
        integrationServices: [
          { serviceId: 'service-3', requirements: {} }
        ],
        systemImplementations: [
          { serviceId: 'service-4', requirements: {} }
        ],
        additionalServices: [
          { serviceId: 'service-5', requirements: {} }
        ]
      };

      const result = validateServiceRequirements(purchasedServices, implementationSpec);

      expect(result.isValid).toBe(true);
      expect(result.missingServices).toHaveLength(0);
      expect(result.completedCount).toBe(5);
      expect(result.totalCount).toBe(5);
    });

    it('should handle services without serviceId gracefully', () => {
      const purchasedServices = [
        { id: 'service-1', name: 'Service 1', nameHe: 'שירות 1' }
      ];

      const implementationSpec = {
        automations: [
          { requirements: {} } // Missing serviceId
        ]
      };

      const result = validateServiceRequirements(purchasedServices, implementationSpec);

      expect(result.isValid).toBe(false);
      expect(result.missingServices).toContain('שירות 1');
      expect(result.completedCount).toBe(0);
    });

    it('should use name when nameHe is missing', () => {
      const purchasedServices = [
        { id: 'service-1', name: 'Service 1' } // No nameHe
      ];

      const implementationSpec = {
        automations: []
      };

      const result = validateServiceRequirements(purchasedServices, implementationSpec);

      expect(result.isValid).toBe(false);
      expect(result.missingServices).toContain('Service 1');
    });

    it('should handle implementationSpec with empty arrays', () => {
      const purchasedServices = [
        { id: 'service-1', name: 'Service 1', nameHe: 'שירות 1' }
      ];

      const implementationSpec = {
        automations: [],
        aiAgentServices: [],
        integrationServices: [],
        systemImplementations: [],
        additionalServices: []
      };

      const result = validateServiceRequirements(purchasedServices, implementationSpec);

      expect(result.isValid).toBe(false);
      expect(result.completedCount).toBe(0);
      expect(result.totalCount).toBe(1);
    });

    it('should not count duplicate service IDs multiple times', () => {
      const purchasedServices = [
        { id: 'service-1', name: 'Service 1', nameHe: 'שירות 1' }
      ];

      const implementationSpec = {
        automations: [
          { serviceId: 'service-1', requirements: {} },
          { serviceId: 'service-1', requirements: {} } // Duplicate
        ]
      };

      const result = validateServiceRequirements(purchasedServices, implementationSpec);

      expect(result.isValid).toBe(true);
      expect(result.completedCount).toBe(1); // Should count only once
    });

    it('should handle malformed service category gracefully', () => {
      const purchasedServices = [
        { id: 'service-1', name: 'Service 1', nameHe: 'שירות 1' }
      ];

      const implementationSpec = {
        automations: 'not-an-array' // Invalid structure
      };

      const result = validateServiceRequirements(purchasedServices, implementationSpec);

      expect(result.isValid).toBe(false);
      expect(result.missingServices).toContain('שירות 1');
    });
  });

  // ============================================================================
  // isPhase2Complete
  // ============================================================================

  describe('isPhase2Complete', () => {
    it('should return true when all services completed', () => {
      const meeting = {
        modules: {
          proposal: {
            purchasedServices: [
              { id: 'auto-lead-response', name: 'Auto Lead Response', nameHe: 'תגובה אוטומטית ללידים' }
            ]
          }
        },
        implementationSpec: {
          automations: [
            { serviceId: 'auto-lead-response', requirements: {}, completedAt: '2025-01-01' }
          ]
        }
      } as unknown as Meeting;

      expect(isPhase2Complete(meeting)).toBe(true);
    });

    it('should return false when services are incomplete', () => {
      const meeting = {
        modules: {
          proposal: {
            purchasedServices: [
              { id: 'auto-lead-response', name: 'Auto Lead Response', nameHe: 'תגובה אוטומטית ללידים' }
            ]
          }
        },
        implementationSpec: {
          automations: []
        }
      } as unknown as Meeting;

      expect(isPhase2Complete(meeting)).toBe(false);
    });

    it('should return false for null meeting', () => {
      expect(isPhase2Complete(null)).toBe(false);
    });

    it('should return false for undefined meeting', () => {
      expect(isPhase2Complete(undefined as any)).toBe(false);
    });

    it('should return TRUE when purchasedServices is empty (CRITICAL FIX)', () => {
      const meeting = {
        modules: {
          proposal: {
            purchasedServices: []
          }
        },
        implementationSpec: {
          automations: []
        }
      } as unknown as Meeting;

      // FIXED: Zero services = nothing to validate = complete
      expect(isPhase2Complete(meeting)).toBe(true);
    });

    it('should return TRUE when purchasedServices is missing (CRITICAL FIX)', () => {
      const meeting = {
        modules: {
          proposal: {}
        },
        implementationSpec: {
          automations: []
        }
      } as unknown as Meeting;

      // FIXED: No services = nothing to validate = complete
      expect(isPhase2Complete(meeting)).toBe(true);
    });

    it('should return TRUE when modules is missing (CRITICAL FIX)', () => {
      const meeting = {
        implementationSpec: {
          automations: []
        }
      } as unknown as Meeting;

      // FIXED: No modules = no purchasedServices = nothing to validate = complete
      expect(isPhase2Complete(meeting)).toBe(true);
    });

    it('should return TRUE when proposal module is missing (CRITICAL FIX)', () => {
      const meeting = {
        modules: {},
        implementationSpec: {
          automations: []
        }
      } as unknown as Meeting;

      // FIXED: No proposal module = no purchasedServices = nothing to validate = complete
      expect(isPhase2Complete(meeting)).toBe(true);
    });

    it('should handle multiple service categories correctly', () => {
      const meeting = {
        modules: {
          proposal: {
            purchasedServices: [
              { id: 'service-1', name: 'Service 1', nameHe: 'שירות 1' },
              { id: 'service-2', name: 'Service 2', nameHe: 'שירות 2' },
              { id: 'service-3', name: 'Service 3', nameHe: 'שירות 3' }
            ]
          }
        },
        implementationSpec: {
          automations: [
            { serviceId: 'service-1', requirements: {} }
          ],
          aiAgentServices: [
            { serviceId: 'service-2', requirements: {} }
          ],
          integrationServices: [
            { serviceId: 'service-3', requirements: {} }
          ]
        }
      } as unknown as Meeting;

      expect(isPhase2Complete(meeting)).toBe(true);
    });

    it('should return false when only some services are completed', () => {
      const meeting = {
        modules: {
          proposal: {
            purchasedServices: [
              { id: 'service-1', name: 'Service 1', nameHe: 'שירות 1' },
              { id: 'service-2', name: 'Service 2', nameHe: 'שירות 2' }
            ]
          }
        },
        implementationSpec: {
          automations: [
            { serviceId: 'service-1', requirements: {} }
          ]
          // Missing service-2
        }
      } as unknown as Meeting;

      expect(isPhase2Complete(meeting)).toBe(false);
    });
  });

  // ============================================================================
  // getServiceCompletionStatus
  // ============================================================================

  describe('getServiceCompletionStatus', () => {
    it('should return detailed status when services are completed', () => {
      const meeting = {
        modules: {
          proposal: {
            purchasedServices: [
              { id: 'service-1', name: 'Service 1', nameHe: 'שירות 1' },
              { id: 'service-2', name: 'Service 2', nameHe: 'שירות 2' }
            ]
          }
        },
        implementationSpec: {
          automations: [
            { serviceId: 'service-1', requirements: {} },
            { serviceId: 'service-2', requirements: {} }
          ]
        }
      } as unknown as Meeting;

      const status = getServiceCompletionStatus(meeting);

      expect(status.isValid).toBe(true);
      expect(status.missingServices).toHaveLength(0);
      expect(status.completedCount).toBe(2);
      expect(status.totalCount).toBe(2);
    });

    it('should return detailed status when services are incomplete', () => {
      const meeting = {
        modules: {
          proposal: {
            purchasedServices: [
              { id: 'service-1', name: 'Service 1', nameHe: 'שירות 1' },
              { id: 'service-2', name: 'Service 2', nameHe: 'שירות 2' }
            ]
          }
        },
        implementationSpec: {
          automations: [
            { serviceId: 'service-1', requirements: {} }
          ]
        }
      } as unknown as Meeting;

      const status = getServiceCompletionStatus(meeting);

      expect(status.isValid).toBe(false);
      expect(status.missingServices).toContain('שירות 2');
      expect(status.completedCount).toBe(1);
      expect(status.totalCount).toBe(2);
    });

    it('should return empty status for null meeting', () => {
      const status = getServiceCompletionStatus(null);

      expect(status.isValid).toBe(false);
      expect(status.missingServices).toHaveLength(0);
      expect(status.completedCount).toBe(0);
      expect(status.totalCount).toBe(0);
    });

    it('should return valid status for meeting with no purchased services', () => {
      const meeting = {
        modules: {
          proposal: {
            purchasedServices: []
          }
        },
        implementationSpec: {}
      } as unknown as Meeting;

      const status = getServiceCompletionStatus(meeting);

      expect(status.isValid).toBe(true); // No services to complete
      expect(status.missingServices).toHaveLength(0);
      expect(status.completedCount).toBe(0);
      expect(status.totalCount).toBe(0);
    });

    it('should handle missing purchasedServices gracefully', () => {
      const meeting = {
        modules: {
          proposal: {}
        },
        implementationSpec: {}
      } as unknown as Meeting;

      const status = getServiceCompletionStatus(meeting);

      expect(status.isValid).toBe(true);
      expect(status.totalCount).toBe(0);
    });

    it('should handle missing implementationSpec gracefully', () => {
      const meeting = {
        modules: {
          proposal: {
            purchasedServices: [
              { id: 'service-1', name: 'Service 1', nameHe: 'שירות 1' }
            ]
          }
        }
      } as unknown as Meeting;

      const status = getServiceCompletionStatus(meeting);

      expect(status.isValid).toBe(false);
      expect(status.missingServices).toContain('שירות 1');
      expect(status.completedCount).toBe(0);
      expect(status.totalCount).toBe(1);
    });

    it('should provide accurate completion percentage information', () => {
      const meeting = {
        modules: {
          proposal: {
            purchasedServices: [
              { id: 'service-1', name: 'Service 1', nameHe: 'שירות 1' },
              { id: 'service-2', name: 'Service 2', nameHe: 'שירות 2' },
              { id: 'service-3', name: 'Service 3', nameHe: 'שירות 3' },
              { id: 'service-4', name: 'Service 4', nameHe: 'שירות 4' }
            ]
          }
        },
        implementationSpec: {
          automations: [
            { serviceId: 'service-1', requirements: {} },
            { serviceId: 'service-2', requirements: {} }
          ]
        }
      } as unknown as Meeting;

      const status = getServiceCompletionStatus(meeting);

      expect(status.completedCount).toBe(2);
      expect(status.totalCount).toBe(4);
      expect(status.isValid).toBe(false);
      expect(status.missingServices).toHaveLength(2);
    });
  });

  // ============================================================================
  // Edge Cases and Integration Scenarios
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle service with both nameHe and name correctly', () => {
      const purchasedServices = [
        { id: 'service-1', name: 'English Name', nameHe: 'שם עברי' }
      ];

      const implementationSpec = {
        automations: []
      };

      const result = validateServiceRequirements(purchasedServices, implementationSpec);

      // Should prefer nameHe
      expect(result.missingServices).toContain('שם עברי');
    });

    it('should handle services with special characters in IDs', () => {
      const purchasedServices = [
        { id: 'service-1-special_chars-123', name: 'Service', nameHe: 'שירות' }
      ];

      const implementationSpec = {
        automations: [
          { serviceId: 'service-1-special_chars-123', requirements: {} }
        ]
      };

      const result = validateServiceRequirements(purchasedServices, implementationSpec);

      expect(result.isValid).toBe(true);
      expect(result.completedCount).toBe(1);
    });

    it('should handle very large number of services efficiently', () => {
      const purchasedServices = Array.from({ length: 100 }, (_, i) => ({
        id: `service-${i}`,
        name: `Service ${i}`,
        nameHe: `שירות ${i}`
      }));

      const implementationSpec = {
        automations: Array.from({ length: 100 }, (_, i) => ({
          serviceId: `service-${i}`,
          requirements: {}
        }))
      };

      const result = validateServiceRequirements(purchasedServices, implementationSpec);

      expect(result.isValid).toBe(true);
      expect(result.completedCount).toBe(100);
      expect(result.totalCount).toBe(100);
    });

    it('should handle service IDs with different casing', () => {
      const purchasedServices = [
        { id: 'Service-1', name: 'Service 1', nameHe: 'שירות 1' }
      ];

      const implementationSpec = {
        automations: [
          { serviceId: 'service-1', requirements: {} } // Different case
        ]
      };

      const result = validateServiceRequirements(purchasedServices, implementationSpec);

      // Should be case-sensitive (not match)
      expect(result.isValid).toBe(false);
    });
  });
});
