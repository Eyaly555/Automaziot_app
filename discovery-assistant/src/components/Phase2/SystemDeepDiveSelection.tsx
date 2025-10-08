import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeetingStore } from '../../store/useMeetingStore';
import { Server, ArrowLeft, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react';
import { Button, Badge } from '../Base';
import { getRequiredSystemsForServices } from '../../config/serviceToSystemMapping';
import { SelectedService, DetailedSystemInfo } from '../../types';

/**
 * SystemDeepDiveSelection
 *
 * Lists ONLY systems from Phase 1 that are needed for purchased services.
 * Filters systems based on meeting.modules.proposal.purchasedServices to ensure
 * Phase 2 only collects technical details for systems that are actually required.
 *
 * This component does NOT allow adding new systems - only expanding on systems
 * that were already identified in Phase 1 AND are needed for purchased services.
 */
export const SystemDeepDiveSelection: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting } = useMeetingStore();

  // Get purchased services from proposal (defensive fallback to selectedServices for backward compatibility)
  const purchasedServices =
    currentMeeting?.modules?.proposal?.purchasedServices?.length > 0
      ? currentMeeting.modules.proposal.purchasedServices
      : currentMeeting?.modules?.proposal?.selectedServices || [];
  const purchasedServiceIds = purchasedServices.map((s: SelectedService) => s.id);

  // Debug logging
  console.log('[SystemDeepDiveSelection] Purchased services:', purchasedServiceIds);

  // Get required system categories for purchased services
  const requiredSystemCategories = getRequiredSystemsForServices(purchasedServiceIds);
  console.log('[SystemDeepDiveSelection] Required system categories:', requiredSystemCategories);

  // Get ALL systems from Phase 1
  const allPhase1Systems = currentMeeting?.modules?.systems?.detailedSystems || [];
  console.log('[SystemDeepDiveSelection] All Phase 1 systems:', allPhase1Systems.map(s => ({
    id: s.id,
    name: s.specificSystem,
    category: s.category
  })));

  // Filter Phase 1 systems to ONLY show systems needed for purchased services
  const phase1Systems = allPhase1Systems.filter((system: DetailedSystemInfo) => {
    // Defensive check: ensure system has a category
    if (!system.category) {
      console.warn('[SystemDeepDiveSelection] System missing category field:', system);
      return false; // Exclude systems without category
    }

    // Check if this system's category is required for purchased services
    const isRequired = requiredSystemCategories.includes(system.category);

    if (!isRequired) {
      console.log(`[SystemDeepDiveSelection] Filtering out system "${system.specificSystem}" (category: ${system.category}) - not needed for purchased services`);
    }

    return isRequired;
  });

  console.log('[SystemDeepDiveSelection] Filtered systems for purchased services:', phase1Systems.map(s => ({
    id: s.id,
    name: s.specificSystem,
    category: s.category
  })));

  // Get existing deep dive specs from Phase 2
  const phase2Systems = currentMeeting?.implementationSpec?.systems || [];

  // Get deep dive status
  const getDeepDiveStatus = (systemId: string): 'complete' | 'partial' | 'not_started' => {
    const deepDive = phase2Systems.find(s => s.systemId === systemId);

    if (!deepDive) return 'not_started';

    // Check completeness
    const hasAuth = deepDive.authentication.credentialsProvided;
    const hasModules = deepDive.modules.length > 0;
    const hasMigrationPlan = deepDive.dataMigration.required ?
      deepDive.dataMigration.rollbackPlan.length > 0 : true;

    if (hasAuth && hasModules && hasMigrationPlan) return 'complete';
    if (hasAuth || hasModules) return 'partial';
    return 'not_started';
  };

  // Calculate overall progress
  const completedCount = phase1Systems.filter((s: DetailedSystemInfo) =>
    getDeepDiveStatus(s.id) === 'complete'
  ).length;

  const overallProgress = phase1Systems.length > 0
    ? Math.round((completedCount / phase1Systems.length) * 100)
    : 0;

  // Handle edge cases with informative messages
  if (purchasedServiceIds.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/phase2')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">פירוט טכני למערכות</h1>
                <p className="text-gray-600 text-sm">אין שירותים שנרכשו</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
            <Server className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-blue-900 mb-2">לא נבחרו שירותים לרכישה</h3>
            <p className="text-blue-800 mb-4">
              לא נבחרו שירותים שהלקוח אישר לרכישה. יש לחזור ל-Phase 1 ולבחור את השירותים שהלקוח מעוניין בהם.
            </p>
            <Button
              variant="secondary"
              onClick={() => navigate('/dashboard')}
            >
              חזרה לדשבורד
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase1Systems.length === 0 && allPhase1Systems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/phase2')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">פירוט טכני למערכות</h1>
                <p className="text-gray-600 text-sm">אין מערכות מוגדרות ב-Phase 1</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
            <Server className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-yellow-900 mb-2">לא נמצאו מערכות</h3>
            <p className="text-yellow-800 mb-4">
              לא הוגדרו מערכות ב-Phase 1. יש לחזור ל-Phase 1 ולהגדיר את המערכות הקיימות לפני המעבר למפרט הטכני.
            </p>
            <Button
              variant="secondary"
              onClick={() => navigate('/dashboard')}
            >
              חזרה לדשבורד
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase1Systems.length === 0 && allPhase1Systems.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/phase2')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">פירוט טכני למערכות</h1>
                <p className="text-gray-600 text-sm">אין מערכות נדרשות לשירותים שנרכשו</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-900 mb-2">אין צורך במערכות נוספות</h3>
            <p className="text-green-800 mb-4">
              השירותים שנרכשו ({purchasedServiceIds.length}) לא דורשים אינטגרציה עם מערכות קיימות.
              <br />
              ניתן להמשיך ישירות לשלב הפיתוח.
            </p>
            <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
              <p className="text-sm text-gray-700 mb-2">
                <strong>שירותים שנרכשו:</strong>
              </p>
              <ul className="text-sm text-gray-600 text-right">
                {purchasedServices.slice(0, 5).map((service: SelectedService) => (
                  <li key={service.id}>• {service.nameHe || service.name}</li>
                ))}
                {purchasedServices.length > 5 && (
                  <li className="text-gray-500">+{purchasedServices.length - 5} נוספים</li>
                )}
              </ul>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/phase2')}
              className="mt-4"
            >
              חזרה למפרט יישום
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/phase2')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">פירוט טכני למערכות</h1>
                <p className="text-gray-600 text-sm">
                  {phase1Systems.length} מערכות נדרשות לשירותים שנרכשו ({purchasedServiceIds.length} שירותים)
                </p>
                {allPhase1Systems.length > phase1Systems.length && (
                  <p className="text-gray-500 text-xs mt-1">
                    מוצגות רק מערכות רלוונטיות ({phase1Systems.length} מתוך {allPhase1Systems.length} מערכות שזוהו ב-Phase 1)
                  </p>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{overallProgress}%</div>
              <div className="text-sm text-gray-600">הושלם</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
              <span>{completedCount} מתוך {phase1Systems.length} מערכות הושלמו</span>
              <span>{phase1Systems.length - completedCount} מערכות נותרו</span>
            </div>
          </div>
        </div>
      </div>

      {/* Systems List */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <Server className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                מערכות רלוונטיות לשירותים שנרכשו
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                מוצגות רק המערכות הנדרשות עבור {purchasedServiceIds.length} השירותים שהלקוח אישר לרכישה.
                {allPhase1Systems.length > phase1Systems.length && (
                  <> (סוננו {allPhase1Systems.length - phase1Systems.length} מערכות שאינן רלוונטיות)</>
                )}
              </p>
              <div className="border-t border-blue-200 pt-3 mt-3">
                <p className="text-sm font-semibold text-blue-900 mb-2">מה צריך לאסוף לכל מערכת?</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>אימות וגישה:</strong> API Key, OAuth tokens, endpoint URL, rate limits</li>
                  <li>• <strong>מודולים ושדות:</strong> רשימת מודולים במערכת, שדות קיימים ושדות מותאמים אישית</li>
                  <li>• <strong>העברת נתונים:</strong> כמות רשומות, שנות היסטוריה, שיטת העברה, תוכנית rollback</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Systems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phase1Systems.map((system: DetailedSystemInfo) => {
            const status = getDeepDiveStatus(system.id);
            const statusConfig = {
              complete: {
                badge: 'הושלם',
                badgeColor: 'bg-green-100 text-green-800',
                icon: CheckCircle,
                iconColor: 'text-green-600',
                borderColor: 'border-green-300',
                bgColor: 'bg-green-50'
              },
              partial: {
                badge: 'בתהליך',
                badgeColor: 'bg-yellow-100 text-yellow-800',
                icon: AlertCircle,
                iconColor: 'text-yellow-600',
                borderColor: 'border-yellow-300',
                bgColor: 'bg-yellow-50'
              },
              not_started: {
                badge: 'טרם התחיל',
                badgeColor: 'bg-gray-100 text-gray-800',
                icon: Server,
                iconColor: 'text-gray-600',
                borderColor: 'border-gray-300',
                bgColor: 'bg-white'
              }
            }[status];

            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={system.id}
                onClick={() => navigate(`/phase2/systems/${system.id}/dive`)}
                className={`${statusConfig.bgColor} border-2 ${statusConfig.borderColor} rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-white border border-gray-200`}>
                      <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{system.specificSystem}</h3>
                      <p className="text-sm text-gray-600">{system.category}</p>
                    </div>
                  </div>
                  <Badge variant="gray" className={statusConfig.badgeColor}>
                    {statusConfig.badge}
                  </Badge>
                </div>

                {/* System Info from Phase 1 */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">רשומות במערכת:</span>
                    <span className="font-semibold text-gray-900">
                      {system.recordCount ? system.recordCount.toLocaleString('he-IL') : 'לא צוין'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">גישת API:</span>
                    <span className="font-semibold text-gray-900">
                      {system.apiAccess === 'full' ? 'מלאה' :
                       system.apiAccess === 'limited' ? 'מוגבלת' :
                       system.apiAccess === 'none' ? 'אין' : 'לא ידוע'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">אינטגרציות נדרשות:</span>
                    <span className="font-semibold text-gray-900">
                      {system.integrationNeeds?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Pain Points from Phase 1 */}
                {system.mainPainPoints && system.mainPainPoints.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">נקודות כאב:</p>
                    <div className="space-y-1">
                      {system.mainPainPoints.slice(0, 2).map((pain: string, idx: number) => (
                        <div key={idx} className="text-xs text-gray-600 bg-white rounded px-2 py-1">
                          • {pain}
                        </div>
                      ))}
                      {system.mainPainPoints.length > 2 && (
                        <div className="text-xs text-gray-500 px-2">
                          +{system.mainPainPoints.length - 2} נוספות
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-blue-600">
                    {status === 'complete' ? 'צפה במפרט' :
                     status === 'partial' ? 'המשך למלא' :
                     'התחל פירוט'}
                  </span>
                  <ChevronLeft className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💡 טיפים לאיסוף מידע</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">איך להשיג API Key?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>1. היכנס למערכת כמנהל</li>
                <li>2. נווט להגדרות → API או Integrations</li>
                <li>3. צור API Key חדש או העתק את הקיים</li>
                <li>4. שמור ב-Phase 2 (לא נשמר בקוד המקור)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">מה אם אין גישה למערכת?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>1. פנה למנהל המערכת בארגון</li>
                <li>2. בקש הרשאות API</li>
                <li>3. אם אין גישה - סמן "אין גישה" בטופס</li>
                <li>4. נחזור לזה בשלב מאוחר יותר</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
