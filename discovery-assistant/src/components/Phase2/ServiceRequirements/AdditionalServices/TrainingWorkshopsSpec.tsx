/**
 * Training Workshops Requirements Specification Component
 *
 * Service #55: Training Workshops - הדרכות וסדנאות למשתמשים
 * Collects detailed technical requirements for training workshops service.
 *
 * @component
 * @category AdditionalServices
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { TrainingWorkshopsRequirements } from '../../../../types/additionalServices';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { Card } from '../../../Common/Card';

export function TrainingWorkshopsSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<TrainingWorkshopsRequirements>({
    workshops: [],
    learningObjectives: [],
    deliveryMethod: {
      format: 'onsite',
      platform: 'zoom',
      location: '',
      timezone: 'Asia/Jerusalem'
    },
    language: 'he',
    culturalConsiderations: '',
    workshopStructure: {
      introduction: true,
      demonstration: true,
      handsOnPractice: true,
      qaSession: true,
      assessment: false
    },
    materials: {
      presentationSlides: true,
      handouts: true,
      recordedSessions: true,
      practiceExercises: true,
      cheatSheets: true,
      faqDocument: true
    },
    handsOnEnvironment: {
      required: true,
      environmentType: 'demo_system',
      demoDataProvided: true,
      participantAccess: true
    },
    schedule: {
      preferredDates: [],
      preferredTimeSlots: [],
      totalSessions: 1,
      sessionSpacing: 'Same day',
      breaksBetweenSessions: true
    },
    participants: {
      preWorkRequired: false,
      preWorkDescription: '',
      prerequisiteSkills: [],
      accommodationsNeeded: []
    },
    followUpSupport: {
      enabled: true,
      duration: '2 weeks',
      channels: ['email', 'chat'],
      additionalSessionsAvailable: true
    },
    assessment: {
      required: false,
      assessmentType: 'quiz',
      passingScore: 80,
      certificateProvided: false,
      certificationLevel: ''
    },
    deliverables: {
      recordedVideos: true,
      documentationPDF: true,
      exerciseFiles: true,
      faqDocument: true,
      certificatesOfCompletion: false,
      attendanceReport: true
    },
    timeline: {
      preparationDays: 3,
      deliveryDays: 1,
      followUpDays: 7
    },
    successMetrics: {
      targetAttendanceRate: 90,
      targetCompletionRate: 85,
      targetSatisfactionScore: 4.5,
      postTrainingQuizScore: 80
    }
  });

  // Track if we're currently loading data to prevent save loops
  const isLoadingRef = useRef(false);
  const lastLoadedConfigRef = useRef<string>('');

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'training-workshops',
    category: 'additionalServices'
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    saveData(config);
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing data
  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.additionalServices || [];
    const existing = Array.isArray(category)
      ? category.find(item => item.serviceId === 'training-workshops')
      : undefined;

    if (existing?.requirements) {
      const existingConfigJson = JSON.stringify(existing.requirements);

      // Only update if the data actually changed (deep comparison)
      if (existingConfigJson !== lastLoadedConfigRef.current) {
        isLoadingRef.current = true;
        lastLoadedConfigRef.current = existingConfigJson;
        setConfig(existing.requirements as TrainingWorkshopsRequirements);

        // Reset loading flag after state update completes
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 0);
      }
    }
  }, [currentMeeting?.implementationSpec?.additionalServices]);

  // Auto-save on changes
  // REMOVED THE FOLLOWING USE EFFECT DUE TO INFINITE LOOP
  // useEffect(() => {
  //   if (config.workshops?.length || config.learningObjectives?.length) {
  //     saveData(config);
  //   }
  // }, [config]);

  const handleFieldChange = useCallback((field: keyof TrainingWorkshopsRequirements, value: any) => {
    setConfig(prev => {
      const updated = { ...prev, [field]: value };
      setTimeout(() => {
        if (!isLoadingRef.current) {
          // Add any smart field values here if needed
          const completeConfig = {
            ...updated,
            // Example: smartField: smartFieldHook.value
          };
          saveData(completeConfig);
        }
      }, 0);
      return updated;
    });
  }, [saveData]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (config.workshops.length === 0) {
      newErrors.workshops = 'יש להוסיף לפחות סדנה אחת';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save handler
  const handleSave = useCallback(async () => {
    if (isLoadingRef.current) return; // Don't save during loading

    if (!validateForm()) {
      alert('נא למלא את כל השדות הנדרשים');
      return;
    }

    // Build complete config with all smart fields
    const completeConfig = {
      ...config,
      // Add smart field values here
    };

    await saveData(completeConfig, 'manual');

    alert('הגדרות נשמרו בהצלחה!');
  }, [config, saveData, validateForm]);

  // Add workshop
  const addWorkshop = () => {
    const updatedWorkshops = [
      ...config.workshops,
      {
        topic: '',
        targetAudience: '',
        participantCount: 10,
        durationHours: 4,
        skillLevel: 'beginner'
      }
    ];
    handleFieldChange('workshops', updatedWorkshops);
  };

  // Remove workshop
  const removeWorkshop = (index: number) => {
    const updatedWorkshops = config.workshops.filter((_, i) => i !== index);
    handleFieldChange('workshops', updatedWorkshops);
  };

  // Add learning objective
  const addLearningObjective = () => {
    const updatedLearningObjectives = [
      ...config.learningObjectives,
      {
        workshopTopic: '',
        objectives: [],
        successCriteria: ''
      }
    ];
    handleFieldChange('learningObjectives', updatedLearningObjectives);
  };

  // Remove learning objective
  const removeLearningObjective = (index: number) => {
    const updatedLearningObjectives = config.learningObjectives.filter((_, i) => i !== index);
    handleFieldChange('learningObjectives', updatedLearningObjectives);
  };

  return (
    <div className="space-y-6 p-8" dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">שירות #55: הדרכות וסדנאות למשתמשים</h2>
        <p className="text-gray-600 mt-2">הדרכות מעשיות למשתמשים על מערכות, תהליכים ואוטומציות חדשות</p>
      </div>

      {/* Workshops */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">סדנאות <span className="text-red-500">*</span></h3>
            <button
              type="button"
              onClick={addWorkshop}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + הוסף סדנה
            </button>
          </div>
          {errors.workshops && <p className="text-red-500 text-sm">{errors.workshops}</p>}

          {config.workshops.map((workshop, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">סדנה #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeWorkshop(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  הסר
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">נושא</label>
                <input
                  type="text"
                  value={workshop.topic}
                  onChange={(e) => {
                    const updated = [...config.workshops];
                    updated[index].topic = e.target.value;
                    handleFieldChange('workshops', updated);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Zoho CRM Basics, n8n Automation Workflows"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">קהל יעד</label>
                <input
                  type="text"
                  value={workshop.targetAudience}
                  onChange={(e) => {
                    const updated = [...config.workshops];
                    updated[index].targetAudience = e.target.value;
                    handleFieldChange('workshops', updated);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="צוות מכירות, נציגי שירות לקוחות, מנהלי מערכת"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">מספר משתתפים</label>
                  <input
                    type="number"
                    value={workshop.participantCount}
                    onChange={(e) => {
                      const updated = [...config.workshops];
                      updated[index].participantCount = parseInt(e.target.value) || 10;
                      handleFieldChange('workshops', updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">משך (שעות)</label>
                  <input
                    type="number"
                    value={workshop.durationHours}
                    onChange={(e) => {
                      const updated = [...config.workshops];
                      updated[index].durationHours = parseInt(e.target.value) || 4;
                      handleFieldChange('workshops', updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0.5"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">רמת מיומנות</label>
                  <select
                    value={workshop.skillLevel}
                    onChange={(e) => {
                      const updated = [...config.workshops];
                      updated[index].skillLevel = e.target.value as 'beginner' | 'intermediate' | 'advanced';
                      handleFieldChange('workshops', updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="beginner">מתחילים</option>
                    <option value="intermediate">בינוני</option>
                    <option value="advanced">מתקדמים</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Learning Objectives */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">יעדי למידה</h3>
            <button
              type="button"
              onClick={addLearningObjective}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + הוסף יעד למידה
            </button>
          </div>

          {config.learningObjectives.map((objective, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">יעד למידה #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeLearningObjective(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  הסר
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">נושא הסדנה</label>
                <input
                  type="text"
                  value={objective.workshopTopic}
                  onChange={(e) => {
                    const updated = [...config.learningObjectives];
                    updated[index].workshopTopic = e.target.value;
                    handleFieldChange('learningObjectives', updated);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">קריטריוני הצלחה</label>
                <textarea
                  value={objective.successCriteria}
                  onChange={(e) => {
                    const updated = [...config.learningObjectives];
                    updated[index].successCriteria = e.target.value;
                    handleFieldChange('learningObjectives', updated);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                  placeholder="מה המשתתפים צריכים להיות מסוגלים לעשות לאחר ההדרכה"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Delivery Method */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">שיטת אספקה</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">פורמט</label>
            <select
              value={config.deliveryMethod.format}
              onChange={(e) => handleFieldChange('deliveryMethod.format', e.target.value as 'onsite' | 'remote' | 'hybrid')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="onsite">באתר הלקוח</option>
              <option value="remote">מרחוק (אונליין)</option>
              <option value="hybrid">היברידי</option>
            </select>
          </div>

          {(config.deliveryMethod.format === 'remote' || config.deliveryMethod.format === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">פלטפורמה</label>
              <select
                value={config.deliveryMethod.platform || 'zoom'}
                onChange={(e) => handleFieldChange('deliveryMethod.platform', e.target.value as 'zoom' | 'teams' | 'google_meet' | 'in_person')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="zoom">Zoom</option>
                <option value="teams">Microsoft Teams</option>
                <option value="google_meet">Google Meet</option>
              </select>
            </div>
          )}

          {(config.deliveryMethod.format === 'onsite' || config.deliveryMethod.format === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מיקום</label>
              <input
                type="text"
                value={config.deliveryMethod.location || ''}
                onChange={(e) => handleFieldChange('deliveryMethod.location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="כתובת מלאה"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">אזור זמן</label>
            <input
              type="text"
              value={config.deliveryMethod.timezone || 'Asia/Jerusalem'}
              onChange={(e) => handleFieldChange('deliveryMethod.timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </Card>

      {/* Language & Structure */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">שפה ומבנה סדנה</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">שפה</label>
            <select
              value={config.language}
              onChange={(e) => handleFieldChange('language', e.target.value as 'he' | 'en' | 'both')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="he">עברית</option>
              <option value="en">אנגלית</option>
              <option value="both">דו-לשוני</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">שיקולים תרבותיים</label>
            <textarea
              value={config.culturalConsiderations || ''}
              onChange={(e) => handleFieldChange('culturalConsiderations', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={2}
              placeholder="ממשק מימין לשמאל, דוגמאות עסקיות מקומיות"
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">מבנה הסדנה</h4>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.workshopStructure.introduction}
                onChange={(e) => handleFieldChange('workshopStructure.introduction', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">הקדמה וסקירת סדר יום (15-30 דקות)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.workshopStructure.demonstration}
                onChange={(e) => handleFieldChange('workshopStructure.demonstration', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">הדגמה על ידי המדריך (30-60 דקות)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.workshopStructure.handsOnPractice}
                onChange={(e) => handleFieldChange('workshopStructure.handsOnPractice', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">תרגול מעשי (60-120 דקות)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.workshopStructure.qaSession}
                onChange={(e) => handleFieldChange('workshopStructure.qaSession', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">שאלות ותשובות (30-60 דקות)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.workshopStructure.assessment || false}
                onChange={(e) => handleFieldChange('workshopStructure.assessment', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">מבחן או מטלה מעשית</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Materials */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">חומרי לימוד</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.materials.presentationSlides}
              onChange={(e) => handleFieldChange('materials.presentationSlides', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">מצגת (PowerPoint/Google Slides)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.materials.handouts}
              onChange={(e) => handleFieldChange('materials.handouts', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">חוברות מודפסות או PDF</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.materials.recordedSessions}
              onChange={(e) => handleFieldChange('materials.recordedSessions', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">הקלטות וידאו של המפגשים</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.materials.practiceExercises}
              onChange={(e) => handleFieldChange('materials.practiceExercises', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">תרגילים מעשיים</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.materials.cheatSheets || false}
              onChange={(e) => handleFieldChange('materials.cheatSheets', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">כרטיסי עזר (Cheat Sheets)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.materials.faqDocument || false}
              onChange={(e) => handleFieldChange('materials.faqDocument', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">מסמך שאלות נפוצות</span>
          </label>
        </div>
      </Card>

      {/* Hands-On Environment */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">סביבת תרגול</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.handsOnEnvironment.required}
              onChange={(e) => handleFieldChange('handsOnEnvironment.required', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">נדרשת סביבת תרגול</span>
          </label>

          {config.handsOnEnvironment.required && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">סוג סביבה</label>
                <select
                  value={config.handsOnEnvironment.environmentType}
                  onChange={(e) => handleFieldChange('handsOnEnvironment.environmentType', e.target.value as 'demo_system' | 'sandbox' | 'production_with_test_data' | 'personal_accounts')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="demo_system">מערכת הדגמה</option>
                  <option value="sandbox">Sandbox</option>
                  <option value="production_with_test_data">ייצור עם נתוני בדיקה</option>
                  <option value="personal_accounts">חשבונות אישיים</option>
                </select>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.handsOnEnvironment.demoDataProvided}
                  onChange={(e) => handleFieldChange('handsOnEnvironment.demoDataProvided', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">נתוני הדגמה מסופקים</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.handsOnEnvironment.participantAccess}
                  onChange={(e) => handleFieldChange('handsOnEnvironment.participantAccess', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">למשתתפים יש גישה עם פרטי התחברות</span>
              </label>
            </>
          )}
        </div>
      </Card>

      {/* Schedule */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">לוח זמנים</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">סה"כ מפגשים</label>
            <input
              type="number"
              value={config.schedule.totalSessions}
              onChange={(e) => handleFieldChange('schedule.totalSessions', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">מרווח בין מפגשים</label>
            <input
              type="text"
              value={config.schedule.sessionSpacing || ''}
              onChange={(e) => handleFieldChange('schedule.sessionSpacing', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="אחד לשבוע, ימים רצופים, באותו היום"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.schedule.breaksBetweenSessions}
              onChange={(e) => handleFieldChange('schedule.breaksBetweenSessions', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">הפסקות בין מפגשים</span>
          </label>
        </div>
      </Card>

      {/* Follow-up Support */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">תמיכת המשך</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.followUpSupport.enabled}
              onChange={(e) => handleFieldChange('followUpSupport.enabled', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">תמיכת המשך מופעלת</span>
          </label>

          {config.followUpSupport.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">משך זמן</label>
                <input
                  type="text"
                  value={config.followUpSupport.duration || ''}
                  onChange={(e) => handleFieldChange('followUpSupport.duration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="2 שבועות, חודש אחד"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.followUpSupport.additionalSessionsAvailable || false}
                  onChange={(e) => handleFieldChange('followUpSupport.additionalSessionsAvailable', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">אפשרות למפגשי המשך נוספים</span>
              </label>
            </>
          )}
        </div>
      </Card>

      {/* Assessment & Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">הערכה ולוח זמנים</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.assessment.required}
              onChange={(e) => handleFieldChange('assessment.required', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">הערכה נדרשת</span>
          </label>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ימי הכנה</label>
              <input
                type="number"
                value={config.timeline.preparationDays}
                onChange={(e) => handleFieldChange('timeline.preparationDays', parseInt(e.target.value) || 3)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ימי אספקה</label>
              <input
                type="number"
                value={config.timeline.deliveryDays}
                onChange={(e) => handleFieldChange('timeline.deliveryDays', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0.5"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ימי תמיכה</label>
              <input
                type="number"
                value={config.timeline.followUpDays || 7}
                onChange={(e) => handleFieldChange('timeline.followUpDays', parseInt(e.target.value) || 7)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Success Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">מדדי הצלחה</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              יעד אחוז נוכחות - {config.successMetrics.targetAttendanceRate}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.successMetrics.targetAttendanceRate}
              onChange={(e) => handleFieldChange('successMetrics.targetAttendanceRate', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              יעד אחוז השלמה - {config.successMetrics.targetCompletionRate}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.successMetrics.targetCompletionRate}
              onChange={(e) => handleFieldChange('successMetrics.targetCompletionRate', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              יעד ציון שביעות רצון - {config.successMetrics.targetSatisfactionScore}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={config.successMetrics.targetSatisfactionScore}
              onChange={(e) => handleFieldChange('successMetrics.targetSatisfactionScore', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              יעד ציון מבחן לאחר הדרכה - {config.successMetrics.postTrainingQuizScore || 80}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.successMetrics.postTrainingQuizScore || 80}
              onChange={(e) => handleFieldChange('successMetrics.postTrainingQuizScore', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Deliverables */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">תוצרים</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.deliverables.recordedVideos}
              onChange={(e) => handleFieldChange('deliverables.recordedVideos', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">הקלטות וידאו של מפגשים</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.deliverables.documentationPDF}
              onChange={(e) => handleFieldChange('deliverables.documentationPDF', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">תיעוד (PDF)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.deliverables.exerciseFiles}
              onChange={(e) => handleFieldChange('deliverables.exerciseFiles', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">קבצי תרגול</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.deliverables.faqDocument}
              onChange={(e) => handleFieldChange('deliverables.faqDocument', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">מסמך שאלות נפוצות</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
            checked={config.deliverables.certificatesOfCompletion}
              onChange={(e) => handleFieldChange('deliverables.certificatesOfCompletion', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">תעודות השלמה</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.deliverables.attendanceReport}
              onChange={(e) => handleFieldChange('deliverables.attendanceReport', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">דוח נוכחות</span>
          </label>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSaving ? 'שומר...' : 'שמור הגדרות'}
        </button>
      </div>
    </div>
  );
}
