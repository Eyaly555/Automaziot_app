import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import { useSmartField } from '../../../../hooks/useSmartField';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AutoReportsConfig {
  reportType: 'sales' | 'operations' | 'financial' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  format: 'pdf' | 'excel' | 'html' | 'dashboard';
  recipients: string[];
  dataSource: string;
  scheduledTime: string;
}

export function AutoReportsSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'crmSystem',
    serviceId: 'auto-reports',
    autoSave: false
  });

  const n8nInstanceUrl = useSmartField<string>({
    fieldId: 'n8n_instance_url',
    localPath: 'n8nWorkflow.instanceUrl',
    serviceId: 'auto-reports',
    autoSave: false
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'n8nWorkflow.errorHandling.alertEmail',
    serviceId: 'auto-reports',
    autoSave: false
  });

  const [config, setConfig] = useState<Partial<AutoReportsConfig>>({
    reportType: 'sales',
    frequency: 'weekly',
    format: 'pdf',
    recipients: [],
    dataSource: '',
    scheduledTime: '08:00',
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find((a: any) => a.serviceId === 'auto-reports');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter((a: any) => a.serviceId !== 'auto-reports');

    // Build complete config with smart field values
    const completeConfig = {
      ...config,
      crmSystem: crmSystem.value,
      n8nWorkflow: {
        instanceUrl: n8nInstanceUrl.value,
        errorHandling: {
          alertEmail: alertEmail.value
        }
      }
    };

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-reports',
      serviceName: 'דוחות אוטומטיים',
      serviceNameHe: 'דוחות אוטומטיים',
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
      <Card title="שירות #16: דוחות אוטומטיים">
        <div className="space-y-6">
          {/* Smart Fields Info Banner */}
          {(crmSystem.isAutoPopulated || n8nInstanceUrl.isAutoPopulated || alertEmail.isAutoPopulated) && (
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
          {(crmSystem.hasConflict || n8nInstanceUrl.hasConflict || alertEmail.hasConflict) && (
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

          {/* Smart Fields Section */}
          <div className="grid grid-cols-1 gap-4">
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
                <option value="monday">Monday CRM</option>
                <option value="other">אחר</option>
              </select>
              {crmSystem.isAutoPopulated && crmSystem.source && (
                <p className="text-xs text-gray-500 mt-1">
                  מקור: {crmSystem.source.description}
                </p>
              )}
            </div>

            {/* Smart n8n Instance URL Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {n8nInstanceUrl.metadata.label.he}
                </label>
                {n8nInstanceUrl.isAutoPopulated && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    מולא אוטומטית
                  </span>
                )}
              </div>
              <input
                type="url"
                value={n8nInstanceUrl.value || ''}
                onChange={(e) => n8nInstanceUrl.setValue(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  n8nInstanceUrl.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                } ${n8nInstanceUrl.hasConflict ? 'border-orange-300' : ''}`}
                placeholder="https://n8n.example.com"
              />
              {n8nInstanceUrl.isAutoPopulated && n8nInstanceUrl.source && (
                <p className="text-xs text-gray-500 mt-1">
                  מקור: {n8nInstanceUrl.source.description}
                </p>
              )}
            </div>

            {/* Smart Alert Email Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {alertEmail.metadata.label.he}
                </label>
                {alertEmail.isAutoPopulated && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    מולא אוטומטית
                  </span>
                )}
              </div>
              <input
                type="email"
                value={alertEmail.value || ''}
                onChange={(e) => alertEmail.setValue(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  alertEmail.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                } ${alertEmail.hasConflict ? 'border-orange-300' : ''}`}
                placeholder="admin@example.com"
              />
              {alertEmail.isAutoPopulated && alertEmail.source && (
                <p className="text-xs text-gray-500 mt-1">
                  מקור: {alertEmail.source.description}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">תדירות דוח</label>
                <select value={config.reportFrequency} onChange={(e) => setConfig({ ...config, reportFrequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="daily">יומי</option>
                  <option value="weekly">שבועי</option>
                  <option value="monthly">חודשי</option>
                  <option value="quarterly">רבעוני</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">פורמט</label>
                <select value={config.format} onChange={(e) => setConfig({ ...config, format: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                  <option value="html">HTML</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">נמענים</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" checked={config.includeManagement}
                    onChange={(e) => setConfig({ ...config, includeManagement: e.target.checked })} className="mr-2" />
                  <span className="text-sm">הנהלה</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={config.includeTeam}
                    onChange={(e) => setConfig({ ...config, includeTeam: e.target.checked })} className="mr-2" />
                  <span className="text-sm">צוות</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={config.includeCustomEmails}
                    onChange={(e) => setConfig({ ...config, includeCustomEmails: e.target.checked })} className="mr-2" />
                  <span className="text-sm">כתובות מייל נוספות</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}