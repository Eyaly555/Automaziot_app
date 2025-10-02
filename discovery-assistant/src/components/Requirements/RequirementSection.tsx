import React from 'react';
import { RequirementSection as RequirementSectionType } from '../../types/serviceRequirements';
import { RequirementField } from './RequirementField';

interface RequirementSectionProps {
  section: RequirementSectionType;
  sectionData: any;
  onFieldChange: (fieldId: string, value: any) => void;
  prefilledData?: any;
  language: 'en' | 'he';
}

export const RequirementSection: React.FC<RequirementSectionProps> = ({
  section,
  sectionData,
  onFieldChange,
  prefilledData,
  language
}) => {
  const title = language === 'he' ? section.titleHe : section.title;

  // Check if field should be shown based on dependencies
  const shouldShowField = (field: any) => {
    if (!field.dependsOn) return true;

    const dependencyValue = sectionData[field.dependsOn.fieldId];
    const requiredValues = Array.isArray(field.dependsOn.value)
      ? field.dependsOn.value
      : [field.dependsOn.value];

    return requiredValues.includes(dependencyValue);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-2">
        {title}
      </h3>

      <div className="space-y-6">
        {section.fields.map((field) => {
          if (!shouldShowField(field)) return null;

          return (
            <RequirementField
              key={field.id}
              field={field}
              value={sectionData[field.id]}
              onChange={(value) => onFieldChange(field.id, value)}
              prefilledData={prefilledData}
              language={language}
            />
          );
        })}
      </div>
    </div>
  );
};
