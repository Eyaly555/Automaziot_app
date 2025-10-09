import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  ArrowRight,
  Database,
  Settings,
  FileText,
  Zap,
  Shield,
  Info,
  Loader
} from 'lucide-react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { AutoCRMUpdateConfig } from '../../../../types/automationServices';
import { Button, Input, Select } from '../../../Base';

const generateId = () => Math.random().toString(36).substr(2, 9);

const CRM_SYSTEMS = [
  { value: 'zoho', label: 'Zoho CRM' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'pipedrive', label: 'Pipedrive' },
  { value: 'other', label: 'אחר' }
];

const FORM_PLATFORMS = [
  { value: 'wix', label: 'Wix Forms' },
  { value: 'wordpress', label: 'WordPress' },
  { value: 'elementor', label: 'Elementor Forms' },
  { value: 'google_forms', label: 'Google Forms' },
  { value: 'typeform', label: 'Typeform' },
  { value: 'jotform', label: 'JotForm' },
  { value: 'custom', label: 'Custom / Other' }
];

const CRM_MODULES = [
  { value: 'leads', label: 'Leads' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'accounts', label: 'Accounts' },
  { value: 'potentials', label: 'Potentials/Deals' },
  { value: 'deals', label: 'Deals' },
  { value: 'custom', label: 'Custom Module' }
];

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' }
];

const CRM_FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'picklist', label: 'Picklist' },
  { value: 'boolean', label: 'Boolean/Checkbox' },
  { value: 'lookup', label: 'Lookup' }
];

const TRANSFORMATIONS = [
  { value: 'none', label: 'None' },
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'lowercase', label: 'lowercase' },
  { value: 'trim', label: 'Trim whitespace' },
  { value: 'phone_format', label: 'Format phone (+972...)' },
  { value: 'date_format', label: 'Format date (YYYY-MM-DD)' }
];

const DUPLICATE_STRATEGIES = [
  { value: 'update_existing', label: 'עדכן רשומה קיימת' },
  { value: 'skip', label: 'דלג על כפילות' },
  { value: 'create_new', label: 'צור רשומה חדשה בכל מקרה' },
  { value: 'alert', label: 'התרעה בלבד' }
];

const ERROR_STRATEGIES = [
  { value: 'retry', label: 'Retry נוסף' },
  { value: 'skip_and_log', label: 'דלג ורשום ב-log' },
  { value: 'alert_admin', label: 'התרעה למנהל' },
  { value: 'fallback_to_email', label: 'שלח במייל כ-fallback' }
];

