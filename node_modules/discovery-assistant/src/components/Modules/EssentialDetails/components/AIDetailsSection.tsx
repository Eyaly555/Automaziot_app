import React, { useState } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';
import { Card, Input, TextArea, Button } from '../../../Base';
import type { EssentialDetailsModule } from '../../../../types';

interface AIDetailsSectionProps {
  data?: EssentialDetailsModule['aiDetails'];
  onChange: (data: Partial<EssentialDetailsModule['aiDetails']>) => void;
}

export const AIDetailsSection: React.FC<AIDetailsSectionProps> = ({
  data = {},
  onChange,
}) => {
  const [newUseCase, setNewUseCase] = useState('');
  const [newOutcome, setNewOutcome] = useState('');

  const updateField = <K extends keyof typeof data>(
    field: K,
    value: (typeof data)[K]
  ) => {
    onChange({ [field]: value });
  };

  const addUseCase = () => {
    if (!newUseCase) return;
    const useCases = [...(data.aiUseCases || []), newUseCase];
    onChange({ aiUseCases: useCases });
    setNewUseCase('');
  };

  const removeUseCase = (index: number) => {
    const useCases = (data.aiUseCases || []).filter((_, i) => i !== index);
    onChange({ aiUseCases: useCases });
  };

  const addOutcome = () => {
    if (!newOutcome) return;
    const outcomes = [...(data.expectedOutcomes || []), newOutcome];
    onChange({ expectedOutcomes: outcomes });
    setNewOutcome('');
  };

  const removeOutcome = (index: number) => {
    const outcomes = (data.expectedOutcomes || []).filter(
      (_, i) => i !== index
    );
    onChange({ expectedOutcomes: outcomes });
  };

  return (
    <Card className="border-l-4 border-l-pink-500">
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4 flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-pink-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-pink-900 mb-1">
              AI ואוטומציה חכמה
            </h4>
            <p className="text-sm text-pink-800">
              בואו נבין איך AI יכול לעזור לכם - ממענה אוטומטי ללקוחות ועד ניתוח
              נתונים מתקדם
            </p>
          </div>
        </div>

        {/* AI Use Cases */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            באילו תחומים תרצו לשלב AI?
          </label>
          {(data.aiUseCases || []).length > 0 && (
            <div className="space-y-2 mb-3">
              {(data.aiUseCases || []).map((useCase, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg p-2"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">{useCase}</span>
                  </div>
                  <button
                    onClick={() => removeUseCase(index)}
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
              value={newUseCase}
              onChange={setNewUseCase}
              placeholder="למשל: בוט שירות לקוחות, סיכום שיחות, ניתוח sentiment..."
              dir="rtl"
            />
            <Button
              onClick={addUseCase}
              variant="secondary"
              size="sm"
              className="mt-[3px]"
              disabled={!newUseCase}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TextArea
          label="עד כמה אתם מוכנים ל-AI? (האם יש לכם נתונים מסודרים, תהליכים מתועדים...)"
          value={data.aiReadiness || ''}
          onChange={(val) => updateField('aiReadiness', val)}
          rows={3}
          placeholder="תאר את מצב ההיערכות שלכם..."
          dir="rtl"
        />

        <TextArea
          label="איזה נתונים זמינים לכם?"
          value={data.dataAvailability || ''}
          onChange={(val) => updateField('dataAvailability', val)}
          rows={2}
          placeholder="למשל: היסטוריית שיחות, מיילים, הקלטות, טפסים..."
          dir="rtl"
        />

        {/* Expected Outcomes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            מה התוצאות שאתם מצפים להשיג עם AI?
          </label>
          {(data.expectedOutcomes || []).length > 0 && (
            <div className="space-y-2 mb-3">
              {(data.expectedOutcomes || []).map((outcome, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2"
                >
                  <span className="text-sm">{outcome}</span>
                  <button
                    onClick={() => removeOutcome(index)}
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
              value={newOutcome}
              onChange={setNewOutcome}
              placeholder="למשל: הפחתת זמן תגובה ב-50%, חיסכון בעלויות..."
              dir="rtl"
            />
            <Button
              onClick={addOutcome}
              variant="secondary"
              size="sm"
              className="mt-[3px]"
              disabled={!newOutcome}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
