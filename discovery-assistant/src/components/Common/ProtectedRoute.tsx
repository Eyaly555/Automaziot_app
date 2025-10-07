import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeetingStore } from '../../store/useMeetingStore';
import { MeetingPhase, MeetingStatus } from '../../types';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPhase?: MeetingPhase;
  allowedStatuses?: MeetingStatus[];
  requireMeeting?: boolean;
  errorMessage?: {
    he: string;
    en: string;
  };
  language?: 'he' | 'en';
}

/**
 * ProtectedRoute Component
 *
 * Wraps route components to enforce phase-based access control.
 * Validates that users have the correct phase/status before rendering children.
 *
 * Features:
 * - Phase-based access control
 * - Status-based access control
 * - Automatic redirection for unauthorized access
 * - Toast notifications explaining why access was denied
 * - Loading states during validation
 *
 * @example
 * <ProtectedRoute requiredPhase="implementation_spec">
 *   <ImplementationSpecDashboard />
 * </ProtectedRoute>
 *
 * @example
 * <ProtectedRoute
 *   requiredPhase="discovery"
 *   allowedStatuses={['awaiting_client_decision', 'client_approved']}
 * >
 *   <ClientApprovalView />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPhase,
  allowedStatuses,
  requireMeeting = true,
  errorMessage,
  language = 'he'
}) => {
  const { currentMeeting, canTransitionTo } = useMeetingStore();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = React.useState(true);
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  useEffect(() => {
    let isMounted = true;

    const validateAccess = async () => {
      // Check if meeting is required but not loaded
      if (requireMeeting && !currentMeeting) {
        console.warn('[ProtectedRoute] No meeting loaded, redirecting to dashboard');
        if (isMounted) {
          toast.error(
            language === 'he'
              ? 'יש לטעון פגישה תחילה'
              : 'Please load a meeting first',
            {
              duration: 3000,
              icon: '⚠️'
            }
          );
          navigate('/dashboard');
          setIsValidating(false);
        }
        return;
      }

      // If meeting is not required and none exists, allow access
      if (!requireMeeting && !currentMeeting) {
        if (isMounted) {
          setIsAuthorized(true);
          setIsValidating(false);
        }
        return;
      }

      // Validate phase requirement
      if (requiredPhase && currentMeeting) {
        const currentPhase = currentMeeting.phase;
        const currentStatus = currentMeeting.status;

        // Check if current phase matches required phase
        if (currentPhase !== requiredPhase) {
          // Special case: Allow access to Phase 2 if client has approved (auto-transition will happen inside)
          if (requiredPhase === 'implementation_spec' &&
              currentPhase === 'discovery' &&
              currentStatus === 'client_approved') {
            // Allow access - ImplementationSpecDashboard will handle the auto-transition
            console.log('[ProtectedRoute] Allowing Phase 2 access with client_approved status');
          } else {
            // Check if user can transition to this phase
            const canAccess = canTransitionTo(requiredPhase);

            if (!canAccess) {
              console.warn(
                `[ProtectedRoute] Access denied: Required phase "${requiredPhase}", current phase "${currentPhase}"`
              );

              if (isMounted) {
                // Show error message
                const message = errorMessage
                  ? errorMessage[language]
                  : language === 'he'
                    ? `גישה נדרשת לשלב ${requiredPhase}`
                    : `Access requires ${requiredPhase} phase`;

                toast.error(message, {
                  duration: 4000,
                  icon: '🔒',
                  position: 'top-center'
                });

                // Redirect to appropriate route for current phase
                navigateToPhaseRoute(currentPhase);
                setIsValidating(false);
              }
              return;
            }
          }
        }
      }

      // Validate status requirement
      if (allowedStatuses && currentMeeting) {
        const currentStatus = currentMeeting.status;

        if (!allowedStatuses.includes(currentStatus)) {
          console.warn(
            `[ProtectedRoute] Access denied: Status must be one of [${allowedStatuses.join(', ')}], ` +
            `current status is "${currentStatus}"`
          );

          if (isMounted) {
            const message = errorMessage
              ? errorMessage[language]
              : language === 'he'
                ? 'הסטטוס הנוכחי אינו מאפשר גישה לדף זה'
                : 'Current status does not allow access to this page';

            toast.error(message, {
              duration: 4000,
              icon: '🔒',
              position: 'top-center'
            });

            navigateToPhaseRoute(currentMeeting.phase);
            setIsValidating(false);
          }
          return;
        }
      }

      // All validations passed
      if (isMounted) {
        setIsAuthorized(true);
        setIsValidating(false);
      }
    };

    validateAccess();

    return () => {
      isMounted = false;
    };
  }, [currentMeeting, requiredPhase, allowedStatuses, requireMeeting, canTransitionTo, navigate, language, errorMessage]);

  /**
   * Navigate to the default route for a given phase
   */
  const navigateToPhaseRoute = (phase: MeetingPhase) => {
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
      default:
        navigate('/dashboard');
    }
  };

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {language === 'he' ? 'בודק הרשאות...' : 'Validating access...'}
          </p>
        </div>
      </div>
    );
  }

  // If not authorized, don't render anything (redirect already happened)
  if (!isAuthorized) {
    return null;
  }

  // Render children if authorized
  return <>{children}</>;
};
