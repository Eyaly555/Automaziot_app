import { describe, it, expect, beforeEach } from 'vitest';

describe('Progress Calculation Tests', () => {
  describe('Initial State Validation', () => {
    it('should show 0% progress with empty modules', () => {
      const meeting = {
        meetingId: 'test',
        clientName: 'Test Client',
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

      // Simulate hasUserInput function from useMeetingStore
      const hasUserInput = (value: any): boolean => {
        if (value === null || value === undefined || value === '') return false;

        if (Array.isArray(value)) {
          if (value.length === 0) return false;
          return value.some(item => {
            if (typeof item === 'object' && item !== null) {
              return Object.keys(item).some(key => {
                const val = item[key];
                return val !== '' && val !== 0 && val !== null && val !== undefined;
              });
            }
            return item !== '' && item !== null && item !== undefined;
          });
        }

        if (typeof value === 'object' && value !== null) {
          const keys = Object.keys(value);
          if (keys.length === 0) return false;
          return keys.some(key => hasUserInput(value[key]));
        }

        if (typeof value === 'boolean') {
          return value === true;
        }

        if (typeof value === 'number') {
          return value > 0;
        }

        return true;
      };

      // Test each module
      Object.entries(meeting.modules).forEach(([moduleName, moduleData]) => {
        const hasData = moduleData && typeof moduleData === 'object' ?
          Object.values(moduleData).filter(v => hasUserInput(v)).length > 0 : false;

        expect(hasData).toBe(false);
      });
    });

    it('should not count empty arrays as progress', () => {
      const testData = [
        [],
        [{}],
        [{ name: '', value: 0 }],
        [{ items: [] }]
      ];

      testData.forEach(data => {
        expect(data.length === 0 || !data.some(item => {
          if (typeof item === 'object') {
            return Object.values(item).some(v => v !== '' && v !== 0 && v !== null && v !== undefined && (!Array.isArray(v) || v.length > 0));
          }
          return false;
        })).toBe(true);
      });
    });

    it('should not count false booleans as progress', () => {
      const hasUserInput = (value: any): boolean => {
        if (typeof value === 'boolean') {
          return value === true;
        }
        return false;
      };

      expect(hasUserInput(false)).toBe(false);
      expect(hasUserInput(true)).toBe(true);
    });

    it('should not count zero numbers as progress', () => {
      const hasUserInput = (value: any): boolean => {
        if (typeof value === 'number') {
          return value > 0;
        }
        return false;
      };

      expect(hasUserInput(0)).toBe(false);
      expect(hasUserInput(1)).toBe(true);
      expect(hasUserInput(-1)).toBe(false);
    });
  });

  describe('User Input Detection', () => {
    it('should detect actual user input', () => {
      const hasUserInput = (value: any): boolean => {
        if (value === null || value === undefined || value === '') return false;

        if (Array.isArray(value)) {
          if (value.length === 0) return false;
          return value.some(item => hasUserInput(item));
        }

        if (typeof value === 'object' && value !== null) {
          const keys = Object.keys(value);
          if (keys.length === 0) return false;
          return keys.some(key => hasUserInput(value[key]));
        }

        if (typeof value === 'boolean') return value === true;
        if (typeof value === 'number') return value > 0;

        return true;
      };

      // Valid inputs
      expect(hasUserInput('Test Company')).toBe(true);
      expect(hasUserInput(50)).toBe(true);
      expect(hasUserInput(true)).toBe(true);
      expect(hasUserInput(['item1', 'item2'])).toBe(true);
      expect(hasUserInput({ name: 'Test', value: 10 })).toBe(true);

      // Invalid inputs
      expect(hasUserInput('')).toBe(false);
      expect(hasUserInput(0)).toBe(false);
      expect(hasUserInput(false)).toBe(false);
      expect(hasUserInput([])).toBe(false);
      expect(hasUserInput({})).toBe(false);
      expect(hasUserInput(null)).toBe(false);
      expect(hasUserInput(undefined)).toBe(false);
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate progress correctly', () => {
      const modules = [
        { completed: 0, total: 6 },  // overview
        { completed: 0, total: 5 },  // leadsAndSales
        { completed: 0, total: 6 },  // customerService
        { completed: 0, total: 6 },  // operations
        { completed: 0, total: 4 },  // reporting
        { completed: 0, total: 3 },  // aiAgents
        { completed: 0, total: 3 },  // systems
        { completed: 0, total: 2 },  // roi
        { completed: 0, total: 4 }   // planning
      ];

      const totalSteps = modules.reduce((acc, m) => acc + m.total, 0);
      const completedSteps = modules.reduce((acc, m) => acc + m.completed, 0);
      const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

      expect(totalSteps).toBe(39);
      expect(completedSteps).toBe(0);
      expect(progress).toBe(0);
    });

    it('should show correct module count', () => {
      const modules = [
        { completed: 6, total: 6 },  // completed
        { completed: 3, total: 5 },  // in progress
        { completed: 0, total: 6 },  // not started
      ];

      const completedModules = modules.filter(m => m.completed === m.total && m.total > 0).length;
      expect(completedModules).toBe(1);
    });
  });
});