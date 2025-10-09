/**
 * Add Custom Reports Requirements Specification Component
 * Service #53: Add Custom Reports - דוחות מותאמים אישית
 */

import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AddCustomReportsRequirements } from '../../../../types/additionalServices';
import { Card } from '../../../Common/Card';

export function AddCustomReportsSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<AddCustomReportsRequirements>({
    reportSpecifications: [],
    dataRequirements: {
      dataSources: [],
      dataFields: [],
      dateRanges: true,
      dynamicParameters: true
    },
    breakdownsAndGrouping: {
      groupBy: [],
      sortBy: [],
      subtotals: true,
      grandTotals: true,
      pivotTables: false
    },
    calculations: [],
    visualizations: {
      includesCharts: true,
      chartTypes: ['bar', 'line'],
      includesTables: true,
      colorCoding: true,
      sparklines: false
    },
    exportFormats: {
      primaryFormat: 'excel',
      additionalFormats: ['pdf', 'csv'],
      templateDesign: true
    },
    generation: {
      generationMethod: 'power_bi_builder',
      generationFrequency: 'on_demand',
      averageDataVolume: 'medium',
      performanceTarget: 60
    },
    sqlRequirements: {
      complexityLevel: 'medium',
      requiresStoredProcedures: false,
      requiresViews: false,
      requiresWindowFunctions: false
    },
    deliverables: {
      sampleReport: true,
      reportTemplate: true,
      technicalDocumentation: true,
      executionInstructions: true,
      sourceCode: false
    },
    timeline: {
      complexity: 'medium',
      estimatedDays: 3,
      includesDataModeling: false
    },
    distribution: {
      recipients: [],
      deliveryMethod: 'email',
      frequency: 'weekly'
    },
    successCriteria: {
      dataAccuracy: true,
      stakeholderApproval: true,
      performanceTarget: 'Generate in <5 minutes'
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.additionalServices || [];
    const existing = Array.isArray(category)
      ? category.find(item => item.serviceId === 'add-custom-reports')
      : undefined;

    if (existing?.requirements) {
      setConfig(existing.requirements as AddCustomReportsRequirements);
    }
  }, [currentMeeting]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (config.reportSpecifications.length === 0) {
      newErrors.reports = 'יש להוסיף לפחות דוח אחד';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      alert('נא למלא את כל השדות הנדרשים');
      return;
    }
    if (!currentMeeting) return;

    setIsSaving(true);
    try {
      const category = currentMeeting?.implementationSpec?.additionalServices || [];
      const updated = category.filter(item => item.serviceId !== 'add-custom-reports');

      updated.push({
        serviceId: 'add-custom-reports',
        serviceName: 'דוחות מותאמים',
        requirements: config,
        completedAt: new Date().toISOString()
      });

      await updateMeeting({
        implementationSpec: {
          ...currentMeeting.implementationSpec,
          additionalServices: updated
        }
      });

      alert('הגדרות נשמרו בהצלחה!');
    } catch (error) {
      console.error('Error saving add-custom-reports config:', error);
      alert('שגיאה בשמירת הגדרות');
    } finally {
      setIsSaving(false);
    }
  };

  const addReport = () => {
    setConfig({
      ...config,
      reportSpecifications: [
        ...config.reportSpecifications,
        {
          reportName: '',
          reportPurpose: '',
          reportType: 'summary',
          hasSampleReport: false,
          hasMockup: false
        }
      ]
    });
  };

  const removeReport = (index: number) => {
    setConfig({
      ...config,
      reportSpecifications: config.reportSpecifications.filter((_, i) => i !== index)
    });
  };

  const addDataField = () => {
    setConfig({
      ...config,
      dataRequirements: {
        ...config.dataRequirements,
        dataFields: [
          ...config.dataRequirements.dataFields,
          {
            fieldName: '',
            fieldSource: '',
            dataType: 'text',
            requiresCalculation: ''
          }
        ]
      }
    });
  };

  const removeDataField = (index: number) => {
    setConfig({
      ...config,
      dataRequirements: {
        ...config.dataRequirements,
        dataFields: config.dataRequirements.dataFields.filter((_, i) => i !== index)
      }
    });
  };

  const addCalculation = () => {
    setConfig({
      ...config,
      calculations: [
        ...(config.calculations || []),
        {
          calculationName: '',
          formula: '',
          displayFormat: ''
        }
      ]
    });
  };

  const removeCalculation = (index: number) => {
    setConfig({
      ...config,
      calculations: (config.calculations || []).filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6 p-8" dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">שירות #53: דוחות מותאמים אישית</h2>
        <p className="text-gray-600 mt-2">דוחות עם פירוטים, נתונים וחישובים ייחודיים לעסק</p>
      </div>

      {/* Report Specifications */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">מפרט דוחות <span className="text-red-500">*</span></h3>
            <button
              type="button"
              onClick={addReport}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + הוסף דוח
            </button>
          </div>
          {errors.reports && <p className="text-red-500 text-sm">{errors.reports}</p>}

          {config.reportSpecifications.map((report, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">דוח #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeReport(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  הסר
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">שם הדוח</label>
                <input
                  type="text"
                  value={report.reportName}
                  onChange={(e) => {
                    const updated = [...config.reportSpecifications];
                    updated[index].reportName = e.target.value;
                    setConfig({ ...config, reportSpecifications: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="מכירות חודשיות לפי אזור"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">מטרת הדוח</label>
                <textarea
                  value={report.reportPurpose}
                  onChange={(e) => {
                    const updated = [...config.reportSpecifications];
                    updated[index].reportPurpose = e.target.value;
                    setConfig({ ...config, reportSpecifications: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                  placeholder="איזו שאלה עסקית הדוח עונה עליה?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">סוג דוח</label>
                <select
                  value={report.reportType}
                  onChange={(e) => {
                    const updated = [...config.reportSpecifications];
                    updated[index].reportType = e.target.value as any;
                    setConfig({ ...config, reportSpecifications: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="summary">סיכום</option>
                  <option value="detailed">מפורט</option>
                  <option value="analytical">אנליטי</option>
                  <option value="operational">תפעולי</option>
                  <option value="dashboard_style">סגנון דשבורד</option>
                </select>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={report.hasSampleReport}
                    onChange={(e) => {
                      const updated = [...config.reportSpecifications];
                      updated[index].hasSampleReport = e.target.checked;
                      setConfig({ ...config, reportSpecifications: updated });
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">יש דוח לדוגמה</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={report.hasMockup}
                    onChange={(e) => {
                      const updated = [...config.reportSpecifications];
                      updated[index].hasMockup = e.target.checked;
                      setConfig({ ...config, reportSpecifications: updated });
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">יש Mockup ויזואלי</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Data Fields */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">שדות נתונים</h3>
            <button
              type="button"
              onClick={addDataField}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + הוסף שדה
            </button>
          </div>

          {config.dataRequirements.dataFields.map((field, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">שדה #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeDataField(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  הסר
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">שם השדה</label>
                  <input
                    type="text"
                    value={field.fieldName}
                    onChange={(e) => {
                      const updated = [...config.dataRequirements.dataFields];
                      updated[index].fieldName = e.target.value;
                      setConfig({
                        ...config,
                        dataRequirements: { ...config.dataRequirements, dataFields: updated }
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">מקור השדה</label>
                  <input
                    type="text"
                    value={field.fieldSource}
                    onChange={(e) => {
                      const updated = [...config.dataRequirements.dataFields];
                      updated[index].fieldSource = e.target.value;
                      setConfig({
                        ...config,
                        dataRequirements: { ...config.dataRequirements, dataFields: updated }
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">סוג נתון</label>
                  <select
                    value={field.dataType}
                    onChange={(e) => {
                      const updated = [...config.dataRequirements.dataFields];
                      updated[index].dataType = e.target.value as any;
                      setConfig({
                        ...config,
                        dataRequirements: { ...config.dataRequirements, dataFields: updated }
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="text">טקסט</option>
                    <option value="number">מספר</option>
                    <option value="date">תאריך</option>
                    <option value="currency">מטבע</option>
                    <option value="boolean">כן/לא</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">חישוב נדרש</label>
                  <input
                    type="text"
                    value={field.requiresCalculation || ''}
                    onChange={(e) => {
                      const updated = [...config.dataRequirements.dataFields];
                      updated[index].requiresCalculation = e.target.value;
                      setConfig({
                        ...config,
                        dataRequirements: { ...config.dataRequirements, dataFields: updated }
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="SUM, AVG, COUNT"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Breakdowns & Grouping */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">פירוטים וקיבוץ</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.breakdownsAndGrouping.subtotals}
              onChange={(e) => setConfig({
                ...config,
                breakdownsAndGrouping: { ...config.breakdownsAndGrouping, subtotals: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">סיכומי ביניים</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.breakdownsAndGrouping.grandTotals}
              onChange={(e) => setConfig({
                ...config,
                breakdownsAndGrouping: { ...config.breakdownsAndGrouping, grandTotals: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">סיכום כולל</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.breakdownsAndGrouping.pivotTables || false}
              onChange={(e) => setConfig({
                ...config,
                breakdownsAndGrouping: { ...config.breakdownsAndGrouping, pivotTables: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">טבלאות Pivot</span>
          </label>
        </div>
      </Card>

      {/* Calculations */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">חישובים</h3>
            <button
              type="button"
              onClick={addCalculation}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + הוסף חישוב
            </button>
          </div>

          {(config.calculations || []).map((calc, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">חישוב #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeCalculation(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  הסר
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">שם החישוב</label>
                <input
                  type="text"
                  value={calc.calculationName}
                  onChange={(e) => {
                    const updated = [...(config.calculations || [])];
                    updated[index].calculationName = e.target.value;
                    setConfig({ ...config, calculations: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="שולי רווח, שיעור המרה"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">נוסחה</label>
                <input
                  type="text"
                  value={calc.formula}
                  onChange={(e) => {
                    const updated = [...(config.calculations || [])];
                    updated[index].formula = e.target.value;
                    setConfig({ ...config, calculations: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="(הכנסות - עלויות) / הכנסות * 100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">פורמט תצוגה</label>
                <input
                  type="text"
                  value={calc.displayFormat}
                  onChange={(e) => {
                    const updated = [...(config.calculations || [])];
                    updated[index].displayFormat = e.target.value;
                    setConfig({ ...config, calculations: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="אחוזים עם 2 ספרות אחרי הנקודה"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Visualizations, Export, Generation */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">ויזואליזציות וייצוא</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.visualizations.includesCharts}
              onChange={(e) => setConfig({
                ...config,
                visualizations: { ...config.visualizations, includesCharts: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">כולל תרשימים</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.visualizations.includesTables}
              onChange={(e) => setConfig({
                ...config,
                visualizations: { ...config.visualizations, includesTables: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">כולל טבלאות</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">פורמט יצוא ראשי</label>
            <select
              value={config.exportFormats.primaryFormat}
              onChange={(e) => setConfig({
                ...config,
                exportFormats: { ...config.exportFormats, primaryFormat: e.target.value as any }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
              <option value="word">Word</option>
              <option value="html">HTML</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">שיטת יצירה</label>
            <select
              value={config.generation.generationMethod}
              onChange={(e) => setConfig({
                ...config,
                generation: { ...config.generation, generationMethod: e.target.value as any }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="ssrs">SSRS</option>
              <option value="crystal_reports">Crystal Reports</option>
              <option value="power_bi_builder">Power BI Report Builder</option>
              <option value="python_custom">Python מותאם</option>
              <option value="nodejs_custom">Node.js מותאם</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">לוח זמנים</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">מורכבות</label>
            <select
              value={config.timeline.complexity}
              onChange={(e) => setConfig({
                ...config,
                timeline: { ...config.timeline, complexity: e.target.value as any }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="simple">פשוט (1-2 ימים)</option>
              <option value="medium">בינוני (3-5 ימים)</option>
              <option value="complex">מורכב (5-7 ימים)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">זמן משוער (ימים)</label>
            <input
              type="number"
              value={config.timeline.estimatedDays}
              onChange={(e) => setConfig({
                ...config,
                timeline: { ...config.timeline, estimatedDays: parseInt(e.target.value) || 3 }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="1"
            />
          </div>
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
