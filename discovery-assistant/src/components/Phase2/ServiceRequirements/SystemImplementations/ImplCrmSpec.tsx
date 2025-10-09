/**
 * CRM Implementation Requirements Specification Component
 *
 * Collects detailed technical requirements for CRM system implementation.
 * Part of Phase 2 Service Requirements Collection System.
 *
 * @component
 * @category System Implementations
 */

import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { ImplCrmRequirements } from '../../../../types/systemImplementationServices';
import { Card } from '../../../Common/Card';

/**
 * CRM Implementation specification component for Phase 2 requirements collection
 */
export function ImplCrmSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // State initialization with proper typing and complete defaults
  const [config, setConfig] = useState<ImplCrmRequirements>({
    platform: 'zoho',
    subscriptionTier: '',
    adminAccess: {
      email: '',
      role: 'admin',
      hasApiAccess: false
    },
    apiCredentials: {},
    dataMigration: undefined,
    customFields: [],
    salesPipeline: {
      pipelineName: '',
      stages: []
    },
    leadSources: [],
    workflowRules: [],
    userRoles: [],
    integrations: undefined,
    trainingRequired: true,
    supportLevel: 'basic',
    estimatedWeeks: 6,
    hasRollbackPlan: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load existing data
  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.systemImplementations;
    const existing = Array.isArray(category)
      ? category.find(item => item.serviceId === 'impl-crm')
      : undefined;

    if (existing?.requirements) {
      setConfig(existing.requirements as ImplCrmRequirements);
    }
  }, [currentMeeting]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!config.platform) {
      newErrors.platform = 'יש לבחור פלטפורמה';
    }

    if (!config.subscriptionTier) {
      newErrors.tier = 'יש לבחור רמת מנוי';
    }

    if (!config.adminAccess.email) {
      newErrors.adminEmail = 'יש להזין כתובת מייל של אדמין';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler functions for array management
  const addCustomField = () => {
    setConfig({
      ...config,
      customFields: [
        ...config.customFields,
        {
          module: 'Leads',
          fieldName: '',
          fieldType: 'text',
          isRequired: false
        }
      ]
    });
  };

  const removeCustomField = (index: number) => {
    setConfig({
      ...config,
      customFields: config.customFields.filter((_, i) => i !== index)
    });
  };

  const updateCustomField = (index: number, field: Partial<typeof config.customFields[0]>) => {
    const updated = [...config.customFields];
    updated[index] = { ...updated[index], ...field };
    setConfig({ ...config, customFields: updated });
  };

  const addWorkflowRule = () => {
    setConfig({
      ...config,
      workflowRules: [
        ...config.workflowRules,
        {
          ruleName: '',
          module: 'Leads',
          trigger: 'on_create',
          actions: []
        }
      ]
    });
  };

  const removeWorkflowRule = (index: number) => {
    setConfig({
      ...config,
      workflowRules: config.workflowRules.filter((_, i) => i !== index)
    });
  };

  const addUserRole = () => {
    setConfig({
      ...config,
      userRoles: [
        ...config.userRoles,
        {
          roleName: '',
          permissions: [],
          userCount: 0
        }
      ]
    });
  };

  const removeUserRole = (index: number) => {
    setConfig({
      ...config,
      userRoles: config.userRoles.filter((_, i) => i !== index)
    });
  };

  const addLeadSource = () => {
    setConfig({
      ...config,
      leadSources: [...config.leadSources, '']
    });
  };

  const updateLeadSource = (index: number, value: string) => {
    const updated = [...config.leadSources];
    updated[index] = value;
    setConfig({ ...config, leadSources: updated });
  };

  const removeLeadSource = (index: number) => {
    setConfig({
      ...config,
      leadSources: config.leadSources.filter((_, i) => i !== index)
    });
  };

  const addPipelineStage = () => {
    setConfig({
      ...config,
      salesPipeline: {
        ...config.salesPipeline,
        stages: [...config.salesPipeline.stages, '']
      }
    });
  };

  const updatePipelineStage = (index: number, value: string) => {
    const updated = [...config.salesPipeline.stages];
    updated[index] = value;
    setConfig({
      ...config,
      salesPipeline: { ...config.salesPipeline, stages: updated }
    });
  };

  const removePipelineStage = (index: number) => {
    setConfig({
      ...config,
      salesPipeline: {
        ...config.salesPipeline,
        stages: config.salesPipeline.stages.filter((_, i) => i !== index)
      }
    });
  };

  // Save handler
  const handleSave = async () => {
    if (!validateForm()) {
      alert('נא למלא את כל השדות הנדרשים');
      return;
    }

    if (!currentMeeting) return;

    setIsSaving(true);
    try {
      const category = currentMeeting?.implementationSpec?.systemImplementations || [];
      const updated = category.filter(item => item.serviceId !== 'impl-crm');

      updated.push({
        serviceId: 'impl-crm',
        serviceName: 'הטמעת CRM',
        requirements: config,
        completedAt: new Date().toISOString()
      });

      await updateMeeting({
        implementationSpec: {
          ...currentMeeting.implementationSpec,
          systemImplementations: updated
        }
      });

      alert('הגדרות נשמרו בהצלחה!');
    } catch (error) {
      console.error('Error saving impl-crm config:', error);
      alert('שגיאה בשמירת הגדרות');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-8" dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">שירות #41: הטמעת CRM</h2>
        <p className="text-gray-600 mt-2">הטמעה מלאה של מערכת CRM בארגון</p>
      </div>

      {/* Platform & Subscription */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">פלטפורמה ומנוי</h3>
        <div className="space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              פלטפורמת CRM <span className="text-red-500">*</span>
            </label>
            <select
              value={config.platform || ''}
              onChange={(e) => setConfig({ ...config, platform: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">בחר פלטפורמה</option>
              <option value="zoho">Zoho CRM</option>
              <option value="salesforce">Salesforce</option>
              <option value="hubspot">HubSpot</option>
            </select>
            {errors.platform && <p className="text-red-500 text-sm mt-1">{errors.platform}</p>}
          </div>

          {/* Subscription Tier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              רמת מנוי <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.subscriptionTier || ''}
              onChange={(e) => setConfig({ ...config, subscriptionTier: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Professional, Enterprise, וכו'"
            />
            {errors.tier && <p className="text-red-500 text-sm mt-1">{errors.tier}</p>}
          </div>
        </div>
      </Card>

      {/* Admin Access */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">גישת אדמין</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              אימייל אדמין <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={config.adminAccess.email}
              onChange={(e) => setConfig({
                ...config,
                adminAccess: { ...config.adminAccess, email: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="admin@company.com"
            />
            {errors.adminEmail && <p className="text-red-500 text-sm mt-1">{errors.adminEmail}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">תפקיד</label>
            <select
              value={config.adminAccess.role}
              onChange={(e) => setConfig({
                ...config,
                adminAccess: { ...config.adminAccess, role: e.target.value as any }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
              <option value="system_administrator">System Administrator</option>
            </select>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.adminAccess.hasApiAccess}
              onChange={(e) => setConfig({
                ...config,
                adminAccess: { ...config.adminAccess, hasApiAccess: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">יש גישה ל-API</span>
          </label>
        </div>
      </Card>

      {/* Sales Pipeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">צינור מכירות</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">שם צינור</label>
            <input
              type="text"
              value={config.salesPipeline.pipelineName}
              onChange={(e) => setConfig({
                ...config,
                salesPipeline: { ...config.salesPipeline, pipelineName: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Sales Pipeline"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">שלבים בצינור</label>
              <button
                type="button"
                onClick={addPipelineStage}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + הוסף שלב
              </button>
            </div>
            <div className="space-y-2">
              {config.salesPipeline.stages.map((stage, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={stage}
                    onChange={(e) => updatePipelineStage(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder={`שלב ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removePipelineStage(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Lead Sources */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">מקורות ליד</h3>
          <button
            type="button"
            onClick={addLeadSource}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + הוסף מקור
          </button>
        </div>
        <div className="space-y-2">
          {config.leadSources.map((source, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={source}
                onChange={(e) => updateLeadSource(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Website, Facebook, Google Ads..."
              />
              <button
                type="button"
                onClick={() => removeLeadSource(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Custom Fields */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">שדות מותאמים אישית</h3>
          <button
            type="button"
            onClick={addCustomField}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + הוסף שדה
          </button>
        </div>
        <div className="space-y-4">
          {config.customFields.map((field, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">מודול</label>
                  <select
                    value={field.module}
                    onChange={(e) => updateCustomField(index, { module: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Leads">Leads</option>
                    <option value="Contacts">Contacts</option>
                    <option value="Deals">Deals</option>
                    <option value="Accounts">Accounts</option>
                    <option value="Tasks">Tasks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שם שדה</label>
                  <input
                    type="text"
                    value={field.fieldName}
                    onChange={(e) => updateCustomField(index, { fieldName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="שם השדה"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">סוג שדה</label>
                  <select
                    value={field.fieldType}
                    onChange={(e) => updateCustomField(index, { fieldType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="text">טקסט</option>
                    <option value="number">מספר</option>
                    <option value="date">תאריך</option>
                    <option value="datetime">תאריך ושעה</option>
                    <option value="picklist">רשימה נפתחת</option>
                    <option value="checkbox">צ'קבוקס</option>
                    <option value="email">אימייל</option>
                    <option value="phone">טלפון</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.isRequired}
                      onChange={(e) => updateCustomField(index, { isRequired: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">שדה חובה</span>
                  </label>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeCustomField(index)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                הסר שדה
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Workflow Rules */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">כללי אוטומציה</h3>
          <button
            type="button"
            onClick={addWorkflowRule}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + הוסף כלל
          </button>
        </div>
        <div className="space-y-4">
          {config.workflowRules.map((rule, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שם כלל</label>
                  <input
                    type="text"
                    value={rule.ruleName}
                    onChange={(e) => {
                      const updated = [...config.workflowRules];
                      updated[index] = { ...updated[index], ruleName: e.target.value };
                      setConfig({ ...config, workflowRules: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="שם הכלל"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">מודול</label>
                  <select
                    value={rule.module}
                    onChange={(e) => {
                      const updated = [...config.workflowRules];
                      updated[index] = { ...updated[index], module: e.target.value };
                      setConfig({ ...config, workflowRules: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Leads">Leads</option>
                    <option value="Contacts">Contacts</option>
                    <option value="Deals">Deals</option>
                    <option value="Accounts">Accounts</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טריגר</label>
                <select
                  value={rule.trigger}
                  onChange={(e) => {
                    const updated = [...config.workflowRules];
                    updated[index] = { ...updated[index], trigger: e.target.value as any };
                    setConfig({ ...config, workflowRules: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="on_create">ביצירה</option>
                  <option value="on_update">בעדכון</option>
                  <option value="on_field_update">בעדכון שדה</option>
                  <option value="on_stage_change">בשינוי שלב</option>
                  <option value="scheduled">מתוזמן</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeWorkflowRule(index)}
                className="text-sm text-red-600 hover:text-red-700 mt-3"
              >
                הסר כלל
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* User Roles */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">תפקידי משתמשים</h3>
          <button
            type="button"
            onClick={addUserRole}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + הוסף תפקיד
          </button>
        </div>
        <div className="space-y-4">
          {config.userRoles.map((role, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שם תפקיד</label>
                  <input
                    type="text"
                    value={role.roleName}
                    onChange={(e) => {
                      const updated = [...config.userRoles];
                      updated[index] = { ...updated[index], roleName: e.target.value };
                      setConfig({ ...config, userRoles: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="מנהל מכירות, נציג שירות..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">מספר משתמשים</label>
                  <input
                    type="number"
                    value={role.userCount}
                    onChange={(e) => {
                      const updated = [...config.userRoles];
                      updated[index] = { ...updated[index], userCount: parseInt(e.target.value) || 0 };
                      setConfig({ ...config, userRoles: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min="0"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeUserRole(index)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                הסר תפקיד
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Integrations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">אינטגרציות</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.integrations?.email || false}
              onChange={(e) => setConfig({
                ...config,
                integrations: { ...config.integrations, email: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">סנכרון אימייל (Gmail/Outlook)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.integrations?.calendar || false}
              onChange={(e) => setConfig({
                ...config,
                integrations: { ...config.integrations, calendar: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">סנכרון יומן</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.integrations?.website || false}
              onChange={(e) => setConfig({
                ...config,
                integrations: { ...config.integrations, website: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">טפסים באתר</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.integrations?.emailMarketing || false}
              onChange={(e) => setConfig({
                ...config,
                integrations: { ...config.integrations, emailMarketing: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">שיווק באימייל</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.integrations?.phoneSystem || false}
              onChange={(e) => setConfig({
                ...config,
                integrations: { ...config.integrations, phoneSystem: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">מערכת טלפון</span>
          </label>
        </div>
      </Card>

      {/* Training & Support */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">הדרכה ותמיכה</h3>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.trainingRequired}
                onChange={(e) => setConfig({ ...config, trainingRequired: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">נדרשת הדרכה למשתמשים</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">רמת תמיכה</label>
            <select
              value={config.supportLevel}
              onChange={(e) => setConfig({ ...config, supportLevel: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="basic">בסיסית</option>
              <option value="extended">מורחבת</option>
              <option value="premium">פרמיום</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">משך הטמעה משוער (שבועות)</label>
            <input
              type="number"
              value={config.estimatedWeeks}
              onChange={(e) => setConfig({ ...config, estimatedWeeks: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="1"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.hasRollbackPlan}
                onChange={(e) => setConfig({ ...config, hasRollbackPlan: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">יש תכנית rollback</span>
            </label>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSaving ? 'שומר...' : 'שמור הגדרות'}
        </button>
      </div>
    </div>
  );
}
