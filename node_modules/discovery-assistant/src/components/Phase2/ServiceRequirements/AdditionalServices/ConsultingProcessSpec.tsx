import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';
import type { ConsultingProcessRequirements } from '../../../../types/additionalServices';
import { Card } from '../../../Common/Card';

export function ConsultingProcessSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart field hooks for data access and error handling
  const databaseType = useSmartField<string>({
    fieldId: 'database_type',
    localPath: 'databaseType',
    serviceId: 'consulting-process',
    autoSave: false,
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'alertEmail',
    serviceId: 'consulting-process',
    autoSave: false,
  });

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'consulting-process',
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

  const [config, setConfig] = useState<ConsultingProcessRequirements>({
    // Process Identification
    processIdentification: [
      {
        processName: '',
        processOwner: '',
        processScope: '',
        processType: 'operational',
        crossFunctional: false,
      },
    ],

    // Analysis Methodology
    analysisMethodology: {
      approach: 'hybrid',
      dmaic: {
        define: true,
        measure: true,
        analyze: true,
        improve: true,
        control: true,
      },
      valueStreamMapping: false,
      bpmnModeling: false,
      fiveWhysAnalysis: false,
      rootCauseAnalysis: false,
    },

    // Stakeholder Engagement
    stakeholderEngagement: {
      stakeholders: [
        {
          role: '',
          involvement: 'interview',
          availabilityHours: 1,
        },
      ],
      workshopsRequired: false,
    },

    // Current State Analysis
    currentStateAnalysis: {
      documentationExists: false,
      needsObservation: true,
      needsDataCollection: true,
      dataToCollect: [
        {
          metric: '',
          source: '',
          historicalPeriod: '',
        },
      ],
      painPoints: [],
    },

    // Data Collection
    dataCollection: {
      historicalDataAccess: false,
      dataSources: [],
      metrics: [
        {
          metricName: '',
          currentValue: '',
          targetValue: '',
        },
      ],
      surveyRequired: false,
      interviewsRequired: false,
      timeTrackingRequired: false,
    },

    // Gap Analysis
    gapAnalysis: {
      currentStateIssues: [],
      desiredState: '',
      gapSize: 'moderate',
    },

    // Improvement Goals
    improvementGoals: {
      primaryGoal: '',
      secondaryGoals: [],
      targetMetrics: [
        {
          metric: '',
          currentValue: '',
          targetValue: '',
        },
      ],
    },

    // Process Mapping
    processMapping: {
      currentStateMap: true,
      futureStateMap: true,
      swimLaneFormat: false,
      toolsUsed: [],
      bpmnCompliant: false,
    },

    // Recommendations
    recommendations: {
      quickWins: [],
      strategicChanges: [],
      automationOpportunities: [
        {
          task: '',
          automationMethod: '',
          estimatedSavingsHours: 0,
        },
      ],
    },

    // ROI Analysis
    roiAnalysis: {
      required: true,
      currentCosts: {},
      projectedSavings: {},
      paybackPeriodMonths: 6,
      netPresentValue: 0,
      roiPercent: 0,
    },

    // Implementation Timeline
    implementationTimeline: {
      analysisPhaseWeeks: 2,
      designPhaseWeeks: 2,
      implementationPhaseWeeks: 4,
      testingPhaseWeeks: 1,
      totalWeeks: 9,
      milestones: [],
    },

    // Success Criteria
    successCriteria: {
      processMetrics: [],
      stakeholderSatisfaction: true,
      costSavings: true,
      errorReduction: false,
      cycleTimeReduction: true,
    },

    // Deliverables
    deliverables: {
      processMaps: true,
      analysisReport: true,
      implementationPlan: true,
      trainingMaterials: false,
      monitoringDashboard: false,
      changeManagementPlan: false,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const category =
      currentMeeting?.implementationSpec?.additionalServices || [];
    const existing = category.find(
      (item) => item.serviceId === 'consulting-process'
    );
    if (existing?.requirements) {
      setConfig(existing.requirements as ConsultingProcessRequirements);
    }
  }, [currentMeeting]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (
      config.processIdentification.length === 0 ||
      config.processIdentification[0].processName.trim() === ''
    ) {
      newErrors.processName = 'יש להזין לפחות שם תהליך אחד';
    }

    if (!databaseType.value) {
      newErrors.databaseType = 'יש לבחור סוג מסד נתונים';
    }

    if (!alertEmail.value) {
      newErrors.alertEmail = 'יש להזין כתובת אימייל להתראות';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save handler
  const handleSave = async () => {
    if (!validateForm()) {
      alert('נא למלא את כל השדות הנדרשים');
      return;
    }

    const completeConfig = {
      ...config,
      databaseType: databaseType.value,
      alertEmail: alertEmail.value,
    };

    await saveData(completeConfig);
  };

  // Helper functions for managing arrays
  const addProcess = () => {
    setConfig({
      ...config,
      processIdentification: [
        ...config.processIdentification,
        {
          processName: '',
          processOwner: '',
          processScope: '',
          processType: 'operational',
          crossFunctional: false,
        },
      ],
    });
  };

  const removeProcess = (index: number) => {
    setConfig({
      ...config,
      processIdentification: config.processIdentification.filter(
        (_, i) => i !== index
      ),
    });
  };

  const addStakeholder = () => {
    setConfig({
      ...config,
      stakeholderEngagement: {
        ...config.stakeholderEngagement,
        stakeholders: [
          ...config.stakeholderEngagement.stakeholders,
          {
            role: '',
            involvement: 'interview',
            availabilityHours: 1,
          },
        ],
      },
    });
  };

  const removeStakeholder = (index: number) => {
    setConfig({
      ...config,
      stakeholderEngagement: {
        ...config.stakeholderEngagement,
        stakeholders: config.stakeholderEngagement.stakeholders.filter(
          (_, i) => i !== index
        ),
      },
    });
  };

  const addDataMetric = () => {
    setConfig({
      ...config,
      dataCollection: {
        ...config.dataCollection,
        metrics: [
          ...config.dataCollection.metrics,
          {
            metricName: '',
            currentValue: '',
            targetValue: '',
          },
        ],
      },
    });
  };

  const removeDataMetric = (index: number) => {
    setConfig({
      ...config,
      dataCollection: {
        ...config.dataCollection,
        metrics: config.dataCollection.metrics.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <div className="space-y-6 p-8" dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          שירות #58: ייעוץ תהליכים
        </h2>
        <p className="text-gray-600 mt-2">
          ניתוח וייעוץ מקצועי לשיפור תהליכי עבודה בעסק
        </p>
      </div>

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

      {/* Process Identification */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              זיהוי תהליכים <span className="text-red-500">*</span>
            </h3>
            <button
              type="button"
              onClick={addProcess}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + הוסף תהליך
            </button>
          </div>
          {errors.processName && (
            <p className="text-red-500 text-sm">{errors.processName}</p>
          )}

          {config.processIdentification.map((process, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-medium">תהליך #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeProcess(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    שם התהליך
                  </label>
                  <input
                    type="text"
                    value={process.processName}
                    onChange={(e) => {
                      const updated = [...config.processIdentification];
                      updated[index].processName = e.target.value;
                      setConfig({ ...config, processIdentification: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="למשל: מעבר מליד למכירה"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    בעל התהליך
                  </label>
                  <input
                    type="text"
                    value={process.processOwner}
                    onChange={(e) => {
                      const updated = [...config.processIdentification];
                      updated[index].processOwner = e.target.value;
                      setConfig({ ...config, processIdentification: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="מחלקה או תפקיד"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    היקף התהליך
                  </label>
                  <textarea
                    value={process.processScope}
                    onChange={(e) => {
                      const updated = [...config.processIdentification];
                      updated[index].processScope = e.target.value;
                      setConfig({ ...config, processIdentification: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    placeholder="נקודת התחלה וסיום של התהליך"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    סוג תהליך
                  </label>
                  <select
                    value={process.processType}
                    onChange={(e) => {
                      const updated = [...config.processIdentification];
                      updated[index].processType = e.target.value as any;
                      setConfig({ ...config, processIdentification: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="operational">תפעולי</option>
                    <option value="management">ניהולי</option>
                    <option value="supporting">תומך</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={process.crossFunctional}
                      onChange={(e) => {
                        const updated = [...config.processIdentification];
                        updated[index].crossFunctional = e.target.checked;
                        setConfig({
                          ...config,
                          processIdentification: updated,
                        });
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">תהליך בין-מחלקתי</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Analysis Methodology */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">מתודולוגיית ניתוח</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              גישה לניתוח
            </label>
            <select
              value={config.analysisMethodology.approach}
              onChange={(e) =>
                setConfig({
                  ...config,
                  analysisMethodology: {
                    ...config.analysisMethodology,
                    approach: e.target.value as any,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="lean_six_sigma">Lean Six Sigma</option>
              <option value="value_stream_mapping">Value Stream Mapping</option>
              <option value="bpmn">BPMN</option>
              <option value="process_mining">Process Mining</option>
              <option value="hybrid">משולב</option>
            </select>
          </div>

          {config.analysisMethodology.approach === 'lean_six_sigma' &&
            config.analysisMethodology.dmaic && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">DMAIC (Lean Six Sigma)</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { key: 'define', label: 'Define' },
                    { key: 'measure', label: 'Measure' },
                    { key: 'analyze', label: 'Analyze' },
                    { key: 'improve', label: 'Improve' },
                    { key: 'control', label: 'Control' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={
                          config.analysisMethodology.dmaic[
                            key as keyof typeof config.analysisMethodology.dmaic
                          ]
                        }
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            analysisMethodology: {
                              ...config.analysisMethodology,
                              dmaic: {
                                ...config.analysisMethodology.dmaic,
                                [key]: e.target.checked,
                              },
                            },
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.analysisMethodology.valueStreamMapping}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    analysisMethodology: {
                      ...config.analysisMethodology,
                      valueStreamMapping: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm">Value Stream Mapping</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.analysisMethodology.bpmnModeling}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    analysisMethodology: {
                      ...config.analysisMethodology,
                      bpmnModeling: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm">BPMN Modeling</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Stakeholder Engagement */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">מעורבות בעלי עניין</h3>
            <button
              type="button"
              onClick={addStakeholder}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + הוסף בעל עניין
            </button>
          </div>

          {config.stakeholderEngagement.stakeholders.map(
            (stakeholder, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">בעל עניין #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeStakeholder(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      תפקיד
                    </label>
                    <input
                      type="text"
                      value={stakeholder.role}
                      onChange={(e) => {
                        const updated = [
                          ...config.stakeholderEngagement.stakeholders,
                        ];
                        updated[index].role = e.target.value;
                        setConfig({
                          ...config,
                          stakeholderEngagement: {
                            ...config.stakeholderEngagement,
                            stakeholders: updated,
                          },
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="למשל: מנהל מכירות"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      סוג מעורבות
                    </label>
                    <select
                      value={stakeholder.involvement}
                      onChange={(e) => {
                        const updated = [
                          ...config.stakeholderEngagement.stakeholders,
                        ];
                        updated[index].involvement = e.target.value as any;
                        setConfig({
                          ...config,
                          stakeholderEngagement: {
                            ...config.stakeholderEngagement,
                            stakeholders: updated,
                          },
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="interview">ראיון</option>
                      <option value="workshop">סדנה</option>
                      <option value="observation">תצפית</option>
                      <option value="data_provider">ספק נתונים</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      שעות זמינות
                    </label>
                    <input
                      type="number"
                      value={stakeholder.availabilityHours}
                      onChange={(e) => {
                        const updated = [
                          ...config.stakeholderEngagement.stakeholders,
                        ];
                        updated[index].availabilityHours =
                          parseInt(e.target.value) || 1;
                        setConfig({
                          ...config,
                          stakeholderEngagement: {
                            ...config.stakeholderEngagement,
                            stakeholders: updated,
                          },
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            )
          )}

          <div className="flex items-center gap-4 pt-4 border-t">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.stakeholderEngagement.workshopsRequired}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    stakeholderEngagement: {
                      ...config.stakeholderEngagement,
                      workshopsRequired: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm">נדרשים סדנאות</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Current State Analysis */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">ניתוח מצב נוכחי</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.currentStateAnalysis.documentationExists}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    currentStateAnalysis: {
                      ...config.currentStateAnalysis,
                      documentationExists: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm">קיימת תיעוד של התהליך</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.currentStateAnalysis.needsObservation}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    currentStateAnalysis: {
                      ...config.currentStateAnalysis,
                      needsObservation: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm">נדרשת תצפית בתהליך</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              נקודות כאב ידועות
            </label>
            <textarea
              value={config.currentStateAnalysis.painPoints.join('\n')}
              onChange={(e) =>
                setConfig({
                  ...config,
                  currentStateAnalysis: {
                    ...config.currentStateAnalysis,
                    painPoints: e.target.value
                      .split('\n')
                      .filter((p) => p.trim()),
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="כל בעיה בשורה נפרדת"
            />
          </div>
        </div>
      </Card>

      {/* Data Collection */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">איסוף נתונים</h3>
            <button
              type="button"
              onClick={addDataMetric}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + הוסף מדד
            </button>
          </div>

          {config.dataCollection.metrics.map((metric, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-medium">מדד #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeDataMetric(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    שם המדד
                  </label>
                  <input
                    type="text"
                    value={metric.metricName}
                    onChange={(e) => {
                      const updated = [...config.dataCollection.metrics];
                      updated[index].metricName = e.target.value;
                      setConfig({
                        ...config,
                        dataCollection: {
                          ...config.dataCollection,
                          metrics: updated,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="למשל: זמן טיפול ממוצע"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ערך נוכחי
                  </label>
                  <input
                    type="text"
                    value={metric.currentValue}
                    onChange={(e) => {
                      const updated = [...config.dataCollection.metrics];
                      updated[index].currentValue = e.target.value;
                      setConfig({
                        ...config,
                        dataCollection: {
                          ...config.dataCollection,
                          metrics: updated,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ערך יעד
                  </label>
                  <input
                    type="text"
                    value={metric.targetValue}
                    onChange={(e) => {
                      const updated = [...config.dataCollection.metrics];
                      updated[index].targetValue = e.target.value;
                      setConfig({
                        ...config,
                        dataCollection: {
                          ...config.dataCollection,
                          metrics: updated,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.dataCollection.surveyRequired}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    dataCollection: {
                      ...config.dataCollection,
                      surveyRequired: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm">נדרש סקר</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.dataCollection.interviewsRequired}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    dataCollection: {
                      ...config.dataCollection,
                      interviewsRequired: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm">נדרשים ראונות</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.dataCollection.timeTrackingRequired}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    dataCollection: {
                      ...config.dataCollection,
                      timeTrackingRequired: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm">נדרש מעקב זמן</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Technical Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">הגדרות טכניות</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {databaseType.metadata.label.he}{' '}
                <span className="text-red-500">*</span>
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
            {errors.databaseType && (
              <p className="text-red-500 text-sm mt-1">{errors.databaseType}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {alertEmail.metadata.label.he}{' '}
                <span className="text-red-500">*</span>
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
            {errors.alertEmail && (
              <p className="text-red-500 text-sm mt-1">{errors.alertEmail}</p>
            )}
          </div>
        </div>
      </Card>

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
            config.processIdentification.some((p) => p.processName) && (
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
  );
}
