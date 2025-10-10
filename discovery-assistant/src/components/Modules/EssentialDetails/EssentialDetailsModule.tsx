import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { useMeetingStore } from '../../../store/useMeetingStore';
import { Card, Button } from '../../Base';
import { LeadManagementSection } from './components/LeadManagementSection';
import { SalesProcessSection } from './components/SalesProcessSection';
import { CustomerServiceSection } from './components/CustomerServiceSection';
import { AutomationSection } from './components/AutomationSection';
import { SystemsDetailsSection } from './components/SystemsDetailsSection';
import { ReportingSection } from './components/ReportingSection';
import { AIDetailsSection } from './components/AIDetailsSection';
import type { FocusArea, EssentialDetailsModule as EssentialDetailsType } from '../../../types';

export const EssentialDetailsModule: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateModule } = useMeetingStore();

  const overview = currentMeeting?.modules?.overview;
  const focusAreas = (overview?.focusAreas as FocusArea[]) || [];
  const essentialData = currentMeeting?.modules?.essentialDetails || {};

  const [data, setData] = useState<EssentialDetailsType>(essentialData);

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      updateModule('essentialDetails', data);
    }, 1000);
    return () => clearTimeout(timer);
  }, [data, updateModule]);

  const updateSection = <K extends keyof EssentialDetailsType>(
    section: K,
    updates: Partial<EssentialDetailsType[K]>
  ) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
  };

  // If no focus areas selected, show message
  if (focusAreas.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <Card className="max-w-md">
          <div className="text-center py-8">
            <Circle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">לא נבחרו תחומי עניין</h2>
            <p className="text-gray-600 mb-6">
              חזור לסקירה הכללית ובחר לפחות תחום עניין אחד כדי להמשיך
            </p>
            <Button onClick={() => navigate('/module/overview')} variant="primary">
              חזור לסקירה הכללית
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const sectionConfig = [
    {
      key: 'lead_capture' as FocusArea,
      title: 'קליטת לידים וניהול ראשוני',
      component: (
        <LeadManagementSection
          data={data.leadManagement}
          onChange={(updates) => updateSection('leadManagement', updates)}
        />
      )
    },
    {
      key: 'sales_process' as FocusArea,
      title: 'ניהול תהליך המכירה',
      component: (
        <SalesProcessSection
          data={data.salesProcess}
          onChange={(updates) => updateSection('salesProcess', updates)}
        />
      )
    },
    {
      key: 'customer_service' as FocusArea,
      title: 'ניהול שירות לקוחות',
      component: (
        <CustomerServiceSection
          data={data.customerServiceDetails}
          onChange={(updates) => updateSection('customerServiceDetails', updates)}
        />
      )
    },
    {
      key: 'automation' as FocusArea,
      title: 'אוטומציה של תהליכים',
      component: (
        <AutomationSection
          data={data.automationOpportunities}
          onChange={(updates) => updateSection('automationOpportunities', updates)}
        />
      )
    },
    {
      key: 'crm_upgrade' as FocusArea,
      title: 'מערכות ו-CRM',
      component: (
        <SystemsDetailsSection
          data={data.systemsDetails}
          onChange={(updates) => updateSection('systemsDetails', updates)}
          crmName={overview?.crmName}
        />
      )
    },
    {
      key: 'reporting' as FocusArea,
      title: 'דיווח וניתוח נתונים',
      component: (
        <ReportingSection
          data={data.reportingDetails}
          onChange={(updates) => updateSection('reportingDetails', updates)}
        />
      )
    },
    {
      key: 'ai_agents' as FocusArea,
      title: 'אוטומציה מבוססת AI',
      component: (
        <AIDetailsSection
          data={data.aiDetails}
          onChange={(updates) => updateSection('aiDetails', updates)}
        />
      )
    }
  ];

  const visibleSections = sectionConfig.filter((section) =>
    focusAreas.includes(section.key)
  );

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
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
              <div>
                <h1 className="text-xl font-semibold">איפיון ממוקד</h1>
                <p className="text-sm text-gray-500">
                  {visibleSections.length} תחומים נבחרו
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/module/leadsAndSales')}
              variant="primary"
              size="md"
            >
              המשך למודולים המלאים
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {visibleSections.map((section, index) => (
              <div key={section.key} className="flex items-center gap-2 whitespace-nowrap">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  {section.title}
                </div>
                {index < visibleSections.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>איפיון ממוקד - מה זה?</strong> על בסיס תחומי העניין שבחרת בסקירה הכללית,
              אנחנו מציגים כאן רק את השאלות הרלוונטיות עבורך. זה חוסך זמן ומבטיח שנתמקד בדיוק במה שחשוב לך.
            </p>
          </div>

          {/* Dynamic Sections */}
          {visibleSections.map((section, index) => (
            <div key={section.key} id={`section-${section.key}`}>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                  {index + 1}
                </div>
                <h2 className="text-lg font-semibold text-gray-800">{section.title}</h2>
              </div>
              {section.component}
            </div>
          ))}

          {/* Summary */}
          <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-3" />
              <h3 className="text-lg font-semibold mb-2">סיימת את האיפיון הממוקד!</h3>
              <p className="text-sm text-gray-600 mb-4">
                מלאת בהצלחה {visibleSections.length} תחומים.
                כעת תוכל להמשיך למודולים המלאים לפרטים נוספים.
              </p>
              <Button
                onClick={() => navigate('/module/leadsAndSales')}
                variant="primary"
                size="lg"
              >
                המשך למודולים המלאים
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
