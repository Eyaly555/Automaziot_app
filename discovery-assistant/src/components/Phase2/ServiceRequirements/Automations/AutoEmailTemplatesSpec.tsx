import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Mail,
  Settings,
  FileText,
  Shield,
  Eye,
  Code,
  Loader,
  Info,
  Sparkles
} from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { AutoEmailTemplatesConfig } from '../../types/automationServices';
import { Button, Input, Select } from '../Base';

const generateId = () => Math.random().toString(36).substr(2, 9);

const EMAIL_SERVICES = [
  { value: 'sendgrid', label: 'SendGrid' },
  { value: 'mailgun', label: 'Mailgun' },
  { value: 'smtp', label: 'SMTP' },
  { value: 'gmail', label: 'Gmail API' },
  { value: 'outlook', label: 'Outlook/Office 365' },
  { value: 'amazon_ses', label: 'Amazon SES' }
];

const TEMPLATE_ENGINES = [
  { value: 'handlebars', label: 'Handlebars ({{variable}})' },
  { value: 'liquid', label: 'Liquid ({{ variable }})' },
  { value: 'mustache', label: 'Mustache ({{variable}})' },
  { value: 'ejs', label: 'EJS (<%= variable %>)' }
];

const CRM_SYSTEMS = [
  { value: 'zoho', label: 'Zoho CRM' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'pipedrive', label: 'Pipedrive' },
  { value: 'other', label: 'אחר' }
];

const TEMPLATE_CATEGORIES = [
  { value: 'welcome', label: 'Welcome Email' },
  { value: 'follow_up', label: 'Follow-Up' },
  { value: 'proposal', label: 'הצעת מחיר' },
  { value: 'invoice', label: 'חשבונית' },
  { value: 'thank_you', label: 'תודה' },
  { value: 'reminder', label: 'תזכורת' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'custom', label: 'אחר' }
];

const DATA_SOURCES = [
  { value: 'crm', label: 'CRM' },
  { value: 'form', label: 'Form Data' },
  { value: 'manual', label: 'Manual Input' },
  { value: 'computed', label: 'Computed/Calculated' }
];

const FIELD_FORMATS = [
  { value: 'text', label: 'Text' },
  { value: 'date', label: 'Date' },
  { value: 'currency', label: 'Currency' },
  { value: 'number', label: 'Number' }
];

const DESIGN_TOOLS = [
  { value: 'stripo', label: 'Stripo.email' },
  { value: 'beefree', label: 'BeeFree' },
  { value: 'unlayer', label: 'Unlayer' },
  { value: 'custom_html', label: 'Custom HTML' }
];

const TEST_TOOLS = [
  { value: 'litmus', label: 'Litmus' },
  { value: 'email_on_acid', label: 'Email on Acid' },
  { value: 'mailtrap', label: 'Mailtrap' },
  { value: 'none', label: 'None' }
];

const ERROR_STRATEGIES = [
  { value: 'retry', label: 'Retry נוסף' },
  { value: 'skip_and_log', label: 'דלג ורשום ב-log' },
  { value: 'alert_admin', label: 'התרעה למנהל' },
  { value: 'fallback', label: 'Fallback לשירות אחר' }
];

