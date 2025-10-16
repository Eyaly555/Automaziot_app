import { useCallback } from 'react';
import { useMeetingStore } from '../store/useMeetingStore';

interface AutoSaveOptions {
  // For Phase 1 modules
  moduleId?: string;

  // For Phase 2 services
  serviceId?: string;
  category?:
    | 'automations'
    | 'integrationServices'
    | 'aiAgentServices'
    | 'systemImplementations'
    | 'additionalServices';

  // Legacy options (kept for compatibility)
  debounceMs?: number;
  immediateFields?: string[];
  onSave?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Unified AutoSave Hook
 *
 * Handles saving for:
 * - Phase 1 modules (uses moduleId)
 * - Phase 2 services (uses serviceId + category)
 * - Phase 3 tasks (uses direct updateMeeting)
 *
 * Usage Examples:
 *
 * // Phase 1 Module
 * useAutoSave({ moduleId: 'overview' })
 *
 * // Phase 2 Service
 * useAutoSave({ serviceId: 'auto-lead-workflow', category: 'automations' })
 */
export const useAutoSave = (options: AutoSaveOptions) => {
  const { updateModule, updateImplementationSpec, lastSavedTime } =
    useMeetingStore();
  const { moduleId, serviceId, category } = options;

  const saveData = useCallback(
    (data: any) => {
      try {
        // Phase 1 Module save
        if (moduleId && !serviceId) {
          if (!moduleId) {
            console.warn('[useAutoSave] No moduleId provided for Phase 1 save');
            return;
          }
          updateModule(moduleId as any, data);
          console.log(`[useAutoSave] Saved Phase 1 module: ${moduleId}`);
          return;
        }

        // Phase 2 Service save
        if (serviceId && category) {
          updateImplementationSpec(category, serviceId, data);
          console.log(
            `[useAutoSave] Saved Phase 2 service: ${category}/${serviceId}`
          );
          return;
        }

        // Invalid configuration
        console.error('[useAutoSave] Invalid configuration:', options);
        console.error(
          '[useAutoSave] Must provide either: moduleId (Phase 1) OR (serviceId + category) (Phase 2)'
        );
      } catch (error) {
        console.error('[useAutoSave] Save error:', error);
        if (options.onError) {
          options.onError(error as Error);
        }
      }
    },
    [moduleId, serviceId, category, updateModule, updateImplementationSpec]
  );

  return {
    saveData,
    isSaving: false, // Always false since saves are synchronous
    saveError: null,
    hasUnsavedChanges: false,
    lastSaved: lastSavedTime,
  };
};
