import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, CreditCard } from 'lucide-react';
import { useMeetingStore } from '../../../store/useMeetingStore';
import { useAutoSave } from '../../../hooks/useAutoSave';
import { Card, Input, Select, TextArea, Button } from '../../Base';
import { CheckboxGroup } from '../../Common/FormFields';
import { PainPointFlag } from '../../Common/PainPointFlag/PainPointFlag';
import { LeadSourceBuilder } from '../LeadsAndSales/components/LeadSourceBuilder';
import { ServiceChannelBuilder } from '../CustomerService/components/ServiceChannelBuilder';
import type { FocusArea, LeadSource, ServiceChannel } from '../../../types';
import { useBeforeUnload } from '../../../hooks/useBeforeUnload';
import { SaveStatusIndicator } from '../../Common/SaveStatusIndicator';

const businessTypeOptions = [
  { value: 'b2b', label: 'B2B' },
  { value: 'b2c', label: 'B2C' },
  { value: 'saas', label: 'SaaS' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'service', label: 'שירותים' },
  { value: 'manufacturing', label: 'ייצור' },
  { value: 'retail', label: 'קמעונאות' },
  { value: 'other', label: 'אחר' }
];

const focusAreaOptions = [
  { value: 'lead_capture', label: 'קליטת לידים וניהול ראשוני' },
  { value: 'sales_process', label: 'ניהול תהליך המכירה' },
  { value: 'customer_service', label: 'ניהול שירות לקוחות' },
  { value: 'automation', label: 'אוטומציה של תהליכים חוזרים' },
  { value: 'crm_upgrade', label: 'שדרוג/החלפת מערכת CRM' },
  { value: 'reporting', label: 'דיווח וניתוח נתונים' },
  { value: 'ai_agents', label: 'אוטומציה מבוססת AI' }
];


const leadCaptureChannelOptions = [
  { value: 'website_form', label: 'טופס באתר' },
  { value: 'phone', label: 'טלפון' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'אימייל' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'referral', label: 'המלצות' },
  { value: 'walk_in', label: 'כניסה ישירה' }
];

const leadStorageOptions = [
  { value: 'excel', label: 'Excel' },
  { value: 'google_sheets', label: 'Google Sheets' },
  { value: 'crm', label: 'מערכת CRM' },
  { value: 'email', label: 'אימייל' },
  { value: 'paper', label: 'נייר/לא מתועד' }
];

