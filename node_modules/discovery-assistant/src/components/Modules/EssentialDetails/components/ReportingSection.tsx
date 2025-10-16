import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Card, Input, TextArea, Button } from '../../../Base';
import type { EssentialDetailsModule } from '../../../../types';

interface ReportingSectionProps {
  data?: EssentialDetailsModule['reportingDetails'];
  onChange: (data: Partial<EssentialDetailsModule['reportingDetails']>) => void;
}

export const ReportingSection: React.FC<ReportingSectionProps> = ({
  data = {},
  onChange,
}) => {
  const [newReport, setNewReport] = useState('');
  const [newGap, setNewGap] = useState('');

  const updateField = <K extends keyof typeof data>(
    field: K,
    value: (typeof data)[K]
  ) => {
    onChange({ [field]: value });
  };

  const addReport = () => {
    if (!newReport) return;
    const reports = [...(data.criticalReports || []), newReport];
    onChange({ criticalReports: reports });
    setNewReport('');
  };

  const removeReport = (index: number) => {
    const reports = (data.criticalReports || []).filter((_, i) => i !== index);
    onChange({ criticalReports: reports });
  };

  const addGap = () => {
    if (!newGap) return;
    const gaps = [...(data.dataGaps || []), newGap];
    onChange({ dataGaps: gaps });
    setNewGap('');
  };

  const removeGap = (index: number) => {
    const gaps = (data.dataGaps || []).filter((_, i) => i !== index);
    onChange({ dataGaps: gaps });
  };

  return (
    <Card className="border-l-4 border-l-teal-500">
      <div className="space-y-4">
        {/* Critical Reports */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            דוחות קריטיים שאתם צריכים
          </label>
          {(data.criticalReports || []).length > 0 && (
            <div className="space-y-2 mb-3">
              {(data.criticalReports || []).map((report, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-lg p-2"
                >
                  <span className="text-sm">{report}</span>
                  <button
                    onClick={() => removeReport(index)}
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
              value={newReport}
              onChange={setNewReport}
              placeholder="למשל: דוח מכירות שבועי, ניתוח ROI..."
              dir="rtl"
            />
            <Button
              onClick={addReport}
              variant="secondary"
              size="sm"
              className="mt-[3px]"
              disabled={!newReport}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Input
          label="כמה פעמים צריך להפיק דוחות?"
          value={data.reportingFrequency || ''}
          onChange={(val) => updateField('reportingFrequency', val)}
          placeholder="למשל: יומי, שבועי, חודשי..."
          dir="rtl"
        />

        {/* Data Gaps */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            אילו נתונים חסרים לכם?
          </label>
          {(data.dataGaps || []).length > 0 && (
            <div className="space-y-2 mb-3">
              {(data.dataGaps || []).map((gap, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-2"
                >
                  <span className="text-sm">{gap}</span>
                  <button
                    onClick={() => removeGap(index)}
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
              value={newGap}
              onChange={setNewGap}
              placeholder="למשל: אין לנו נתונים על מקור הלידים..."
              dir="rtl"
            />
            <Button
              onClick={addGap}
              variant="secondary"
              size="sm"
              className="mt-[3px]"
              disabled={!newGap}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TextArea
          label="אילו אתגרים יש לכם בקבלת החלטות על בסיס נתונים?"
          value={data.decisionMakingChallenges || ''}
          onChange={(val) => updateField('decisionMakingChallenges', val)}
          rows={3}
          placeholder="תאר קשיים בקבלת החלטות מבוססות נתונים..."
          dir="rtl"
        />
      </div>
    </Card>
  );
};
