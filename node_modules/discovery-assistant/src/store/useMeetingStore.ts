import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Meeting,
  PainPoint,
  ModuleProgress,
  WizardState,
  SelectOption,
  MeetingPhase,
  MeetingStatus,
  PhaseTransition,
  ZohoClientListItem,
  ZohoClientsCache,
  ZohoSyncOptions,
} from '../types';
import { WIZARD_STEPS } from '../config/wizardSteps';
import { syncService } from '../services/syncService';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  supabaseService,
  isSupabaseConfigured as isSupabaseReady,
} from '../services/supabaseService';
import {
  migrateMeetingData,
  needsMigration,
  CURRENT_DATA_VERSION,
} from '../utils/dataMigration';
import { validateServiceRequirements } from '../utils/serviceRequirementsValidation';
import { logger } from '../utils/consoleLogger';
import {
  backupPhaseHistory,
  restorePhaseHistory,
} from '../utils/phaseHistoryBackup';
import {
  getSmartValidationMessages,
  formatValidationMessagesForUI,
} from '../utils/smartValidationMessages';
import { getBackupMetadata } from '../services/meetingBackupService';

interface MeetingStore {
  currentMeeting: Meeting | null;
  meetings: Meeting[];

  // NEW: Zoho clients list management
  zohoClientsList: ZohoClientListItem[];
  zohoClientsCache: ZohoClientsCache | null;
  isLoadingClients: boolean;
  clientsLoadError: string | null;

  // Meeting actions
  createMeeting: (clientName: string) => void;
  updateMeeting: (updates: Partial<Meeting>) => void;
  loadMeeting: (meetingId: string) => void;
  deleteMeeting: (meetingId: string) => void;

  // Zoho-specific actions
  createOrLoadMeeting: (initialData: Partial<Meeting>) => Promise<void>;
  updateZohoLastSync: (time: string) => void;
  setZohoSyncEnabled: (enabled: boolean) => void;
  loadMeetingByZohoId: (recordId: string) => Meeting | null;

  // Module actions
  updateModule: (moduleName: keyof Meeting['modules'], data: any) => void;

  // Pain point actions
  addPainPoint: (painPoint: Omit<PainPoint, 'id'>) => void;
  updatePainPoint: (id: string, updates: Partial<PainPoint>) => void;
  removePainPoint: (id: string) => void;

  // Progress tracking
  getModuleProgress: () => ModuleProgress[];
  getOverallProgress: () => number;

  // Export/Import
  exportMeeting: () => string;
  importMeeting: (data: string) => void;

  // Timer
  startTimer: () => void;
  stopTimer: () => void;
  timerInterval: number | null;

  // Wizard state
  wizardState: WizardState | null;

  // Wizard actions
  initializeWizard: () => void;
  setWizardState: (state: WizardState | null) => void;
  updateWizardProgress: (stepId: string) => void;
  navigateWizardStep: (
    direction: 'next' | 'prev' | 'jump',
    target?: number
  ) => void;
  skipWizardSection: (sectionId: string) => void;
  syncWizardToModules: () => void;
  syncModulesToWizard: () => void;

  // Custom field values
  addCustomValue: (
    moduleId: string,
    fieldName: string,
    value: SelectOption
  ) => void;
  removeCustomValue: (
    moduleId: string,
    fieldName: string,
    value: string
  ) => void;
  getCustomValues: (moduleId: string, fieldName: string) => SelectOption[];

  // Supabase sync
  isSyncing: boolean;
  lastSyncTime: Date | string | null;
  syncError: string | null;
  syncEnabled: boolean;

  // Sync actions
  syncMeeting: (meetingId?: string) => Promise<void>;
  syncAllMeetings: () => Promise<void>;
  pullMeetings: () => Promise<void>;
  enableSync: (userId: string) => void;
  disableSync: () => void;
  getSyncStatus: () => { pending: number; failed: number; isOnline: boolean };
  resolveConflict: (
    meetingId: string,
    resolution: 'local' | 'remote'
  ) => Promise<void>;

  // Update meeting field with optional sync
  updateMeetingField: (moduleId: string, field: string, value: any) => void;

  // NEW: Phase 2 implementation spec update
  updateImplementationSpec: (
    category:
      | 'automations'
      | 'integrationServices'
      | 'aiAgentServices'
      | 'systemImplementations'
      | 'additionalServices',
    serviceId: string,
    data: any
  ) => void;

  // NEW: Phase management actions
  getDefaultStatusForPhase: (phase: MeetingPhase) => MeetingStatus;
  transitionPhase: (toPhase: MeetingPhase, notes?: string) => boolean;
  updatePhaseStatus: (status: MeetingStatus) => void;
  canTransitionTo: (phase: MeetingPhase) => boolean;
  getPhaseHistory: () => PhaseTransition[];
  getPhaseProgress: (phase?: MeetingPhase) => number;

