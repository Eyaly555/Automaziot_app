import React, { useState } from 'react';
import { X, Plus, AlertTriangle, CheckCircle, Link2 } from 'lucide-react';
import { DetailedSystemInfo, SystemIntegrationNeed } from '../../../types';
import {
  getSystemsByCategory,
  getSystemDetails,
  COMMON_PAIN_POINTS,
  CRITICAL_FEATURES_BY_CATEGORY,
} from '../../../config/systemsDatabase';
import { Card } from '../../Common/Card';
import {
  TextField,
  RadioGroup,
  CheckboxGroup,
  TextAreaField,
} from '../../Common/FormFields';

interface DetailedSystemCardProps {
  system: DetailedSystemInfo;
  onUpdate: (updates: Partial<DetailedSystemInfo>) => void;
  onRemove: () => void;
  allSystems: DetailedSystemInfo[];
}

export const DetailedSystemCard: React.FC<DetailedSystemCardProps> = ({
  system,
  onUpdate,
  onRemove,
  allSystems,
}) => {
  const [showIntegrationForm, setShowIntegrationForm] = useState(false);

  const categorySystems = getSystemsByCategory(system.category);
  const systemDetails = getSystemDetails(
    system.category,
    system.specificSystem
  );
  const commonPainPoints = COMMON_PAIN_POINTS[system.category] || [];
  const criticalFeatures = CRITICAL_FEATURES_BY_CATEGORY[system.category] || [];

  const handleAddIntegration = () => {
    setShowIntegrationForm(true);
  };

  const handleSaveIntegration = (
    integration: Omit<SystemIntegrationNeed, 'id'>
  ) => {
    const newIntegration: SystemIntegrationNeed = {
      ...integration,
      id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    onUpdate({
      integrationNeeds: [...system.integrationNeeds, newIntegration],
    });
    setShowIntegrationForm(false);
  };

  const handleRemoveIntegration = (integrationId: string) => {
    onUpdate({
      integrationNeeds: system.integrationNeeds.filter(
        (int) => int.id !== integrationId
      ),
    });
  };

  return (
    <Card
      title={`${systemDetails?.labelHebrew || system.specificSystem}`}
      subtitle={`קטגוריה: ${system.category}`}
      className="relative"
    >
      <button
        onClick={onRemove}
        className="absolute top-4 left-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="הסר מערכת"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="space-y-6 mt-2">
        {/* Specific System Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            מערכת ספציפית *
          </label>
          <select
            value={system.specificSystem}
            onChange={(e) => onUpdate({ specificSystem: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            dir="rtl"
          >
            <option value="">בחר מערכת...</option>
            {categorySystems.map((sys) => (
              <option key={sys.value} value={sys.value}>
                {sys.labelHebrew}
              </option>
            ))}
          </select>
        </div>

        {/* Version */}
        {systemDetails?.versions && systemDetails.versions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              גרסה/מהדורה
            </label>
            <select
              value={system.version || ''}
              onChange={(e) => onUpdate({ version: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              dir="rtl"
            >
              <option value="">בחר גרסה...</option>
              {systemDetails.versions.map((version) => (
                <option key={version} value={version}>
                  {version}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Record Count */}
        <TextField
          label="כמות רשומות משוערת במערכת"
          type="number"
          value={system.recordCount?.toString() || ''}
          onChange={(value) =>
            onUpdate({ recordCount: parseInt(value) || undefined })
          }
          placeholder="לדוגמה: 50000"
        />

        {/* Monthly Users */}
        <TextField
          label="כמות משתמשים פעילים חודשית"
          type="number"
          value={system.monthlyUsers?.toString() || ''}
          onChange={(value) =>
            onUpdate({ monthlyUsers: parseInt(value) || undefined })
          }
          placeholder="לדוגמה: 25"
        />

        {/* Data Volume */}
        <RadioGroup
          label="נפח נתונים במערכת"
          value={system.dataVolume || ''}
          onChange={(value) => onUpdate({ dataVolume: value })}
          options={[
            { value: 'small', label: 'קטן (עד 10,000 רשומות)' },
            { value: 'medium', label: 'בינוני (10,000-100,000 רשומות)' },
            { value: 'large', label: 'גדול (100,000-1M רשומות)' },
            { value: 'enterprise', label: 'ארגוני (מעל 1M רשומות)' },
          ]}
        />

        {/* API Access */}
        <RadioGroup
          label="רמת גישה ל-API *"
          value={system.apiAccess}
          onChange={(value) => onUpdate({ apiAccess: value as any })}
          options={[
            { value: 'full', label: 'מלאה - גישה לכל הפונקציות' },
            { value: 'limited', label: 'מוגבלת - גישה חלקית' },
            { value: 'none', label: 'אין - אין גישת API' },
            { value: 'unknown', label: 'לא ידוע' },
          ]}
        />

        {/* Satisfaction Score */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            דירוג שביעות רצון מהמערכת *
          </label>
          <div className="flex gap-2" dir="ltr">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => onUpdate({ satisfactionScore: score as any })}
                className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                  system.satisfactionScore === score
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 hover:border-primary'
                }`}
              >
                {score}
                {score === 1 && ' ⭐'}
                {score === 5 && ' ⭐⭐⭐⭐⭐'}
              </button>
            ))}
          </div>
        </div>

        {/* Migration Willingness */}
        <RadioGroup
          label="נכונות להחלפת המערכת"
          value={system.migrationWillingness}
          onChange={(value) => onUpdate({ migrationWillingness: value as any })}
          options={[
            { value: 'eager', label: '🔴 רוצים להחליף בהקדם' },
            { value: 'open', label: '🟡 פתוחים לשקול' },
            { value: 'reluctant', label: '🟢 עדיפות להישאר' },
            { value: 'no', label: '⚫ בשום אופן לא להחליף' },
          ]}
        />

        {/* Pain Points */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            נקודות כאב במערכת זו
          </label>
          <CheckboxGroup
            label=""
            options={commonPainPoints.map((point) => ({
              value: point,
              label: point,
            }))}
            values={system.mainPainPoints}
            onChange={(values) => onUpdate({ mainPainPoints: values })}
            columns={1}
          />
          {system.mainPainPoints.length > 0 && (
            <div className="mt-2 p-3 bg-orange-50 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-orange-800">
                זוהו {system.mainPainPoints.length} נקודות כאב במערכת זו
              </span>
            </div>
          )}
        </div>

        {/* Critical Features */}
        {criticalFeatures.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תכונות קריטיות בשימוש
            </label>
            <CheckboxGroup
              label=""
              options={criticalFeatures.map((feature) => ({
                value: feature,
                label: feature,
              }))}
              values={system.criticalFeatures}
              onChange={(values) => onUpdate({ criticalFeatures: values })}
              columns={1}
            />
          </div>
        )}

        {/* Integration Needs */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              צרכי אינטגרציה
            </h4>
            <button
              onClick={handleAddIntegration}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              הוסף אינטגרציה
            </button>
          </div>

          {system.integrationNeeds.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              לא הוגדרו אינטגרציות למערכת זו
            </p>
          ) : (
            <div className="space-y-2">
              {system.integrationNeeds.map((integration) => (
                <div
                  key={integration.id}
                  className="p-3 bg-gray-50 rounded-lg flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {integration.targetSystemName}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          integration.criticalityLevel === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : integration.criticalityLevel === 'important'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {integration.criticalityLevel === 'critical'
                          ? 'קריטי'
                          : integration.criticalityLevel === 'important'
                            ? 'חשוב'
                            : 'רצוי'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <div>סוג: {integration.integrationType}</div>
                      <div>תדירות: {integration.frequency}</div>
                      <div>זרימה: {integration.dataFlow}</div>
                      <div className="flex items-center gap-1">
                        מצב:
                        {integration.currentStatus === 'working' && (
                          <>
                            <CheckCircle className="w-3 h-3 text-green-600" />{' '}
                            עובד
                          </>
                        )}
                        {integration.currentStatus === 'problematic' && (
                          <>
                            <AlertTriangle className="w-3 h-3 text-orange-600" />{' '}
                            בעייתי
                          </>
                        )}
                        {integration.currentStatus === 'missing' && (
                          <>
                            <X className="w-3 h-3 text-red-600" /> חסר
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveIntegration(integration.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Notes */}
        <TextAreaField
          label="הערות נוספות"
          value={system.customNotes || ''}
          onChange={(value) => onUpdate({ customNotes: value })}
          placeholder="הערות, פרטים טכניים, או מידע נוסף על המערכת..."
          rows={3}
        />
      </div>

      {/* Integration Form Modal */}
      {showIntegrationForm && (
        <IntegrationForm
          allSystems={allSystems.filter((s) => s.id !== system.id)}
          onSave={handleSaveIntegration}
          onCancel={() => setShowIntegrationForm(false)}
        />
      )}
    </Card>
  );
};

// Integration Form Component
interface IntegrationFormProps {
  allSystems: DetailedSystemInfo[];
  onSave: (integration: Omit<SystemIntegrationNeed, 'id'>) => void;
  onCancel: () => void;
}

const IntegrationForm: React.FC<IntegrationFormProps> = ({
  allSystems,
  onSave,
  onCancel,
}) => {
  const [targetSystemId, setTargetSystemId] = useState('');
  const [targetSystemName, setTargetSystemName] = useState('');
  const [integrationType, setIntegrationType] =
    useState<SystemIntegrationNeed['integrationType']>('api');
  const [frequency, setFrequency] =
    useState<SystemIntegrationNeed['frequency']>('daily');
  const [dataFlow, setDataFlow] =
    useState<SystemIntegrationNeed['dataFlow']>('bidirectional');
  const [criticalityLevel, setCriticalityLevel] =
    useState<SystemIntegrationNeed['criticalityLevel']>('important');
  const [currentStatus, setCurrentStatus] =
    useState<SystemIntegrationNeed['currentStatus']>('missing');
  const [specificNeeds, setSpecificNeeds] = useState('');

  const handleSubmit = () => {
    if (!targetSystemId && !targetSystemName) {
      alert('יש לבחור מערכת יעד');
      return;
    }

    onSave({
      targetSystemId,
      targetSystemName:
        targetSystemName ||
        allSystems.find((s) => s.id === targetSystemId)?.specificSystem ||
        '',
      integrationType,
      frequency,
      dataFlow,
      criticalityLevel,
      currentStatus,
      specificNeeds,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
        dir="rtl"
      >
        <h3 className="text-lg font-semibold mb-4">הוספת אינטגרציה</h3>

        <div className="space-y-4">
          {allSystems.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                מערכת יעד
              </label>
              <select
                value={targetSystemId}
                onChange={(e) => {
                  setTargetSystemId(e.target.value);
                  const system = allSystems.find(
                    (s) => s.id === e.target.value
                  );
                  if (system) setTargetSystemName(system.specificSystem);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">בחר מערכת...</option>
                {allSystems.map((sys) => (
                  <option key={sys.id} value={sys.id}>
                    {sys.specificSystem} ({sys.category})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <TextField
              label="שם מערכת היעד"
              value={targetSystemName}
              onChange={setTargetSystemName}
              placeholder="לדוגמה: WhatsApp Business"
            />
          )}

          <RadioGroup
            label="סוג אינטגרציה"
            value={integrationType}
            onChange={(v) => setIntegrationType(v as any)}
            options={[
              { value: 'native', label: 'Native - מובנה' },
              { value: 'api', label: 'API' },
              { value: 'zapier', label: 'Zapier' },
              { value: 'n8n', label: 'n8n' },
              { value: 'make', label: 'Make (Integromat)' },
              { value: 'manual', label: 'ידני' },
              { value: 'other', label: 'אחר' },
            ]}
          />

          <RadioGroup
            label="תדירות סנכרון"
            value={frequency}
            onChange={(v) => setFrequency(v as any)}
            options={[
              { value: 'realtime', label: 'זמן אמת' },
              { value: 'hourly', label: 'כל שעה' },
              { value: 'daily', label: 'יומי' },
              { value: 'weekly', label: 'שבועי' },
              { value: 'manual', label: 'ידני' },
            ]}
          />

          <RadioGroup
            label="כיוון זרימת הנתונים"
            value={dataFlow}
            onChange={(v) => setDataFlow(v as any)}
            options={[
              { value: 'bidirectional', label: 'דו-כיווני' },
              { value: 'one-way-to', label: 'חד-כיווני → למערכת היעד' },
              { value: 'one-way-from', label: 'חד-כיווני ← מהמערכת היעד' },
            ]}
          />

          <RadioGroup
            label="רמת קריטיות"
            value={criticalityLevel}
            onChange={(v) => setCriticalityLevel(v as any)}
            options={[
              { value: 'critical', label: '🔴 קריטי - חיוני לפעילות' },
              { value: 'important', label: '🟡 חשוב - משפר משמעותית' },
              { value: 'nice-to-have', label: '🟢 רצוי - יתרון' },
            ]}
          />

          <RadioGroup
            label="מצב נוכחי"
            value={currentStatus}
            onChange={(v) => setCurrentStatus(v as any)}
            options={[
              { value: 'working', label: '✅ עובד' },
              { value: 'problematic', label: '⚠️ בעייתי' },
              { value: 'missing', label: '❌ חסר' },
            ]}
          />

          <TextAreaField
            label="צרכים ספציפיים"
            value={specificNeeds}
            onChange={setSpecificNeeds}
            placeholder="פרט מה צריך לסנכרן, איזה שדות, תנאים מיוחדים..."
            rows={3}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            שמור
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
};
