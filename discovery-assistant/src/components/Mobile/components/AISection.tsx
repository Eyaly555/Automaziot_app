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
      {/* Icon & Title - Optimized for mobile screens */}
      <div className="text-center">
        {/* Responsive icon sizing: smaller on tiny screens, larger on tablets */}
        <div className="text-5xl sm:text-6xl md:text-7xl mb-4 max-w-[80px] mx-auto">
          🤖
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          סוכני AI
        </h2>
        <p className="text-base sm:text-lg text-gray-600">
          בואו נבין מה אתם צריכים
        </p>
      </div>

      {/* Q1: Count - Radio group with proper touch targets */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          כמה סוכני AI תרצה? <span className="text-red-500">*</span>
        </label>
        <RadioGroup
          value={data.count}
          onChange={(value) => onChange({ count: value as AIAgentsData['count'] })}
          options={[
            { value: '1', label: 'סוכן אחד' },
            { value: '2', label: 'שני סוכנים' },
            { value: '3+', label: 'שלושה או יותר' }
          ]}
          orientation="vertical"
          className="mobile-radio-group"
        />
      </div>

      {/* Q2: Channels - Checkbox group with responsive columns */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          באילו ערוצים הסוכן יפעול? <span className="text-red-500">*</span>
        </label>
        <p className="mobile-helper-text mb-3">ניתן לבחור מספר ערוצים</p>

        {/* CheckboxGroup handles responsive grid internally (mobile.css) */}
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

        {/* Conditional input with smooth transition */}
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${data.channels.includes('other') ? 'max-h-24 opacity-100 mt-3' : 'max-h-0 opacity-0'}
          `}
        >
          <input
            type="text"
            value={data.other_channel || ''}
            onChange={(e) => onChange({ other_channel: e.target.value })}
            placeholder="ציין ערוץ אחר (Telegram, Slack...)"
            autoComplete="off"
            inputMode="text"
            aria-label="ערוץ אחר"
            className="
              w-full px-4 py-3
              border-2 border-gray-300 rounded-lg
              text-base
              min-h-[48px]
              focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
              transition-all duration-200
              active:scale-[0.99]
            "
          />
        </div>
      </div>

      {/* Q3: Domains - Checkbox group with responsive columns */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          מה הסוכן צריך לעשות? <span className="text-red-500">*</span>
        </label>
        <p className="mobile-helper-text mb-3">בחר את התחומים החשובים לך</p>

        {/* CheckboxGroup handles responsive grid internally (mobile.css) */}
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

      {/* Q4: Notes - TextArea with mobile keyboard optimization */}
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
          className="mobile-textarea w-full"
          placeholder="לדוגמה: שעות 24/7, תמיכה באנגלית, תשובות קצרות..."
          dir="rtl"
          autoResize={false}
        />
      </div>
    </div>
  );
};
