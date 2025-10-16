import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ClipboardList,
  CheckCircle as CheckCircleIcon,
  FileCode,
  Code,
  Trophy,
  Lock,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { MeetingPhase, MeetingStatus } from '../../types';
import { updateZohoPotentialPhase } from '../../services/zohoAPI';
import { getPhaseTransitionRequirements } from '../../hooks/usePhaseGuard';
import { validateServiceRequirements } from '../../utils/serviceRequirementsValidation';
import toast from 'react-hot-toast';

interface PhaseConfig {
  id: MeetingPhase | 'requirements' | 'approval';
  phase: MeetingPhase; // Actual phase this belongs to
  label: { he: string; en: string };
  icon: React.ComponentType<any>;
  description: { he: string; en: string };
  requiredStatus?: MeetingStatus[];
  isSubPhase?: boolean;
  order: number;
}

const PHASE_CONFIGS: PhaseConfig[] = [
  {
    id: 'discovery',
    phase: 'discovery',
    label: { he: 'גילוי', en: 'Discovery' },
    icon: Search,
    description: {
      he: 'איסוף מידע ראשוני מהלקוח',
      en: 'Initial client data collection',
    },
    requiredStatus: ['discovery_in_progress', 'discovery_complete'],
    order: 1,
  },
  {
    id: 'requirements',
    phase: 'discovery',
    label: { he: 'איסוף דרישות', en: 'Requirements' },
    icon: ClipboardList,
    description: {
      he: 'איסוף דרישות מפורטות לשירותים',
      en: 'Detailed service requirements collection',
    },
    requiredStatus: ['discovery_complete', 'awaiting_client_decision'],
    isSubPhase: true,
    order: 1.5,
  },
  {
    id: 'approval',
    phase: 'discovery',
    label: { he: 'אישור לקוח', en: 'Client Approval' },
    icon: CheckCircleIcon,
    description: { he: 'המתנה לאישור לקוח', en: 'Awaiting client approval' },
    requiredStatus: ['awaiting_client_decision', 'client_approved'],
    isSubPhase: true,
    order: 1.9,
  },
  {
    id: 'implementation_spec',
    phase: 'implementation_spec',
    label: { he: 'מפרט יישום', en: 'Implementation Spec' },
    icon: FileCode,
    description: {
      he: 'פירוט טכני מלא של המערכות והאינטגרציות',
      en: 'Detailed technical specifications',
    },
    requiredStatus: ['spec_in_progress', 'spec_complete'],
    order: 2,
  },
  {
    id: 'development',
    phase: 'development',
    label: { he: 'פיתוח', en: 'Development' },
    icon: Code,
    description: {
      he: 'ניהול משימות ומעקב אחר הפיתוח',
      en: 'Task management and development tracking',
    },
    requiredStatus: [
      'dev_not_started',
      'dev_in_progress',
      'dev_testing',
      'dev_ready_for_deployment',
      'deployed',
    ],
    order: 3,
  },
  {
    id: 'completed',
    phase: 'completed',
    label: { he: 'הושלם', en: 'Completed' },
    icon: Trophy,
    description: {
      he: 'הפרויקט הושלם בהצלחה',
      en: 'Project completed successfully',
    },
    requiredStatus: ['completed'],
    order: 4,
  },
];

interface PhaseNavigatorProps {
  language?: 'he' | 'en';
  compact?: boolean;
  showProgress?: boolean;
}