export const AutoCRMUpdateSpec: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<AutoCRMUpdateConfig>({
    crmSystem: 'zoho',
    formPlatform: 'wix',
    n8nAccess: true,
    authMethod: 'oauth',
    credentialsProvided: false,
    apiAccessEnabled: false,
    webhookSupport: 'native',
    fieldMappings: [],
    duplicateDetectionEnabled: true,
    duplicateCheckFields: ['email'],
    duplicateStrategy: 'update_existing',
    dataValidationEnabled: true,
    validationRules: [],
    crmModule: 'leads',
    customFieldsReady: false,
    errorHandlingStrategy: 'retry',
    retryAttempts: 3,
    retryDelay: 5,
    errorNotificationEmail: '',
    logFailedSubmissions: true,
    rateLimitKnown: false,
    batchUpdateEnabled: false,
    testMode: true,
    testAccountAvailable: false
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'fields' | 'validation' | 'errors'>('basic');
  const [isSaving, setIsSaving] = useState(false);

  // Load existing config from meeting store if available
  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find((a: any) => a.serviceId === 'auto-crm-update');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!currentMeeting) return;

      // קריאת המערך הקיים
      const automations = currentMeeting?.implementationSpec?.automations || [];

      // הסרת רשומה קיימת (אם יש) למניעת כפילויות
      const updated = automations.filter((a: any) => a.serviceId !== 'auto-crm-update');

      // הוספת רשומה חדשה/מעודכנת
      updated.push({
        serviceId: 'auto-crm-update',
        serviceName: 'עדכון CRM אוטומטי מטפסים',
        requirements: config,
        completedAt: new Date().toISOString()
      });

      updateMeeting({
        implementationSpec: {
          ...currentMeeting.implementationSpec,
          automations: updated,
        },
      });

      setTimeout(() => {
        setIsSaving(false);
        navigate('/phase2');
      }, 500);
    } catch (error) {
      console.error('Error saving auto-crm-update config:', error);
      setIsSaving(false);
    }
  };

  const addFieldMapping = () => {
    setConfig({
      ...config,
      fieldMappings: [
        ...config.fieldMappings,
        {
          id: generateId(),
          formField: '',
          formFieldType: 'text',
          crmField: '',
          crmFieldType: 'text',
          required: false,
          transformation: 'none'
        }
      ]
    });
  };

  const removeFieldMapping = (id: string) => {
    setConfig({
      ...config,
      fieldMappings: config.fieldMappings.filter(m => m.id !== id)
    });
  };

  const updateFieldMapping = (id: string, updates: Partial<typeof config.fieldMappings[0]>) => {
    setConfig({
      ...config,
      fieldMappings: config.fieldMappings.map(m => m.id === id ? { ...m, ...updates } : m)
    });
  };

  const addValidationRule = () => {
    setConfig({
      ...config,
      validationRules: [
        ...config.validationRules,
        {
          field: '',
          rule: 'required',
          errorMessage: ''
        }
      ]
    });
  };

  const removeValidationRule = (index: number) => {
    setConfig({
      ...config,
      validationRules: config.validationRules.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                עדכון CRM אוטומטי מטפסים
              </h1>
              <p className="text-gray-600">
                Auto CRM Update from Forms - Service #3
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  שמור
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 px-6">
              {[
                { id: 'basic', label: 'הגדרות בסיס', icon: Settings },
                { id: 'fields', label: 'מיפוי שדות', icon: Database },
                { id: 'validation', label: 'ולידציה', icon: Shield },
                { id: 'errors', label: 'טיפול בשגיאות', icon: AlertCircle }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Basic Settings Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מערכת CRM
                    </label>
                    <Select
                      value={config.crmSystem}
                      onChange={(e) => setConfig({ ...config, crmSystem: e.target.value as any })}
                      options={CRM_SYSTEMS}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      פלטפורמת טפסים
                    </label>
                    <Select
                      value={config.formPlatform}
                      onChange={(e) => setConfig({ ...config, formPlatform: e.target.value as any })}
                      options={FORM_PLATFORMS}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מודול CRM יעד
                    </label>
                    <Select
                      value={config.crmModule}
                      onChange={(e) => setConfig({ ...config, crmModule: e.target.value as any })}
                      options={CRM_MODULES}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      שיטת אימות
                    </label>
                    <Select
                      value={config.authMethod}
                      onChange={(e) => setConfig({ ...config, authMethod: e.target.value as any })}
                      options={[
                        { value: 'oauth', label: 'OAuth 2.0' },
                        { value: 'api_key', label: 'API Key' },
                        { value: 'basic_auth', label: 'Basic Auth' }
                      ]}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.credentialsProvided}
                      onChange={(e) => setConfig({ ...config, credentialsProvided: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Credentials מוכנים
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.apiAccessEnabled}
                      onChange={(e) => setConfig({ ...config, apiAccessEnabled: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      API Access מופעל ב-CRM
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.customFieldsReady}
                      onChange={(e) => setConfig({ ...config, customFieldsReady: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      שדות מותאמים אישית מוכנים ב-CRM
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.n8nAccess}
                      onChange={(e) => setConfig({ ...config, n8nAccess: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      גישה ל-n8n instance
                    </span>
                  </label>
                </div>

                {config.crmSystem === 'zoho' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-1">שימו לב - Zoho CRM</h4>
                        <p className="text-sm text-yellow-700">
                          Refresh Token נדרש לחידוש כל 3 חודשים (אלא אם כן משתמשים ב-Self Client).
                          יש לוודא שיש תהליך לחידוש אוטומטי או תזכורת ידנית.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {config.crmSystem === 'salesforce' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">שימו לב - Salesforce</h4>
                        <p className="text-sm text-blue-700">
                          Salesforce מגביל API calls בהתאם לגרסה (15,000-100,000 ליום).
                          במקרה של טפסים רבים, מומלץ להפעיל Batch Updates.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Field Mapping Tab */}
            {activeTab === 'fields' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">מיפוי שדות טופס ← CRM</h3>
                  <Button onClick={addFieldMapping} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    הוסף מיפוי שדה
                  </Button>
                </div>

                {config.fieldMappings.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">אין מיפויים עדיין</p>
                    <Button onClick={addFieldMapping} variant="outline">
                      הוסף מיפוי ראשון
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {config.fieldMappings.map((mapping) => (
                      <div key={mapping.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="grid grid-cols-5 gap-4 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              שדה בטופס
                            </label>
                            <Input
                              value={mapping.formField}
                              onChange={(e) => updateFieldMapping(mapping.id, { formField: e.target.value })}
                              placeholder="name"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              סוג שדה טופס
                            </label>
                            <Select
                              value={mapping.formFieldType}
                              onChange={(e) => updateFieldMapping(mapping.id, { formFieldType: e.target.value as any })}
                              options={FIELD_TYPES}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              שדה ב-CRM
                            </label>
                            <Input
                              value={mapping.crmField}
                              onChange={(e) => updateFieldMapping(mapping.id, { crmField: e.target.value })}
                              placeholder="First_Name"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              סוג שדה CRM
                            </label>
                            <Select
                              value={mapping.crmFieldType}
                              onChange={(e) => updateFieldMapping(mapping.id, { crmFieldType: e.target.value as any })}
                              options={CRM_FIELD_TYPES}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Transformation
                            </label>
                            <Select
                              value={mapping.transformation || 'none'}
                              onChange={(e) => updateFieldMapping(mapping.id, { transformation: e.target.value as any })}
                              options={TRANSFORMATIONS}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={mapping.required}
                              onChange={(e) => updateFieldMapping(mapping.id, { required: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">שדה חובה</span>
                          </label>

                          <button
                            onClick={() => removeFieldMapping(mapping.id)}
                            className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            מחק
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">טיפ חשוב</h4>
                      <p className="text-sm text-blue-700">
                        וודא שכל השדות ב-CRM כבר קיימים ונגישים ב-API. שדה לא תקין יכול לגרום לכל ה-sync ליפול.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Tab */}
            {activeTab === 'validation' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.dataValidationEnabled}
                      onChange={(e) => setConfig({ ...config, dataValidationEnabled: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      הפעל ולידציה של נתונים
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.duplicateDetectionEnabled}
                      onChange={(e) => setConfig({ ...config, duplicateDetectionEnabled: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      זיהוי כפילויות
                    </span>
                  </label>
                </div>

                {config.duplicateDetectionEnabled && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">הגדרות זיהוי כפילויות</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          אסטרטגיית כפילויות
                        </label>
                        <Select
                          value={config.duplicateStrategy}
                          onChange={(e) => setConfig({ ...config, duplicateStrategy: e.target.value as any })}
                          options={DUPLICATE_STRATEGIES}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          שדות לבדיקה (מופרדים בפסיק)
                        </label>
                        <Input
                          value={config.duplicateCheckFields.join(', ')}
                          onChange={(e) => setConfig({
                            ...config,
                            duplicateCheckFields: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          })}
                          placeholder="email, phone"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-1">אזהרה קריטית</h4>
                      <p className="text-sm text-red-700">
                        Data validation הוא קריטי! שדה לא תקין יכול לגרום לכל ה-sync ליפול.
                        וודא שכל השדות תואמים בדיוק לשדות ב-CRM (שם API, לא label).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Handling Tab */}
            {activeTab === 'errors' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      אסטרטגיית טיפול בשגיאות
                    </label>
                    <Select
                      value={config.errorHandlingStrategy}
                      onChange={(e) => setConfig({ ...config, errorHandlingStrategy: e.target.value as any })}
                      options={ERROR_STRATEGIES}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מספר ניסיונות חוזרים
                    </label>
                    <Input
                      type="number"
                      value={config.retryAttempts}
                      onChange={(e) => setConfig({ ...config, retryAttempts: parseInt(e.target.value) })}
                      min="0"
                      max="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      השהייה בין ניסיונות (שניות)
                    </label>
                    <Input
                      type="number"
                      value={config.retryDelay}
                      onChange={(e) => setConfig({ ...config, retryDelay: parseInt(e.target.value) })}
                      min="1"
                      max="60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      אימייל להתראות
                    </label>
                    <Input
                      type="email"
                      value={config.errorNotificationEmail}
                      onChange={(e) => setConfig({ ...config, errorNotificationEmail: e.target.value })}
                      placeholder="admin@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.logFailedSubmissions}
                      onChange={(e) => setConfig({ ...config, logFailedSubmissions: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      רישום הגשות שנכשלו ב-log
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.testMode}
                      onChange={(e) => setConfig({ ...config, testMode: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Test Mode (לא לשלוח ל-production)
                    </span>
                  </label>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">דברים חשובים לזכור</h4>
                      <ul className="text-sm text-yellow-700 space-y-1 list-disc mr-5">
                        <li>מה קורה אם ה-CRM down? (צריך fallback mechanism)</li>
                        <li>מה קורה אם הגענו ל-API rate limit? (צריך queuing או batch)</li>
                        <li>איך אפשר לדעת אם טופס נכשל? (צריך monitoring ו-alerts)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button at Bottom */}
        <div className="flex justify-end gap-4">
          <Button
            onClick={() => navigate('/phase2')}
            variant="outline"
          >
            ביטול
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                שומר...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                שמור והמשך
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
