import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

interface AutoNotificationsConfig {
  channels: ('email' | 'sms' | 'whatsapp' | 'slack' | 'teams')[];
  triggers: Array<{ event: string; template: string }>;
  personalization: boolean;
  scheduling: boolean;
}

export function AutoNotificationsSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<AutoNotificationsConfig>>({
    channels: ['email'],
    triggers: [],
    personalization: true,
    scheduling: false,
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-notifications');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter(a => a.serviceId !== 'auto-notifications');

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-notifications',
      serviceName: 'התראות אוטומטיות',
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
      <Card title="שירות #10: התראות והודעות אוטומטיות">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ערוצי תקשורת</label>
            <div className="space-y-2">
              {(['email', 'sms', 'whatsapp', 'slack', 'teams'] as const).map((ch) => (
                <label key={ch} className="flex items-center">
                  <input type="checkbox" checked={config.channels?.includes(ch)}
                    onChange={(e) => {
                      const channels = config.channels || [];
                      setConfig({ ...config, channels: e.target.checked ? [...channels, ch] : channels.filter(c => c !== ch) });
                    }} className="mr-2" />
                  <span className="text-sm capitalize">{ch}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.personalization}
                onChange={(e) => setConfig({ ...config, personalization: e.target.checked })} className="mr-2" />
              <span className="text-sm">התאמה אישית</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.scheduling}
                onChange={(e) => setConfig({ ...config, scheduling: e.target.checked })} className="mr-2" />
              <span className="text-sm">תזמון מתקדם</span>
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
