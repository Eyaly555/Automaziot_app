// discovery-assistant/src/components/Mobile/components/CRMSection.tsx

import React from 'react';
import { RadioGroup, CheckboxGroup, SelectField } from '../../Common/FormFields';
import { TextArea } from '../../Base';
import type { CRMData } from '../../../types/mobile';

interface CRMSectionProps {
  data: CRMData;
  onChange: (updates: Partial<CRMData>) => void;
}

export const CRMSection: React.FC<CRMSectionProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-8">
      {/* Icon & Title */}
      <div className="text-center">
        <div className="mobile-section-icon">💼</div>
        <h2 className="mobile-section-title">CRM ואינטגרציות</h2>
        <p className="mobile-section-subtitle">חיבור וסדר במערכות</p>
      </div>

      {/* Q1: CRM Exists */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          יש לך מערכת CRM? <span className="text-red-500">*</span>
        </label>
        <RadioGroup
          value={data.exists}
          onChange={(value) => onChange({ exists: value as any })}
          options={[
            { value: 'yes', label: 'כן' },
            { value: 'no', label: 'לא' },
            { value: 'not_sure', label: 'לא בטוח/ה' }
          ]}
          orientation="vertical"
        />
      </div>

      {/* Q2: Which System (conditional) */}
      {data.exists === 'yes' && (
        <div className="mobile-field-group">
          <label className="mobile-question">איזו מערכת?</label>
          <SelectField
            value={data.system || ''}
            onChange={(value) => onChange({ system: value as any })}
            options={[
              { value: 'zoho', label: 'Zoho CRM' },
              { value: 'salesforce', label: 'Salesforce' },
              { value: 'hubspot', label: 'HubSpot' },
              { value: 'monday', label: 'Monday.com' },
              { value: 'pipedrive', label: 'Pipedrive' },
              { value: 'other', label: 'אחר' }
            ]}
            placeholder="בחר מערכת..."
            className="w-full"
          />
          
          {data.system === 'other' && (
            <input
              type="text"
              value={data.other_system || ''}
              onChange={(e) => onChange({ other_system: e.target.value })}
              placeholder="שם המערכת (Priority, SAP...)"
              className="mobile-input mt-3 w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          )}
        </div>
      )}

      {/* Q3: Integrations (conditional) */}
      {data.exists === 'yes' && (
        <div className="mobile-field-group">
          <label className="mobile-question">מה צריך להתחבר ל-CRM?</label>
          <p className="mobile-helper-text mb-3">בחר את כל המקורות</p>
          <CheckboxGroup
            value={data.integrations || []}
            onChange={(value) => onChange({ integrations: value })}
            options={[
              { value: 'website_forms', label: '🌐 טפסי אתר' },
              { value: 'facebook_leads', label: '📘 Facebook לידים' },
              { value: 'google_ads', label: '🔍 Google Ads' },
              { value: 'whatsapp', label: '💬 WhatsApp' },
              { value: 'email', label: '📧 אימייל' },
              { value: 'accounting', label: '💰 הנהלת חשבונות' },
              { value: 'ecommerce', label: '🛒 חנות אונליין' }
            ]}
            columns={1}
            className="space-y-3"
          />
        </div>
      )}

      {/* Q4: Data Quality */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          האם הנתונים ב-CRM מעודכנים ונקיים? <span className="text-red-500">*</span>
        </label>
        <RadioGroup
          value={data.data_quality}
          onChange={(value) => onChange({ data_quality: value as any })}
          options={[
            { value: 'clean', label: 'כן, הכל מסודר' },
            { value: 'ok', label: 'בערך, יש קצת בלאגן' },
            { value: 'messy', label: 'לא, יש הרבה כפילויות וחוסרים' },
            { value: 'no_crm', label: 'אין לי CRM' }
          ]}
          orientation="vertical"
        />
      </div>

      {/* Q5: Users (conditional) */}
      {data.exists === 'yes' && (
        <div className="mobile-field-group">
          <label className="mobile-question">כמה אנשים עובדים עם המערכת?</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: '1-3', label: '1-3' },
              { value: '4-10', label: '4-10' },
              { value: '11-20', label: '11-20' },
              { value: '20+', label: 'מעל 20' }
            ].map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ users: option.value as any })}
                className={`px-4 py-3 border-2 rounded-lg font-medium transition-all
                  ${data.users === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Q6: Biggest Gap */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          מה החסר הכי גדול במערכת הנוכחית? <span className="text-red-500">*</span>
        </label>
        <RadioGroup
          value={data.biggest_gap || 'no_system'}
          onChange={(value) => onChange({ biggest_gap: value as any })}
          options={[
            { value: 'no_automation', label: 'אין אוטומציות' },
            { value: 'not_connected', label: 'לא מחובר לכלים אחרים' },
            { value: 'hard_to_use', label: 'קשה לעבוד איתה' },
            { value: 'no_reports', label: 'חסר מידע ודוחות' },
            { value: 'no_system', label: 'אין מערכת בכלל' },
            { value: 'other', label: 'אחר' }
          ]}
          orientation="vertical"
        />
        
        {data.biggest_gap === 'other' && (
          <input
            type="text"
            value={data.biggest_gap_other || ''}
            onChange={(e) => onChange({ biggest_gap_other: e.target.value })}
            placeholder="תאר בקצרה..."
            className="mobile-input mt-3 w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        )}
      </div>

      {/* Q7: Missing Report */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          איזה דוח/מידע אתה הכי צריך ולא מקבל היום?
        </label>
        <p className="mobile-helper-text mb-3">אופציונלי</p>
        <TextArea
          value={data.missing_report || ''}
          onChange={(e) => onChange({ missing_report: e.target.value })}
          rows={3}
          className="mobile-textarea"
          placeholder="לדוגמה: מעקב אחר לידים שלא טופלו, ניתוח מקורות לידים, דוח המרות..."
        />
      </div>
    </div>
  );
};

