import { useState, useEffect } from 'react';
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
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'crmSystem',
    serviceId: 'auto-lead-workflow',
    autoSave: false
  });

  const primaryLeadSource = useSmartField<string>({
    fieldId: 'primary_lead_source',
    localPath: 'primaryLeadSource',
    serviceId: 'auto-lead-workflow',
    autoSave: false
  });
  const [config, setConfig] = useState<Partial<AutoLeadWorkflowConfig>>({
    crmSystem: 'zoho',
    workflowSteps: [],
    leadSources: [],
    scoringEnabled: false,
    assignmentRules: true,
    notificationsEnabled: true,
  });

  // Auto-save hook for immediate saving
  const { saveData, isSaving, saveError } = useAutoSave({
    moduleId: 'auto-lead-workflow',
    immediateFields: ['crmSystem'], // Critical identifier
    debounceMs: 1000,
    onError: (error) => {
      console.error('Auto-save error in AutoLeadWorkflowSpec:', error);
    }
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-lead-workflow');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  // Auto-save when config or smart field values change
  useEffect(() => {
    if (config.crmSystem) { // Only save if we have basic data
      const automations = currentMeeting?.implementationSpec?.automations || [];
      const updated = automations.filter(a => a.serviceId !== 'auto-lead-workflow');

      // Build complete config with smart field values
      const completeConfig = {
      ...config,
      crmSystem: crmSystem.value || 'zoho',
      primaryLeadSource: primaryLeadSource.value
    };

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-lead-workflow',
      serviceName: 'workflow מלא לניהול לידים',
      serviceNameHe: 'workflow מלא לניהול לידים',
      requirements: completeConfig,
      completedAt: new Date().toISOString()
    });

      saveData({
        implementationSpec: {
          ...currentMeeting?.implementationSpec,
          automations: updated,
        },
      });
    }
  }, [config, crmSystem.value, primaryLeadSource.value, saveData, currentMeeting]);

  // Manual save handler (kept for compatibility, but auto-save is primary)
  const handleManualSave = async () => {
    // Force immediate save
    await saveData({
      implementationSpec: {
        ...currentMeeting?.implementationSpec,
        automations: [
          ...(currentMeeting?.implementationSpec?.automations || []).filter(a => a.serviceId !== 'auto-lead-workflow'),
          {
            serviceId: 'auto-lead-workflow',
            serviceName: 'workflow מלא לניהול לידים',
            serviceNameHe: 'workflow מלא לניהול לידים',
            requirements: {
              ...config,
              crmSystem: crmSystem.value || 'zoho',
              primaryLeadSource: primaryLeadSource.value
            },
            completedAt: new Date().toISOString()
          }
        ],
      },
    }, 'manual');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #5: Workflow אוטומטי לניהול לידים">
        {/* Smart Fields Info Banner */}
        {(crmSystem.isAutoPopulated || primaryLeadSource.isAutoPopulated) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">נתונים מולאו אוטומטית משלב 1</h4>
              <p className="text-sm text-blue-800">
                חלק מהשדות מולאו באופן אוטומטי מהנתונים שנאספו בשלב 1.
                תוכל לערוך אותם במידת הצורך.
              </p>
            </div>
          </div>
        )}

        {/* Conflict Warnings */}
        {(crmSystem.hasConflict || primaryLeadSource.hasConflict) && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-1">זוהה אי-התאמה בנתונים</h4>
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
            <select value={crmSystem.value || 'zoho'} onChange={(e) => crmSystem.setValue(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                crmSystem.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
              } ${crmSystem.hasConflict ? 'border-orange-300' : ''}`}>
              <option value="zoho">Zoho CRM</option>
              <option value="salesforce">Salesforce</option>
              <option value="hubspot">HubSpot</option>
              <option value="pipedrive">Pipedrive</option>
              <option value="other">אחר</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.scoringEnabled}
                onChange={(e) => setConfig({ ...config, scoringEnabled: e.target.checked })} className="mr-2" />
              <span className="text-sm">הפעל ניקוד לידים</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.assignmentRules}
                onChange={(e) => setConfig({ ...config, assignmentRules: e.target.checked })} className="mr-2" />
              <span className="text-sm">כללי הקצאה אוטומטיים</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.notificationsEnabled}
                onChange={(e) => setConfig({ ...config, notificationsEnabled: e.target.checked })} className="mr-2" />
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
              onClick={handleManualSave}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
            >
              שמור ידנית
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
