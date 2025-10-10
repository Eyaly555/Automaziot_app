import { useEffect, useRef, useState, useCallback } from 'react';
import { useMeetingStore } from '../store/useMeetingStore';

interface AutoSaveOptions {
  moduleId?: string;
  debounceMs?: number;
  immediateFields?: string[];
  onSave?: () => void;
  onError?: (error: Error) => void;
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveError: string | null;
}

export const useAutoSave = (options: AutoSaveOptions = {}) => {
  const {
    moduleId,
    debounceMs = 1000,
    immediateFields = [],
    onSave,
    onError
  } = options;

  const { updateModule } = useMeetingStore();
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    saveError: null
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<any>(null);

  // Immediate save for critical fields
  const saveImmediately = useCallback(async (data: any) => {
    if (!moduleId) return;

    setState(prev => ({ ...prev, isSaving: true, saveError: null }));

    try {
      await updateModule(moduleId, data);
      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false
      }));

      // Broadcast to other tabs
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('dataSaved', {
          detail: { moduleId, timestamp: Date.now() }
        });
        window.dispatchEvent(event);
      }

      onSave?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Save failed';
      setState(prev => ({
        ...prev,
        isSaving: false,
        saveError: errorMessage
      }));
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [moduleId, updateModule, onSave, onError]);

  // Debounced save for regular fields
  const saveWithDebounce = useCallback((data: any) => {
    if (!moduleId) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setState(prev => ({ ...prev, hasUnsavedChanges: true }));

    // Set new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      await saveImmediately(data);
    }, debounceMs);
  }, [moduleId, debounceMs, saveImmediately]);

  // Main save function that decides immediate vs debounced
  const saveData = useCallback(async (data: any, fieldName?: string) => {
    // Check if this is a critical field that needs immediate save
    if (fieldName && immediateFields.includes(fieldName)) {
      await saveImmediately(data);
    } else {
      saveWithDebounce(data);
    }
  }, [immediateFields, saveImmediately, saveWithDebounce]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Listen for cross-tab save events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleCrossTabSave = (event: CustomEvent) => {
      if (event.detail.moduleId === moduleId) {
        setState(prev => ({
          ...prev,
          lastSaved: new Date(event.detail.timestamp)
        }));
      }
    };

    window.addEventListener('dataSaved', handleCrossTabSave as EventListener);
    return () => {
      window.removeEventListener('dataSaved', handleCrossTabSave as EventListener);
    };
  }, [moduleId]);

  return {
    ...state,
    saveData,
    saveImmediately,
    saveWithDebounce
  };
};
