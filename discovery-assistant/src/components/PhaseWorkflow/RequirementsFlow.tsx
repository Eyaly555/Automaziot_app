import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeetingStore } from '../../store/useMeetingStore';
import { RequirementsNavigator } from '../Requirements/RequirementsNavigator';
import { CollectedRequirements } from '../../types/serviceRequirements';
import { getServiceById } from '../../config/servicesDatabase';
import { getRequirementsTemplate } from '../../config/serviceRequirementsTemplates';
import {
  CheckCircle,
  Circle,
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  AlertCircle
} from 'lucide-react';

type RequirementsFlowState =
  | 'not_started'      // No requirements selected yet
  | 'in_progress'      // Currently collecting requirements
  | 'review'           // All requirements collected, needs review
  | 'complete';        // Ready to transition to approval phase

interface RequirementsFlowProps {
  language?: 'he' | 'en';
}

export const RequirementsFlow: React.FC<RequirementsFlowProps> = ({
  language = 'he'
}) => {
  const navigate = useNavigate();
  const {
    currentMeeting,
    updatePhaseStatus,
    updateModule
  } = useMeetingStore();

  const [flowState, setFlowState] = useState<RequirementsFlowState>('not_started');
  const [showReview, setShowReview] = useState(false);

  // Get selected services from proposal
  const selectedServices = currentMeeting?.modules?.proposal?.selectedServices || [];

  // Filter only services that have requirement templates
  const servicesWithRequirements = selectedServices.filter((serviceId: string) => {
    return getRequirementsTemplate(serviceId) !== null;
  });

  // Get collected requirements from meeting
  const collectedRequirements = currentMeeting?.modules?.requirements || [];

  // Calculate progress
  const totalServices = servicesWithRequirements.length;
  const completedServices = collectedRequirements.filter(
    (r: CollectedRequirements) => r.completedAt !== undefined
  ).length;
  const progressPercentage = totalServices > 0
    ? Math.round((completedServices / totalServices) * 100)
    : 0;

  // Update flow state based on progress
  useEffect(() => {
    if (!currentMeeting) return;

    if (totalServices === 0) {
      // No requirements needed, skip this phase
      setFlowState('complete');
      updatePhaseStatus('awaiting_client_decision');
    } else if (completedServices === 0) {
      setFlowState('not_started');
      updatePhaseStatus('discovery_complete'); // Or a new status like 'awaiting_requirements'
    } else if (completedServices < totalServices) {
      setFlowState('in_progress');
      // Could add a new status: 'requirements_in_progress'
      // For now, keep as 'discovery_complete'
    } else {
      setFlowState('complete');
      updatePhaseStatus('awaiting_client_decision');
    }
  }, [completedServices, totalServices, currentMeeting, updatePhaseStatus]);

  // Handle requirements completion
  const handleAllComplete = (allRequirements: CollectedRequirements[]) => {
    console.log('[RequirementsFlow] All requirements collected:', allRequirements);

    // Save to meeting store
    updateModule('requirements', allRequirements);

    // Update flow state
    setFlowState('complete');
    updatePhaseStatus('awaiting_client_decision');
  };

  // Handle proceeding to approval
  const handleProceedToApproval = () => {
    navigate('/approval');
  };

  // Handle going back to proposal
  const handleBackToProposal = () => {
    navigate('/module/proposal');
  };

  // Handle review
  const handleReview = () => {
    setShowReview(!showReview);
  };

  // Check if a specific service is complete
  const isServiceComplete = (serviceId: string): boolean => {
    return collectedRequirements.some(
      (r: CollectedRequirements) => r.serviceId === serviceId && r.completedAt !== undefined
    );
  };

  if (!currentMeeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir={language === 'he' ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {language === 'he' ? 'לא נמצא פגישה פעילה' : 'No Active Meeting Found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {language === 'he'
              ? 'אנא צור פגישה חדשה או טען פגישה קיימת כדי להמשיך.'
              : 'Please create a new meeting or load an existing one to continue.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {language === 'he' ? 'חזור לדשבורד' : 'Back to Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  // If no requirements needed, show skip message
  if (totalServices === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir={language === 'he' ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
          <div className="text-center mb-6">
            <ClipboardCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {language === 'he'
                ? 'אין צורך באסיפת דרישות נוספת'
                : 'No Additional Requirements Needed'}
            </h2>
            <p className="text-gray-600">
              {language === 'he'
                ? 'השירותים שנבחרו בהצעה לא דורשים מידע טכני נוסף. ניתן להמשיך ישירות לאישור לקוח.'
                : 'The services selected in the proposal do not require additional technical information. You can proceed directly to client approval.'}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleBackToProposal}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              {language === 'he' ? 'חזור להצעה' : 'Back to Proposal'}
            </button>
            <button
              onClick={handleProceedToApproval}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center gap-2"
            >
              {language === 'he' ? 'המשך לאישור לקוח' : 'Proceed to Approval'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir={language === 'he' ? 'rtl' : 'ltr'}>
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {language === 'he' ? 'איסוף דרישות טכניות' : 'Technical Requirements Gathering'}
              </h1>
              <p className="text-gray-600">
                {language === 'he'
                  ? `אסוף דרישות מפורטות עבור ${totalServices} שירותים שנבחרו בהצעה`
                  : `Collect detailed requirements for ${totalServices} selected services`}
              </p>
            </div>

            <button
              onClick={handleBackToProposal}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'he' ? 'חזור להצעה' : 'Back to Proposal'}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {language === 'he'
                ? `${completedServices} מתוך ${totalServices} שירותים הושלמו`
                : `${completedServices} of ${totalServices} services completed`}
            </span>
            <span className="font-semibold text-blue-600">
              {progressPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Service Checklist Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-32">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                {language === 'he' ? 'שירותים' : 'Services'}
              </h3>

              <div className="space-y-2">
                {servicesWithRequirements.map((serviceId: string) => {
                  const service = getServiceById(serviceId);
                  const isComplete = isServiceComplete(serviceId);
                  const requirementData = collectedRequirements.find(
                    (r: CollectedRequirements) => r.serviceId === serviceId
                  );

                  return (
                    <div
                      key={serviceId}
                      className={`
                        flex items-start gap-2 p-3 rounded-lg border transition-colors
                        ${isComplete
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
                      `}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {isComplete ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${isComplete ? 'text-green-800' : 'text-gray-800'}`}>
                          {language === 'he' ? service?.nameHe : service?.name}
                        </div>

                        {requirementData && !isComplete && (
                          <div className="text-xs text-gray-500 mt-1">
                            {language === 'he' ? 'בתהליך...' : 'In progress...'}
                          </div>
                        )}

                        {isComplete && requirementData?.completedAt && (
                          <div className="text-xs text-green-600 mt-1">
                            {language === 'he' ? '✓ הושלם' : '✓ Completed'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Review Button */}
              {completedServices > 0 && (
                <button
                  onClick={handleReview}
                  className="w-full mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium text-sm"
                >
                  {language === 'he' ? 'סקור דרישות שנאספו' : 'Review Collected Requirements'}
                </button>
              )}
            </div>
          </div>

          {/* Requirements Navigator */}
          <div className="lg:col-span-3">
            <RequirementsNavigator
              meeting={currentMeeting}
              onComplete={handleAllComplete}
              onBack={handleBackToProposal}
              language={language}
            />
          </div>
        </div>
      </div>

      {/* Completion Actions - Fixed Bottom Bar */}
      {flowState === 'complete' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
          <div className="container mx-auto px-4 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">
                      {language === 'he' ? 'כל הדרישות נאספו בהצלחה!' : 'All Requirements Collected Successfully!'}
                    </h3>
                    <p className="text-sm text-green-700">
                      {language === 'he'
                        ? 'כעת ניתן להמשיך לשלב אישור הלקוח'
                        : 'You can now proceed to the client approval phase'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleProceedToApproval}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  {language === 'he' ? 'המשך לאישור לקוח' : 'Proceed to Client Approval'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal (optional) */}
      {showReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {language === 'he' ? 'סקירת דרישות שנאספו' : 'Review Collected Requirements'}
                </h2>
                <button
                  onClick={() => setShowReview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {collectedRequirements.map((req: CollectedRequirements) => {
                const service = getServiceById(req.serviceId);
                const template = getRequirementsTemplate(req.serviceId);

                return (
                  <div key={req.serviceId} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      {language === 'he' ? service?.nameHe : service?.name}
                    </h3>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(req.data).map(([fieldId, value]) => {
                          // Find field definition in template
                          const field = template?.sections
                            .flatMap(s => s.fields)
                            .find(f => f.id === fieldId);

                          if (!field || !value) return null;

                          return (
                            <div key={fieldId} className="text-sm">
                              <div className="font-medium text-gray-700 mb-1">
                                {language === 'he' ? field.labelHe : field.label}
                              </div>
                              <div className="text-gray-600">
                                {Array.isArray(value) ? value.join(', ') : String(value)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowReview(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                {language === 'he' ? 'סגור' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