  // NEW: Task management actions (Phase 3)
  addTask: (task: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (taskId: string, updates: Partial<any>) => void;
  deleteTask: (taskId: string) => void;
  assignTask: (taskId: string, assignee: string) => void;
  updateTaskStatus: (
    taskId: string,
    status: 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'done'
  ) => void;
  addTaskTestCase: (taskId: string, testCase: any) => void;
  updateTaskTestCase: (
    taskId: string,
    testCaseId: string,
    updates: Partial<any>
  ) => void;
  addBlocker: (taskId: string, blocker: any) => void;
  resolveBlocker: (taskId: string, blockerId: string) => void;

  // NEW: Zoho clients list actions
  fetchZohoClients: (options?: {
    force?: boolean;
    filters?: any;
  }) => Promise<void>;
  loadClientFromZoho: (recordId: string) => Promise<void>;
  syncCurrentToZoho: (options?: ZohoSyncOptions) => Promise<boolean>;
  refreshClientsList: () => Promise<void>;
  searchClients: (query: string) => Promise<ZohoClientListItem[]>;
  clearClientsCache: () => void;

  // NEW: Meeting data reset and backup
  resetMeetingData: (createBackup?: boolean) => Promise<boolean>;
  restoreFromBackup: (backupId: string) => Promise<boolean>;
  getAvailableBackups: () => any[];

  // Save tracking for UI feedback
  lastSavedTime: Date | null;

  // Internal cache fields (private, used for optimization)
  // These are excluded from persistence and reinitialized on rehydration
  _validationCache: Map<string, { result: boolean; timestamp: number }>;
  _lastLoggedState: Record<string, boolean>;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Normalizes phase names to lowercase to handle legacy/Zoho data with capitalized phases
 *
 * This prevents "Discovery" from Zoho being treated as different from "discovery" in the app.
 * Also ensures backward compatibility with old data that might have capitalized phases.
 *
 * @param phase - The phase value (potentially capitalized)
 * @returns Normalized phase in lowercase
 */
const normalizePhase = (phase: string | undefined): MeetingPhase => {
  if (!phase) return 'discovery';
  const normalized = phase.toLowerCase();
  // Validate it's a valid phase
  if (
    ['discovery', 'implementation_spec', 'development', 'completed'].includes(
      normalized
    )
  ) {
    return normalized as MeetingPhase;
  }
  logger.warn('Invalid phase value, defaulting to discovery', { phase });
  return 'discovery';
};

// Helper function to get localStorage key based on Zoho integration
const getStorageKey = (meeting: Meeting | null): string => {
  if (meeting?.zohoIntegration?.recordId) {
    return `discovery_zoho_${meeting.zohoIntegration.recordId}`;
  }
  return meeting
    ? `discovery_standalone_${meeting.meetingId}`
    : 'discovery_temp';
};

// Immediate save to Supabase (no debounce to prevent data loss)
const saveToSupabase = async (meeting: Meeting) => {
  if (!isSupabaseReady()) {
    return; // Supabase not configured, skip
  }

  // Save immediately
  try {
    logger.info('Saving to Supabase (immediate)');
    const result = await supabaseService.saveMeeting(meeting);
    if (result.success) {
      logger.info('Saved to Supabase successfully');
    } else {
      logger.error('Failed to save to Supabase', result.error);
    }
  } catch (error) {
    logger.error('Supabase save error:', error);
  }
};

export const useMeetingStore = create<MeetingStore>()(
  persist(
    (set, get) => ({
      currentMeeting: null,
      meetings: [],
      timerInterval: null,
      wizardState: null,

      // NEW: Zoho clients list state
      zohoClientsList: [],
      zohoClientsCache: null,
      isLoadingClients: false,
      clientsLoadError: null,

      // Save tracking for UI feedback
      lastSavedTime: null,

      // Memoization cache for phase validation to reduce console spam
      _validationCache: new Map<
        string,
        { result: boolean; timestamp: number }
      >(),
      _lastLoggedState: {} as Record<string, boolean>,

      /**
       * Creates a new meeting with current data schema version
       *
       * All new meetings are initialized with dataVersion set to CURRENT_DATA_VERSION (2),
       * ensuring they use the latest data structures and require no migration.
       *
       * Data Structure (v2):
       * - LeadsAndSalesModule.leadSources: Direct LeadSource[] array
       * - CustomerServiceModule.channels: Direct ServiceChannel[] array
       * - All modules initialized as empty objects {}
       *
       * The wizard and module modes both use the same data source (meeting.modules),
       * so changes in either mode are immediately reflected in the other.
       *
       * @param clientName - Name of the client for this meeting
       *
       * @example
       * ```typescript
       * const { createMeeting } = useMeetingStore();
       * createMeeting('Acme Corp'); // Creates meeting with dataVersion: 2
       * ```
       */
      createMeeting: (clientName) => {
        const meeting: Meeting = {
          meetingId: generateId(),
          clientName,
          date: new Date(),
          timer: 0,
          dataVersion: CURRENT_DATA_VERSION, // Set current version for new meetings (v2)
          modules: {
            overview: {},
            leadsAndSales: {},
            customerService: {},
            operations: {},
            reporting: {},
            aiAgents: {},
            systems: {},
            roi: {},
            planning: {},
          },
          painPoints: [],
          notes: '',
          // NEW: Initialize phase tracking
          phase: 'discovery',
          status: 'discovery_in_progress',
          phaseHistory: [
            {
              fromPhase: null,
              toPhase: 'discovery',
              timestamp: new Date(),
              transitionedBy: 'system',
            },
          ],
          implementationSpec: undefined,
          developmentTracking: undefined,
        };

        set((state) => ({
          currentMeeting: meeting,
          meetings: [...state.meetings, meeting],
        }));
      },

      updateMeeting: (updates) => {
        set((state) => {
          if (!state.currentMeeting) return state;

          const updatedMeeting = {
            ...state.currentMeeting,
            ...updates,
          };

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map((m) =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            ),
          };
        });
      },

      loadMeeting: (meetingId) => {
        set((state) => {
          const meeting = state.meetings.find((m) => m.meetingId === meetingId);
          if (meeting) {
            // Normalize phase (handle capitalized phases from Zoho/legacy data)
            meeting.phase = normalizePhase(meeting.phase as any);

            // Ensure status exists (for backward compatibility with old data)
            if (!meeting.status) meeting.status = 'discovery_in_progress';

            // ✅ NEW: Restore phase history if missing
            if (!meeting.phaseHistory || meeting.phaseHistory.length === 0) {
              console.warn(
                '[Store] Phase history missing - attempting restore'
              );
              const restored = restorePhaseHistory(meetingId);

              if (restored) {
                meeting.phaseHistory = restored;
                console.log('[Store] ✅ Phase history restored from backup');
              } else {
                // Create default if no backup exists
                meeting.phaseHistory = [
                  {
                    fromPhase: null,
                    toPhase: meeting.phase,
                    timestamp: new Date(),
                    transitionedBy: 'system',
                  },
                ];
                console.warn('[Store] ⚠️ Created default phase history');
              }
            }
          }
          return { currentMeeting: meeting || null };
        });
      },

      deleteMeeting: (meetingId) => {
        set((state) => ({
          meetings: state.meetings.filter((m) => m.meetingId !== meetingId),
          currentMeeting:
            state.currentMeeting?.meetingId === meetingId
              ? null
              : state.currentMeeting,
        }));
      },

      // Zoho-specific actions
      createOrLoadMeeting: async (initialData) => {
        const state = get();

        // If Zoho record ID provided, check for existing meeting
        if (initialData.zohoIntegration?.recordId) {
          const recordId = initialData.zohoIntegration.recordId;

          // STEP 1: Check Supabase first (for cross-device data)
          if (isSupabaseReady()) {
            logger.info('Checking Supabase for existing meeting', { recordId });
            try {
              const supabaseMeeting =
                await supabaseService.loadMeeting(recordId);

              if (supabaseMeeting) {
                logger.info('Found existing meeting in Supabase, loading');
                // Normalize phase (handle capitalized phases from Zoho/legacy data)
                const normalizedPhase = normalizePhase(
                  (initialData.phase as any) || (supabaseMeeting.phase as any)
                );

                // Ensure status exists (for backward compatibility)
                if (!supabaseMeeting.status)
                  supabaseMeeting.status =
                    initialData.status || 'discovery_in_progress';
                if (!supabaseMeeting.phaseHistory)
                  supabaseMeeting.phaseHistory = initialData.phaseHistory || [
                    {
                      fromPhase: null,
                      toPhase: normalizedPhase,
                      timestamp: new Date(),
                      transitionedBy: 'system',
                    },
                  ];

                // Update with any new data from Zoho
                const updatedMeeting = {
                  ...supabaseMeeting,
                  ...initialData,
                  modules: {
                    ...supabaseMeeting.modules,
                    ...(initialData.modules || {}),
                  },
                  phase: normalizedPhase,
                  status: initialData.status || supabaseMeeting.status,
                  phaseHistory:
                    initialData.phaseHistory || supabaseMeeting.phaseHistory,
                };

                set({
                  currentMeeting: updatedMeeting,
                  meetings: [
                    ...state.meetings.filter(
                      (m) => m.meetingId !== supabaseMeeting.meetingId
                    ),
                    updatedMeeting,
                  ],
                });

                return; // Meeting found and loaded - exit
              }
              logger.info(
                'No meeting found in Supabase, checking Zustand state'
              );
            } catch (error) {
              logger.error('Error checking Supabase', error);
              // Continue to Zustand state check
            }
          }

          // STEP 2: Check Zustand state (Zustand persist handles localStorage automatically)
          const existingMeeting = state.meetings.find(
            (m) => m.zohoIntegration?.recordId === recordId
          );
          if (existingMeeting) {
            logger.info('Found existing meeting in Zustand state, loading');
            // Normalize phase (handle capitalized phases from Zoho/legacy data)
            const normalizedPhase = normalizePhase(
              (initialData.phase as any) || (existingMeeting.phase as any)
            );

            // Ensure status exists (for backward compatibility with old data)
            if (!existingMeeting.status)
              existingMeeting.status =
                initialData.status || 'discovery_in_progress';
            if (!existingMeeting.phaseHistory)
              existingMeeting.phaseHistory = initialData.phaseHistory || [
                {
                  fromPhase: null,
                  toPhase: normalizedPhase,
                  timestamp: new Date(),
                  transitionedBy: 'system',
                },
              ];

            // Update with any new data from Zoho
            const updatedMeeting = {
              ...existingMeeting,
              ...initialData,
              modules: {
                ...existingMeeting.modules,
                ...(initialData.modules || {}),
              },
              phase: normalizedPhase,
              status: initialData.status || existingMeeting.status,
              phaseHistory:
                initialData.phaseHistory || existingMeeting.phaseHistory,
            };

            set({
              currentMeeting: updatedMeeting,
              meetings: [
                ...state.meetings.filter(
                  (m) => m.meetingId !== existingMeeting.meetingId
                ),
                updatedMeeting,
              ],
            });

            // Save to Supabase for cross-device sync
            if (isSupabaseReady()) {
              console.log(
                '[Store] Saving existing meeting to Supabase for sync...'
              );
              await supabaseService.saveMeeting(updatedMeeting);
            }

            return; // Meeting found in Zustand state - exit
          }

          // STEP 3: No existing meeting found - create new one
          console.log(
            '[Store] No existing meeting found, creating new one for:',
            recordId
          );
        }

        // Create new meeting with initial data
        // Normalize phase from initialData (handle capitalized phases from Zoho)
        const normalizedPhase = normalizePhase(initialData.phase as any);

        const meeting: Meeting = {
          meetingId: generateId(),
          clientName: initialData.clientName || 'New Client',
          date: new Date(),
          timer: 0,
          dataVersion: CURRENT_DATA_VERSION, // Set current version for new meetings
          modules: {
            overview: initialData.modules?.overview || {},
            leadsAndSales: initialData.modules?.leadsAndSales || {},
            customerService: initialData.modules?.customerService || {},
            operations: initialData.modules?.operations || {},
            reporting: initialData.modules?.reporting || {},
            aiAgents: initialData.modules?.aiAgents || {},
            systems: initialData.modules?.systems || {},
            roi: initialData.modules?.roi || {},
            planning: initialData.modules?.planning || {},
          },
          painPoints: [],
          notes: initialData.notes || '',
          // Initialize phase tracking with normalized phase
          phase: normalizedPhase,
          status: initialData.status || 'discovery_in_progress',
          phaseHistory: initialData.phaseHistory || [
            {
              fromPhase: null,
              toPhase: normalizedPhase,
              timestamp: new Date(),
              transitionedBy: 'system',
            },
          ],
          implementationSpec: initialData.implementationSpec,
          developmentTracking: initialData.developmentTracking,
          zohoIntegration: initialData.zohoIntegration,
        };

        set((state) => ({
          currentMeeting: meeting,
          meetings: [...state.meetings, meeting],
        }));

        // Save to Supabase immediately for new meetings
        if (isSupabaseReady() && meeting.zohoIntegration?.recordId) {
          console.log('[Store] Saving new meeting to Supabase...');
          await supabaseService.saveMeeting(meeting);
        }
      },

      updateZohoLastSync: (time) => {
        set((state) => {
          if (!state.currentMeeting?.zohoIntegration) return state;

          const updatedMeeting = {
            ...state.currentMeeting,
            zohoIntegration: {
              ...state.currentMeeting.zohoIntegration,
              lastSyncTime: time,
            },
          };

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map((m) =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            ),
          };
        });
      },

      setZohoSyncEnabled: (enabled) => {
        set((state) => {
          if (!state.currentMeeting?.zohoIntegration) return state;

          const updatedMeeting = {
            ...state.currentMeeting,
            zohoIntegration: {
              ...state.currentMeeting.zohoIntegration,
              syncEnabled: enabled,
            },
          };

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map((m) =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            ),
          };
        });
      },

      loadMeetingByZohoId: (recordId) => {
        const meeting = get().meetings.find(
          (m) => m.zohoIntegration?.recordId === recordId
        );

        if (meeting) {
          try {
            // Normalize phase (handle capitalized phases from Zoho/legacy data)
            meeting.phase = normalizePhase(meeting.phase as any);

            // Ensure status exists (for backward compatibility with old data)
            if (!meeting.status) meeting.status = 'discovery_in_progress';

            // ✅ NEW: Restore phase history if missing
            if (!meeting.phaseHistory || meeting.phaseHistory.length === 0) {
              console.warn(
                '[Store] Phase history missing - attempting restore'
              );
              const restored = restorePhaseHistory(meeting.meetingId);

              if (restored) {
                meeting.phaseHistory = restored;
                console.log('[Store] ✅ Phase history restored from backup');
              } else {
                // Create default if no backup exists
                meeting.phaseHistory = [
                  {
                    fromPhase: null,
                    toPhase: meeting.phase,
                    timestamp: new Date(),
                    transitionedBy: 'system',
                  },
                ];
                console.warn('[Store] ⚠️ Created default phase history');
              }
            }
            return meeting;
          } catch (e) {
            console.error('Failed to parse meeting data:', e);
          }
        }

        return null;
      },

      updateModule: (moduleName, data) => {
        set((state) => {
          if (!state.currentMeeting) return state;

          const updatedMeeting = {
            ...state.currentMeeting,
            modules: {
              ...state.currentMeeting.modules,
              [moduleName]: {
                ...state.currentMeeting.modules[moduleName],
                ...data,
              },
            },
          };

          // BIDIRECTIONAL SYNC: Overview ↔ LeadsAndSales/CustomerService
          // If overview.leadSources is updated, sync to leadsAndSales.leadSources
          if (moduleName === 'overview' && data.leadSources !== undefined) {
            updatedMeeting.modules.leadsAndSales = {
              ...updatedMeeting.modules.leadsAndSales,
              leadSources: data.leadSources,
            };
          }

          // If leadsAndSales.leadSources is updated, sync to overview.leadSources
          if (
            moduleName === 'leadsAndSales' &&
            data.leadSources !== undefined
          ) {
            updatedMeeting.modules.overview = {
              ...updatedMeeting.modules.overview,
              leadSources: data.leadSources,
            };
          }

          // If overview.serviceChannels is updated, sync to customerService.channels
          if (moduleName === 'overview' && data.serviceChannels !== undefined) {
            updatedMeeting.modules.customerService = {
              ...updatedMeeting.modules.customerService,
              channels: data.serviceChannels,
            };
          }

          // If customerService.channels is updated, sync to overview.serviceChannels
          if (moduleName === 'customerService' && data.channels !== undefined) {
            updatedMeeting.modules.overview = {
              ...updatedMeeting.modules.overview,
              serviceChannels: data.channels,
            };
          }

          // NEW: Systems ↔ Overview sync for CRM fields
          if (
            moduleName === 'systems' &&
            (data.crmStatus !== undefined ||
              data.crmName !== undefined ||
              data.crmSatisfaction !== undefined)
          ) {
            updatedMeeting.modules.overview = {
              ...updatedMeeting.modules.overview,
              crmStatus: data.crmStatus,
              crmName: data.crmName,
              crmSatisfaction: data.crmSatisfaction,
            };
          }

          if (
            moduleName === 'overview' &&
            (data.crmStatus !== undefined ||
              data.crmName !== undefined ||
              data.crmSatisfaction !== undefined)
          ) {
            if (!updatedMeeting.modules.systems)
              updatedMeeting.modules.systems = {};
            updatedMeeting.modules.systems.crmStatus = data.crmStatus;
            updatedMeeting.modules.systems.crmName = data.crmName;
            updatedMeeting.modules.systems.crmSatisfaction =
              data.crmSatisfaction;
          }

          // NEW: Operations ↔ Overview sync for employee count
          if (
            moduleName === 'operations' &&
            data.hr?.employeeCount !== undefined
          ) {
            updatedMeeting.modules.overview = {
              ...updatedMeeting.modules.overview,
              employees: data.hr.employeeCount,
            };
          }

          if (moduleName === 'overview' && data.employees !== undefined) {
            if (!updatedMeeting.modules.operations)
              updatedMeeting.modules.operations = {};
            if (!updatedMeeting.modules.operations.hr)
              updatedMeeting.modules.operations.hr = {};
            updatedMeeting.modules.operations.hr.employeeCount = data.employees;
          }

          // NEW: Systems ↔ Leads & Sales sync for data quality
          if (
            moduleName === 'systems' &&
            data.dataQuality?.duplicates !== undefined
          ) {
            if (!updatedMeeting.modules.leadsAndSales)
              updatedMeeting.modules.leadsAndSales = {};
            updatedMeeting.modules.leadsAndSales.duplicatesFrequency =
              data.dataQuality.duplicates;
          }

          if (
            moduleName === 'leadsAndSales' &&
            data.duplicatesFrequency !== undefined
          ) {
            if (!updatedMeeting.modules.systems)
              updatedMeeting.modules.systems = {};
            if (!updatedMeeting.modules.systems.dataQuality)
              updatedMeeting.modules.systems.dataQuality = {};
            updatedMeeting.modules.systems.dataQuality.duplicates =
              data.duplicatesFrequency;
          }

          // Save to Supabase (immediate)
          saveToSupabase(updatedMeeting);

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map((m) =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            ),
            lastSavedTime: new Date(),
          };
        });
      },

      addPainPoint: (painPoint) => {
        const newPainPoint: PainPoint = {
          ...painPoint,
          id: generateId(),
        };

        set((state) => {
          if (!state.currentMeeting) return state;

          const updatedMeeting = {
            ...state.currentMeeting,
            painPoints: [...state.currentMeeting.painPoints, newPainPoint],
          };

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map((m) =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            ),
          };
        });
      },

