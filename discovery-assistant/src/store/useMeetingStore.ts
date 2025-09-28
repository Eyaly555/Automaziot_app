import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Meeting, PainPoint, ModuleProgress } from '../types';

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
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useMeetingStore = create<MeetingStore>()(
  persist(
    (set, get) => ({
      currentMeeting: null,
      meetings: [],
      timerInterval: null,

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
      }
    }),
    {
      name: 'discovery-assistant-storage'
    }
  )
);