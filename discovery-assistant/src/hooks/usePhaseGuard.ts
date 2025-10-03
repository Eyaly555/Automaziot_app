import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMeetingStore } from '../store/useMeetingStore';
import { MeetingPhase, MeetingStatus } from '../types';
import toast from 'react-hot-toast';

/**
 * Route to Phase Mapping
 * Maps URL patterns to required phases and allowed statuses
 */
interface RouteGuardRule {
  pattern: RegExp;
  requiredPhase: MeetingPhase;
  allowedStatuses?: MeetingStatus[];
  errorMessage: {
    he: string;
    en: string;
  };
}

const ROUTE_GUARD_RULES: RouteGuardRule[] = [
  {
    pattern: /^\/requirements/,
    requiredPhase: 'discovery',
    allowedStatuses: ['discovery_complete', 'awaiting_client_decision'],
    errorMessage: {
      he: 'יש להשלים את שלב הגילוי לפני איסוף דרישות',
      en: 'Complete discovery phase before requirements collection'
    }
  },
  {
    pattern: /^\/approval/,
    requiredPhase: 'discovery',
    allowedStatuses: ['awaiting_client_decision', 'client_approved'],
    errorMessage: {
      he: 'דף אישור לקוח זמין רק לאחר השלמת הגילוי',
      en: 'Client approval page available only after discovery completion'
    }
  },
  {
    pattern: /^\/phase2/,
    requiredPhase: 'implementation_spec',
    errorMessage: {
      he: 'יש לקבל אישור לקוח ולעבור לשלב מפרט היישום',
      en: 'Client approval required to access implementation spec phase'
    }
  },
  {
    pattern: /^\/phase3/,
    requiredPhase: 'development',
    errorMessage: {
      he: 'יש להשלים את מפרט היישום לפני גישה לשלב הפיתוח',
      en: 'Implementation spec must be complete to access development phase'
    }
  }
];

/**
 * Custom hook to guard routes based on current meeting phase and status
 *
 * Automatically redirects users attempting to access unauthorized routes
 * and displays helpful error messages explaining why access is denied.
 *
 * Usage: Call at the top of AppContent or any route container
 *
 * @param language - UI language for error messages (defaults to 'he')
 */
export const usePhaseGuard = (language: 'he' | 'en' = 'he') => {
  const { currentMeeting, canTransitionTo } = useMeetingStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Skip guard if no meeting is loaded
    if (!currentMeeting) {
      // Allow access to login, clients list, and dashboard
      if (
        !location.pathname.includes('/login') &&
        !location.pathname.includes('/clients') &&
        location.pathname !== '/' &&
        location.pathname !== '/dashboard'
      ) {
        console.warn('[PhaseGuard] No meeting loaded, redirecting to dashboard');
        navigate('/');
      }
      return;
    }

    // Check each guard rule against current pathname
    for (const rule of ROUTE_GUARD_RULES) {
      if (rule.pattern.test(location.pathname)) {
        const currentPhase = currentMeeting.phase;
        const currentStatus = currentMeeting.status;

        // Check phase requirement
        if (currentPhase !== rule.requiredPhase) {
          // If trying to access a future phase, check if transition is allowed
          const phaseOrder: MeetingPhase[] = ['discovery', 'implementation_spec', 'development', 'completed'];
          const currentIndex = phaseOrder.indexOf(currentPhase);
          const requiredIndex = phaseOrder.indexOf(rule.requiredPhase);

          if (requiredIndex > currentIndex) {
            // Trying to access future phase
            if (!canTransitionTo(rule.requiredPhase)) {
              console.warn(
                `[PhaseGuard] Blocked access to ${location.pathname}: ` +
                `Phase "${rule.requiredPhase}" required, current phase is "${currentPhase}"`
              );

              // Show error toast
              toast.error(rule.errorMessage[language], {
                duration: 4000,
                icon: '🔒',
                position: 'top-center'
              });

              // Redirect to appropriate phase dashboard
              navigate(getDefaultRouteForPhase(currentPhase));
              return;
            }
          } else {
            // Trying to access previous phase (allowed for viewing)
            console.log(`[PhaseGuard] Allowing access to previous phase route: ${location.pathname}`);
          }
        }

        // Check status requirement (if specified)
        if (rule.allowedStatuses && !rule.allowedStatuses.includes(currentStatus)) {
          console.warn(
            `[PhaseGuard] Blocked access to ${location.pathname}: ` +
            `Status must be one of [${rule.allowedStatuses.join(', ')}], current status is "${currentStatus}"`
          );

          toast.error(rule.errorMessage[language], {
            duration: 4000,
            icon: '🔒',
            position: 'top-center'
          });

          navigate(getDefaultRouteForPhase(currentPhase));
          return;
        }

        // Rule passed, allow access
        break;
      }
    }
  }, [location.pathname, currentMeeting, canTransitionTo, navigate, language]);
};

