import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  Users,
  Calendar,
  Target
} from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { AcceptanceCriteria } from '../../types/phase2';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const AcceptanceCriteriaBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const existingCriteria = currentMeeting?.implementationSpec?.acceptanceCriteria;

  const [criteria, setCriteria] = useState<AcceptanceCriteria>(existingCriteria || {
    functionalCriteria: [],
    performanceCriteria: [],
    securityCriteria: [],
    deploymentCriteria: {
      approvers: [],
      environment: 'staging',
      rollbackPlan: '',
      smokeTests: []
    },
    signOffRequired: true,
    signOffBy: []
  });

  const [activeTab, setActiveTab] = useState<'functional' | 'performance' | 'security' | 'deployment'>('functional');

  const handleSave = () => {
    if (!currentMeeting) return;

    // Validation
    if (criteria.functionalCriteria.length === 0) {
      alert('יש להוסיף לפחות קריטריון תפקודי אחד');
      return;
    }

    if (criteria.signOffRequired && criteria.signOffBy.length === 0) {
      alert('יש לציין מי צריך לאשר את ההטמעה');
      return;
    }

    const updatedSpec = {
      ...currentMeeting.implementationSpec!,
      acceptanceCriteria: criteria,
      lastUpdated: new Date(),
      updatedBy: 'user'
    };

    updateMeeting({
      implementationSpec: updatedSpec
    });

    navigate('/phase2');
  };

  const addFunctionalCriteria = () => {
    setCriteria({
      ...criteria,
      functionalCriteria: [
        ...criteria.functionalCriteria,
        {
          id: generateId(),
          description: '',
          priority: 'must',
          testable: true,
          status: 'pending'
        }
      ]
    });
  };

  const updateFunctionalCriteria = (index: number, updates: any) => {
    const updated = [...criteria.functionalCriteria];
    updated[index] = { ...updated[index], ...updates };
    setCriteria({ ...criteria, functionalCriteria: updated });
  };

  const deleteFunctionalCriteria = (index: number) => {
    setCriteria({
      ...criteria,
      functionalCriteria: criteria.functionalCriteria.filter((_, i) => i !== index)
    });
  };

  const addPerformanceCriteria = () => {
    setCriteria({
      ...criteria,
      performanceCriteria: [
        ...criteria.performanceCriteria,
        {
          metric: '',
          target: '',
          measurement: ''
        }
      ]
    });
  };

  const updatePerformanceCriteria = (index: number, updates: any) => {
    const updated = [...criteria.performanceCriteria];
    updated[index] = { ...updated[index], ...updates };
    setCriteria({ ...criteria, performanceCriteria: updated });
  };

  const deletePerformanceCriteria = (index: number) => {
    setCriteria({
      ...criteria,
      performanceCriteria: criteria.performanceCriteria.filter((_, i) => i !== index)
    });
  };

  const addSecurityCriteria = () => {
    setCriteria({
      ...criteria,
      securityCriteria: [
        ...criteria.securityCriteria,
        {
          requirement: '',
          implemented: false,
          verificationMethod: ''
        }
      ]
    });
  };

  const updateSecurityCriteria = (index: number, updates: any) => {
    const updated = [...criteria.securityCriteria];
    updated[index] = { ...updated[index], ...updates };
    setCriteria({ ...criteria, securityCriteria: updated });
  };

  const deleteSecurityCriteria = (index: number) => {
    setCriteria({
      ...criteria,
      securityCriteria: criteria.securityCriteria.filter((_, i) => i !== index)
    });
  };

  const addApprover = () => {
    setCriteria({
      ...criteria,
      deploymentCriteria: {
        ...criteria.deploymentCriteria,
        approvers: [...criteria.deploymentCriteria.approvers, { name: '', role: '', email: '' }]
      }
    });
  };

  const updateApprover = (index: number, updates: any) => {
    const updated = [...criteria.deploymentCriteria.approvers];
    updated[index] = { ...updated[index], ...updates };
    setCriteria({
      ...criteria,
      deploymentCriteria: {
        ...criteria.deploymentCriteria,
        approvers: updated
      }
    });
  };

  const deleteApprover = (index: number) => {
    setCriteria({
      ...criteria,
      deploymentCriteria: {
        ...criteria.deploymentCriteria,
        approvers: criteria.deploymentCriteria.approvers.filter((_, i) => i !== index)
      }
    });
  };

  const addSmokeTest = () => {
    setCriteria({
      ...criteria,
      deploymentCriteria: {
        ...criteria.deploymentCriteria,
        smokeTests: [...criteria.deploymentCriteria.smokeTests, '']
      }
    });
  };

  const updateSmokeTest = (index: number, value: string) => {
    const updated = [...criteria.deploymentCriteria.smokeTests];
    updated[index] = value;
    setCriteria({
      ...criteria,
      deploymentCriteria: {
        ...criteria.deploymentCriteria,
        smokeTests: updated
      }
    });
  };

  const deleteSmokeTest = (index: number) => {
    setCriteria({
      ...criteria,
      deploymentCriteria: {
        ...criteria.deploymentCriteria,
        smokeTests: criteria.deploymentCriteria.smokeTests.filter((_, i) => i !== index)
      }
    });
  };

  const addSignOffPerson = () => {
    setCriteria({
      ...criteria,
      signOffBy: [...criteria.signOffBy, { name: '', role: '', email: '' }]
    });
  };

  const updateSignOffPerson = (index: number, updates: any) => {
    const updated = [...criteria.signOffBy];
    updated[index] = { ...updated[index], ...updates };
    setCriteria({ ...criteria, signOffBy: updated });
  };

  const deleteSignOffPerson = (index: number) => {
    setCriteria({
      ...criteria,
      signOffBy: criteria.signOffBy.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <Target className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">קריטריוני קבלה</h1>
            </div>
            <button
              onClick={() => navigate('/phase2')}
              className="text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>

          <p className="text-gray-600">
            הגדר את הדרישות והתנאים שצריכים להתקיים כדי שהפרויקט ייחשב כמוצלח
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            {[
              { key: 'functional', label: `תפקודי (${criteria.functionalCriteria.length})`, icon: CheckCircle },
              { key: 'performance', label: `ביצועים (${criteria.performanceCriteria.length})`, icon: Target },
              { key: 'security', label: `אבטחה (${criteria.securityCriteria.length})`, icon: AlertCircle },
              { key: 'deployment', label: 'פריסה', icon: Calendar }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={`flex-1 flex items-center justify-center space-x-2 space-x-reverse py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === key
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Functional Criteria Tab */}
            {activeTab === 'functional' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">קריטריונים תפקודיים</h3>
                      <p className="text-sm text-blue-700">
                        מה המערכת צריכה לעשות כדי להיחשב כמוצלחת? כל קריטריון צריך להיות ניתן למדידה
                      </p>
                    </div>
                  </div>
                </div>

                {criteria.functionalCriteria.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">עדיין לא הוספת קריטריונים תפקודיים</p>
                    <button
                      onClick={addFunctionalCriteria}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      הוסף קריטריון ראשון
                    </button>
                  </div>
                ) : (
                  <>
                    {criteria.functionalCriteria.map((item, index) => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <select
                              value={item.priority}
                              onChange={(e) => updateFunctionalCriteria(index, { priority: e.target.value })}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="must">חובה</option>
                              <option value="should">רצוי</option>
                              <option value="nice">נחמד לקבל</option>
                            </select>
                            <select
                              value={item.status}
                              onChange={(e) => updateFunctionalCriteria(index, { status: e.target.value })}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="pending">ממתין</option>
                              <option value="in_progress">בתהליך</option>
                              <option value="passed">עבר</option>
                              <option value="failed">נכשל</option>
                            </select>
                          </div>
                          <button
                            onClick={() => deleteFunctionalCriteria(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              תיאור הקריטריון
                            </label>
                            <textarea
                              value={item.description}
                              onChange={(e) => updateFunctionalCriteria(index, { description: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              rows={2}
                              placeholder="לדוגמה: משתמש יכול להתחבר למערכת תוך פחות מ-3 שניות"
                            />
                          </div>

                          <label className="flex items-center space-x-2 space-x-reverse">
                            <input
                              type="checkbox"
                              checked={item.testable}
                              onChange={(e) => updateFunctionalCriteria(index, { testable: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-xs text-gray-600">
                              ניתן לבדיקה אוטומטית
                            </span>
                          </label>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addFunctionalCriteria}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      הוסף קריטריון נוסף
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Performance Criteria Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <Target className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-900 mb-1">קריטריוני ביצועים</h3>
                      <p className="text-sm text-green-700">
                        הגדר יעדי ביצועים מדידים - זמני תגובה, throughput, זמני טעינה וכו'
                      </p>
                    </div>
                  </div>
                </div>

                {criteria.performanceCriteria.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">עדיין לא הוספת קריטריוני ביצועים</p>
                    <button
                      onClick={addPerformanceCriteria}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      הוסף קריטריון ראשון
                    </button>
                  </div>
                ) : (
                  <>
                    {criteria.performanceCriteria.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-medium text-gray-900">מדד #{index + 1}</span>
                          <button
                            onClick={() => deletePerformanceCriteria(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              שם המדד
                            </label>
                            <input
                              type="text"
                              value={item.metric}
                              onChange={(e) => updatePerformanceCriteria(index, { metric: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="לדוגמה: זמן טעינת דף ראשי"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                יעד
                              </label>
                              <input
                                type="text"
                                value={item.target}
                                onChange={(e) => updatePerformanceCriteria(index, { target: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="< 2 שניות"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                שיטת מדידה
                              </label>
                              <input
                                type="text"
                                value={item.measurement}
                                onChange={(e) => updatePerformanceCriteria(index, { measurement: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="Lighthouse / GTmetrix"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addPerformanceCriteria}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-600 hover:text-green-600 transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      הוסף מדד נוסף
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Security Criteria Tab */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-900 mb-1">דרישות אבטחה</h3>
                      <p className="text-sm text-red-700">
                        הגדר את דרישות האבטחה שצריכות להתקיים לפני פריסה לייצור
                      </p>
                    </div>
                  </div>
                </div>

                {criteria.securityCriteria.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">עדיין לא הוספת דרישות אבטחה</p>
                    <button
                      onClick={addSecurityCriteria}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      הוסף דרישה ראשונה
                    </button>
                  </div>
                ) : (
                  <>
                    {criteria.securityCriteria.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <span className="text-sm font-medium text-gray-900">דרישה #{index + 1}</span>
                            <label className="flex items-center space-x-1 space-x-reverse">
                              <input
                                type="checkbox"
                                checked={item.implemented}
                                onChange={(e) => updateSecurityCriteria(index, { implemented: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-xs text-gray-600">מיושם</span>
                            </label>
                          </div>
                          <button
                            onClick={() => deleteSecurityCriteria(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              דרישת האבטחה
                            </label>
                            <textarea
                              value={item.requirement}
                              onChange={(e) => updateSecurityCriteria(index, { requirement: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              rows={2}
                              placeholder="לדוגמה: כל סיסמאות מוצפנות עם bcrypt"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              שיטת אימות
                            </label>
                            <input
                              type="text"
                              value={item.verificationMethod}
                              onChange={(e) => updateSecurityCriteria(index, { verificationMethod: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="איך נוודא שהדרישה מתקיימת?"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addSecurityCriteria}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-red-600 hover:text-red-600 transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      הוסף דרישה נוספת
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Deployment Criteria Tab */}
            {activeTab === 'deployment' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    סביבת פריסה ראשונית
                  </label>
                  <select
                    value={criteria.deploymentCriteria.environment}
                    onChange={(e) => setCriteria({
                      ...criteria,
                      deploymentCriteria: {
                        ...criteria.deploymentCriteria,
                        environment: e.target.value as any
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                    <option value="dev">Development</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      מאשרי הפריסה
                    </label>
                    <button
                      onClick={addApprover}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      הוסף מאשר
                    </button>
                  </div>

                  <div className="space-y-3">
                    {criteria.deploymentCriteria.approvers.map((approver, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <Users className="w-5 h-5 text-gray-600" />
                          <button
                            onClick={() => deleteApprover(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              שם
                            </label>
                            <input
                              type="text"
                              value={approver.name}
                              onChange={(e) => updateApprover(index, { name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="שם המאשר"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              תפקיד
                            </label>
                            <input
                              type="text"
                              value={approver.role}
                              onChange={(e) => updateApprover(index, { role: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="CTO / מנהל פיתוח"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              אימייל
                            </label>
                            <input
                              type="email"
                              value={approver.email}
                              onChange={(e) => updateApprover(index, { email: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="email@company.com"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תוכנית Rollback
                  </label>
                  <textarea
                    value={criteria.deploymentCriteria.rollbackPlan}
                    onChange={(e) => setCriteria({
                      ...criteria,
                      deploymentCriteria: {
                        ...criteria.deploymentCriteria,
                        rollbackPlan: e.target.value
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={4}
                    placeholder="מה עושים אם הפריסה נכשלת? כיצד חוזרים לגרסה הקודמת?"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      בדיקות Smoke לאחר פריסה
                    </label>
                    <button
                      onClick={addSmokeTest}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      הוסף בדיקה
                    </button>
                  </div>

                  <div className="space-y-2">
                    {criteria.deploymentCriteria.smokeTests.map((test, index) => (
                      <div key={index} className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="text"
                          value={test}
                          onChange={(e) => updateSmokeTest(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="בדיקה לבצע מייד לאחר פריסה"
                        />
                        <button
                          onClick={() => deleteSmokeTest(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sign-Off Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start space-x-3 space-x-reverse mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">אישור סופי</h3>
              <label className="flex items-center space-x-2 space-x-reverse mb-4">
                <input
                  type="checkbox"
                  checked={criteria.signOffRequired}
                  onChange={(e) => setCriteria({ ...criteria, signOffRequired: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">נדרש אישור פורמלי לפני פריסה</span>
              </label>

              {criteria.signOffRequired && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      מי צריך לאשר?
                    </label>
                    <button
                      onClick={addSignOffPerson}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      הוסף מאשר
                    </button>
                  </div>

                  <div className="space-y-3">
                    {criteria.signOffBy.map((person, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <Users className="w-5 h-5 text-gray-600" />
                          <button
                            onClick={() => deleteSignOffPerson(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              שם
                            </label>
                            <input
                              type="text"
                              value={person.name}
                              onChange={(e) => updateSignOffPerson(index, { name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              תפקיד
                            </label>
                            <input
                              type="text"
                              value={person.role}
                              onChange={(e) => updateSignOffPerson(index, { role: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              אימייל
                            </label>
                            <input
                              type="email"
                              value={person.email}
                              onChange={(e) => updateSignOffPerson(index, { email: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/phase2')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            ביטול
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
          >
            <Save className="w-4 h-4" />
            <span>שמור קריטריונים</span>
          </button>
        </div>
      </div>
    </div>
  );
};
