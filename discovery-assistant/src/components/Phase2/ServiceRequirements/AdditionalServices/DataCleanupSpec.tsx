/**
 * Data Cleanup Requirements Specification Component
 *
 * Service #50: Data Cleanup - ניקוי והסרת כפילויות בנתונים
 * Collects detailed technical requirements for data cleanup service.
 *
 * @component
 * @category AdditionalServices
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import type { DataCleanupRequirements } from '../../../../types/additionalServices';
import { Card } from '../../../Common/Card';

export function DataCleanupSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<DataCleanupRequirements>({
    dataSources: [],
    cleanupScope: {
      removeDuplicates: true,
      fixDataQualityIssues: true,
      standardizeFormats: true,
      enrichData: false,
      mergeAccounts: false
    },
    deduplicationRules: {
      matchFields: [],
      matchingAlgorithm: 'fuzzy',
      fuzzyThreshold: 80,
      mergeStrategy: 'keep_most_complete',
      conflictResolution: []
    },
    dataQualityRules: [],
    backupRequired: true,
    dryRunFirst: true,
    requiresApproval: true,
    stagingEnvironment: false,
    businessRules: [],
    deliverables: {
      beforeAfterReport: true,
      duplicatesList: true,
      cleanedData: true,
      validationReport: true,
      documentedRules: true
    },
    estimatedDays: 5,
    recordVolumeCategory: 'medium',
    successMetrics: {
      targetDuplicateReduction: 95,
      targetDataQualityScore: 90,
      targetEmptyFieldReduction: 80
    }
  });

  // Track if we're currently loading data to prevent save loops
  const isLoadingRef = useRef(false);
  const lastLoadedConfigRef = useRef<string>('');

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'data-cleanup',
    category: 'additionalServices'
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
    };
    saveData(completeConfig);
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing data
  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.additionalServices || [];
    const existing = Array.isArray(category)
      ? category.find(item => item.serviceId === 'data-cleanup')
      : undefined;

    if (existing?.requirements) {
      const existingConfigJson = JSON.stringify(existing.requirements);

      // Only update if the data actually changed (deep comparison)
      if (existingConfigJson !== lastLoadedConfigRef.current) {
        isLoadingRef.current = true;
        lastLoadedConfigRef.current = existingConfigJson;
        setConfig(existing.requirements as DataCleanupRequirements);

        // Reset loading flag after state update completes
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 0);
      }
    }
  }, [currentMeeting?.implementationSpec?.additionalServices]);

  // Auto-save on config changes
  // REMOVED THE FOLLOWING USE EFFECT DUE TO INFINITE LOOP
  // useEffect(() => {
  //   // Only save if we have basic data
  //   if (config.platform.choice) {
  //     saveData(config);
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [config, databaseType.value, alertEmail.value, saveData]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (config.dataSources.length === 0) {
      newErrors.dataSources = 'יש להוסיף לפחות מקור נתונים אחד';
    }

    if (config.deduplicationRules.matchFields.length === 0) {
      newErrors.matchFields = 'יש להוסיף לפחות שדה התאמה אחד';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = useCallback(<T extends keyof DataCleanupRequirements>(
    field: T,
    value: DataCleanupRequirements[T]
  ) => {
    setConfig(prevConfig => {
      const updatedConfig = { ...prevConfig, [field]: value };
      setTimeout(() => {
        if (!isLoadingRef.current) {
          const completeConfig = { ...updatedConfig }; // No smart fields in this component
          saveData(completeConfig);
        }
      }, 0);
      return updatedConfig;
    });
  }, [saveData]);

  const handleNestedFieldChange = useCallback((
    parentField: keyof DataCleanupRequirements,
    nestedPath: string,
    value: any
  ) => {
    setConfig(prevConfig => {
      const updatedConfig = { ...prevConfig };
      let current = updatedConfig[parentField];
      const pathParts = nestedPath.split('.');
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      current[pathParts[pathParts.length - 1]] = value;

      setTimeout(() => {
        if (!isLoadingRef.current) {
          const completeConfig = { ...updatedConfig }; // No smart fields in this component
          saveData(completeConfig);
        }
      }, 0);

      return updatedConfig;
    });
  }, [saveData]);

  // Save handler
  const handleSave = useCallback(async () => {
    if (isLoadingRef.current) return; // Don't save during loading

    if (!validateForm()) {
      alert('נא למלא את כל השדות הנדרשים');
      return;
    }

    const completeConfig = { ...config }; // No smart fields in this component

    await saveData(completeConfig, 'manual');
  }, [config, saveData, validateForm]);

  // Add data source
  const addDataSource = () => {
    setConfig(prevConfig => ({
      ...prevConfig,
      dataSources: [
        ...prevConfig.dataSources,
        {
          systemName: '',
          accessType: 'api',
          recordCount: 0,
          hasBackup: false
        }
      ]
    }));
  };

  // Remove data source
  const removeDataSource = (index: number) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      dataSources: prevConfig.dataSources.filter((_, i) => i !== index)
    }));
  };

  // Add match field
  const addMatchField = () => {
    const field = prompt('הזן שם שדה להתאמה (לדוגמה: email, phone, name):');
    if (field && field.trim()) {
      setConfig(prevConfig => ({
        ...prevConfig,
        deduplicationRules: {
          ...prevConfig.deduplicationRules,
          matchFields: [...prevConfig.deduplicationRules.matchFields, field.trim()]
        }
      }));
    }
  };

  // Remove match field
  const removeMatchField = (index: number) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      deduplicationRules: {
        ...prevConfig.deduplicationRules,
        matchFields: prevConfig.deduplicationRules.matchFields.filter((_, i) => i !== index)
      }
    }));
  };

  // Add data quality rule
  const addDataQualityRule = () => {
    setConfig(prevConfig => ({
      ...prevConfig,
      dataQualityRules: [
        ...(prevConfig.dataQualityRules || []),
        {
          ruleName: '',
          fieldName: '',
          validation: '',
          action: 'flag'
        }
      ]
    }));
  };

  // Remove data quality rule
  const removeDataQualityRule = (index: number) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      dataQualityRules: (prevConfig.dataQualityRules || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6 p-8" dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">שירות #50: ניקוי והסרת כפילויות בנתונים</h2>
        <p className="text-gray-600 mt-2">הסרת כפילויות, איחוד נתונים, תיקון שגיאות ושיפור איכות הנתונים במערכות</p>
      </div>

      {/* Data Sources */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">מקורות נתונים <span className="text-red-500">*</span></h3>
            <button
              type="button"
              onClick={addDataSource}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + הוסף מקור נתונים
            </button>
          </div>
          {errors.dataSources && <p className="text-red-500 text-sm">{errors.dataSources}</p>}

          {config.dataSources.map((source, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">מקור נתונים #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeDataSource(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  הסר
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">שם המערכת</label>
                <input
                  type="text"
                  value={source.systemName}
                  onChange={(e) => {
                    const updated = [...config.dataSources];
                    updated[index].systemName = e.target.value;
                    handleFieldChange('dataSources', updated);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Zoho CRM, MySQL Database, Excel Files"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">סוג גישה</label>
                <select
                  value={source.accessType}
                  onChange={(e) => {
                    const updated = [...config.dataSources];
                    updated[index].accessType = e.target.value as 'api' | 'export' | 'direct_db' | 'spreadsheet';
                    handleFieldChange('dataSources', updated);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="api">API</option>
                  <option value="export">ייצוא קבצים</option>
                  <option value="direct_db">גישה ישירה למסד נתונים</option>
                  <option value="spreadsheet">גיליון אלקטרוני</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">מספר רשומות</label>
                <input
                  type="number"
                  value={source.recordCount}
                  onChange={(e) => {
                    const updated = [...config.dataSources];
                    updated[index].recordCount = parseInt(e.target.value) || 0;
                    handleFieldChange('dataSources', updated);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={source.hasBackup}
                  onChange={(e) => {
                    const updated = [...config.dataSources];
                    updated[index].hasBackup = e.target.checked;
                    handleFieldChange('dataSources', updated);
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">קיים גיבוי</span>
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Cleanup Scope */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">היקף הניקוי</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.cleanupScope.removeDuplicates}
              onChange={(e) => handleNestedFieldChange('cleanupScope', 'removeDuplicates', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">הסרת כפילויות</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.cleanupScope.fixDataQualityIssues}
              onChange={(e) => handleNestedFieldChange('cleanupScope', 'fixDataQualityIssues', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">תיקון בעיות איכות נתונים</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.cleanupScope.standardizeFormats}
              onChange={(e) => handleNestedFieldChange('cleanupScope', 'standardizeFormats', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">סטנדרטיזציה של פורמטים (טלפונים, מיילים, כתובות)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.cleanupScope.enrichData || false}
              onChange={(e) => handleNestedFieldChange('cleanupScope', 'enrichData', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">העשרת נתונים (השלמת מידע חסר)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.cleanupScope.mergeAccounts || false}
              onChange={(e) => handleNestedFieldChange('cleanupScope', 'mergeAccounts', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">איחוד חשבונות קשורים</span>
          </label>
        </div>
      </Card>

      {/* Deduplication Rules */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">כללי זיהוי כפילויות</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                שדות להתאמה <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addMatchField}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                + הוסף שדה
              </button>
            </div>
            {errors.matchFields && <p className="text-red-500 text-sm mb-2">{errors.matchFields}</p>}
            <div className="flex flex-wrap gap-2">
              {config.deduplicationRules.matchFields.map((field, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {field}
                  <button
                    type="button"
                    onClick={() => removeMatchField(index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">אלגוריתם התאמה</label>
            <select
              value={config.deduplicationRules.matchingAlgorithm}
              onChange={(e) => handleNestedFieldChange('deduplicationRules', 'matchingAlgorithm', e.target.value as 'exact' | 'fuzzy' | 'ml_based')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="exact">התאמה מדויקת</option>
              <option value="fuzzy">התאמה מטושטשת (Fuzzy)</option>
              <option value="ml_based">מבוסס למידת מכונה (ML)</option>
            </select>
          </div>

          {config.deduplicationRules.matchingAlgorithm === 'fuzzy' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סף דמיון (0-100) - {config.deduplicationRules.fuzzyThreshold}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={config.deduplicationRules.fuzzyThreshold || 80}
                onChange={(e) => handleNestedFieldChange('deduplicationRules', 'fuzzyThreshold', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">אסטרטגיית איחוד</label>
            <select
              value={config.deduplicationRules.mergeStrategy}
              onChange={(e) => handleNestedFieldChange('deduplicationRules', 'mergeStrategy', e.target.value as 'keep_first' | 'keep_last' | 'keep_most_complete' | 'manual_review')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="keep_first">שמור ראשון</option>
              <option value="keep_last">שמור אחרון</option>
              <option value="keep_most_complete">שמור השלם ביותר</option>
              <option value="manual_review">בדיקה ידנית</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Data Quality Rules */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">כללי איכות נתונים</h3>
            <button
              type="button"
              onClick={addDataQualityRule}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + הוסף כלל
            </button>
          </div>

          {(config.dataQualityRules || []).map((rule, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">כלל #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeDataQualityRule(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  הסר
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">שם הכלל</label>
                  <input
                    type="text"
                    value={rule.ruleName}
                    onChange={(e) => {
                      const updated = [...(config.dataQualityRules || [])];
                      updated[index].ruleName = e.target.value;
                      handleFieldChange('dataQualityRules', updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Valid Email Format"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">שם השדה</label>
                  <input
                    type="text"
                    value={rule.fieldName}
                    onChange={(e) => {
                      const updated = [...(config.dataQualityRules || [])];
                      updated[index].fieldName = e.target.value;
                      handleFieldChange('dataQualityRules', updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">תיאור הוולידציה</label>
                <input
                  type="text"
                  value={rule.validation}
                  onChange={(e) => {
                    const updated = [...(config.dataQualityRules || [])];
                    updated[index].validation = e.target.value;
                    handleFieldChange('dataQualityRules', updated);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="valid email format, phone 10 digits, required field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">פעולה</label>
                <select
                  value={rule.action}
                  onChange={(e) => {
                    const updated = [...(config.dataQualityRules || [])];
                    updated[index].action = e.target.value as 'flag' | 'fix' | 'remove';
                    handleFieldChange('dataQualityRules', updated);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="flag">סימון</option>
                  <option value="fix">תיקון</option>
                  <option value="remove">הסרה</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Backup & Safety */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">גיבוי ובטיחות</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.backupRequired}
              onChange={(e) => handleNestedFieldChange('backupRequired', '', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">נדרש גיבוי לפני הניקוי</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.dryRunFirst}
              onChange={(e) => handleNestedFieldChange('dryRunFirst', '', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">הרצת ניסוי ללא שינויים (Dry Run)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.requiresApproval}
              onChange={(e) => handleNestedFieldChange('requiresApproval', '', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">דרוש אישור ידני לפני ביצוע שינויים</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.stagingEnvironment || false}
              onChange={(e) => handleNestedFieldChange('stagingEnvironment', '', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">ביצוע בסביבת Staging תחילה</span>
          </label>
        </div>
      </Card>

      {/* Deliverables */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">תוצרים</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.deliverables.beforeAfterReport}
              onChange={(e) => handleNestedFieldChange('deliverables', 'beforeAfterReport', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">דוח השוואה לפני/אחרי</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.deliverables.duplicatesList}
              onChange={(e) => handleNestedFieldChange('deliverables', 'duplicatesList', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">רשימת כפילויות שזוהו (Excel)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.deliverables.cleanedData}
              onChange={(e) => handleNestedFieldChange('deliverables', 'cleanedData', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">נתונים מנוקים חזרה למערכת</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.deliverables.validationReport || false}
              onChange={(e) => handleNestedFieldChange('deliverables', 'validationReport', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">דוח וולידציה לאחר הניקוי</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.deliverables.documentedRules || false}
              onChange={(e) => handleNestedFieldChange('deliverables', 'documentedRules', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">תיעוד הכללים שהוחלו</span>
          </label>
        </div>
      </Card>

      {/* Timeline & Success Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">לוח זמנים ומדדי הצלחה</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">זמן משוער (ימים)</label>
            <input
              type="number"
              value={config.estimatedDays}
              onChange={(e) => handleFieldChange('estimatedDays', parseInt(e.target.value) || 5)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">קטגוריית נפח רשומות</label>
            <select
              value={config.recordVolumeCategory}
              onChange={(e) => handleFieldChange('recordVolumeCategory', e.target.value as 'small' | 'medium' | 'large')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="small">קטן (&lt;100K רשומות)</option>
              <option value="medium">בינוני (100K-1M רשומות)</option>
              <option value="large">גדול (&gt;1M רשומות)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              יעד הפחתת כפילויות (%) - {config.successMetrics?.targetDuplicateReduction || 95}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.successMetrics?.targetDuplicateReduction || 95}
              onChange={(e) => handleNestedFieldChange('successMetrics', 'targetDuplicateReduction', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              יעד ציון איכות נתונים (%) - {config.successMetrics?.targetDataQualityScore || 90}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.successMetrics?.targetDataQualityScore || 90}
              onChange={(e) => handleNestedFieldChange('successMetrics', 'targetDataQualityScore', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              יעד הפחתת שדות ריקים (%) - {config.successMetrics?.targetEmptyFieldReduction || 80}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.successMetrics?.targetEmptyFieldReduction || 80}
              onChange={(e) => handleNestedFieldChange('successMetrics', 'targetEmptyFieldReduction', parseInt(e.target.value))}
              className="w-full"
            />
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
          {!isSaving && !saveError && config.dataSources.length > 0 && (
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
