import React, { useMemo } from 'react';
import { Meeting } from '../../types';
import { Card } from '../Common/Card';
import { calculateROI } from '../../utils/roiCalculator';
import { SmartRecommendationsEngine } from '../../utils/smartRecommendations';
import { formatCurrency } from '../../utils/formatters';
import {
  Building,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Edit,
  FileText,
  Download,
} from 'lucide-react';

interface WizardSummaryProps {
  meeting: Meeting;
  onEdit: (stepId: string) => void;
}

export const WizardSummary: React.FC<WizardSummaryProps> = ({
  meeting,
  onEdit,
}) => {
  // Calculate ROI
  const roiData = useMemo(() => calculateROI(meeting), [meeting]);

  // Generate recommendations
  const recommendations = useMemo(() => {
    try {
      const engine = new SmartRecommendationsEngine(meeting);
      return engine.getTopPriorities(5);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      return [];
    }
  }, [meeting]);

  // Get module completion status
  const getModuleStatus = (moduleId: string) => {
    const module = meeting.modules[moduleId as keyof typeof meeting.modules];
    if (!module) return 'empty';

    const hasData = Object.values(module).some(
      (value) =>
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
    );

    return hasData ? 'completed' : 'empty';
  };

  const moduleNames: Record<string, string> = {
    overview: 'סקירה כללית',
    leadsAndSales: 'לידים ומכירות',
    customerService: 'שירות לקוחות',
    operations: 'תפעול',
    reporting: 'דיווחים',
    aiAgents: 'סוכני AI',
    systems: 'מערכות',
    roi: 'החזר השקעה',
    planning: 'תכנון',
  };

  const severityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  const severityLabels = {
    low: 'נמוכה',
    medium: 'בינונית',
    high: 'גבוהה',
    critical: 'קריטית',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm">
              <Building className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                סיכום פגישת גילוי - {meeting.clientName}
              </h2>
              <p className="text-gray-600 mt-1">
                {new Date(meeting.date).toLocaleDateString('he-IL')}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">חיסכון חודשי צפוי</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(roiData.monthlySavings)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">שעות חיסכון חודשי</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(roiData.hoursSaved)} שעות
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">נקודות כאב שזוהו</p>
              <p className="text-2xl font-bold text-gray-900">
                {meeting.painPoints.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Business Overview */}
      {meeting.modules.overview && (
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">סקירת העסק</h3>
              <button
                onClick={() => onEdit('overview-basics')}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="ערוך סקירה"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">סוג עסק</p>
                <p className="font-medium">
                  {meeting.modules.overview.businessType || 'לא צוין'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">מספר עובדים</p>
                <p className="font-medium">
                  {meeting.modules.overview.employees || 'לא צוין'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">אתגר מרכזי</p>
                <p className="font-medium">
                  {meeting.modules.overview.mainChallenge || 'לא צוין'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Pain Points */}
      {meeting.painPoints.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">נקודות כאב מרכזיות</h3>
            <div className="space-y-3">
              {meeting.painPoints.map((painPoint) => (
                <div key={painPoint.id} className="flex items-start gap-3">
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      severityColors[painPoint.severity]
                    }`}
                  >
                    {severityLabels[painPoint.severity]}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">{painPoint.description}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      מודול: {moduleNames[painPoint.module]}
                      {painPoint.potentialHours &&
                        ` | פוטנציאל חיסכון: ${painPoint.potentialHours} שעות`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Module Completion Status */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">סטטוס מודולים</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {Object.entries(moduleNames).map(([moduleId, moduleName]) => {
              const status = getModuleStatus(moduleId);
              return (
                <div
                  key={moduleId}
                  className={`p-3 rounded-lg text-center cursor-pointer hover:shadow-md transition-all ${
                    status === 'completed'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                  onClick={() => {
                    // Find first step of this module to edit
                    const firstStep = `${moduleId}-basics`;
                    onEdit(firstStep);
                  }}
                >
                  {status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  )}
                  <p
                    className={`text-sm ${
                      status === 'completed'
                        ? 'text-green-700 font-medium'
                        : 'text-gray-600'
                    }`}
                  >
                    {moduleName}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ROI Analysis */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">ניתוח החזר השקעה</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">חיסכון שנתי צפוי</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(roiData.monthlySavings * 12)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">החזר השקעה</p>
                <p className="text-xl font-bold text-blue-600">
                  {roiData.paybackPeriod} חודשים
                </p>
              </div>
            </div>

            {roiData.breakdown && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  פירוט חיסכון:
                </p>
                <ul className="space-y-2">
                  {Object.entries(roiData.breakdown).map(
                    ([category, value]) => (
                      <li
                        key={category}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600">{category}:</span>
                        <span className="font-medium">
                          {formatCurrency(value as number)}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Top Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">המלצות מרכזיות</h3>
            <div className="space-y-3">
              {recommendations.slice(0, 5).map((rec, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {rec.description}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span
                      className={`px-2 py-1 rounded ${
                        rec.priority === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : rec.priority === 'high'
                            ? 'bg-orange-100 text-orange-700'
                            : rec.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      עדיפות:{' '}
                      {rec.priority === 'critical'
                        ? 'קריטית'
                        : rec.priority === 'high'
                          ? 'גבוהה'
                          : rec.priority === 'medium'
                            ? 'בינונית'
                            : 'נמוכה'}
                    </span>
                    <span className="text-gray-500">
                      מאמץ:{' '}
                      {rec.effort === 'low'
                        ? 'נמוך'
                        : rec.effort === 'medium'
                          ? 'בינוני'
                          : 'גבוה'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Next Steps from Planning */}
      {meeting.modules.planning?.nextSteps && (
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">צעדים הבאים</h3>
              <button
                onClick={() => onEdit('planning-nextsteps')}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="ערוך צעדים"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {meeting.modules.planning.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-900">{step.action}</p>
                    {step.deadline && (
                      <p className="text-sm text-gray-600">
                        עד:{' '}
                        {new Date(step.deadline).toLocaleDateString('he-IL')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Export Options */}
      <Card className="bg-gray-50">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">אפשרויות ייצוא</h3>
          <p className="text-sm text-gray-600 mb-4">
            הסיכום המלא זמין בדשבורד לייצוא בפורמטים שונים
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">PDF</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
              <FileText className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Excel</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
              <Download className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">JSON</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Message */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            סיום אשף הגילוי בהצלחה!
          </h3>
          <p className="text-gray-600">
            כל הנתונים נשמרו ותוכל לגשת אליהם בכל עת מהדשבורד. המערכת זיהתה{' '}
            {meeting.painPoints.length} נקודות כאב ויצרה{' '}
            {recommendations.length} המלצות מותאמות אישית.
          </p>
        </div>
      </Card>
    </div>
  );
};
