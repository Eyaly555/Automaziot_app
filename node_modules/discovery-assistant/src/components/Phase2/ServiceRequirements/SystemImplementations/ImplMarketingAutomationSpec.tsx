/**
 * Marketing Automation Implementation Requirements Specification Component
 *
 * Service #42: Marketing Automation Implementation
 * Platform: HubSpot Marketing / ActiveCampaign / Mailchimp
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import type { ImplMarketingAutomationRequirements } from '../../../../types/systemImplementationServices';
import { Card } from '../../../Common/Card';

export function ImplMarketingAutomationSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<ImplMarketingAutomationRequirements>({
    platform: 'hubspot_marketing',
    subscriptionTier: '',
    adminAccess: {
      email: '',
      role: 'admin',
      hasApiAccess: false
    },
    apiCredentials: {},
    domainAuthentication: {
      domain: '',
      spfRecordConfigured: false,
      dkimRecordConfigured: false,
      hasPhysicalAddress: false,
      hasDnsAccess: false
    },
    websiteTracking: {
      hasWebsiteAccess: false,
      trackingCodeInstalled: false,
      trackingDomains: []
    },
    automationWorkflows: [],
    segmentation: {
      segments: []
    },
    customFields: [],
    compliance: {
      gdprCompliant: false,
      hasUnsubscribeLink: true,
      hasPhysicalAddress: false,
      hasPrivacyPolicy: false
    },
    trainingRequired: true,
    estimatedWeeks: 3
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Track if we're currently loading data to prevent save loops
  const isLoadingRef = useRef(false);
  const lastLoadedConfigRef = useRef<string>('');

  // Auto-save hook for immediate saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'impl-marketing-automation',
    category: 'systemImplementations'
  });

  useEffect(() => {
    const systemImplementations = currentMeeting?.implementationSpec?.systemImplementations || [];
    const existing = systemImplementations.find((s: any) => s.serviceId === 'impl-marketing-automation');
    if (existing?.requirements) {
      const existingConfigJson = JSON.stringify(existing.requirements);

      // Only update if the data actually changed (deep comparison)
      if (existingConfigJson !== lastLoadedConfigRef.current) {
        isLoadingRef.current = true;
        lastLoadedConfigRef.current = existingConfigJson;
        setConfig(existing.requirements as ImplMarketingAutomationRequirements);

        // Reset loading flag after state update completes
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 0);
      }
    }
  }, [currentMeeting?.implementationSpec?.systemImplementations]);

  // Auto-save on changes
  // REMOVED THE FOLLOWING USE EFFECT DUE TO INFINITE LOOP
  // useEffect(() => {
  //   if (config.platform) { // Only save if we have basic data
  //     saveData(config);
  //   }
  // }, [config]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setConfig(prev => {
      const updated = { ...prev, [field]: value };
      setTimeout(() => {
        if (!isLoadingRef.current) {
          const completeConfig = { ...updated }; // No smart fields in this component
          saveData(completeConfig);
        }
      }, 0);
      return updated;
    });
  }, [saveData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!config.platform) {
      newErrors.platform = 'יש לבחור פלטפורמה';
    }

    if (!config.adminAccess.email) {
      newErrors.adminEmail = 'יש להזין אימייל אדמין';
    }

    if (!config.domainAuthentication.domain) {
      newErrors.domain = 'יש להזין דומיין';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addWorkflow = () => {
    const updatedWorkflows = [
      ...config.automationWorkflows,
      {
        workflowName: '',
        trigger: 'form_submit',
        actions: []
      }
    ];
    handleFieldChange('automationWorkflows', updatedWorkflows);
  };

  const removeWorkflow = (index: number) => {
    const updatedWorkflows = config.automationWorkflows.filter((_, i) => i !== index);
    handleFieldChange('automationWorkflows', updatedWorkflows);
  };

  const addSegment = () => {
    const updatedSegments = [
      ...config.segmentation.segments,
      {
        segmentName: '',
        criteria: ''
      }
    ];
    handleFieldChange('segmentation.segments', updatedSegments);
  };

  const removeSegment = (index: number) => {
    const updatedSegments = config.segmentation.segments.filter((_, i) => i !== index);
    handleFieldChange('segmentation.segments', updatedSegments);
  };

  const addCustomField = () => {
    const updatedCustomFields = [
      ...config.customFields,
      {
        fieldName: '',
        fieldType: 'text',
        purpose: '',
        isRequired: false
      }
    ];
    handleFieldChange('customFields', updatedCustomFields);
  };

  const removeCustomField = (index: number) => {
    const updatedCustomFields = config.customFields.filter((_, i) => i !== index);
    handleFieldChange('customFields', updatedCustomFields);
  };

  const addTrackingDomain = () => {
    setConfig(prevConfig => ({
      ...prevConfig,
      websiteTracking: {
        ...prevConfig.websiteTracking,
        trackingDomains: [...prevConfig.websiteTracking.trackingDomains, '']
      }
    }));
  };

  const updateTrackingDomain = (index: number, value: string) => {
    setConfig(prevConfig => {
      const updated = [...prevConfig.websiteTracking.trackingDomains];
      updated[index] = value;
      return {
        ...prevConfig,
        websiteTracking: { ...prevConfig.websiteTracking, trackingDomains: updated }
      };
    });
  };

  const removeTrackingDomain = (index: number) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      websiteTracking: {
        ...prevConfig.websiteTracking,
        trackingDomains: prevConfig.websiteTracking.trackingDomains.filter((_, i) => i !== index)
      }
    }));
  };

  // Manual save handler (kept for compatibility, but auto-save is primary)
  const handleSave = useCallback(async () => {
    if (isLoadingRef.current) return; // Don't save during loading

    if (!validateForm()) {
      alert('נא למלא את כל השדות הנדרשים');
      return;
    }

    const completeConfig = { ...config }; // No smart fields in this component

    // Force immediate save
    await saveData(completeConfig, 'manual');
  }, [config, saveData, validateForm]);

  return (
    <div className="space-y-6 p-8" dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">שירות #42: הטמעת מערכת אוטומציית שיווק</h2>
        <p className="text-gray-600 mt-2">HubSpot Marketing / ActiveCampaign / Mailchimp</p>
      </div>

      {/* Platform & Subscription */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">פלטפורמה ומנוי</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              פלטפורמה <span className="text-red-500">*</span>
            </label>
            <select
              value={config.platform}
              onChange={(e) => handleFieldChange('platform', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="hubspot_marketing">HubSpot Marketing</option>
              <option value="activecampaign">ActiveCampaign</option>
              <option value="mailchimp">Mailchimp</option>
            </select>
            {errors.platform && <p className="text-red-500 text-sm mt-1">{errors.platform}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">רמת מנוי</label>
            <input
              type="text"
              value={config.subscriptionTier}
              onChange={(e) => handleFieldChange('subscriptionTier', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Starter, Professional, Plus..."
            />
          </div>
        </div>
      </Card>

      {/* Admin Access */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">גישת אדמין</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              אימייל <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={config.adminAccess.email}
              onChange={(e) => handleFieldChange('adminAccess.email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="admin@company.com"
            />
            {errors.adminEmail && <p className="text-red-500 text-sm mt-1">{errors.adminEmail}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">תפקיד</label>
            <select
              value={config.adminAccess.role}
              onChange={(e) => handleFieldChange('adminAccess.role', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="account_owner">Account Owner</option>
            </select>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.adminAccess.hasApiAccess}
              onChange={(e) => handleFieldChange('adminAccess.hasApiAccess', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">יש גישה ל-API</span>
          </label>
        </div>
      </Card>

      {/* Domain Authentication */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">אימות דומיין (חיוני לשליחה)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              דומיין <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.domainAuthentication.domain}
              onChange={(e) => handleFieldChange('domainAuthentication.domain', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="company.com"
            />
            {errors.domain && <p className="text-red-500 text-sm mt-1">{errors.domain}</p>}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.domainAuthentication.spfRecordConfigured}
                onChange={(e) => handleFieldChange('domainAuthentication.spfRecordConfigured', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">SPF Record מוגדר</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.domainAuthentication.dkimRecordConfigured}
                onChange={(e) => handleFieldChange('domainAuthentication.dkimRecordConfigured', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">DKIM Record מוגדר</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.domainAuthentication.hasDnsAccess}
                onChange={(e) => handleFieldChange('domainAuthentication.hasDnsAccess', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">יש גישה ל-DNS</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.domainAuthentication.hasPhysicalAddress}
                onChange={(e) => handleFieldChange('domainAuthentication.hasPhysicalAddress', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">יש כתובת פיזית (נדרש לפי CAN-SPAM)</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Website Tracking */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">מעקב אתר</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.websiteTracking.hasWebsiteAccess}
                onChange={(e) => handleFieldChange('websiteTracking.hasWebsiteAccess', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">יש גישה לאתר</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.websiteTracking.trackingCodeInstalled}
                onChange={(e) => handleFieldChange('websiteTracking.trackingCodeInstalled', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">קוד מעקב מותקן</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.websiteTracking.useGoogleTagManager || false}
                onChange={(e) => handleFieldChange('websiteTracking.useGoogleTagManager', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">שימוש ב-Google Tag Manager</span>
            </label>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">דומיינים למעקב</label>
              <button
                type="button"
                onClick={addTrackingDomain}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + הוסף דומיין
              </button>
            </div>
            <div className="space-y-2">
              {config.websiteTracking.trackingDomains.map((domain, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => updateTrackingDomain(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="www.company.com"
                  />
                  <button
                    type="button"
                    onClick={() => removeTrackingDomain(index)}
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

      {/* Automation Workflows */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">תהליכי אוטומציה</h3>
          <button
            type="button"
            onClick={addWorkflow}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + הוסף תהליך
          </button>
        </div>
        <div className="space-y-4">
          {config.automationWorkflows.map((workflow, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שם תהליך</label>
                  <input
                    type="text"
                    value={workflow.workflowName}
                    onChange={(e) => {
                      const updated = [...config.automationWorkflows];
                      updated[index] = { ...updated[index], workflowName: e.target.value };
                      handleFieldChange('automationWorkflows', updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Welcome Series, Lead Nurture..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">טריגר</label>
                  <select
                    value={workflow.trigger}
                    onChange={(e) => {
                      const updated = [...config.automationWorkflows];
                      updated[index] = { ...updated[index], trigger: e.target.value as any };
                      handleFieldChange('automationWorkflows', updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="form_submit">שליחת טופס</option>
                    <option value="list_join">הצטרפות לרשימה</option>
                    <option value="tag_added">הוספת תגית</option>
                    <option value="page_visit">ביקור בדף</option>
                    <option value="email_opened">פתיחת אימייל</option>
                    <option value="link_clicked">לחיצה על קישור</option>
                    <option value="date_based">מבוסס תאריך</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeWorkflow(index)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                הסר תהליך
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Segmentation */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">סגמנטים</h3>
          <button
            type="button"
            onClick={addSegment}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + הוסף סגמנט
          </button>
        </div>
        <div className="space-y-4">
          {config.segmentation.segments.map((segment, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded-lg">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שם סגמנט</label>
                  <input
                    type="text"
                    value={segment.segmentName}
                    onChange={(e) => {
                      const updated = [...config.segmentation.segments];
                      updated[index] = { ...updated[index], segmentName: e.target.value };
                      handleFieldChange('segmentation.segments', updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="לקוחות פוטנציאליים, לקוחות פעילים..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">קריטריונים</label>
                  <textarea
                    value={segment.criteria}
                    onChange={(e) => {
                      const updated = [...config.segmentation.segments];
                      updated[index] = { ...updated[index], criteria: e.target.value };
                      handleFieldChange('segmentation.segments', updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    rows={2}
                    placeholder="תיאור קריטריונים לסגמנט..."
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeSegment(index)}
                className="text-sm text-red-600 hover:text-red-700 mt-2"
              >
                הסר סגמנט
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">שם שדה</label>
                  <input
                    type="text"
                    value={field.fieldName}
                    onChange={(e) => {
                      const updated = [...config.customFields];
                      updated[index] = { ...updated[index], fieldName: e.target.value };
                      handleFieldChange('customFields', updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Company Size, Industry..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">סוג שדה</label>
                  <select
                    value={field.fieldType}
                    onChange={(e) => {
                      const updated = [...config.customFields];
                      updated[index] = { ...updated[index], fieldType: e.target.value as any };
                      handleFieldChange('customFields', updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="text">טקסט</option>
                    <option value="number">מספר</option>
                    <option value="date">תאריך</option>
                    <option value="dropdown">רשימה נפתחת</option>
                    <option value="checkbox">צ'קבוקס</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מטרה</label>
                <input
                  type="text"
                  value={field.purpose}
                  onChange={(e) => {
                    const updated = [...config.customFields];
                    updated[index] = { ...updated[index], purpose: e.target.value };
                    handleFieldChange('customFields', updated);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="סגמנטציה, התאמה אישית..."
                />
              </div>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={field.isRequired}
                  onChange={(e) => {
                    const updated = [...config.customFields];
                    updated[index] = { ...updated[index], isRequired: e.target.checked };
                    handleFieldChange('customFields', updated);
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">שדה חובה</span>
              </label>
              <button
                type="button"
                onClick={() => removeCustomField(index)}
                className="text-sm text-red-600 hover:text-red-700 mt-2"
              >
                הסר שדה
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Compliance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">ציות ואישורים</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.compliance.gdprCompliant}
              onChange={(e) => handleFieldChange('compliance.gdprCompliant', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">עומד ב-GDPR</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.compliance.hasUnsubscribeLink}
              onChange={(e) => handleFieldChange('compliance.hasUnsubscribeLink', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">יש קישור הסרה מרשימה (חובה)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.compliance.hasPhysicalAddress}
              onChange={(e) => handleFieldChange('compliance.hasPhysicalAddress', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">יש כתובת פיזית (חובה לפי CAN-SPAM)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.compliance.hasPrivacyPolicy}
              onChange={(e) => handleFieldChange('compliance.hasPrivacyPolicy', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">יש מדיניות פרטיות</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.compliance.cookieConsentBanner || false}
              onChange={(e) => handleFieldChange('compliance.cookieConsentBanner', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">באנר הסכמה לעוגיות</span>
          </label>
        </div>
      </Card>

      {/* Training & Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">הדרכה ולוח זמנים</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.trainingRequired}
              onChange={(e) => handleFieldChange('trainingRequired', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">נדרשת הדרכה</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">משך הטמעה משוער (שבועות)</label>
            <input
              type="number"
              value={config.estimatedWeeks}
              onChange={(e) => handleFieldChange('estimatedWeeks', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="1"
            />
          </div>
        </div>
      </Card>

      {/* Auto-Save Status and Manual Save */}
      <div className="flex justify-between items-center gap-4">
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
          {!isSaving && !saveError && config.platform && (
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
          שמור ידנית
        </button>
      </div>
    </div>
  );
}