export const AutoEmailTemplatesSpec: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<AutoEmailTemplatesConfig>({
    emailService: 'sendgrid',
    templateEngine: 'handlebars',
    crmSystem: 'zoho',
    n8nAccess: true,
    emailCredentialsReady: false,
    domainVerified: false,
    spfRecordConfigured: false,
    dkimRecordConfigured: false,
    dmarcRecordConfigured: false,
    rateLimitKnown: false,
    templates: [],
    personalizationFields: [],
    crmCredentialsReady: false,
    crmFieldsAvailable: [],
    dataFetchMethod: 'api_call',
    spamScoreChecked: false,
    mobileTestingDone: false,
    darkModeCompatible: false,
    unsubscribeMechanismConfigured: false,
    unsubscribeListManaged: false,
    physicalAddressIncluded: false,
    privacyPolicyLinked: false,
    gdprCompliant: false,
    canSpamCompliant: false,
    israeliPrivacyLawCompliant: false,
    abTestingEnabled: false,
    automationTriggers: [],
    errorHandlingStrategy: 'retry',
    retryAttempts: 3,
    retryDelay: 5,
    errorNotificationEmail: '',
    logFailedSends: true,
    testMode: true
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'templates' | 'personalization' | 'legal'>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  // Load existing config from meeting store if available
  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find((a: any) => a.serviceId === 'auto-email-templates');
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
      const updated = automations.filter((a: any) => a.serviceId !== 'auto-email-templates');

      // הוספת רשומה חדשה/מעודכנת
      updated.push({
        serviceId: 'auto-email-templates',
        serviceName: 'תבניות אימייל אוטומטיות',
        requirements: config,
        completedAt: new Date().toISOString()
      });

      updateMeeting(currentMeeting.id, {
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
      console.error('Error saving auto-email-templates config:', error);
      setIsSaving(false);
    }
  };

  const addTemplate = () => {
    const newTemplate = {
      id: generateId(),
      name: 'תבנית חדשה',
      nameHe: 'תבנית חדשה',
      category: 'custom' as const,
      subject: '',
      htmlContent: '',
      personalizationFields: [],
      unsubscribeLink: false,
      mobileResponsive: false,
      testEmailSent: false,
      lastModified: new Date(),
      status: 'draft' as const
    };

    setConfig({
      ...config,
      templates: [...config.templates, newTemplate]
    });
    setEditingTemplate(newTemplate.id);
  };

  const removeTemplate = (id: string) => {
    setConfig({
      ...config,
      templates: config.templates.filter(t => t.id !== id)
    });
    if (editingTemplate === id) {
      setEditingTemplate(null);
    }
  };

  const updateTemplate = (id: string, updates: Partial<typeof config.templates[0]>) => {
    setConfig({
      ...config,
      templates: config.templates.map(t => t.id === id ? { ...t, ...updates, lastModified: new Date() } : t)
    });
  };

  const addPersonalizationField = () => {
    setConfig({
      ...config,
      personalizationFields: [
        ...config.personalizationFields,
        {
          fieldName: '',
          fieldLabel: '',
          fieldLabelHe: '',
          dataSource: 'crm',
          required: false
        }
      ]
    });
  };

  const removePersonalizationField = (index: number) => {
    setConfig({
      ...config,
      personalizationFields: config.personalizationFields.filter((_, i) => i !== index)
    });
  };

  const updatePersonalizationField = (index: number, updates: Partial<typeof config.personalizationFields[0]>) => {
    setConfig({
      ...config,
      personalizationFields: config.personalizationFields.map((f, i) => i === index ? { ...f, ...updates } : f)
    });
  };

  const getTemplateStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'testing': return 'text-yellow-600 bg-yellow-100';
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-orange-600 bg-orange-100';
      case 'archived': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                תבניות אימייל אוטומטיות
              </h1>
              <p className="text-gray-600">
                Automated Email Templates - Service #9
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
                { id: 'templates', label: 'תבניות', icon: Mail },
                { id: 'personalization', label: 'התאמה אישית', icon: Sparkles },
                { id: 'legal', label: 'תאימות משפטית', icon: Shield }
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
                      שירות אימייל
                    </label>
                    <Select
                      value={config.emailService}
                      onChange={(e) => setConfig({ ...config, emailService: e.target.value as any })}
                      options={EMAIL_SERVICES}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Engine
                    </label>
                    <Select
                      value={config.templateEngine}
                      onChange={(e) => setConfig({ ...config, templateEngine: e.target.value as any })}
                      options={TEMPLATE_ENGINES}
                    />
                  </div>

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
                      כלי עיצוב (אופציונלי)
                    </label>
                    <Select
                      value={config.designToolUsed || 'custom_html'}
                      onChange={(e) => setConfig({ ...config, designToolUsed: e.target.value as any })}
                      options={DESIGN_TOOLS}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      כלי בדיקה (אופציונלי)
                    </label>
                    <Select
                      value={config.emailTestingToolUsed || 'none'}
                      onChange={(e) => setConfig({ ...config, emailTestingToolUsed: e.target.value as any })}
                      options={TEST_TOOLS}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מגבלת שליחה יומית
                    </label>
                    <Input
                      type="number"
                      value={config.dailyEmailLimit || ''}
                      onChange={(e) => setConfig({ ...config, dailyEmailLimit: parseInt(e.target.value) || undefined })}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">סטטוס הגדרות</h4>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.emailCredentialsReady}
                      onChange={(e) => setConfig({ ...config, emailCredentialsReady: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Email Credentials מוכנים
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.domainVerified}
                      onChange={(e) => setConfig({ ...config, domainVerified: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Domain Verified
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.spfRecordConfigured}
                      onChange={(e) => setConfig({ ...config, spfRecordConfigured: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      SPF Record מוגדר
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.dkimRecordConfigured}
                      onChange={(e) => setConfig({ ...config, dkimRecordConfigured: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      DKIM Record מוגדר
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.dmarcRecordConfigured}
                      onChange={(e) => setConfig({ ...config, dmarcRecordConfigured: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      DMARC Record מוגדר
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.crmCredentialsReady}
                      onChange={(e) => setConfig({ ...config, crmCredentialsReady: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      CRM Credentials מוכנים
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

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-1">Email Deliverability - קריטי!</h4>
                      <p className="text-sm text-red-700 mb-2">
                        תבנית עם הרבה תמונות ולינקים = ספאם! חובה Domain Verification (SPF/DKIM/DMARC).
                      </p>
                      <ul className="text-sm text-red-700 space-y-1 list-disc mr-5">
                        <li>60%+ פותחים במובייל - חובה mobile responsive</li>
                        <li>שגיאה ב-personalization ישלח "Hi {`{{firstName}}`}" ללקוח</li>
                        <li>חובה unsubscribe link, כתובת פיזית, privacy policy (חוק)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">תבניות אימייל</h3>
                  <Button onClick={addTemplate} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    הוסף תבנית
                  </Button>
                </div>

                {config.templates.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">אין תבניות עדיין</p>
                    <Button onClick={addTemplate} variant="outline">
                      צור תבנית ראשונה
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {config.templates.map((template) => (
                      <div key={template.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Input
                                value={template.name}
                                onChange={(e) => updateTemplate(template.id, { name: e.target.value, nameHe: e.target.value })}
                                placeholder="שם התבנית"
                                className="font-medium"
                              />
                              <span className={`px-2 py-1 rounded text-xs ${getTemplateStatusColor(template.status)}`}>
                                {template.status}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeTemplate(template.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {editingTemplate === template.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  קטגוריה
                                </label>
                                <Select
                                  value={template.category}
                                  onChange={(e) => updateTemplate(template.id, { category: e.target.value as any })}
                                  options={TEMPLATE_CATEGORIES}
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  סטטוס
                                </label>
                                <Select
                                  value={template.status}
                                  onChange={(e) => updateTemplate(template.id, { status: e.target.value as any })}
                                  options={[
                                    { value: 'draft', label: 'טיוטה' },
                                    { value: 'testing', label: 'בבדיקה' },
                                    { value: 'active', label: 'פעיל' },
                                    { value: 'paused', label: 'מושהה' },
                                    { value: 'archived', label: 'ארכיון' }
                                  ]}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                נושא האימייל
                              </label>
                              <Input
                                value={template.subject}
                                onChange={(e) => updateTemplate(template.id, { subject: e.target.value })}
                                placeholder="כאן יבוא הנושא עם {`{{variables}}`}"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                תוכן HTML (עם inline CSS)
                              </label>
                              <textarea
                                value={template.htmlContent}
                                onChange={(e) => updateTemplate(template.id, { htmlContent: e.target.value })}
                                className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                                placeholder="<html>...</html>"
                                dir="ltr"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                תוכן Plain Text (אופציונלי)
                              </label>
                              <textarea
                                value={template.plainTextContent || ''}
                                onChange={(e) => updateTemplate(template.id, { plainTextContent: e.target.value })}
                                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="גרסת טקסט רגיל לאימייל"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={template.unsubscribeLink}
                                  onChange={(e) => updateTemplate(template.id, { unsubscribeLink: e.target.checked })}
                                  className="rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-700">קישור הסרה מרשימה (חובה לפי חוק)</span>
                              </label>

                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={template.mobileResponsive}
                                  onChange={(e) => updateTemplate(template.id, { mobileResponsive: e.target.checked })}
                                  className="rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-700">Mobile Responsive</span>
                              </label>

                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={template.testEmailSent}
                                  onChange={(e) => updateTemplate(template.id, { testEmailSent: e.target.checked })}
                                  className="rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-700">נשלח אימייל בדיקה</span>
                              </label>
                            </div>

                            <Button
                              onClick={() => setEditingTemplate(null)}
                              variant="outline"
                              className="w-full"
                            >
                              סגור עריכה
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              <div>קטגוריה: {template.category}</div>
                              <div>נושא: {template.subject || 'לא הוגדר'}</div>
                              <div>שדות: {template.personalizationFields.length}</div>
                            </div>
                            <Button
                              onClick={() => setEditingTemplate(template.id)}
                              variant="outline"
                              size="sm"
                            >
                              ערוך
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">טיפים לתבניות מוצלחות</h4>
                      <ul className="text-sm text-blue-700 space-y-1 list-disc mr-5">
                        <li>השתמש ב-inline CSS (לא {'<style>'} tags)</li>
                        <li>בדוק במובייל - 60%+ פותחים שם</li>
                        <li>אל תשים יותר מ-2-3 תמונות (spam score)</li>
                        <li>נסה את התבנית עם personalization variables אמיתיים</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Personalization Tab */}
            {activeTab === 'personalization' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">שדות התאמה אישית</h3>
                  <Button onClick={addPersonalizationField} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    הוסף שדה
                  </Button>
                </div>

                {config.personalizationFields.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">אין שדות התאמה אישית עדיין</p>
                    <Button onClick={addPersonalizationField} variant="outline">
                      הוסף שדה ראשון
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {config.personalizationFields.map((field, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="grid grid-cols-4 gap-4 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              שם שדה (באנגלית)
                            </label>
                            <Input
                              value={field.fieldName}
                              onChange={(e) => updatePersonalizationField(index, { fieldName: e.target.value })}
                              placeholder="firstName"
                              dir="ltr"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              תווית (English)
                            </label>
                            <Input
                              value={field.fieldLabel}
                              onChange={(e) => updatePersonalizationField(index, { fieldLabel: e.target.value })}
                              placeholder="First Name"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              תווית (עברית)
                            </label>
                            <Input
                              value={field.fieldLabelHe}
                              onChange={(e) => updatePersonalizationField(index, { fieldLabelHe: e.target.value })}
                              placeholder="שם פרטי"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              מקור נתונים
                            </label>
                            <Select
                              value={field.dataSource}
                              onChange={(e) => updatePersonalizationField(index, { dataSource: e.target.value as any })}
                              options={DATA_SOURCES}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-3">
                          {field.dataSource === 'crm' && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                שדה CRM
                              </label>
                              <Input
                                value={field.crmFieldMapping || ''}
                                onChange={(e) => updatePersonalizationField(index, { crmFieldMapping: e.target.value })}
                                placeholder="First_Name"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              ערך ברירת מחדל
                            </label>
                            <Input
                              value={field.defaultValue || ''}
                              onChange={(e) => updatePersonalizationField(index, { defaultValue: e.target.value })}
                              placeholder="לקוח יקר"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              פורמט
                            </label>
                            <Select
                              value={field.format || 'text'}
                              onChange={(e) => updatePersonalizationField(index, { format: e.target.value as any })}
                              options={FIELD_FORMATS}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updatePersonalizationField(index, { required: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">שדה חובה</span>
                          </label>

                          <button
                            onClick={() => removePersonalizationField(index)}
                            className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            מחק
                          </button>
                        </div>

                        <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                          <strong>Syntax:</strong> {config.templateEngine === 'handlebars' && `{{${field.fieldName || 'fieldName'}}}`}
                          {config.templateEngine === 'liquid' && `{{ ${field.fieldName || 'fieldName'} }}`}
                          {config.templateEngine === 'mustache' && `{{${field.fieldName || 'fieldName'}}}`}
                          {config.templateEngine === 'ejs' && `<%= ${field.fieldName || 'fieldName'} %>`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">זהירות - שגיאות Personalization</h4>
                      <p className="text-sm text-yellow-700">
                        שגיאה ב-template תשלח "שלום {`{{firstName}}`}" ללקוח במקום "שלום דוד".
                        תמיד לבדוק עם נתונים אמיתיים לפני שליחה ל-production!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Legal Compliance Tab */}
            {activeTab === 'legal' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">תאימות משפטית</h3>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Unsubscribe Mechanism</h4>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.unsubscribeMechanismConfigured}
                      onChange={(e) => setConfig({ ...config, unsubscribeMechanismConfigured: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      מנגנון הסרה מרשימה הוגדר
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.unsubscribeListManaged}
                      onChange={(e) => setConfig({ ...config, unsubscribeListManaged: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      רשימת unsubscribe מנוהלת
                    </span>
                  </label>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Legal Requirements</h4>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.physicalAddressIncluded}
                      onChange={(e) => setConfig({ ...config, physicalAddressIncluded: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      כתובת פיזית כלולה באימיילים (חובה לפי CAN-SPAM)
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.privacyPolicyLinked}
                      onChange={(e) => setConfig({ ...config, privacyPolicyLinked: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      קישור למדיניות פרטיות
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.gdprCompliant}
                      onChange={(e) => setConfig({ ...config, gdprCompliant: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      תואם GDPR (אירופה)
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.canSpamCompliant}
                      onChange={(e) => setConfig({ ...config, canSpamCompliant: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      תואם CAN-SPAM Act (ארה"ב)
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.israeliPrivacyLawCompliant}
                      onChange={(e) => setConfig({ ...config, israeliPrivacyLawCompliant: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      תואם חוק הגנת הפרטיות הישראלי
                    </span>
                  </label>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Testing & Quality</h4>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.spamScoreChecked}
                      onChange={(e) => setConfig({ ...config, spamScoreChecked: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Spam Score נבדק
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.mobileTestingDone}
                      onChange={(e) => setConfig({ ...config, mobileTestingDone: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      נבדק במכשירי מובייל
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.darkModeCompatible}
                      onChange={(e) => setConfig({ ...config, darkModeCompatible: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      תומך ב-Dark Mode
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.abTestingEnabled}
                      onChange={(e) => setConfig({ ...config, abTestingEnabled: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      A/B Testing מופעל
                    </span>
                  </label>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Error Handling</h4>

                  <div className="grid grid-cols-2 gap-4">
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
                        אימייל להתראות
                      </label>
                      <Input
                        type="email"
                        value={config.errorNotificationEmail}
                        onChange={(e) => setConfig({ ...config, errorNotificationEmail: e.target.value })}
                        placeholder="admin@company.com"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={config.testMode}
                          onChange={(e) => setConfig({ ...config, testMode: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Test Mode
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-1">דרישות משפטיות - חובה!</h4>
                      <ul className="text-sm text-red-700 space-y-1 list-disc mr-5">
                        <li>Unsubscribe link - חובה לפי CAN-SPAM Act ו-GDPR</li>
                        <li>כתובת פיזית - חובה לפי CAN-SPAM Act</li>
                        <li>קישור למדיניות פרטיות - מומלץ מאוד</li>
                        <li>לא לשלוח ללא opt-in (הסכמה מפורשת)</li>
                        <li>לנהל רשימת unsubscribe ולכבד אותה תוך 10 ימים</li>
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
