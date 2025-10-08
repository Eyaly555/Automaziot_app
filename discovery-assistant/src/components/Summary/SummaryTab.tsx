import React from 'react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { calculateROI } from '../../utils/roiCalculator';
import { getSmartRecommendations } from '../../utils/smartRecommendationsEngine';
import {
  MeetingPhase,
  PainPoint,
  Meeting
} from '../../types';
import {
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Layers,
  GitBranch,
  Code,
  Activity,
  Award,
  Calendar,
  FileText,
  Zap,
  DollarSign
} from 'lucide-react';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get Hebrew/English label for a phase
 */
function getPhaseLabel(phase: MeetingPhase): string {
  const labels: Record<MeetingPhase, string> = {
    discovery: 'גילוי',
    implementation_spec: 'מפרט טכני',
    development: 'Development',
    completed: 'הושלם'
  };
  return labels[phase] || 'לא ידוע';
}

/**
 * Get description text for a phase
 */
function getPhaseSummaryDescription(phase: MeetingPhase): string {
  const descriptions: Record<MeetingPhase, string> = {
    discovery: 'סיכום שלב הגילוי - איסוף דרישות עסקיות וניתוח צרכים',
    implementation_spec: 'סיכום מפרט הטכני - פירוט מערכות, אינטגרציות וקריטריונים',
    development: 'Development Summary - Sprint progress and task tracking',
    completed: 'סיכום פרויקט מושלם - תוצאות והישגים'
  };
  return descriptions[phase] || '';
}

/**
 * Get status badge color based on phase
 */
function getPhaseVariant(phase: MeetingPhase): string {
  const variants: Record<MeetingPhase, string> = {
    discovery: 'bg-blue-100 text-blue-800',
    implementation_spec: 'bg-purple-100 text-purple-800',
    development: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800'
  };
  return variants[phase] || 'bg-gray-100 text-gray-800';
}

/**
 * Calculate module completion percentage
 */
function calculateModuleCompletion(moduleData: any): number {
  if (!moduleData || typeof moduleData !== 'object') return 0;

  const fields = Object.keys(moduleData).filter(key =>
    key !== 'painPoints' && key !== 'customFields'
  );

  if (fields.length === 0) return 0;

  const filledFields = fields.filter(key => {
    const value = moduleData[key];
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });

  return Math.round((filledFields.length / fields.length) * 100);
}

/**
 * Group pain points by severity
 */
function groupPainPointsBySeverity(painPoints: PainPoint[]) {
  return {
    critical: painPoints.filter(p => p.severity === 'critical').length,
    high: painPoints.filter(p => p.severity === 'high').length,
    medium: painPoints.filter(p => p.severity === 'medium').length,
    low: painPoints.filter(p => p.severity === 'low').length
  };
}

/**
 * Calculate total potential savings from pain points
 */
function calculatePotentialSavings(painPoints: PainPoint[]): number {
  return painPoints.reduce((sum, p) => sum + (p.potentialSaving || 0), 0);
}

/**
 * Calculate automation opportunities from meeting data
 */
function calculateAutomationOpportunities(meeting: Meeting) {
  try {
    const recommendations = getSmartRecommendations(meeting);
    return {
      quickWins: recommendations.filter(r => r.quickWin).length,
      highImpact: recommendations.filter(r => r.impactScore >= 8).length,
      integrations: recommendations.filter(r => r.category === 'integration').length,
      total: recommendations.length
    };
  } catch (error) {
    console.error('Error calculating automation opportunities:', error);
    return {
      quickWins: 0,
      highImpact: 0,
      integrations: 0,
      total: 0
    };
  }
}

// ============================================================================
// CARD COMPONENTS
// ============================================================================

interface SummaryCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

