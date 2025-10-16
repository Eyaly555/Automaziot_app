import { useState, useEffect, useRef, useCallback } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useSmartField } from '../../../../hooks/useSmartField';
import { Card } from '../../../Common/Card';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AutoLeadWorkflowConfig {
  crmSystem: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
  workflowSteps: Array<{
    id: string;
    name: string;
    action: string;
    delay?: number;
  }>;
  leadSources: string[];
  scoringEnabled: boolean;
  assignmentRules: boolean;
  notificationsEnabled: boolean;
}

export function AutoLeadWorkflowSpec() {
  const { currentMeeting } = useMeetingStore();

  // Smart fields with auto-population (autoSave disabled to prevent loops)
  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'crmSystem',
    serviceId: 'auto-lead-workflow',
    autoSave: false,
  });

  const primaryLeadSource = useSmartField<string>({
    fieldId: 'primary_lead_source',
    localPath: 'primaryLeadSource',
    serviceId: 'auto-lead-workflow',
    autoSave: false,
  });

  const [config, setConfig] = useState<Partial<AutoLeadWorkflowConfig>>({
    crmSystem: 'zoho',
    workflowSteps: [],
    leadSources: [],
    scoringEnabled: false,
    assignmentRules: true,
    notificationsEnabled: true,
  });

  // Auto-save hook
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'auto-lead-workflow',
    category: 'automations',
  });

  // Track if we're currently loading data to prevent save loops
  const isLoadingRef = useRef(false);
  const lastLoadedConfigRef = useRef<string>('');

  // Load existing data ONCE on mount or when service data actually changes
  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(
      (a: any) => a.serviceId === 'auto-lead-workflow'
    );

    if (existing?.requirements) {
      const existingConfigJson = JSON.stringify(existing.requirements);

      // Only update if the data actually changed (deep comparison)
      if (existingConfigJson !== lastLoadedConfigRef.current) {
        isLoadingRef.current = true;
        lastLoadedConfigRef.current = existingConfigJson;
        setConfig(existing.requirements);

        // Reset loading flag after state update completes
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 0);
      }
    }
  }, [currentMeeting?.implementationSpec?.automations]);

  // Save handler - saves when user makes changes
  const handleSave = useCallback(() => {
    // Don't save if we're loading data
    if (isLoadingRef.current) {
      return;
    }

    // Build complete config with smart field values
    const completeConfig = {
      ...config,
      crmSystem: crmSystem.value || config.crmSystem || 'zoho',
      primaryLeadSource: primaryLeadSource.value,
    };

    // Only save if config has actual data
    if (completeConfig.crmSystem) {
      saveData(completeConfig);
    }
  }, [config, crmSystem.value, primaryLeadSource.value, saveData]);

  // Handle field changes with auto-save
  const handleFieldChange = useCallback(
    (field: keyof AutoLeadWorkflowConfig, value: any) => {
      setConfig((prev) => {
        const updated = { ...prev, [field]: value };
        // Save after state update
        setTimeout(() => {
          if (!isLoadingRef.current) {
            const completeConfig = {
              ...updated,
              crmSystem: crmSystem.value || updated.crmSystem || 'zoho',
              primaryLeadSource: primaryLeadSource.value,
            };
            saveData(completeConfig);
          }
        }, 0);
        return updated;
      });
    },
    [crmSystem.value, primaryLeadSource.value, saveData]
  );

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #5: Workflow אוטומטי לניהול לידים">
        {/* Smart Fields Info Banner */}
        {(crmSystem.isAutoPopulated || primaryLeadSource.isAutoPopulated) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">
                נתונים מולאו אוטומטית משלב 1
              </h4>
              <p className="text-sm text-blue-800">
                חלק מהשדות מולאו באופן אוטומטי מהנתונים שנאספו בשלב 1. תוכל
                לערוך אותם במידת הצורך.
              </p>
            </div>
          </div>
        )}

        {/* Conflict Warnings */}
        {(crmSystem.hasConflict || primaryLeadSource.hasConflict) && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-1">
                זוהה אי-התאמה בנתונים
              </h4>
              <p className="text-sm text-orange-800">
                נמצאו ערכים שונים עבור אותו שדה במקומות שונים. אנא בדוק ותקן.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {crmSystem.metadata.label.he}
              </label>
              {crmSystem.isAutoPopulated && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  מולא אוטומטית
                </span>
              )}
            </div>
            <select
              value={crmSystem.value || 'zoho'}
              onChange={(e) => crmSystem.setValue(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                crmSystem.isAutoPopulated
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300'
              } ${crmSystem.hasConflict ? 'border-orange-300' : ''}`}
            >
              <option value="zoho">Zoho CRM</option>
              <option value="salesforce">Salesforce</option>
              <option value="hubspot">HubSpot</option>
              <option value="pipedrive">Pipedrive</option>
              <option value="other">אחר</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.scoringEnabled}
                onChange={(e) =>
                  handleFieldChange('scoringEnabled', e.target.checked)
                }
                className="mr-2"
              />
              <span className="text-sm">הפעל ניקוד לידים</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.assignmentRules}
                onChange={(e) =>
                  handleFieldChange('assignmentRules', e.target.checked)
                }
                className="mr-2"
              />
              <span className="text-sm">כללי הקצאה אוטומטיים</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.notificationsEnabled}
                onChange={(e) =>
                  handleFieldChange('notificationsEnabled', e.target.checked)
                }
                className="mr-2"
              />
              <span className="text-sm">התראות מופעלות</span>
            </label>
          </div>
          {/* Auto-Save Status and Manual Save */}
          <div className="flex justify-between items-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              {isSaving && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">שומר אוטומטית...</span>
                </div>
              )}
              {saveError && (
                <div className="flex items-center gap-2 text-red-600">
                  <span className="text-sm">שגיאה בשמירה</span>
                </div>
              )}
              {!isSaving && !saveError && config.crmSystem && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">נשמר אוטומטית</span>
                </div>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
            >
              שמור
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
