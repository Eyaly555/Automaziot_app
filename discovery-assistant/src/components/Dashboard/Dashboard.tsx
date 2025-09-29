import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Timer,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
  Plus,
  Play,
  Pause,
  RefreshCw,
  Mail,
  MessageCircle,
  FileSpreadsheet,
  Sparkles,
  ChevronDown,
  X,
  Wand2
} from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { formatTime, formatCurrency, formatDate } from '../../utils/formatters';
import { calculateROI } from '../../utils/roiCalculator';
import { ProgressBar } from '../Common/ProgressBar/ProgressBar';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface ModuleConfig {
  id: string;
  name: string;
  icon: string;
  subModules?: number;
  description?: string;
}

const modules: ModuleConfig[] = [
  { id: 'overview', name: 'סקירה כללית', icon: '1️⃣', subModules: 0 },
  { id: 'leadsAndSales', name: 'לידים ומכירות', icon: '2️⃣', subModules: 5 },
  { id: 'customerService', name: 'שירות לקוחות', icon: '3️⃣', subModules: 6 },
  { id: 'operations', name: 'תפעול פנימי', icon: '4️⃣', subModules: 6 },
  { id: 'reporting', name: 'דוחות והתראות', icon: '5️⃣', subModules: 3 },
  { id: 'aiAgents', name: 'סוכני AI', icon: '6️⃣', subModules: 3 },
  { id: 'systems', name: 'מערכות וטכנולוגיה', icon: '7️⃣', subModules: 0 },
  { id: 'roi', name: 'ROI וכימות', icon: '8️⃣', subModules: 0 },
  { id: 'planning', name: 'סיכום ותכנון', icon: '9️⃣', subModules: 5 }
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentMeeting,
    meetings,
    createMeeting,
    loadMeeting,
    deleteMeeting,
    getModuleProgress,
    getOverallProgress,
    startTimer,
    stopTimer,
    timerInterval,
    exportMeeting,
    initializeWizard,
    syncModulesToWizard
  } = useMeetingStore();

  const [showMeetingSelector, setShowMeetingSelector] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [selectedModuleDetails, setSelectedModuleDetails] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

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

  // Check for 100% completion
  useEffect(() => {
    if (overallProgress === 100 && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [overallProgress]);

  const getModuleStatus = (moduleId: string) => {
    const progress = moduleProgress.find(m => m.moduleId === moduleId);
    if (!progress) return { icon: '⚪', status: 'not-started', progress: 0 };

    const progressPercent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
    if (progressPercent === 0) return { icon: '⚪', status: 'not-started', progress: 0 };
    if (progressPercent === 100) return { icon: '✅', status: 'completed', progress: 100 };
    return { icon: '🔄', status: 'in-progress', progress: progressPercent };
  };

  const handleModuleClick = (moduleId: string) => {
    if (!currentMeeting) {
      const clientName = prompt('שם הלקוח:');
      if (clientName) {
        createMeeting(clientName);
        setTimeout(() => navigate(`/module/${moduleId}`), 100);
      }
      return;
    }
    navigate(`/module/${moduleId}`);
  };

  const handleNewMeeting = () => {
    const clientName = prompt('שם הלקוח:');
    if (clientName) {
      createMeeting(clientName);
    }
  };

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

  const handleExportJSON = () => {
    const data = exportMeeting();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discovery-${currentMeeting?.clientName || 'meeting'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  };

  const handleExportExcel = () => {
    if (!currentMeeting) return;

    const wb = XLSX.utils.book_new();

    // Overview sheet
    const overviewData = [
      ['לקוח', currentMeeting.clientName],
      ['תאריך', formatDate(currentMeeting.date)],
      ['התקדמות כללית', `${overallProgress}%`],
      ['כאבים שזוהו', painPoints.length],
      ['פוטנציאל ROI חודשי', formatCurrency(roi?.totalMonthlySavings || 0)]
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, ws1, 'סקירה כללית');

    // Module sheets
    Object.entries(currentMeeting.modules).forEach(([key, data]) => {
      const moduleData = JSON.stringify(data, null, 2).split('\n').map(line => [line]);
      const ws = XLSX.utils.aoa_to_sheet(moduleData);
      XLSX.utils.book_append_sheet(wb, ws, key.substring(0, 31));
    });

    XLSX.writeFile(wb, `discovery-${currentMeeting.clientName}-${new Date().toISOString().split('T')[0]}.xlsx`);
    setExportMenuOpen(false);
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
    setExportMenuOpen(false);
  };

  const handleExportWhatsApp = () => {
    if (!currentMeeting) return;

    const message = `
🏢 *${currentMeeting.clientName}*
📅 ${formatDate(currentMeeting.date)}

📊 *סיכום פגישת Discovery*
━━━━━━━━━━━━━━━
התקדמות: ${overallProgress}%
כאבים שזוהו: ${painPoints.length}
פוטנציאל חיסכון: ${formatCurrency(roi?.totalMonthlySavings || 0)}/חודש

🔥 *כאבים עיקריים:*
${painPoints.slice(0, 5).map((p, i) => `${i + 1}. ${p.description}`).join('\n')}

💰 *פוטנציאל ROI:*
${roi ? Object.entries(roi.breakdown).filter(([_, v]) => v > 0).map(([k, v]) => `• ${k}: ${formatCurrency(v)}/חודש`).join('\n') : 'טרם חושב'}

🚀 *הצעדים הבאים:*
1. השלמת ניתוח מפורט
2. הכנת הצעת פתרון
3. פגישת המשך

נשמח לתאם המשך 📞
    `.trim();

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    setExportMenuOpen(false);
  };

  const handleExportEmail = () => {
    if (!currentMeeting) return;

    const subject = `סיכום פגישת Discovery - ${currentMeeting.clientName}`;
    const body = `
לקוח נכבד,

מצ"ב סיכום פגישת ה-Discovery שהתקיימה בתאריך ${formatDate(currentMeeting.date)}.

סיכום ממצאים:
- התקדמות כללית: ${overallProgress}%
- כאבים שזוהו: ${painPoints.length}
- פוטנציאל חיסכון חודשי: ${formatCurrency(roi?.totalMonthlySavings || 0)}

כאבים עיקריים שזוהו:
${painPoints.slice(0, 5).map((p, i) => `${i + 1}. ${p.description}`).join('\n')}

פירוט פוטנציאל ROI:
${roi ? Object.entries(roi.breakdown).filter(([_, v]) => v > 0).map(([k, v]) => `- ${k}: ${formatCurrency(v)}/חודש`).join('\n') : 'טרם חושב'}

הצעדים הבאים:
1. השלמת ניתוח מפורט של הממצאים
2. הכנת הצעת פתרון מותאמת
3. קביעת פגישת המשך להצגת הפתרון

נשמח לתאם איתך את המשך התהליך.

בברכה,
צוות Discovery
    `.trim();

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    setExportMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative" dir="rtl">
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
                <div className="text-lg font-semibold">Discovery Assistant</div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentMeeting && (
                <>
                  {/* Export Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setExportMenuOpen(!exportMenuOpen)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
                    >
                      <Download className="w-4 h-4" />
                      <span>ייצוא</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {exportMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 animate-slideDown">
                        <button
                          onClick={handleExportJSON}
                          className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>JSON</span>
                        </button>
                        <button
                          onClick={handleExportPDF}
                          className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-red-600" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={handleExportExcel}
                          className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-green-600" />
                          <span>Excel</span>
                        </button>
                        <button
                          onClick={handleExportWhatsApp}
                          className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 text-green-500" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={handleExportEmail}
                          className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <Mail className="w-4 h-4 text-purple-600" />
                          <span>Email</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Switch Meeting */}
                  <button
                    onClick={() => setShowMeetingSelector(!showMeetingSelector)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all duration-200"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>החלף פגישה</span>
                  </button>
                </>
              )}

              {/* New Meeting */}
              <button
                onClick={handleNewMeeting}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>פגישה חדשה</span>
              </button>
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
          {/* Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Overall Progress */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">התקדמות כללית</h3>
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div className="relative mb-2">
                <ProgressBar value={overallProgress} showPercentage={false} className="h-3" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-white drop-shadow-lg">{overallProgress}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {moduleProgress.filter(m => m.completed === m.total && m.total > 0).length} מתוך {modules.length} מודולים הושלמו
              </p>
            </div>

            {/* Pain Points */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">כאבים שזוהו</h3>
                <AlertCircle className="w-6 h-6 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">{painPoints.length}</div>
              <p className="text-sm text-gray-600">
                נקודות כאב הדורשות התייחסות
              </p>
            </div>

            {/* ROI Potential */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">פוטנציאל ROI</h3>
                <Sparkles className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(roi?.totalMonthlySavings || 0)}
              </div>
              <p className="text-sm text-gray-600">חיסכון חודשי משוער</p>
            </div>
          </div>

          {/* Wizard Mode Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
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
                <button
                  onClick={handleStartWizard}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
                >
                  <Wand2 className="w-5 h-5" />
                  <span>התחל במצב אשף</span>
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-white rounded-md text-gray-600">✓ ניווט קל בין שלבים</span>
                <span className="px-2 py-1 bg-white rounded-md text-gray-600">✓ דילוג על סעיפים אופציונליים</span>
                <span className="px-2 py-1 bg-white rounded-md text-gray-600">✓ סיכום מלא בסוף</span>
                <span className="px-2 py-1 bg-white rounded-md text-gray-600">✓ סנכרון אוטומטי עם המודולים</span>
              </div>
            </div>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map(module => {
              const status = getModuleStatus(module.id);
              const isExpanded = selectedModuleDetails === module.id;

              return (
                <div
                  key={module.id}
                  className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
                    status.status === 'completed' ? 'ring-2 ring-green-500' :
                    status.status === 'in-progress' ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleModuleClick(module.id)}
                  onMouseEnter={() => setSelectedModuleDetails(module.id)}
                  onMouseLeave={() => setSelectedModuleDetails(null)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{module.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-800">{module.name}</h3>
                          {module.subModules !== undefined && module.subModules > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              └ {module.subModules} תת-מודולים
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-2xl animate-pulse">{status.icon}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <ProgressBar value={status.progress} className="h-2" />
                    </div>

                    {/* Status Text */}
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-medium ${
                        status.status === 'completed' ? 'text-green-600' :
                        status.status === 'in-progress' ? 'text-blue-600' :
                        'text-gray-400'
                      }`}>
                        {status.status === 'completed' ? 'הושלם' :
                         status.status === 'in-progress' ? 'בתהליך' :
                         'טרם התחיל'}
                      </span>
                      <span className="text-gray-500">{status.progress}%</span>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && module.subModules !== undefined && module.subModules > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 animate-slideDown">
                        <p className="text-xs text-gray-600">
                          {status.status === 'not-started' ? 'לחץ להתחיל במודול זה' :
                           status.status === 'in-progress' ? 'לחץ להמשיך במילוי' :
                           'לחץ לעיון וערכה'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          {overallProgress === 100 && (
            <div className="mt-8 bg-green-50 rounded-xl p-6 text-center animate-slideUp">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">מצוין! הערכת Discovery הושלמה</h3>
              <p className="text-green-700 mb-4">כל המודולים מולאו בהצלחה. כעת ניתן לייצא את הנתונים ולהכין הצעת פתרון.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleExportPDF}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  ייצא דוח PDF
                </button>
                <button
                  onClick={() => navigate('/module/roi')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  צפה בניתוח ROI
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-12">
              <h1 className="text-3xl font-bold mb-4 text-gray-800">ברוכים הבאים ל-Discovery Assistant</h1>
              <p className="text-lg text-gray-600 mb-8">
                כלי מקצועי לביצוע פגישות Discovery ואיתור הזדמנויות לאוטומציה
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleNewMeeting}
                  className="px-8 py-4 bg-primary hover:bg-blue-600 text-white rounded-lg text-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  התחל פגישה חדשה
                </button>
                {meetings.length > 0 && (
                  <button
                    onClick={() => setShowMeetingSelector(true)}
                    className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-lg font-semibold transition-all duration-200"
                  >
                    טען פגישה קיימת
                  </button>
                )}
              </div>
            </div>
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
    </div>
  );
};