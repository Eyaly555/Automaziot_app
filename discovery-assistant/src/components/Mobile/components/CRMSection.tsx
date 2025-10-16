// discovery-assistant/src/components/Mobile/components/CRMSection.tsx

import React from 'react';
import { RadioGroup, CheckboxGroup } from '../../Common/FormFields';
import { TextArea } from '../../Base';
import type { CRMData } from '../../../types/mobile';

interface CRMSectionProps {
  data: CRMData;
  onChange: (updates: Partial<CRMData>) => void;
}

export const CRMSection: React.FC<CRMSectionProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-8 p-6">
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
            { value: 'not_sure', label: 'לא בטוח/ה' },
          ]}
          orientation="vertical"
        />
      </div>

      {/* Q2: Which System (conditional) */}
      {data.exists === 'yes' && (
        <div
          className="mobile-field-group animate-fadeIn"
          style={{
            animation: 'fadeIn 0.3s ease-in-out',
          }}
        >
          <label className="mobile-question">איזו מערכת?</label>

          {/* Mobile-optimized select with enhanced touch target */}
          <div className="relative">
            <select
              value={data.system || ''}
              onChange={(e) => onChange({ system: e.target.value as any })}
              className="mobile-input w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg text-base
                       bg-white appearance-none cursor-pointer
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                       active:bg-gray-50 transition-all"
              style={{ minHeight: '48px' }}
            >
              <option value="">בחר מערכת...</option>
              <option value="zoho">Zoho CRM</option>
              <option value="salesforce">Salesforce</option>
              <option value="hubspot">HubSpot</option>
              <option value="monday">Monday.com</option>
              <option value="pipedrive">Pipedrive</option>
              <option value="other">אחר</option>
            </select>
            {/* Custom chevron icon for better visibility */}
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Conditional "Other" input with smooth transition */}
          {data.system === 'other' && (
            <div
              className="mt-3 animate-slideDown"
              style={{
                animation: 'slideDown 0.2s ease-out',
              }}
            >
              <input
                type="text"
                value={data.other_system || ''}
                onChange={(e) => onChange({ other_system: e.target.value })}
                placeholder="שם המערכת (Priority, SAP...)"
                className="mobile-input w-full"
                autoFocus
              />
            </div>
          )}
        </div>
      )}

      {/* Q3: Integrations (conditional) */}
      {data.exists === 'yes' && (
        <div
          className="mobile-field-group animate-fadeIn"
          style={{
            animation: 'fadeIn 0.3s ease-in-out 0.1s backwards',
          }}
        >
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
              { value: 'ecommerce', label: '🛒 חנות אונליין' },
            ]}
            columns={1}
            className="space-y-3"
          />
        </div>
      )}

      {/* Q4: Data Quality */}
      <div className="mobile-field-group">
        <label className="mobile-question">
          האם הנתונים ב-CRM מעודכנים ונקיים?{' '}
          <span className="text-red-500">*</span>
        </label>
        <RadioGroup
          value={data.data_quality}
          onChange={(value) => onChange({ data_quality: value as any })}
          options={[
            { value: 'clean', label: 'כן, הכל מסודר' },
            { value: 'ok', label: 'בערך, יש קצת בלאגן' },
            { value: 'messy', label: 'לא, יש הרבה כפילויות וחוסרים' },
            { value: 'no_crm', label: 'אין לי CRM' },
          ]}
          orientation="vertical"
        />
      </div>

      {/* Q5: Users (conditional) - Responsive grid with enhanced touch targets */}
      {data.exists === 'yes' && (
        <div
          className="mobile-field-group animate-fadeIn"
          style={{
            animation: 'fadeIn 0.3s ease-in-out 0.15s backwards',
          }}
        >
          <label className="mobile-question">כמה אנשים עובדים עם המערכת?</label>
          {/* Responsive: single column on very small screens, 2 columns on 375px+ */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            {[
              { value: '1-3', label: '1-3' },
              { value: '4-10', label: '4-10' },
              { value: '11-20', label: '11-20' },
              { value: '20+', label: 'מעל 20' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ users: option.value as any })}
                className={`min-h-[48px] px-4 py-3 border-2 rounded-lg font-medium
                  transition-all duration-200 cursor-pointer touch-manipulation
                  ${
                    data.users === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 active:scale-98'
                  }
                  active:transform active:scale-[0.98]`}
                style={{
                  WebkitTapHighlightColor: 'rgba(59, 130, 246, 0.1)',
                }}
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
          מה החסר הכי גדול במערכת הנוכחית?{' '}
          <span className="text-red-500">*</span>
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
            { value: 'other', label: 'אחר' },
          ]}
          orientation="vertical"
        />

        {/* Conditional "Other" input with smooth transition */}
        {data.biggest_gap === 'other' && (
          <div
            className="mt-3 animate-slideDown"
            style={{
              animation: 'slideDown 0.2s ease-out',
            }}
          >
            <input
              type="text"
              value={data.biggest_gap_other || ''}
              onChange={(e) => onChange({ biggest_gap_other: e.target.value })}
              placeholder="תאר בקצרה..."
              className="mobile-input w-full"
              autoFocus
            />
          </div>
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
          onChange={(value) => onChange({ missing_report: value })}
          rows={3}
          className="mobile-textarea"
          placeholder="לדוגמה: מעקב אחר לידים שלא טופלו, ניתוח מקורות לידים, דוח המרות..."
        />
      </div>

      {/* Add animation keyframes via inline style tag */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            max-height: 100px;
            transform: translateY(0);
          }
        }

        /* Extra small breakpoint for single column on very small screens */
        @media (max-width: 374px) {
          .xs\\:grid-cols-2 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
        }

        @media (min-width: 375px) {
          .xs\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* Enhanced active state for better touch feedback */
        .active\\:scale-98:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};
