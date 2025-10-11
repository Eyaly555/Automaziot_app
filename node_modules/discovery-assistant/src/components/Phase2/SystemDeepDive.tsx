import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMeetingStore } from '../../store/useMeetingStore';
import { DetailedSystemSpec, SystemModule, SystemAuthentication, DataMigration } from '../../types';
import { AcceptanceCriteria, FunctionalRequirement, PerformanceRequirement, SecurityRequirement } from '../../types/phase2';
import { Server, Save, ArrowLeft, Plus, Trash2, Key, Database, FileText, BookOpen, CheckSquare, Sparkles, Loader } from 'lucide-react';
import { SystemSpecProgress, SystemSpecSection } from './SystemSpecProgress';
import { Input, Select, TextArea, Button, Option } from '../Base';
import { getSystemAuthTemplate } from '../../config/systemsAuthDatabase';
import { generateAcceptanceCriteria, getSystemCriteria } from '../../utils/acceptanceCriteriaGenerator';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const SystemDeepDive: React.FC = () => {
  const navigate = useNavigate();
  const { systemId } = useParams<{ systemId: string }>();
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Get the Phase 1 system data
  const phase1System = currentMeeting?.modules?.systems?.detailedSystems?.find(
    (s: any) => s.id === systemId
  );

  // Check if we already have a Phase 2 deep dive for this system
  const existingDeepDive = currentMeeting?.implementationSpec?.systems.find(
    (s: DetailedSystemSpec) => s.systemId === systemId
  );

  // If no Phase 1 system found, redirect back
  if (!phase1System && !existingDeepDive) {
    navigate('/phase2/systems');
    return null;
  }

  // Initialize system deep dive - pre-fill from Phase 1 if available
  const [system, setSystem] = useState<DetailedSystemSpec>(existingDeepDive || {
    id: generateId(),
    systemId: phase1System!.id,
    systemName: phase1System!.specificSystem,

    // NEW: Authentication - need to collect in Phase 2
    authentication: {
      method: 'api_key', // Default, user will specify
      credentialsProvided: false,
      apiEndpoint: '',
      rateLimits: '',
      testAccountAvailable: false
    },

    // NEW: Modules - need to collect in Phase 2
    modules: [],

    // Pre-fill data migration from Phase 1
    dataMigration: {
      required: (phase1System!.recordCount || 0) > 0,
      recordCount: phase1System!.recordCount || 0,
      cleanupNeeded: false,
      historicalDataYears: 0,
      migrationMethod: 'api',
      dataSanitizationNeeded: false,
      testMigrationFirst: true,
      rollbackPlan: ''
    },

    // Pre-fill technical notes from Phase 1
    technicalNotes: phase1System!.customNotes || ''
  });

  const [activeTab, setActiveTab] = useState<'auth' | 'modules' | 'migration' | 'acceptance'>('auth');
  const [authTemplate] = useState(getSystemAuthTemplate(phase1System?.specificSystem || ''));
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);
  const [systemCriteria, setSystemCriteria] = useState<AcceptanceCriteria | null>(null);

  // Pre-fill from auth template when system loads
  useEffect(() => {
    if (authTemplate && !existingDeepDive) {
      setSystem(prev => ({
        ...prev,
        authentication: {
          ...prev.authentication,
          method: authTemplate.defaultAuthMethod,
          apiEndpoint: authTemplate.apiEndpoint,
          rateLimits: authTemplate.rateLimits
        }
      }));
    }
  }, [authTemplate, existingDeepDive]);

  // Load existing criteria for this system
  useEffect(() => {
    if (currentMeeting?.implementationSpec?.acceptanceCriteria) {
      const filtered = getSystemCriteria(
        currentMeeting.implementationSpec.acceptanceCriteria,
        system.systemName
      );
      setSystemCriteria(filtered);
    }
  }, [currentMeeting, system.systemName]);

  const handleSave = () => {
    if (!currentMeeting?.implementationSpec) return;

    const isNew = !existingDeepDive;
    const updatedSystems = isNew
      ? [...currentMeeting.implementationSpec.systems, system]
      : currentMeeting.implementationSpec.systems.map((s: DetailedSystemSpec) => s.id === system.id ? system : s);

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        systems: updatedSystems,
        lastUpdated: new Date()
      }
    });

    navigate('/phase2');
  };

  const handleGenerateCriteria = async () => {
    if (!currentMeeting) return;

    setIsGeneratingCriteria(true);
    try {
      // Generate full acceptance criteria from the entire meeting
      const fullCriteria = await generateAcceptanceCriteria(currentMeeting);

      // Filter to get only criteria for this system
      const filtered = getSystemCriteria(fullCriteria, system.systemName);
      setSystemCriteria(filtered);

      // Save the full criteria to meeting (not just this system's)
      updateMeeting({
        implementationSpec: {
          ...currentMeeting.implementationSpec!,
          acceptanceCriteria: fullCriteria,
          lastUpdated: new Date(),
          updatedBy: 'user'
        }
      });
    } catch (error) {
      console.error('Failed to generate acceptance criteria:', error);
      alert('שגיאה ביצירת קריטריוני קבלה');
    } finally {
      setIsGeneratingCriteria(false);
    }
  };

  const updateCriterion = (
    type: 'functional' | 'performance' | 'security' | 'usability',
    id: string,
    updates: Partial<FunctionalRequirement> | Partial<PerformanceRequirement> | Partial<SecurityRequirement> | Partial<any>
  ) => {
    if (!currentMeeting?.implementationSpec?.acceptanceCriteria || !systemCriteria) return;

    const fullCriteria = currentMeeting.implementationSpec.acceptanceCriteria;
    const updatedCriteria = {
      ...fullCriteria,
      [type]: fullCriteria[type]?.map((item: FunctionalRequirement | PerformanceRequirement | SecurityRequirement | any) =>
        item.id === id ? { ...item, ...updates } : item
      )
    };

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        acceptanceCriteria: updatedCriteria,
        lastUpdated: new Date()
      }
    });

    // Update local state
    const filtered = getSystemCriteria(updatedCriteria, system.systemName);
    setSystemCriteria(filtered);
  };

  const addModule = () => {
    const newModule: SystemModule = {
      id: generateId(),
      name: '',
      fields: [],
      customFields: [],
      recordCount: 0,
      requiresMapping: true
    };
    setSystem({ ...system, modules: [...system.modules, newModule] });
  };

  const removeModule = (moduleId: string) => {
    setSystem({
      ...system,
      modules: system.modules.filter((m: SystemModule) => m.id !== moduleId)
    });
  };

  const updateModule = (moduleId: string, updates: Partial<SystemModule>) => {
    setSystem({
      ...system,
      modules: system.modules.map((m: SystemModule) =>
        m.id === moduleId ? { ...m, ...updates } : m
      )
    });
  };

    const sections: SystemSpecSection[] = [
        { name: 'אימות וגישה', completed: system.authentication.credentialsProvided, required: true },
        { name: 'מודולים ושדות', completed: system.modules.length > 0, required: true },
        { name: 'העברת נתונים', completed: !system.dataMigration.required || (system.dataMigration.required && !!system.dataMigration.rollbackPlan), required: system.dataMigration.required },
        { name: 'קריטריוני קבלה', completed: !!systemCriteria && ((systemCriteria.functional?.length || 0) > 0 || (systemCriteria.performance?.length || 0) > 0 || (systemCriteria.security?.length || 0) > 0), required: true }
    ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/phase2/systems')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {system.systemName}
                </h1>
                <p className="text-gray-600 text-sm">פירוט טכני מלא • מ-Phase 1: {phase1System?.category}</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              variant="primary"
              icon={<Save className="w-5 h-5" />}
            >
              שמור
            </Button>
          </div>

          {/* Phase 1 Context Card */}
          {phase1System && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Server className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">מידע מ-Phase 1</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">רשומות במערכת:</span>
                      <span className="font-bold text-blue-900 mr-2">
                        {phase1System.recordCount?.toLocaleString('he-IL') || 'לא צוין'}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">גישת API:</span>
                      <span className="font-bold text-blue-900 mr-2">
                        {phase1System.apiAccess === 'full' ? 'מלאה' :
                         phase1System.apiAccess === 'limited' ? 'מוגבלת' :
                         phase1System.apiAccess === 'none' ? 'אין' : 'לא ידוע'}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">נקודות כאב:</span>
                      <span className="font-bold text-blue-900 mr-2">
                        {phase1System.mainPainPoints?.length || 0}
                      </span>
                    </div>
                  </div>
                  {phase1System.mainPainPoints && phase1System.mainPainPoints.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-blue-800 mb-1">נקודות כאב עיקריות:</p>
                      <div className="flex flex-wrap gap-2">
                        {phase1System.mainPainPoints.slice(0, 3).map((pain: string, idx: number) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {pain}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Progress Component */}
        <SystemSpecProgress
            systemName={system.systemName}
            sections={sections}
        />

        <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { id: 'auth', label: 'אימות וגישה', icon: Key },
                { id: 'modules', label: 'מודולים ושדות', icon: Database },
                { id: 'migration', label: 'העברת נתונים', icon: FileText },
                { id: 'acceptance', label: 'קריטריוני קבלה', icon: CheckSquare }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                    activeTab === id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Basic Info (always visible) */}
            {activeTab === 'auth' && (
              <div className="space-y-6">
                {/* Auth Template Guide */}
                {authTemplate && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-900 mb-2">
                          מצאנו תבנית אימות ל-{authTemplate.systemName}
                        </h4>
                        <div className="text-sm text-green-800 whitespace-pre-line mb-3">
                          {authTemplate.authGuide}
                        </div>
                        <a
                          href={authTemplate.documentation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-green-700 hover:text-green-900 underline"
                        >
                          תיעוד רשמי ↗
                        </a>
                        {authTemplate.notes && (
                          <p className="text-xs text-green-700 mt-2 border-t border-green-200 pt-2">
                            💡 {authTemplate.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <Input
                    label="שם המערכת *"
                    value={system.systemName}
                    onChange={(value) => setSystem({ ...system, systemName: value })}
                    placeholder="לדוגמה: Salesforce, HubSpot, Zoho CRM"
                    required
                  />

                  <Select
                    label="שיטת אימות *"
                    value={system.authentication.method}
                    onChange={(value) => setSystem({
                      ...system,
                      authentication: {
                        ...system.authentication,
                        method: value as SystemAuthentication['method']
                      }
                    })}
                    options={[
                        { value: 'oauth', label: 'OAuth 2.0' },
                        { value: 'api_key', label: 'API Key' },
                        { value: 'basic_auth', label: 'Basic Auth' },
                        { value: 'jwt', label: 'JWT Token' },
                        { value: 'custom', label: 'Custom' }
                    ]}
                    required
                  />
                </div>

                <Input
                  label="API Endpoint"
                  type="text"
                  value={system.authentication.apiEndpoint || ''}
                  onChange={(value) => setSystem({
                    ...system,
                    authentication: {
                      ...system.authentication,
                      apiEndpoint: value
                    }
                  })}
                  placeholder="https://api.example.com/v1"
                />

                <Input
                  label="Rate Limits"
                  value={system.authentication.rateLimits || ''}
                  onChange={(value) => setSystem({
                    ...system,
                    authentication: {
                      ...system.authentication,
                      rateLimits: value
                    }
                  })}
                  placeholder="לדוגמה: 1000 requests/hour"
                />

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={system.authentication.credentialsProvided}
                      onChange={(e) => setSystem({
                        ...system,
                        authentication: {
                          ...system.authentication,
                          credentialsProvided: e.target.checked
                        }
                      })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">פרטי גישה סופקו</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={system.authentication.testAccountAvailable}
                      onChange={(e) => setSystem({
                        ...system,
                        authentication: {
                          ...system.authentication,
                          testAccountAvailable: e.target.checked
                        }
                      })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">חשבון טסט זמין</span>
                  </label>
                </div>

                {system.authentication.method === 'custom' && (
                  <TextArea
                    label="פרטי אימות מותאם"
                    value={system.authentication.customAuthDetails || ''}
                    onChange={(value) => setSystem({
                      ...system,
                      authentication: {
                        ...system.authentication,
                        customAuthDetails: value
                      }
                    })}
                    rows={4}
                    placeholder="תאר את שיטת האימות המותאמת..."
                  />
                )}
              </div>
            )}

            {activeTab === 'modules' && (
              <div className="space-y-6">
                {/* Suggested Modules from Template */}
                {authTemplate && authTemplate.commonModules && authTemplate.commonModules.length > 0 && system.modules.length === 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Database className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          מודולים נפוצים ב-{authTemplate.systemName}
                        </h4>
                        <p className="text-sm text-blue-800 mb-3">
                          תוכל להוסיף את המודולים הנפוצים הבאים במהירות:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {authTemplate.commonModules.map((moduleName: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => {
                                const newModule: SystemModule = {
                                  id: generateId(),
                                  name: moduleName,
                                  fields: [],
                                  customFields: [],
                                  recordCount: 0,
                                  requiresMapping: true
                                };
                                setSystem({ ...system, modules: [...system.modules, newModule] });
                              }}
                              className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition"
                            >
                              + {moduleName}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">מודולים במערכת</h3>
                  <button
                    onClick={addModule}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-5 h-5" />
                    הוסף מודול
                  </button>
                </div>

                {system.modules.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">טרם הוגדרו מודולים</p>
                    <button
                      onClick={addModule}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      הוסף מודול ראשון
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {system.modules.map((module: SystemModule) => (
                      <div key={module.id} className="p-6 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <Input
                              label="שם המודול"
                              value={module.name}
                              onChange={(value) => updateModule(module.id, { name: value })}
                              placeholder="לדוגמה: Contacts, Deals, Products"
                            />

                            <Input
                              label="מספר רשומות"
                              type="number"
                              value={String(module.recordCount)}
                              onChange={(value) => updateModule(module.id, { recordCount: parseInt(value) || 0 })}
                              placeholder="0"
                            />
                          </div>

                          <button
                            onClick={() => removeModule(module.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={module.requiresMapping}
                            onChange={(e) => updateModule(module.id, { requiresMapping: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">דורש מיפוי שדות</span>
                        </label>

                        <div className="mt-4 text-sm text-gray-600">
                          {module.fields.length + module.customFields.length} שדות מוגדרים
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'migration' && (
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer mb-6">
                    <input
                      type="checkbox"
                      checked={system.dataMigration.required}
                      onChange={(e) => setSystem({
                        ...system,
                        dataMigration: {
                          ...system.dataMigration,
                          required: e.target.checked
                        }
                      })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-lg font-semibold text-gray-900">נדרשת העברת נתונים</span>
                  </label>
                </div>

                {system.dataMigration.required && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <Input
                        label="מספר רשומות להעברה"
                        type="number"
                        value={String(system.dataMigration.recordCount)}
                        onChange={(value) => setSystem({
                          ...system,
                          dataMigration: {
                            ...system.dataMigration,
                            recordCount: parseInt(value) || 0
                          }
                        })}
                      />

                      <Input
                        label="שנות נתונים היסטוריים"
                        type="number"
                        value={String(system.dataMigration.historicalDataYears)}
                        onChange={(value) => setSystem({
                          ...system,
                          dataMigration: {
                            ...system.dataMigration,
                            historicalDataYears: parseInt(value) || 0
                          }
                        })}
                      />
                    </div>

                    <Select
                      label="שיטת העברה"
                      value={system.dataMigration.migrationMethod}
                      onChange={(value) => setSystem({
                        ...system,
                        dataMigration: {
                          ...system.dataMigration,
                          migrationMethod: value as DataMigration['migrationMethod']
                        }
                      })}
                      options={[
                          { value: 'api', label: 'API' },
                          { value: 'csv_export', label: 'CSV Export' },
                          { value: 'csv_import', label: 'CSV Import' },
                          { value: 'database_dump', label: 'Database Dump' },
                          { value: 'manual', label: 'Manual' },
                          { value: 'etl_tool', label: 'ETL Tool' }
                      ]}
                    />

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={system.dataMigration.cleanupNeeded}
                          onChange={(e) => setSystem({
                            ...system,
                            dataMigration: {
                              ...system.dataMigration,
                              cleanupNeeded: e.target.checked
                            }
                          })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">נדרש ניקוי נתונים</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={system.dataMigration.dataSanitizationNeeded}
                          onChange={(e) => setSystem({
                            ...system,
                            dataMigration: {
                              ...system.dataMigration,
                              dataSanitizationNeeded: e.target.checked
                            }
                          })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">נדרש חיטוי נתונים</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={system.dataMigration.testMigrationFirst}
                          onChange={(e) => setSystem({
                            ...system,
                            dataMigration: {
                              ...system.dataMigration,
                              testMigrationFirst: e.target.checked
                            }
                          })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">לבצע העברה ניסיונית תחילה</span>
                      </label>
                    </div>

                    <TextArea
                      label="תוכנית rollback"
                      value={system.dataMigration.rollbackPlan || ''}
                      onChange={(value) => setSystem({
                        ...system,
                        dataMigration: {
                          ...system.dataMigration,
                          rollbackPlan: value
                        }
                      })}
                      rows={4}
                      placeholder="תאר את תהליך החזרה למצב קודם במקרה של בעיה..."
                    />
                  </div>
                )}
              </div>
            )}

            {/* Acceptance Criteria Tab */}
            {activeTab === 'acceptance' && (
              <div className="space-y-6">
                {/* Header with Generate Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">קריטריוני קבלה למערכת</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      קריטריונים פונקציונליים, ביצועים, אבטחה ושימושיות
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateCriteria}
                    disabled={isGeneratingCriteria}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingCriteria ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        מייצר...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        ייצר קריטריונים אוטומטית
                      </>
                    )}
                  </button>
                </div>

                {!systemCriteria || (
                  systemCriteria.functional?.length === 0 &&
                  systemCriteria.performance?.length === 0 &&
                  systemCriteria.security?.length === 0 &&
                  systemCriteria.usability?.length === 0
                ) ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">עדיין לא נוצרו קריטריוני קבלה למערכת זו</p>
                    <button
                      onClick={handleGenerateCriteria}
                      disabled={isGeneratingCriteria}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Sparkles className="w-4 h-4 inline ml-2" />
                      ייצר עכשיו
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Functional Requirements */}
                    {systemCriteria.functional && systemCriteria.functional.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                          דרישות פונקציונליות ({systemCriteria.functional.length})
                        </h4>
                        <div className="space-y-3">
                          {systemCriteria.functional.map((req: FunctionalRequirement) => (
                            <div key={req.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={req.description}
                                    onChange={(e) => updateCriterion('functional', req.id, { description: e.target.value })}
                                    className="w-full font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                                  />
                                  <p className="text-sm text-gray-600 mt-1 px-2">{req.category}</p>
                                </div>
                                <select
                                  value={req.priority}
                                  onChange={(e) => updateCriterion('functional', req.id, { priority: e.target.value as any })}
                                  className="text-xs px-2 py-1 border border-gray-300 rounded"
                                >
                                  <option value="must_have">חובה</option>
                                  <option value="should_have">רצוי</option>
                                  <option value="nice_to_have">נחמד</option>
                                </select>
                              </div>
                              <div className="grid grid-cols-2 gap-3 mt-3">
                                <div>
                                  <label className="text-xs text-gray-600">תרחיש בדיקה</label>
                                  <input
                                    type="text"
                                    value={req.testScenario}
                                    onChange={(e) => updateCriterion('functional', req.id, { testScenario: e.target.value })}
                                    className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded px-2 py-1 mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">קריטריון קבלה</label>
                                  <input
                                    type="text"
                                    value={req.acceptanceCriteria}
                                    onChange={(e) => updateCriterion('functional', req.id, { acceptanceCriteria: e.target.value })}
                                    className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded px-2 py-1 mt-1"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Performance Requirements */}
                    {systemCriteria.performance && systemCriteria.performance.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-green-600" />
                          דרישות ביצועים ({systemCriteria.performance.length})
                        </h4>
                        <div className="space-y-2">
                          {systemCriteria.performance.map((req: PerformanceRequirement) => (
                            <div key={req.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">{req.metric}</span>
                                <input
                                  type="text"
                                  value={req.target}
                                  onChange={(e) => updateCriterion('performance', req.id, { target: e.target.value })}
                                  className="text-sm px-2 py-1 bg-white border border-green-300 rounded"
                                  placeholder="יעד"
                                />
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{req.testMethod}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Security Requirements */}
                    {systemCriteria.security && systemCriteria.security.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Key className="w-5 h-5 text-orange-600" />
                          דרישות אבטחה ({systemCriteria.security.length})
                        </h4>
                        <div className="space-y-2">
                          {systemCriteria.security.map((req: SecurityRequirement) => (
                            <div key={req.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{req.requirement}</p>
                                  <p className="text-sm text-gray-600 mt-1">{req.implementation}</p>
                                </div>
                                <label className="flex items-center gap-1 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={!!req.verified}
                                    onChange={(e) => updateCriterion('security', req.id, { verified: e.target.checked })}
                                    className="rounded"
                                  />
                                  אומת
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Technical Notes (always at bottom) */}
            <div className="mt-8">
              <TextArea
                label="הערות טכניות"
                value={system.technicalNotes || ''}
                onChange={(value) => setSystem({ ...system, technicalNotes: value })}
                rows={6}
                placeholder="הערות נוספות למפתחים..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
