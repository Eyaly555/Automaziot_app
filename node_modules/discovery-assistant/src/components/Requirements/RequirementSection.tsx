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
  // ===== DEFENSIVE CODING: Handle undefined/null section =====
  // This can occur in edge cases:
  // 1. Race condition during template loading
  // 2. Invalid currentSectionIndex (out of bounds)
  // 3. Template has empty sections array
  // 4. Template loaded but section data corrupted

  if (!section) {
    console.error('[RequirementSection] Section prop is undefined or null. This should not happen in normal operation.');
    console.error('[RequirementSection] Context:', { sectionData, language });

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 space-y-4" dir={language === 'he' ? 'rtl' : 'ltr'}>
        <h3 className="text-xl font-bold text-red-800">
          {language === 'he' ? 'שגיאה בטעינת הקטע' : 'Section Loading Error'}
        </h3>
        <p className="text-red-700">
          {language === 'he'
            ? 'לא ניתן לטעון את פרטי הקטע. אנא רענן את הדף או צור קשר עם התמיכה.'
            : 'Unable to load section details. Please refresh the page or contact support.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
        >
          {language === 'he' ? 'רענן דף' : 'Refresh Page'}
        </button>
      </div>
    );
  }

  // ===== DEFENSIVE CODING: Validate section structure =====
  if (!section.fields || !Array.isArray(section.fields)) {
    console.error('[RequirementSection] Section has invalid or missing fields array');
    console.error('[RequirementSection] Section data:', section);

    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 space-y-4" dir={language === 'he' ? 'rtl' : 'ltr'}>
        <h3 className="text-xl font-bold text-yellow-800">
          {language === 'he'
            ? section.titleHe || 'קטע ללא כותרת'
            : section.title || 'Untitled Section'}
        </h3>
        <p className="text-yellow-700">
          {language === 'he'
            ? 'קטע זה אינו מכיל שדות. אנא המשך לקטע הבא.'
            : 'This section does not contain any fields. Please proceed to the next section.'}
        </p>
      </div>
    );
  }

  // ===== SAFE PROPERTY ACCESS: Title with fallback =====
  const title = section
    ? (language === 'he' ? (section.titleHe || section.title || 'קטע ללא כותרת') : (section.title || section.titleHe || 'Untitled Section'))
    : (language === 'he' ? 'קטע ללא כותרת' : 'Untitled Section');

  const description = section
    ? (language === 'he' ? section.descriptionHe : section.description)
    : undefined;

  // Check if field should be shown based on dependencies
  const shouldShowField = (field: any) => {
    if (!field || !field.dependsOn) return true;

    const dependencyValue = sectionData?.[field.dependsOn.fieldId];
    const requiredValues = Array.isArray(field.dependsOn.value)
      ? field.dependsOn.value
      : [field.dependsOn.value];

    return requiredValues.includes(dependencyValue);
  };

  // Filter out any null/undefined fields (defensive)
  const validFields = section.fields.filter(field => field != null);

  if (validFields.length === 0) {
    console.warn('[RequirementSection] Section has no valid fields after filtering');
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4" dir={language === 'he' ? 'rtl' : 'ltr'}>
        <h3 className="text-xl font-bold text-gray-800">
          {title}
        </h3>
        <p className="text-gray-600">
          {language === 'he'
            ? 'אין שדות זמינים בקטע זה.'
            : 'No fields available in this section.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="border-b pb-2">
        <h3 className="text-xl font-bold text-gray-800">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      <div className="space-y-6">
        {validFields.map((field) => {
          // Additional safety check per field
          if (!field || !field.id) {
            console.warn('[RequirementSection] Skipping invalid field:', field);
            return null;
          }

          if (!shouldShowField(field)) return null;

          return (
            <RequirementField
              key={field.id}
              field={field}
              value={sectionData?.[field.id]}
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