/**
 * Get the default route for a given phase
 */
function getDefaultRouteForPhase(phase: MeetingPhase): string {
  switch (phase) {
    case 'discovery':
      return '/';
    case 'implementation_spec':
      return '/phase2';
    case 'development':
      return '/phase3';
    case 'completed':
      return '/summary';
    default:
      return '/';
  }
}

/**
 * Get detailed lock reason for a phase
 * Used by UI components to display why a phase is locked
 */
export const getPhaseTransitionRequirements = (
  targetPhase: MeetingPhase,
  currentMeeting: any,
  getOverallProgress: () => number,
  language: 'he' | 'en' = 'he'
): { canTransition: boolean; reasons: string[] } => {
  const reasons: string[] = [];

  switch (targetPhase) {
    case 'implementation_spec':
      if (currentMeeting.status !== 'client_approved') {
        reasons.push(
          language === 'he'
            ? 'יש לקבל אישור לקוח'
            : 'Client approval required'
        );
      }
      const discoveryProgress = getOverallProgress();
      if (discoveryProgress < 70) {
        reasons.push(
          language === 'he'
            ? `יש להשלים ${70 - discoveryProgress}% נוספים מגילוי הדרישות`
            : `Complete ${70 - discoveryProgress}% more of discovery phase`
        );
      }
      break;

    case 'development':
      if (!currentMeeting.implementationSpec) {
        reasons.push(
          language === 'he'
            ? 'יש ליצור מפרט יישום'
            : 'Implementation spec must be created'
        );
      } else {
        const specProgress = currentMeeting.implementationSpec.completionPercentage || 0;
        if (specProgress < 90) {
          reasons.push(
            language === 'he'
              ? `יש להשלים ${90 - specProgress}% נוספים ממפרט היישום`
              : `Complete ${90 - specProgress}% more of implementation spec`
          );
        }
      }
      break;

    case 'completed':
      if (!currentMeeting.developmentTracking) {
        reasons.push(
          language === 'he'
            ? 'יש להתחיל מעקב פיתוח'
            : 'Development tracking must be started'
        );
      } else {
        const tasks = currentMeeting.developmentTracking.tasks || [];
        if (tasks.length === 0) {
          reasons.push(
            language === 'he'
              ? 'לא נמצאו משימות פיתוח'
              : 'No development tasks found'
          );
        } else {
          const incompleteTasks = tasks.filter((t: any) => t.status !== 'done');
          if (incompleteTasks.length > 0) {
            reasons.push(
              language === 'he'
                ? `יש להשלים ${incompleteTasks.length} משימות נוספות`
                : `Complete ${incompleteTasks.length} more tasks`
            );
          }
        }
      }
      break;

    default:
      reasons.push(
        language === 'he'
          ? 'שלב לא ידוע'
          : 'Unknown phase'
      );
  }

  return {
    canTransition: reasons.length === 0,
    reasons
  };
};
