import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Database, Link2, Shield, Cloud, AlertTriangle } from 'lucide-react';
import { useMeetingStore } from '../../../store/useMeetingStore';
import { Card, Input, Button } from '../../Base';
import { CheckboxGroup, RadioGroup, RatingField } from '../../Common/FormFields';
import { PainPointFlag } from '../../Common/PainPointFlag/PainPointFlag';

export const SystemsModule: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateModule } = useMeetingStore();
  const moduleData = currentMeeting?.modules?.systems || {};

  // Current Systems
  const [currentSystems, setCurrentSystems] = useState<string[]>(moduleData.currentSystems || []);
  const [customSystems, setCustomSystems] = useState(moduleData.customSystems || '');

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
  }, [currentSystems, customSystems, integrationLevel, integrationIssues, manualDataTransfer,
      dataQuality, duplicateData, dataCompleteness, apiUsage, webhookUsage, apiNeeds,
      hostingType, securityMeasures, backupFrequency]);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
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
              <h1 className="text-xl font-semibold">💻 מערכות וטכנולוגיה</h1>
            </div>
            <Button
              onClick={() => navigate('/module/roi')}
              variant="primary"
              size="md"
            >
              המשך למודול הבא
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Current Systems */}
          <Card title="7.1 מערכות קיימות"
            subtitle="איזה מערכות נמצאות בשימוש כיום?">
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

              <Input
                label="מערכות נוספות (אם יש)"
                value={customSystems}
                onChange={setCustomSystems}
                placeholder="רשום מערכות נוספות מופרדות בפסיק..."
                dir="rtl"
              />

              {currentSystems.length === 0 && (
                <PainPointFlag
                  severity="medium"
                  description="אין מערכות מרכזיות - עבודה ידנית מוגברת"
                />
              )}
            </div>
          </Card>

          {/* Integrations */}
          <Card title="7.2 אינטגרציות"
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

          {/* Data Quality */}
          <Card title="7.3 איכות נתונים"
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

          {/* API & Webhooks */}
          <Card title="7.4 ממשקי API ו-Webhooks"
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

          {/* Infrastructure */}
          <Card title="7.5 תשתית ואבטחה"
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
        </div>
      </div>
    </div>
  );
};