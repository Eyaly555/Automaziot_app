/**
 * Add Dashboard Requirements Specification Component
 *
 * Service #52: Add Dashboard - הוספת דשבורד real-time
 * Collects detailed technical requirements for dashboard builder service.
 *
 * @component
 * @category AdditionalServices
 */

import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AddDashboardRequirements } from '../../../../types/additionalServices';
import { Card } from '../../../Common/Card';

export function AddDashboardSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<AddDashboardRequirements>({
    platform: {
      choice: 'power_bi',
      reason: '',
      embeddedInExistingApp: false,
      standaloneUrl: ''
    },
    dataSources: [],
    kpisAndMetrics: [],
    dashboardDesign: {
      hasWireframes: false,
      hasExampleDashboards: false,
      layout: 'single_page',
      visualizationTypes: ['chart', 'table', 'card'],
      colorScheme: '',
      branding: false
    },
    interactivity: {
      filters: true,
      drillDown: false,
      crossFiltering: false,
      exportCapabilities: ['pdf', 'excel'],
      scheduling: false
    },
    accessControl: {
      authenticationMethod: 'username_password',
      roleBasedAccess: false,
      userRoles: []
    },
    performance: {
      dataVolume: 'medium',
      useAggregatedViews: true,
      cacheEnabled: true,
      targetLoadTime: 3
    },
    mobileSupport: {
      required: false,
      responsive: true,
      nativeApp: false
    },
    deliverables: {
      functionalDashboard: true,
      userGuide: true,
      accessCredentials: true,
      dataSourceDocumentation: true,
      trainingSession: false
    },
    timeline: {
      complexity: 'medium',
      estimatedDays: 5,
      includesDataModeling: false
    },
    targetAudience: {
      primaryUsers: [],
      usageFrequency: 'daily',
      technicalLevel: 'manager'
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load existing data
  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.additionalServices || [];
    const existing = Array.isArray(category)
      ? category.find(item => item.serviceId === 'add-dashboard')
      : undefined;

    if (existing?.requirements) {
      setConfig(existing.requirements as AddDashboardRequirements);
    }
  }, [currentMeeting]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (config.dataSources.length === 0) {
      newErrors.dataSources = 'יש להוסיף לפחות מקור נתונים אחד';
    }

    if (config.kpisAndMetrics.length === 0) {
      newErrors.kpisAndMetrics = 'יש להוסיף לפחות KPI אחד';
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

    if (!currentMeeting) return;

    setIsSaving(true);
    try {
      const category = currentMeeting?.implementationSpec?.additionalServices || [];
      const updated = category.filter(item => item.serviceId !== 'add-dashboard');

      updated.push({
        serviceId: 'add-dashboard',
        serviceName: 'הוספת Dashboard',
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
      console.error('Error saving add-dashboard config:', error);
      alert('שגיאה בשמירת הגדרות');
    } finally {
      setIsSaving(false);
    }
  };

  // Add data source
  const addDataSource = () => {
    setConfig({
      ...config,
      dataSources: [
        ...config.dataSources,
        {
          sourceName: '',
          sourceType: 'database',
          connectionMethod: 'direct_db',
          refreshFrequency: '1hour',
          requiresCredentials: true
        }
      ]
    });
  };

  // Remove data source
  const removeDataSource = (index: number) => {
    setConfig({
      ...config,
      dataSources: config.dataSources.filter((_, i) => i !== index)
    });
  };

  // Add KPI category
  const addKpiCategory = () => {
    setConfig({
      ...config,
      kpisAndMetrics: [
        ...config.kpisAndMetrics,
        {
          category: '',
          metrics: []
        }
      ]
    });
  };

  // Remove KPI category
  const removeKpiCategory = (index: number) => {
    setConfig({
      ...config,
      kpisAndMetrics: config.kpisAndMetrics.filter((_, i) => i !== index)
    });
  };

  // Add metric to category
  const addMetric = (categoryIndex: number) => {
    const updated = [...config.kpisAndMetrics];
    updated[categoryIndex].metrics.push({
      metricName: '',
      metricType: 'number',
      dataSource: '',
      calculation: '',
      targetValue: 0
    });
    setConfig({ ...config, kpisAndMetrics: updated });
  };

  // Remove metric from category
  const removeMetric = (categoryIndex: number, metricIndex: number) => {
    const updated = [...config.kpisAndMetrics];
    updated[categoryIndex].metrics = updated[categoryIndex].metrics.filter((_, i) => i !== metricIndex);
    setConfig({ ...config, kpisAndMetrics: updated });
  };

  // Add user role
  const addUserRole = () => {
    setConfig({
      ...config,
      accessControl: {
        ...config.accessControl,
        userRoles: [
          ...(config.accessControl.userRoles || []),
          {
            roleName: '',
            permissions: []
          }
        ]
      }
    });
  };

  // Remove user role
  const removeUserRole = (index: number) => {
    setConfig({
      ...config,
      accessControl: {
        ...config.accessControl,
        userRoles: (config.accessControl.userRoles || []).filter((_, i) => i !== index)
      }
    });
  };

  // Add primary user
  const addPrimaryUser = () => {
    const user = prompt('הזן תפקיד/משתמש (לדוגמה: CEO, Sales Manager):');
    if (user && user.trim()) {
      setConfig({
        ...config,
        targetAudience: {
          ...config.targetAudience,
          primaryUsers: [...config.targetAudience.primaryUsers, user.trim()]
        }
      });
    }
  };

  // Remove primary user
  const removePrimaryUser = (index: number) => {
    setConfig({
      ...config,
      targetAudience: {
        ...config.targetAudience,
        primaryUsers: config.targetAudience.primaryUsers.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <div className="space-y-6 p-8" dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">שירות #52: הוספת דשבורד real-time</h2>
        <p className="text-gray-600 mt-2">בניית דשבורדים מותאמים אישית להצגת נתונים עסקיים, KPIs ומדדים</p>
      </div>

      {/* Platform Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">פלטפורמה</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">בחירת פלטפורמה</label>
            <select
              value={config.platform.choice}
              onChange={(e) => setConfig({
                ...config,
                platform: {
                  ...config.platform,
                  choice: e.target.value as 'power_bi' | 'tableau' | 'looker' | 'qlik' | 'custom_react' | 'superset'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="power_bi">Power BI</option>
              <option value="tableau">Tableau</option>
              <option value="looker">Looker</option>
              <option value="qlik">Qlik</option>
              <option value="custom_react">Custom React Dashboard</option>
              <option value="superset">Apache Superset</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">סיבת הבחירה</label>
            <textarea
              value={config.platform.reason || ''}
              onChange={(e) => setConfig({
                ...config,
                platform: { ...config.platform, reason: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={2}
              placeholder="למה בחרת בפלטפורמה הזו?"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.platform.embeddedInExistingApp}
              onChange={(e) => setConfig({
                ...config,
                platform: { ...config.platform, embeddedInExistingApp: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">שיבוץ באפליקציה קיימת</span>
          </label>

          {!config.platform.embeddedInExistingApp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL עצמאי</label>
              <input
                type="text"
                value={config.platform.standaloneUrl || ''}
                onChange={(e) => setConfig({
                  ...config,
                  platform: { ...config.platform, standaloneUrl: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://dashboard.company.com"
              />
            </div>
          )}
        </div>
      </Card>

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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">שם המקור</label>
                  <input
                    type="text"
                    value={source.sourceName}
                    onChange={(e) => {
                      const updated = [...config.dataSources];
                      updated[index].sourceName = e.target.value;
                      setConfig({ ...config, dataSources: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Zoho CRM, MySQL Database, Google Analytics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">סוג המקור</label>
                  <select
                    value={source.sourceType}
                    onChange={(e) => {
                      const updated = [...config.dataSources];
                      updated[index].sourceType = e.target.value as 'database' | 'api' | 'spreadsheet' | 'cloud_service';
                      setConfig({ ...config, dataSources: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="database">מסד נתונים</option>
                    <option value="api">API</option>
                    <option value="spreadsheet">גיליון אלקטרוני</option>
                    <option value="cloud_service">שירות ענן</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">שיטת חיבור</label>
                  <select
                    value={source.connectionMethod}
                    onChange={(e) => {
                      const updated = [...config.dataSources];
                      updated[index].connectionMethod = e.target.value as 'direct_db' | 'api' | 'odbc' | 'jdbc' | 'native_connector';
                      setConfig({ ...config, dataSources: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="direct_db">חיבור ישיר למסד נתונים</option>
                    <option value="api">API</option>
                    <option value="odbc">ODBC</option>
                    <option value="jdbc">JDBC</option>
                    <option value="native_connector">מחבר מקורי</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">תדירות רענון</label>
                  <select
                    value={source.refreshFrequency}
                    onChange={(e) => {
                      const updated = [...config.dataSources];
                      updated[index].refreshFrequency = e.target.value as 'real_time' | '15min' | '1hour' | 'daily' | 'weekly';
                      setConfig({ ...config, dataSources: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="real_time">זמן אמת</option>
                    <option value="15min">כל 15 דקות</option>
                    <option value="1hour">כל שעה</option>
                    <option value="daily">יומי</option>
                    <option value="weekly">שבועי</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={source.requiresCredentials}
                  onChange={(e) => {
                    const updated = [...config.dataSources];
                    updated[index].requiresCredentials = e.target.checked;
                    setConfig({ ...config, dataSources: updated });
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">דרושים אישורי גישה</span>
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* KPIs & Metrics */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">KPIs ומדדים <span className="text-red-500">*</span></h3>
            <button
              type="button"
              onClick={addKpiCategory}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + הוסף קטגוריה
            </button>
          </div>
          {errors.kpisAndMetrics && <p className="text-red-500 text-sm">{errors.kpisAndMetrics}</p>}

          {config.kpisAndMetrics.map((kpiCategory, catIndex) => (
            <div key={catIndex} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">קטגוריה #{catIndex + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeKpiCategory(catIndex)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  הסר קטגוריה
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">שם הקטגוריה</label>
                <input
                  type="text"
                  value={kpiCategory.category}
                  onChange={(e) => {
                    const updated = [...config.kpisAndMetrics];
                    updated[catIndex].category = e.target.value;
                    setConfig({ ...config, kpisAndMetrics: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="מכירות, שירות לקוחות, תפעול"
                />
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">מדדים</label>
                  <button
                    type="button"
                    onClick={() => addMetric(catIndex)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    + הוסף מדד
                  </button>
                </div>

                {kpiCategory.metrics.map((metric, metricIndex) => (
                  <div key={metricIndex} className="bg-gray-50 p-3 rounded space-y-2 mb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">מדד #{metricIndex + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeMetric(catIndex, metricIndex)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        הסר
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="text"
                          value={metric.metricName}
                          onChange={(e) => {
                            const updated = [...config.kpisAndMetrics];
                            updated[catIndex].metrics[metricIndex].metricName = e.target.value;
                            setConfig({ ...config, kpisAndMetrics: updated });
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="שם המדד"
                        />
                      </div>

                      <div>
                        <select
                          value={metric.metricType}
                          onChange={(e) => {
                            const updated = [...config.kpisAndMetrics];
                            updated[catIndex].metrics[metricIndex].metricType = e.target.value as 'number' | 'percentage' | 'currency' | 'trend' | 'comparison';
                            setConfig({ ...config, kpisAndMetrics: updated });
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        >
                          <option value="number">מספר</option>
                          <option value="percentage">אחוזים</option>
                          <option value="currency">מטבע</option>
                          <option value="trend">מגמה</option>
                          <option value="comparison">השוואה</option>
                        </select>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={metric.dataSource}
                      onChange={(e) => {
                        const updated = [...config.kpisAndMetrics];
                        updated[catIndex].metrics[metricIndex].dataSource = e.target.value;
                        setConfig({ ...config, kpisAndMetrics: updated });
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      placeholder="מקור נתונים"
                    />

                    <input
                      type="text"
                      value={metric.calculation || ''}
                      onChange={(e) => {
                        const updated = [...config.kpisAndMetrics];
                        updated[catIndex].metrics[metricIndex].calculation = e.target.value;
                        setConfig({ ...config, kpisAndMetrics: updated });
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      placeholder="חישוב (לדוגמה: SUM(revenue))"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Dashboard Design */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">עיצוב הדשבורד</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.dashboardDesign.hasWireframes}
                onChange={(e) => setConfig({
                  ...config,
                  dashboardDesign: { ...config.dashboardDesign, hasWireframes: e.target.checked }
                })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">יש Wireframes</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.dashboardDesign.hasExampleDashboards}
                onChange={(e) => setConfig({
                  ...config,
                  dashboardDesign: { ...config.dashboardDesign, hasExampleDashboards: e.target.checked }
                })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">יש דוגמאות</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">פריסה</label>
            <select
              value={config.dashboardDesign.layout}
              onChange={(e) => setConfig({
                ...config,
                dashboardDesign: {
                  ...config.dashboardDesign,
                  layout: e.target.value as 'single_page' | 'multi_page' | 'tabbed'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="single_page">עמוד יחיד</option>
              <option value="multi_page">מרובה עמודים</option>
              <option value="tabbed">לשוניות</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ערכת צבעים</label>
            <input
              type="text"
              value={config.dashboardDesign.colorScheme || ''}
              onChange={(e) => setConfig({
                ...config,
                dashboardDesign: { ...config.dashboardDesign, colorScheme: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="כחול קורפורטיבי, Viridis, מותאם אישית"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.dashboardDesign.branding || false}
              onChange={(e) => setConfig({
                ...config,
                dashboardDesign: { ...config.dashboardDesign, branding: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">מיתוג (לוגו וצבעי החברה)</span>
          </label>
        </div>
      </Card>

      {/* Interactivity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">אינטראקטיביות</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.interactivity.filters}
              onChange={(e) => setConfig({
                ...config,
                interactivity: { ...config.interactivity, filters: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">פילטרים (טווח תאריכים, אזור, מוצר)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.interactivity.drillDown}
              onChange={(e) => setConfig({
                ...config,
                interactivity: { ...config.interactivity, drillDown: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Drill Down (לחיצה לפירוט)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.interactivity.crossFiltering}
              onChange={(e) => setConfig({
                ...config,
                interactivity: { ...config.interactivity, crossFiltering: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">פילטור צולב (השפעה על כמה ויזואליזציות)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.interactivity.scheduling || false}
              onChange={(e) => setConfig({
                ...config,
                interactivity: { ...config.interactivity, scheduling: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">רענון מתוזמן</span>
          </label>
        </div>
      </Card>

      {/* Performance & Mobile */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">ביצועים ומובייל</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">נפח נתונים</label>
            <select
              value={config.performance.dataVolume}
              onChange={(e) => setConfig({
                ...config,
                performance: {
                  ...config.performance,
                  dataVolume: e.target.value as 'small' | 'medium' | 'large'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="small">קטן (&lt;100K שורות)</option>
              <option value="medium">בינוני (100K-1M שורות)</option>
              <option value="large">גדול (&gt;1M שורות)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              זמן טעינה מטרה (שניות) - {config.performance.targetLoadTime}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={config.performance.targetLoadTime}
              onChange={(e) => setConfig({
                ...config,
                performance: { ...config.performance, targetLoadTime: parseInt(e.target.value) }
              })}
              className="w-full"
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">תמיכה במובייל</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.mobileSupport.required}
                  onChange={(e) => setConfig({
                    ...config,
                    mobileSupport: { ...config.mobileSupport, required: e.target.checked }
                  })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">נדרש</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.mobileSupport.responsive}
                  onChange={(e) => setConfig({
                    ...config,
                    mobileSupport: { ...config.mobileSupport, responsive: e.target.checked }
                  })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">רספונסיבי</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.mobileSupport.nativeApp || false}
                  onChange={(e) => setConfig({
                    ...config,
                    mobileSupport: { ...config.mobileSupport, nativeApp: e.target.checked }
                  })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">אפליקציה מקורית (Power BI Mobile, Tableau Mobile)</span>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Target Audience */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">קהל יעד</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">משתמשים ראשיים</label>
              <button
                type="button"
                onClick={addPrimaryUser}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                + הוסף משתמש
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.targetAudience.primaryUsers.map((user, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {user}
                  <button
                    type="button"
                    onClick={() => removePrimaryUser(index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">תדירות שימוש</label>
              <select
                value={config.targetAudience.usageFrequency}
                onChange={(e) => setConfig({
                  ...config,
                  targetAudience: {
                    ...config.targetAudience,
                    usageFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' | 'ad_hoc'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="daily">יומי</option>
                <option value="weekly">שבועי</option>
                <option value="monthly">חודשי</option>
                <option value="ad_hoc">לפי צורך</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">רמה טכנית</label>
              <select
                value={config.targetAudience.technicalLevel}
                onChange={(e) => setConfig({
                  ...config,
                  targetAudience: {
                    ...config.targetAudience,
                    technicalLevel: e.target.value as 'executive' | 'manager' | 'analyst' | 'technical'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="executive">הנהלה</option>
                <option value="manager">מנהלים</option>
                <option value="analyst">אנליסטים</option>
                <option value="technical">טכני</option>
              </select>
            </div>
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
                timeline: {
                  ...config.timeline,
                  complexity: e.target.value as 'simple' | 'medium' | 'complex'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="simple">פשוט (3-5 ימים)</option>
              <option value="medium">בינוני (5-7 ימים)</option>
              <option value="complex">מורכב (7-10 ימים)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ימים משוערים</label>
            <input
              type="number"
              value={config.timeline.estimatedDays}
              onChange={(e) => setConfig({
                ...config,
                timeline: { ...config.timeline, estimatedDays: parseInt(e.target.value) || 5 }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="1"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.timeline.includesDataModeling}
              onChange={(e) => setConfig({
                ...config,
                timeline: { ...config.timeline, includesDataModeling: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">כולל מידול נתונים (זמן נוסף להכנת הנתונים)</span>
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