function SummaryCard({ title, children, icon }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-semibold text-blue-600">{title}</h2>
      </div>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

function StatCard({ label, value, icon, color = 'text-blue-600' }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      {icon && <div className={`mb-2 ${color}`}>{icon}</div>}
      <span className="text-gray-600 text-sm block">{label}</span>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

// ============================================================================
// PHASE-SPECIFIC SUMMARY COMPONENTS
// ============================================================================

interface PhaseSummaryProps {
  meeting: Meeting;
}

/**
 * Discovery Phase Summary
 */
function DiscoverySummary({ meeting }: PhaseSummaryProps) {
  const roiData = calculateROI(meeting);
  const painPoints = meeting.painPoints || [];
  const painPointGroups = groupPainPointsBySeverity(painPoints);
  const potentialSavings = calculatePotentialSavings(painPoints);
  const automation = calculateAutomationOpportunities(meeting);

  // Calculate module completion
  const moduleCompletionData = [
    { name: 'סקירה כללית', completion: calculateModuleCompletion(meeting.modules.overview) },
    { name: 'לידים ומכירות', completion: calculateModuleCompletion(meeting.modules.leadsAndSales) },
    { name: 'שירות לקוחות', completion: calculateModuleCompletion(meeting.modules.customerService) },
    { name: 'תפעול', completion: calculateModuleCompletion(meeting.modules.operations) },
    { name: 'דוחות', completion: calculateModuleCompletion(meeting.modules.reporting) },
    { name: 'סוכני AI', completion: calculateModuleCompletion(meeting.modules.aiAgents) },
    { name: 'מערכות', completion: calculateModuleCompletion(meeting.modules.systems) },
    { name: 'ROI', completion: calculateModuleCompletion(meeting.modules.roi) }
  ];

  return (
    <div className="space-y-6">
      {/* Business Overview */}
      <SummaryCard title="סקירה עסקית" icon={<Target size={24} className="text-blue-600" />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {meeting.modules.overview?.businessType && (
            <div>
              <span className="text-gray-600 text-sm">סוג עסק:</span>
              <p className="font-medium">{meeting.modules.overview.businessType}</p>
            </div>
          )}
          {meeting.modules.overview?.employees && (
            <div>
              <span className="text-gray-600 text-sm">עובדים:</span>
              <p className="font-medium">{meeting.modules.overview.employees}</p>
            </div>
          )}
          {meeting.modules.overview?.mainChallenge && (
            <div className="col-span-2">
              <span className="text-gray-600 text-sm">אתגר עיקרי:</span>
              <p className="font-medium">{meeting.modules.overview.mainChallenge}</p>
            </div>
          )}
          {meeting.modules.overview?.mainGoals && meeting.modules.overview.mainGoals.length > 0 && (
            <div className="col-span-2">
              <span className="text-gray-600 text-sm">מטרות:</span>
              <ul className="list-disc list-inside mt-1">
                {meeting.modules.overview.mainGoals.map((goal, idx) => (
                  <li key={idx} className="text-sm">{goal}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </SummaryCard>

      {/* Module Completion Grid */}
      <SummaryCard title="התקדמות מודולים" icon={<Layers size={24} className="text-blue-600" />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {moduleCompletionData.map((module, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{module.name}</span>
                <span className="text-xs text-gray-500">{module.completion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    module.completion === 100 ? 'bg-green-500' :
                    module.completion >= 50 ? 'bg-blue-500' :
                    module.completion > 0 ? 'bg-yellow-500' :
                    'bg-gray-300'
                  }`}
                  style={{ width: `${module.completion}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </SummaryCard>

      {/* Pain Points Section */}
      {painPoints.length > 0 && (
        <SummaryCard title="נקודות כאב" icon={<AlertCircle size={24} className="text-red-600" />}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <StatCard
              label="סה״כ נקודות כאב"
              value={painPoints.length}
              icon={<AlertCircle size={20} />}
              color="text-red-600"
            />
            <StatCard
              label="קריטי"
              value={painPointGroups.critical}
              color="text-red-700"
            />
            <StatCard
              label="גבוה"
              value={painPointGroups.high}
              color="text-orange-600"
            />
            <StatCard
              label="בינוני"
              value={painPointGroups.medium}
              color="text-yellow-600"
            />
            <StatCard
              label="חיסכון פוטנציאלי"
              value={`₪${potentialSavings.toLocaleString('he-IL')}`}
              icon={<DollarSign size={20} />}
              color="text-green-600"
            />
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {painPoints.slice(0, 5).map((point, idx) => (
              <div key={point.id || idx} className="border-r-4 border-red-500 pr-3 py-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-800">{point.description}</p>
                  <span className={`px-2 py-1 text-xs rounded ${
                    point.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    point.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                    point.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {point.severity === 'critical' ? 'קריטי' :
                     point.severity === 'high' ? 'גבוה' :
                     point.severity === 'medium' ? 'בינוני' : 'נמוך'}
                  </span>
                </div>
              </div>
            ))}
            {painPoints.length > 5 && (
              <p className="text-sm text-gray-500 text-center mt-2">
                ועוד {painPoints.length - 5} נקודות כאב נוספות...
              </p>
            )}
          </div>
        </SummaryCard>
      )}

      {/* Automation Opportunities */}
      {automation.total > 0 && (
        <SummaryCard title="הזדמנויות אוטומציה" icon={<Zap size={24} className="text-yellow-600" />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Quick Wins"
              value={automation.quickWins}
              icon={<Zap size={20} />}
              color="text-yellow-600"
            />
            <StatCard
              label="השפעה גבוהה"
              value={automation.highImpact}
              icon={<TrendingUp size={20} />}
              color="text-green-600"
            />
            <StatCard
              label="אינטגרציות"
              value={automation.integrations}
              icon={<GitBranch size={20} />}
              color="text-blue-600"
            />
            <StatCard
              label="סה״כ המלצות"
              value={automation.total}
              icon={<Target size={20} />}
              color="text-purple-600"
            />
          </div>
        </SummaryCard>
      )}

      {/* ROI Summary */}
      {roiData && roiData.totalMonthlySavings > 0 && (
        <SummaryCard title="תחזית ROI" icon={<TrendingUp size={24} className="text-green-600" />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roiData.totalMonthlySavings > 0 && (
              <StatCard
                label="חיסכון חודשי"
                value={`₪${roiData.totalMonthlySavings.toLocaleString('he-IL')}`}
                icon={<DollarSign size={20} />}
                color="text-green-600"
              />
            )}
            {roiData.hoursSavedMonthly > 0 && (
              <StatCard
                label="שעות נחסכות"
                value={roiData.hoursSavedMonthly}
                icon={<Clock size={20} />}
                color="text-blue-600"
              />
            )}
            {roiData.roi12Month > 0 && (
              <StatCard
                label="ROI 12 חודשים"
                value={`${roiData.roi12Month}%`}
                icon={<TrendingUp size={20} />}
                color="text-purple-600"
              />
            )}
            {roiData.paybackPeriod > 0 && (
              <StatCard
                label="זמן החזר"
                value={`${roiData.paybackPeriod} חודשים`}
                icon={<Calendar size={20} />}
                color="text-orange-600"
              />
            )}
          </div>
        </SummaryCard>
      )}
    </div>
  );
}

/**
 * Implementation Spec Phase Summary
 */
function ImplementationSpecSummary({ meeting }: PhaseSummaryProps) {
  const spec = meeting.implementationSpec;

  const systemsCount = spec?.systems?.length || 0;
  const integrationsCount = spec?.integrations?.length || 0;
  const aiAgentsCount = spec?.aiAgents?.length || 0;
  const totalEstimatedHours = spec?.totalEstimatedHours || 0;
  const completionPercentage = spec?.completionPercentage || 0;

  // Count acceptance criteria
  const acceptanceCriteria = spec?.acceptanceCriteria;
  const functionalCount = acceptanceCriteria?.functional?.length || 0;
  const performanceCount = acceptanceCriteria?.performance?.length || 0;
  const securityCount = acceptanceCriteria?.security?.length || 0;
  const usabilityCount = acceptanceCriteria?.usability?.length || 0;
  const totalCriteria = functionalCount + performanceCount + securityCount + usabilityCount;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <SummaryCard title="סקירת מפרט טכני" icon={<FileText size={24} className="text-purple-600" />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="מערכות מתועדות"
            value={systemsCount}
            icon={<Layers size={20} />}
            color="text-blue-600"
          />
          <StatCard
            label="אינטגרציות מתוכננות"
            value={integrationsCount}
            icon={<GitBranch size={20} />}
            color="text-green-600"
          />
          <StatCard
            label="סוכני AI"
            value={aiAgentsCount}
            icon={<Zap size={20} />}
            color="text-yellow-600"
          />
          <StatCard
            label="שעות אומדן"
            value={totalEstimatedHours}
            icon={<Clock size={20} />}
            color="text-purple-600"
          />
        </div>
      </SummaryCard>

      {/* Completion Progress */}
      <SummaryCard title="התקדמות איסוף דרישות" icon={<Activity size={24} className="text-blue-600" />}>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">השלמה כוללת</span>
            <span className="text-sm font-medium">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-purple-600 h-4 rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
        {completionPercentage < 100 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 flex items-start gap-2">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              יש להשלים את איסוף הדרישות לפני מעבר לשלב הפיתוח
            </p>
          </div>
        )}
      </SummaryCard>

      {/* Systems Inventory */}
      {systemsCount > 0 && (
        <SummaryCard title="מערכות" icon={<Layers size={24} className="text-blue-600" />}>
          <div className="space-y-2">
            {spec?.systems?.slice(0, 5).map((system) => (
              <div key={system.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{system.systemName}</p>
                  <p className="text-sm text-gray-600">
                    {system.modules?.length || 0} מודולים • {system.authentication?.method}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {system.dataMigration?.required && (
                    <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">
                      נדרשת העברת נתונים
                    </span>
                  )}
                  {system.authentication?.credentialsProvided ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <AlertCircle size={16} className="text-yellow-600" />
                  )}
                </div>
              </div>
            ))}
            {systemsCount > 5 && (
              <p className="text-sm text-gray-500 text-center mt-2">
                ועוד {systemsCount - 5} מערכות נוספות...
              </p>
            )}
          </div>
        </SummaryCard>
      )}

      {/* Integration Flows */}
      {integrationsCount > 0 && (
        <SummaryCard title="זרימות אינטגרציה" icon={<GitBranch size={24} className="text-green-600" />}>
          <div className="space-y-2">
            {spec?.integrations?.slice(0, 5).map((integration) => (
              <div key={integration.id} className="flex items-center gap-3 border-b pb-2">
                <GitBranch size={16} className="text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{integration.name}</p>
                  <p className="text-xs text-gray-600">
                    {integration.sourceSystem} → {integration.targetSystem}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                  {integration.frequency}
                </span>
              </div>
            ))}
            {integrationsCount > 5 && (
              <p className="text-sm text-gray-500 text-center mt-2">
                ועוד {integrationsCount - 5} אינטגרציות נוספות...
              </p>
            )}
          </div>
        </SummaryCard>
      )}

      {/* Acceptance Criteria */}
      {totalCriteria > 0 && (
        <SummaryCard title="קריטריוני קבלה" icon={<CheckCircle size={24} className="text-green-600" />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="פונקציונלי"
              value={functionalCount}
              color="text-blue-600"
            />
            <StatCard
              label="ביצועים"
              value={performanceCount}
              color="text-green-600"
            />
            <StatCard
              label="אבטחה"
              value={securityCount}
              color="text-red-600"
            />
            <StatCard
              label="שימושיות"
              value={usabilityCount}
              color="text-purple-600"
            />
          </div>
        </SummaryCard>
      )}

      {/* Empty State */}
      {systemsCount === 0 && integrationsCount === 0 && aiAgentsCount === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">טרם נוסף מפרט טכני</h3>
          <p className="text-gray-600 mb-4">
            התחל בתיעוד המערכות, אינטגרציות וסוכני AI
          </p>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            עבור למפרט טכני
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Development Phase Summary
 */
function DevelopmentSummary({ meeting }: PhaseSummaryProps) {
  const tracking = meeting.developmentTracking;

  const tasks = tracking?.tasks || [];
  const sprints = tracking?.sprints || [];
  const blockers = tracking?.blockers || [];
  const velocity = tracking?.velocity;

  // Task breakdown
  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    in_review: tasks.filter(t => t.status === 'in_review').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    done: tasks.filter(t => t.status === 'done').length
  };

  const totalTasks = tasks.length;
  const completedTasks = tasksByStatus.done;
  const overallCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Current sprint
  const currentSprint = sprints.find(s => s.status === 'active');
  const sprintProgress = currentSprint?.progressPercentage || 0;

  // Blocker stats
  const activeBlockers = blockers?.filter(b => b.status === 'active').length || 0;
  const criticalBlockers = blockers?.filter(b => b.status === 'active' && b.severity === 'critical').length || 0;

  return (
    <div className="space-y-6" dir="ltr">
      {/* Current Sprint */}
      {currentSprint && (
        <SummaryCard title="Current Sprint" icon={<Activity size={24} className="text-green-600" />}>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{currentSprint.name}</span>
              <span className="text-sm text-gray-600">{sprintProgress}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-600 h-4 rounded-full transition-all"
                style={{ width: `${sprintProgress}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Total Tasks"
              value={currentSprint.totalTasks}
              icon={<CheckCircle size={20} />}
              color="text-blue-600"
            />
            <StatCard
              label="Completed"
              value={currentSprint.completedTasks}
              icon={<CheckCircle size={20} />}
              color="text-green-600"
            />
            <StatCard
              label="Estimated Hours"
              value={currentSprint.totalEstimatedHours}
              icon={<Clock size={20} />}
              color="text-purple-600"
            />
          </div>
        </SummaryCard>
      )}

      {/* Overall Progress */}
      <SummaryCard title="Overall Progress" icon={<TrendingUp size={24} className="text-blue-600" />}>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Project Completion</span>
            <span className="text-sm font-medium">{overallCompletion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all"
              style={{ width: `${overallCompletion}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard
            label="Total Tasks"
            value={totalTasks}
            color="text-gray-600"
          />
          <StatCard
            label="To Do"
            value={tasksByStatus.todo}
            color="text-gray-600"
          />
          <StatCard
            label="In Progress"
            value={tasksByStatus.in_progress}
            color="text-blue-600"
          />
          <StatCard
            label="Blocked"
            value={tasksByStatus.blocked}
            color="text-red-600"
          />
          <StatCard
            label="Done"
            value={tasksByStatus.done}
            color="text-green-600"
          />
        </div>
      </SummaryCard>

      {/* Velocity Metrics */}
      {velocity && (
        <SummaryCard title="Velocity Metrics" icon={<Activity size={24} className="text-purple-600" />}>
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Average Velocity"
              value={`${velocity.averageVelocity || 0} tasks/sprint`}
              icon={<TrendingUp size={20} />}
              color="text-purple-600"
            />
            <StatCard
              label="Completed Sprints"
              value={velocity.completedSprints || 0}
              icon={<CheckCircle size={20} />}
              color="text-green-600"
            />
            <StatCard
              label="Total Tasks Completed"
              value={velocity.totalTasksCompleted || 0}
              icon={<Award size={20} />}
              color="text-blue-600"
            />
          </div>
        </SummaryCard>
      )}

      {/* Blockers */}
      {activeBlockers > 0 && (
        <SummaryCard title="Active Blockers" icon={<AlertCircle size={24} className="text-red-600" />}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <StatCard
              label="Total Blockers"
              value={activeBlockers}
              icon={<AlertCircle size={20} />}
              color="text-red-600"
            />
            <StatCard
              label="Critical"
              value={criticalBlockers}
              icon={<AlertCircle size={20} />}
              color="text-red-700"
            />
          </div>
          <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">
              There are {activeBlockers} active blockers requiring immediate attention
            </p>
          </div>
        </SummaryCard>
      )}

      {/* Empty State */}
      {totalTasks === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Code size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Development Tasks Yet</h3>
          <p className="text-gray-600 mb-4">
            Generate tasks from implementation specs to begin development tracking
          </p>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Generate Tasks
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Completed Phase Summary
 */
function CompletedSummary({ meeting }: PhaseSummaryProps) {
  const tracking = meeting.developmentTracking;
  const spec = meeting.implementationSpec;

  const tasks = tracking?.tasks || [];
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

  // Timeline
  const phaseHistory = meeting.phaseHistory || [];
  const discoveryStart = phaseHistory.find(p => p.toPhase === 'discovery')?.timestamp;
  const specStart = phaseHistory.find(p => p.toPhase === 'implementation_spec')?.timestamp;
  const devStart = phaseHistory.find(p => p.toPhase === 'development')?.timestamp;
  const completedDate = phaseHistory.find(p => p.toPhase === 'completed')?.timestamp;

  const totalDuration = discoveryStart && completedDate
    ? Math.round((new Date(completedDate).getTime() - new Date(discoveryStart).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Deliverables
  const systemsImplemented = spec?.systems?.length || 0;
  const integrationsCompleted = spec?.integrations?.length || 0;
  const aiAgentsDeployed = spec?.aiAgents?.length || 0;

  return (
    <div className="space-y-6">
      {/* Project Timeline */}
      <SummaryCard title="ציר זמן הפרויקט" icon={<Calendar size={24} className="text-blue-600" />}>
        <div className="space-y-3">
          {discoveryStart && (
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <div>
                <p className="font-medium">גילוי התחיל</p>
                <p className="text-sm text-gray-600">
                  {new Date(discoveryStart).toLocaleDateString('he-IL')}
                </p>
              </div>
            </div>
          )}
          {specStart && (
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <div>
                <p className="font-medium">מפרט טכני התחיל</p>
                <p className="text-sm text-gray-600">
                  {new Date(specStart).toLocaleDateString('he-IL')}
                </p>
              </div>
            </div>
          )}
          {devStart && (
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <div>
                <p className="font-medium">פיתוח התחיל</p>
                <p className="text-sm text-gray-600">
                  {new Date(devStart).toLocaleDateString('he-IL')}
                </p>
              </div>
            </div>
          )}
          {completedDate && (
            <div className="flex items-center gap-3">
              <Award size={20} className="text-purple-600" />
              <div>
                <p className="font-medium">הושלם</p>
                <p className="text-sm text-gray-600">
                  {new Date(completedDate).toLocaleDateString('he-IL')}
                </p>
              </div>
            </div>
          )}
        </div>
        {totalDuration > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">משך כולל:</span> {totalDuration} ימים
            </p>
          </div>
        )}
      </SummaryCard>

      {/* Deliverables */}
      <SummaryCard title="מסירות" icon={<Award size={24} className="text-green-600" />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="מערכות"
            value={systemsImplemented}
            icon={<Layers size={20} />}
            color="text-blue-600"
          />
          <StatCard
            label="אינטגרציות"
            value={integrationsCompleted}
            icon={<GitBranch size={20} />}
            color="text-green-600"
          />
          <StatCard
            label="סוכני AI"
            value={aiAgentsDeployed}
            icon={<Zap size={20} />}
            color="text-yellow-600"
          />
          <StatCard
            label="משימות הושלמו"
            value={completedTasks}
            icon={<CheckCircle size={20} />}
            color="text-purple-600"
          />
        </div>
      </SummaryCard>

      {/* Final Metrics */}
      <SummaryCard title="מדדים סופיים" icon={<TrendingUp size={24} className="text-purple-600" />}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            label="סה״כ משימות"
            value={tasks.length}
            icon={<CheckCircle size={20} />}
            color="text-blue-600"
          />
          <StatCard
            label="שעות שהושקעו"
            value={totalHours}
            icon={<Clock size={20} />}
            color="text-green-600"
          />
          <StatCard
            label="אחוז השלמה"
            value={`${tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%`}
            icon={<Award size={20} />}
            color="text-purple-600"
          />
        </div>
      </SummaryCard>

      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <Award size={48} className="text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-800 mb-2">
          פרויקט הושלם בהצלחה!
        </h3>
        <p className="text-green-700">
          כל המשימות הושלמו והפרויקט נמסר ללקוח
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN SUMMARY TAB COMPONENT
// ============================================================================

export function SummaryTab() {
  const { currentMeeting } = useMeetingStore();

  if (!currentMeeting) {
    return (
      <div className="p-6 text-center">
        <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">לא נבחרה פגישה</p>
      </div>
    );
  }

  const currentPhase = currentMeeting.phase || 'discovery';
  const isEnglish = currentPhase === 'development';

  return (
    <div dir={isEnglish ? 'ltr' : 'rtl'} className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEnglish ? 'Project Summary' : `סיכום ${getPhaseLabel(currentPhase)}`}
            </h1>
            <p className="text-gray-600 mt-2">
              {getPhaseSummaryDescription(currentPhase)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPhaseVariant(currentPhase)}`}>
              {getPhaseLabel(currentPhase)}
            </span>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download size={16} />
              {isEnglish ? 'Export' : 'ייצוא'}
            </button>
          </div>
        </div>
      </div>

      {/* Phase-Specific Content */}
      {currentPhase === 'discovery' && <DiscoverySummary meeting={currentMeeting} />}
      {currentPhase === 'implementation_spec' && <ImplementationSpecSummary meeting={currentMeeting} />}
      {currentPhase === 'development' && <DevelopmentSummary meeting={currentMeeting} />}
      {currentPhase === 'completed' && <CompletedSummary meeting={currentMeeting} />}

      {/* Client Info Footer */}
      {currentMeeting.zohoIntegration && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className={`text-center text-sm text-gray-500 ${isEnglish ? 'text-left' : 'text-right'}`}>
            <p>
              {isEnglish ? 'Synced with' : 'מסונכרן עם'} Zoho CRM - Record ID: {currentMeeting.zohoIntegration.recordId}
            </p>
            {currentMeeting.zohoIntegration.lastSyncTime && (
              <p>
                {isEnglish ? 'Last updated:' : 'עדכון אחרון:'}{' '}
                {new Date(currentMeeting.zohoIntegration.lastSyncTime).toLocaleString(isEnglish ? 'en-US' : 'he-IL')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
