import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMeetingStore } from '../../store/useMeetingStore';
import { DetailedSystemSpec, SystemModule, SystemField, SystemAuthentication, DataMigration } from '../../types';
import { Server, Save, ArrowLeft, Plus, Trash2, Key, Database, FileText } from 'lucide-react';
import { SystemSpecProgress } from './SystemSpecProgress';
import { Input, Select, TextArea, Button } from '../Base';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const SystemDeepDive: React.FC = () => {
  const navigate = useNavigate();
  const { systemId } = useParams<{ systemId: string }>();
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const isNew = systemId === 'new';
  const existingSystem = currentMeeting?.implementationSpec?.systems.find(s => s.id === systemId);

  const [system, setSystem] = useState<DetailedSystemSpec>(existingSystem || {
    id: generateId(),
    systemId: '',
    systemName: '',
    authentication: {
      method: 'api_key',
      credentialsProvided: false,
      apiEndpoint: '',
      rateLimits: '',
      testAccountAvailable: false
    },
    modules: [],
    dataMigration: {
      required: false,
      recordCount: 0,
      cleanupNeeded: false,
      historicalDataYears: 0,
      migrationMethod: 'api',
      dataSanitizationNeeded: false,
      testMigrationFirst: true,
      rollbackPlan: ''
    },
    technicalNotes: ''
  });

  const [activeTab, setActiveTab] = useState<'auth' | 'modules' | 'migration'>('auth');

  const handleSave = () => {
    if (!currentMeeting?.implementationSpec) return;

    const updatedSystems = isNew
      ? [...currentMeeting.implementationSpec.systems, system]
      : currentMeeting.implementationSpec.systems.map(s => s.id === system.id ? system : s);

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        systems: updatedSystems,
        lastUpdated: new Date()
      }
    });

    navigate('/phase2');
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
      modules: system.modules.filter(m => m.id !== moduleId)
    });
  };

  const updateModule = (moduleId: string, updates: Partial<SystemModule>) => {
    setSystem({
      ...system,
      modules: system.modules.map(m =>
        m.id === moduleId ? { ...m, ...updates } : m
      )
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/phase2')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isNew ? 'מערכת חדשה' : system.systemName}
                </h1>
                <p className="text-gray-600 text-sm">מפרט טכני מלא</p>
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
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Progress Component */}
        <SystemSpecProgress
          completionPercentage={
            Math.round(
              ((system.systemName ? 25 : 0) +
                (system.authentication.credentialsProvided ? 25 : 0) +
                (system.modules.length > 0 ? 25 : 0) +
                (system.dataMigration.required ? 25 : 0)) /
                1
            )
          }
          authComplete={system.authentication.credentialsProvided}
          modulesCount={system.modules.length}
          migrationRequired={system.dataMigration.required}
        />

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { id: 'auth', label: 'אימות וגישה', icon: Key },
                { id: 'modules', label: 'מודולים ושדות', icon: Database },
                { id: 'migration', label: 'העברת נתונים', icon: FileText }
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
                <div className="grid grid-cols-2 gap-6">
                  <Input
                    label="שם המערכת *"
                    value={system.systemName}
                    onChange={(e) => setSystem({ ...system, systemName: e.target.value })}
                    placeholder="לדוגמה: Salesforce, HubSpot, Zoho CRM"
                    required
                  />

                  <Select
                    label="שיטת אימות *"
                    value={system.authentication.method}
                    onChange={(e) => setSystem({
                      ...system,
                      authentication: {
                        ...system.authentication,
                        method: e.target.value as any
                      }
                    })}
                    required
                  >
                    <option value="oauth">OAuth 2.0</option>
                    <option value="api_key">API Key</option>
                    <option value="basic_auth">Basic Auth</option>
                    <option value="jwt">JWT Token</option>
                    <option value="custom">Custom</option>
                  </Select>
                </div>

                <Input
                  label="API Endpoint"
                  type="url"
                  value={system.authentication.apiEndpoint}
                  onChange={(e) => setSystem({
                    ...system,
                    authentication: {
                      ...system.authentication,
                      apiEndpoint: e.target.value
                    }
                  })}
                  placeholder="https://api.example.com/v1"
                />

                <Input
                  label="Rate Limits"
                  value={system.authentication.rateLimits}
                  onChange={(e) => setSystem({
                    ...system,
                    authentication: {
                      ...system.authentication,
                      rateLimits: e.target.value
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
                    onChange={(e) => setSystem({
                      ...system,
                      authentication: {
                        ...system.authentication,
                        customAuthDetails: e.target.value
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
                    {system.modules.map((module) => (
                      <div key={module.id} className="p-6 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <Input
                              label="שם המודול"
                              value={module.name}
                              onChange={(e) => updateModule(module.id, { name: e.target.value })}
                              placeholder="לדוגמה: Contacts, Deals, Products"
                            />

                            <Input
                              label="מספר רשומות"
                              type="number"
                              value={module.recordCount.toString()}
                              onChange={(e) => updateModule(module.id, { recordCount: parseInt(e.target.value) || 0 })}
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
                        value={system.dataMigration.recordCount.toString()}
                        onChange={(e) => setSystem({
                          ...system,
                          dataMigration: {
                            ...system.dataMigration,
                            recordCount: parseInt(e.target.value) || 0
                          }
                        })}
                      />

                      <Input
                        label="שנות נתונים היסטוריים"
                        type="number"
                        value={system.dataMigration.historicalDataYears.toString()}
                        onChange={(e) => setSystem({
                          ...system,
                          dataMigration: {
                            ...system.dataMigration,
                            historicalDataYears: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </div>

                    <Select
                      label="שיטת העברה"
                      value={system.dataMigration.migrationMethod}
                      onChange={(e) => setSystem({
                        ...system,
                        dataMigration: {
                          ...system.dataMigration,
                          migrationMethod: e.target.value as any
                        }
                      })}
                    >
                      <option value="api">API</option>
                      <option value="csv_export">CSV Export</option>
                      <option value="csv_import">CSV Import</option>
                      <option value="database_dump">Database Dump</option>
                      <option value="manual">Manual</option>
                      <option value="etl_tool">ETL Tool</option>
                    </Select>

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
                      value={system.dataMigration.rollbackPlan}
                      onChange={(e) => setSystem({
                        ...system,
                        dataMigration: {
                          ...system.dataMigration,
                          rollbackPlan: e.target.value
                        }
                      })}
                      rows={4}
                      placeholder="תאר את תהליך החזרה למצב קודם במקרה של בעיה..."
                    />
                  </div>
                )}
              </div>
            )}

            {/* Technical Notes (always at bottom) */}
            <div className="mt-8">
              <TextArea
                label="הערות טכניות"
                value={system.technicalNotes}
                onChange={(e) => setSystem({ ...system, technicalNotes: e.target.value })}
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
