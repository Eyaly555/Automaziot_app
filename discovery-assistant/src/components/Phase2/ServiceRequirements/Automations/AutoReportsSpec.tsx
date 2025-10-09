import React, { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

interface AutoReportsConfig {
  reportType: 'sales' | 'operations' | 'financial' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  format: 'pdf' | 'excel' | 'html' | 'dashboard';
  recipients: string[];
  dataSource: string;
  scheduledTime: string;
}

export function AutoReportsSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<AutoReportsConfig>>({
    reportType: 'sales',
    frequency: 'weekly',
    format: 'pdf',
    recipients: [],
    dataSource: '',
    scheduledTime: '08:00',
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-reports');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter(a => a.serviceId !== 'auto-reports');

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-reports',
      serviceName: 'דוחות אוטומטיים',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting(currentMeeting.id, {
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        automations: updated,
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #16: דוחות אוטומטיים">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">סוג דוח</label>
              <select value={config.reportType} onChange={(e) => setConfig({ ...config, reportType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="sales">מכירות</option>
                <option value="operations">תפעול</option>
                <option value="financial">כספי</option>
                <option value="custom">מותאם אישית</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">תדירות</label>
              <select value={config.frequency} onChange={(e) => setConfig({ ...config, frequency: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="daily">יומי</option>
                <option value="weekly">שבועי</option>
                <option value="monthly">חודשי</option>
                <option value="quarterly">רבעוני</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">פורמט</label>
              <select value={config.format} onChange={(e) => setConfig({ ...config, format: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="html">HTML</option>
                <option value="dashboard">Dashboard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">זמן שליחה</label>
              <input type="time" value={config.scheduledTime} onChange={(e) => setConfig({ ...config, scheduledTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
