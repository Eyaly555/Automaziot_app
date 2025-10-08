import React, { useState, useEffect } from 'react';
import { CollectedRequirements } from '../../types/serviceRequirements';
import { RequirementSection } from './RequirementSection';
import { getRequirementsTemplate } from '../../config/serviceRequirementsTemplates';
import { prefillRequirementsFromMeeting } from '../../utils/requirementsPrefillEngine';
import { Meeting } from '../../types';

interface RequirementsGatheringProps {
  serviceId: string;
  meeting: Meeting;
  onComplete: (requirements: CollectedRequirements) => void;
  onBack?: () => void;
  language: 'en' | 'he';
}

export const RequirementsGathering: React.FC<RequirementsGatheringProps> = ({
  serviceId,
  meeting,
  onComplete,
  onBack,
  language
}) => {
  const template = getRequirementsTemplate(serviceId);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [collectedData, setCollectedData] = useState<any>({});
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [prefilledData, setPrefilledData] = useState<any>({});
  const [startedAt] = useState(new Date());

  useEffect(() => {
    // Pre-fill data from Phase 1
    const prefilled = prefillRequirementsFromMeeting(serviceId, meeting);
    setPrefilledData(prefilled);
    setCollectedData(prefilled);
  }, [serviceId, meeting]);

  if (!template) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          {language === 'he'
            ? 'תבנית לא נמצאה עבור שירות זה'
            : 'Template not found for this service'}
        </p>
      </div>
    );
  }

  const currentSection = template.sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === template.sections.length - 1;
  const isFirstSection = currentSectionIndex === 0;

  const handleFieldChange = (fieldId: string, value: any) => {
    setCollectedData((prev: any) => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validateSection = () => {
    const requiredFields = currentSection.fields.filter(f => f.required);
    for (const field of requiredFields) {
      const value = collectedData[field.id];
      if (value === undefined || value === null || value === '') {
        return false;
      }
      if (Array.isArray(value) && value.length === 0) {
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateSection()) {
      alert(language === 'he'
        ? 'נא למלא את כל השדות הנדרשים'
        : 'Please fill all required fields');
      return;
    }

    // Mark section as completed
    if (!completedSections.includes(currentSection.id)) {
      setCompletedSections([...completedSections, currentSection.id]);
    }

    if (isLastSection) {
      // Complete the requirements gathering
      const requirements: CollectedRequirements = {
        serviceId,
        data: collectedData,
        completedSections,
        startedAt,
        completedAt: new Date()
      };
      onComplete(requirements);
    } else {
      setCurrentSectionIndex(currentSectionIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (isFirstSection && onBack) {
      onBack();
    } else if (!isFirstSection) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const progress = ((currentSectionIndex + 1) / template.sections.length) * 100;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4" dir={language === 'he' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {language === 'he' ? template.serviceNameHe : template.serviceName}
        </h1>
        <p className="text-gray-600">
          {language === 'he'
            ? `סעיף ${currentSectionIndex + 1} מתוך ${template.sections.length}`
            : `Section ${currentSectionIndex + 1} of ${template.sections.length}`}
        </p>

        {/* Progress bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Estimated time */}
        {template.estimatedTimeMinutes && (
          <p className="text-sm text-gray-500 mt-2">
            {language === 'he'
              ? `זמן משוער: ${template.estimatedTimeMinutes} דקות`
              : `Estimated time: ${template.estimatedTimeMinutes} minutes`}
          </p>
        )}
      </div>

      {/* Tips */}
      {template.tips && template.tips.length > 0 && currentSectionIndex === 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            {language === 'he' ? 'טיפים:' : 'Tips:'}
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
            {(language === 'he' ? template.tipsHe : template.tips)?.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Current Section */}
      <RequirementSection
        section={currentSection}
        sectionData={collectedData}
        onFieldChange={handleFieldChange}
        prefilledData={prefilledData}
        language={language}
      />

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={handlePrevious}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          {language === 'he' ? 'חזור' : 'Previous'}
        </button>

        <div className="flex items-center space-x-2 space-x-reverse">
          {completedSections.length > 0 && (
            <span className="text-sm text-gray-600">
              {language === 'he'
                ? `${completedSections.length} סעיפים הושלמו`
                : `${completedSections.length} sections completed`}
            </span>
          )}
        </div>

        <button
          onClick={handleNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          {isLastSection
            ? (language === 'he' ? 'סיים' : 'Complete')
            : (language === 'he' ? 'הבא' : 'Next')}
        </button>
      </div>

      {/* Section Navigation */}
      <div className="mt-6 flex justify-center space-x-2">
        {template.sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => setCurrentSectionIndex(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentSectionIndex
                ? 'bg-blue-600'
                : completedSections.includes(section.id)
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
            title={language === 'he' ? section.titleHe : section.title}
          />
        ))}
      </div>
    </div>
  );
};
