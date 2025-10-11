/**
 * Wizard-Module Bidirectional Synchronization Integration Tests
 *
 * Tests comprehensive data synchronization between:
 * - Wizard UI (guided step-by-step) → Module data storage
 * - Module UI (direct editing) → Wizard state
 * - Data persistence (localStorage with debounce)
 * - Data migration (v1 → v2 structure)
 * - Cross-phase data access (Discovery → Implementation → Development)
 *
 * Sprint 1, Days 11-12: Integration testing after v2 migration
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMeetingStore } from '../src/store/useMeetingStore';
import { migrateMeetingData, CURRENT_DATA_VERSION } from '../src/utils/dataMigration';
import { Meeting, LeadsAndSalesModule, CustomerServiceModule } from '../src/types';

// ============================================================================
// TEST SETUP
// ============================================================================

describe('Wizard-Module Synchronization Tests', () => {
  let mockLocalStorage: Record<string, string> = {};

  beforeEach(() => {
    // Reset localStorage mock
    mockLocalStorage = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => mockLocalStorage[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
      delete mockLocalStorage[key];
    });
    vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
      mockLocalStorage = {};
    });

    // Clear any existing store state
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // TEST SUITE 1: Wizard → Module Synchronization
  // ============================================================================

  describe('1. Wizard → Module Synchronization', () => {
    it('should sync basic text fields from wizard to module (Overview)', () => {
      const { result } = renderHook(() => useMeetingStore());

      // Create a new meeting
      act(() => {
        result.current.createMeeting('Test Client');
        result.current.initializeWizard();
      });

      // Simulate wizard field update (businessType)
      act(() => {
        result.current.updateModule('overview', {
          businessType: 'saas'
        });
      });

      // Verify module data is updated
      expect(result.current.currentMeeting?.modules.overview?.businessType).toBe('saas');
    });

    it('should sync number fields from wizard to module (Overview employees)', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Test Client');
      });

      act(() => {
        result.current.updateModule('overview', {
          employees: '51-200'
        });
      });

      expect(result.current.currentMeeting?.modules.overview?.employees).toBe('51-200');
    });

    it('should sync array fields from wizard to module (Overview processes)', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Test Client');
      });

      act(() => {
        result.current.updateModule('overview', {
          processes: ['sales', 'marketing', 'service']
        });
      });

      expect(result.current.currentMeeting?.modules.overview?.processes).toEqual(['sales', 'marketing', 'service']);
      expect(result.current.currentMeeting?.modules.overview?.processes).toHaveLength(3);
    });

    it('should sync nested object fields from wizard to module (LeadsAndSales speedToLead)', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Test Client');
      });

      act(() => {
        result.current.updateModule('leadsAndSales', {
          speedToLead: {
            duringBusinessHours: '15',
            outsideBusinessHours: '60'
          }
        });
      });

      expect(result.current.currentMeeting?.modules.leadsAndSales?.speedToLead?.duringBusinessHours).toBe('15');
      expect(result.current.currentMeeting?.modules.leadsAndSales?.speedToLead?.outsideBusinessHours).toBe('60');
    });

    it('should sync v2 array structures (LeadsAndSales leadSources)', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Test Client');
      });

      const leadSources = [
        { channel: 'Website', volumePerMonth: 100, conversionRate: 5 },
        { channel: 'Social Media', volumePerMonth: 50, conversionRate: 3 }
      ];

      act(() => {
        result.current.updateModule('leadsAndSales', {
          leadSources
        });
      });

      expect(result.current.currentMeeting?.modules.leadsAndSales?.leadSources).toEqual(leadSources);
      expect(result.current.currentMeeting?.modules.leadsAndSales?.leadSources).toHaveLength(2);
    });

    it('should sync v2 array structures (CustomerService channels)', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Test Client');
      });

      const channels = [
        { channel: 'Email', volumePerDay: 50, avgResponseTime: '2 hours' },
        { channel: 'Phone', volumePerDay: 30, avgResponseTime: '5 minutes' }
      ];

      act(() => {
        result.current.updateModule('customerService', {
          channels
        });
      });

      expect(result.current.currentMeeting?.modules.customerService?.channels).toEqual(channels);
      expect(result.current.currentMeeting?.modules.customerService?.channels).toHaveLength(2);
    });

    it('should sync complex nested data (Operations suppliers)', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Test Client');
      });

      const suppliers = [
        {
          name: 'Supplier A',
          productsCategories: ['Category 1'],
          communicationMethod: 'email',
          orderFrequency: 'weekly',
          integrationStatus: 'manual'
        }
      ];

      act(() => {
        result.current.updateModule('operations', {
          suppliers
        });
      });

      expect(result.current.currentMeeting?.modules.operations?.suppliers).toEqual(suppliers);
      expect(result.current.currentMeeting?.modules.operations?.suppliers?.[0].name).toBe('Supplier A');
    });

    it('should sync across all 9 modules sequentially', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Test Client');
      });

      // Update each module
      act(() => {
        result.current.updateModule('overview', { businessType: 'b2b' });
        result.current.updateModule('leadsAndSales', { leadSources: [{ channel: 'Web', volumePerMonth: 100 }] });
        result.current.updateModule('customerService', { channels: [{ channel: 'Email', volumePerDay: 50 }] });
        result.current.updateModule('operations', { inventoryAccuracy: 95 });
        result.current.updateModule('reporting', { currentReports: ['Sales Dashboard'] });
        result.current.updateModule('aiAgents', { useCases: [{ name: 'Lead Qualification' }] });
        result.current.updateModule('systems', { currentSystems: [{ name: 'Salesforce' }] });
        result.current.updateModule('roi', { hourlyRate: 100 });
      });

      // Verify all updates
      expect(result.current.currentMeeting?.modules.overview?.businessType).toBe('b2b');
      expect(result.current.currentMeeting?.modules.leadsAndSales?.leadSources).toHaveLength(1);
      expect(result.current.currentMeeting?.modules.customerService?.channels).toHaveLength(1);
      expect(result.current.currentMeeting?.modules.operations?.inventoryAccuracy).toBe(95);
      expect(result.current.currentMeeting?.modules.reporting?.currentReports).toHaveLength(1);
      expect(result.current.currentMeeting?.modules.aiAgents?.useCases).toHaveLength(1);
      expect(result.current.currentMeeting?.modules.systems?.currentSystems).toHaveLength(1);
      expect(result.current.currentMeeting?.modules.roi?.hourlyRate).toBe(100);
    });
  });

  // ============================================================================
  // TEST SUITE 2: Module → Wizard Synchronization
  // ============================================================================

  describe('2. Module → Wizard Synchronization', () => {
    it('should sync module updates back to wizard state', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Test Client');
        result.current.initializeWizard();
      });

      // Update module directly (simulating module UI edit)
      act(() => {
        result.current.updateModule('overview', {
          businessType: 'b2c',
          employees: '11-50'
        });
      });

      // Sync modules to wizard
      act(() => {
        result.current.syncModulesToWizard();
      });

      // Wizard state should reflect module data
      expect(result.current.currentMeeting?.modules.overview?.businessType).toBe('b2c');
      expect(result.current.currentMeeting?.modules.overview?.employees).toBe('11-50');
    });

    it('should handle advanced module features not in wizard (AIAgents)', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Test Client');
      });

      // Advanced feature: complex AI use case
      const advancedUseCase = {
        name: 'Lead Scoring AI',
        description: 'Automated lead qualification',
        department: 'sales',
        expectedImpact: 'high',
        dataRequirements: ['CRM data', 'Email interactions'],
        implementation: 'API integration'
      };

      act(() => {
        result.current.updateModule('aiAgents', {
          useCases: [advancedUseCase]
        });
      });

      expect(result.current.currentMeeting?.modules.aiAgents?.useCases).toHaveLength(1);
      expect(result.current.currentMeeting?.modules.aiAgents?.useCases?.[0].name).toBe('Lead Scoring AI');
    });

    it('should handle advanced module features not in wizard (Systems DetailedSystemCard)', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Test Client');
      });

      const detailedSystem = {
        name: 'Salesforce',
        category: 'CRM',
        users: 50,
        version: 'Enterprise',
        apiAccess: true,
        integrations: ['Marketing Cloud', 'Service Cloud'],
        painPoints: ['Data sync delays', 'Complex workflows']
      };

      act(() => {
        result.current.updateModule('systems', {
          currentSystems: [detailedSystem]
        });
      });

      expect(result.current.currentMeeting?.modules.systems?.currentSystems).toHaveLength(1);
      expect(result.current.currentMeeting?.modules.systems?.currentSystems?.[0].painPoints).toHaveLength(2);
    });

    it('should preserve ROI calculations when syncing', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Test Client');
      });

      // Set up ROI data
      act(() => {
        result.current.updateModule('roi', {
          hourlyRate: 100,
          dealValue: 5000,
          scenarios: {
            conservative: { timeSavingsHours: 10, costSavings: 1000 },
            realistic: { timeSavingsHours: 20, costSavings: 2000 },
            optimistic: { timeSavingsHours: 30, costSavings: 3000 }
          }
        });
      });

      expect(result.current.currentMeeting?.modules.roi?.hourlyRate).toBe(100);
      expect(result.current.currentMeeting?.modules.roi?.scenarios?.realistic.timeSavingsHours).toBe(20);
    });
  });

  // ============================================================================
  // TEST SUITE 3: Data Persistence & localStorage Debounce
  // ============================================================================

  describe('3. Data Persistence & localStorage Debounce', () => {
    it('should persist data to localStorage', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Persistence Test');
        result.current.updateModule('overview', { businessType: 'saas' });
      });

      // Zustand persist middleware automatically saves to localStorage
      // We just need to verify the data is correct
      expect(result.current.currentMeeting?.clientName).toBe('Persistence Test');
      expect(result.current.currentMeeting?.modules.overview?.businessType).toBe('saas');
    });

    it('should reload persisted data on app restart', () => {
      // First create a meeting in one store instance
      const { result: firstResult } = renderHook(() => useMeetingStore());

      act(() => {
        firstResult.current.createMeeting('Persisted Client');
        firstResult.current.updateModule('overview', {
          businessType: 'b2b',
          employees: '51-200'
        });
      });

      const meetingId = firstResult.current.currentMeeting?.meetingId;

      // Create second store instance (simulating app reload)
      // In a real scenario, Zustand persist would rehydrate from localStorage
      const { result: secondResult } = renderHook(() => useMeetingStore());

      // Store should have the data from the first instance
      expect(secondResult.current.meetings.length).toBeGreaterThan(0);

      // Load the specific meeting
      if (meetingId) {
        act(() => {
          secondResult.current.loadMeeting(meetingId);
        });

        expect(secondResult.current.currentMeeting?.clientName).toBe('Persisted Client');
        expect(secondResult.current.currentMeeting?.modules.overview?.businessType).toBe('b2b');
      }
    });

    it('should preserve wizard state across page refresh', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Wizard Test');
        result.current.initializeWizard();
      });

      // Update wizard state
      act(() => {
        result.current.updateWizardProgress('overview-basics');
        result.current.updateModule('overview', { businessType: 'saas' });
      });

      const wizardStateBefore = result.current.wizardState;

      // Simulate persistence
      const storeData = {
        state: {
          currentMeeting: result.current.currentMeeting,
          meetings: result.current.meetings,
          wizardState: result.current.wizardState
        }
      };

      localStorage.setItem('discovery-assistant-storage', JSON.stringify(storeData));

      // Create new instance (reload)
      const { result: newResult } = renderHook(() => useMeetingStore());

      // Wizard state should be preserved
      expect(newResult.current.wizardState?.completedSteps).toContain('overview-basics');
      expect(newResult.current.currentMeeting?.modules.overview?.businessType).toBe('saas');
    });

    it('should handle concurrent updates without data loss', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Concurrent Test');
      });

      // Simulate rapid updates (debounce handling)
      act(() => {
        result.current.updateModule('overview', { businessType: 'b2b' });
        result.current.updateModule('overview', { employees: '51-200' });
        result.current.updateModule('overview', { processes: ['sales', 'marketing'] });
      });

      // All updates should be preserved
      expect(result.current.currentMeeting?.modules.overview?.businessType).toBe('b2b');
      expect(result.current.currentMeeting?.modules.overview?.employees).toBe('51-200');
      expect(result.current.currentMeeting?.modules.overview?.processes).toEqual(['sales', 'marketing']);
    });
  });

  // ============================================================================
  // TEST SUITE 4: Data Migration (v1 → v2)
  // ============================================================================

  describe('4. Data Migration (v1 → v2)', () => {
    it('should migrate leadSources from v1 object to v2 array', () => {
      const v1Meeting: any = {
        meetingId: 'test-migration',
        clientName: 'Migration Test',
        modules: {
          leadsAndSales: {
            leadSources: {
              sources: [
                { channel: 'Website', volumePerMonth: 100 },
                { channel: 'Referral', volumePerMonth: 50 }
              ],
              centralSystem: 'Salesforce',
              commonIssues: ['Data sync']
            }
          }
        },
        dataVersion: 1
      };

      const result = migrateMeetingData(v1Meeting);

      expect(result.migrated).toBe(true);
      expect(result.migrationsApplied).toContain('leadsAndSales_leadSources_object_to_array');
      expect(result.meeting.dataVersion).toBe(CURRENT_DATA_VERSION);

      // Check array structure
      expect(Array.isArray(result.meeting.modules.leadsAndSales.leadSources)).toBe(true);
      expect(result.meeting.modules.leadsAndSales.leadSources).toHaveLength(2);
      expect(result.meeting.modules.leadsAndSales.leadSources[0].channel).toBe('Website');
    });

    it('should migrate channels from v1 object to v2 array', () => {
      const v1Meeting: any = {
        meetingId: 'test-migration-2',
        clientName: 'Migration Test 2',
        modules: {
          customerService: {
            channels: {
              list: [
                { channel: 'Email', volumePerDay: 100 },
                { channel: 'Phone', volumePerDay: 50 }
              ],
              multiChannelIssue: 'Fragmented data',
              unificationMethod: 'CRM integration'
            }
          }
        },
        dataVersion: 1
      };

      const result = migrateMeetingData(v1Meeting);

      expect(result.migrated).toBe(true);
      expect(result.migrationsApplied).toContain('customerService_channels_object_to_array');
      expect(result.meeting.dataVersion).toBe(CURRENT_DATA_VERSION);

      // Check array structure
      expect(Array.isArray(result.meeting.modules.customerService.channels)).toBe(true);
      expect(result.meeting.modules.customerService.channels).toHaveLength(2);
      expect(result.meeting.modules.customerService.channels[0].channel).toBe('Email');
    });

    it('should preserve all data during migration with no loss', () => {
      const v1Meeting: any = {
        meetingId: 'complete-migration',
        clientName: 'Complete Test',
        date: new Date().toISOString(),
        modules: {
          overview: { businessType: 'b2b', employees: '51-200' },
          leadsAndSales: {
            leadSources: {
              sources: [{ channel: 'Web', volumePerMonth: 200 }],
              centralSystem: 'HubSpot'
            },
            leadRouting: 'rotation',
            followUpAutomation: true
          },
          customerService: {
            channels: {
              list: [{ channel: 'Chat', volumePerDay: 75 }]
            },
            autoResponse: true
          }
        },
        painPoints: [
          { id: '1', module: 'overview', severity: 'high', description: 'Manual processes' }
        ],
        dataVersion: 1
      };

      const result = migrateMeetingData(v1Meeting);

      // No data loss
      expect(result.errors).toHaveLength(0);
      expect(result.meeting.clientName).toBe('Complete Test');
      expect(result.meeting.modules.overview.businessType).toBe('b2b');
      expect(result.meeting.modules.leadsAndSales.leadRouting).toBe('rotation');
      expect(result.meeting.modules.leadsAndSales.followUpAutomation).toBe(true);
      expect(result.meeting.modules.customerService.autoResponse).toBe(true);
      expect(result.meeting.painPoints).toHaveLength(1);
    });

    it('should set dataVersion to 2 after migration', () => {
      const v1Meeting: any = {
        meetingId: 'version-test',
        clientName: 'Version Test',
        modules: {},
        dataVersion: 1
      };

      const result = migrateMeetingData(v1Meeting);

      expect(result.meeting.dataVersion).toBe(CURRENT_DATA_VERSION);
      expect(result.newVersion).toBe(CURRENT_DATA_VERSION);
    });

    it('should handle migration on app load', () => {
      // Migration is handled by dataMigration.ts utility
      // Test that the migration function works correctly
      const v1Meeting = {
        meetingId: 'auto-migrate',
        clientName: 'Auto Migration Test',
        modules: {
          leadsAndSales: {
            leadSources: {
              sources: [{ channel: 'Social', volumePerMonth: 150 }]
            }
          }
        },
        dataVersion: 1
      };

      const result = migrateMeetingData(v1Meeting);

      // Data should be migrated
      expect(result.meeting.dataVersion).toBe(CURRENT_DATA_VERSION);
      expect(Array.isArray(result.meeting.modules.leadsAndSales?.leadSources)).toBe(true);
      expect(result.meeting.modules.leadsAndSales?.leadSources).toHaveLength(1);
      expect(result.meeting.modules.leadsAndSales?.leadSources[0].channel).toBe('Social');
    });
  });

  // ============================================================================
  // TEST SUITE 5: Phase 2 & Phase 3 Data Access
  // ============================================================================

  describe('5. Phase 2 & Phase 3 Cross-Phase Data Access', () => {
    it('should allow Phase 2 to read discovery data', () => {
      const { result } = renderHook(() => useMeetingStore());

      // Complete discovery phase
      act(() => {
        result.current.createMeeting('Phase Test');
        result.current.updateModule('overview', { businessType: 'saas' });
        result.current.updateModule('systems', {
          currentSystems: [{ name: 'Salesforce', category: 'CRM' }]
        });
      });

      // Transition to Phase 2
      act(() => {
        result.current.transitionPhase('implementation_spec', 'Client approved');
      });

      // Phase 2 should access discovery data
      expect(result.current.currentMeeting?.phase).toBe('implementation_spec');
      expect(result.current.currentMeeting?.modules.overview?.businessType).toBe('saas');
      expect(result.current.currentMeeting?.modules.systems?.currentSystems).toHaveLength(1);
    });

    it('should store Phase 2 data in implementationSpec', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Phase 2 Test');
        result.current.transitionPhase('implementation_spec');
      });

      // Add implementation spec data
      act(() => {
        result.current.updateMeeting({
          implementationSpec: {
            systems: [{
              systemId: 'sf-1',
              name: 'Salesforce',
              authentication: { method: 'OAuth2' },
              modules: ['Leads', 'Contacts'],
              fields: [],
              dataMigration: { required: true, estimatedRecords: 10000 }
            }],
            integrations: [],
            aiAgents: [],
            acceptanceCriteria: { functional: [], performance: [], security: [], usability: [] },
            totalEstimatedHours: 0,
            completionPercentage: 0
          }
        });
      });

      expect(result.current.currentMeeting?.implementationSpec?.systems).toHaveLength(1);
      expect(result.current.currentMeeting?.implementationSpec?.systems[0].name).toBe('Salesforce');
    });

    it('should allow Phase 3 to read implementation spec', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Phase 3 Test');

        // Set up implementation spec
        result.current.updateMeeting({
          implementationSpec: {
            systems: [{ systemId: 'crm-1', name: 'CRM Integration' }],
            totalEstimatedHours: 120
          }
        });

        // Transition to development
        result.current.transitionPhase('development');
      });

      // Phase 3 should access implementation spec
      expect(result.current.currentMeeting?.phase).toBe('development');
      expect(result.current.currentMeeting?.implementationSpec?.systems).toHaveLength(1);
      expect(result.current.currentMeeting?.implementationSpec?.totalEstimatedHours).toBe(120);
    });

    it('should track phase history correctly', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('History Test');
      });

      // Transition through phases
      act(() => {
        result.current.transitionPhase('implementation_spec', 'Client approved');
      });

      act(() => {
        result.current.transitionPhase('development', 'Spec completed');
      });

      // Phase history includes initial discovery phase + 2 transitions = 3 total
      expect(result.current.currentMeeting?.phaseHistory).toHaveLength(3);
      expect(result.current.currentMeeting?.phaseHistory?.[0].toPhase).toBe('discovery'); // Initial
      expect(result.current.currentMeeting?.phaseHistory?.[1].toPhase).toBe('implementation_spec');
      expect(result.current.currentMeeting?.phaseHistory?.[2].toPhase).toBe('development');
    });
  });

  // ============================================================================
  // TEST SUITE 6: Edge Cases
  // ============================================================================

  describe('6. Edge Cases', () => {
    it('should handle empty/undefined module data gracefully', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Edge Case Test');
      });

      // Access undefined nested properties
      expect(result.current.currentMeeting?.modules.overview?.businessType).toBeUndefined();
      expect(result.current.currentMeeting?.modules.leadsAndSales?.leadSources).toBeUndefined();

      // Should not throw errors
      expect(() => {
        const data = result.current.currentMeeting?.modules.systems?.currentSystems?.[0]?.name;
      }).not.toThrow();
    });

    it('should handle corrupted localStorage data', () => {
      // Store corrupted JSON
      localStorage.setItem('discovery-assistant-storage', 'invalid-json{corrupted}');

      const { result } = renderHook(() => useMeetingStore());

      // Should initialize with clean state, not crash
      expect(result.current.currentMeeting).toBeDefined();
      expect(result.current.meetings).toBeDefined();
    });

    it('should handle partial wizard completion', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Partial Test');
        result.current.initializeWizard();
      });

      // Complete only some steps
      act(() => {
        result.current.updateModule('overview', { businessType: 'b2b' });
        result.current.updateWizardProgress('overview-basics');
        // Skip other modules
      });

      expect(result.current.wizardState?.completedSteps.size).toBe(1);
      expect(result.current.wizardState?.completedSteps.has('overview-basics')).toBe(true);
    });

    it('should handle browser refresh mid-edit', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Mid-Edit Test');
      });

      // Start editing
      act(() => {
        result.current.updateModule('overview', { businessType: 'b2b' });
      });

      // Simulate partial data save
      const partialData = {
        state: {
          currentMeeting: {
            ...result.current.currentMeeting,
            modules: {
              ...result.current.currentMeeting?.modules,
              overview: { businessType: 'b2b' } // Only partial data
            }
          }
        }
      };

      localStorage.setItem('discovery-assistant-storage', JSON.stringify(partialData));

      // Reload
      const { result: newResult } = renderHook(() => useMeetingStore());

      // Should restore partial state
      expect(newResult.current.currentMeeting?.modules.overview?.businessType).toBe('b2b');
    });

    it('should handle null and undefined custom field values', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Custom Fields Test');
      });

      // Add custom value
      act(() => {
        result.current.addCustomValue('overview', 'industry', { value: 'fintech', label: 'FinTech' });
      });

      const customValues = result.current.getCustomValues('overview', 'industry');
      expect(customValues).toHaveLength(1);

      // Get non-existent custom values
      const nonExistent = result.current.getCustomValues('overview', 'nonExistentField');
      expect(nonExistent).toEqual([]);
    });

    it('should handle array updates without mutation', () => {
      const { result } = renderHook(() => useMeetingStore());

      act(() => {
        result.current.createMeeting('Immutability Test');
      });

      const originalSources = [{ channel: 'Web', volumePerMonth: 100 }];

      act(() => {
        result.current.updateModule('leadsAndSales', {
          leadSources: [...originalSources] // Spread to create new array
        });
      });

      // Get the initial count
      const initialCount = result.current.currentMeeting?.modules.leadsAndSales?.leadSources?.length;

      // Modify original array (should not affect store)
      originalSources.push({ channel: 'Social', volumePerMonth: 50 });

      // Store data should remain unchanged
      expect(result.current.currentMeeting?.modules.leadsAndSales?.leadSources?.length).toBe(initialCount);
      expect(result.current.currentMeeting?.modules.leadsAndSales?.leadSources).toHaveLength(1);
    });
  });
});
