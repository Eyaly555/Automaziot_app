import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

interface AutoMeetingSchedulerConfig {
  schedulingTool: 'calendly' | 'microsoft_bookings' | 'google_calendar' | 'custom';
  crmSystem: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
  calendarSync: boolean;
  autoConfirmation: boolean;
  reminderEnabled: boolean;
  bufferTime: number;
  availabilityRules: Array<{
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
}

export function AutoMeetingSchedulerSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<AutoMeetingSchedulerConfig>>({
    schedulingTool: 'calendly',
    crmSystem: 'zoho',
    calendarSync: true,
    autoConfirmation: true,
    reminderEnabled: true,
    bufferTime: 15,
    availabilityRules: [],
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-meeting-scheduler');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter(a => a.serviceId !== 'auto-meeting-scheduler');

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-meeting-scheduler',
      serviceName: 'תזמון פגישות אוטומטי',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        automations: updated,
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #7: תיאום פגישות אוטומטי">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">כלי תזמון</label>
              <select value={config.schedulingTool} onChange={(e) => setConfig({ ...config, schedulingTool: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="calendly">Calendly</option>
                <option value="microsoft_bookings">Microsoft Bookings</option>
                <option value="google_calendar">Google Calendar</option>
                <option value="custom">מותאם אישית</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מערכת CRM</label>
              <select value={config.crmSystem} onChange={(e) => setConfig({ ...config, crmSystem: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="zoho">Zoho CRM</option>
                <option value="salesforce">Salesforce</option>
                <option value="hubspot">HubSpot</option>
                <option value="pipedrive">Pipedrive</option>
                <option value="other">אחר</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">זמן חיץ בין פגישות (דקות)</label>
            <input type="number" value={config.bufferTime} onChange={(e) => setConfig({ ...config, bufferTime: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md" min="0" max="60" />
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.calendarSync}
                onChange={(e) => setConfig({ ...config, calendarSync: e.target.checked })} className="mr-2" />
              <span className="text-sm">סנכרון עם לוח שנה</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.autoConfirmation}
                onChange={(e) => setConfig({ ...config, autoConfirmation: e.target.checked })} className="mr-2" />
              <span className="text-sm">אישור אוטומטי</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.reminderEnabled}
                onChange={(e) => setConfig({ ...config, reminderEnabled: e.target.checked })} className="mr-2" />
              <span className="text-sm">תזכורות מופעלות</span>
            </label>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
