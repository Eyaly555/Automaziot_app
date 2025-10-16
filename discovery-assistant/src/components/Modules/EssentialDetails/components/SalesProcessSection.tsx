import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Card, Input, TextArea, Button } from '../../../Base';
import type { EssentialDetailsModule } from '../../../../types';

interface SalesProcessSectionProps {
  data?: EssentialDetailsModule['salesProcess'];
  onChange: (data: Partial<EssentialDetailsModule['salesProcess']>) => void;
}

export const SalesProcessSection: React.FC<SalesProcessSectionProps> = ({
  data = {},
  onChange,
}) => {
  const [newStage, setNewStage] = useState('');
  const [newStageCriteria, setNewStageCriteria] = useState('');

  const updateField = <K extends keyof typeof data>(
    field: K,
    value: (typeof data)[K]
  ) => {
    onChange({ [field]: value });
  };

  const addStage = () => {
    if (!newStage) return;
    const stages = [...(data.salesStages || []), newStage];
    const criteria = [
      ...(data.stageCriteria || []),
      { stage: newStage, criteria: newStageCriteria },
    ];
    onChange({ salesStages: stages, stageCriteria: criteria });
    setNewStage('');
    setNewStageCriteria('');
  };

  const removeStage = (index: number) => {
    const stages = (data.salesStages || []).filter((_, i) => i !== index);
    const criteria = (data.stageCriteria || []).filter((_, i) => i !== index);
    onChange({ salesStages: stages, stageCriteria: criteria });
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <div className="space-y-4">
        {/* Sales Stages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            שלבי המכירה שלכם
          </label>
          {(data.salesStages || []).length > 0 && (
            <div className="space-y-2 mb-3">
              {(data.salesStages || []).map((stage, index) => {
                const stageCriteria = (data.stageCriteria || []).find(
                  (c) => c.stage === stage
                );
                return (
                  <div
                    key={index}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="font-medium">{stage}</span>
                        </div>
                        {stageCriteria?.criteria && (
                          <p className="text-sm text-gray-600 mr-8">
                            {stageCriteria.criteria}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeStage(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="שם השלב"
                value={newStage}
                onChange={setNewStage}
                placeholder="למשל: ליד חדש, פגישה ראשונה, הצעת מחיר..."
                dir="rtl"
              />
              <Input
                label="קריטריון למעבר (אופציונלי)"
                value={newStageCriteria}
                onChange={setNewStageCriteria}
                placeholder="למשל: לאחר פגישה ראשונה..."
                dir="rtl"
              />
            </div>
            <Button
              onClick={addStage}
              variant="secondary"
              size="sm"
              className="mt-2"
              disabled={!newStage}
            >
              <Plus className="w-4 h-4 ml-2" />
              הוסף שלב
            </Button>
          </div>
        </div>

        <Input
          label="כמה זמן לוקח תהליך מכירה ממוצע? (בימים)"
          type="number"
          value={data.averageSalesCycle?.toString() || ''}
          onChange={(val) =>
            updateField('averageSalesCycle', val ? parseInt(val) : undefined)
          }
          placeholder="למשל: 30 ימים"
          dir="rtl"
        />

        <Input
          label="אחוז המרה ממוצע (מליד לעסקה סגורה)"
          type="number"
          value={data.conversionRate?.toString() || ''}
          onChange={(val) =>
            updateField('conversionRate', val ? parseInt(val) : undefined)
          }
          placeholder="למשל: 20%"
          dir="rtl"
        />

        <TextArea
          label="איך עוקבים אחרי הזדמנויות פתוחות?"
          value={data.opportunityTrackingMethod || ''}
          onChange={(val) => updateField('opportunityTrackingMethod', val)}
          rows={2}
          placeholder="למשל: טבלת Excel, CRM, נייר..."
          dir="rtl"
        />

        <TextArea
          label="מה הצוואר הבקבוק המרכזי בתהליך המכירה?"
          value={data.mainSalesBottleneck || ''}
          onChange={(val) => updateField('mainSalesBottleneck', val)}
          rows={3}
          placeholder="תאר את הבעיה המרכזית שמעכבת את תהליך המכירה..."
          dir="rtl"
        />
      </div>
    </Card>
  );
};
