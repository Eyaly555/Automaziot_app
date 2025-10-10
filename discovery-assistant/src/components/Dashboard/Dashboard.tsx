import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Timer,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  Play,
  Pause,
  RefreshCw,
  Sparkles,
  X,
  Wand2,
  ClipboardList,
  Code,
  Users,
  Lock,
  Info,
  RotateCcw,
  Database
} from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { formatTime, formatCurrency, formatDate } from '../../utils/formatters';
import { calculateROI } from '../../utils/roiCalculator';
import { Button, Card, Badge, ProgressBar } from '../Base';
import { ModuleProgressCard } from '../Modules/ModuleProgressCard';
import jsPDF from 'jspdf';
import { getSmartRecommendations } from '../../utils/smartRecommendationsEngine';
import { NextStepsGenerator } from '../NextSteps/NextStepsGenerator';
import { ExportMenu } from '../Common/ExportMenu';
import { ClientProgressSummary } from './ClientProgressSummary';
import { calculateClientProgressSummary } from '../../utils/dashboardHelpers';
import { ResetMeetingModal } from '../Common/Modals/ResetMeetingModal';
import { RestoreBackupMenu } from '../Common/Modals/RestoreBackupMenu';

interface ModuleConfig {
  id: string;
  name: string;
  icon: string;
  subModules?: number;
  description?: string;
}

