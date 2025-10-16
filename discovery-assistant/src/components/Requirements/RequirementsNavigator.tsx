import React, { useState, useEffect } from 'react';
import { Meeting } from '../../types';
import { CollectedRequirements } from '../../types/serviceRequirements';
import { RequirementsGathering } from './RequirementsGathering';
import { getRequirementsTemplate } from '../../config/serviceRequirementsTemplates';
import { getServiceById } from '../../config/servicesDatabase';

interface RequirementsNavigatorProps {
  meeting: Meeting;
  onComplete: (allRequirements: CollectedRequirements[]) => void;
  onBack?: () => void;
  language: 'en' | 'he';
}

export const RequirementsNavigator: React.FC<RequirementsNavigatorProps> = ({
  meeting,
  onComplete,
  onBack,
  language,
}) => {
  // Get purchased services from proposal (client-approved services only)
  // Fall back to selectedServices for backward compatibility
  const purchasedServices = meeting.modules?.proposal?.purchasedServices || [];
  const selectedServices = meeting.modules?.proposal?.selectedServices || [];

  // Extract service IDs - prioritize purchasedServices, fallback to selectedServices
  const selectedServiceIds =
    purchasedServices.length > 0
      ? purchasedServices.map((s) => s.id)
      : selectedServices.map((s) => s.id);

  // Debug logging for data flow validation
  console.log(
    '[RequirementsNavigator] Purchased services:',
    purchasedServices.length
  );
  console.log(
    '[RequirementsNavigator] Selected services (fallback):',
    selectedServices.length
  );
  console.log('[RequirementsNavigator] Using service IDs:', selectedServiceIds);
  if (purchasedServices.length === 0 && selectedServices.length > 0) {
    console.warn(
      '[RequirementsNavigator] No purchased services found, falling back to selected services. Check meeting.modules.proposal.purchasedServices'
    );
  }

  // Filter only services that have requirement templates
  const servicesWithRequirements = selectedServiceIds.filter(
    (serviceId: string) => {
      return getRequirementsTemplate(serviceId) !== null;
    }
  );

  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [collectedRequirements, setCollectedRequirements] = useState<
    CollectedRequirements[]
  >([]);

  // Get the current service ID from the array
  const currentServiceId = servicesWithRequirements[currentServiceIndex];

  // If no services require requirements, skip this phase
  useEffect(() => {
    if (servicesWithRequirements.length === 0) {
      onComplete([]);
    }
  }, [servicesWithRequirements.length, onComplete]);

  if (servicesWithRequirements.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-green-900 mb-4">
            {language === 'he'
              ? 'אין צורך באסיפת דרישות נוספת'
              : 'No Additional Requirements Needed'}
          </h2>
          <p className="text-green-700">
            {language === 'he'
              ? 'השירותים שבחרת לא דורשים מידע נוסף. אנחנו מוכנים להמשיך!'
              : 'The services you selected do not require additional information. We are ready to proceed!'}
          </p>
          <button
            onClick={() => onComplete([])}
            className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            {language === 'he' ? 'המשך' : 'Continue'}
          </button>
        </div>
      </div>
    );
  }

  const isLastService =
    currentServiceIndex === servicesWithRequirements.length - 1;
  const overallProgress =
    (currentServiceIndex / servicesWithRequirements.length) * 100;

  const handleServiceComplete = (requirements: CollectedRequirements) => {
    const updatedRequirements = [...collectedRequirements, requirements];
    setCollectedRequirements(updatedRequirements);

    if (isLastService) {
      // All services completed
      onComplete(updatedRequirements);
    } else {
      // Move to next service
      setCurrentServiceIndex(currentServiceIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentServiceIndex === 0 && onBack) {
      onBack();
    } else if (currentServiceIndex > 0) {
      setCurrentServiceIndex(currentServiceIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 py-8"
      dir={language === 'he' ? 'rtl' : 'ltr'}
    >
      {/* Overall Header */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'he'
              ? 'איסוף דרישות טכניות'
              : 'Technical Requirements Gathering'}
          </h1>
          <p className="text-gray-600 mb-4">
            {language === 'he'
              ? `שירות ${currentServiceIndex + 1} מתוך ${servicesWithRequirements.length}`
              : `Service ${currentServiceIndex + 1} of ${servicesWithRequirements.length}`}
          </p>

          {/* Overall Progress */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">
            {language === 'he'
              ? `${collectedRequirements.length} שירותים הושלמו`
              : `${collectedRequirements.length} services completed`}
          </p>
        </div>

        {/* Services List */}
        <div className="mt-4 flex flex-wrap gap-2">
          {servicesWithRequirements.map((serviceId: string, index: number) => {
            const service = getServiceById(serviceId);
            const isCompleted = index < currentServiceIndex;
            const isCurrent = index === currentServiceIndex;

            return (
              <div
                key={serviceId}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isCompleted
                    ? 'bg-green-100 text-green-800'
                    : isCurrent
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                      : 'bg-gray-100 text-gray-600'
                }`}
              >
                {language === 'he' ? service?.nameHe : service?.name}
                {isCompleted && ' ✓'}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Service Requirements */}
      <RequirementsGathering
        serviceId={currentServiceId}
        meeting={meeting}
        onComplete={handleServiceComplete}
        onBack={handleBack}
        language={language}
      />
    </div>
  );
};
