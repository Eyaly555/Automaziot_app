import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Card, Input, TextArea, Button } from '../../../Base';
import type { EssentialDetailsModule } from '../../../../types';

interface CustomerServiceSectionProps {
  data?: EssentialDetailsModule['customerServiceDetails'];
  onChange: (data: Partial<EssentialDetailsModule['customerServiceDetails']>) => void;
}

export const CustomerServiceSection: React.FC<CustomerServiceSectionProps> = ({
  data = {},
  onChange
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [newIssue, setNewIssue] = useState('');

  const updateField = <K extends keyof typeof data>(field: K, value: typeof data[K]) => {
    onChange({ [field]: value });
  };

  const addCategory = () => {
    if (!newCategory) return;
    const categories = [...(data.ticketCategories || []), newCategory];
    onChange({ ticketCategories: categories });
    setNewCategory('');
  };

  const removeCategory = (index: number) => {
    const categories = (data.ticketCategories || []).filter((_, i) => i !== index);
    onChange({ ticketCategories: categories });
  };

  const addIssue = () => {
    if (!newIssue) return;
    const issues = [...(data.repeatIssues || []), newIssue];
    onChange({ repeatIssues: issues });
    setNewIssue('');
  };

  const removeIssue = (index: number) => {
    const issues = (data.repeatIssues || []).filter((_, i) => i !== index);
    onChange({ repeatIssues: issues });
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <div className="space-y-4">
        <Input
          label="זמן תגובה ממוצע לפניית שירות"
          value={data.averageResponseTime || ''}
          onChange={(val) => updateField('averageResponseTime', val)}
          placeholder="למשל: 15 דקות, שעה אחת, יום אחד..."
          dir="rtl"
        />

        {/* Ticket Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            קטגוריות פניות נפוצות
          </label>
          {(data.ticketCategories || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {(data.ticketCategories || []).map((category, index) => (
                <div key={index} className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  <span>{category}</span>
                  <button
                    onClick={() => removeCategory(index)}
                    className="text-purple-600 hover:text-purple-800"
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
              value={newCategory}
              onChange={setNewCategory}
              placeholder="למשל: תקלות טכניות, שאלות כלליות..."
              dir="rtl"
            />
            <Button
              onClick={addCategory}
              variant="secondary"
              size="sm"
              className="mt-[3px]"
              disabled={!newCategory}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TextArea
          label="תהליך הסלמה (אם קיים)"
          value={data.escalationProcess || ''}
          onChange={(val) => updateField('escalationProcess', val)}
          rows={2}
          placeholder="תאר מה קורה כשלא מצליחים לפתור בשורה ראשונה..."
          dir="rtl"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            שביעות רצון לקוחות (1-10)
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                onClick={() => updateField('customerSatisfaction', rating)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  data.customerSatisfaction === rating
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>

        {/* Repeat Issues */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            בעיות שחוזרות על עצמן
          </label>
          {(data.repeatIssues || []).length > 0 && (
            <div className="space-y-2 mb-3">
              {(data.repeatIssues || []).map((issue, index) => (
                <div key={index} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-2">
                  <span className="text-sm">{issue}</span>
                  <button
                    onClick={() => removeIssue(index)}
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
              value={newIssue}
              onChange={setNewIssue}
              placeholder="תאר בעיה שחוזרת על עצמה..."
              dir="rtl"
            />
            <Button
              onClick={addIssue}
              variant="secondary"
              size="sm"
              className="mt-[3px]"
              disabled={!newIssue}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