export const PhaseNavigator: React.FC<PhaseNavigatorProps> = ({
  language = 'he',
  compact = false,
  showProgress = true,
}) => {
  const navigate = useNavigate();
  const {
    currentMeeting,
    transitionPhase,
    canTransitionTo,
    getPhaseProgress,
    getOverallProgress,
  } = useMeetingStore();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingTransition, setPendingTransition] =
    useState<PhaseConfig | null>(null);

  if (!currentMeeting) return null;

  const currentPhase = currentMeeting.phase || 'discovery';
  const currentStatus = currentMeeting.status || 'discovery_in_progress';

  /**
   * Get detailed lock reason for a phase
   */
  const getLockReason = (config: PhaseConfig): string => {
    if (config.phase === currentPhase) return '';

    const { canTransition, reasons } = getPhaseTransitionRequirements(
      config.phase,
      currentMeeting,
      getOverallProgress,
      language
    );

    if (canTransition) return '';

    return reasons.join(' • ');
  };

  /**
   * Determine the state of each phase/sub-phase
   */
  const getPhaseState = (
    config: PhaseConfig
  ): 'completed' | 'active' | 'unlocked' | 'locked' => {
    const phaseIndex = PHASE_CONFIGS.findIndex((p) => p.id === config.id);
    const currentIndex = PHASE_CONFIGS.findIndex(
      (p) =>
        p.phase === currentPhase &&
        (!p.requiredStatus || p.requiredStatus.includes(currentStatus))
    );

    // Completed: Phase is before current
    if (phaseIndex < currentIndex) return 'completed';

    // Active: Current phase/sub-phase
    if (
      config.phase === currentPhase &&
      (!config.requiredStatus || config.requiredStatus.includes(currentStatus))
    ) {
      return 'active';
    }

    // Unlocked: Can transition to this phase
    if (canTransitionTo(config.phase)) return 'unlocked';

    // Locked: Cannot access yet
    return 'locked';
  };

  /**
   * Handle phase click/navigation
   */
  const handlePhaseClick = async (config: PhaseConfig) => {
    const state = getPhaseState(config);

    // Can't click on active phase
    if (state === 'active') return;

    // Show lock reason for locked phases
    if (state === 'locked') {
      const lockReason = getLockReason(config);
      toast.error(
        lockReason ||
          (language === 'he' ? 'שלב זה נעול' : 'This phase is locked'),
        {
          duration: 4000,
          icon: '🔒',
          position: 'top-center',
        }
      );
      return;
    }

    // Navigate to completed phases (read-only)
    if (state === 'completed') {
      navigateToPhase(config.phase);
      return;
    }

    // Unlocked: Show confirmation dialog for major transitions
    if (state === 'unlocked') {
      if (
        config.phase === 'implementation_spec' ||
        config.phase === 'development'
      ) {
        setPendingTransition(config);
        setShowConfirmDialog(true);
      } else {
        executeTransition(config);
      }
    }
  };

  /**
   * Execute phase transition
   */
  const executeTransition = async (config: PhaseConfig) => {
    setIsTransitioning(true);
    try {
      // Transition phase in store
      const success = transitionPhase(
        config.phase,
        `User initiated transition to ${config.phase}`
      );

      if (!success) {
        toast.error(
          language === 'he'
            ? 'כשל במעבר לשלב הבא'
            : 'Failed to transition to next phase',
          { icon: '❌' }
        );
        return;
      }

      // Sync to Zoho if integrated
      if (currentMeeting.zohoIntegration?.recordId) {
        await updateZohoPotentialPhase(
          currentMeeting.zohoIntegration.recordId,
          config.phase,
          currentMeeting.status,
          `Phase changed to ${config.phase}`
        );
      }

      // Show success message
      toast.success(
        language === 'he'
          ? `עברת לשלב ${config.label.he}`
          : `Transitioned to ${config.label.en}`,
        { icon: '✅' }
      );

      // Navigate to the new phase
      navigateToPhase(config.phase);
    } catch (error) {
      console.error('[PhaseNavigator] Failed to transition phase:', error);
      toast.error(
        language === 'he'
          ? 'שגיאה במעבר בין שלבים'
          : 'Error transitioning phases',
        { icon: '❌' }
      );
    } finally {
      setIsTransitioning(false);
    }
  };

  /**
   * Navigate to appropriate route for phase
   */
  const navigateToPhase = (phase: MeetingPhase) => {
    switch (phase) {
      case 'discovery':
        navigate('/dashboard');
        break;
      case 'implementation_spec':
        navigate('/phase2');
        break;
      case 'development':
        navigate('/phase3');
        break;
      case 'completed':
        navigate('/summary');
        break;
    }
  };

  /**
   * Get progress percentage for phase
   */
  const getProgress = (config: PhaseConfig): number => {
    return getPhaseProgress(config.phase);
  };

  /**
   * Get service requirements validation for Phase 2
   */
  const getServiceRequirementsValidation = () => {
    if (!currentMeeting) return null;
    const purchasedServices =
      currentMeeting.modules?.proposal?.purchasedServices || [];
    return validateServiceRequirements(
      purchasedServices,
      currentMeeting.implementationSpec || {}
    );
  };

  /**
   * Render phase step
   */
  const renderPhaseStep = (config: PhaseConfig, _index: number) => {
    const state = getPhaseState(config);
    const progress = getProgress(config);
    const Icon = config.icon;
    const isClickable = state === 'completed' || state === 'unlocked';
    const label = config.label[language];
    const description = config.description[language];
    const lockReason = state === 'locked' ? getLockReason(config) : '';

    // Color schemes based on state
    const colors = {
      completed: {
        bg: 'bg-green-500',
        border: 'border-green-500',
        text: 'text-green-600',
        ring: 'ring-green-500',
        icon: 'text-white',
      },
      active: {
        bg: 'bg-blue-600',
        border: 'border-blue-600',
        text: 'text-blue-600',
        ring: 'ring-blue-600',
        icon: 'text-white',
      },
      unlocked: {
        bg: 'bg-blue-100',
        border: 'border-blue-400',
        text: 'text-blue-600',
        ring: 'ring-blue-400',
        icon: 'text-blue-600',
      },
      locked: {
        bg: 'bg-gray-200',
        border: 'border-gray-300',
        text: 'text-gray-400',
        ring: 'ring-gray-300',
        icon: 'text-gray-400',
      },
    };

    const scheme = colors[state];

    return (
      <div
        key={config.id}
        className={`
          flex flex-col items-center
          ${config.isSubPhase ? 'scale-90 opacity-90' : ''}
          ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
          transition-all duration-200
          ${compact ? 'w-16' : 'w-24'}
        `}
        onClick={() => handlePhaseClick(config)}
        title={
          state === 'locked'
            ? lockReason ||
              (language === 'he'
                ? 'השלם את השלב הקודם'
                : 'Complete previous phase')
            : state === 'unlocked'
              ? language === 'he'
                ? 'לחץ לעבור לשלב זה'
                : 'Click to transition to this phase'
              : description
        }
        role="button"
        aria-label={`${label} - ${state}`}
        tabIndex={isClickable ? 0 : -1}
      >
        {/* Circle Indicator */}
        <div className="relative">
          <div
            className={`
              ${compact ? 'w-12 h-12' : 'w-16 h-16'}
              rounded-full
              ${scheme.bg}
              ${state === 'unlocked' ? `border-2 ${scheme.border} bg-white` : ''}
              flex items-center justify-center
              shadow-md
              ${state === 'active' ? 'animate-pulse ring-4 ring-opacity-50 ' + scheme.ring : ''}
              transition-all duration-300
            `}
          >
            {state === 'completed' ? (
              <CheckCircleIcon
                className={`${compact ? 'w-7 h-7' : 'w-9 h-9'} ${scheme.icon}`}
              />
            ) : state === 'locked' ? (
              <Lock
                className={`${compact ? 'w-5 h-5' : 'w-7 h-7'} ${scheme.icon}`}
              />
            ) : (
              <Icon
                className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} ${scheme.icon}`}
              />
            )}
          </div>

          {/* Progress Ring for Active Phase */}
          {state === 'active' && showProgress && progress > 0 && (
            <svg
              className={`absolute top-0 left-0 ${compact ? 'w-12 h-12' : 'w-16 h-16'} transform -rotate-90`}
            >
              <circle
                cx={compact ? '24' : '32'}
                cy={compact ? '24' : '32'}
                r={compact ? '22' : '30'}
                stroke="white"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${progress * (compact ? 1.38 : 1.88)} ${compact ? 138 : 188}`}
                className="transition-all duration-500"
              />
            </svg>
          )}

          {/* Sub-phase indicator */}
          {config.isSubPhase && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
          )}
        </div>

        {/* Label */}
        {!compact && (
          <div className="mt-3 text-center max-w-[100px]">
            <div
              className={`text-sm font-semibold ${scheme.text} leading-tight`}
            >
              {label}
            </div>
            {state === 'active' && showProgress && progress > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                {progress}% {language === 'he' ? 'הושלם' : 'Complete'}
              </div>
            )}
            {/* Show service requirements badge for Phase 2 */}
            {config.phase === 'implementation_spec' &&
              (state === 'active' || state === 'unlocked') &&
              (() => {
                const validation = getServiceRequirementsValidation();
                if (!validation) return null;
                return (
                  <div
                    className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
                      validation.isValid
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {validation.completedCount}/{validation.totalCount}{' '}
                    {language === 'he' ? 'טפסים' : 'forms'}
                  </div>
                );
              })()}
          </div>
        )}

        {/* Compact Label */}
        {compact && (
          <div
            className={`text-xs font-medium ${scheme.text} mt-1 text-center max-w-[60px] leading-tight`}
          >
            {label}
          </div>
        )}
      </div>
    );
  };

  /**
   * Render connector between phases
   */
  const renderConnector = (fromConfig: PhaseConfig, toConfig: PhaseConfig) => {
    const fromState = getPhaseState(fromConfig);
    const toState = getPhaseState(toConfig);

    const isCompleted =
      fromState === 'completed' &&
      (toState === 'completed' || toState === 'active');
    const isSubPhase = fromConfig.isSubPhase || toConfig.isSubPhase;

    return (
      <div
        className={`
          flex items-center justify-center
          ${compact ? 'mx-2' : 'mx-4'}
          ${isSubPhase ? 'opacity-50' : ''}
        `}
      >
        <ChevronRight
          className={`
            ${compact ? 'w-4 h-4' : 'w-5 h-5'}
            ${isCompleted ? 'text-green-500' : 'text-gray-300'}
            transition-colors duration-300
          `}
        />
      </div>
    );
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Phase Steps */}
        <div
          className={`
          flex items-center justify-center
          ${compact ? 'gap-1' : 'gap-2'}
          overflow-x-auto
          scrollbar-hide
        `}
        >
          {PHASE_CONFIGS.map((config, index) => (
            <React.Fragment key={config.id}>
              {renderPhaseStep(config, index)}
              {index < PHASE_CONFIGS.length - 1 &&
                renderConnector(config, PHASE_CONFIGS[index + 1])}
            </React.Fragment>
          ))}
        </div>

        {/* Current Phase Description */}
        {!compact && (
          <div className="text-center mt-4 max-w-2xl mx-auto">
            <p className="text-sm text-gray-600">
              {
                PHASE_CONFIGS.find((p) => getPhaseState(p) === 'active')
                  ?.description[language]
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {language === 'he' ? 'סטטוס' : 'Status'}:{' '}
              <span className="font-medium">
                {currentStatus?.replace(/_/g, ' ')}
              </span>
            </p>
          </div>
        )}

        {/* Transitioning Indicator */}
        {isTransitioning && (
          <div className="text-center mt-2">
            <div className="inline-flex items-center gap-2 text-sm text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              {language === 'he' ? 'מעבר לשלב הבא...' : 'Transitioning...'}
            </div>
          </div>
        )}

        {/* Phase History Link (optional) */}
        {currentMeeting.phaseHistory &&
          currentMeeting.phaseHistory.length > 1 && (
            <div className="text-center mt-3">
              <button
                className="text-xs text-gray-500 hover:text-gray-700 underline"
                onClick={() => {
                  console.log('Phase History:', currentMeeting.phaseHistory);
                  // Could open a modal showing phase history
                }}
              >
                {language === 'he' ? 'היסטוריית שלבים' : 'Phase History'} (
                {currentMeeting.phaseHistory.length - 1})
              </button>
            </div>
          )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && pendingTransition && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowConfirmDialog(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {language === 'he'
                      ? 'אישור מעבר לשלב הבא'
                      : 'Confirm Phase Transition'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'he'
                      ? `האם אתה בטוח שברצונך לעבור לשלב "${pendingTransition.label.he}"?`
                      : `Are you sure you want to transition to "${pendingTransition.label.en}"?`}
                  </p>
                  {pendingTransition.phase === 'implementation_spec' && (
                    <p className="text-xs text-gray-500 mt-2">
                      {language === 'he'
                        ? 'לא תוכל לחזור אחורה לשלב הגילוי לאחר מעבר זה.'
                        : 'You will not be able to return to the discovery phase after this transition.'}
                    </p>
                  )}
                  {pendingTransition.phase === 'development' && (
                    <p className="text-xs text-gray-500 mt-2">
                      {language === 'he'
                        ? 'ודא שמפרט היישום מושלם לפני המעבר לפיתוח.'
                        : 'Ensure the implementation spec is complete before transitioning to development.'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setPendingTransition(null);
                  }}
                >
                  {language === 'he' ? 'ביטול' : 'Cancel'}
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    setShowConfirmDialog(false);
                    if (pendingTransition) {
                      executeTransition(pendingTransition);
                    }
                    setPendingTransition(null);
                  }}
                >
                  {language === 'he'
                    ? 'המשך לשלב הבא'
                    : 'Continue to Next Phase'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
