import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Sparkles } from 'lucide-react';
import { useMeetingStore } from '../../../store/useMeetingStore';
import { Card } from '../../Common/Card';
import { TextField, CheckboxGroup, RadioGroup } from '../../Common/FormFields';
import { PainPointFlag } from '../../Common/PainPointFlag/PainPointFlag';
import { DetailedSystemCard } from './DetailedSystemCard';
import { DetailedSystemInfo } from '../../../types';
import { SYSTEM_CATEGORIES, getSystemLabel } from '../../../config/systemsDatabase';
import { IntegrationVisualizer } from '../../Visualizations/IntegrationVisualizer';

export const SystemsModuleEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateModule } = useMeetingStore();
  const moduleData = currentMeeting?.modules.systems || {};

  // Current Systems (legacy checkboxes)
  const [currentSystems, setCurrentSystems] = useState<string[]>(moduleData.currentSystems || []);
  const [customSystems, setCustomSystems] = useState(moduleData.customSystems || '');

  // NEW: Detailed Systems
  const [detailedSystems, setDetailedSystems] = useState<DetailedSystemInfo[]>(
    moduleData.detailedSystems || []
  );

  // Integrations
  const [integrationLevel, setIntegrationLevel] = useState(moduleData.integrations?.level || '');
  const [integrationIssues, setIntegrationIssues] = useState<string[]>(moduleData.integrations?.issues || []);
  const [manualDataTransfer, setManualDataTransfer] = useState(moduleData.integrations?.manualDataTransfer || '');

  // Data Quality
  const [dataQuality, setDataQuality] = useState(moduleData.dataQuality?.overall || '');
  const [duplicateData, setDuplicateData] = useState(moduleData.dataQuality?.duplicates || '');
  const [dataCompleteness, setDataCompleteness] = useState(moduleData.dataQuality?.completeness || '');

  // API & Webhooks
  const [apiUsage, setApiUsage] = useState(moduleData.apiWebhooks?.usage || '');
  const [webhookUsage, setWebhookUsage] = useState(moduleData.apiWebhooks?.webhooks || '');
  const [apiNeeds, setApiNeeds] = useState<string[]>(moduleData.apiWebhooks?.needs || []);

  // Infrastructure
  const [hostingType, setHostingType] = useState(moduleData.infrastructure?.hosting || '');
  const [securityMeasures, setSecurityMeasures] = useState<string[]>(moduleData.infrastructure?.security || []);
  const [backupFrequency, setBackupFrequency] = useState(moduleData.infrastructure?.backup || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      updateModule('systems', {
        currentSystems,
        customSystems,
        detailedSystems, // NEW
        integrations: {
          level: integrationLevel,
          issues: integrationIssues,
          manualDataTransfer
        },
        dataQuality: {
          overall: dataQuality,
          duplicates: duplicateData,
          completeness: dataCompleteness
        },
        apiWebhooks: {
          usage: apiUsage,
          webhooks: webhookUsage,
          needs: apiNeeds
        },
        infrastructure: {
          hosting: hostingType,
          security: securityMeasures,
          backup: backupFrequency
        }
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentSystems, customSystems, detailedSystems, integrationLevel, integrationIssues, manualDataTransfer,
      dataQuality, duplicateData, dataCompleteness, apiUsage, webhookUsage, apiNeeds,
      hostingType, securityMeasures, backupFrequency]);

  const handleAddDetailedSystem = (category: string) => {
    const newSystem: DetailedSystemInfo = {
      id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category,
      specificSystem: '',
      apiAccess: 'unknown',
      satisfactionScore: 3,
      mainPainPoints: [],
      integrationNeeds: [],
      migrationWillingness: 'open',
      criticalFeatures: []
    };
    setDetailedSystems([...detailedSystems, newSystem]);
  };

  const handleUpdateDetailedSystem = (id: string, updates: Partial<DetailedSystemInfo>) => {
    setDetailedSystems(detailedSystems.map(sys =>
      sys.id === id ? { ...sys, ...updates } : sys
    ));
  };

  const handleRemoveDetailedSystem = (id: string) => {
    setDetailedSystems(detailedSystems.filter(sys => sys.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  💻 מערכות וטכנולוגיה
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    <Sparkles className="w-3 h-3 inline" /> משופר
                  </span>
                </h1>
                <p className="text-sm text-gray-600">מפרט מפורט למערכות ואינטגרציות</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/module/roi')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              המשך למודול הבא
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Quick Selection */}
          <Card
            title="7.1 בחירה מהירה של מערכות"
            subtitle="סמן את קטגוריות המערכות שבשימוש (תוכל לפרט אחר כך)"
          >
            <div className="space-y-6">
              <CheckboxGroup
                label="מערכות בשימוש"
                options={[
                  { value: 'crm', label: 'CRM (מערכת ניהול קשרי לקוחות)' },
                  { value: 'erp', label: 'ERP (מערכת ניהול משאבים)' },
                  { value: 'marketing_automation', label: 'אוטומציית שיווק' },
                  { value: 'helpdesk', label: 'מערכת תמיכה/כרטוס' },
                  { value: 'accounting', label: 'מערכת הנהלת חשבונות' },
                  { value: 'project_management', label: 'ניהול פרויקטים' },
                  { value: 'hr_system', label: 'מערכת משאבי אנוש' },
                  { value: 'inventory', label: 'ניהול מלאי' },
                  { value: 'ecommerce', label: 'מסחר אלקטרוני' },
                  { value: 'bi_analytics', label: 'BI וניתוח נתונים' }
                ]}
                values={currentSystems}
                onChange={setCurrentSystems}
                columns={2}
              />

              <TextField
                label="מערכות נוספות (אם יש)"
                value={customSystems}
                onChange={setCustomSystems}
                placeholder="רשום מערכות נוספות מופרדות בפסיק..."
              />

              {currentSystems.length === 0 && (
                <PainPointFlag
                  severity="medium"
                  description="אין מערכות מרכזיות - עבודה ידנית מוגברת"
                />
              )}
            </div>
          </Card>

          {/* Detailed System Specifications - NEW */}
          <Card
            title="7.2 מפרט מפורט למערכות"
            subtitle="הוסף פרטים מדויקים לכל מערכת (שמות, גרסאות, אינטגרציות)"
            className="bg-gradient-to-br from-blue-50 to-indigo-50"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-white rounded-lg border-2 border-blue-200">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    חדש! מפרט מפורט למפתחים
                  </p>
                  <p className="text-xs text-gray-600">
                    הוסף פרטים טכניים מדויקים לכל מערכת כדי ליצור מפרט אוטומטי למפתחים
                  </p>
                </div>
              </div>

              {/* Add System Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {SYSTEM_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleAddDetailedSystem(category.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-all text-right"
                  >
                    <Plus className="w-4 h-4 text-primary" />
                    <span className="text-sm">{category.labelHebrew}</span>
                  </button>
                ))}
              </div>

              {/* Detailed System Cards */}
              {detailedSystems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">לא הוספת מערכות מפורטות עדיין</p>
                  <p className="text-sm">לחץ על אחד הכפתורים למעלה כדי להוסיף מערכת</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {detailedSystems.map(system => (
                    <DetailedSystemCard
                      key={system.id}
                      system={system}
                      onUpdate={(updates) => handleUpdateDetailedSystem(system.id, updates)}
                      onRemove={() => handleRemoveDetailedSystem(system.id)}
                      allSystems={detailedSystems}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Integrations - Keep existing */}
          <Card title="7.3 אינטגרציות כלליות"
            subtitle="איך המערכות מתקשרות ביניהן?">
            <div className="space-y-6">
              <RadioGroup
                label="רמת אינטגרציה בין מערכות"
                value={integrationLevel}
                onChange={setIntegrationLevel}
                options={[
                  { value: 'full', label: 'מלאה - הכל מסונכרן אוטומטית' },
                  { value: 'partial', label: 'חלקית - חלק מהמערכות מחוברות' },
                  { value: 'minimal', label: 'מינימלית - רוב המערכות נפרדות' },
                  { value: 'none', label: 'אין - כל מערכת עובדת בנפרד' }
                ]}
              />

              <CheckboxGroup
                label="בעיות באינטגרציה"
                options={[
                  { value: 'sync_delays', label: 'עיכובים בסנכרון' },
                  { value: 'data_loss', label: 'אובדן מידע במעבר' },
                  { value: 'duplicate_entry', label: 'הזנות כפולות' },
                  { value: 'format_issues', label: 'בעיות פורמט/תאימות' },
                  { value: 'limited_fields', label: 'העברת שדות מוגבלת' },
                  { value: 'manual_updates', label: 'צורך בעדכון ידני' }
                ]}
                values={integrationIssues}
                onChange={setIntegrationIssues}
                columns={2}
              />

              <RadioGroup
                label="כמה זמן מושקע בהעברת נתונים ידנית?"
                value={manualDataTransfer}
                onChange={setManualDataTransfer}
                options={[
                  { value: 'none', label: 'אין צורך - הכל אוטומטי' },
                  { value: '1-2_hours', label: '1-2 שעות בשבוע' },
                  { value: '3-5_hours', label: '3-5 שעות בשבוע' },
                  { value: '6-10_hours', label: '6-10 שעות בשבוע' },
                  { value: 'over_10', label: 'מעל 10 שעות בשבוע' }
                ]}
              />

              {(integrationLevel === 'minimal' || integrationLevel === 'none') && (
                <PainPointFlag
                  severity="high"
                  description="חוסר אינטגרציה - בזבוז זמן משמעותי"
                />
              )}
            </div>
          </Card>

          {/* Data Quality - Keep existing */}
          <Card title="7.4 איכות נתונים"
            subtitle="מה מצב הנתונים במערכות?">
            <div className="space-y-6">
              <RadioGroup
                label="איכות נתונים כללית"
                value={dataQuality}
                onChange={setDataQuality}
                options={[
                  { value: 'excellent', label: 'מצוינת - נתונים נקיים ומדויקים' },
                  { value: 'good', label: 'טובה - בעיות מינוריות' },
                  { value: 'average', label: 'בינונית - יש בעיות שצריך לטפל' },
                  { value: 'poor', label: 'גרועה - הרבה בעיות ואי דיוקים' }
                ]}
              />

              <RadioGroup
                label="כמות נתונים כפולים"
                value={duplicateData}
                onChange={setDuplicateData}
                options={[
                  { value: 'none', label: 'אין כפילויות' },
                  { value: 'minimal', label: 'מעט (פחות מ-5%)' },
                  { value: 'moderate', label: 'בינוני (5-15%)' },
                  { value: 'high', label: 'הרבה (מעל 15%)' }
                ]}
              />

              <RadioGroup
                label="שלמות הנתונים"
                value={dataCompleteness}
                onChange={setDataCompleteness}
                options={[
                  { value: 'complete', label: 'מלא - כל השדות החשובים מלאים' },
                  { value: 'mostly_complete', label: 'רוב השדות מלאים' },
                  { value: 'partial', label: 'חלקי - חסרים הרבה נתונים' },
                  { value: 'poor', label: 'חסר - רוב השדות ריקים' }
                ]}
              />

              {(dataQuality === 'poor' || duplicateData === 'high') && (
                <PainPointFlag
                  severity="high"
                  description="איכות נתונים ירודה פוגעת בתהליכים"
                />
              )}
            </div>
          </Card>

          {/* API & Webhooks - Keep existing */}
          <Card title="7.5 ממשקי API ו-Webhooks"
            subtitle="שימוש בממשקים לאוטומציה">
            <div className="space-y-6">
              <RadioGroup
                label="שימוש ב-API"
                value={apiUsage}
                onChange={setApiUsage}
                options={[
                  { value: 'extensive', label: 'נרחב - משתמשים בהרבה ממשקים' },
                  { value: 'moderate', label: 'בינוני - כמה ממשקים פעילים' },
                  { value: 'minimal', label: 'מינימלי - שימוש בסיסי' },
                  { value: 'none', label: 'אין שימוש בכלל' }
                ]}
              />

              <RadioGroup
                label="שימוש ב-Webhooks"
                value={webhookUsage}
                onChange={setWebhookUsage}
                options={[
                  { value: 'active', label: 'פעיל - מקבלים התראות בזמן אמת' },
                  { value: 'limited', label: 'מוגבל - רק לדברים קריטיים' },
                  { value: 'none', label: 'אין שימוש' },
                  { value: 'dont_know', label: 'לא יודע מה זה' }
                ]}
              />

              <CheckboxGroup
                label="צרכי ממשקים"
                options={[
                  { value: 'real_time_sync', label: 'סנכרון בזמן אמת' },
                  { value: 'automated_workflows', label: 'תהליכי עבודה אוטומטיים' },
                  { value: 'external_integrations', label: 'חיבור לשירותים חיצוניים' },
                  { value: 'data_export', label: 'ייצוא נתונים אוטומטי' },
                  { value: 'event_triggers', label: 'טריגרים לאירועים' },
                  { value: 'custom_reports', label: 'דוחות מותאמים אישית' }
                ]}
                values={apiNeeds}
                onChange={setApiNeeds}
                columns={2}
              />
            </div>
          </Card>

          {/* Infrastructure - Keep existing */}
          <Card title="7.6 תשתית ואבטחה"
            subtitle="איך המערכות מאוחסנות ומאובטחות?">
            <div className="space-y-6">
              <RadioGroup
                label="סוג אירוח"
                value={hostingType}
                onChange={setHostingType}
                options={[
                  { value: 'cloud', label: 'ענן מלא (AWS, Azure, Google)' },
                  { value: 'hybrid', label: 'היברידי - חלק ענן חלק מקומי' },
                  { value: 'on_premise', label: 'מקומי - שרתים בארגון' },
                  { value: 'mixed_saas', label: 'שילוב של שירותי SaaS' }
                ]}
              />

              <CheckboxGroup
                label="אמצעי אבטחה"
                options={[
                  { value: 'ssl', label: 'הצפנת SSL' },
                  { value: '2fa', label: 'אימות דו-שלבי' },
                  { value: 'regular_backups', label: 'גיבויים סדירים' },
                  { value: 'access_control', label: 'בקרת גישה והרשאות' },
                  { value: 'audit_logs', label: 'לוגים וביקורת' },
                  { value: 'encryption', label: 'הצפנת נתונים' },
                  { value: 'vpn', label: 'גישה דרך VPN' },
                  { value: 'firewall', label: 'חומת אש' }
                ]}
                values={securityMeasures}
                onChange={setSecurityMeasures}
                columns={2}
              />

              <RadioGroup
                label="תדירות גיבויים"
                value={backupFrequency}
                onChange={setBackupFrequency}
                options={[
                  { value: 'real_time', label: 'זמן אמת - רפליקציה מתמדת' },
                  { value: 'hourly', label: 'כל שעה' },
                  { value: 'daily', label: 'יומי' },
                  { value: 'weekly', label: 'שבועי' },
                  { value: 'monthly', label: 'חודשי' },
                  { value: 'none', label: 'אין גיבויים קבועים' }
                ]}
              />

              {backupFrequency === 'none' && (
                <PainPointFlag
                  severity="critical"
                  description="אין גיבויים - סיכון גבוה לאובדן נתונים!"
                />
              )}

              {securityMeasures.length < 3 && (
                <PainPointFlag
                  severity="high"
                  description="אבטחה חלשה - הארגון חשוף לסיכונים"
                />
              )}
            </div>
          </Card>

          {/* Phase 3: Integration Architecture Visualizer */}
          {detailedSystems.length > 0 && (
            <div className="mt-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">🔗 מפת אינטגרציות</h2>
                <p className="text-gray-700">
                  תצוגה ויזואלית של מערכות וקישוריות ביניהן
                </p>
              </div>
              <IntegrationVisualizer systems={detailedSystems} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};