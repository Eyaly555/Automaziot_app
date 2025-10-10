/**
 * Data Migration Requirements Specification Component
 *
 * Service #51: Data Migration - העברת נתונים בין מערכות
 * Collects detailed technical requirements for data migration service.
 *
 * @component
 * @category AdditionalServices
 */

import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { DataMigrationRequirements } from '../../../../types/additionalServices';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { Card } from '../../../Common/Card';

export function DataMigrationSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<DataMigrationRequirements>({
    sourceSystems: [],
    targetSystems: [],
    migrationStrategy: {
      approach: 'phased',
      phasePlan: [],
      pilotRecordCount: 100,
      freezeSourceDuringMigration: false
    },
    fieldMapping: {
      hasMappingDocument: false,
      mappingComplexity: 'medium',
      requiresDataTransformation: false,
      customCalculations: []
    },
    dataTransformation: [],
    testingApproach: {
      pocMigration: true,
      pocRecordCount: 100,
      validationRules: [],
      userAcceptanceTesting: true,
      rollbackPlan: true
    },
    dataPreparation: {
      cleanupRequired: false,
      deduplicationNeeded: false,
      dataValidationNeeded: true,
      enrichmentNeeded: false
    },
    rollbackPlan: {
      hasBackup: true,
      backupLocation: '',
      rollbackProcedure: '',
      snapshotBeforeMigration: true
    },
    deliverables: {
      fieldMappingDocument: true,
      migrationScripts: true,
      validationReport: true,
      rollbackProcedure: true,
      userDocumentation: false
    },
    timeline: {
      pocDays: 2,
      fullMigrationDays: 7,
      postMigrationValidationDays: 2
    },
    successCriteria: {
      targetCompletionRate: 100,
      maxErrorRate: 1,
      referentialIntegrityCheck: true,
      userAcceptanceRequired: true
    }
  });

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    moduleId: 'data-migration',
    immediateFields: ['sourceSystems', 'targetSystems', 'migrationStrategy'], // Critical configuration fields
    debounceMs: 1000,
    onError: (error) => {
      console.error('Auto-save error in DataMigrationSpec:', error);
    }
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
      ? category.find(item => item.serviceId === 'data-migration')
      : undefined;

    if (existing?.requirements) {
      setConfig(existing.requirements as DataMigrationRequirements);
    }
  }, [currentMeeting]);

  // Auto-save on changes
  useEffect(() => {
    if (config.sourceSystems?.length || config.targetSystems?.length) {
      saveData(config);
    }
  }, [config, saveData]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (config.sourceSystems.length === 0) {
      newErrors.sourceSystems = 'יש להוסיף לפחות מערכת מקור אחת';
    }

    if (config.targetSystems.length === 0) {
      newErrors.targetSystems = 'יש להוסיף לפחות מערכת יעד אחת';
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

    // Save using auto-save (manual save trigger)
    await saveData(config, 'manual');

    alert('הגדרות נשמרו בהצלחה!');
  };

  // Add source system
  const addSourceSystem = () => {
    setConfig({
      ...config,
      sourceSystems: [
        ...config.sourceSystems,
        {
          systemName: '',
          systemType: 'CRM',
          accessMethod: 'export',
          apiCredentials: false,
          exportFormat: 'csv',
          recordCount: 0,
          dataQualityScore: 80
        }
      ]
    });
  };

  // Remove source system
  const removeSourceSystem = (index: number) => {
    setConfig({
      ...config,
      sourceSystems: config.sourceSystems.filter((_, i) => i !== index)
    });
  };

  // Add target system
  const addTargetSystem = () => {
    setConfig({
      ...config,
      targetSystems: [
        ...config.targetSystems,
        {
          systemName: '',
          systemType: 'CRM',
          importMethod: 'api',
          apiCredentials: false,
          hasAdminAccess: true,
          requiresFieldMapping: true
        }
      ]
    });
  };

  // Remove target system
  const removeTargetSystem = (index: number) => {
    setConfig({
      ...config,
      targetSystems: config.targetSystems.filter((_, i) => i !== index)
    });
  };

  // Add phase to migration plan
  const addPhase = () => {
    const phase = prompt('הזן תיאור שלב (לדוגמה: Phase 1: Accounts, Phase 2: Contacts):');
    if (phase && phase.trim()) {
      setConfig({
        ...config,
        migrationStrategy: {
          ...config.migrationStrategy,
          phasePlan: [...(config.migrationStrategy.phasePlan || []), phase.trim()]
        }
      });
    }
  };

  // Remove phase
  const removePhase = (index: number) => {
    setConfig({
      ...config,
      migrationStrategy: {
        ...config.migrationStrategy,
        phasePlan: (config.migrationStrategy.phasePlan || []).filter((_, i) => i !== index)
      }
    });
  };

  // Add custom calculation
  const addCustomCalculation = () => {
    setConfig({
      ...config,
      fieldMapping: {
        ...config.fieldMapping,
        customCalculations: [
          ...(config.fieldMapping.customCalculations || []),
          {
            targetField: '',
            formula: ''
          }
        ]
      }
    });
  };

  // Remove custom calculation
  const removeCustomCalculation = (index: number) => {
    setConfig({
      ...config,
      fieldMapping: {
        ...config.fieldMapping,
        customCalculations: (config.fieldMapping.customCalculations || []).filter((_, i) => i !== index)
      }
    });
  };

  // Add validation rule
  const addValidationRule = () => {
    const rule = prompt('הזן כלל אימות (לדוגמה: Record count match, Referential integrity):');
    if (rule && rule.trim()) {
      setConfig({
        ...config,
        testingApproach: {
          ...config.testingApproach,
          validationRules: [...config.testingApproach.validationRules, rule.trim()]
        }
      });
    }
  };

  // Remove validation rule
  const removeValidationRule = (index: number) => {
    setConfig({
      ...config,
      testingApproach: {
        ...config.testingApproach,
        validationRules: config.testingApproach.validationRules.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <div className="space-y-6 p-8" dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">שירות #51: העברת נתונים בין מערכות</h2>
        <p className="text-gray-600 mt-2">העברת נתונים בין מערכות (CRM ישן לחדש, Excel ל-CRM, איחוד מספר מקורות)</p>
      </div>

      {/* Source Systems */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">מערכות מקור <span className="text-red-500">*</span></h3>
            <button
              type="button"
              onClick={addSourceSystem}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + הוסף מערכת מקור
            </button>
          </div>
          {errors.sourceSystems && <p className="text-red-500 text-sm">{errors.sourceSystems}</p>}

          {config.sourceSystems.map((system, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">מערכת מקור #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeSourceSystem(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  הסר
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">שם המערכת</label>
                  <input
                    type="text"
                    value={system.systemName}
                    onChange={(e) => {
                      const updated = [...config.sourceSystems];
                      updated[index].systemName = e.target.value;
                      setConfig({ ...config, sourceSystems: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Old Salesforce, Excel Files, Legacy Database"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">סוג מערכת</label>
                  <input
                    type="text"
                    value={system.systemType}
                    onChange={(e) => {
                      const updated = [...config.sourceSystems];
                      updated[index].systemType = e.target.value;
                      setConfig({ ...config, sourceSystems: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="CRM, Database, Spreadsheet"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">שיטת גישה</label>
                  <select
                    value={system.accessMethod}
                    onChange={(e) => {
                      const updated = [...config.sourceSystems];
                      updated[index].accessMethod = e.target.value as 'api' | 'export' | 'direct_db' | 'ftp' | 'manual';
                      setConfig({ ...config, sourceSystems: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="api">API</option>
                    <option value="export">ייצוא קבצים</option>
                    <option value="direct_db">גישה ישירה למסד נתונים</option>
                    <option value="ftp">FTP</option>
                    <option value="manual">ידני</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">פורמט ייצוא</label>
                  <select
                    value={system.exportFormat || 'csv'}
                    onChange={(e) => {
                      const updated = [...config.sourceSystems];
                      updated[index].exportFormat = e.target.value as 'csv' | 'excel' | 'json' | 'sql' | 'xml';
                      setConfig({ ...config, sourceSystems: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="csv">CSV</option>
                    <option value="excel">Excel</option>
                    <option value="json">JSON</option>
                    <option value="sql">SQL</option>
                    <option value="xml">XML</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">מספר רשומות</label>
                  <input
                    type="number"
                    value={system.recordCount}
                    onChange={(e) => {
                      const updated = [...config.sourceSystems];
                      updated[index].recordCount = parseInt(e.target.value) || 0;
                      setConfig({ ...config, sourceSystems: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ציון איכות נתונים - {system.dataQualityScore || 80}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={system.dataQualityScore || 80}
                    onChange={(e) => {
                      const updated = [...config.sourceSystems];
                      updated[index].dataQualityScore = parseInt(e.target.value);
                      setConfig({ ...config, sourceSystems: updated });
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Target Systems */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">מערכות יעד <span className="text-red-500">*</span></h3>
            <button
              type="button"
              onClick={addTargetSystem}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + הוסף מערכת יעד
            </button>
          </div>
          {errors.targetSystems && <p className="text-red-500 text-sm">{errors.targetSystems}</p>}

          {config.targetSystems.map((system, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">מערכת יעד #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeTargetSystem(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  הסר
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">שם המערכת</label>
                  <input
                    type="text"
                    value={system.systemName}
                    onChange={(e) => {
                      const updated = [...config.targetSystems];
                      updated[index].systemName = e.target.value;
                      setConfig({ ...config, targetSystems: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Zoho CRM, New Database, Data Warehouse"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">סוג מערכת</label>
                  <input
                    type="text"
                    value={system.systemType}
                    onChange={(e) => {
                      const updated = [...config.targetSystems];
                      updated[index].systemType = e.target.value;
                      setConfig({ ...config, targetSystems: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="CRM, Database"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">שיטת ייבוא</label>
                <select
                  value={system.importMethod}
                  onChange={(e) => {
                    const updated = [...config.targetSystems];
                    updated[index].importMethod = e.target.value as 'api' | 'bulk_import' | 'direct_db' | 'etl_tool';
                    setConfig({ ...config, targetSystems: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="api">API</option>
                  <option value="bulk_import">ייבוא המוני</option>
                  <option value="direct_db">גישה ישירה למסד נתונים</option>
                  <option value="etl_tool">כלי ETL</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={system.hasAdminAccess}
                    onChange={(e) => {
                      const updated = [...config.targetSystems];
                      updated[index].hasAdminAccess = e.target.checked;
                      setConfig({ ...config, targetSystems: updated });
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">יש גישת מנהל</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={system.requiresFieldMapping}
                    onChange={(e) => {
                      const updated = [...config.targetSystems];
                      updated[index].requiresFieldMapping = e.target.checked;
                      setConfig({ ...config, targetSystems: updated });
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">דרוש מיפוי שדות</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Migration Strategy */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">אסטרטגיית העברה</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">גישה</label>
            <select
              value={config.migrationStrategy.approach}
              onChange={(e) => setConfig({
                ...config,
                migrationStrategy: {
                  ...config.migrationStrategy,
                  approach: e.target.value as 'big_bang' | 'phased' | 'parallel' | 'pilot_first'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="big_bang">Big Bang (העברה אחת גדולה)</option>
              <option value="phased">Phased (בשלבים)</option>
              <option value="parallel">Parallel (הרצה מקבילה)</option>
              <option value="pilot_first">Pilot First (פיילוט קודם)</option>
            </select>
          </div>

          {(config.migrationStrategy.approach === 'phased' || config.migrationStrategy.approach === 'pilot_first') && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">תוכנית שלבים</label>
                <button
                  type="button"
                  onClick={addPhase}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  + הוסף שלב
                </button>
              </div>
              <div className="space-y-2">
                {(config.migrationStrategy.phasePlan || []).map((phase, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <span className="flex-1 text-sm">{phase}</span>
                    <button
                      type="button"
                      onClick={() => removePhase(index)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      הסר
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {config.migrationStrategy.approach === 'pilot_first' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מספר רשומות בפיילוט</label>
              <input
                type="number"
                value={config.migrationStrategy.pilotRecordCount || 100}
                onChange={(e) => setConfig({
                  ...config,
                  migrationStrategy: {
                    ...config.migrationStrategy,
                    pilotRecordCount: parseInt(e.target.value) || 100
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
              />
            </div>
          )}

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.migrationStrategy.freezeSourceDuringMigration}
              onChange={(e) => setConfig({
                ...config,
                migrationStrategy: {
                  ...config.migrationStrategy,
                  freezeSourceDuringMigration: e.target.checked
                }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">הקפאת מערכת מקור במהלך ההעברה</span>
          </label>
        </div>
      </Card>

      {/* Field Mapping */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">מיפוי שדות</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.fieldMapping.hasMappingDocument}
              onChange={(e) => setConfig({
                ...config,
                fieldMapping: { ...config.fieldMapping, hasMappingDocument: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">קיים מסמך מיפוי</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">מורכבות מיפוי</label>
            <select
              value={config.fieldMapping.mappingComplexity}
              onChange={(e) => setConfig({
                ...config,
                fieldMapping: {
                  ...config.fieldMapping,
                  mappingComplexity: e.target.value as 'simple' | 'medium' | 'complex'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="simple">פשוט (1-to-1)</option>
              <option value="medium">בינוני (טרנספורמציות)</option>
              <option value="complex">מורכב (חישובים)</option>
            </select>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.fieldMapping.requiresDataTransformation}
              onChange={(e) => setConfig({
                ...config,
                fieldMapping: { ...config.fieldMapping, requiresDataTransformation: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">דורש טרנספורמציית נתונים</span>
          </label>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">חישובים מותאמים</label>
              <button
                type="button"
                onClick={addCustomCalculation}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                + הוסף חישוב
              </button>
            </div>

            {(config.fieldMapping.customCalculations || []).map((calc, index) => (
              <div key={index} className="border border-gray-200 rounded p-3 space-y-2 mb-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">חישוב #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomCalculation(index)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    הסר
                  </button>
                </div>

                <input
                  type="text"
                  value={calc.targetField}
                  onChange={(e) => {
                    const updated = [...(config.fieldMapping.customCalculations || [])];
                    updated[index].targetField = e.target.value;
                    setConfig({
                      ...config,
                      fieldMapping: { ...config.fieldMapping, customCalculations: updated }
                    });
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="שדה יעד"
                />

                <input
                  type="text"
                  value={calc.formula}
                  onChange={(e) => {
                    const updated = [...(config.fieldMapping.customCalculations || [])];
                    updated[index].formula = e.target.value;
                    setConfig({
                      ...config,
                      fieldMapping: { ...config.fieldMapping, customCalculations: updated }
                    });
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="נוסחה (לדוגמה: firstName + ' ' + lastName)"
                />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Testing Approach */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">גישת בדיקה</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.testingApproach.pocMigration}
              onChange={(e) => setConfig({
                ...config,
                testingApproach: { ...config.testingApproach, pocMigration: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">POC Migration (הוכחת יכולת)</span>
          </label>

          {config.testingApproach.pocMigration && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מספר רשומות ב-POC</label>
              <input
                type="number"
                value={config.testingApproach.pocRecordCount || 100}
                onChange={(e) => setConfig({
                  ...config,
                  testingApproach: {
                    ...config.testingApproach,
                    pocRecordCount: parseInt(e.target.value) || 100
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
              />
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">כללי אימות</label>
              <button
                type="button"
                onClick={addValidationRule}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                + הוסף כלל
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.testingApproach.validationRules.map((rule, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {rule}
                  <button
                    type="button"
                    onClick={() => removeValidationRule(index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.testingApproach.userAcceptanceTesting}
              onChange={(e) => setConfig({
                ...config,
                testingApproach: { ...config.testingApproach, userAcceptanceTesting: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">בדיקות קבלה משתמש (UAT)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.testingApproach.rollbackPlan}
              onChange={(e) => setConfig({
                ...config,
                testingApproach: { ...config.testingApproach, rollbackPlan: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">תוכנית Rollback</span>
          </label>
        </div>
      </Card>

      {/* Data Preparation & Rollback */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">הכנת נתונים וגיבוי</h3>
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">הכנת נתונים</h4>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.dataPreparation.cleanupRequired}
                onChange={(e) => setConfig({
                  ...config,
                  dataPreparation: { ...config.dataPreparation, cleanupRequired: e.target.checked }
                })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">נדרש ניקוי</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.dataPreparation.deduplicationNeeded}
                onChange={(e) => setConfig({
                  ...config,
                  dataPreparation: { ...config.dataPreparation, deduplicationNeeded: e.target.checked }
                })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">נדרש הסרת כפילויות</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.dataPreparation.dataValidationNeeded}
                onChange={(e) => setConfig({
                  ...config,
                  dataPreparation: { ...config.dataPreparation, dataValidationNeeded: e.target.checked }
                })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">נדרש אימות נתונים</span>
            </label>
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium">תוכנית Rollback</h4>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.rollbackPlan.hasBackup}
                onChange={(e) => setConfig({
                  ...config,
                  rollbackPlan: { ...config.rollbackPlan, hasBackup: e.target.checked }
                })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">קיים גיבוי</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מיקום גיבוי</label>
              <input
                type="text"
                value={config.rollbackPlan.backupLocation || ''}
                onChange={(e) => setConfig({
                  ...config,
                  rollbackPlan: { ...config.rollbackPlan, backupLocation: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="\\server\backups, AWS S3 bucket"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">תהליך Rollback</label>
              <textarea
                value={config.rollbackPlan.rollbackProcedure}
                onChange={(e) => setConfig({
                  ...config,
                  rollbackPlan: { ...config.rollbackPlan, rollbackProcedure: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="תיאור השלבים לביצוע Rollback"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.rollbackPlan.snapshotBeforeMigration}
                onChange={(e) => setConfig({
                  ...config,
                  rollbackPlan: { ...config.rollbackPlan, snapshotBeforeMigration: e.target.checked }
                })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Snapshot לפני ההעברה</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Timeline & Success Criteria */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">לוח זמנים ומדדי הצלחה</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ימי POC</label>
              <input
                type="number"
                value={config.timeline.pocDays}
                onChange={(e) => setConfig({
                  ...config,
                  timeline: { ...config.timeline, pocDays: parseInt(e.target.value) || 2 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ימי העברה מלאה</label>
              <input
                type="number"
                value={config.timeline.fullMigrationDays}
                onChange={(e) => setConfig({
                  ...config,
                  timeline: { ...config.timeline, fullMigrationDays: parseInt(e.target.value) || 7 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ימי אימות</label>
              <input
                type="number"
                value={config.timeline.postMigrationValidationDays}
                onChange={(e) => setConfig({
                  ...config,
                  timeline: { ...config.timeline, postMigrationValidationDays: parseInt(e.target.value) || 2 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              יעד אחוז השלמה - {config.successCriteria.targetCompletionRate}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.successCriteria.targetCompletionRate}
              onChange={(e) => setConfig({
                ...config,
                successCriteria: {
                  ...config.successCriteria,
                  targetCompletionRate: parseInt(e.target.value)
                }
              })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              מקסימום שגיאות מותר - {config.successCriteria.maxErrorRate}%
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={config.successCriteria.maxErrorRate}
              onChange={(e) => setConfig({
                ...config,
                successCriteria: {
                  ...config.successCriteria,
                  maxErrorRate: parseFloat(e.target.value)
                }
              })}
              className="w-full"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.successCriteria.referentialIntegrityCheck}
              onChange={(e) => setConfig({
                ...config,
                successCriteria: {
                  ...config.successCriteria,
                  referentialIntegrityCheck: e.target.checked
                }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">בדיקת שלמות התייחסותית</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.successCriteria.userAcceptanceRequired}
              onChange={(e) => setConfig({
                ...config,
                successCriteria: {
                  ...config.successCriteria,
                  userAcceptanceRequired: e.target.checked
                }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">נדרש אישור משתמש</span>
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