      updatePainPoint: (id, updates) => {
        set((state) => {
          if (!state.currentMeeting) return state;

          const updatedMeeting = {
            ...state.currentMeeting,
            painPoints: state.currentMeeting.painPoints.map((pp) =>
              pp.id === id ? { ...pp, ...updates } : pp
            ),
          };

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map((m) =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            ),
          };
        });
      },

      removePainPoint: (id) => {
        set((state) => {
          if (!state.currentMeeting) return state;

          const updatedMeeting = {
            ...state.currentMeeting,
            painPoints: state.currentMeeting.painPoints.filter(
              (pp) => pp.id !== id
            ),
          };

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map((m) =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            ),
          };
        });
      },

      getModuleProgress: () => {
        const meeting = get().currentMeeting;
        if (!meeting) return [];

        // Helper function to check if a value contains meaningful user input
        const hasUserInput = (value: any): boolean => {
          if (value === null || value === undefined || value === '')
            return false;

          // Check arrays - must have non-empty items
          if (Array.isArray(value)) {
            if (value.length === 0) return false;
            // Check if array contains meaningful data
            return value.some((item) => {
              if (typeof item === 'object' && item !== null) {
                // For objects in arrays, check if they have meaningful content
                return Object.keys(item).some((key) => {
                  const val = item[key];
                  return (
                    val !== '' && val !== 0 && val !== null && val !== undefined
                  );
                });
              }
              return item !== '' && item !== null && item !== undefined;
            });
          }

          // Check objects - must have meaningful properties
          if (typeof value === 'object' && value !== null) {
            const keys = Object.keys(value);
            if (keys.length === 0) return false;
            // Recursively check if object has meaningful content
            return keys.some((key) => hasUserInput(value[key]));
          }

          // For primitives, check if they're meaningful
          if (typeof value === 'boolean') {
            // Don't count false as meaningful input for initial state
            return value === true;
          }

          if (typeof value === 'number') {
            // Don't count 0 as meaningful input for initial state
            return value > 0;
          }

          // For strings and other types
          return true;
        };

        const modules: ModuleProgress[] = [
          {
            moduleId: 'overview',
            name: 'Overview',
            hebrewName: 'סקירה כללית',
            completed: 0,
            total: 6,
            status: 'empty',
          },
          {
            moduleId: 'leadsAndSales',
            name: 'Leads and Sales',
            hebrewName: 'לידים ומכירות',
            completed: 0,
            total: 5,
            status: 'empty',
            subModules: [
              {
                id: 'leadSources',
                name: 'Lead Sources',
                hebrewName: 'מקורות לידים',
                status: 'empty',
              },
              {
                id: 'speedToLead',
                name: 'Speed to Lead',
                hebrewName: 'מהירות תגובה',
                status: 'empty',
              },
              {
                id: 'leadRouting',
                name: 'Lead Routing',
                hebrewName: 'ניתוב לידים',
                status: 'empty',
              },
              {
                id: 'followUp',
                name: 'Follow Up',
                hebrewName: 'מעקבים',
                status: 'empty',
              },
              {
                id: 'appointments',
                name: 'Appointments',
                hebrewName: 'קביעת פגישות',
                status: 'empty',
              },
            ],
          },
          {
            moduleId: 'customerService',
            name: 'Customer Service',
            hebrewName: 'שירות לקוחות',
            completed: 0,
            total: 6,
            status: 'empty',
            subModules: [
              {
                id: 'channels',
                name: 'Service Channels',
                hebrewName: 'ערוצי שירות',
                status: 'empty',
              },
              {
                id: 'autoResponse',
                name: 'Auto Response',
                hebrewName: 'מענה אוטומטי',
                status: 'empty',
              },
              {
                id: 'proactiveCommunication',
                name: 'Proactive Communication',
                hebrewName: 'תקשורת יזומה',
                status: 'empty',
              },
              {
                id: 'communityManagement',
                name: 'Community',
                hebrewName: 'ניהול קהילות',
                status: 'empty',
              },
              {
                id: 'reputationManagement',
                name: 'Reputation',
                hebrewName: 'ניהול מוניטין',
                status: 'empty',
              },
              {
                id: 'onboarding',
                name: 'Onboarding',
                hebrewName: 'קליטת לקוחות',
                status: 'empty',
              },
            ],
          },
          {
            moduleId: 'operations',
            name: 'Operations',
            hebrewName: 'תפעול פנימי',
            completed: 0,
            total: 6,
            status: 'empty',
            subModules: [
              {
                id: 'systemSync',
                name: 'System Sync',
                hebrewName: 'סנכרון מערכות',
                status: 'empty',
              },
              {
                id: 'documentManagement',
                name: 'Documents',
                hebrewName: 'ניהול מסמכים',
                status: 'empty',
              },
              {
                id: 'projectManagement',
                name: 'Projects',
                hebrewName: 'ניהול פרויקטים',
                status: 'empty',
              },
              {
                id: 'financialProcesses',
                name: 'Finance',
                hebrewName: 'תהליכים פיננסיים',
                status: 'empty',
              },
              {
                id: 'hr',
                name: 'HR',
                hebrewName: 'משאבי אנוש',
                status: 'empty',
              },
              {
                id: 'crossDepartment',
                name: 'Cross Department',
                hebrewName: 'בין מחלקות',
                status: 'empty',
              },
            ],
          },
          {
            moduleId: 'reporting',
            name: 'Reporting',
            hebrewName: 'דוחות והתראות',
            completed: 0,
            total: 4,
            status: 'empty',
          },
          {
            moduleId: 'aiAgents',
            name: 'AI Agents',
            hebrewName: 'סוכני AI',
            completed: 0,
            total: 3,
            status: 'empty',
          },
          {
            moduleId: 'systems',
            name: 'Systems',
            hebrewName: 'מערכות וטכנולוגיה',
            completed: 0,
            total: 3,
            status: 'empty',
          },
          {
            moduleId: 'roi',
            name: 'ROI',
            hebrewName: 'ROI וכימות',
            completed: 0,
            total: 2,
            status: 'empty',
          },
          {
            moduleId: 'planning',
            name: 'Planning',
            hebrewName: 'סיכום ותכנון',
            completed: 0,
            total: 4,
            status: 'empty',
          },
        ];

        // Calculate actual progress for each module
        modules.forEach((module) => {
          // Guard against undefined modules object
          if (!meeting.modules) {
            module.completed = 0;
            module.status = 'empty';
            return;
          }

          const moduleData =
            meeting.modules[module.moduleId as keyof Meeting['modules']];
          let completed = 0;

          // Count only properties with meaningful user input
          if (moduleData && typeof moduleData === 'object') {
            completed = Object.values(moduleData).filter((v) =>
              hasUserInput(v)
            ).length;
            if (completed > 0) {
              module.status =
                completed >= module.total ? 'completed' : 'in_progress';
            }
          }

          module.completed = Math.min(completed, module.total);
        });

        return modules;
      },

      getOverallProgress: () => {
        const modules = get().getModuleProgress();
        const totalSteps = modules.reduce((acc, m) => acc + m.total, 0);
        const completedSteps = modules.reduce((acc, m) => acc + m.completed, 0);
        return totalSteps > 0
          ? Math.round((completedSteps / totalSteps) * 100)
          : 0;
      },

      exportMeeting: () => {
        const meeting = get().currentMeeting;
        if (!meeting) return '';
        return JSON.stringify(meeting, null, 2);
      },

      importMeeting: (data) => {
        try {
          const meeting = JSON.parse(data);
          // Normalize phase (handle capitalized phases from Zoho/legacy data)
          meeting.phase = normalizePhase(meeting.phase as any);

          // Ensure status exists (for backward compatibility with old data)
          if (!meeting.status) meeting.status = 'discovery_in_progress';
          if (!meeting.phaseHistory)
            meeting.phaseHistory = [
              {
                fromPhase: null,
                toPhase: meeting.phase,
                timestamp: new Date(),
                transitionedBy: 'system',
              },
            ];
          set((state) => ({
            currentMeeting: meeting,
            meetings: [
              ...state.meetings.filter(
                (m) => m.meetingId !== meeting.meetingId
              ),
              meeting,
            ],
          }));
        } catch (error) {
          console.error('Failed to import meeting:', error);
        }
      },

      startTimer: () => {
        const interval = window.setInterval(() => {
          set((state) => {
            if (!state.currentMeeting) return state;

            const updatedMeeting = {
              ...state.currentMeeting,
              timer: (state.currentMeeting.timer || 0) + 1,
            };

            return {
              currentMeeting: updatedMeeting,
              meetings: state.meetings.map((m) =>
                m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
              ),
            };
          });
        }, 1000);

        set({ timerInterval: interval });
      },

      stopTimer: () => {
        const interval = get().timerInterval;
        if (interval) {
          window.clearInterval(interval);
          set({ timerInterval: null });
        }
      },

      // Wizard methods
      initializeWizard: () => {
        const wizardState: WizardState = {
          currentStep: 0,
          currentModuleIndex: 0,
          currentFieldIndex: 0,
          totalSteps: WIZARD_STEPS.length,
          completedSteps: new Set(),
          skippedSections: new Set(),
          navigationHistory: [],
          mode: 'wizard',
        };
        set({ wizardState });

        // Update meeting with wizard state
        const meeting = get().currentMeeting;
        if (meeting) {
          get().updateMeeting({ wizardState });
        }
      },

      setWizardState: (state) => {
        set({ wizardState: state });
        // Update meeting with wizard state
        const meeting = get().currentMeeting;
        if (meeting && state) {
          get().updateMeeting({ wizardState: state });
        }
      },

      updateWizardProgress: (stepId) => {
        set((state) => {
          if (!state.wizardState) return state;

          const completedSteps = new Set(state.wizardState.completedSteps);
          completedSteps.add(stepId);

          const updatedWizardState = {
            ...state.wizardState,
            completedSteps,
          };

          // Update meeting
          if (state.currentMeeting) {
            const updatedMeeting = {
              ...state.currentMeeting,
              wizardState: updatedWizardState,
            };

            return {
              ...state,
              wizardState: updatedWizardState,
              currentMeeting: updatedMeeting,
              meetings: state.meetings.map((m) =>
                m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
              ),
            };
          }

          return {
            ...state,
            wizardState: updatedWizardState,
          };
        });
      },

      navigateWizardStep: (direction, target) => {
        set((state) => {
          if (!state.wizardState) return state;

          let newStep = state.wizardState.currentStep;

          switch (direction) {
            case 'next':
              newStep = Math.min(
                state.wizardState.currentStep + 1,
                state.wizardState.totalSteps - 1
              );
              break;
            case 'prev':
              newStep = Math.max(state.wizardState.currentStep - 1, 0);
              break;
            case 'jump':
              if (target !== undefined) {
                newStep = Math.max(
                  0,
                  Math.min(target, state.wizardState.totalSteps - 1)
                );
              }
              break;
          }

          const updatedWizardState = {
            ...state.wizardState,
            currentStep: newStep,
            navigationHistory: [
              ...state.wizardState.navigationHistory,
              WIZARD_STEPS[newStep]?.id || 'unknown',
            ],
          };

          return {
            ...state,
            wizardState: updatedWizardState,
          };
        });
      },

      skipWizardSection: (sectionId) => {
        set((state) => {
          if (!state.wizardState) return state;

          const skippedSections = new Set(state.wizardState.skippedSections);
          skippedSections.add(sectionId);

          const updatedWizardState = {
            ...state.wizardState,
            skippedSections,
          };

          // Update meeting
          if (state.currentMeeting) {
            const updatedMeeting = {
              ...state.currentMeeting,
              wizardState: updatedWizardState,
            };

            return {
              ...state,
              wizardState: updatedWizardState,
              currentMeeting: updatedMeeting,
              meetings: state.meetings.map((m) =>
                m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
              ),
            };
          }

          return {
            ...state,
            wizardState: updatedWizardState,
          };
        });
      },

      syncWizardToModules: () => {
        // This is called when wizard data changes to sync to modules
        // Since we're using the same updateModule function, data is already synced
        // This is a placeholder for any additional sync logic needed
        const meeting = get().currentMeeting;
        if (meeting) {
          // Trigger a save to ensure persistence
          get().updateMeeting({ ...meeting });
        }
      },

      syncModulesToWizard: () => {
        // This is called when switching from modular to wizard mode
        // to ensure wizard state reflects current module data
        const meeting = get().currentMeeting;
        const wizardState = get().wizardState;

        // Guard: ensure we have the required data
        if (!meeting || !wizardState) {
          console.warn('[syncModulesToWizard] Missing meeting or wizardState');
          return;
        }

        // If modules doesn't exist, initialize it
        if (!meeting.modules) {
          console.warn(
            '[syncModulesToWizard] No modules found, initializing empty modules'
          );
          const updatedMeeting = {
            ...meeting,
            modules: {
              overview: {},
              leadsAndSales: {},
              customerService: {},
              operations: {},
              reporting: {},
              aiAgents: {},
              systems: {},
              roi: {},
              planning: {},
            },
          };
          get().updateMeeting(updatedMeeting);
          return;
        }

        // Calculate which steps should be marked as completed based on module data
        const completedSteps = new Set<string>();

        WIZARD_STEPS.forEach((step) => {
          if (!step.moduleId) return;

          const moduleData = meeting.modules[step.moduleId];
          if (moduleData && typeof moduleData === 'object') {
            const hasData = Object.values(moduleData).some(
              (value) =>
                value !== undefined &&
                value !== null &&
                value !== '' &&
                !(Array.isArray(value) && value.length === 0)
            );
            if (hasData) {
              completedSteps.add(step.id);
            }
          }
        });

        const updatedWizardState = {
          ...wizardState,
          completedSteps,
        };

        get().setWizardState(updatedWizardState);
      },

      // Custom value methods
      addCustomValue: (moduleId, fieldName, value) => {
        set((state) => {
          if (!state.currentMeeting) return state;

          const customFieldValues =
            state.currentMeeting.customFieldValues || {};
          if (!customFieldValues[moduleId]) {
            customFieldValues[moduleId] = {};
          }
          if (!customFieldValues[moduleId][fieldName]) {
            customFieldValues[moduleId][fieldName] = [];
          }

          customFieldValues[moduleId][fieldName].push({
            ...value,
            isCustom: true,
            addedAt: new Date(),
          });

          const updatedMeeting = {
            ...state.currentMeeting,
            customFieldValues,
          };

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map((m) =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            ),
          };
        });
      },

      removeCustomValue: (moduleId, fieldName, value) => {
        set((state) => {
          if (!state.currentMeeting || !state.currentMeeting.customFieldValues)
            return state;

          const customFieldValues = {
            ...state.currentMeeting.customFieldValues,
          };
          if (
            customFieldValues[moduleId] &&
            customFieldValues[moduleId][fieldName]
          ) {
            customFieldValues[moduleId][fieldName] = customFieldValues[
              moduleId
            ][fieldName].filter((opt) => opt.value !== value);
          }

          const updatedMeeting = {
            ...state.currentMeeting,
            customFieldValues,
          };

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map((m) =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            ),
          };
        });
      },

      getCustomValues: (moduleId, fieldName) => {
        const meeting = get().currentMeeting;
        if (!meeting || !meeting.customFieldValues) return [];

        return meeting.customFieldValues[moduleId]?.[fieldName] || [];
      },

      // Supabase sync state
      isSyncing: false,
      lastSyncTime: null,
      syncError: null,
      syncEnabled: false,

      // Sync actions
      syncMeeting: async (meetingId) => {
        const state = get();
        const targetMeeting = meetingId
          ? state.meetings.find((m) => m.meetingId === meetingId)
          : state.currentMeeting;

        if (!targetMeeting || !isSupabaseConfigured()) {
          return;
        }

        set({ isSyncing: true, syncError: null });

        try {
          // Get user ID from localStorage (set by AuthContext)
          const userId = localStorage.getItem('userId');
          if (!userId) {
            throw new Error('User not authenticated');
          }

          const result = await syncService.syncMeeting(targetMeeting, userId);

          if (result.success) {
            set({
              lastSyncTime: new Date().toISOString(),
              isSyncing: false,
            });
          } else {
            set({
              syncError: result.error || 'Sync failed',
              isSyncing: false,
            });
          }
        } catch (error) {
          set({
            syncError: error instanceof Error ? error.message : 'Sync failed',
            isSyncing: false,
          });
        }
      },

      syncAllMeetings: async () => {
        const state = get();
        if (!state.meetings.length || !isSupabaseConfigured()) {
          return;
        }

        set({ isSyncing: true, syncError: null });

        try {
          const userId = localStorage.getItem('userId');
          if (!userId) {
            throw new Error('User not authenticated');
          }

          const result = await syncService.syncAllMeetings(
            state.meetings,
            userId
          );

          if (result.success) {
            set({
              lastSyncTime: new Date().toISOString(),
              isSyncing: false,
            });
          } else {
            set({
              syncError: result.error || 'Some meetings failed to sync',
              isSyncing: false,
            });
          }
        } catch (error) {
          set({
            syncError: error instanceof Error ? error.message : 'Sync failed',
            isSyncing: false,
          });
        }
      },

      pullMeetings: async () => {
        if (!isSupabaseConfigured()) {
          return;
        }

        set({ isSyncing: true, syncError: null });

        try {
          const userId = localStorage.getItem('userId');
          if (!userId) {
            throw new Error('User not authenticated');
          }

          const result = await syncService.pullMeetings(userId);

          if (result.meetings.length > 0) {
            // Merge pulled meetings with local meetings
            const localMeetings = get().meetings;
            const mergedMeetings = [...localMeetings];

            result.meetings.forEach((pulledMeeting) => {
              // Normalize phase (handle capitalized phases from Zoho/legacy data)
              pulledMeeting.phase = normalizePhase(pulledMeeting.phase as any);

              // Ensure status exists (for backward compatibility with old data)
              if (!pulledMeeting.status)
                pulledMeeting.status = 'discovery_in_progress';
              if (!pulledMeeting.phaseHistory)
                pulledMeeting.phaseHistory = [
                  {
                    fromPhase: null,
                    toPhase: pulledMeeting.phase,
                    timestamp: new Date(),
                    transitionedBy: 'system',
                  },
                ];

              const existingIndex = mergedMeetings.findIndex(
                (m) => m.meetingId === pulledMeeting.id
              );

              if (existingIndex >= 0) {
                // Update existing meeting if remote is newer
                const existing = mergedMeetings[existingIndex];
                if (
                  !existing.updatedAt ||
                  new Date(pulledMeeting.updatedAt) >
                    new Date(existing.updatedAt)
                ) {
                  mergedMeetings[existingIndex] = {
                    ...pulledMeeting,
                    meetingId: pulledMeeting.id, // Ensure correct ID mapping
                  };
                }
              } else {
                // Add new meeting
                mergedMeetings.push({
                  ...pulledMeeting,
                  meetingId: pulledMeeting.id,
                });
              }
            });

            set({
              meetings: mergedMeetings,
              lastSyncTime: new Date().toISOString(),
              isSyncing: false,
            });
          } else {
            set({ isSyncing: false });
          }
        } catch (error) {
          set({
            syncError: error instanceof Error ? error.message : 'Pull failed',
            isSyncing: false,
          });
        }
      },

      enableSync: (userId) => {
        try {
          localStorage.setItem('userId', userId);
        } catch (error) {
          console.error('Failed to save userId to localStorage:', error);
        }
        set({ syncEnabled: true });

        // Perform initial sync
        get().pullMeetings();
      },

      disableSync: () => {
        localStorage.removeItem('userId');
        set({ syncEnabled: false });
        syncService.stopAutoSync();
      },

      getSyncStatus: () => {
        const status = syncService.getSyncStatus();
        return {
          pending: status.queueLength,
          failed: syncService.getFailedSyncs().length,
          isOnline: status.isOnline,
        };
      },

      resolveConflict: async (meetingId, resolution) => {
        if (resolution === 'local') {
          // Push local version to cloud
          await get().syncMeeting(meetingId);
        } else {
          // Pull remote version
          await get().pullMeetings();
        }
      },

      updateMeetingField: (moduleId, field, value) => {
        set((state) => {
          if (!state.currentMeeting) return state;

          const updatedModules = {
            ...state.currentMeeting.modules,
            [moduleId]: {
              ...state.currentMeeting.modules[moduleId],
              [field]: value,
            },
          };

          const updatedMeeting = {
            ...state.currentMeeting,
            modules: updatedModules,
            updatedAt: new Date().toISOString(),
          };

          // Auto-sync if enabled
          if (state.syncEnabled && isSupabaseConfigured()) {
            setTimeout(() => {
              get().syncMeeting(updatedMeeting.meetingId);
            }, 1000); // Debounce 1 second
          }

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map((m) =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            ),
          };
        });
      },

      updateImplementationSpec: (category, serviceId, data) => {
        set((state) => {
          if (!state.currentMeeting?.implementationSpec) {
            console.warn('[Store] No implementationSpec found');
            return state;
          }

          const spec = state.currentMeeting.implementationSpec;
          const categoryArray = spec[category] || [];

          // Find existing service
          const existingIndex = categoryArray.findIndex(
            (item: any) => item.serviceId === serviceId
          );

          let updatedArray;
          if (existingIndex >= 0) {
            // Update existing
            updatedArray = categoryArray.map((item: any, idx: number) =>
              idx === existingIndex
                ? {
                    ...item,
                    requirements: data,
                    completedAt: new Date().toISOString(),
                  }
                : item
            );
          } else {
            // Add new
            updatedArray = [
              ...categoryArray,
              {
                serviceId,
                requirements: data,
                completedAt: new Date().toISOString(),
              },
            ];
          }

          const updatedMeeting = {
            ...state.currentMeeting,
            implementationSpec: {
              ...spec,
              [category]: updatedArray,
              lastUpdated: new Date(),
            },
          };

          // Trigger Supabase sync (immediate, not debounced)
          if (isSupabaseReady()) {
            supabaseService
              .saveMeeting(updatedMeeting)
              .catch((err) =>
                console.error('[Store] Supabase save failed:', err)
              );
          }

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map((m) =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            ),
            lastSavedTime: new Date(),
          };
        });
      },

      // ========================================================================
      // PHASE MANAGEMENT
      // ========================================================================

      /**
       * Helper function to get the default status for a phase
       */
      getDefaultStatusForPhase: (phase: MeetingPhase): MeetingStatus => {
        switch (phase) {
          case 'discovery':
            return 'discovery_in_progress';
          case 'implementation_spec':
            return 'spec_in_progress';
          case 'development':
            return 'dev_not_started';
          case 'completed':
            return 'completed';
          default:
            return 'discovery_in_progress';
        }
      },

      /**
       * Validates if the current meeting can transition to the target phase
       *
       * Business Rules:
       * - No backwards transitions (prevents data loss)
       * - No phase skipping (ensures completeness)
       * - Prerequisites must be met for each transition
       *
       * @param targetPhase - The phase to transition to
       * @returns boolean - true if transition is allowed, false otherwise
       */
      canTransitionTo: (targetPhase) => {
        const { currentMeeting } = get();
        if (!currentMeeting) {
          return false;
        }

        // Normalize phase names to lowercase (handle legacy/Zoho data with capitalized phases)
        const currentPhase = (currentMeeting.phase?.toLowerCase() ||
          'discovery') as MeetingPhase;
        const normalizedTargetPhase = (targetPhase?.toLowerCase() ||
          'discovery') as MeetingPhase;

        // Create cache key
        const cacheKey = `${currentMeeting.meetingId}_${currentPhase}_to_${normalizedTargetPhase}_${currentMeeting.status}`;

        // Check cache first (TTL: 1 second)
        // Defensive: Ensure cache is a Map (might be deserialized as {})
        const cache = get()._validationCache;
        if (!cache || !(cache instanceof Map)) {
          console.warn(
            '[Store] Reinitializing validation cache (was not a Map)'
          );
          set({
            _validationCache: new Map<
              string,
              { result: boolean; timestamp: number }
            >(),
          });
        }

        const cached = cache instanceof Map ? cache.get(cacheKey) : undefined;
        const CACHE_TTL = 1000;

        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          return cached.result;
        }

        // Perform validation
        let result = false;
        let failureReason = '';

        // Cannot transition to the same phase
        if (currentPhase === normalizedTargetPhase) {
          failureReason = `Already in target phase: ${normalizedTargetPhase}`;
          result = false;
        } else {
          // Define the phase order for validation
          const phaseOrder: MeetingPhase[] = [
            'discovery',
            'implementation_spec',
            'development',
            'completed',
          ];
          const currentIndex = phaseOrder.indexOf(currentPhase);
          const targetIndex = phaseOrder.indexOf(normalizedTargetPhase);

          // Prevent backwards transitions (data integrity)
          if (targetIndex < currentIndex) {
            failureReason = `Backwards transition not allowed: ${currentPhase} → ${normalizedTargetPhase}`;
            result = false;
          }
          // Prevent phase skipping (completeness check)
          else if (targetIndex > currentIndex + 1) {
            failureReason = `Cannot skip phases: ${currentPhase} → ${normalizedTargetPhase}`;
            result = false;
          }
          // Check prerequisites based on target phase
          else {
            switch (normalizedTargetPhase) {
              case 'implementation_spec':
                if (currentMeeting.status !== 'client_approved') {
                  failureReason = `Client approval required for spec phase. Current status: ${currentMeeting.status}`;
                  result = false;
                } else {
                  result = true;
                }
                break;

              case 'development':
                if (!currentMeeting.implementationSpec) {
                  failureReason =
                    'Implementation spec required for development phase';
                  result = false;
                } else {
                  const specProgress =
                    currentMeeting.implementationSpec.completionPercentage || 0;

                  // Require 100% completion for spec (not 90%)
                  if (specProgress < 100) {
                    failureReason = `Spec must be 100% complete. Current: ${specProgress}%`;
                    result = false;
                  } else {
                    const purchasedServices =
                      currentMeeting.modules?.proposal?.purchasedServices || [];

                    // Don't allow transition with 0 purchased services
                    if (purchasedServices.length === 0) {
                      failureReason =
                        'At least one service must be purchased before transitioning to development';
                      result = false;
                    } else {
                      const validation = validateServiceRequirements(
                        purchasedServices,
                        currentMeeting.implementationSpec || {}
                      );
                      if (!validation.isValid) {
                        failureReason = `Missing service requirements: ${validation.missingServices.join(', ')}`;
                        result = false;
                      } else {
                        result = true;
                      }
                    }
                  }
                }
                break;

              case 'completed':
                if (!currentMeeting.developmentTracking) {
                  failureReason =
                    'Development tracking required for completion';
                  result = false;
                } else {
                  const tasks = currentMeeting.developmentTracking.tasks || [];
                  if (tasks.length === 0) {
                    failureReason = 'No development tasks found';
                    result = false;
                  } else {
                    const allTasksComplete = tasks.every(
                      (t) => t.status === 'done'
                    );
                    if (!allTasksComplete) {
                      const incompleteTasks = tasks.filter(
                        (t) => t.status !== 'done'
                      ).length;
                      failureReason = `All tasks must be complete. Incomplete: ${incompleteTasks}`;
                      result = false;
                    } else {
                      result = true;
                    }
                  }
                }
                break;

              default:
                failureReason = `Unknown target phase: ${normalizedTargetPhase}`;
                result = false;
            }
          }
        }

        // Cache result (defensive: only if cache is a Map)
        const cacheForSet = get()._validationCache;
        if (cacheForSet instanceof Map) {
          cacheForSet.set(cacheKey, { result, timestamp: Date.now() });
        }

        // Only log if validation state changed or first check
        const stateKey = `${currentPhase}_to_${normalizedTargetPhase}`;
        if (get()._lastLoggedState[stateKey] !== result || !cached) {
          if (!result && failureReason) {
            // ✅ NEW: Get smart messages
            const smartMessages = getSmartValidationMessages(
              currentMeeting,
              normalizedTargetPhase
            );
            if (smartMessages.length > 0) {
              const formatted = formatValidationMessagesForUI(smartMessages);
              console.warn(
                '[Phase Validation] ❌ Validation failed:\n' + formatted
              );
            } else {
              console.warn(`[Phase Validation] ${failureReason}`);
            }
          }
          get()._lastLoggedState[stateKey] = result;
        }

        return result;
      },

      /**
       * Transitions the current meeting to a new phase
       *
       * Performs comprehensive validation, updates phase and status,
       * logs the transition, and triggers sync operations.
       *
       * @param targetPhase - The phase to transition to
       * @param notes - Optional notes about the transition
       * @returns boolean - true if transition succeeded, false otherwise
       */
      transitionPhase: (targetPhase, notes) => {
        const { currentMeeting, canTransitionTo } = get();

        // Validation
        if (!currentMeeting) {
          console.error('[Phase Transition] No current meeting');
          return false;
        }

        if (!canTransitionTo(targetPhase)) {
          console.error(
            '[Phase Transition] Cannot transition to',
            targetPhase,
            'from',
            currentMeeting.phase
          );
          return false;
        }

        // Get user info (from auth or Zoho integration)
        const transitionedBy =
          currentMeeting.zohoIntegration?.contactInfo?.email ||
          localStorage.getItem('userId') ||
          'system';

        // Create phase transition record
        const transition: PhaseTransition = {
          fromPhase: currentMeeting.phase,
          toPhase: targetPhase,
          timestamp: new Date(),
          transitionedBy,
          notes:
            notes ||
            `Transitioned from ${currentMeeting.phase} to ${targetPhase}`,
        };

        // Get default status for new phase
        const newStatus = get().getDefaultStatusForPhase(targetPhase);

        // Update meeting
        const updatedMeeting = {
          ...currentMeeting,
          phase: targetPhase,
          status: newStatus,
          phaseHistory: [...currentMeeting.phaseHistory, transition],
        };

        set((state) => ({
          currentMeeting: updatedMeeting,
          meetings: state.meetings.map((m) =>
            m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
          ),
        }));

        // ✅ NEW: Backup phase history
        backupPhaseHistory(
          updatedMeeting.meetingId,
          updatedMeeting.phaseHistory
        );

        console.log(
          '[Phase Transition] ✓ Successfully transitioned:',
          currentMeeting.phase,
          '→',
          targetPhase
        );

        // Trigger Zoho sync if enabled
        if (currentMeeting.zohoIntegration?.syncEnabled) {
          console.log('[Phase Transition] Triggering Zoho sync...');
          get()
            .syncCurrentToZoho({ silent: true })
            .catch((err) =>
              console.error('[Phase Transition] Zoho sync failed:', err)
            );
        }

        // Trigger Supabase sync if configured
        if (currentMeeting.supabaseId && isSupabaseReady()) {
          console.log('[Phase Transition] Triggering Supabase sync...');
          saveToSupabase(updatedMeeting);
        }

        return true;
      },

      /**
       * Updates the status within the current phase (without transitioning phases)
       *
       * @param status - The new status to set
       */
      updatePhaseStatus: (status) => {
        const { currentMeeting } = get();

        if (!currentMeeting) {
          console.warn('[Phase Status] No current meeting');
          return;
        }

        // Validate that status is appropriate for current phase
        const phaseStatusMap: Record<MeetingPhase, MeetingStatus[]> = {
          discovery: [
            'discovery_in_progress',
            'discovery_complete',
            'awaiting_client_decision',
            'client_approved',
          ],
          implementation_spec: ['spec_in_progress', 'spec_complete'],
          development: [
            'dev_not_started',
            'dev_in_progress',
            'dev_testing',
            'dev_ready_for_deployment',
            'deployed',
          ],
          completed: ['completed'],
        };

        const validStatuses = phaseStatusMap[currentMeeting.phase];
        if (!validStatuses.includes(status)) {
          console.warn(
            '[Phase Status] Invalid status',
            status,
            'for phase',
            currentMeeting.phase
          );
          return;
        }

        const updatedMeeting = {
          ...currentMeeting,
          status,
        };

        set((state) => ({
          currentMeeting: updatedMeeting,
          meetings: state.meetings.map((m) =>
            m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
          ),
        }));

        console.log('[Phase Status] Updated status to:', status);

        // Trigger Supabase sync
        if (currentMeeting.supabaseId && isSupabaseReady()) {
          saveToSupabase(updatedMeeting);
        }
      },

      /**
       * Returns the phase transition history for audit trail
       *
       * @returns PhaseTransition[] - Array of phase transitions with timestamps
       */
      getPhaseHistory: () => {
        const { currentMeeting } = get();
        return currentMeeting?.phaseHistory || [];
      },

      /**
       * Calculates completion percentage for a specific phase
       *
       * @param phase - The phase to calculate progress for (defaults to current phase)
       * @returns number - Progress percentage (0-100)
       */
      getPhaseProgress: (phase) => {
        const { currentMeeting } = get();
        if (!currentMeeting) return 0;

        const targetPhase = phase || currentMeeting.phase;

        switch (targetPhase) {
          case 'discovery':
            // Calculate based on 9 modules completion
            return get().getOverallProgress();

          case 'implementation_spec':
            // Use spec completion percentage
            const spec = currentMeeting.implementationSpec;
            if (!spec) return 0;
            return spec.completionPercentage || 0;

          case 'development':
            // Calculate based on task completion
            const dev = currentMeeting.developmentTracking;
            if (!dev) return 0;

            const tasks = dev.tasks || [];
            if (tasks.length === 0) return 0;

            const completedTasks = tasks.filter(
              (t) => t.status === 'done'
            ).length;
            return Math.round((completedTasks / tasks.length) * 100);

          case 'completed':
            return 100;

          default:
            return 0;
        }
      },

      // Task management actions
      addTask: (taskData) => {
        const state = get();
        if (!state.currentMeeting?.developmentTracking) return;

        const newTask = {
          ...taskData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const updatedTasks = [
          ...state.currentMeeting.developmentTracking.tasks,
          newTask,
        ];

        set({
          currentMeeting: {
            ...state.currentMeeting,
            developmentTracking: {
              ...state.currentMeeting.developmentTracking,
              tasks: updatedTasks,
              lastUpdated: new Date(),
            },
          },
        });
      },

      updateTask: (taskId, updates) => {
        const state = get();
        if (!state.currentMeeting?.developmentTracking) return;

        const updatedTasks = state.currentMeeting.developmentTracking.tasks.map(
          (task) =>
            task.id === taskId
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
        );

        set({
          currentMeeting: {
            ...state.currentMeeting,
            developmentTracking: {
              ...state.currentMeeting.developmentTracking,
              tasks: updatedTasks,
              lastUpdated: new Date(),
            },
          },
        });
      },

      deleteTask: (taskId) => {
        const state = get();
        if (!state.currentMeeting?.developmentTracking) return;

        const updatedTasks =
          state.currentMeeting.developmentTracking.tasks.filter(
            (task) => task.id !== taskId
          );

        set({
          currentMeeting: {
            ...state.currentMeeting,
            developmentTracking: {
              ...state.currentMeeting.developmentTracking,
              tasks: updatedTasks,
              lastUpdated: new Date(),
            },
          },
        });
      },

      assignTask: (taskId, assignee) => {
        get().updateTask(taskId, { assignedTo: assignee });
      },

      updateTaskStatus: (taskId, status) => {
        get().updateTask(taskId, { status });
      },

      addTaskTestCase: (taskId, testCase) => {
        const state = get();
        if (!state.currentMeeting?.developmentTracking) return;

        const task = state.currentMeeting.developmentTracking.tasks.find(
          (t) => t.id === taskId
        );
        if (!task) return;

        const newTestCase = {
          ...testCase,
          id: generateId(),
        };

        get().updateTask(taskId, {
          testCases: [...(task.testCases || []), newTestCase],
        });
      },

      updateTaskTestCase: (taskId, testCaseId, updates) => {
        const state = get();
        if (!state.currentMeeting?.developmentTracking) return;

        const task = state.currentMeeting.developmentTracking.tasks.find(
          (t) => t.id === taskId
        );
        if (!task || !task.testCases) return;

        const updatedTestCases = task.testCases.map((tc) =>
          tc.id === testCaseId ? { ...tc, ...updates } : tc
        );

        get().updateTask(taskId, { testCases: updatedTestCases });
      },

      addBlocker: (taskId, blocker) => {
        const state = get();
        if (!state.currentMeeting?.developmentTracking) return;

        const newBlocker = {
          ...blocker,
          id: generateId(),
          createdAt: new Date(),
          resolved: false,
        };

        const updatedBlockers = [
          ...(state.currentMeeting.developmentTracking.blockers || []),
          newBlocker,
        ];

        set({
          currentMeeting: {
            ...state.currentMeeting,
            developmentTracking: {
              ...state.currentMeeting.developmentTracking,
              blockers: updatedBlockers,
            },
          },
        });

        // Also update task status to blocked
        get().updateTaskStatus(taskId, 'blocked');
      },

      resolveBlocker: (_taskId, blockerId) => {
        const state = get();
        if (!state.currentMeeting?.developmentTracking) return;

        const updatedBlockers =
          state.currentMeeting.developmentTracking.blockers?.map((blocker) =>
            blocker.id === blockerId
              ? { ...blocker, resolved: true, resolvedAt: new Date() }
              : blocker
          );

        set({
          currentMeeting: {
            ...state.currentMeeting,
            developmentTracking: {
              ...state.currentMeeting.developmentTracking,
              blockers: updatedBlockers,
            },
          },
        });
      },

      // ========================================================================
      // ZOHO CLIENTS LIST MANAGEMENT
      // ========================================================================

      fetchZohoClients: async (options = {}) => {
        set({ isLoadingClients: true, clientsLoadError: null });

        try {
          // Check cache first
          const cache = get().zohoClientsCache;
          const cacheAge = cache
            ? Date.now() - new Date(cache.lastFetch).getTime()
            : Infinity;

          // Use cache if it's fresh (< 5 minutes) and not forced
          if (!options.force && cache && cacheAge < 5 * 60 * 1000) {
            console.log('[ZohoClients] Using cached data');
            set({
              zohoClientsList: cache.clients,
              isLoadingClients: false,
            });
            return;
          }

          // Fetch from Zoho API
          console.log('[ZohoClients] Fetching from Zoho...');
          const params = new URLSearchParams(options.filters || {});
          const response = await fetch(`/api/zoho/potentials/list?${params}`);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (data.success && data.potentials) {
            const newCache: ZohoClientsCache = {
              lastFetch: new Date(),
              clients: data.potentials,
              totalCount: data.total || data.potentials.length,
            };

            // Zustand persist middleware handles localStorage automatically
            set({
              zohoClientsList: data.potentials,
              zohoClientsCache: newCache,
              isLoadingClients: false,
            });

            console.log(
              `[ZohoClients] Loaded ${data.potentials.length} clients`
            );
          } else {
            throw new Error(data.message || 'Failed to fetch clients');
          }
        } catch (error) {
          console.error('[ZohoClients] Fetch error:', error);
          set({
            clientsLoadError:
              error instanceof Error ? error.message : 'Failed to load clients',
            isLoadingClients: false,
          });

          // Zustand persist middleware handles cache restoration automatically
        }
      },

      loadClientFromZoho: async (recordId: string) => {
        try {
          console.log('[ZohoClients] Loading client:', recordId);

          // STEP 1: Try Supabase first (fastest and most reliable)
          if (isSupabaseReady()) {
            console.log('[ZohoClients] Trying Supabase...');
            const meeting = await supabaseService.loadMeeting(recordId);

            if (meeting) {
              // Normalize phase (handle capitalized phases from Zoho/legacy data)
              meeting.phase = normalizePhase(meeting.phase as any);

              console.log('[ZohoClients] ✅ Loaded from Supabase');
              set({ currentMeeting: meeting });
              return; // Success! Exit early
            }
            console.log('[ZohoClients] No data in Supabase, trying Zoho...');
          }

          // STEP 2: Try Zustand state (Zustand persist handles localStorage automatically)
          const existingMeeting = get().meetings.find(
            (m) => m.zohoIntegration?.recordId === recordId
          );
          if (existingMeeting) {
            console.log(
              '[ZohoClients] Found existing meeting in Zustand state, loading'
            );
            // Normalize phase (handle capitalized phases from Zoho/legacy data)
            existingMeeting.phase = normalizePhase(
              existingMeeting.phase as any
            );

            // Ensure status exists (for backward compatibility with old data)
            if (!existingMeeting.status)
              existingMeeting.status = 'discovery_in_progress';
            if (!existingMeeting.phaseHistory)
              existingMeeting.phaseHistory = [
                {
                  fromPhase: null,
                  toPhase: existingMeeting.phase,
                  timestamp: new Date(),
                  transitionedBy: 'system',
                },
              ];

            set({ currentMeeting: existingMeeting });

            // Save to Supabase for cross-device sync
            if (isSupabaseReady()) {
              console.log(
                '[Store] Saving existing meeting to Supabase for sync...'
              );
              await supabaseService.saveMeeting(existingMeeting);
            }

            console.log('[ZohoClients] ✅ Loaded from Zustand state');
            return; // Success! Exit early
          }

          // STEP 3: Fetch from Zoho API
          const response = await fetch(`/api/zoho/potentials/${recordId}/full`);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (data.success && data.meetingData) {
            const meeting = data.meetingData;
            // Normalize phase (handle capitalized phases from Zoho/legacy data)
            meeting.phase = normalizePhase(meeting.phase as any);

            // Ensure status exists (for backward compatibility)
            if (!meeting.status) meeting.status = 'discovery_in_progress';
            if (!meeting.phaseHistory)
              meeting.phaseHistory = [
                {
                  fromPhase: null,
                  toPhase: meeting.phase,
                  timestamp: new Date(),
                  transitionedBy: 'system',
                },
              ];

            set({ currentMeeting: meeting });

            // STEP 4: Save to Supabase for next time
            if (isSupabaseReady()) {
              console.log('[ZohoClients] Saving to Supabase...');
              await supabaseService.saveMeeting(meeting);
            }

            console.log('[ZohoClients] ✅ Loaded from Zoho');
          } else {
            throw new Error(data.message || 'Failed to load client data');
          }
        } catch (error) {
          console.error('[ZohoClients] Load error:', error);
          throw error;
        }
      },

      syncCurrentToZoho: async (options = {}) => {
        const meeting = get().currentMeeting;
        if (!meeting) {
          console.warn('[ZohoSync] No current meeting to sync');
          return false;
        }

        if (!options.silent) {
          set({ isSyncing: true, syncError: null });
        }

        try {
          const recordId = meeting.zohoIntegration?.recordId;
          console.log('[ZohoSync] Syncing to Zoho...', {
            recordId,
            fullSync: options.fullSync,
          });

          const response = await fetch('/api/zoho/potentials/sync-full', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              meeting,
              recordId,
              fullSync: options.fullSync,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (data.success) {
            // Update the meeting with new sync info
            const updatedMeeting = {
              ...meeting,
              zohoIntegration: {
                ...meeting.zohoIntegration,
                recordId: data.recordId || recordId,
                lastSyncTime: new Date().toISOString(),
                syncEnabled: true,
              },
            };

            set({
              currentMeeting: updatedMeeting,
              isSyncing: false,
              lastSyncTime: new Date().toISOString(),
            });

            console.log('[ZohoSync] Sync successful');
            return true;
          } else {
            throw new Error(data.message || 'Sync failed');
          }
        } catch (error) {
          console.error('[ZohoSync] Sync error:', error);
          set({
            syncError: error instanceof Error ? error.message : 'Sync failed',
            isSyncing: false,
          });
          return false;
        }
      },

      refreshClientsList: async () => {
        await get().fetchZohoClients({ force: true });
      },

      searchClients: async (query: string) => {
        try {
          const response = await fetch(
            `/api/zoho/potentials/search?q=${encodeURIComponent(query)}`
          );
          const data = await response.json();

          if (data.success && data.results) {
            return data.results;
          }
          return [];
        } catch (error) {
          console.error('[ZohoClients] Search error:', error);
          return [];
        }
      },

      clearClientsCache: () => {
        // Zustand persist middleware handles localStorage automatically
        set({
          zohoClientsList: [],
          zohoClientsCache: null,
        });
        console.log('[ZohoClients] Cache cleared');
      },

      // ========================================================================
      // MEETING DATA RESET AND BACKUP
      // ========================================================================

      /**
       * Resets all meeting data while preserving Zoho identity information
       *
       * This function clears all discovery data (modules, painPoints, notes, etc.)
       * while keeping client identity info from Zoho (name, phone, email, recordId).
       *
       * What is preserved:
       * - clientName, meetingId, date
       * - zohoIntegration (recordId, contactInfo, lastSyncTime)
       * - phase, status (current state)
       * - dataVersion, supabaseId
       *
       * What is reset:
       * - modules (all 9 modules)
       * - painPoints, notes, timer
       * - customFieldValues, wizardState
       * - implementationSpec, developmentTracking
       * - phaseHistory (reset to current phase only)
       *
       * @param createBackup - Whether to create a backup before reset (default: true)
       * @returns Promise<boolean> - true if successful, false otherwise
       */
      resetMeetingData: async (
        createBackup: boolean = true
      ): Promise<boolean> => {
        const state = get();
        const meeting = state.currentMeeting;

        if (!meeting) {
          console.error('[ResetMeeting] No current meeting to reset');
          return false;
        }

        try {
          // Step 1: Create backup if requested
          if (createBackup) {
            const { createBackup: createBackupFn } = await import(
              '../services/meetingBackupService'
            );
            const backupResult = createBackupFn(meeting, 'pre_reset');

            if (!backupResult.success) {
              console.error(
                '[ResetMeeting] Failed to create backup:',
                backupResult.error
              );
              // Continue anyway - user explicitly requested reset
            } else {
              console.log(
                '[ResetMeeting] ✓ Backup created:',
                backupResult.backupId
              );
            }
          }

          // Step 2: Create reset meeting with preserved fields
          const resetMeeting: Meeting = {
            // Preserve identity and metadata
            meetingId: meeting.meetingId,
            id: meeting.meetingId,
            clientName: meeting.clientName,
            date: meeting.date,
            dataVersion: meeting.dataVersion || 2,

            // Preserve Zoho integration
            zohoIntegration: meeting.zohoIntegration,

            // Preserve current phase/status
            phase: meeting.phase,
            status: meeting.status,

            // Reset phaseHistory to current state only
            phaseHistory: [
              {
                fromPhase: null,
                toPhase: meeting.phase,
                timestamp: new Date(),
                transitionedBy:
                  meeting.zohoIntegration?.contactInfo?.email || 'system',
                notes: 'Meeting data reset',
              },
            ],

            // Preserve database IDs
            supabaseId: meeting.supabaseId,
            updatedAt: new Date().toISOString(),

            // Reset all discovery data
            modules: {
              overview: {},
              leadsAndSales: {},
              customerService: {},
              operations: {},
              reporting: {},
              aiAgents: {},
              systems: {},
              roi: {},
              planning: {},
            },
            painPoints: [],
            notes: '',
            timer: 0,

            // Reset optional fields
            totalROI: undefined,
            customFieldValues: undefined,
            wizardState: undefined,
            implementationSpec: undefined,
            developmentTracking: undefined,
          };

          // Step 3: Update state
          set((state: MeetingStore) => ({
            currentMeeting: resetMeeting,
            meetings: state.meetings.map((m: Meeting) =>
              m.meetingId === resetMeeting.meetingId ? resetMeeting : m
            ),
          }));

          // Step 5: Sync to Zoho if enabled
          if (meeting.zohoIntegration?.syncEnabled) {
            console.log('[ResetMeeting] Syncing reset data to Zoho...');
            try {
              await get().syncCurrentToZoho({ silent: true });
            } catch (error) {
              console.error('[ResetMeeting] Zoho sync failed:', error);
              // Non-critical, continue
            }
          }

          // Step 6: Sync to Supabase if configured
          if (meeting.supabaseId && isSupabaseReady()) {
            console.log('[ResetMeeting] Syncing reset data to Supabase...');
            try {
              await supabaseService.saveMeeting(resetMeeting);
            } catch (error) {
              console.error('[ResetMeeting] Supabase sync failed:', error);
              // Non-critical, continue
            }
          }

          console.log('[ResetMeeting] ✓ Meeting data reset successfully');
          return true;
        } catch (error) {
          console.error('[ResetMeeting] Failed to reset meeting data:', error);
          return false;
        }
      },

      /**
       * Restores a meeting from a backup
       *
       * @param backupId - The ID of the backup to restore
       * @returns Promise<boolean> - true if successful, false otherwise
       */
      restoreFromBackup: async (backupId: string): Promise<boolean> => {
        try {
          const { restoreFromBackup: restoreBackupFn } = await import(
            '../services/meetingBackupService'
          );
          const result = restoreBackupFn(backupId);

          if (!result.success || !result.meeting) {
            console.error('[RestoreBackup] Failed to restore:', result.error);
            return false;
          }

          const restoredMeeting = result.meeting;

          // Update state
          set((state: MeetingStore) => ({
            currentMeeting: restoredMeeting,
            meetings: state.meetings.map((m: Meeting) =>
              m.meetingId === restoredMeeting.meetingId ? restoredMeeting : m
            ),
          }));

          // Sync to Supabase if configured
          if (restoredMeeting.supabaseId && isSupabaseReady()) {
            console.log('[RestoreBackup] Syncing restored data to Supabase...');
            try {
              await supabaseService.saveMeeting(restoredMeeting);
            } catch (error) {
              console.error('[RestoreBackup] Supabase sync failed:', error);
            }
          }

          console.log('[RestoreBackup] ✓ Meeting restored successfully');
          return true;
        } catch (error) {
          console.error('[RestoreBackup] Failed to restore backup:', error);
          return false;
        }
      },

      /**
       * Gets available backups for the current meeting
       *
       * @returns Array of backup metadata
       */
      getAvailableBackups: () => {
        const meeting = get().currentMeeting;
        if (!meeting) return [];

        try {
          return getBackupMetadata(meeting.meetingId);
        } catch (error) {
          console.error('[GetBackups] Failed to get backups:', error);
          return [];
        }
      },
    }),
    {
      name: 'discovery-assistant-storage',

      /**
       * Partialize - Exclude transient caches from persistence
       *
       * The validation cache and last logged state are runtime optimizations
       * that should NOT be persisted to localStorage:
       * - _validationCache: Map object (can't serialize to JSON)
       * - _lastLoggedState: State tracking for console spam reduction
       *
       * These will be re-initialized on rehydration.
       */
      partialize: (state) => {
        const { _validationCache, _lastLoggedState, ...persistedState } = state;
        return persistedState;
      },

      /**
       * Data Migration Integration Point
       *
       * This callback runs AFTER Zustand loads data from localStorage but BEFORE
       * the app uses it. It's the perfect time to run automatic data migrations.
       *
       * Purpose:
       * - Automatically migrate old data formats (v1) to current schema (v2)
       * - Ensure zero data loss during schema evolution
       * - Transparent to users (runs in background)
       * - Logs all migrations for audit trail
       *
       * What Gets Migrated:
       * - LeadsAndSalesModule.leadSources: object with nested array → direct array
       * - CustomerServiceModule.channels: object with nested array → direct array
       *
       * Performance:
       * - < 5ms per meeting (minimal startup impact)
       * - Idempotent (safe to run multiple times)
       * - Non-destructive (deep clones before modification)
       *
       * Migration Flow:
       * 1. Check if meeting.dataVersion < CURRENT_DATA_VERSION (2)
       * 2. If yes, run migrateMeetingData()
       * 3. Update state with migrated data
       * 4. Log migration to localStorage for debugging
       *
       * Debugging:
       * - Check browser console for migration logs
       * - Check localStorage 'discovery_migration_log' for audit trail
       * - Use getMigrationLogs() to retrieve all migration history
       *
       * @see src/utils/dataMigration.ts - Migration implementation
       * @see DATA_MIGRATION_GUIDE.md - Complete migration documentation
       */
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        console.log('[Store] Rehydrating from localStorage...');

        // Re-initialize transient caches (excluded from persistence)
        // These are runtime optimizations that don't survive serialization
        state._validationCache = new Map<
          string,
          { result: boolean; timestamp: number }
        >();
        state._lastLoggedState = {} as Record<string, boolean>;
        console.log('[Store] ✓ Transient caches reinitialized');

        // Migrate current meeting if needed
        if (state.currentMeeting && needsMigration(state.currentMeeting)) {
          console.log(
            `[Store] Migrating current meeting (${state.currentMeeting.meetingId})...`
          );
          const result = migrateMeetingData(state.currentMeeting);

          if (result.migrated) {
            console.log(
              `[Store] ✓ Migration successful. Applied: ${result.migrationsApplied.join(', ')}`
            );
            state.currentMeeting = result.meeting;
          } else if (result.errors.length > 0) {
            console.error(`[Store] ✗ Migration failed:`, result.errors);
          }
        } else if (state.currentMeeting) {
          console.log(
            `[Store] Current meeting is up to date (v${state.currentMeeting.dataVersion || 1})`
          );
        }

        // Migrate all meetings in the list
        if (state.meetings && state.meetings.length > 0) {
          console.log(
            `[Store] Checking ${state.meetings.length} meetings for migration...`
          );
          let migratedCount = 0;

          state.meetings = state.meetings.map((meeting: any) => {
            if (needsMigration(meeting)) {
              const result = migrateMeetingData(meeting);
              if (result.migrated) {
                migratedCount++;
                return result.meeting;
              } else if (result.errors.length > 0) {
                console.error(
                  `[Store] Migration failed for meeting ${meeting.meetingId}:`,
                  result.errors
                );
              }
            }
            return meeting;
          });

          if (migratedCount > 0) {
            console.log(`[Store] ✓ Migrated ${migratedCount} meetings`);
          }
        }

        console.log('[Store] Rehydration complete');
      },
    }
  )
);

// Expose store to window for testing and debugging
if (typeof window !== 'undefined') {
  (window as any).useMeetingStore = useMeetingStore;
}
