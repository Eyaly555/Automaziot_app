import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import { useSmartField } from '../../../../hooks/useSmartField';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AutoFormToCrmConfig {
  formPlatform: 'wix' | 'wordpress' | 'elementor' | 'google_forms' | 'typeform' | 'custom';
  crmSystem: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
  fieldMapping: Array<{
    formField: string;
    crmField: string;
    transformation?: string;
  }>;
  duplicateDetection: boolean;
  dataValidation: boolean;
  autoAssignment: boolean;
}

/**
 * Smart Auto Form to CRM Spec Component
 * 
 * NOW WITH INTELLIGENT FIELD PRE-POPULATION:
 * - Auto-fills CRM system from Phase 1 if already selected
 * - Auto-fills form platform from lead sources
 * - Shows "Auto-filled from Phase 1" badges
 * - Detects and warns about conflicts
 */
export function AutoFormToCrmSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  
  // Smart fields with auto-population
  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'crmSystem',
    serviceId: 'auto-form-to-crm',
    autoSave: false // We'll batch save
  });

  const formPlatform = useSmartField<string>({
    fieldId: 'form_platform',
    localPath: 'formPlatform',
    serviceId: 'auto-form-to-crm',
    autoSave: false
  });

  // Regular state for other fields (not in registry yet)
  const [config, setConfig] = useState<Partial<AutoFormToCrmConfig>>({
    fieldMapping: [],
    duplicateDetection: true,
    dataValidation: true,
    autoAssignment: false,
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find((a: any) => a.serviceId === 'auto-form-to-crm');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter((a: any) => a.serviceId !== 'auto-form-to-crm');

    // Build complete config with smart field values
    const completeConfig = {
      ...config,
      crmSystem: crmSystem.value,
      formPlatform: formPlatform.value
    };

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-form-to-crm',
      serviceName: 'חיבור טפסים ל-CRM',
      serviceNameHe: 'חיבור טפסים ל-CRM',
      requirements: completeConfig,
      completedAt: new Date().toISOString()
    });

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        automations: updated,
      },
    });

    alert('✅ הגדרות נשמרו בהצלחה!');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with smart field indicators */}
      <Card title="שירות #8: העברת טפסים אוטומטית ל-CRM">
        <div className="space-y-6">
          {/* Smart Fields Info Banner */}
          {(crmSystem.isAutoPopulated || formPlatform.isAutoPopulated) && (
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
          {(crmSystem.hasConflict || formPlatform.hasConflict) && (
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

          <div className="grid grid-cols-2 gap-4">
            {/* Smart Form Platform Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {formPlatform.metadata.label.he}
                </label>
                {formPlatform.isAutoPopulated && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    מולא אוטומטית
                  </span>
                )}
              </div>
              <select 
                value={formPlatform.value || 'wix'} 
                onChange={(e) => formPlatform.setValue(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  formPlatform.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                } ${formPlatform.hasConflict ? 'border-orange-300' : ''}`}
              >
                <option value="wix">Wix</option>
                <option value="wordpress">WordPress</option>
                <option value="elementor">Elementor</option>
                <option value="google_forms">Google Forms</option>
                <option value="typeform">Typeform</option>
                <option value="custom">מותאם אישית</option>
              </select>
              {formPlatform.isAutoPopulated && formPlatform.source && (
                <p className="text-xs text-gray-500 mt-1">
                  מקור: {formPlatform.source.description}
                </p>
              )}
            </div>

            {/* Smart CRM System Field */}
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
                  crmSystem.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                } ${crmSystem.hasConflict ? 'border-orange-300' : ''}`}
              >
                <option value="zoho">Zoho CRM</option>
                <option value="salesforce">Salesforce</option>
                <option value="hubspot">HubSpot</option>
                <option value="pipedrive">Pipedrive</option>
                <option value="other">אחר</option>
              </select>
              {crmSystem.isAutoPopulated && crmSystem.source && (
                <p className="text-xs text-gray-500 mt-1">
                  מקור: {crmSystem.source.description}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.duplicateDetection}
                onChange={(e) => setConfig({ ...config, duplicateDetection: e.target.checked })} className="mr-2" />
              <span className="text-sm">זיהוי כפילויות</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.dataValidation}
                onChange={(e) => setConfig({ ...config, dataValidation: e.target.checked })} className="mr-2" />
              <span className="text-sm">ולידציה של נתונים</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.autoAssignment}
                onChange={(e) => setConfig({ ...config, autoAssignment: e.target.checked })} className="mr-2" />
              <span className="text-sm">הקצאה אוטומטית</span>
            </label>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
