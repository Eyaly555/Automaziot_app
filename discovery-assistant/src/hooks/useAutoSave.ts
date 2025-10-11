import { useMeetingStore } from '../store/useMeetingStore';

interface AutoSaveOptions {
  moduleId: string;
  debounceMs?: number; // Ignored - all saves are immediate now
  immediateFields?: string[]; // Ignored - all saves are immediate now
  onSave?: () => void; // Ignored - saves are synchronous
  onError?: (error: Error) => void; // Ignored - saves are synchronous
}

/**
 * Simplified AutoSave Hook
 *
 * Now that Zustand persist handles all persistence automatically,
 * this hook provides immediate saves with simplified state management.
 * All saves are synchronous and immediate - no debouncing or complex state.
 */
export const useAutoSave = (options: AutoSaveOptions) => {
  const { updateModule } = useMeetingStore();
  const { moduleId } = options;

  /**
   * Save data immediately using Zustand's updateModule
   * The persist middleware will handle saving to localStorage automatically
   */
  const saveData = (data: any) => {
    if (!moduleId) {
      console.warn('[useAutoSave] No moduleId provided');
      return;
    }

    updateModule(moduleId, data);
  };

  // Return simplified interface compatible with existing components
  // Since saves are now immediate, we always return "not saving" states
  return {
    saveData,
    isSaving: false,
    saveError: null,
    hasUnsavedChanges: false,
    lastSaved: null
  };
};
