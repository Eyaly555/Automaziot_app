import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import { useSmartField } from '../../../../hooks/useSmartField';
import { CheckCircle, AlertCircle, Info as InfoIcon } from 'lucide-react';

export function IntEcommerceSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields
  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'crmSystem',
    serviceId: 'int-ecommerce',
    autoSave: false
  });

  const apiAuthMethod = useSmartField<string>({
    fieldId: 'api_auth_method',
    localPath: 'crmAuthMethod',
    serviceId: 'int-ecommerce',
    autoSave: false
  });

  const syncFrequency = useSmartField<string>({
    fieldId: 'sync_frequency',
    localPath: 'syncConfig.frequency',
    serviceId: 'int-ecommerce',
    autoSave: false
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'errorHandling.alertRecipients[0]',
    serviceId: 'int-ecommerce',
    autoSave: false
  });

  const [config, setConfig] = useState<any>({
    platform: 'shopify',
    crmSystem: 'zoho',
    crmAuthMethod: 'oauth2',
    orderSync: true,
    customerSync: true,
    productSync: false,
    syncConfig: {
      direction: 'bi-directional',
      frequency: 'real-time',
      entities: ['orders', 'customers']
    },
    fieldMappings: [
      { source: 'order_id', target: 'deal_id', type: 'string' },
      { source: 'total_amount', target: 'amount', type: 'number' }
    ],
    errorHandling: {
      retryAttempts: 3,
      alertRecipients: []
    },
    metadata: {
      estimatedHours: 35,
      complexity: 'high'
    }
  });

  const [newMapping, setNewMapping] = useState({ source: '', target: '', type: 'string' });

  useEffect(() => {
    const integrationServices = currentMeeting?.implementationSpec?.integrationServices || [];
    const existing = integrationServices.find(i => i.serviceId === 'int-ecommerce');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const integrationServices = currentMeeting?.implementationSpec?.integrationServices || [];
    const updated = integrationServices.filter(i => i.serviceId !== 'int-ecommerce');

    let frequencyValue = syncFrequency.value;
    if (frequencyValue === 'realtime') frequencyValue = 'real-time';

    const completeConfig = {
      ...config,
      crmSystem: crmSystem.value,
      crmAuthMethod: apiAuthMethod.value,
      syncConfig: {
        ...config.syncConfig,
        frequency: frequencyValue
      },
      errorHandling: {
        ...config.errorHandling,
        alertRecipients: alertEmail.value ? [alertEmail.value] : config.errorHandling?.alertRecipients || []
      }
    };

    updated.push({
      serviceId: 'int-ecommerce',
      serviceName: 'אינטגרציה עם eCommerce',
      requirements: completeConfig,
      completedAt: new Date().toISOString()
    });

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        integrationServices: updated,
      },
    });
  };

  const addMapping = () => {
    if (newMapping.source && newMapping.target) {
      setConfig({
        ...config,
        fieldMappings: [...config.fieldMappings, newMapping]
      });
      setNewMapping({ source: '', target: '', type: 'string' });
    }
  };

  return (
    <div className="space-y-6 p-8" dir="rtl">
      {/* Banners */}
      {(crmSystem.isAutoPopulated || apiAuthMethod.isAutoPopulated || syncFrequency.isAutoPopulated || alertEmail.isAutoPopulated) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <InfoIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">נתונים מולאו אוטומטית משלב 1</h4>
            <p className="text-sm text-blue-800">
              חלק מהשדות מולאו באופן אוטומטי מהנתונים שנאספו בשלב 1.
              תוכל לערוך אותם במידת הצורך.
            </p>
          </div>
        </div>
      )}

      {(crmSystem.hasConflict || apiAuthMethod.hasConflict || syncFrequency.hasConflict || alertEmail.hasConflict) && (
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

      <Card title="שירות #39: אינטגרציה E-commerce">
        <div className="space-y-6">
          {/* Ecommerce Platform */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">פלטפורמת E-commerce</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">פלטפורמה</label>
                <select
                  value={config.platform || 'shopify'}
                  onChange={(e) => setConfig({ ...config, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="shopify">Shopify</option>
                  <option value="woocommerce">WooCommerce</option>
                  <option value="magento">Magento</option>
                  <option value="bigcommerce">BigCommerce</option>
                  <option value="other">אחר</option>
                </select>
              </div>
            </div>
          </div>

          {/* CRM Configuration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">הגדרות CRM</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {crmSystem.metadata.label.he}
                  </label>
                  {crmSystem.isAutoPopulated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      מולא אוטומטי
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
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {apiAuthMethod.metadata.label.he}
                  </label>
                  {apiAuthMethod.isAutoPopulated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      מולא אוטומטי
                    </span>
                  )}
                </div>
                <select
                  value={apiAuthMethod.value || 'oauth2'}
                  onChange={(e) => apiAuthMethod.setValue(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    apiAuthMethod.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  } ${apiAuthMethod.hasConflict ? 'border-orange-300' : ''}`}
                >
                  <option value="oauth">OAuth 2.0</option>
                  <option value="api_key">API Key</option>
                  <option value="basic_auth">Basic Auth</option>
                  <option value="bearer_token">Bearer Token</option>
                  <option value="jwt">JWT</option>
                </select>
                {apiAuthMethod.isAutoPopulated && apiAuthMethod.source && (
                  <p className="text-xs text-gray-500 mt-1">
                    מקור: {apiAuthMethod.source.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sync Configuration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">הגדרות סנכרון</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {syncFrequency.metadata.label.he}
                  </label>
                  {syncFrequency.isAutoPopulated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      מולא אוטומטי
                    </span>
                  )}
                </div>
                <select
                  value={syncFrequency.value || 'real-time'}
                  onChange={(e) => syncFrequency.setValue(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    syncFrequency.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  } ${syncFrequency.hasConflict ? 'border-orange-300' : ''}`}
                >
                  <option value="realtime">בזמן אמת</option>
                  <option value="every_5_min">כל 5 דקות</option>
                  <option value="every_15_min">כל 15 דקות</option>
                  <option value="hourly">כל שעה</option>
                  <option value="daily">יומי</option>
                  <option value="weekly">שבועי</option>
                </select>
                {syncFrequency.isAutoPopulated && syncFrequency.source && (
                  <p className="text-xs text-gray-500 mt-1">
                    מקור: {syncFrequency.source.description}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.orderSync || false}
                    onChange={(e) => setConfig({ ...config, orderSync: e.target.checked })}
                    className="rounded"
                  />
                  <span>סנכרון הזמנות</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.customerSync || false}
                    onChange={(e) => setConfig({ ...config, customerSync: e.target.checked })}
                    className="rounded"
                  />
                  <span>סנכרון לקוחות</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.productSync || false}
                    onChange={(e) => setConfig({ ...config, productSync: e.target.checked })}
                    className="rounded"
                  />
                  <span>סנכרון מוצרים</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ישויות לסנכרון</label>
                <div className="flex flex-wrap gap-2">
                  {(['orders', 'customers', 'products', 'inventory'] as const).map(entity => (
                    <label key={entity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.syncConfig?.entities?.includes(entity) || false}
                        onChange={(e) => {
                          const entities = config.syncConfig?.entities || [];
                          setConfig({
                            ...config,
                            syncConfig: {
                              ...config.syncConfig!,
                              entities: e.target.checked
                                ? [...entities, entity]
                                : entities.filter(ent => ent !== entity)
                            }
                          });
                        }}
                        className="rounded"
                      />
                      <span>{entity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Field Mappings */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">מיפוי שדות</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newMapping.source || ''}
                  onChange={(e) => setNewMapping({ ...newMapping, source: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="שדה מקור"
                />
                <input
                  type="text"
                  value={newMapping.target || ''}
                  onChange={(e) => setNewMapping({ ...newMapping, target: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="שדה יעד"
                />
                <select
                  value={newMapping.type || 'string'}
                  onChange={(e) => setNewMapping({ ...newMapping, type: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                </select>
              </div>
              <button
                onClick={addMapping}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                הוסף מיפוי
              </button>
              {config.fieldMappings && config.fieldMappings.length > 0 && (
                <div className="mt-3 space-y-1">
                  {config.fieldMappings.map((map, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>{map.source} → {map.target} ({map.type})</span>
                      <button
                        onClick={() => setConfig({ ...config, fieldMappings: config.fieldMappings.filter((_, i) => i !== index) })}
                        className="text-red-600"
                      >
                        הסר
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error Handling */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">טיפול בשגיאות</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {alertEmail.metadata.label.he}
                  </label>
                  {alertEmail.isAutoPopulated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      מולא אוטומטי
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
                  placeholder="alerts@company.com"
                />
                {alertEmail.isAutoPopulated && alertEmail.source && (
                  <p className="text-xs text-gray-500 mt-1">
                    מקור: {alertEmail.source.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              שמור הגדרות
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
