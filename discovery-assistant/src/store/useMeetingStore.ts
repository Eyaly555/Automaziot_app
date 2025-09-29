import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Meeting, PainPoint, ModuleProgress, WizardState, SelectOption } from '../types';
import { WIZARD_STEPS } from '../config/wizardSteps';
import { syncService } from '../services/syncService';
import { isSupabaseConfigured } from '../lib/supabase';

interface MeetingStore {
  currentMeeting: Meeting | null;
  meetings: Meeting[];

  // Meeting actions
  createMeeting: (clientName: string) => void;
  updateMeeting: (updates: Partial<Meeting>) => void;
  loadMeeting: (meetingId: string) => void;
  deleteMeeting: (meetingId: string) => void;

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
  navigateWizardStep: (direction: 'next' | 'prev' | 'jump', target?: number) => void;
  skipWizardSection: (sectionId: string) => void;
  syncWizardToModules: () => void;
  syncModulesToWizard: () => void;

  // Custom field values
  addCustomValue: (moduleId: string, fieldName: string, value: SelectOption) => void;
  removeCustomValue: (moduleId: string, fieldName: string, value: string) => void;
  getCustomValues: (moduleId: string, fieldName: string) => SelectOption[];

  // Supabase sync
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
  syncEnabled: boolean;

  // Sync actions
  syncMeeting: (meetingId?: string) => Promise<void>;
  syncAllMeetings: () => Promise<void>;
  pullMeetings: () => Promise<void>;
  enableSync: (userId: string) => void;
  disableSync: () => void;
  getSyncStatus: () => { pending: number; failed: number; isOnline: boolean };
  resolveConflict: (meetingId: string, resolution: 'local' | 'remote') => Promise<void>;

