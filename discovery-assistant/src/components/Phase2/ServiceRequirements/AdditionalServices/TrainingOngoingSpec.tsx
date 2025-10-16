import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { TrainingOngoingRequirements } from '../../../../types/additionalServices';
import { Card } from '../../../Common/Card';

export function TrainingOngoingSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart field hooks for data access and error handling
  const databaseType = useSmartField<string>({
    fieldId: 'database_type',
    localPath: 'databaseType',
    serviceId: 'training-ongoing',
    autoSave: false,
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'alertEmail',
    serviceId: 'training-ongoing',
    autoSave: false,
  });

  const [config, setConfig] = useState<TrainingOngoingRequirements>({
    training: {
      durationMonths: 6,
      hoursPerMonth: 4,
      trainingTopics: [],
      skillLevel: 'intermediate',
      deliveryMethod: 'remote',
      materialsProvided: true,
      assessmentIncluded: false,
    },
    support: {
      supportLevel: 'standard',
      responseTime: '24h',
      supportChannels: ['email', 'chat'],
      escalationProcess: true,
    },
    frequency: {
      trainingSessions: 'monthly',
      reviewMeetings: 'quarterly',
      progressReports: 'monthly',
    },
    deliverables: {
      trainingMaterials: true,
      progressReports: true,
      certificates: false,
      accessPortal: true,
    },
  });

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'training-ongoing',
    category: 'additionalServices',
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      databaseType: databaseType.value,
      alertEmail: alertEmail.value,
    };
    saveData(completeConfig);
  });

  // Load existing data
  useEffect(() => {
    const category =
      currentMeeting?.implementationSpec?.additionalServices || [];
    const existing = category.find(
      (s: any) => s.serviceId === 'training-ongoing'
    );
    if (existing?.requirements) {
      setConfig(existing.requirements as TrainingOngoingRequirements);
    }
  }, [currentMeeting]);

  // Save handler
  const handleSave = async () => {
    const completeConfig = {
      ...config,
      databaseType: databaseType.value,
      alertEmail: alertEmail.value,
    };

    await saveData(completeConfig);
  };

  // Helper functions for managing arrays
  const addTrainingTopic = () => {
    setConfig({
      ...config,
      training: {
        ...config.training,
        trainingTopics: [
          ...config.training.trainingTopics,
          {
            topic: '',
            duration: 1,
            skillLevel: 'beginner',
          },
        ],
      },
    });
  };

  const removeTrainingTopic = (index: number) => {
    setConfig({
      ...config,
      training: {
        ...config.training,
        trainingTopics: config.training.trainingTopics.filter(
          (_, i) => i !== index
        ),
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Smart Fields Info Banner */}
      {(databaseType.isAutoPopulated || alertEmail.isAutoPopulated) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">
              נתונים מולאו אוטומטית משלב 1
            </h4>
            <p className="text-sm text-blue-800">
              חלק מהשדות מולאו באופן אוטומטי מהנתונים שנאספו בשלב 1. תוכל לערוך
              אותם במידת הצורך.
            </p>
          </div>
        </div>
      )}

      <Card title="שירות #56: הדרכה מתמשכת">
        <div className="space-y-6">
          {/* Training Configuration */}
          <div>
            <h4 className="font-medium mb-3">הגדרות הדרכה</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  משך ההדרכה (חודשים)
                </label>
                <input
                  type="number"
                  value={config.training.durationMonths}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      training: {
                        ...config.training,
                        durationMonths: parseInt(e.target.value) || 6,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="1"
                  max="24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שעות הדרכה לחודש
                </label>
                <input
                  type="number"
                  value={config.training.hoursPerMonth}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      training: {
                        ...config.training,
                        hoursPerMonth: parseInt(e.target.value) || 4,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="1"
                  max="40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  רמת מיומנות
                </label>
                <select
                  value={config.training.skillLevel}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      training: {
                        ...config.training,
                        skillLevel: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="beginner">מתחיל</option>
                  <option value="intermediate">בינוני</option>
                  <option value="advanced">מתקדם</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שיטת לימוד
                </label>
                <select
                  value={config.training.deliveryMethod}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      training: {
                        ...config.training,
                        deliveryMethod: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="remote">מרחוק</option>
                  <option value="in_person">פרונטלי</option>
                  <option value="hybrid">היברידי</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.training.materialsProvided}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      training: {
                        ...config.training,
                        materialsProvided: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm">חומרי לימוד מסופקים</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.training.assessmentIncluded}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      training: {
                        ...config.training,
                        assessmentIncluded: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm">הערכה כלולה</span>
              </label>
            </div>
          </div>

          {/* Support Configuration */}
          <div>
            <h4 className="font-medium mb-3">תמיכה</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  רמת תמיכה
                </label>
                <select
                  value={config.support.supportLevel}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      support: {
                        ...config.support,
                        supportLevel: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="basic">בסיסי</option>
                  <option value="standard">סטנדרטי</option>
                  <option value="premium">פרימיום</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  זמן תגובה
                </label>
                <select
                  value={config.support.responseTime}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      support: {
                        ...config.support,
                        responseTime: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="24h">24 שעות</option>
                  <option value="12h">12 שעות</option>
                  <option value="4h">4 שעות</option>
                  <option value="1h">שעה</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ערוצי תמיכה
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['email', 'chat', 'phone', 'video'].map((channel) => (
                  <label key={channel} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.support.supportChannels.includes(channel)}
                      onChange={(e) => {
                        const channels = e.target.checked
                          ? [...config.support.supportChannels, channel]
                          : config.support.supportChannels.filter(
                              (c) => c !== channel
                            );
                        setConfig({
                          ...config,
                          support: {
                            ...config.support,
                            supportChannels: channels,
                          },
                        });
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">
                      {channel === 'email' && 'אימייל'}
                      {channel === 'chat' && "צ'אט"}
                      {channel === 'phone' && 'טלפון'}
                      {channel === 'video' && 'וידאו'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={config.support.escalationProcess}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    support: {
                      ...config.support,
                      escalationProcess: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm">תהליך הסלמה</span>
            </label>
          </div>

          {/* Frequency Configuration */}
          <div>
            <h4 className="font-medium mb-3">תדירות</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  הדרכות
                </label>
                <select
                  value={config.frequency.trainingSessions}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      frequency: {
                        ...config.frequency,
                        trainingSessions: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="weekly">שבועי</option>
                  <option value="monthly">חודשי</option>
                  <option value="quarterly">רבעוני</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  פגישות ביקורת
                </label>
                <select
                  value={config.frequency.reviewMeetings}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      frequency: {
                        ...config.frequency,
                        reviewMeetings: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="monthly">חודשי</option>
                  <option value="quarterly">רבעוני</option>
                  <option value="biannual">חצי שנתי</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  דוחות התקדמות
                </label>
                <select
                  value={config.frequency.progressReports}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      frequency: {
                        ...config.frequency,
                        progressReports: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="weekly">שבועי</option>
                  <option value="monthly">חודשי</option>
                  <option value="quarterly">רבעוני</option>
                </select>
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <h4 className="font-medium mb-3">תוצרים</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.deliverables.trainingMaterials}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      deliverables: {
                        ...config.deliverables,
                        trainingMaterials: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm">חומרי הדרכה</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.deliverables.progressReports}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      deliverables: {
                        ...config.deliverables,
                        progressReports: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm">דוחות התקדמות</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.deliverables.certificates}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      deliverables: {
                        ...config.deliverables,
                        certificates: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm">תעודות</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.deliverables.accessPortal}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      deliverables: {
                        ...config.deliverables,
                        accessPortal: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm">פורטל גישה</span>
              </label>
            </div>
          </div>

          {/* Technical Configuration */}
          <div className="border-t pt-6">
            <h4 className="font-medium mb-3">הגדרות טכניות</h4>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {databaseType.metadata.label.he}
                  </label>
                  {databaseType.isAutoPopulated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      מולא אוטומטית
                    </span>
                  )}
                </div>
                <select
                  value={databaseType.value || 'default'}
                  onChange={(e) => databaseType.setValue(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    databaseType.isAutoPopulated
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                  } ${databaseType.hasConflict ? 'border-orange-300' : ''}`}
                >
                  <option value="default" disabled>
                    בחר סוג מסד נתונים
                  </option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="sql_server">SQL Server</option>
                  <option value="mongodb">MongoDB</option>
                </select>
                {databaseType.hasConflict && (
                  <div className="flex items-center gap-2 mt-1 text-orange-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>ערך שונה מהנתונים הקודמים - נא לוודא</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {alertEmail.metadata.label.he}
                  </label>
                  {alertEmail.isAutoPopulated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      מולא אוטומטית
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  value={alertEmail.value || ''}
                  onChange={(e) => alertEmail.setValue(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    alertEmail.isAutoPopulated
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                  } ${alertEmail.hasConflict ? 'border-orange-300' : ''}`}
                  placeholder="admin@company.com"
                />
                {alertEmail.hasConflict && (
                  <div className="flex items-center gap-2 mt-1 text-orange-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>ערך שונה מהנתונים הקודמים - נא לוודא</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Status and Button */}
          <div className="flex justify-between items-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              {isSaving && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">שומר אוטומטית...</span>
                </div>
              )}
              {saveError && (
                <div className="flex items-center gap-2 text-red-600">
                  <span className="text-sm">שגיאה בשמירה</span>
                </div>
              )}
              {!isSaving &&
                !saveError &&
                config.training.durationMonths > 0 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm">נשמר אוטומטית</span>
                  </div>
                )}
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSaving ? 'שומר...' : 'שמור ידנית'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
