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

  // State initialization with proper typing
  const [config, setConfig] = useState<ImplCrmRequirements>({
    platform: 'zoho',
    subscriptionTier: '',
    modules: [],
    userCount: 0,
    customFields: [],
    workflows: [],
    integrations: [],
    migrationRequired: false,
    trainingRequired: true,
    estimatedWeeks: 6
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
      setConfig(existing.requirements);
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

    if (config.userCount < 1) {
      newErrors.users = 'יש להזין מספר משתמשים';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

      <Card className="p-6">
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
              <option value="pipedrive">Pipedrive</option>
              <option value="monday">Monday.com</option>
              <option value="other">אחר</option>
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

          {/* User Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              מספר משתמשים <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={config.userCount || 0}
              onChange={(e) => setConfig({ ...config, userCount: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="1"
            />
            {errors.users && <p className="text-red-500 text-sm mt-1">{errors.users}</p>}
          </div>

          {/* Estimated Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              משך הטמעה משוער (שבועות)
            </label>
            <input
              type="number"
              value={config.estimatedWeeks || 0}
              onChange={(e) => setConfig({ ...config, estimatedWeeks: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="1"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.migrationRequired || false}
                onChange={(e) => setConfig({ ...config, migrationRequired: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">נדרשת הגירת נתונים ממערכת קיימת</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.trainingRequired || false}
                onChange={(e) => setConfig({ ...config, trainingRequired: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">נדרש הדרכה למשתמשים</span>
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
