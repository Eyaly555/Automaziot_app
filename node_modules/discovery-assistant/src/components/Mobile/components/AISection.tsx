// discovery-assistant/src/components/Mobile/components/AISection.tsx

import React from 'react';
import { RadioGroup, CheckboxGroup } from '../../Common/FormFields';
import { TextArea } from '../../Base';
import type { AIAgentsData } from '../../../types/mobile';

interface AISectionProps {
  data: AIAgentsData;
  onChange: (updates: Partial<AIAgentsData>) => void;
}

export const AISection: React.FC<AISectionProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-8">
      {/* Icon & Title */}
      <div className="text-center">
        <div className="mobile-section-icon">🤖</div>
        <h2 className="mobile-section-title">סוכני AI</h2>
        <p className="mobile-section-subtitle">בואו נבין מה אתם צריכים</p>
      </div>

      {/* Q1: Count */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          כמה סוכני AI תרצה? <span className="text-red-500">*</span>
        </label>
        <RadioGroup
          value={data.count}
          onChange={(value) => onChange({ count: value as any })}
          options={[
            { value: '1', label: 'סוכן אחד' },
            { value: '2', label: 'שני סוכנים' },
            { value: '3+', label: 'שלושה או יותר' }
          ]}
          orientation="vertical"
          className="mobile-radio-group"
        />
      </div>

      {/* Q2: Channels */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          באילו ערוצים הסוכן יפעול? <span className="text-red-500">*</span>
        </label>
        <p className="mobile-helper-text mb-3">ניתן לבחור מספר ערוצים</p>
        <CheckboxGroup
          value={data.channels}
          onChange={(value) => onChange({ channels: value })}
          options={[
            { value: 'whatsapp', label: '💬 WhatsApp' },
            { value: 'website', label: '🌐 אתר (צ\'אט)' },
            { value: 'facebook', label: '📘 Facebook' },
            { value: 'instagram', label: '📷 Instagram' },
            { value: 'phone', label: '📞 טלפון' },
            { value: 'email', label: '📧 אימייל' },
            { value: 'other', label: '🎨 אחר' }
          ]}
          columns={2}
          className="mobile-checkbox-group"
        />
        
        {data.channels.includes('other') && (
          <input
            type="text"
            value={data.other_channel || ''}
            onChange={(e) => onChange({ other_channel: e.target.value })}
            placeholder="ציין ערוץ אחר (Telegram, Slack...)"
            className="mobile-input mt-3 w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        )}
      </div>

      {/* Q3: Domains */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          מה הסוכן צריך לעשות? <span className="text-red-500">*</span>
        </label>
        <p className="mobile-helper-text mb-3">בחר את התחומים החשובים לך</p>
        <CheckboxGroup
          value={data.domains}
          onChange={(value) => onChange({ domains: value })}
          options={[
            { value: 'sales', label: '🎯 מכירות' },
            { value: 'customer_service', label: '💬 שירות לקוחות' },
            { value: 'lead_qualification', label: '✅ סיווג לידים' },
            { value: 'scheduling', label: '📅 קביעת פגישות' },
            { value: 'faq', label: '❓ שאלות נפוצות' },
            { value: 'technical_support', label: '🔧 תמיכה טכנית' }
          ]}
          columns={2}
          className="mobile-checkbox-group"
        />
      </div>

      {/* Q4: Notes */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          הערות נוספות?
        </label>
        <p className="mobile-helper-text mb-3">
          שפות, שעות פעילות, סוג תשובות... (אופציונלי)
        </p>
        <TextArea
          value={data.notes || ''}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={3}
          className="mobile-textarea"
          placeholder="לדוגמה: שעות 24/7, תמיכה באנגלית, תשובות קצרות..."
        />
      </div>
    </div>
  );
};

