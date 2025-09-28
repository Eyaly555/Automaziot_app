import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Save, Plus, X } from 'lucide-react';
import { useMeetingStore } from '../../../store/useMeetingStore';
import { Card } from '../../Common/Card';
import { TextField, NumberField, SelectField, CheckboxGroup } from '../../Common/FormFields';
import { PainPointFlag } from '../../Common/PainPointFlag/PainPointFlag';

const businessTypeOptions = [
  { value: 'b2b', label: 'B2B' },
  { value: 'b2c', label: 'B2C' },
  { value: 'saas', label: 'SaaS' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'service', label: 'שירותים' },
  { value: 'manufacturing', label: 'ייצור' },
  { value: 'retail', label: 'קמעונאות' },
  { value: 'other', label: 'אחר' }
];

const systemOptions = [
  { value: 'crm', label: 'CRM' },
  { value: 'erp', label: 'ERP' },
  { value: 'excel', label: 'Excel' },
  { value: 'google_sheets', label: 'Google Sheets' },
  { value: 'monday', label: 'Monday.com' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'priority', label: 'Priority' },
  { value: 'sap', label: 'SAP' }
];

export const OverviewModule: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateModule } = useMeetingStore();
  const overviewData = currentMeeting?.modules.overview || {};

  const [businessType, setBusinessType] = useState(overviewData.businessType || '');
  const [employees, setEmployees] = useState(overviewData.employees);
  const [mainChallenge, setMainChallenge] = useState(overviewData.mainChallenge || '');
  const [processes, setProcesses] = useState<string[]>(overviewData.processes || []);
  const [newProcess, setNewProcess] = useState('');
  const [currentSystems, setCurrentSystems] = useState<string[]>(overviewData.currentSystems || []);
  const [mainGoals, setMainGoals] = useState<string[]>(overviewData.mainGoals || []);
  const [newGoal, setNewGoal] = useState('');

  // Auto-save on changes - only save if there's actual user input
  useEffect(() => {
    // Check if any meaningful data exists before saving
    const hasData =
      businessType ||
      (employees && employees > 0) ||
      mainChallenge ||
      processes.length > 0 ||
      currentSystems.length > 0 ||
      mainGoals.length > 0;

    if (!hasData) {
      // Don't save if there's no meaningful data
      return;
    }

    const timer = setTimeout(() => {
      updateModule('overview', {
        businessType,
        employees,
        mainChallenge,
        processes,
        currentSystems,
        mainGoals
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [businessType, employees, mainChallenge, processes, currentSystems, mainGoals]);

  const handleAddProcess = () => {
    if (newProcess.trim()) {
      setProcesses([...processes, newProcess.trim()]);
      setNewProcess('');
    }
  };

  const handleRemoveProcess = (index: number) => {
    setProcesses(processes.filter((_, i) => i !== index));
  };

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setMainGoals([...mainGoals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (index: number) => {
    setMainGoals(mainGoals.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">סקירה כללית</h1>
            </div>
            <button
              onClick={() => navigate('/module/leadsAndSales')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              המשך למודול הבא
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Basic Information */}
          <Card title="מידע בסיסי" subtitle="פרטים כלליים על העסק">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="סוג העסק"
                value={businessType}
                onChange={setBusinessType}
                options={businessTypeOptions}
                placeholder="בחר סוג עסק"
              />
              <NumberField
                label="מספר עובדים"
                value={employees}
                onChange={setEmployees}
                min={1}
                placeholder="0"
              />
            </div>
          </Card>

          {/* Main Challenge */}
          <Card title="אתגר מרכזי" subtitle="מה הבעיה העיקרית שאתם מנסים לפתור?">
            <TextField
              value={mainChallenge}
              onChange={setMainChallenge}
              multiline
              rows={4}
              placeholder="תאר את האתגר המרכזי של העסק כיום..."
            />
            <div className="mt-3">
              <PainPointFlag
                module="overview"
                label="סמן כנקודת כאב"
                condition={mainChallenge.length > 50}
                autoDetect={true}
              />
            </div>
          </Card>

          {/* Business Processes */}
          <Card title="תהליכים עסקיים" subtitle="אילו תהליכים מרכזיים קיימים בעסק?">
            <div className="space-y-4">
              <div className="flex gap-2">
                <TextField
                  value={newProcess}
                  onChange={setNewProcess}
                  placeholder="הוסף תהליך..."
                  className="flex-1"
                />
                <button
                  onClick={handleAddProcess}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {processes.length > 0 && (
                <div className="space-y-2">
                  {processes.map((process, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">{process}</span>
                      <button
                        onClick={() => handleRemoveProcess(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Current Systems */}
          <Card title="מערכות קיימות" subtitle="אילו מערכות אתם משתמשים בהן כיום?">
            <CheckboxGroup
              options={systemOptions}
              values={currentSystems}
              onChange={setCurrentSystems}
              columns={3}
            />
          </Card>

          {/* Main Goals */}
          <Card title="יעדים מרכזיים" subtitle="מה אתם רוצים להשיג מתהליך האוטומציה?">
            <div className="space-y-4">
              <div className="flex gap-2">
                <TextField
                  value={newGoal}
                  onChange={setNewGoal}
                  placeholder="הוסף יעד..."
                  className="flex-1"
                />
                <button
                  onClick={handleAddGoal}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {mainGoals.length > 0 && (
                <div className="space-y-2">
                  {mainGoals.map((goal, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">{goal}</span>
                      <button
                        onClick={() => handleRemoveGoal(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};