// discovery-assistant/src/components/Mobile/components/AutomationSection.tsx

import React from 'react';
import { RadioGroup, CheckboxGroup } from '../../Common/FormFields';
import { TextArea } from '../../Base';
import type { AutomationsData } from '../../../types/mobile';

interface AutomationSectionProps {
  data: AutomationsData;
  onChange: (updates: Partial<AutomationsData>) => void;
}

export const AutomationSection: React.FC<AutomationSectionProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-8 p-6">
      {/* Icon & Title - Mobile optimized with responsive icon sizing */}
      <div className="text-center">
        <div className="mobile-section-icon">⚡</div>
        <h2 className="mobile-section-title">אוטומציות עסקיות</h2>
        <p className="mobile-section-subtitle">חסכו זמן ומאמץ</p>
      </div>

      {/* Q1: Processes - Mobile optimized checkbox group with proper spacing */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          אילו תהליכים תרצה לאוטמט? <span className="text-red-500">*</span>
        </label>
        <p className="mobile-helper-text mb-3">בחר את כל התחומים הרלוונטיים</p>
        <CheckboxGroup
          value={data.processes}
          onChange={(value) => onChange({ processes: value })}
          options={[
            {
              value: 'lead_management',
              label: '🎯 ניהול לידים (קליטה וחלוקה)',
            },
            { value: 'followup', label: '📞 מעקבים אוטומטיים' },
            { value: 'crm_updates', label: '💾 עדכון CRM מטפסים' },
            { value: 'reminders', label: '⏰ תזכורות לפגישות' },
            { value: 'customer_updates', label: '📧 עדכונים ללקוחות' },
            { value: 'reports', label: '📊 דוחות אוטומטיים' },
            { value: 'documents', label: '📄 יצירת מסמכים' },
            { value: 'data_sync', label: '🔄 סנכרון מערכות' },
          ]}
          columns={1}
          className="space-y-3"
        />
      </div>

      {/* Q2: Time Wasted - Mobile optimized radio group with vertical orientation */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          כמה זמן מבזבזים על תהליכים חוזרים ביום?{' '}
          <span className="text-red-500">*</span>
        </label>
        <RadioGroup
          value={data.time_wasted}
          onChange={(value) => onChange({ time_wasted: value as any })}
          options={[
            { value: 'under_1h', label: 'פחות משעה' },
            { value: '1-2h', label: '1-2 שעות' },
            { value: '3-4h', label: '3-4 שעות' },
            { value: 'over_4h', label: 'מעל 4 שעות' },
          ]}
          orientation="vertical"
        />
      </div>

      {/* Q3: Biggest Pain - Mobile optimized with smooth conditional field transition */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          מה הבעיה הכי מעצבנת בתהליכים הנוכחיים?{' '}
          <span className="text-red-500">*</span>
        </label>
        <RadioGroup
          value={data.biggest_pain}
          onChange={(value) => onChange({ biggest_pain: value as any })}
          options={[
            { value: 'things_fall', label: 'דברים נופלים בין הכיסאות' },
            { value: 'human_errors', label: 'טעויות אנוש' },
            { value: 'takes_time', label: 'לוקח יותר מדי זמן' },
            { value: 'no_tracking', label: 'אין מעקב מסודר' },
            { value: 'other', label: 'אחר' },
          ]}
          orientation="vertical"
        />

        {/* Mobile optimized: Smooth transition for conditional field with fade-in animation */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            data.biggest_pain === 'other'
              ? 'max-h-32 opacity-100 mt-3'
              : 'max-h-0 opacity-0'
          }`}
          style={{
            // Prevent touch actions during animation for better performance
            touchAction:
              data.biggest_pain === 'other' ? 'manipulation' : 'none',
            // Use will-change for smoother animations on mobile
            willChange: 'max-height, opacity',
          }}
        >
          {/* Mobile optimized: Using mobile-input class for consistency, with proper touch target size */}
          <input
            type="text"
            value={data.biggest_pain_other || ''}
            onChange={(e) => onChange({ biggest_pain_other: e.target.value })}
            placeholder="תאר בקצרה..."
            dir="rtl"
            className="mobile-input w-full"
            style={{
              // Prevent iOS auto-zoom by ensuring font size is 16px minimum
              fontSize: '16px',
              // Optimize for mobile touch interaction
              touchAction: 'manipulation',
            }}
            aria-label="תיאור הבעיה האחרת"
          />
        </div>
      </div>

      {/* Q4: Most Important Process - Mobile optimized textarea with proper keyboard handling */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          איזה תהליך אחד אם היית מאוטמת היום - היה משנה הכי הרבה?
        </label>
        <TextArea
          value={data.most_important_process}
          onChange={(value) => onChange({ most_important_process: value })}
          rows={3}
          className="mobile-textarea"
          placeholder="תאר בקצרה את התהליך הכי חשוב..."
          dir="rtl"
        />
      </div>
    </div>
  );
};
