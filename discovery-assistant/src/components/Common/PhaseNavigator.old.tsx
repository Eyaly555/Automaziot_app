import React from 'react';
import { CheckCircle, Circle, Lock, ArrowRight } from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { MeetingPhase } from '../../types';
import { updateZohoPotentialPhase } from '../../services/zohoAPI';

const PHASE_CONFIG = {
  discovery: {
    number: 1,
    nameHe: 'גילוי ואיתור צרכים',
    nameEn: 'Discovery',
    description: 'איסוף מידע ראשוני מהלקוח'
  },
  implementation_spec: {
    number: 2,
    nameHe: 'מפרט טכני',
    nameEn: 'Implementation Spec',
    description: 'פירוט טכני מלא לפיתוח'
  },
  development: {
    number: 3,
    nameHe: 'פיתוח ומעקב',
    nameEn: 'Development',
    description: 'ניהול משימות וקוד'
  },
  completed: {
    number: 4,
    nameHe: 'הושלם',
    nameEn: 'Completed',
    description: 'הפרויקט הושלם'
  }
};

export const PhaseNavigator: React.FC = () => {
  const { currentMeeting, transitionPhase, canTransitionTo, getPhaseProgress } = useMeetingStore();

  if (!currentMeeting) return null;

  const currentPhase = currentMeeting.phase || 'discovery'; // Fallback to 'discovery' if phase is undefined
  const phases: MeetingPhase[] = ['discovery', 'implementation_spec', 'development', 'completed'];

  const getPhaseStatus = (phase: MeetingPhase) => {
    const phaseIndex = phases.indexOf(phase);
    const currentIndex = phases.indexOf(currentPhase);

    if (phaseIndex < currentIndex) return 'completed';
    if (phaseIndex === currentIndex) return 'current';
    if (phaseIndex === currentIndex + 1) return 'next';
    return 'locked';
  };

  const handlePhaseClick = async (phase: MeetingPhase) => {
    if (phase === currentPhase) return;

    if (canTransitionTo(phase)) {
      if (confirm(`האם אתה בטוח שברצונך לעבור לשלב "${PHASE_CONFIG[phase]?.nameHe || phase}"?`)) {
        // Transition phase in local store
        transitionPhase(phase);

        // Sync phase change to Zoho immediately
        if (currentMeeting.zohoIntegration?.recordId) {
          try {
            console.log('[PhaseNavigator] Syncing phase change to Zoho...');
            await updateZohoPotentialPhase(
              currentMeeting.zohoIntegration.recordId,
              phase,
              currentMeeting.status,
              `Phase changed to ${phase}`
            );
            console.log('[PhaseNavigator] Phase synced successfully');
          } catch (error) {
            console.error('[PhaseNavigator] Failed to sync phase to Zoho:', error);
            // Don't block the UI - the auto-sync will retry later
          }
        }
      }
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {phases.map((phase, index) => {
            const status = getPhaseStatus(phase);
            const config = PHASE_CONFIG[phase];
            const progress = getPhaseProgress(phase);
            const isClickable = canTransitionTo(phase);

            return (
              <React.Fragment key={phase}>
                {/* Phase Step */}
                <div
                  className={`flex flex-col items-center ${isClickable || status === 'current' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  onClick={() => handlePhaseClick(phase)}
                >
                  {/* Circle Indicator */}
                  <div className="relative">
                    {status === 'completed' && (
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg">
                        <CheckCircle className="w-7 h-7" />
                      </div>
                    )}
                    {status === 'current' && config && (
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg animate-pulse">
                        <span className="text-lg font-bold">{config.number}</span>
                      </div>
                    )}
                    {status === 'next' && config && (
                      <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-600 flex items-center justify-center text-blue-600">
                        <span className="text-lg font-bold">{config.number}</span>
                      </div>
                    )}
                    {status === 'locked' && (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <Lock className="w-6 h-6" />
                      </div>
                    )}

                    {/* Progress Ring for Current Phase */}
                    {status === 'current' && progress > 0 && (
                      <svg className="absolute top-0 left-0 w-12 h-12 transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="22"
                          stroke="white"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${progress * 1.38} 138`}
                          className="transition-all duration-300"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Label */}
                  {config && (
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-semibold ${
                        status === 'current' ? 'text-blue-600' :
                        status === 'completed' ? 'text-green-600' :
                        status === 'next' ? 'text-gray-700' :
                        'text-gray-400'
                      }`}>
                        {config.nameHe}
                      </div>
                      {status === 'current' && progress > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {progress}% הושלם
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Arrow Between Phases */}
                {index < phases.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    getPhaseStatus(phases[index + 1]) === 'completed' || getPhaseStatus(phases[index + 1]) === 'current'
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}>
                    <ArrowRight className={`w-5 h-5 -mt-2.5 ml-auto mr-auto ${
                      getPhaseStatus(phases[index + 1]) === 'completed' || getPhaseStatus(phases[index + 1]) === 'current'
                        ? 'text-green-500'
                        : 'text-gray-300'
                    }`} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current Phase Description */}
        <div className="text-center mt-4">
          {PHASE_CONFIG[currentPhase] && (
            <p className="text-sm text-gray-600">
              {PHASE_CONFIG[currentPhase].description}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            סטטוס: {currentMeeting.status?.replace(/_/g, ' ') || 'לא זמין'}
          </p>
        </div>
      </div>
    </div>
  );
};
