import React from 'react';
import { IntegrationVisualizer } from './IntegrationVisualizer';
import { DetailedSystemInfo } from '../../types';

/**
 * Demo component showing how to use IntegrationVisualizer
 *
 * Usage in a module:
 * ```tsx
 * import { IntegrationVisualizer } from '@/components/Visualizations';
 * import { useMeetingStore } from '@/store/useMeetingStore';
 *
 * const systems = useMeetingStore(state => state.currentMeeting?.modules.systems.detailedSystems || []);
 *
 * return <IntegrationVisualizer systems={systems} />;
 * ```
 */
export const IntegrationVisualizerDemo: React.FC = () => {
  // Sample data for demonstration
  const sampleSystems: DetailedSystemInfo[] = [
    {
      id: 'system-1',
      category: 'crm',
      specificSystem: 'Zoho CRM',
      version: 'Professional',
      recordCount: 5000,
      apiAccess: 'full',
      satisfactionScore: 4,
      mainPainPoints: ['סנכרון איטי', 'ממשק מורכב'],
      integrationNeeds: [
        {
          id: 'int-1',
          targetSystemId: 'system-2',
          targetSystemName: 'Priority ERP',
          integrationType: 'api',
          frequency: 'realtime',
          dataFlow: 'bidirectional',
          criticalityLevel: 'critical',
          currentStatus: 'working',
          specificNeeds: 'סנכרון לקוחות והזמנות',
        },
        {
          id: 'int-2',
          targetSystemId: 'system-3',
          targetSystemName: 'WhatsApp Business',
          integrationType: 'n8n',
          frequency: 'realtime',
          dataFlow: 'bidirectional',
          criticalityLevel: 'important',
          currentStatus: 'working',
          specificNeeds: 'שליחת הודעות אוטומטית',
        },
      ],
      migrationWillingness: 'open',
      monthlyUsers: 25,
      criticalFeatures: ['ניהול לידים', 'דוחות'],
      dataVolume: 'medium',
    },
    {
      id: 'system-2',
      category: 'erp',
      specificSystem: 'Priority ERP',
      version: 'Enterprise',
      recordCount: 15000,
      apiAccess: 'full',
      satisfactionScore: 5,
      mainPainPoints: [],
      integrationNeeds: [
        {
          id: 'int-3',
          targetSystemId: 'system-4',
          targetSystemName: 'WooCommerce',
          integrationType: 'api',
          frequency: 'hourly',
          dataFlow: 'bidirectional',
          criticalityLevel: 'critical',
          currentStatus: 'problematic',
          specificNeeds: 'סנכרון מלאי ומחירים',
        },
      ],
      migrationWillingness: 'reluctant',
      monthlyUsers: 40,
      criticalFeatures: ['ניהול מלאי', 'הנהלת חשבונות'],
      dataVolume: 'large',
    },
    {
      id: 'system-3',
      category: 'communication',
      specificSystem: 'WhatsApp Business',
      apiAccess: 'full',
      satisfactionScore: 5,
      mainPainPoints: [],
      integrationNeeds: [],
      migrationWillingness: 'no',
      monthlyUsers: 10,
      criticalFeatures: ['תקשורת עם לקוחות'],
      dataVolume: 'small',
    },
    {
      id: 'system-4',
      category: 'ecommerce',
      specificSystem: 'WooCommerce',
      apiAccess: 'full',
      satisfactionScore: 3,
      mainPainPoints: ['עומס על השרת', 'ניהול מלאי מסורבל'],
      integrationNeeds: [
        {
          id: 'int-4',
          targetSystemId: 'system-5',
          targetSystemName: 'Google Analytics',
          integrationType: 'native',
          frequency: 'realtime',
          dataFlow: 'one-way-to',
          criticalityLevel: 'nice-to-have',
          currentStatus: 'working',
        },
      ],
      migrationWillingness: 'open',
      monthlyUsers: 15,
      criticalFeatures: ['חנות מקוונת', 'תשלומים'],
      dataVolume: 'medium',
    },
    {
      id: 'system-5',
      category: 'marketing_automation',
      specificSystem: 'Google Analytics',
      apiAccess: 'full',
      satisfactionScore: 4,
      mainPainPoints: [],
      integrationNeeds: [],
      migrationWillingness: 'no',
      monthlyUsers: 5,
      criticalFeatures: ['אנליטיקס', 'דוחות'],
      dataVolume: 'small',
    },
    {
      id: 'system-6',
      category: 'accounting',
      specificSystem: 'QuickBooks',
      apiAccess: 'limited',
      satisfactionScore: 3,
      mainPainPoints: ['אין חיבור ל-Priority', 'רישום כפול'],
      integrationNeeds: [
        {
          id: 'int-5',
          targetSystemId: 'system-2',
          targetSystemName: 'Priority ERP',
          integrationType: 'manual',
          frequency: 'manual',
          dataFlow: 'one-way-from',
          criticalityLevel: 'critical',
          currentStatus: 'missing',
          specificNeeds: 'סנכרון חשבוניות',
        },
      ],
      migrationWillingness: 'eager',
      monthlyUsers: 8,
      criticalFeatures: ['הנהלת חשבונות'],
      dataVolume: 'medium',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          מפת ארכיטקטורת אינטגרציות
        </h1>
        <p className="text-gray-600">
          המחשה חזותית של המערכות והאינטגרציות ביניהן. גרור צמתים לארגון מחדש,
          זום והתקרב לפרטים.
        </p>
      </div>

      <IntegrationVisualizer systems={sampleSystems} />

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">הוראות שימוש:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>גרור צמתים כדי לארגן את התצוגה</li>
          <li>השתמש בגלגלת העכבר לזום פנימה וחוצה</li>
          <li>המפה הקטנה בפינה מציגה מבט על</li>
          <li>לחץ על "ייצוא PNG" לשמירת התמונה</li>
          <li>לחץ על "ארגן מחדש" לחזרה לפריסה אוטומטית</li>
          <li>קווים מהבהבים מציינים אינטגרציות בזמן אמת</li>
          <li>צבע הקו מייצג רמת קריטיות (אדום=קריטי, כתום=חשוב, אפור=רצוי)</li>
          <li>סגנון הקו מייצג סטטוס (רציף=עובד, מקווקו=בעייתי, מנוקד=חסר)</li>
        </ul>
      </div>
    </div>
  );
};
