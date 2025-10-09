/**
 * Analytics Implementation Requirements Specification Component
 *
 * Collects detailed technical requirements for Analytics platform implementation.
 * Part of Phase 2 Service Requirements Collection System.
 *
 * @component
 * @category System Implementations
 */

import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { ImplAnalyticsRequirements } from '../../../../types/systemImplementationServices';
import { Card } from '../../../Common/Card';

/**
 * Analytics Implementation specification component for Phase 2 requirements collection
 */
export function ImplAnalyticsSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // State initialization with proper typing and complete defaults
  const [config, setConfig] = useState<ImplAnalyticsRequirements>({
    platform: 'google_analytics_4',
    adminAccess: {
      email: '',
      role: 'administrator'
    },
    propertyConfig: {},
    integration: {
      websiteUrls: [],
      trackingCodeInstalled: false,
      useGoogleTagManager: false,
      hasDeveloperAccess: false
    },
    eventTaxonomy: [],
    conversionEvents: [],
    dataRetention: {
      retentionPeriod: '14_months'
    },
    configuration: {
      timeZone: 'Asia/Jerusalem',
      currency: 'ILS'
    },
    privacyCompliance: {
      cookieConsentBanner: false
    },
    testing: {
      realtimeReportChecked: false,
      testEventsVerified: false
    },
    training: {
      trainingRequired: true
    },
    estimatedDays: 7
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load existing data
  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.systemImplementations;
    const existing = Array.isArray(category)
      ? category.find(item => item.serviceId === 'impl-analytics')
      : undefined;

    if (existing?.requirements) {
      setConfig(existing.requirements as ImplAnalyticsRequirements);
    }
  }, [currentMeeting]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!config.platform) {
      newErrors.platform = 'יש לבחור פלטפורמה';
    }

    if (!config.adminAccess.email) {
      newErrors.adminEmail = 'יש להזין כתובת מייל של אדמין';
    }

    if (config.integration.websiteUrls.length === 0) {
      newErrors.websiteUrls = 'יש להזין לפחות כתובת אתר אחת';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Array management handlers
  const addWebsiteUrl = () => {
    setConfig({
      ...config,
      integration: {
        ...config.integration,
        websiteUrls: [...config.integration.websiteUrls, '']
      }
    });
  };

  const updateWebsiteUrl = (index: number, value: string) => {
    const updated = [...config.integration.websiteUrls];
    updated[index] = value;
    setConfig({
      ...config,
      integration: { ...config.integration, websiteUrls: updated }
    });
  };

  const removeWebsiteUrl = (index: number) => {
    setConfig({
      ...config,
      integration: {
        ...config.integration,
        websiteUrls: config.integration.websiteUrls.filter((_, i) => i !== index)
      }
    });
  };

  const addEvent = () => {
    setConfig({
      ...config,
      eventTaxonomy: [
        ...config.eventTaxonomy,
        {
          eventName: '',
          description: '',
          triggerCondition: ''
        }
      ]
    });
  };

  const updateEvent = (index: number, field: Partial<typeof config.eventTaxonomy[0]>) => {
    const updated = [...config.eventTaxonomy];
    updated[index] = { ...updated[index], ...field };
    setConfig({ ...config, eventTaxonomy: updated });
  };

  const removeEvent = (index: number) => {
    setConfig({
      ...config,
      eventTaxonomy: config.eventTaxonomy.filter((_, i) => i !== index)
    });
  };

  const addConversionEvent = () => {
    setConfig({
      ...config,
      conversionEvents: [
        ...config.conversionEvents,
        {
          eventName: ''
        }
      ]
    });
  };

  const updateConversionEvent = (index: number, field: Partial<typeof config.conversionEvents[0]>) => {
    const updated = [...config.conversionEvents];
    updated[index] = { ...updated[index], ...field };
    setConfig({ ...config, conversionEvents: updated });
  };

  const removeConversionEvent = (index: number) => {
    setConfig({
      ...config,
      conversionEvents: config.conversionEvents.filter((_, i) => i !== index)
    });
  };

  const addUserProperty = () => {
    setConfig({
      ...config,
      userProperties: [
        ...(config.userProperties || []),
        {
          propertyName: '',
          type: 'string',
          purpose: ''
        }
      ]
    });
  };

  const updateUserProperty = (index: number, field: any) => {
    const updated = [...(config.userProperties || [])];
    updated[index] = { ...updated[index], ...field };
    setConfig({ ...config, userProperties: updated });
  };

  const removeUserProperty = (index: number) => {
    setConfig({
      ...config,
      userProperties: (config.userProperties || []).filter((_, i) => i !== index)
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
      const updated = category.filter(item => item.serviceId !== 'impl-analytics');

      updated.push({
        serviceId: 'impl-analytics',
        serviceName: 'הטמעת Analytics',
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
      console.error('Error saving impl-analytics config:', error);
      alert('שגיאה בשמירת הגדרות');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-8" dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">שירות #47: הטמעת Analytics</h2>
        <p className="text-gray-600 mt-2">הטמעה מלאה של מערכת Analytics בארגון</p>
      </div>

      {/* Platform Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">פלטפורמה</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              פלטפורמת Analytics <span className="text-red-500">*</span>
            </label>
            <select
              value={config.platform || ''}
              onChange={(e) => setConfig({ ...config, platform: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="google_analytics_4">Google Analytics 4</option>
              <option value="mixpanel">Mixpanel</option>
              <option value="amplitude">Amplitude</option>
            </select>
            {errors.platform && <p className="text-red-500 text-sm mt-1">{errors.platform}</p>}
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
              <option value="editor">Editor</option>
              <option value="administrator">Administrator</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Website Integration */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">אתרים לניטור</h3>
          <button
            type="button"
            onClick={addWebsiteUrl}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + הוסף אתר
          </button>
        </div>
        <div className="space-y-2">
          {config.integration.websiteUrls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => updateWebsiteUrl(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://example.com"
              />
              <button
                type="button"
                onClick={() => removeWebsiteUrl(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        {errors.websiteUrls && <p className="text-red-500 text-sm mt-1">{errors.websiteUrls}</p>}

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.integration.trackingCodeInstalled}
              onChange={(e) => setConfig({
                ...config,
                integration: { ...config.integration, trackingCodeInstalled: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">קוד מעקב מותקן</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.integration.useGoogleTagManager}
              onChange={(e) => setConfig({
                ...config,
                integration: { ...config.integration, useGoogleTagManager: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">שימוש ב-Google Tag Manager (מומלץ)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.integration.hasDeveloperAccess}
              onChange={(e) => setConfig({
                ...config,
                integration: { ...config.integration, hasDeveloperAccess: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">יש גישה למפתח</span>
          </label>
        </div>

        {config.integration.useGoogleTagManager && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">GTM Container ID</label>
            <input
              type="text"
              value={config.integration.gtmContainerId || ''}
              onChange={(e) => setConfig({
                ...config,
                integration: { ...config.integration, gtmContainerId: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="GTM-XXXXXX"
            />
          </div>
        )}
      </Card>

      {/* Event Taxonomy */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">אירועים לעקוב</h3>
          <button
            type="button"
            onClick={addEvent}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + הוסף אירוע
          </button>
        </div>
        <div className="space-y-4">
          {config.eventTaxonomy.map((event, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שם אירוע</label>
                  <input
                    type="text"
                    value={event.eventName}
                    onChange={(e) => updateEvent(index, { eventName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="button_click, form_submit..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
                  <input
                    type="text"
                    value={event.description}
                    onChange={(e) => updateEvent(index, { description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="מה האירוע מודד"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">תנאי הפעלה</label>
                <input
                  type="text"
                  value={event.triggerCondition}
                  onChange={(e) => updateEvent(index, { triggerCondition: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="כאשר המשתמש לוחץ על כפתור ההרשמה"
                />
              </div>
              <button
                type="button"
                onClick={() => removeEvent(index)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                הסר אירוע
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Conversion Events */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">אירועי המרה</h3>
          <button
            type="button"
            onClick={addConversionEvent}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + הוסף המרה
          </button>
        </div>
        <div className="space-y-4">
          {config.conversionEvents.map((conversion, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שם אירוע</label>
                  <input
                    type="text"
                    value={conversion.eventName}
                    onChange={(e) => updateConversionEvent(index, { eventName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="purchase, signup..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ערך המרה</label>
                  <input
                    type="number"
                    value={conversion.conversionValue || ''}
                    onChange={(e) => updateConversionEvent(index, { conversionValue: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeConversionEvent(index)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                הסר המרה
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* User Properties */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">מאפייני משתמש מותאמים</h3>
          <button
            type="button"
            onClick={addUserProperty}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + הוסף מאפיין
          </button>
        </div>
        <div className="space-y-4">
          {(config.userProperties || []).map((prop, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שם מאפיין</label>
                  <input
                    type="text"
                    value={prop.propertyName}
                    onChange={(e) => updateUserProperty(index, { propertyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">סוג</label>
                  <select
                    value={prop.type}
                    onChange={(e) => updateUserProperty(index, { type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="string">טקסט</option>
                    <option value="number">מספר</option>
                    <option value="boolean">בוליאן</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">מטרה</label>
                  <input
                    type="text"
                    value={prop.purpose}
                    onChange={(e) => updateUserProperty(index, { purpose: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeUserProperty(index)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                הסר מאפיין
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">הגדרות כלליות</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">אזור זמן</label>
              <input
                type="text"
                value={config.configuration.timeZone}
                onChange={(e) => setConfig({
                  ...config,
                  configuration: { ...config.configuration, timeZone: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Asia/Jerusalem"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מטבע</label>
              <input
                type="text"
                value={config.configuration.currency}
                onChange={(e) => setConfig({
                  ...config,
                  configuration: { ...config.configuration, currency: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="ILS"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">שמירת נתונים</label>
            <select
              value={config.dataRetention.retentionPeriod}
              onChange={(e) => setConfig({
                ...config,
                dataRetention: { ...config.dataRetention, retentionPeriod: e.target.value as any }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="14_months">14 חודשים</option>
              <option value="26_months">26 חודשים</option>
              <option value="38_months">38 חודשים</option>
              <option value="50_months">50 חודשים</option>
            </select>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.dataRetention.bigQueryExport || false}
              onChange={(e) => setConfig({
                ...config,
                dataRetention: { ...config.dataRetention, bigQueryExport: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">ייצוא ל-BigQuery (לאחסון ארוך טווח)</span>
          </label>
        </div>
      </Card>

      {/* Privacy & Compliance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">פרטיות ותאימות</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.privacyCompliance.cookieConsentBanner}
              onChange={(e) => setConfig({
                ...config,
                privacyCompliance: { ...config.privacyCompliance, cookieConsentBanner: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">באנר הסכמה לעוגיות</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.privacyCompliance.anonymizeIp || false}
              onChange={(e) => setConfig({
                ...config,
                privacyCompliance: { ...config.privacyCompliance, anonymizeIp: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">אנונימיזציה של IP</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.privacyCompliance.dataProcessingAmendment || false}
              onChange={(e) => setConfig({
                ...config,
                privacyCompliance: { ...config.privacyCompliance, dataProcessingAmendment: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">תיקון עיבוד נתונים (DPA)</span>
          </label>
        </div>
      </Card>

      {/* Testing */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">בדיקות</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.testing.realtimeReportChecked}
              onChange={(e) => setConfig({
                ...config,
                testing: { ...config.testing, realtimeReportChecked: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">דוח זמן אמת נבדק</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.testing.debugModeUsed || false}
              onChange={(e) => setConfig({
                ...config,
                testing: { ...config.testing, debugModeUsed: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">שימוש במצב Debug</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.testing.testEventsVerified}
              onChange={(e) => setConfig({
                ...config,
                testing: { ...config.testing, testEventsVerified: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">אירועי בדיקה אומתו</span>
          </label>
        </div>
      </Card>

      {/* Training */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">הדרכה</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.training.trainingRequired}
              onChange={(e) => setConfig({
                ...config,
                training: { ...config.training, trainingRequired: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">נדרשת הדרכה</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">משך הטמעה משוער (ימים)</label>
            <input
              type="number"
              value={config.estimatedDays}
              onChange={(e) => setConfig({ ...config, estimatedDays: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="1"
            />
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
