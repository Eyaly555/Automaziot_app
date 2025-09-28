import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Rocket, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useMeetingStore } from '../../../store/useMeetingStore';
import { Card } from '../../Common/Card';
import { TextField, CheckboxGroup, RadioGroup, TextAreaField } from '../../Common/FormFields';

export const PlanningModule: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateModule, completeMeeting } = useMeetingStore();
  const moduleData = currentMeeting?.modules.planning || {};

  // Vision & Goals
  const [vision, setVision] = useState(moduleData.vision || '');
  const [primaryGoals, setPrimaryGoals] = useState<string[]>(moduleData.primaryGoals || []);
  const [timeframe, setTimeframe] = useState(moduleData.timeframe || '');

  // Priorities
  const [topPriorities, setTopPriorities] = useState<string[]>(moduleData.priorities?.top || []);
  const [quickWins, setQuickWins] = useState<string[]>(moduleData.priorities?.quickWins || []);
  const [longTermProjects, setLongTermProjects] = useState<string[]>(moduleData.priorities?.longTerm || []);

  // Implementation
  const [implementationApproach, setImplementationApproach] = useState(moduleData.implementation?.approach || '');
  const [teamInvolvement, setTeamInvolvement] = useState(moduleData.implementation?.team || '');
  const [trainingNeeded, setTrainingNeeded] = useState(moduleData.implementation?.training || '');

  // Next Steps
  const [immediateActions, setImmediateActions] = useState(moduleData.nextSteps?.immediate || '');
  const [followUpDate, setFollowUpDate] = useState(moduleData.nextSteps?.followUp || '');
  const [decisionMakers, setDecisionMakers] = useState(moduleData.nextSteps?.decisionMakers || '');

  // Risks & Concerns
  const [mainRisks, setMainRisks] = useState<string[]>(moduleData.risks || []);
  const [additionalSupport, setAdditionalSupport] = useState(moduleData.additionalSupport || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      updateModule('planning', {
        vision,
        primaryGoals,
        timeframe,
        priorities: {
          top: topPriorities,
          quickWins,
          longTerm: longTermProjects
        },
        implementation: {
          approach: implementationApproach,
          team: teamInvolvement,
          training: trainingNeeded
        },
        nextSteps: {
          immediate: immediateActions,
          followUp: followUpDate,
          decisionMakers
        },
        risks: mainRisks,
        additionalSupport
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [vision, primaryGoals, timeframe, topPriorities, quickWins, longTermProjects,
      implementationApproach, teamInvolvement, trainingNeeded, immediateActions,
      followUpDate, decisionMakers, mainRisks, additionalSupport]);

  const handleComplete = () => {
    completeMeeting();
    navigate('/');
  };

  // Get pain points count from all modules
  const painPointsCount = currentMeeting?.painPoints?.length || 0;

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
              <h1 className="text-xl font-semibold">📋 סיכום ותכנון</h1>
            </div>
            <button
              onClick={handleComplete}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              סיום וחזרה לדשבורד
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Summary Stats */}
        {painPointsCount > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-2">סיכום כאבים שזוהו</h2>
                <p className="text-gray-600">זוהו {painPointsCount} נקודות כאב שדורשות התייחסות</p>
              </div>
              <div className="text-4xl font-bold text-orange-600">
                {painPointsCount}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Vision & Goals */}
          <Card title="9.1 חזון ויעדים"
            subtitle="מה המטרה הסופית?">
            <div className="space-y-6">
              <TextAreaField
                label="חזון לאחר יישום האוטומציה"
                value={vision}
                onChange={setVision}
                placeholder="תאר איך הארגון ייראה אחרי יישום מוצלח..."
                rows={3}
              />

              <CheckboxGroup
                label="יעדים עיקריים"
                options={[
                  { value: 'efficiency', label: 'שיפור יעילות תפעולית ב-50%+' },
                  { value: 'customer_satisfaction', label: 'העלאת שביעות רצון לקוחות' },
                  { value: 'revenue_growth', label: 'הגדלת הכנסות ב-20%+' },
                  { value: 'cost_reduction', label: 'הפחתת עלויות ב-30%+' },
                  { value: 'scale', label: 'יכולת להגדיל פעילות בלי תוספת כוח אדם' },
                  { value: 'quality', label: 'שיפור איכות ודיוק' },
                  { value: 'speed', label: 'זמני תגובה מהירים יותר' },
                  { value: 'innovation', label: 'יצירת יכולות חדשות' },
                  { value: 'competitive', label: 'יתרון תחרותי בשוק' },
                  { value: 'employee_satisfaction', label: 'שיפור חוויית עובדים' }
                ]}
                values={primaryGoals}
                onChange={setPrimaryGoals}
                columns={2}
              />

              <RadioGroup
                label="מסגרת זמן ליישום החזון"
                value={timeframe}
                onChange={setTimeframe}
                options={[
                  { value: '3_months', label: '3 חודשים - יישום מהיר' },
                  { value: '6_months', label: '6 חודשים - קצב סביר' },
                  { value: '12_months', label: 'שנה - יישום מקיף' },
                  { value: '18_months', label: 'שנה וחצי - טרנספורמציה מלאה' },
                  { value: 'over_18', label: 'מעל שנה וחצי - פרויקט ארוך טווח' }
                ]}
              />
            </div>
          </Card>

          {/* Priorities */}
          <Card title="9.2 תעדוף"
            subtitle="מה חשוב לעשות קודם?">
            <div className="space-y-6">
              <CheckboxGroup
                label="פריוריטי טופ (3 הדברים הכי חשובים)"
                options={[
                  { value: 'lead_automation', label: 'אוטומציית ניהול לידים' },
                  { value: 'customer_response', label: 'מענה אוטומטי ללקוחות' },
                  { value: 'data_integration', label: 'אינטגרציה בין מערכות' },
                  { value: 'reporting', label: 'דוחות אוטומטיים' },
                  { value: 'workflow_automation', label: 'אוטומציית תהליכי עבודה' },
                  { value: 'ai_implementation', label: 'הטמעת AI' },
                  { value: 'data_quality', label: 'שיפור איכות נתונים' },
                  { value: 'process_optimization', label: 'אופטימיזציה של תהליכים' }
                ]}
                values={topPriorities}
                onChange={setTopPriorities}
                columns={2}
              />

              <CheckboxGroup
                label="Quick Wins (ניתן ליישם מהר)"
                options={[
                  { value: 'email_templates', label: 'תבניות אימייל אוטומטיות' },
                  { value: 'basic_chatbot', label: 'צ\'אטבוט בסיסי' },
                  { value: 'simple_integrations', label: 'אינטגרציות פשוטות' },
                  { value: 'automated_notifications', label: 'התראות אוטומטיות' },
                  { value: 'basic_reporting', label: 'דוחות בסיסיים' },
                  { value: 'form_automation', label: 'אוטומציית טפסים' }
                ]}
                values={quickWins}
                onChange={setQuickWins}
                columns={2}
              />

              <CheckboxGroup
                label="פרויקטים לטווח ארוך"
                options={[
                  { value: 'full_crm', label: 'CRM מלא ומותאם' },
                  { value: 'ai_agents', label: 'סוכני AI מתקדמים' },
                  { value: 'predictive_analytics', label: 'ניתוח חזוי' },
                  { value: 'complete_automation', label: 'אוטומציה מלאה של התהליך' },
                  { value: 'custom_platform', label: 'פלטפורמה מותאמת אישית' },
                  { value: 'ml_models', label: 'מודלי למידת מכונה' }
                ]}
                values={longTermProjects}
                onChange={setLongTermProjects}
                columns={2}
              />
            </div>
          </Card>

          {/* Implementation Approach */}
          <Card title="9.3 גישת יישום"
            subtitle="איך מתקדמים?">
            <div className="space-y-6">
              <RadioGroup
                label="גישת יישום מועדפת"
                value={implementationApproach}
                onChange={setImplementationApproach}
                options={[
                  { value: 'pilot', label: 'פיילוט במחלקה אחת ואז הרחבה' },
                  { value: 'phased', label: 'בשלבים - מודול אחרי מודול' },
                  { value: 'parallel', label: 'במקביל - כמה פרויקטים יחד' },
                  { value: 'big_bang', label: 'Big Bang - הכל בבת אחת' },
                  { value: 'agile', label: 'Agile - ספרינטים ושיפור מתמיד' }
                ]}
              />

              <RadioGroup
                label="מעורבות הצוות"
                value={teamInvolvement}
                onChange={setTeamInvolvement}
                options={[
                  { value: 'full', label: 'מעורבות מלאה - כולם שותפים' },
                  { value: 'champions', label: 'צוות מוביל + אלופים בכל מחלקה' },
                  { value: 'it_led', label: 'בהובלת IT עם תמיכת מחלקות' },
                  { value: 'external', label: 'ספק חיצוני עם ליווי פנימי' },
                  { value: 'mixed', label: 'שילוב של פנימי וחיצוני' }
                ]}
              />

              <RadioGroup
                label="צורך בהדרכות"
                value={trainingNeeded}
                onChange={setTrainingNeeded}
                options={[
                  { value: 'extensive', label: 'נרחב - הדרכות מעמיקות לכולם' },
                  { value: 'moderate', label: 'בינוני - הדרכות למשתמשי מפתח' },
                  { value: 'minimal', label: 'מינימלי - רק הדרכות בסיסיות' },
                  { value: 'none', label: 'לא נדרש - הכלים אינטואיטיביים' }
                ]}
              />
            </div>
          </Card>

          {/* Next Steps */}
          <Card title="9.4 צעדים הבאים"
            subtitle="מה קורה מכאן?">
            <div className="space-y-6">
              <TextAreaField
                label="פעולות מיידיות (תוך שבוע)"
                value={immediateActions}
                onChange={setImmediateActions}
                placeholder="רשום 3-5 פעולות קונקרטיות שיקרו השבוע..."
                rows={3}
              />

              <TextField
                label="תאריך פגישת המשך"
                value={followUpDate}
                onChange={setFollowUpDate}
                type="date"
              />

              <TextField
                label="מקבלי החלטות מרכזיים"
                value={decisionMakers}
                onChange={setDecisionMakers}
                placeholder="שמות ותפקידים של מקבלי ההחלטות..."
              />
            </div>
          </Card>

          {/* Risks & Support */}
          <Card title="9.5 סיכונים ותמיכה"
            subtitle="מה יכול לעכב ומה נדרש?">
            <div className="space-y-6">
              <CheckboxGroup
                label="סיכונים עיקריים"
                options={[
                  { value: 'budget', label: 'מגבלות תקציב' },
                  { value: 'resistance', label: 'התנגדות לשינוי' },
                  { value: 'technical', label: 'אתגרים טכניים' },
                  { value: 'time', label: 'לוחות זמנים צפופים' },
                  { value: 'skills', label: 'חוסר במיומנויות' },
                  { value: 'integration', label: 'קשיי אינטגרציה' },
                  { value: 'data', label: 'איכות נתונים גרועה' },
                  { value: 'vendor', label: 'תלות בספקים' },
                  { value: 'compliance', label: 'דרישות רגולציה' },
                  { value: 'scale', label: 'קושי בהרחבה' }
                ]}
                values={mainRisks}
                onChange={setMainRisks}
                columns={2}
              />

              <TextAreaField
                label="תמיכה נוספת נדרשת"
                value={additionalSupport}
                onChange={setAdditionalSupport}
                placeholder="איזה סוג תמיכה, ייעוץ או משאבים נדרשים להצלחה..."
                rows={2}
              />

              {mainRisks.length > 5 && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 font-medium">
                    <AlertTriangle className="w-5 h-5" />
                    זוהו מספר סיכונים משמעותיים
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    מומלץ לבנות תוכנית ניהול סיכונים מפורטת
                  </p>
                </div>
              )}

              {primaryGoals.length >= 5 && quickWins.length >= 3 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 font-medium">
                    <CheckCircle className="w-5 h-5" />
                    תוכנית פעולה מוגדרת היטב!
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    יש יעדים ברורים ו-Quick Wins ליישום מהיר
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};