export const OverviewModule: React.FC = () => {
  console.log('[OverviewModule] 🔵 Component rendering/mounting');
  
  const navigate = useNavigate();
  const { currentMeeting, updateModule } = useMeetingStore();
  const overviewData = currentMeeting?.modules?.overview || {};

  // Basic Information
  const [businessType, setBusinessType] = useState(overviewData.businessType || '');
  const [employees, setEmployees] = useState(overviewData.employees || '');
  const [mainChallenge, setMainChallenge] = useState(overviewData.mainChallenge || '');
  const [budget, setBudget] = useState(overviewData.budget || '');

  // KEEP: Lead Sources (for business context - detailed lead management stays in Leads & Sales)
  const [leadSources, setLeadSources] = useState<LeadSource[]>(overviewData.leadSources || []);
  const [leadCaptureChannels, setLeadCaptureChannels] = useState<string[]>(overviewData.leadCaptureChannels || []);
  const [leadStorageMethod, setLeadStorageMethod] = useState(overviewData.leadStorageMethod || '');

  // KEEP: Service Channels (for business context - detailed service management stays in Customer Service)
  const [serviceChannels, setServiceChannels] = useState<ServiceChannel[]>(overviewData.serviceChannels || []);
  const [serviceVolume, setServiceVolume] = useState(overviewData.serviceVolume || '');
  const [serviceSystemExists, setServiceSystemExists] = useState(overviewData.serviceSystemExists || false);

  // NEW: Focus Areas
  const [focusAreas, setFocusAreas] = useState<string[]>((overviewData.focusAreas as string[]) || []);

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError, hasUnsavedChanges } = useAutoSave({
    moduleId: 'overview',
    immediateFields: ['businessType', 'employees'], // Critical business info
    debounceMs: 1000,
    onError: (error) => {
      console.error('Auto-save error in Overview:', error);
    }
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    saveData({
      businessType,
      employees,
      mainChallenge,
      budget,
      leadSources,
      leadCaptureChannels,
      leadStorageMethod,
      serviceChannels,
      serviceVolume,
      serviceSystemExists,
      focusAreas: focusAreas as FocusArea[]
    });
  });

  // Auto-save on changes - saveData removed from dependencies to prevent infinite loop
  useEffect(() => {
    saveData({
      businessType,
      employees,
      mainChallenge,
      budget,
      leadSources,
      leadCaptureChannels,
      leadStorageMethod,
      serviceChannels,
      serviceVolume,
      serviceSystemExists,
      focusAreas: focusAreas as FocusArea[]
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    businessType,
    employees,
    mainChallenge,
    budget,
    leadSources,
    leadCaptureChannels,
    leadStorageMethod,
    serviceChannels,
    serviceVolume,
    serviceSystemExists,
    focusAreas
  ]);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="ghost"
                size="sm"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold">סקירה כללית</h1>
            </div>
            <Button
              onClick={() => navigate('/module/essentialDetails')}
              variant="primary"
              size="md"
            >
              המשך לאיפיון ממוקד
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>מה המטרה של הסקירה הכללית?</strong> אנחנו רוצים להבין את העסק שלך ולזהות את התחומים שבהם אנחנו יכולים לעזור. על בסיס מה שתמלא כאן, נציג לך שאלות ממוקדות בהמשך.
            </p>
          </div>

          {/* Basic Information */}
          <Card title="מידע בסיסי" subtitle="פרטים כלליים על העסק">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="סוג העסק"
                value={businessType}
                onChange={setBusinessType}
                options={businessTypeOptions}
                placeholder="בחר סוג עסק"
                dir="rtl"
              />
              <Select
                label="מספר עובדים"
                value={String(employees || '')}
                onChange={(value) => setEmployees(value)}
                options={[
                  { value: '1-10', label: '1-10 עובדים' },
                  { value: '11-50', label: '11-50 עובדים' },
                  { value: '51-200', label: '51-200 עובדים' },
                  { value: '201-500', label: '201-500 עובדים' },
                  { value: '501+', label: '501+ עובדים' }
                ]}
                placeholder="בחר טווח"
                dir="rtl"
              />
            </div>
            <div className="mt-4">
              <Input
                label="תקציב משוער לפרויקט (אופציונלי)"
                value={budget}
                onChange={setBudget}
                placeholder="לדוגמה: 50,000 ₪"
                dir="rtl"
                icon={<CreditCard className="w-4 h-4" />}
              />
            </div>
          </Card>

          {/* Main Challenge */}
          <Card title="אתגר מרכזי" subtitle="מה הבעיה העיקרית שאתם מנסים לפתור?" icon={<Target className="w-5 h-5" />}>
            <TextArea
              label="תיאור האתגר"
              value={mainChallenge}
              onChange={setMainChallenge}
              rows={4}
              placeholder="תאר את האתגר המרכזי של העסק כיום..."
              dir="rtl"
            />
            <div className="mt-3">
              <PainPointFlag
                module="overview"
                label="סמן כנקודת כאב"
                condition={mainChallenge.length > 50}
                autoDetect={true}
              />
            </div>
          </Card>

          {/* Focus Areas - Critical Section */}
          <Card
            title="תחומי עניין"
            subtitle="באילו תחומים תרצה שנעזור לך? (בחר אחד או יותר)"
            icon={<Target className="w-5 h-5 text-blue-600" />}
            className="border-2 border-blue-200"
          >
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>חשוב!</strong> הבחירות שלך כאן יקבעו אילו שאלות נציג לך במודול "איפיון ממוקד" הבא.
              </p>
            </div>
            <CheckboxGroup
              options={focusAreaOptions}
              values={focusAreas}
              onChange={setFocusAreas}
              columns={1}
            />
          </Card>

          {/* Lead Sources - Conditional on focusAreas */}
          {(focusAreas.includes('lead_capture') || focusAreas.includes('sales_process')) && (
            <Card title="מקורות לידים" subtitle="מאיפה מגיעים הלידים שלך?" className="border-l-4 border-l-green-500">
              <div className="space-y-4">
                <LeadSourceBuilder
                  sources={leadSources}
                  onChange={setLeadSources}
                />

                <div className="mt-4 pt-4 border-t">
                  <CheckboxGroup
                    label="ערוצי קליטת לידים"
                    options={leadCaptureChannelOptions}
                    values={leadCaptureChannels}
                    onChange={setLeadCaptureChannels}
                    columns={2}
                  />
                </div>

                <div className="mt-4">
                  <Select
                    label="היכן מתועדים הלידים כיום?"
                    value={leadStorageMethod}
                    onChange={setLeadStorageMethod}
                    options={leadStorageOptions}
                    placeholder="בחר..."
                    dir="rtl"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Service Channels - Conditional on focusAreas */}
          {focusAreas.includes('customer_service') && (
            <Card title="ערוצי שירות" subtitle="איך לקוחות פונים אליכם?" className="border-l-4 border-l-purple-500">
              <div className="space-y-4">
                <ServiceChannelBuilder
                  channels={serviceChannels}
                  onChange={setServiceChannels}
                />

                <div className="mt-4 pt-4 border-t">
                  <Input
                    label="נפח פניות משוער (יומי/שבועי)"
                    value={serviceVolume}
                    onChange={setServiceVolume}
                    placeholder="לדוגמה: 50 פניות ביום"
                    dir="rtl"
                  />
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={serviceSystemExists}
                      onChange={(e) => setServiceSystemExists(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">יש לנו מערכת לניהול פניות שירות</span>
                  </label>
                </div>
              </div>
            </Card>
          )}

          {/* Summary Card */}
          {focusAreas.length > 0 && (
            <Card title="סיכום" className="bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <strong>תחומי עניין שנבחרו:</strong> {focusAreas.length}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {focusAreas.map((area) => {
                    const option = focusAreaOptions.find(o => o.value === area);
                    return (
                      <span
                        key={area}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {option?.label}
                      </span>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  במודול הבא נשאל אותך שאלות ממוקדות בהתאם לתחומים שבחרת.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Save Status Indicator */}
      <div className="absolute top-4 right-4">
        <SaveStatusIndicator />
      </div>
    </div>
  );
};
