import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Card, Input, TextArea, Button } from '../../../Base';
import type { EssentialDetailsModule } from '../../../../types';

interface SystemsDetailsSectionProps {
  data?: EssentialDetailsModule['systemsDetails'];
  onChange: (data: Partial<EssentialDetailsModule['systemsDetails']>) => void;
  crmName?: string;
}

export const SystemsDetailsSection: React.FC<SystemsDetailsSectionProps> = ({
  data = {},
  onChange,
  crmName,
}) => {
  const [newLimitation, setNewLimitation] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newIntegration, setNewIntegration] = useState('');

  const updateField = <K extends keyof typeof data>(
    field: K,
    value: (typeof data)[K]
  ) => {
    onChange({ [field]: value });
  };

  const addLimitation = () => {
    if (!newLimitation) return;
    const limitations = [...(data.crmLimitations || []), newLimitation];
    onChange({ crmLimitations: limitations });
    setNewLimitation('');
  };

  const removeLimitation = (index: number) => {
    const limitations = (data.crmLimitations || []).filter(
      (_, i) => i !== index
    );
    onChange({ crmLimitations: limitations });
  };

  const addFeature = () => {
    if (!newFeature) return;
    const features = [...(data.desiredFeatures || []), newFeature];
    onChange({ desiredFeatures: features });
    setNewFeature('');
  };

  const removeFeature = (index: number) => {
    const features = (data.desiredFeatures || []).filter((_, i) => i !== index);
    onChange({ desiredFeatures: features });
  };

  const addIntegration = () => {
    if (!newIntegration) return;
    const integrations = [...(data.integrationNeeds || []), newIntegration];
    onChange({ integrationNeeds: integrations });
    setNewIntegration('');
  };

  const removeIntegration = (index: number) => {
    const integrations = (data.integrationNeeds || []).filter(
      (_, i) => i !== index
    );
    onChange({ integrationNeeds: integrations });
  };

  return (
    <Card className="border-l-4 border-l-indigo-500">
      <div className="space-y-4">
        {crmName && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <p className="text-sm text-indigo-800">
              <strong>המערכת הנוכחית:</strong> {crmName}
            </p>
          </div>
        )}

        <Input
          label="איזו מערכת CRM אתם משתמשים היום?"
          value={data.currentCrmName || crmName || ''}
          onChange={(val) => updateField('currentCrmName', val)}
          placeholder="למשל: Zoho CRM, Salesforce..."
          dir="rtl"
        />

        <TextArea
          label="איך משתמשים במערכת היום?"
          value={data.crmUsage || ''}
          onChange={(val) => updateField('crmUsage', val)}
          rows={3}
          placeholder="תאר בקצרה איך אתם משתמשים בה - מה עושים בה, מי עובד איתה..."
          dir="rtl"
        />

        {/* Limitations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            מה החסרונות/מגבלות של המערכת?
          </label>
          {(data.crmLimitations || []).length > 0 && (
            <div className="space-y-2 mb-3">
              {(data.crmLimitations || []).map((limitation, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-2"
                >
                  <span className="text-sm">{limitation}</span>
                  <button
                    onClick={() => removeLimitation(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              label=""
              value={newLimitation}
              onChange={setNewLimitation}
              placeholder="למשל: איטי, יקר, לא אינטואיטיבי..."
              dir="rtl"
            />
            <Button
              onClick={addLimitation}
              variant="secondary"
              size="sm"
              className="mt-[3px]"
              disabled={!newLimitation}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Desired Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            אילו פיצ'רים היית רוצה שיהיו?
          </label>
          {(data.desiredFeatures || []).length > 0 && (
            <div className="space-y-2 mb-3">
              {(data.desiredFeatures || []).map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2"
                >
                  <span className="text-sm">{feature}</span>
                  <button
                    onClick={() => removeFeature(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              label=""
              value={newFeature}
              onChange={setNewFeature}
              placeholder="למשל: אוטומציה של תהליכים, אינטגרציה עם WhatsApp..."
              dir="rtl"
            />
            <Button
              onClick={addFeature}
              variant="secondary"
              size="sm"
              className="mt-[3px]"
              disabled={!newFeature}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Integration Needs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            עם אילו מערכות תרצה אינטגרציה?
          </label>
          {(data.integrationNeeds || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {(data.integrationNeeds || []).map((integration, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{integration}</span>
                  <button
                    onClick={() => removeIntegration(index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              label=""
              value={newIntegration}
              onChange={setNewIntegration}
              placeholder="למשל: WhatsApp, Google Calendar, אתר..."
              dir="rtl"
            />
            <Button
              onClick={addIntegration}
              variant="secondary"
              size="sm"
              className="mt-[3px]"
              disabled={!newIntegration}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Input
          label="כמה משתמשים יעבדו במערכת?"
          type="number"
          value={data.userCount?.toString() || ''}
          onChange={(val) =>
            updateField('userCount', val ? parseInt(val) : undefined)
          }
          placeholder="0"
          dir="rtl"
        />

        <Input
          label="נפח נתונים משוער"
          value={data.dataVolume || ''}
          onChange={(val) => updateField('dataVolume', val)}
          placeholder="למשל: 1000 לקוחות, 500 עסקאות בשנה..."
          dir="rtl"
        />
      </div>
    </Card>
  );
};
