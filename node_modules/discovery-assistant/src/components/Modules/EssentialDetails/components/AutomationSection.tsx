import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Card, Input, TextArea, Button } from '../../../Base';
import type { EssentialDetailsModule } from '../../../../types';

interface AutomationSectionProps {
  data?: EssentialDetailsModule['automationOpportunities'];
  onChange: (
    data: Partial<EssentialDetailsModule['automationOpportunities']>
  ) => void;
}

export const AutomationSection: React.FC<AutomationSectionProps> = ({
  data = {},
  onChange,
}) => {
  const [newProcessName, setNewProcessName] = useState('');
  const [newProcessFreq, setNewProcessFreq] = useState('');
  const [newProcessTime, setNewProcessTime] = useState('');
  const [newDataEntry, setNewDataEntry] = useState('');

  const updateField = <K extends keyof typeof data>(
    field: K,
    value: (typeof data)[K]
  ) => {
    onChange({ [field]: value });
  };

  const addProcess = () => {
    if (!newProcessName) return;
    const processes = [
      ...(data.repetitiveProcesses || []),
      {
        name: newProcessName,
        frequency: newProcessFreq,
        timePerExecution: newProcessTime ? parseInt(newProcessTime) : 0,
      },
    ];
    onChange({ repetitiveProcesses: processes });
    setNewProcessName('');
    setNewProcessFreq('');
    setNewProcessTime('');
  };

  const removeProcess = (index: number) => {
    const processes = (data.repetitiveProcesses || []).filter(
      (_, i) => i !== index
    );
    onChange({ repetitiveProcesses: processes });
  };

  const addDataEntry = () => {
    if (!newDataEntry) return;
    const entries = [...(data.manualDataEntry || []), newDataEntry];
    onChange({ manualDataEntry: entries });
    setNewDataEntry('');
  };

  const removeDataEntry = (index: number) => {
    const entries = (data.manualDataEntry || []).filter((_, i) => i !== index);
    onChange({ manualDataEntry: entries });
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <div className="space-y-4">
        {/* Repetitive Processes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            תהליכים שחוזרים על עצמם
          </label>
          {(data.repetitiveProcesses || []).length > 0 && (
            <div className="space-y-2 mb-3">
              {(data.repetitiveProcesses || []).map((process, index) => (
                <div
                  key={index}
                  className="bg-orange-50 border border-orange-200 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{process.name}</h4>
                      <div className="flex gap-4 mt-1 text-sm text-gray-600">
                        {process.frequency && (
                          <span>תדירות: {process.frequency}</span>
                        )}
                        {process.timePerExecution > 0 && (
                          <span>
                            זמן ביצוע: {process.timePerExecution} דקות
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeProcess(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                label="שם התהליך"
                value={newProcessName}
                onChange={setNewProcessName}
                placeholder="למשל: הכנת דוח שבועי..."
                dir="rtl"
              />
              <Input
                label="תדירות"
                value={newProcessFreq}
                onChange={setNewProcessFreq}
                placeholder="למשל: יומי, שבועי..."
                dir="rtl"
              />
              <Input
                label="זמן (בדקות)"
                type="number"
                value={newProcessTime}
                onChange={setNewProcessTime}
                placeholder="0"
                dir="rtl"
              />
            </div>
            <Button
              onClick={addProcess}
              variant="secondary"
              size="sm"
              className="mt-2"
              disabled={!newProcessName}
            >
              <Plus className="w-4 h-4 ml-2" />
              הוסף תהליך
            </Button>
          </div>
        </div>

        {/* Manual Data Entry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            הזנות נתונים ידניות
          </label>
          {(data.manualDataEntry || []).length > 0 && (
            <div className="space-y-2 mb-3">
              {(data.manualDataEntry || []).map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-2"
                >
                  <span className="text-sm">{entry}</span>
                  <button
                    onClick={() => removeDataEntry(index)}
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
              value={newDataEntry}
              onChange={setNewDataEntry}
              placeholder="למשל: העתקת נתונים מאקסל ל-CRM..."
              dir="rtl"
            />
            <Button
              onClick={addDataEntry}
              variant="secondary"
              size="sm"
              className="mt-[3px]"
              disabled={!newDataEntry}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TextArea
          label="מה העדיפות שלך לאוטומציה?"
          value={data.automationPriority || ''}
          onChange={(val) => updateField('automationPriority', val)}
          rows={3}
          placeholder="תאר מה הכי חשוב לך לאטמט..."
          dir="rtl"
        />
      </div>
    </Card>
  );
};
