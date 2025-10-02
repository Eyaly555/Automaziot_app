import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calculator, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { useMeetingStore } from '../../../store/useMeetingStore';
import { Card } from '../../Common/Card';
import { TextField, CheckboxGroup, RadioGroup, RatingField } from '../../Common/FormFields';
import { formatCurrency } from '../../../utils/formatters';
import { calculateROI } from '../../../utils/roiCalculator';
import { ROIVisualization } from './ROIVisualization';

export const ROIModule: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateModule } = useMeetingStore();
  const moduleData = currentMeeting?.modules?.roi || {};

  // Current Costs
  const [currentManualHours, setCurrentManualHours] = useState(moduleData.currentCosts?.manualHours || '');
  const [averageHourlyCost, setAverageHourlyCost] = useState(moduleData.currentCosts?.hourlyCost || '');
  const [currentToolsCost, setCurrentToolsCost] = useState(moduleData.currentCosts?.toolsCost || '');
  const [errorCostPerMonth, setErrorCostPerMonth] = useState(moduleData.currentCosts?.errorCost || '');
  const [lostOpportunities, setLostOpportunities] = useState(moduleData.currentCosts?.lostOpportunities || '');

  // Time Savings
  const [automationPotential, setAutomationPotential] = useState(moduleData.timeSavings?.automationPotential || '');
  const [processesToAutomate, setProcessesToAutomate] = useState<string[]>(moduleData.timeSavings?.processes || []);
  const [immediateVsGradual, setImmediateVsGradual] = useState(moduleData.timeSavings?.implementation || '');

  // Investment
  const [investmentRange, setInvestmentRange] = useState(moduleData.investment?.range || '');
  const [paybackExpectation, setPaybackExpectation] = useState(moduleData.investment?.paybackExpectation || '');
  const [budgetAvailable, setBudgetAvailable] = useState(moduleData.investment?.budgetAvailable || '');

  // Success Metrics
  const [successMetrics, setSuccessMetrics] = useState<string[]>(moduleData.successMetrics || []);
  const [measurementFrequency, setMeasurementFrequency] = useState(moduleData.measurementFrequency || '');

  // Calculate live ROI
  const roiData = calculateROI(currentMeeting || {} as any);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateModule('roi', {
        currentCosts: {
          manualHours: currentManualHours,
          hourlyCost: averageHourlyCost,
          toolsCost: currentToolsCost,
          errorCost: errorCostPerMonth,
          lostOpportunities
        },
        timeSavings: {
          automationPotential,
          processes: processesToAutomate,
          implementation: immediateVsGradual
        },
        investment: {
          range: investmentRange,
          paybackExpectation,
          budgetAvailable
        },
        successMetrics,
        measurementFrequency
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentManualHours, averageHourlyCost, currentToolsCost, errorCostPerMonth,
      lostOpportunities, automationPotential, processesToAutomate, immediateVsGradual,
      investmentRange, paybackExpectation, budgetAvailable, successMetrics, measurementFrequency]);

  // Calculate current monthly cost
  const calculateCurrentCost = () => {
    const hours = parseFloat(currentManualHours) || 0;
    const hourly = parseFloat(averageHourlyCost) || 0;
    const tools = parseFloat(currentToolsCost) || 0;
    const errors = parseFloat(errorCostPerMonth) || 0;
    const lost = parseFloat(lostOpportunities) || 0;

    return (hours * hourly * 4) + tools + errors + lost; // Hours * 4 for monthly
  };

  const currentMonthlyCost = calculateCurrentCost();

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
              <h1 className="text-xl font-semibold">💰 ROI וכימות</h1>
            </div>
            <button
              onClick={() => navigate('/module/planning')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              המשך למודול הבא
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Live ROI Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">סיכום ROI מחושב</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{roiData.hoursSavedMonthly}</div>
              <div className="text-sm text-gray-600">שעות חסכון לחודש</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(roiData.moneySavedMonthly)}
              </div>
              <div className="text-sm text-gray-600">חיסכון חודשי</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {roiData.paybackPeriod} חודשים
              </div>
              <div className="text-sm text-gray-600">זמן החזר השקעה</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <Calculator className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {roiData.automationPotential}%
              </div>
              <div className="text-sm text-gray-600">פוטנציאל אוטומציה</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Current Costs Analysis */}
          <Card title="8.1 ניתוח עלויות נוכחיות"
            subtitle="כמה עולים התהליכים הידניים היום?">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="שעות עבודה ידנית בשבוע"
                  value={currentManualHours}
                  onChange={setCurrentManualHours}
                  type="number"
                  placeholder="לדוגמה: 40"
                />
                <TextField
                  label="עלות שעת עבודה ממוצעת (₪)"
                  value={averageHourlyCost}
                  onChange={setAverageHourlyCost}
                  type="number"
                  placeholder="לדוגמה: 100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="עלות כלים וסופטוור חודשית (₪)"
                  value={currentToolsCost}
                  onChange={setCurrentToolsCost}
                  type="number"
                  placeholder="לדוגמה: 5000"
                />
                <TextField
                  label="עלות טעויות וטיפול בהן לחודש (₪)"
                  value={errorCostPerMonth}
                  onChange={setErrorCostPerMonth}
                  type="number"
                  placeholder="לדוגמה: 2000"
                />
              </div>

              <TextField
                label="הערכת הפסדים מהחמצת הזדמנויות לחודש (₪)"
                value={lostOpportunities}
                onChange={setLostOpportunities}
                type="number"
                placeholder="לקוחות שלא טופלו, עסקאות שלא נסגרו..."
              />

              {currentMonthlyCost > 0 && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-red-800 font-medium">
                    עלות חודשית נוכחית: {formatCurrency(currentMonthlyCost)}
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    עלות שנתית: {formatCurrency(currentMonthlyCost * 12)}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Time Savings Potential */}
          <Card title="8.2 פוטנציאל חיסכון בזמן"
            subtitle="כמה זמן אפשר לחסוך עם אוטומציה?">
            <div className="space-y-6">
              <RadioGroup
                label="אחוז פוטנציאל אוטומציה"
                value={automationPotential}
                onChange={setAutomationPotential}
                options={[
                  { value: '80-100', label: '80-100% - רוב התהליכים ניתנים לאוטומציה' },
                  { value: '60-80', label: '60-80% - חלק ניכר ניתן לאוטומציה' },
                  { value: '40-60', label: '40-60% - כמחצית מהתהליכים' },
                  { value: '20-40', label: '20-40% - חלק קטן מהתהליכים' },
                  { value: '0-20', label: '0-20% - מעט מאוד ניתן לאוטומציה' }
                ]}
              />

              <CheckboxGroup
                label="תהליכים עיקריים לאוטומציה"
                options={[
                  { value: 'lead_management', label: 'ניהול וטיפול בלידים' },
                  { value: 'customer_service', label: 'שירות לקוחות' },
                  { value: 'data_entry', label: 'הזנת נתונים' },
                  { value: 'reporting', label: 'הפקת דוחות' },
                  { value: 'invoicing', label: 'הפקת חשבוניות' },
                  { value: 'email_marketing', label: 'שיווק באימייל' },
                  { value: 'appointment_scheduling', label: 'תיאום פגישות' },
                  { value: 'document_processing', label: 'עיבוד מסמכים' },
                  { value: 'inventory_management', label: 'ניהול מלאי' },
                  { value: 'hr_processes', label: 'תהליכי HR' }
                ]}
                values={processesToAutomate}
                onChange={setProcessesToAutomate}
                columns={2}
              />

              <RadioGroup
                label="קצב יישום האוטומציה"
                value={immediateVsGradual}
                onChange={setImmediateVsGradual}
                options={[
                  { value: 'immediate', label: 'מיידי - תוך חודש' },
                  { value: 'quick', label: 'מהיר - תוך 3 חודשים' },
                  { value: 'moderate', label: 'מתון - תוך 6 חודשים' },
                  { value: 'gradual', label: 'הדרגתי - תוך שנה' }
                ]}
              />
            </div>
          </Card>

          {/* Investment & Payback */}
          <Card title="8.3 השקעה והחזר"
            subtitle="כמה מוכנים להשקיע ומה הציפיות?">
            <div className="space-y-6">
              <RadioGroup
                label="טווח השקעה מתוכנן"
                value={investmentRange}
                onChange={setInvestmentRange}
                options={[
                  { value: 'under_10k', label: 'עד 10,000 ₪' },
                  { value: '10k_50k', label: '10,000 - 50,000 ₪' },
                  { value: '50k_100k', label: '50,000 - 100,000 ₪' },
                  { value: '100k_250k', label: '100,000 - 250,000 ₪' },
                  { value: 'over_250k', label: 'מעל 250,000 ₪' }
                ]}
              />

              <RadioGroup
                label="ציפייה לזמן החזר השקעה"
                value={paybackExpectation}
                onChange={setPaybackExpectation}
                options={[
                  { value: '3_months', label: 'עד 3 חודשים' },
                  { value: '6_months', label: 'עד 6 חודשים' },
                  { value: '12_months', label: 'עד שנה' },
                  { value: '18_months', label: 'עד שנה וחצי' },
                  { value: '24_months', label: 'עד שנתיים' },
                  { value: 'over_24', label: 'מעל שנתיים' }
                ]}
              />

              <RadioGroup
                label="זמינות תקציב"
                value={budgetAvailable}
                onChange={setBudgetAvailable}
                options={[
                  { value: 'immediate', label: 'זמין מיידית' },
                  { value: 'next_quarter', label: 'ברבעון הבא' },
                  { value: 'next_year', label: 'בשנה הבאה' },
                  { value: 'needs_approval', label: 'דורש אישור מיוחד' },
                  { value: 'not_available', label: 'אין תקציב כרגע' }
                ]}
              />
            </div>
          </Card>

          {/* Success Metrics */}
          <Card title="8.4 מדדי הצלחה"
            subtitle="איך נמדוד את ההצלחה?">
            <div className="space-y-6">
              <CheckboxGroup
                label="מדדים לבחינת הצלחה"
                options={[
                  { value: 'time_saved', label: 'חיסכון בזמן' },
                  { value: 'cost_reduction', label: 'הפחתת עלויות' },
                  { value: 'revenue_increase', label: 'גידול בהכנסות' },
                  { value: 'customer_satisfaction', label: 'שביעות רצון לקוחות' },
                  { value: 'employee_satisfaction', label: 'שביעות רצון עובדים' },
                  { value: 'error_reduction', label: 'הפחתת טעויות' },
                  { value: 'process_speed', label: 'מהירות תהליכים' },
                  { value: 'lead_conversion', label: 'המרת לידים' },
                  { value: 'response_time', label: 'זמן תגובה' },
                  { value: 'data_quality', label: 'איכות נתונים' }
                ]}
                values={successMetrics}
                onChange={setSuccessMetrics}
                columns={2}
              />

              <RadioGroup
                label="תדירות מדידה"
                value={measurementFrequency}
                onChange={setMeasurementFrequency}
                options={[
                  { value: 'daily', label: 'יומי' },
                  { value: 'weekly', label: 'שבועי' },
                  { value: 'monthly', label: 'חודשי' },
                  { value: 'quarterly', label: 'רבעוני' },
                  { value: 'annually', label: 'שנתי' }
                ]}
              />

              {currentMonthlyCost > 50000 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800 font-medium">
                    🎯 פוטנציאל ROI גבוה מאוד
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    עם עלויות נוכחיות גבוהות, האוטומציה יכולה להחזיר את ההשקעה במהירות
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Advanced ROI Visualizations - Phase 4 */}
          {roiData.scenarios && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 ניתוח ROI מתקדם</h2>
              <ROIVisualization
                scenarios={roiData.scenarios}
                implementationCosts={{
                  initialSetup: roiData.implementationCosts * 0.3,
                  toolsAndLicenses: roiData.implementationCosts * 0.1,
                  developerTime: roiData.implementationCosts * 0.5,
                  training: roiData.implementationCosts * 0.1,
                  total: roiData.implementationCosts
                }}
                ongoingCosts={{
                  monthlySubscriptions: roiData.ongoingMonthlyCosts * 0.5,
                  maintenanceHours: roiData.ongoingMonthlyCosts * 0.4,
                  supportCosts: roiData.ongoingMonthlyCosts * 0.1,
                  total: roiData.ongoingMonthlyCosts
                }}
                netSavings={{
                  month12: roiData.netSavings12Month,
                  month24: roiData.netSavings24Month,
                  month36: roiData.netSavings36Month
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};