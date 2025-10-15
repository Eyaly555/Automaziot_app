// discovery-assistant/src/components/Mobile/components/AutomationSection.tsx

import React from 'react';
import { RadioGroup, CheckboxGroup } from '../../Common/FormFields';
import { TextArea } from '../../Base';
import type { AutomationsData } from '../../../types/mobile';

interface AutomationSectionProps {
  data: AutomationsData;
  onChange: (updates: Partial<AutomationsData>) => void;
}

export const AutomationSection: React.FC<AutomationSectionProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-8">
      {/* Icon & Title */}
      <div className="text-center">
        <div className="mobile-section-icon">⚡</div>
        <h2 className="mobile-section-title">אוטומציות עסקיות</h2>
        <p className="mobile-section-subtitle">חסכו זמן ומאמץ</p>
      </div>

      {/* Q1: Processes */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          אילו תהליכים תרצה לאוטמט? <span className="text-red-500">*</span>
        </label>
        <p className="mobile-helper-text mb-3">בחר את כל התחומים הרלוונטיים</p>
        <CheckboxGroup
          value={data.processes}
          onChange={(value) => onChange({ processes: value })}
          options={[
            { value: 'lead_management', label: '🎯 ניהול לידים (קליטה וחלוקה)' },
            { value: 'followup', label: '📞 מעקבים אוטומטיים' },
            { value: 'crm_updates', label: '💾 עדכון CRM מטפסים' },
            { value: 'reminders', label: '⏰ תזכורות לפגישות' },
            { value: 'customer_updates', label: '📧 עדכונים ללקוחות' },
            { value: 'reports', label: '📊 דוחות אוטומטיים' },
            { value: 'documents', label: '📄 יצירת מסמכים' },
            { value: 'data_sync', label: '🔄 סנכרון מערכות' }
          ]}
          columns={1}
          className="space-y-3"
        />
      </div>

      {/* Q2: Time Wasted */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          כמה זמן מבזבזים על תהליכים חוזרים ביום? <span className="text-red-500">*</span>
        </label>
        <RadioGroup
          value={data.time_wasted}
          onChange={(value) => onChange({ time_wasted: value as any })}
          options={[
            { value: 'under_1h', label: 'פחות משעה' },
            { value: '1-2h', label: '1-2 שעות' },
            { value: '3-4h', label: '3-4 שעות' },
            { value: 'over_4h', label: 'מעל 4 שעות' }
          ]}
          orientation="vertical"
        />
      </div>

      {/* Q3: Biggest Pain */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          מה הבעיה הכי מעצבנת בתהליכים הנוכחיים? <span className="text-red-500">*</span>
        </label>
        <RadioGroup
          value={data.biggest_pain}
          onChange={(value) => onChange({ biggest_pain: value as any })}
          options={[
            { value: 'things_fall', label: 'דברים נופלים בין הכיסאות' },
            { value: 'human_errors', label: 'טעויות אנוש' },
            { value: 'takes_time', label: 'לוקח יותר מדי זמן' },
            { value: 'no_tracking', label: 'אין מעקב מסודר' },
            { value: 'other', label: 'אחר' }
          ]}
          orientation="vertical"
        />
        
        {data.biggest_pain === 'other' && (
          <input
            type="text"
            value={data.biggest_pain_other || ''}
            onChange={(e) => onChange({ biggest_pain_other: e.target.value })}
            placeholder="תאר בקצרה..."
            className="mobile-input mt-3 w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        )}
      </div>

      {/* Q4: Most Important Process */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          איזה תהליך אחד אם היית מאוטמת היום - היה משנה הכי הרבה?
        </label>
        <TextArea
          value={data.most_important_process}
          onChange={(e) => onChange({ most_important_process: e.target.value })}
          rows={3}
          className="mobile-textarea"
          placeholder="תאר בקצרה את התהליך הכי חשוב..."
        />
      </div>
    </div>
  );
};

