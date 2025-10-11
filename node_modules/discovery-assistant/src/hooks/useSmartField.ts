/**
 * useSmartField Hook
 * 
 * React hook for intelligent field management with auto-population,
 * conflict detection, and bidirectional syncing across phases.
 * 
 * @example
 * ```tsx
 * const crmSystem = useSmartField({
 *   fieldId: 'crm_system',
 *   localPath: 'crmAccess.system',
 *   serviceId: 'auto-form-to-crm'
 * });
 * 
 * // Renders:
 * <input 
 *   value={crmSystem.value} 
 *   onChange={(e) => crmSystem.setValue(e.target.value)}
 * />
 * {crmSystem.isAutoPopulated && (
 *   <Badge>Auto-filled from Phase 1</Badge>
 * )}
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { useMeetingStore } from '../store/useMeetingStore';
import { 
  SmartFieldConfig, 
  SmartFieldValue,
  FieldConflict 
} from '../types/fieldRegistry';
import { 
  prePopulateField, 
  detectFieldConflicts,
  syncFieldValue,
  validateFieldValue
} from '../utils/fieldMapper';
import { getFieldById } from '../config/fieldRegistry';

/**
 * Get nested property value from object using dot notation path
 */
function get(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Set nested property value in object using dot notation path
 */
function set(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (current[key] === undefined) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
  return obj;
}

/**
 * Smart field hook with auto-population and conflict detection
 */
export function useSmartField<T = any>(
  config: SmartFieldConfig
): SmartFieldValue<T> {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [localValue, setLocalValue] = useState<T | undefined>();
  const [isAutoPopulated, setIsAutoPopulated] = useState(false);
  const [populationSource, setPopulationSource] = useState<any>();
  const [conflict, setConflict] = useState<FieldConflict | undefined>();

  const field = getFieldById(config.fieldId);

  // Initialize field value
  useEffect(() => {
    if (!currentMeeting || !field) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // First, check if value already exists in the target location (Phase 2 service requirements)
      const targetPath = buildTargetPath(config);
      const existingValue = targetPath ? get(currentMeeting, targetPath) : undefined;

      if (existingValue !== undefined && existingValue !== null && existingValue !== '') {
        // Value already exists in target location
        setLocalValue(existingValue);
        setIsAutoPopulated(false);
        setIsLoading(false);
        return;
      }

      // Try to pre-populate from Phase 1
      const populationResult = prePopulateField(currentMeeting, config.fieldId);

      if (populationResult.populated && populationResult.value !== undefined) {
        // Successfully pre-populated
        setLocalValue(populationResult.value);
        setIsAutoPopulated(true);
        setPopulationSource(populationResult.source);
        
        // Auto-save if configured
        if (config.autoSave && targetPath) {
          const updated = set(
            JSON.parse(JSON.stringify(currentMeeting)), 
            targetPath, 
            populationResult.value
          );
          updateMeeting(updated);
        }
      } else {
        // No pre-population available, use default value
        setLocalValue(undefined);
        setIsAutoPopulated(false);
      }

      // Check for conflicts
      const detectedConflict = detectFieldConflicts(currentMeeting, config.fieldId);
      if (detectedConflict) {
        setConflict(detectedConflict);
        if (config.onConflict) {
          config.onConflict(detectedConflict);
        }
      }
    } catch (err) {
      console.error('[useSmartField] Initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize field');
    } finally {
      setIsLoading(false);
    }
  }, [currentMeeting, config.fieldId, config.serviceId, config.moduleId]);

  /**
   * Build the target path for storing the value in Phase 2
   */
  function buildTargetPath(cfg: SmartFieldConfig): string | null {
    if (!cfg.serviceId) return null;

    // For automation services
    if (cfg.serviceId.startsWith('auto-')) {
      const basePath = `implementationSpec.automations`;
      // Find the automation entry by serviceId
      const automations = currentMeeting?.implementationSpec?.automations || [];
      const index = automations.findIndex((a: any) => a.serviceId === cfg.serviceId);
      
      if (index >= 0) {
        return `${basePath}[${index}].requirements.${cfg.localPath}`;
      }
      
      // If not found, we'll need to create it when setValue is called
      return null;
    }

    // For AI agent services
    if (cfg.serviceId.startsWith('ai-')) {
      const basePath = `implementationSpec.aiAgentServices`;
      const services = currentMeeting?.implementationSpec?.aiAgentServices || [];
      const index = services.findIndex((s: any) => s.serviceId === cfg.serviceId);
      
      if (index >= 0) {
        return `${basePath}[${index}].requirements.${cfg.localPath}`;
      }
      
      return null;
    }

    // For integration services
    if (cfg.serviceId.startsWith('int-')) {
      const basePath = `implementationSpec.integrationServices`;
      const services = currentMeeting?.implementationSpec?.integrationServices || [];
      const index = services.findIndex((s: any) => s.serviceId === cfg.serviceId);
      
      if (index >= 0) {
        return `${basePath}[${index}].requirements.${cfg.localPath}`;
      }
      
      return null;
    }

    // For system implementation services
    if (cfg.serviceId.startsWith('impl-')) {
      const basePath = `implementationSpec.systemImplementations`;
      const services = currentMeeting?.implementationSpec?.systemImplementations || [];
      const index = services.findIndex((s: any) => s.serviceId === cfg.serviceId);
      
      if (index >= 0) {
        return `${basePath}[${index}].requirements.${cfg.localPath}`;
      }
      
      return null;
    }

    return null;
  }

  /**
   * Set value with validation and optional syncing
   */
  const setValue = useCallback((newValue: T) => {
    if (config.readOnly) {
      console.warn('[useSmartField] Attempted to set value on read-only field:', config.fieldId);
      return;
    }

    if (!currentMeeting || !field) {
      return;
    }

    // Validate the new value
    const validation = validateFieldValue(config.fieldId, newValue);
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      return;
    }

    setError(undefined);
    setLocalValue(newValue);
    setIsAutoPopulated(false); // Once user edits, it's no longer auto-populated

    // Save to meeting store
    if (config.autoSave !== false) {
      const targetPath = buildTargetPath(config);
      
      if (targetPath) {
        // Update the specific path
        const updated = set(
          JSON.parse(JSON.stringify(currentMeeting)),
          targetPath,
          newValue
        );
        updateMeeting(updated);
      } else {
        // Need to create the service entry first
        createServiceEntry(newValue);
      }

      // If bidirectional sync is enabled, update all locations
      if (field.syncBidirectional) {
        const synced = syncFieldValue(currentMeeting, config.fieldId, newValue);
        updateMeeting(synced);
      }
    }
  }, [currentMeeting, config, field, updateMeeting]);

  /**
   * Create a new service entry if it doesn't exist
   */
  function createServiceEntry(value: T) {
    if (!currentMeeting || !config.serviceId) return;

    const updated = JSON.parse(JSON.stringify(currentMeeting));

    // Ensure implementationSpec exists
    if (!updated.implementationSpec) {
      updated.implementationSpec = {
        systems: [],
        integrations: [],
        aiAgents: [],
        automations: [],
        acceptanceCriteria: {
          functional: [],
          performance: [],
          security: [],
          usability: []
        },
        totalEstimatedHours: 0,
        completionPercentage: 0,
        lastUpdated: new Date(),
        updatedBy: 'user'
      };
    }

    // Determine which array to update based on service ID prefix
    let targetArray: string;
    if (config.serviceId.startsWith('auto-')) {
      targetArray = 'automations';
    } else if (config.serviceId.startsWith('ai-')) {
      targetArray = 'aiAgentServices';
    } else if (config.serviceId.startsWith('int-')) {
      targetArray = 'integrationServices';
    } else if (config.serviceId.startsWith('impl-')) {
      targetArray = 'systemImplementations';
    } else {
      targetArray = 'additionalServices';
    }

    // Ensure array exists
    if (!updated.implementationSpec[targetArray]) {
      updated.implementationSpec[targetArray] = [];
    }

    // Create new service entry
    const newEntry: any = {
      serviceId: config.serviceId,
      requirements: {}
    };

    // Set the value in the requirements object
    set(newEntry.requirements, config.localPath, value);

    // Add to array
    updated.implementationSpec[targetArray].push(newEntry);

    // Update meeting
    updateMeeting(updated);
  }

  // Return the smart field value object
  return {
    value: localValue as T,
    setValue,
    isAutoPopulated,
    source: populationSource,
    hasConflict: !!conflict,
    conflict,
    isLoading,
    error,
    metadata: {
      fieldId: config.fieldId,
      label: field?.label || { he: config.fieldId, en: config.fieldId },
      description: field?.description,
      type: field?.type || 'text',
      required: field?.required
    }
  };
}

/**
 * Hook for managing multiple smart fields at once
 */
export function useSmartFields<T extends Record<string, any>>(
  configs: Record<keyof T, Omit<SmartFieldConfig, 'autoSave'>>
): Record<keyof T, SmartFieldValue> {
  const fields = {} as Record<keyof T, SmartFieldValue>;

  for (const key in configs) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    fields[key] = useSmartField({
      ...configs[key],
      autoSave: false // We'll batch save
    });
  }

  return fields;
}