const modules: ModuleConfig[] = [
  { id: 'overview', name: 'סקירה כללית', icon: '1️⃣', subModules: 0, description: 'מידע בסיסי על העסק, תחומי עניין ומקורות לידים' },
  { id: 'essentialDetails', name: 'איפיון ממוקד', icon: '⭐', subModules: 0, description: 'שאלות ממוקדות בהתאם לתחומי העניין שבחרת' },
  { id: 'leadsAndSales', name: 'לידים ומכירות', icon: '2️⃣', subModules: 5, description: 'מקורות לידים, תהליך מכירה, זמני תגובה וניהול אפשרויות' },
  { id: 'customerService', name: 'שירות לקוחות', icon: '3️⃣', subModules: 6, description: 'ערוצי תמיכה, זמני תגובה, אונבורדינג ותקשורת פרואקטיבית' },
  { id: 'operations', name: 'תפעול פנימי', icon: '4️⃣', subModules: 6, description: 'ניהול מלאי, ספקים, תהליכים ובקרת איכות' },
  { id: 'reporting', name: 'דוחות והתראות', icon: '5️⃣', subModules: 3, description: 'דוחות נוכחיים, כלי BI, מקורות נתונים ותהליכי החלטה' },
  { id: 'aiAgents', name: 'סוכני AI', icon: '6️⃣', subModules: 3, description: 'מקרי שימוש ב-AI במכירות, שירות ותפעול' },
  { id: 'systems', name: 'מערכות וטכנולוגיה', icon: '7️⃣', subModules: 0, description: 'מלאי מערכות נוכחיות, אינטגרציות וצרכים טכנולוגיים' },
  { id: 'roi', name: 'ROI וכימות', icon: '8️⃣', subModules: 0, description: 'ניתוח עלויות, חיסכון זמן ותחזיות החזר השקעה' },
  { id: 'planning', name: 'סיכום ותכנון', icon: '9️⃣', subModules: 5, description: 'סיכום ממצאים, המלצות והצעדים הבאים' }
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentMeeting,
    meetings,
    loadMeeting,
    deleteMeeting,
    getModuleProgress,
    getOverallProgress,
    startTimer,
    stopTimer,
    timerInterval,
    zohoClientsList,
    initializeWizard,
    syncModulesToWizard
  } = useMeetingStore();

  const [showMeetingSelector, setShowMeetingSelector] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showRestoreBackupMenu, setShowRestoreBackupMenu] = useState(false);

  const moduleProgress = getModuleProgress();
  const overallProgress = getOverallProgress();
  const roi = currentMeeting ? calculateROI(currentMeeting) : null;
  const painPoints = currentMeeting?.painPoints || [];

  useEffect(() => {
    return () => {
      if (timerInterval) {
        stopTimer();
      }
    };
  }, []);

  // Redirect to clients list if no current meeting
  useEffect(() => {
    if (!currentMeeting) {
      navigate('/clients');
    }
  }, [currentMeeting, navigate]);

  // Check for 100% completion
  useEffect(() => {
    if (overallProgress === 100 && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [overallProgress]);

  const handleStartWizard = () => {
    if (!currentMeeting) return;
    initializeWizard();
    syncModulesToWizard();
    navigate('/wizard');
  };

  const handleLoadMeeting = (meetingId: string) => {
    loadMeeting(meetingId);
    setShowMeetingSelector(false);
  };

  const handleDeleteMeeting = (meetingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('האם אתה בטוח שברצונך למחוק את הפגישה?')) {
      deleteMeeting(meetingId);
    }
  };

  const handleExportPDF = async () => {
    if (!currentMeeting) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    pdf.setR2L(true);

    // Title
    pdf.setFontSize(24);
    pdf.text(currentMeeting.clientName, pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.text(`Date: ${formatDate(currentMeeting.date)}`, pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 10;

    // Summary
    pdf.setFontSize(14);
    pdf.text('Summary', pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 8;

    pdf.setFontSize(11);
    pdf.text(`Progress: ${overallProgress}%`, pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 6;
    pdf.text(`Pain Points: ${painPoints.length}`, pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 6;
    pdf.text(`ROI Potential: ${formatCurrency(roi?.totalMonthlySavings || 0)}/month`, pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 10;

    // Pain Points
    if (painPoints.length > 0) {
      pdf.setFontSize(14);
      pdf.text('Pain Points Identified', pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 8;

      pdf.setFontSize(10);
      painPoints.forEach((point, index) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${index + 1}. ${point.module}: ${point.description}`, pageWidth - 20, yPosition, { align: 'right' });
        yPosition += 6;
      });
    }

    // ROI Breakdown
    if (roi && roi.totalMonthlySavings > 0) {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.text('ROI Analysis', pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 8;

      pdf.setFontSize(10);
      Object.entries(roi.breakdown).forEach(([key, value]) => {
        if (value > 0) {
          pdf.text(`${key}: ${formatCurrency(value)}/month`, pageWidth - 20, yPosition, { align: 'right' });
          yPosition += 6;
        }
      });
    }

    pdf.save(`discovery-${currentMeeting.clientName}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative" dir="rtl">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="confetti-container">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40 transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Logo */}
              <img
                src="/logo1.svg"
                alt="AutomAIziot Logo"
                className="h-10 w-auto"
              />
              {currentMeeting ? (
                <>
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">{currentMeeting.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{formatDate(currentMeeting.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-gray-600" />
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {formatTime(currentMeeting.timer || 0)}
                    </span>
                    <button
                      onClick={() => timerInterval ? stopTimer() : startTimer()}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
                      title={timerInterval ? 'עצור טיימר' : 'התחל טיימר'}
                    >
                      {timerInterval ? <Pause className="w-4 h-4 text-red-500" /> : <Play className="w-4 h-4 text-green-500" />}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-lg font-semibold text-gray-700">Discovery Assistant</div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentMeeting && (
                <>
                  {/* Summary Button */}
                  <Button
                    onClick={() => navigate('/summary')}
                    variant="ghost"
                    icon={<ClipboardList className="w-4 h-4" />}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700"
                  >
                    סיכום
                  </Button>

                  {/* Export Menu */}
                  <ExportMenu variant="button" />

                  {/* Restore Backup Button */}
                  <Button
                    onClick={() => setShowRestoreBackupMenu(true)}
                    variant="ghost"
                    icon={<Database className="w-4 h-4" />}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700"
                    title="שחזור מגיבוי"
                  >
                    שחזור
                  </Button>

                  {/* Reset Meeting Data Button */}
                  <Button
                    onClick={() => setShowResetModal(true)}
                    variant="ghost"
                    icon={<RotateCcw className="w-4 h-4" />}
                    className="bg-red-100 hover:bg-red-200 text-red-700"
                    title="איפוס מידע פגישה"
                  >
                    איפוס
                  </Button>

                  {/* Switch Meeting */}
                  <Button
                    onClick={() => setShowMeetingSelector(!showMeetingSelector)}
                    variant="ghost"
                    icon={<RefreshCw className="w-4 h-4" />}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    החלף פגישה
                  </Button>
                </>
              )}

              {/* All Clients Button */}
              <Button
                onClick={() => navigate('/clients')}
                variant="primary"
                icon={<Users className="w-4 h-4" />}
                className="bg-indigo-600 hover:bg-indigo-700 shadow-md"
              >
                כל הלקוחות
                {zohoClientsList.length > 0 && (
                  <Badge variant="primary" size="sm" className="bg-indigo-800 border-indigo-900 mr-1">
                    {zohoClientsList.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Selector Modal */}
      {showMeetingSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowMeetingSelector(false)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[70vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">בחר פגישה</h2>
            </div>
            <div className="p-6">
              {meetings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">אין פגישות שמורות</p>
              ) : (
                <div className="space-y-3">
                  {meetings.map(meeting => (
                    <div
                      key={meeting.meetingId}
                      onClick={() => handleLoadMeeting(meeting.meetingId)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-md group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">{meeting.clientName}</h3>
                          <p className="text-sm text-gray-600">{formatDate(meeting.date)}</p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteMeeting(meeting.meetingId, e)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {currentMeeting ? (
        <div className="container mx-auto px-4 py-8">
          {/* Client Approval Needed Banner */}
          {currentMeeting.status === 'awaiting_client_decision' && (
            <div className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-r-4 border-orange-500 rounded-lg shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-orange-900 mb-2">
                    📋 ממתין לאישור לקוח
                  </h3>
                  <p className="text-base text-orange-800 mb-4">
                    הצעת המחיר נשלחה ללקוח. יש לסמן אילו שירותים הלקוח החליט לרכוש ולאשר את המעבר לשלב מפרט היישום.
                  </p>
                  <button
                    onClick={() => navigate('/approval')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 shadow-md hover:shadow-lg transition-all font-semibold"
                  >
                    <CheckCircle className="w-5 h-5" />
                    עבור לאישור לקוח
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Phase Warning Banner */}
          {currentMeeting.phase !== 'discovery' && (
            <div className="mb-6 p-4 bg-blue-50 border-r-4 border-blue-500 rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {currentMeeting.phase === 'implementation_spec' ? (
                    <Code className="w-6 h-6 text-blue-600" />
                  ) : currentMeeting.phase === 'development' ? (
                    <Users className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Info className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">
                    {currentMeeting.phase === 'implementation_spec' && 'שלב מפרט יישום - תצוגת קריאה בלבד'}
                    {currentMeeting.phase === 'development' && 'Development Phase - Discovery View Only'}
                    {currentMeeting.phase === 'completed' && 'פרויקט הושלם - תצוגת קריאה בלבד'}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {currentMeeting.phase === 'implementation_spec' && (
                      <>
                        נתוני הגילוי נעולים לעריכה. עבור ל
                        <button
                          onClick={() => navigate('/phase2')}
                          className="mx-1 underline font-semibold hover:text-blue-900"
                        >
                          מפרט היישום
                        </button>
                        להמשך העבודה.
                      </>
                    )}
                    {currentMeeting.phase === 'development' && (
                      <>
                        Discovery data is locked for editing. Go to
                        <button
                          onClick={() => navigate('/phase3')}
                          className="mx-1 underline font-semibold hover:text-blue-900"
                        >
                          Development Dashboard
                        </button>
                        to continue work.
                      </>
                    )}
                    {currentMeeting.phase === 'completed' && 'הפרויקט הושלם. נתוני הגילוי זמינים לצפייה בלבד.'}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Lock className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </div>
          )}

          {/* Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Overall Progress */}
            <Card variant="elevated" padding="md" hoverable className="transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">התקדמות כללית</h3>
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div className="relative mb-2">
                <ProgressBar value={overallProgress} showPercentage={false} size="md" animated />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-white drop-shadow-lg">{overallProgress}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {moduleProgress.filter(m => m.completed === m.total && m.total > 0).length} מתוך {modules.length} מודולים הושלמו
              </p>
            </Card>

            {/* Pain Points */}
            <Card variant="elevated" padding="md" hoverable className="transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">כאבים שזוהו</h3>
                <AlertCircle className="w-6 h-6 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">{painPoints.length}</div>
              <p className="text-sm text-gray-600">
                נקודות כאב הדורשות התייחסות
              </p>
            </Card>

            {/* ROI Potential */}
            <Card variant="elevated" padding="md" hoverable className="transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">פוטנציאל ROI</h3>
                <Sparkles className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(roi?.totalMonthlySavings || 0)}
              </div>
              <p className="text-sm text-gray-600">חיסכון חודשי משוער</p>
            </Card>
          </div>

          {/* NEW: Client Progress Summary */}
          <ClientProgressSummary
            progress={calculateClientProgressSummary(currentMeeting)}
            onActionClick={(action) => action.action()}
          />

          {/* Next Steps Generator - Always show for guidance */}
          <div className="mb-8">
            <NextStepsGenerator />
          </div>

          {/* Phase 5: Smart Recommendations */}
          {currentMeeting && overallProgress > 30 && (() => {
            const recommendations = getSmartRecommendations(currentMeeting);
            const topRecommendations = recommendations.slice(0, 3);

            return topRecommendations.length > 0 ? (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                      <h3 className="text-xl font-bold text-gray-900">המלצות אוטומציה חכמות</h3>
                    </div>
                    <span className="text-sm text-purple-700 font-medium">
                      {recommendations.length} הזדמנויות זוהו
                    </span>
                  </div>

                  <div className="space-y-3">
                    {topRecommendations.map((rec, index) => (
                      <Card key={index} variant="default" padding="md" hoverable>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant={
                                  rec.priority >= 8 ? 'danger' :
                                  rec.priority >= 6 ? 'warning' :
                                  rec.priority >= 4 ? 'info' :
                                  'success'
                                }
                                size="sm"
                              >
                                {rec.priority >= 8 ? 'קריטי' : rec.priority >= 6 ? 'גבוה' : rec.priority >= 4 ? 'בינוני' : 'נמוך'}
                              </Badge>
                              <Badge
                                variant={
                                  rec.quickWin ? 'success' :
                                  rec.category === 'integration' ? 'primary' :
                                  rec.category === 'automation' ? 'info' :
                                  'gray'
                                }
                                size="sm"
                              >
                                {rec.quickWin && '⚡ Quick Win'}
                                {rec.category === 'integration' && '🔗 אינטגרציה'}
                                {rec.category === 'automation' && '🤖 אוטומציה'}
                                {rec.category === 'ai_agent' && '🧠 AI Agent'}
                                {rec.category === 'process_improvement' && '📈 שיפור תהליכים'}
                              </Badge>
                            </div>

                            <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{rec.description || 'לא זמין תיאור'}</p>

                            <div className="flex flex-wrap gap-2 text-xs">
                              {rec.estimatedTimeSavings && (
                                <span className="text-green-600">⏱️ {rec.estimatedTimeSavings}</span>
                              )}
                              {rec.estimatedCostSavings && (
                                <span className="text-blue-600">💰 {rec.estimatedCostSavings}</span>
                              )}
                              {rec.suggestedTools && rec.suggestedTools.length > 0 && (
                                <span className="text-purple-600">🛠️ {rec.suggestedTools.join(', ')}</span>
                              )}
                            </div>
                          </div>

                          <div className="text-2xl">{index + 1}</div>
                        </div>
                      </Card>
                    ))}

                    {recommendations.length > 3 && (
                      <div className="text-center pt-2">
                        <button
                          onClick={() => navigate('/module/planning')}
                          className="text-sm text-purple-700 hover:text-purple-900 font-medium"
                        >
                          צפה בכל {recommendations.length} ההמלצות ←
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {/* Wizard Mode Section */}
          <div className="mb-8">
            <Card variant="highlighted" padding="lg" className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    <Wand2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">מצב אשף מודרך</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      עבור על כל המודולים בממשק אחד מודרך, צעד אחר צעד
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleStartWizard}
                  variant="primary"
                  icon={<Wand2 className="w-5 h-5" />}
                  size="lg"
                  className="shadow-md hover:scale-105"
                >
                  התחל במצב אשף
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Badge variant="gray" size="sm" className="bg-white">✓ ניווט קל בין שלבים</Badge>
                <Badge variant="gray" size="sm" className="bg-white">✓ דילוג על סעיפים אופציונליים</Badge>
                <Badge variant="gray" size="sm" className="bg-white">✓ סיכום מלא בסוף</Badge>
                <Badge variant="gray" size="sm" className="bg-white">✓ סנכרון אוטומטי עם המודולים</Badge>
              </div>
            </Card>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map(module => (
              <ModuleProgressCard
                key={module.id}
                moduleId={module.id}
                moduleName={module.name}
                icon={module.icon}
                description={module.description || ''}
                route={`/module/${module.id}`}
              />
            ))}
          </div>

          {/* Quick Actions */}
          {overallProgress === 100 && (
            <Card variant="default" padding="lg" className="mt-8 bg-green-50 text-center animate-slideUp">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">מצוין! הערכת Discovery הושלמה</h3>
              <p className="text-green-700 mb-4">כל המודולים מולאו בהצלחה. כעת ניתן לייצא את הנתונים ולהכין הצעת פתרון.</p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleExportPDF}
                  variant="success"
                  size="lg"
                >
                  ייצא דוח PDF
                </Button>
                <Button
                  onClick={() => navigate('/module/roi')}
                  variant="primary"
                  size="lg"
                >
                  צפה בניתוח ROI
                </Button>
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* LEGACY: Welcome screen - Currently unreachable due to redirect in useEffect (line 99-103)
         * Will be replaced with auth-based landing page in future implementation
         * Code preserved for reference and future authentication system integration
         */
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Card variant="elevated" padding="lg" className="shadow-lg">
              <h1 className="text-3xl font-bold mb-4 text-gray-800">ברוכים הבאים ל-Discovery Assistant</h1>
              <p className="text-lg text-gray-600 mb-8">
                כלי מקצועי לביצוע פגישות Discovery ואיתור הזדמנויות לאוטומציה
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => navigate('/clients')}
                  variant="primary"
                  size="lg"
                  icon={<Plus className="w-5 h-5" />}
                  className="shadow-lg hover:scale-105"
                >
                  בחר לקוח
                </Button>
                {meetings.length > 0 && (
                  <Button
                    onClick={() => setShowMeetingSelector(true)}
                    variant="secondary"
                    size="lg"
                  >
                    טען פגישה קיימת
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confettiFall 3s ease-in-out infinite;
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* Reset Meeting Modal */}
      <ResetMeetingModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onSuccess={() => {
          setShowResetModal(false);
          // Optionally refresh or update state
        }}
      />

      {/* Restore Backup Menu */}
      <RestoreBackupMenu
        isOpen={showRestoreBackupMenu}
        onClose={() => setShowRestoreBackupMenu(false)}
        onSuccess={() => {
          setShowRestoreBackupMenu(false);
          // Optionally refresh or update state
        }}
      />
    </div>
  );
};