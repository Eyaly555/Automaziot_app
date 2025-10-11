import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, X, ChevronDown, ChevronUp, Info, Sparkles, AlertTriangle, Settings, FileText, FolderOpen, Users, Package } from 'lucide-react';
import { useMeetingStore } from '../../../store/useMeetingStore';
import { Card } from '../../Common/Card';
import { Input, Select, TextArea, Button } from '../../Base';
import {
  CheckboxGroup,
  RadioGroup
} from '../../Common/FormFields';
import { PainPointFlag } from '../../Common/PainPointFlag/PainPointFlag';
import { PhaseReadOnlyBanner } from '../../Common/PhaseReadOnlyBanner';
import { useBeforeUnload } from '../../../hooks/useBeforeUnload';

interface WorkProcess {
  name: string;
  description: string;
  stepCount: number;
  bottleneck: string;
  failurePoint: string;
  estimatedTime: number;
}

interface DocumentFlow {
  type: string;
  volumePerMonth: number;
  timePerDocument: number;
  requiresApproval: boolean;
  versionControlNeeded: boolean;
}

interface ProjectIssue {
  area: string;
  frequency: string;
  impact: 'high' | 'medium' | 'low';
}

interface Department {
  name: string;
  employeeCount: number;
  systems: string[];
}

export const OperationsModule: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateModule } = useMeetingStore();
  const moduleData = currentMeeting?.modules?.operations || {};

  const [expandedSections, setExpandedSections] = useState<string[]>(['workProcesses']);

  // 4.1 תהליכי עבודה - Work Processes
  const [workProcesses, setWorkProcesses] = useState<WorkProcess[]>(
    moduleData.workProcesses?.processes || []
  );
  const [newProcess, setNewProcess] = useState<WorkProcess>({
    name: '',
    description: '',
    stepCount: 0,
    bottleneck: '',
    failurePoint: '',
    estimatedTime: 0
  });
  const [commonFailures, setCommonFailures] = useState<string[]>(
    moduleData.workProcesses?.commonFailures || []
  );
  const [errorTrackingSystem, setErrorTrackingSystem] = useState(
    moduleData.workProcesses?.errorTrackingSystem || 'none'
  );
  const [processDocumentation, setProcessDocumentation] = useState(
    moduleData.workProcesses?.processDocumentation || ''
  );
  const [automationReadiness, setAutomationReadiness] = useState(
    moduleData.workProcesses?.automationReadiness || 0
  );

  // 4.2 ניהול מסמכים - Document Management
  const [documentFlows, setDocumentFlows] = useState<DocumentFlow[]>(
    moduleData.documentManagement?.flows || []
  );
  const [newDocFlow, setNewDocFlow] = useState<DocumentFlow>({
    type: '',
    volumePerMonth: 0,
    timePerDocument: 0,
    requiresApproval: false,
    versionControlNeeded: false
  });
  const [storageLocations, setStorageLocations] = useState<string[]>(
    moduleData.documentManagement?.storageLocations || []
  );
  const [searchDifficulties, setSearchDifficulties] = useState(
    moduleData.documentManagement?.searchDifficulties || ''
  );
  const [versionControlMethod, setVersionControlMethod] = useState(
    moduleData.documentManagement?.versionControlMethod || 'none'
  );
  const [approvalWorkflow, setApprovalWorkflow] = useState(
    moduleData.documentManagement?.approvalWorkflow || ''
  );
  const [documentRetention, setDocumentRetention] = useState(
    moduleData.documentManagement?.documentRetention || 0
  );

  // 4.3 ניהול פרויקטים - Project Management
  const [projectTools, setProjectTools] = useState<string[]>(
    moduleData.projectManagement?.tools || []
  );
  const [taskCreationSources, setTaskCreationSources] = useState<string[]>(
    moduleData.projectManagement?.taskCreationSources || []
  );
  const [projectIssues, setProjectIssues] = useState<ProjectIssue[]>(
    moduleData.projectManagement?.issues || []
  );
  const [newProjectIssue, setNewProjectIssue] = useState<ProjectIssue>({
    area: '',
    frequency: '',
    impact: 'medium'
  });
  const [resourceAllocationMethod, setResourceAllocationMethod] = useState(
    moduleData.projectManagement?.resourceAllocationMethod || ''
  );
  const [timelineAccuracy, setTimelineAccuracy] = useState(
    moduleData.projectManagement?.timelineAccuracy || 50
  );
  const [projectVisibility, setProjectVisibility] = useState(
    moduleData.projectManagement?.projectVisibility || ''
  );
  const [deadlineMissRate, setDeadlineMissRate] = useState(
    moduleData.projectManagement?.deadlineMissRate || 0
  );

  // 4.4 משאבי אנוש - HR
  const [departments, setDepartments] = useState<Department[]>(
    moduleData.hr?.departments || []
  );
  const [newDepartment, setNewDepartment] = useState<Department>({
    name: '',
    employeeCount: 0,
    systems: []
  });
  const [onboardingSteps, setOnboardingSteps] = useState(
    moduleData.hr?.onboardingSteps || 0
  );
  const [onboardingDuration, setOnboardingDuration] = useState(
    moduleData.hr?.onboardingDuration || 0
  );
  const [trainingRequirements, setTrainingRequirements] = useState<string[]>(
    moduleData.hr?.trainingRequirements || []
  );
  const [performanceReviewFrequency, setPerformanceReviewFrequency] = useState(
    moduleData.hr?.performanceReviewFrequency || ''
  );
  const [employeeTurnoverRate, setEmployeeTurnoverRate] = useState(
    moduleData.hr?.employeeTurnoverRate || 0
  );
  const [hrSystemsInUse, setHrSystemsInUse] = useState<string[]>(
    moduleData.hr?.hrSystemsInUse || []
  );

  // NEW: Consolidated employee count (moved from Overview)
  const [employeeCount, setEmployeeCount] = useState(moduleData.hr?.employeeCount || 0);

  // 4.5 לוגיסטיקה - Logistics
  const [inventoryMethod, setInventoryMethod] = useState(
    moduleData.logistics?.inventoryMethod || ''
  );
  const [shippingProcesses, setShippingProcesses] = useState<string[]>(
    moduleData.logistics?.shippingProcesses || []
  );
  const [supplierCount, setSupplierCount] = useState(
    moduleData.logistics?.supplierCount || 0
  );
  const [orderFulfillmentTime, setOrderFulfillmentTime] = useState(
    moduleData.logistics?.orderFulfillmentTime || 0
  );
  const [warehouseOperations, setWarehouseOperations] = useState<string[]>(
    moduleData.logistics?.warehouseOperations || []
  );
  const [deliveryIssues, setDeliveryIssues] = useState(
    moduleData.logistics?.deliveryIssues || ''
  );
  const [returnProcessTime, setReturnProcessTime] = useState(
    moduleData.logistics?.returnProcessTime || 0
  );
  const [inventoryAccuracy, setInventoryAccuracy] = useState(
    moduleData.logistics?.inventoryAccuracy || 90
  );

  const saveData = () => {
    updateModule('operations', {
      workProcesses: {
        processes: workProcesses,
        commonFailures,
        errorTrackingSystem,
        processDocumentation,
        automationReadiness
      },
      documentManagement: {
        flows: documentFlows,
        storageLocations,
        searchDifficulties,
        versionControlMethod,
        approvalWorkflow,
        documentRetention
      },
      projectManagement: {
        tools: projectTools,
        taskCreationSources,
        issues: projectIssues,
        resourceAllocationMethod,
        timelineAccuracy,
        projectVisibility,
        deadlineMissRate
      },
      hr: {
        employeeCount, // NEW consolidated field
        departments,
        onboardingSteps,
        onboardingDuration,
        trainingRequirements,
        performanceReviewFrequency,
        employeeTurnoverRate,
        hrSystemsInUse
      },
      logistics: {
        inventoryMethod,
        shippingProcesses,
        supplierCount,
        orderFulfillmentTime,
        warehouseOperations,
        deliveryIssues,
        returnProcessTime,
        inventoryAccuracy
      }
    });
  };

  useBeforeUnload(saveData);

  // Auto-save with debounce - only save if there's actual user input
  useEffect(() => {
    const timer = setTimeout(saveData, 1000);

    return () => clearTimeout(timer);
  }, [
    workProcesses, commonFailures, errorTrackingSystem, processDocumentation, automationReadiness,
    documentFlows, storageLocations, searchDifficulties, versionControlMethod, approvalWorkflow, documentRetention,
    projectTools, taskCreationSources, projectIssues, resourceAllocationMethod, timelineAccuracy, projectVisibility, deadlineMissRate,
    employeeCount, departments, onboardingSteps, onboardingDuration, trainingRequirements, performanceReviewFrequency, employeeTurnoverRate, hrSystemsInUse,
    inventoryMethod, shippingProcesses, supplierCount, orderFulfillmentTime, warehouseOperations, deliveryIssues, returnProcessTime, inventoryAccuracy,
    updateModule
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const calculateAutomationPotential = () => {
    let potential = 0;

    // Process automation potential
    if (workProcesses.length > 0) {
      const avgSteps = workProcesses.reduce((sum, p) => sum + p.stepCount, 0) / workProcesses.length;
      if (avgSteps > 5) potential += 30;
    }

    // Document automation potential
    const totalDocTime = documentFlows.reduce((sum, d) => sum + (d.volumePerMonth * d.timePerDocument), 0);
    if (totalDocTime > 1000) potential += 30;

    // Project management automation
    if (projectTools.length === 0 || deadlineMissRate > 20) potential += 20;

    // HR automation
    if (onboardingSteps > 10) potential += 20;

    return Math.min(100, potential);
  };

  const addWorkProcess = () => {
    if (newProcess.name) {
      setWorkProcesses([...workProcesses, newProcess]);
      setNewProcess({
        name: '',
        description: '',
        stepCount: 0,
        bottleneck: '',
        failurePoint: '',
        estimatedTime: 0
      });
    }
  };

  const addDocumentFlow = () => {
    if (newDocFlow.type) {
      setDocumentFlows([...documentFlows, newDocFlow]);
      setNewDocFlow({
        type: '',
        volumePerMonth: 0,
        timePerDocument: 0,
        requiresApproval: false,
        versionControlNeeded: false
      });
    }
  };

  const addProjectIssue = () => {
    if (newProjectIssue.area) {
      setProjectIssues([...projectIssues, newProjectIssue]);
      setNewProjectIssue({
        area: '',
        frequency: '',
        impact: 'medium'
      });
    }
  };

  const addDepartment = () => {
    if (newDepartment.name) {
      setDepartments([...departments, newDepartment]);
      setNewDepartment({
        name: '',
        employeeCount: 0,
        systems: []
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110"
              >
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="hover:text-gray-900 cursor-pointer" onClick={() => navigate('/dashboard')}>
                  ראשי
                </span>
                <span>/</span>
                <span className="text-gray-900 font-medium">תפעול פנימי</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Automation Potential Indicator */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">
                    פוטנציאל אוטומציה: {calculateAutomationPotential()}%
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/module/reporting')}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg
                         hover:from-blue-700 hover:to-blue-800 transition-all duration-300
                         shadow-md hover:shadow-lg transform hover:scale-105"
              >
                המשך למודול הבא
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Phase Read-Only Banner */}
        <PhaseReadOnlyBanner moduleName="תפעול פנימי" />

        <div className="space-y-4">

          {/* Module Overview Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Settings className="w-8 h-8 text-blue-600" />
                  מודול 4: תפעול פנימי
                </h2>
                <p className="text-gray-600 mt-2">
                  ניתוח תהליכי עבודה, ניהול מסמכים, פרויקטים, משאבי אנוש ולוגיסטיקה
                </p>
              </div>
              <div className="text-5xl">⚙️</div>
            </div>
          </Card>

          {/* 4.1 Work Processes */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <button
              onClick={() => toggleSection('workProcesses')}
              className="w-full flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Settings className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">4.1 תהליכי עבודה</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    מיפוי תהליכים, צווארי בקבוק ונקודות כשל
                  </p>
                </div>
              </div>
              <div className="transform transition-transform duration-300">
                {expandedSections.includes('workProcesses') ?
                  <ChevronUp className="w-5 h-5" /> :
                  <ChevronDown className="w-5 h-5" />
                }
              </div>
            </button>

            {expandedSections.includes('workProcesses') && (
              <div className="mt-6 space-y-6 animate-fadeIn">

                {/* Process List */}
                <div>
                  <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                    תהליכים עיקריים
                    <Info className="w-4 h-4 text-gray-400" />
                  </label>
                  <div className="space-y-3 mb-4">
                    {/* Defensive check: Ensure workProcesses is an array before mapping */}
                    {Array.isArray(workProcesses) && workProcesses.map((process, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{process.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{process.description}</p>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm">
                              <span className="text-blue-700">
                                <strong>{process.stepCount}</strong> שלבים
                              </span>
                              <span className="text-orange-700">
                                <strong>{process.estimatedTime}</strong> דקות
                              </span>
                              {process.bottleneck && (
                                <span className="text-red-700">
                                  צוואר בקבוק: {process.bottleneck}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => setWorkProcesses(workProcesses.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Process */}
                  <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                    <h4 className="font-medium text-blue-900">הוסף תהליך חדש</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        value={newProcess.name}
                        onChange={(v) => setNewProcess({ ...newProcess, name: v })}
                        placeholder="שם התהליך"
                        dir="rtl"
                      />
                      <Input
                        value={newProcess.description}
                        onChange={(v) => setNewProcess({ ...newProcess, description: v })}
                        placeholder="תיאור קצר"
                        dir="rtl"
                      />
                      <Input
                        type="number"
                        value={newProcess.stepCount?.toString() || ''}
                        onChange={(v) => setNewProcess({ ...newProcess, stepCount: v ? parseInt(v) : 0 })}
                        placeholder="מספר שלבים"
                        dir="rtl"
                      />
                      <Input
                        type="number"
                        value={newProcess.estimatedTime?.toString() || ''}
                        onChange={(v) => setNewProcess({ ...newProcess, estimatedTime: v ? parseInt(v) : 0 })}
                        placeholder="זמן משוער (דקות)"
                        dir="rtl"
                      />
                      <Input
                        value={newProcess.bottleneck}
                        onChange={(v) => setNewProcess({ ...newProcess, bottleneck: v })}
                        placeholder="צוואר בקבוק עיקרי"
                        dir="rtl"
                      />
                      <Input
                        value={newProcess.failurePoint}
                        onChange={(v) => setNewProcess({ ...newProcess, failurePoint: v })}
                        placeholder="נקודת כשל נפוצה"
                        dir="rtl"
                      />
                    </div>
                    <Button
                      onClick={addWorkProcess}
                      variant="primary"
                      className="w-full md:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      הוסף תהליך
                    </Button>
                  </div>
                </div>

                {/* Common Failures */}
                <CheckboxGroup
                  label="נקודות כשל נפוצות"
                  options={[
                    { value: 'manual_errors', label: 'טעויות אנוש' },
                    { value: 'system_crashes', label: 'קריסות מערכת' },
                    { value: 'missing_info', label: 'מידע חסר' },
                    { value: 'communication', label: 'תקשורת לקויה' },
                    { value: 'approval_delays', label: 'עיכובי אישורים' },
                    { value: 'resource_shortage', label: 'מחסור במשאבים' }
                  ]}
                  values={commonFailures}
                  onChange={setCommonFailures}
                  columns={2}
                />

                {/* Error Tracking */}
                <div>
                  <label className="block text-sm font-medium mb-2">מערכת מעקב שגיאות</label>
                  <Select
                    value={errorTrackingSystem}
                    onChange={setErrorTrackingSystem}
                    options={[
                      { value: 'none', label: 'אין מעקב' },
                      { value: 'manual', label: 'רישום ידני' },
                      { value: 'excel', label: 'Excel' },
                      { value: 'system', label: 'מערכת ייעודית' },
                      { value: 'crm', label: 'ב-CRM' }
                    ]}
                    dir="rtl"
                  />
                </div>

                {/* Process Documentation */}
                <div>
                  <label className="block text-sm font-medium mb-2">תיעוד תהליכים</label>
                  <TextArea
                    value={processDocumentation}
                    onChange={setProcessDocumentation}
                    rows={3}
                    placeholder="איך מתועדים התהליכים בארגון? האם יש נהלי עבודה כתובים?"
                    dir="rtl"
                  />
                </div>

                {/* Automation Readiness */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    בשלות לאוטומציה (0-100%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={automationReadiness}
                      onChange={(e) => setAutomationReadiness(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-12 text-center font-bold text-blue-600">
                      {automationReadiness}%
                    </span>
                  </div>
                </div>

                {/* Pain Points */}
                {workProcesses.length > 5 && (
                  <PainPointFlag
                    module="operations"
                    subModule="workProcesses"
                    label="יותר מדי תהליכים מורכבים"
                    autoDetect={true}
                    condition={true}
                  />
                )}
                {commonFailures.length > 3 && (
                  <PainPointFlag
                    module="operations"
                    subModule="workProcesses"
                    label="נקודות כשל מרובות"
                    autoDetect={true}
                    condition={true}
                  />
                )}
              </div>
            )}
          </Card>

          {/* 4.2 Document Management */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <button
              onClick={() => toggleSection('documents')}
              className="w-full flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <FileText className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">4.2 ניהול מסמכים</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    זרימת מסמכים, אישורים ובקרת גרסאות
                  </p>
                </div>
              </div>
              <div className="transform transition-transform duration-300">
                {expandedSections.includes('documents') ?
                  <ChevronUp className="w-5 h-5" /> :
                  <ChevronDown className="w-5 h-5" />
                }
              </div>
            </button>

            {expandedSections.includes('documents') && (
              <div className="mt-6 space-y-6 animate-fadeIn">

                {/* Document Flows */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    זרימת מסמכים
                  </label>
                  <div className="space-y-3 mb-4">
                    {/* Defensive check: Ensure documentFlows is an array before mapping */}
                    {Array.isArray(documentFlows) && documentFlows.map((flow, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="font-medium">{flow.type}</span>
                            <div className="flex gap-4 mt-1 text-sm text-gray-600">
                              <span>{flow.volumePerMonth} בחודש</span>
                              <span>{flow.timePerDocument} דקות למסמך</span>
                              {flow.requiresApproval && (
                                <span className="text-orange-600">דורש אישור</span>
                              )}
                              {flow.versionControlNeeded && (
                                <span className="text-blue-600">נדרש בקרת גרסאות</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => setDocumentFlows(documentFlows.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Document Flow */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <Input
                      value={newDocFlow.type}
                      onChange={(v) => setNewDocFlow({ ...newDocFlow, type: v })}
                      placeholder="סוג מסמך"
                      dir="rtl"
                    />
                    <Input
                      type="number"
                      value={newDocFlow.volumePerMonth?.toString() || ''}
                      onChange={(v) => setNewDocFlow({ ...newDocFlow, volumePerMonth: v ? parseInt(v) : 0 })}
                      placeholder="כמות בחודש"
                      dir="rtl"
                    />
                    <Input
                      type="number"
                      value={newDocFlow.timePerDocument?.toString() || ''}
                      onChange={(v) => setNewDocFlow({ ...newDocFlow, timePerDocument: v ? parseInt(v) : 0 })}
                      placeholder="דקות למסמך"
                      dir="rtl"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newDocFlow.requiresApproval}
                        onChange={(e) => setNewDocFlow({ ...newDocFlow, requiresApproval: e.target.checked })}
                        className="rounded"
                      />
                      <label className="text-sm">דורש אישור</label>
                    </div>
                    <Button
                      onClick={addDocumentFlow}
                      variant="primary"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Storage Locations */}
                <CheckboxGroup
                  label="מיקומי אחסון"
                  options={[
                    { value: 'google_drive', label: 'Google Drive' },
                    { value: 'dropbox', label: 'Dropbox' },
                    { value: 'sharepoint', label: 'SharePoint' },
                    { value: 'local_server', label: 'שרת מקומי' },
                    { value: 'physical', label: 'ארכיב פיזי' },
                    { value: 'cloud', label: 'ענן אחר' }
                  ]}
                  values={storageLocations}
                  onChange={setStorageLocations}
                  columns={3}
                />

                {/* Search Difficulties */}
                <div>
                  <label className="block text-sm font-medium mb-2">קשיים באיתור מסמכים</label>
                  <TextArea
                    value={searchDifficulties}
                    onChange={setSearchDifficulties}
                    rows={3}
                    placeholder="תאר קשיים באיתור מסמכים, זמן חיפוש ממוצע, בעיות בארגון התיקיות..."
                    dir="rtl"
                  />
                </div>

                {/* Version Control */}
                <div>
                  <label className="block text-sm font-medium mb-2">בקרת גרסאות</label>
                  <Select
                    value={versionControlMethod}
                    onChange={setVersionControlMethod}
                    options={[
                      { value: 'none', label: 'אין בקרת גרסאות' },
                      { value: 'manual_naming', label: 'שמות ידניים (v1, v2)' },
                      { value: 'system', label: 'מערכת אוטומטית' },
                      { value: 'sharepoint', label: 'SharePoint versions' },
                      { value: 'git', label: 'Git או דומה' }
                    ]}
                    dir="rtl"
                  />
                </div>

                {/* Approval Workflow */}
                <div>
                  <label className="block text-sm font-medium mb-2">תהליכי אישור</label>
                  <Input
                    value={approvalWorkflow}
                    onChange={setApprovalWorkflow}
                    placeholder="תאר את שרשרת האישורים הנדרשת למסמכים שונים"
                    dir="rtl"
                  />
                </div>

                {/* Document Retention */}
                <div>
                  <label className="block text-sm font-medium mb-2">תקופת שמירת מסמכים (שנים)</label>
                  <Input
                    type="number"
                    value={documentRetention?.toString() || ''}
                    onChange={(v) => setDocumentRetention(v ? parseInt(v) : 0)}
                    dir="rtl"
                  />
                </div>

                {/* Pain Points */}
                {documentFlows.reduce((sum, f) => sum + (f.volumePerMonth * f.timePerDocument), 0) > 2000 && (
                  <PainPointFlag
                    module="operations"
                    subModule="documents"
                    label="זמן רב מושקע בניהול מסמכים"
                    autoDetect={true}
                    condition={true}
                  />
                )}
              </div>
            )}
          </Card>

          {/* 4.3 Project Management */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <button
              onClick={() => toggleSection('projects')}
              className="w-full flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <FolderOpen className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">4.3 ניהול פרויקטים</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    כלי ניהול, הקצאת משאבים ועמידה בלוחות זמנים
                  </p>
                </div>
              </div>
              <div className="transform transition-transform duration-300">
                {expandedSections.includes('projects') ?
                  <ChevronUp className="w-5 h-5" /> :
                  <ChevronDown className="w-5 h-5" />
                }
              </div>
            </button>

            {expandedSections.includes('projects') && (
              <div className="mt-6 space-y-6 animate-fadeIn">

                {/* Project Tools */}
                <CheckboxGroup
                  label="כלי ניהול פרויקטים"
                  options={[
                    { value: 'monday', label: 'Monday.com' },
                    { value: 'asana', label: 'Asana' },
                    { value: 'trello', label: 'Trello' },
                    { value: 'jira', label: 'Jira' },
                    { value: 'notion', label: 'Notion' },
                    { value: 'excel', label: 'Excel' },
                    { value: 'ms_project', label: 'MS Project' }
                  ]}
                  values={projectTools}
                  onChange={setProjectTools}
                  columns={3}
                />

                {/* Task Creation Sources */}
                <CheckboxGroup
                  label="מקורות יצירת משימות"
                  options={[
                    { value: 'email', label: 'אימייל' },
                    { value: 'meetings', label: 'ישיבות' },
                    { value: 'phone', label: 'שיחות טלפון' },
                    { value: 'whatsapp', label: 'WhatsApp' },
                    { value: 'crm', label: 'CRM' },
                    { value: 'customers', label: 'פניות לקוחות' },
                    { value: 'internal', label: 'יוזמות פנימיות' }
                  ]}
                  values={taskCreationSources}
                  onChange={setTaskCreationSources}
                  columns={2}
                />

                {/* Project Issues */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    בעיות בניהול פרויקטים
                  </label>
                  <div className="space-y-2 mb-3">
                    {/* Defensive check: Ensure projectIssues is an array before mapping */}
                    {Array.isArray(projectIssues) && projectIssues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex-1">
                          <span className="font-medium">{issue.area}</span>
                          <span className="mx-2">|</span>
                          <span className="text-sm text-gray-600">{issue.frequency}</span>
                          <span className="mx-2">|</span>
                          <span className={`text-sm font-medium ${
                            issue.impact === 'high' ? 'text-red-600' :
                            issue.impact === 'medium' ? 'text-orange-600' :
                            'text-yellow-600'
                          }`}>
                            השפעה {issue.impact === 'high' ? 'גבוהה' :
                                   issue.impact === 'medium' ? 'בינונית' : 'נמוכה'}
                          </span>
                        </div>
                        <button
                          onClick={() => setProjectIssues(projectIssues.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <Input
                      value={newProjectIssue.area}
                      onChange={(v) => setNewProjectIssue({ ...newProjectIssue, area: v })}
                      placeholder="תחום הבעיה"
                      dir="rtl"
                    />
                    <Input
                      value={newProjectIssue.frequency}
                      onChange={(v) => setNewProjectIssue({ ...newProjectIssue, frequency: v })}
                      placeholder="תדירות"
                      dir="rtl"
                    />
                    <Select
                      value={newProjectIssue.impact}
                      onChange={(v) => setNewProjectIssue({ ...newProjectIssue, impact: v as 'high' | 'medium' | 'low' })}
                      options={[
                        { value: 'high', label: 'השפעה גבוהה' },
                        { value: 'medium', label: 'השפעה בינונית' },
                        { value: 'low', label: 'השפעה נמוכה' }
                      ]}
                      dir="rtl"
                    />
                    <Button
                      onClick={addProjectIssue}
                      variant="primary"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Resource Allocation */}
                <div>
                  <label className="block text-sm font-medium mb-2">שיטת הקצאת משאבים</label>
                  <Select
                    value={resourceAllocationMethod}
                    onChange={setResourceAllocationMethod}
                    options={[
                      { value: 'none', label: 'אין שיטה מסודרת' },
                      { value: 'manual', label: 'ידני לפי זמינות' },
                      { value: 'rotation', label: 'תורנות' },
                      { value: 'skills', label: 'לפי כישורים' },
                      { value: 'automated', label: 'אוטומטי במערכת' }
                    ]}
                    dir="rtl"
                  />
                </div>

                {/* Timeline Accuracy */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    דיוק בהערכת זמנים (0-100%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={timelineAccuracy}
                      onChange={(e) => setTimelineAccuracy(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-12 text-center font-bold text-purple-600">
                      {timelineAccuracy}%
                    </span>
                  </div>
                  {timelineAccuracy < 50 && (
                    <p className="text-sm text-orange-600 mt-2">
                      ⚠️ דיוק נמוך בהערכות זמן עלול לגרום לחריגות תקציב
                    </p>
                  )}
                </div>

                {/* Project Visibility */}
                <RadioGroup
                  label="שקיפות סטטוס פרויקטים"
                  value={projectVisibility}
                  onChange={setProjectVisibility}
                  options={[
                    { value: 'none', label: 'אין שקיפות' },
                    { value: 'meetings', label: 'רק בישיבות' },
                    { value: 'dashboard', label: 'דשבורד משותף' },
                    { value: 'realtime', label: 'עדכון בזמן אמת' }
                  ]}
                  orientation="horizontal"
                />

                {/* Deadline Miss Rate */}
                <div>
                  <label className="block text-sm font-medium mb-2">אחוז פרויקטים שחורגים מלוח הזמנים</label>
                  <Input
                    type="number"
                    value={deadlineMissRate?.toString() || ''}
                    onChange={(v) => setDeadlineMissRate(v ? parseInt(v) : 0)}
                    dir="rtl"
                  />
                </div>

                {/* Pain Points */}
                {deadlineMissRate > 30 && (
                  <PainPointFlag
                    module="operations"
                    subModule="projects"
                    label="חריגות רבות בלוחות זמנים"
                    autoDetect={true}
                    condition={true}
                  />
                )}
                {projectIssues.filter(i => i.impact === 'high').length > 2 && (
                  <PainPointFlag
                    module="operations"
                    subModule="projects"
                    label="בעיות קריטיות בניהול פרויקטים"
                    autoDetect={true}
                    condition={true}
                  />
                )}
              </div>
            )}
          </Card>

          {/* 4.4 HR */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <button
              onClick={() => toggleSection('hr')}
              className="w-full flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <Users className="w-5 h-5 text-orange-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">4.4 משאבי אנוש</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    קליטת עובדים, הדרכות וניהול כוח אדם
                  </p>
                </div>
              </div>
              <div className="transform transition-transform duration-300">
                {expandedSections.includes('hr') ?
                  <ChevronUp className="w-5 h-5" /> :
                  <ChevronDown className="w-5 h-5" />
                }
              </div>
            </button>

            {expandedSections.includes('hr') && (
              <div className="mt-6 space-y-6 animate-fadeIn">

                {/* Departments */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    מחלקות וכוח אדם
                  </label>
                  <div className="space-y-2 mb-3">
                    {/* Defensive check: Ensure departments is an array before mapping */}
                    {Array.isArray(departments) && departments.map((dept, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Users className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">{dept.name}</span>
                        <span className="text-sm text-gray-600">{dept.employeeCount} עובדים</span>
                        <button
                          onClick={() => setDepartments(departments.filter((_, i) => i !== index))}
                          className="mr-auto text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      value={newDepartment.name}
                      onChange={(v) => setNewDepartment({ ...newDepartment, name: v })}
                      placeholder="שם מחלקה"
                      dir="rtl"
                    />
                    <Input
                      type="number"
                      value={newDepartment.employeeCount?.toString() || ''}
                      onChange={(v) => setNewDepartment({ ...newDepartment, employeeCount: v ? parseInt(v) : 0 })}
                      placeholder="מספר עובדים"
                      dir="rtl"
                    />
                    <Button
                      onClick={addDepartment}
                      variant="primary"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Onboarding */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">מספר שלבים בקליטת עובד</label>
                    <Input
                      type="number"
                      value={onboardingSteps?.toString() || ''}
                      onChange={(v) => setOnboardingSteps(v ? parseInt(v) : 0)}
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">משך קליטת עובד (ימים)</label>
                    <Input
                      type="number"
                      value={onboardingDuration?.toString() || ''}
                      onChange={(v) => setOnboardingDuration(v ? parseInt(v) : 0)}
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Training Requirements */}
                <CheckboxGroup
                  label="דרישות הדרכה"
                  options={[
                    { value: 'product', label: 'הכרת המוצר' },
                    { value: 'systems', label: 'הכרת מערכות' },
                    { value: 'procedures', label: 'נהלי עבודה' },
                    { value: 'safety', label: 'בטיחות' },
                    { value: 'compliance', label: 'ציות ורגולציה' },
                    { value: 'soft_skills', label: 'מיומנויות רכות' },
                    { value: 'technical', label: 'הכשרה טכנית' }
                  ]}
                  values={trainingRequirements}
                  onChange={setTrainingRequirements}
                  columns={2}
                />

                {/* Performance Reviews */}
                <div>
                  <label className="block text-sm font-medium mb-2">תדירות הערכות עובדים</label>
                  <Select
                    value={performanceReviewFrequency}
                    onChange={setPerformanceReviewFrequency}
                    options={[
                      { value: 'none', label: 'אין הערכות' },
                      { value: 'annual', label: 'שנתי' },
                      { value: 'biannual', label: 'חצי שנתי' },
                      { value: 'quarterly', label: 'רבעוני' },
                      { value: 'monthly', label: 'חודשי' }
                    ]}
                    dir="rtl"
                  />
                </div>

                {/* Turnover Rate */}
                <div>
                  <label className="block text-sm font-medium mb-2">שיעור תחלופת עובדים שנתי</label>
                  <Input
                    type="number"
                    value={employeeTurnoverRate?.toString() || ''}
                    onChange={(v) => setEmployeeTurnoverRate(v ? parseInt(v) : 0)}
                    dir="rtl"
                  />
                </div>

                {/* HR Systems */}
                <CheckboxGroup
                  label="מערכות HR בשימוש"
                  options={[
                    { value: 'hilan', label: 'חילן' },
                    { value: 'priority', label: 'Priority' },
                    { value: 'sap', label: 'SAP' },
                    { value: 'workday', label: 'Workday' },
                    { value: 'excel', label: 'Excel' },
                    { value: 'paper', label: 'ידני/נייר' }
                  ]}
                  values={hrSystemsInUse}
                  onChange={setHrSystemsInUse}
                  columns={3}
                />

                {/* Pain Points */}
                {onboardingDuration > 30 && (
                  <PainPointFlag
                    module="operations"
                    subModule="hr"
                    label="תהליך קליטה ארוך מדי"
                    autoDetect={true}
                    condition={true}
                  />
                )}
                {employeeTurnoverRate > 25 && (
                  <PainPointFlag
                    module="operations"
                    subModule="hr"
                    label="תחלופת עובדים גבוהה"
                    autoDetect={true}
                    condition={true}
                  />
                )}
              </div>
            )}
          </Card>

          {/* 4.5 Logistics */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <button
              onClick={() => toggleSection('logistics')}
              className="w-full flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <Package className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">4.5 לוגיסטיקה</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    מלאי, משלוחים וניהול ספקים
                  </p>
                </div>
              </div>
              <div className="transform transition-transform duration-300">
                {expandedSections.includes('logistics') ?
                  <ChevronUp className="w-5 h-5" /> :
                  <ChevronDown className="w-5 h-5" />
                }
              </div>
            </button>

            {expandedSections.includes('logistics') && (
              <div className="mt-6 space-y-6 animate-fadeIn">

                {/* Inventory Method */}
                <div>
                  <label className="block text-sm font-medium mb-2">שיטת ניהול מלאי</label>
                  <Select
                    value={inventoryMethod}
                    onChange={setInventoryMethod}
                    options={[
                      { value: 'none', label: 'אין ניהול מלאי' },
                      { value: 'manual', label: 'ספירה ידנית' },
                      { value: 'excel', label: 'Excel' },
                      { value: 'erp', label: 'מערכת ERP' },
                      { value: 'wms', label: 'מערכת WMS' },
                      { value: 'rfid', label: 'RFID/ברקוד' }
                    ]}
                    dir="rtl"
                  />
                </div>

                {/* Shipping Processes */}
                <CheckboxGroup
                  label="תהליכי משלוח"
                  options={[
                    { value: 'self_delivery', label: 'משלוח עצמי' },
                    { value: 'courier', label: 'חברות שליחויות' },
                    { value: 'post', label: 'דואר ישראל' },
                    { value: 'pickup', label: 'איסוף עצמי' },
                    { value: 'dropshipping', label: 'Dropshipping' },
                    { value: 'third_party', label: 'צד שלישי' }
                  ]}
                  values={shippingProcesses}
                  onChange={setShippingProcesses}
                  columns={2}
                />

                {/* Supplier Management */}
                <div>
                  <label className="block text-sm font-medium mb-2">מספר ספקים פעילים</label>
                  <Input
                    type="number"
                    value={supplierCount?.toString() || ''}
                    onChange={(v) => setSupplierCount(v ? parseInt(v) : 0)}
                    dir="rtl"
                  />
                </div>

                {/* Order Fulfillment */}
                <div>
                  <label className="block text-sm font-medium mb-2">זמן ממוצע למימוש הזמנה (ימים)</label>
                  <Input
                    type="number"
                    value={orderFulfillmentTime?.toString() || ''}
                    onChange={(v) => setOrderFulfillmentTime(v ? parseInt(v) : 0)}
                    dir="rtl"
                  />
                </div>

                {/* Warehouse Operations */}
                <CheckboxGroup
                  label="פעולות מחסן"
                  options={[
                    { value: 'receiving', label: 'קבלת סחורה' },
                    { value: 'quality_check', label: 'בדיקת איכות' },
                    { value: 'storage', label: 'אחסון' },
                    { value: 'picking', label: 'ליקוט' },
                    { value: 'packing', label: 'אריזה' },
                    { value: 'shipping', label: 'משלוח' },
                    { value: 'returns', label: 'החזרות' }
                  ]}
                  values={warehouseOperations}
                  onChange={setWarehouseOperations}
                  columns={2}
                />

                {/* Delivery Issues */}
                <div>
                  <label className="block text-sm font-medium mb-2">בעיות במשלוחים</label>
                  <TextArea
                    value={deliveryIssues}
                    onChange={setDeliveryIssues}
                    rows={3}
                    placeholder="תאר בעיות נפוצות במשלוחים, איחורים, נזקים..."
                    dir="rtl"
                  />
                </div>

                {/* Return Process */}
                <div>
                  <label className="block text-sm font-medium mb-2">זמן טיפול בהחזרה (ימים)</label>
                  <Input
                    type="number"
                    value={returnProcessTime?.toString() || ''}
                    onChange={(v) => setReturnProcessTime(v ? parseInt(v) : 0)}
                    dir="rtl"
                  />
                </div>

                {/* Inventory Accuracy */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    דיוק מלאי (0-100%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={inventoryAccuracy}
                      onChange={(e) => setInventoryAccuracy(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-12 text-center font-bold text-indigo-600">
                      {inventoryAccuracy}%
                    </span>
                  </div>
                  {inventoryAccuracy < 80 && (
                    <p className="text-sm text-orange-600 mt-2">
                      ⚠️ דיוק נמוך במלאי עלול לגרום לחוסרים או עודפים
                    </p>
                  )}
                </div>

                {/* Pain Points */}
                {orderFulfillmentTime > 7 && (
                  <PainPointFlag
                    module="operations"
                    subModule="logistics"
                    label="זמן ארוך למימוש הזמנות"
                    autoDetect={true}
                    condition={true}
                  />
                )}
                {inventoryAccuracy < 80 && (
                  <PainPointFlag
                    module="operations"
                    subModule="logistics"
                    label="בעיות דיוק במלאי"
                    autoDetect={true}
                    condition={true}
                  />
                )}
              </div>
            )}
          </Card>

          {/* Summary Card */}
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-gray-900">סיכום ממצאים</h3>
                <p className="text-sm text-gray-600 mt-1">
                  זוהו {workProcesses.filter(p => p.bottleneck).length} צווארי בקבוק בתהליכים,
                  {' '}זמן עיבוד מסמכים של {documentFlows.reduce((sum, d) => sum + (d.volumePerMonth * d.timePerDocument), 0)} דקות בחודש,
                  {' '}ופוטנציאל אוטומציה של {calculateAutomationPotential()}%
                </p>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};