  // Update meeting field with optional sync
  updateMeetingField: (moduleId: string, field: string, value: any) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useMeetingStore = create<MeetingStore>()(
  persist(
    (set, get) => ({
      currentMeeting: null,
      meetings: [],
      timerInterval: null,
      wizardState: null,

      createMeeting: (clientName) => {
        const meeting: Meeting = {
          meetingId: generateId(),
          clientName,
          date: new Date(),
          timer: 0,
          modules: {
            overview: {},
            leadsAndSales: {},
            customerService: {},
            operations: {},
            reporting: {},
            aiAgents: {},
            systems: {},
            roi: {},
            planning: {}
          },
          painPoints: [],
          notes: ''
        };

        set((state) => ({
          currentMeeting: meeting,
          meetings: [...state.meetings, meeting]
        }));
      },

      updateMeeting: (updates) => {
        set((state) => {
          if (!state.currentMeeting) return state;

          const updatedMeeting = {
            ...state.currentMeeting,
            ...updates
          };

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map(m =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            )
          };
        });
      },

      loadMeeting: (meetingId) => {
        set((state) => {
          const meeting = state.meetings.find(m => m.meetingId === meetingId);
          return { currentMeeting: meeting || null };
        });
      },

      deleteMeeting: (meetingId) => {
        set((state) => ({
          meetings: state.meetings.filter(m => m.meetingId !== meetingId),
          currentMeeting: state.currentMeeting?.meetingId === meetingId
            ? null
            : state.currentMeeting
        }));
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
                ...data
              }
            }
          };

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map(m =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            )
          };
        });
      },

      addPainPoint: (painPoint) => {
        const newPainPoint: PainPoint = {
          ...painPoint,
          id: generateId()
        };

        set((state) => {
          if (!state.currentMeeting) return state;

          const updatedMeeting = {
            ...state.currentMeeting,
            painPoints: [...state.currentMeeting.painPoints, newPainPoint]
          };

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map(m =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            )
          };
        });
      },

      updatePainPoint: (id, updates) => {
        set((state) => {
          if (!state.currentMeeting) return state;

          const updatedMeeting = {
            ...state.currentMeeting,
            painPoints: state.currentMeeting.painPoints.map(pp =>
              pp.id === id ? { ...pp, ...updates } : pp
            )
          };

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map(m =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            )
          };
        });
      },

      removePainPoint: (id) => {
        set((state) => {
          if (!state.currentMeeting) return state;

          const updatedMeeting = {
            ...state.currentMeeting,
            painPoints: state.currentMeeting.painPoints.filter(pp => pp.id !== id)
          };

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map(m =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            )
          };
        });
      },

      getModuleProgress: () => {
        const meeting = get().currentMeeting;
        if (!meeting) return [];

        // Helper function to check if a value contains meaningful user input
        const hasUserInput = (value: any): boolean => {
          if (value === null || value === undefined || value === '') return false;

          // Check arrays - must have non-empty items
          if (Array.isArray(value)) {
            if (value.length === 0) return false;
            // Check if array contains meaningful data
            return value.some(item => {
              if (typeof item === 'object' && item !== null) {
                // For objects in arrays, check if they have meaningful content
                return Object.keys(item).some(key => {
                  const val = item[key];
                  return val !== '' && val !== 0 && val !== null && val !== undefined;
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
            return keys.some(key => hasUserInput(value[key]));
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
            status: 'empty'
          },
          {
            moduleId: 'leadsAndSales',
            name: 'Leads and Sales',
            hebrewName: 'לידים ומכירות',
            completed: 0,
            total: 5,
            status: 'empty',
            subModules: [
              { id: 'leadSources', name: 'Lead Sources', hebrewName: 'מקורות לידים', status: 'empty' },
              { id: 'speedToLead', name: 'Speed to Lead', hebrewName: 'מהירות תגובה', status: 'empty' },
              { id: 'leadRouting', name: 'Lead Routing', hebrewName: 'ניתוב לידים', status: 'empty' },
              { id: 'followUp', name: 'Follow Up', hebrewName: 'מעקבים', status: 'empty' },
              { id: 'appointments', name: 'Appointments', hebrewName: 'קביעת פגישות', status: 'empty' }
            ]
          },
          {
            moduleId: 'customerService',
            name: 'Customer Service',
            hebrewName: 'שירות לקוחות',
            completed: 0,
            total: 6,
            status: 'empty',
            subModules: [
              { id: 'channels', name: 'Service Channels', hebrewName: 'ערוצי שירות', status: 'empty' },
              { id: 'autoResponse', name: 'Auto Response', hebrewName: 'מענה אוטומטי', status: 'empty' },
              { id: 'proactiveCommunication', name: 'Proactive Communication', hebrewName: 'תקשורת יזומה', status: 'empty' },
              { id: 'communityManagement', name: 'Community', hebrewName: 'ניהול קהילות', status: 'empty' },
              { id: 'reputationManagement', name: 'Reputation', hebrewName: 'ניהול מוניטין', status: 'empty' },
              { id: 'onboarding', name: 'Onboarding', hebrewName: 'קליטת לקוחות', status: 'empty' }
            ]
          },
          {
            moduleId: 'operations',
            name: 'Operations',
            hebrewName: 'תפעול פנימי',
            completed: 0,
            total: 6,
            status: 'empty',
            subModules: [
              { id: 'systemSync', name: 'System Sync', hebrewName: 'סנכרון מערכות', status: 'empty' },
              { id: 'documentManagement', name: 'Documents', hebrewName: 'ניהול מסמכים', status: 'empty' },
              { id: 'projectManagement', name: 'Projects', hebrewName: 'ניהול פרויקטים', status: 'empty' },
              { id: 'financialProcesses', name: 'Finance', hebrewName: 'תהליכים פיננסיים', status: 'empty' },
              { id: 'hr', name: 'HR', hebrewName: 'משאבי אנוש', status: 'empty' },
              { id: 'crossDepartment', name: 'Cross Department', hebrewName: 'בין מחלקות', status: 'empty' }
            ]
          },
          {
            moduleId: 'reporting',
            name: 'Reporting',
            hebrewName: 'דוחות והתראות',
            completed: 0,
            total: 4,
            status: 'empty'
          },
          {
            moduleId: 'aiAgents',
            name: 'AI Agents',
            hebrewName: 'סוכני AI',
            completed: 0,
            total: 3,
            status: 'empty'
          },
          {
            moduleId: 'systems',
            name: 'Systems',
            hebrewName: 'מערכות וטכנולוגיה',
            completed: 0,
            total: 3,
            status: 'empty'
          },
          {
            moduleId: 'roi',
            name: 'ROI',
            hebrewName: 'ROI וכימות',
            completed: 0,
            total: 2,
            status: 'empty'
          },
          {
            moduleId: 'planning',
            name: 'Planning',
            hebrewName: 'סיכום ותכנון',
            completed: 0,
            total: 4,
            status: 'empty'
          }
        ];

        // Calculate actual progress for each module
        modules.forEach(module => {
          const moduleData = meeting.modules[module.moduleId as keyof Meeting['modules']];
          let completed = 0;

          // Count only properties with meaningful user input
          if (moduleData && typeof moduleData === 'object') {
            completed = Object.values(moduleData).filter(v => hasUserInput(v)).length;
            if (completed > 0) {
              module.status = completed >= module.total ? 'completed' : 'in_progress';
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
        return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      },

      exportMeeting: () => {
        const meeting = get().currentMeeting;
        if (!meeting) return '';
        return JSON.stringify(meeting, null, 2);
      },

      importMeeting: (data) => {
        try {
          const meeting = JSON.parse(data);
          set((state) => ({
            currentMeeting: meeting,
            meetings: [...state.meetings.filter(m => m.meetingId !== meeting.meetingId), meeting]
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
              timer: (state.currentMeeting.timer || 0) + 1
            };

            return {
              currentMeeting: updatedMeeting,
              meetings: state.meetings.map(m =>
                m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
              )
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
          mode: 'wizard'
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
            completedSteps
          };

          // Update meeting
          if (state.currentMeeting) {
            const updatedMeeting = {
              ...state.currentMeeting,
              wizardState: updatedWizardState
            };

            return {
              ...state,
              wizardState: updatedWizardState,
              currentMeeting: updatedMeeting,
              meetings: state.meetings.map(m =>
                m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
              )
            };
          }

          return {
            ...state,
            wizardState: updatedWizardState
          };
        });
      },

      navigateWizardStep: (direction, target) => {
        set((state) => {
          if (!state.wizardState) return state;

          let newStep = state.wizardState.currentStep;

          switch (direction) {
            case 'next':
              newStep = Math.min(state.wizardState.currentStep + 1, state.wizardState.totalSteps - 1);
              break;
            case 'prev':
              newStep = Math.max(state.wizardState.currentStep - 1, 0);
              break;
            case 'jump':
              if (target !== undefined) {
                newStep = Math.max(0, Math.min(target, state.wizardState.totalSteps - 1));
              }
              break;
          }

          const updatedWizardState = {
            ...state.wizardState,
            currentStep: newStep,
            navigationHistory: [...state.wizardState.navigationHistory, WIZARD_STEPS[newStep]?.id || 'unknown']
          };

          return {
            ...state,
            wizardState: updatedWizardState
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
            skippedSections
          };

          // Update meeting
          if (state.currentMeeting) {
            const updatedMeeting = {
              ...state.currentMeeting,
              wizardState: updatedWizardState
            };

            return {
              ...state,
              wizardState: updatedWizardState,
              currentMeeting: updatedMeeting,
              meetings: state.meetings.map(m =>
                m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
              )
            };
          }

          return {
            ...state,
            wizardState: updatedWizardState
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

        if (meeting && wizardState) {
          // Calculate which steps should be marked as completed based on module data
          const completedSteps = new Set<string>();

          WIZARD_STEPS.forEach(step => {
            const moduleData = meeting.modules[step.moduleId];
            if (moduleData && typeof moduleData === 'object') {
              const hasData = Object.values(moduleData).some(value =>
                value !== undefined && value !== null && value !== '' &&
                !(Array.isArray(value) && value.length === 0)
              );
              if (hasData) {
                completedSteps.add(step.id);
              }
            }
          });

          const updatedWizardState = {
            ...wizardState,
            completedSteps
          };

          get().setWizardState(updatedWizardState);
        }
      },

      // Custom value methods
      addCustomValue: (moduleId, fieldName, value) => {
        set((state) => {
          if (!state.currentMeeting) return state;

          const customFieldValues = state.currentMeeting.customFieldValues || {};
          if (!customFieldValues[moduleId]) {
            customFieldValues[moduleId] = {};
          }
          if (!customFieldValues[moduleId][fieldName]) {
            customFieldValues[moduleId][fieldName] = [];
          }

          customFieldValues[moduleId][fieldName].push({
            ...value,
            isCustom: true,
            addedAt: new Date()
          });

          const updatedMeeting = {
            ...state.currentMeeting,
            customFieldValues
          };

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map(m =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            )
          };
        });
      },

      removeCustomValue: (moduleId, fieldName, value) => {
        set((state) => {
          if (!state.currentMeeting || !state.currentMeeting.customFieldValues) return state;

          const customFieldValues = { ...state.currentMeeting.customFieldValues };
          if (customFieldValues[moduleId] && customFieldValues[moduleId][fieldName]) {
            customFieldValues[moduleId][fieldName] = customFieldValues[moduleId][fieldName].filter(
              opt => opt.value !== value
            );
          }

          const updatedMeeting = {
            ...state.currentMeeting,
            customFieldValues
          };

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map(m =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            )
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
          ? state.meetings.find(m => m.meetingId === meetingId)
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
              lastSyncTime: new Date(),
              isSyncing: false
            });
          } else {
            set({
              syncError: result.error || 'Sync failed',
              isSyncing: false
            });
          }
        } catch (error) {
          set({
            syncError: error instanceof Error ? error.message : 'Sync failed',
            isSyncing: false
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

          const result = await syncService.syncAllMeetings(state.meetings, userId);

          if (result.success) {
            set({
              lastSyncTime: new Date(),
              isSyncing: false
            });
          } else {
            set({
              syncError: result.error || 'Some meetings failed to sync',
              isSyncing: false
            });
          }
        } catch (error) {
          set({
            syncError: error instanceof Error ? error.message : 'Sync failed',
            isSyncing: false
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

            result.meetings.forEach(pulledMeeting => {
              const existingIndex = mergedMeetings.findIndex(
                m => m.meetingId === pulledMeeting.id
              );

              if (existingIndex >= 0) {
                // Update existing meeting if remote is newer
                const existing = mergedMeetings[existingIndex];
                if (!existing.updatedAt ||
                    new Date(pulledMeeting.updatedAt) > new Date(existing.updatedAt)) {
                  mergedMeetings[existingIndex] = {
                    ...pulledMeeting,
                    meetingId: pulledMeeting.id // Ensure correct ID mapping
                  };
                }
              } else {
                // Add new meeting
                mergedMeetings.push({
                  ...pulledMeeting,
                  meetingId: pulledMeeting.id
                });
              }
            });

            set({
              meetings: mergedMeetings,
              lastSyncTime: new Date(),
              isSyncing: false
            });
          } else {
            set({ isSyncing: false });
          }
        } catch (error) {
          set({
            syncError: error instanceof Error ? error.message : 'Pull failed',
            isSyncing: false
          });
        }
      },

      enableSync: (userId) => {
        localStorage.setItem('userId', userId);
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
          isOnline: status.isOnline
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
              [field]: value
            }
          };

          const updatedMeeting = {
            ...state.currentMeeting,
            modules: updatedModules,
            updatedAt: new Date().toISOString()
          };

          // Auto-sync if enabled
          if (state.syncEnabled && isSupabaseConfigured()) {
            setTimeout(() => {
              get().syncMeeting(updatedMeeting.meetingId);
            }, 1000); // Debounce 1 second
          }

          return {
            currentMeeting: updatedMeeting,
            meetings: state.meetings.map(m =>
              m.meetingId === updatedMeeting.meetingId ? updatedMeeting : m
            )
          };
        });
      }
    }),
    {
      name: 'discovery-assistant-storage'
    }
  )
);

// Expose store to window for testing and debugging
if (typeof window !== 'undefined') {
  (window as any).useMeetingStore = useMeetingStore;
}