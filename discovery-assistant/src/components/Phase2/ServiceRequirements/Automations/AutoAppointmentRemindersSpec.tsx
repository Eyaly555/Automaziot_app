import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AutoAppointmentRemindersRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';
import { Plus, Trash2, Save } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function AutoAppointmentRemindersSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<AutoAppointmentRemindersRequirements>({
    reminderSettings: {
      enabled: true,
      reminderTypes: ['email', 'sms'],
      leadTime: 24, // hours before appointment
      maxReminders: 3
    },
    appointmentSources: {
      calendarSystems: ['google_calendar', 'outlook'],
      crmIntegration: true,
      manualEntry: false
    },
    notificationContent: {
      templates: {
        email: {
          subject: 'תזכורת פגישה - {clientName}',
          body: 'שלום {clientName},\n\nזוהי תזכורת לפגישה שלנו ב-{appointmentTime}.\n\nפרטי הפגישה:\n{appointmentDetails}\n\nבברכה,\n{companyName}'
        },
        sms: {
          message: 'תזכורת: פגישה עם {clientName} ב-{appointmentTime}. פרטים: {appointmentDetails}'
        }
      },
      personalizationFields: ['clientName', 'appointmentTime', 'appointmentDetails', 'companyName']
    },
    schedulingRules: {
      businessHours: {
        start: '09:00',
        end: '18:00',
        workDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
      },
      blackoutDates: [],
      reschedulePolicy: 'manual_only'
    },
    followUp: {
      postAppointment: {
        enabled: true,
        delay: 1, // hours after appointment
        template: 'תודה שהשתתפת בפגישה. האם תרצה לקבוע פגישה נוספת?'
      }
    },
    integration: {
      calendarSync: true,
      crmUpdates: true,
      analyticsTracking: false
    }
  });

  useEffect(() => {
    if (currentMeeting?.implementationSpec?.automations) {
      const existing = currentMeeting.implementationSpec.automations.find(
        (a: any) => a.serviceId === 'auto-appointment-reminders'
      );
      if (existing) {
        setConfig(existing.requirements);
      }
    }
  }, [currentMeeting]);

  const saveConfig = () => {
    if (!currentMeeting) return;

    const updatedAutomations = [...(currentMeeting.implementationSpec?.automations || [])];
    const existingIndex = updatedAutomations.findIndex((a: any) => a.serviceId === 'auto-appointment-reminders');

    const automationData = {
      serviceId: 'auto-appointment-reminders',
      serviceName: 'הזכות פגישות אוטומטיות',
      requirements: config,
      completedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      updatedAutomations[existingIndex] = automationData;
    } else {
      updatedAutomations.push(automationData);
    }

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        automations: updatedAutomations,
        lastUpdated: new Date()
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="הגדרות הזכות פגישות" subtitle="הגדר את אופן שליחת ההזכות לפגישות">
        <div className="space-y-6">
          {/* הגדרות בסיסיות */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">הפעל הזכות</label>
              <select
                value={config.reminderSettings.enabled ? 'true' : 'false'}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  reminderSettings: { ...prev.reminderSettings, enabled: e.target.value === 'true' }
                }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="true">כן</option>
                <option value="false">לא</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">זמן התראה (שעות לפני)</label>
              <input
                type="number"
                value={config.reminderSettings.leadTime}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  reminderSettings: { ...prev.reminderSettings, leadTime: parseInt(e.target.value) || 24 }
                }))}
                className="w-full p-2 border rounded-lg"
                min="1"
                max="168"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">מקסימום הזכות</label>
              <input
                type="number"
                value={config.reminderSettings.maxReminders}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  reminderSettings: { ...prev.reminderSettings, maxReminders: parseInt(e.target.value) || 3 }
                }))}
                className="w-full p-2 border rounded-lg"
                min="1"
                max="10"
              />
            </div>
          </div>

          {/* ערוצי התראה */}
          <div>
            <label className="block text-sm font-medium mb-2">ערוצי התראה</label>
            <div className="space-y-2">
              {['email', 'sms', 'whatsapp'].map(channel => (
                <label key={channel} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.reminderSettings.reminderTypes.includes(channel as any)}
                    onChange={(e) => {
                      const types = e.target.checked
                        ? [...config.reminderSettings.reminderTypes, channel as any]
                        : config.reminderSettings.reminderTypes.filter(t => t !== channel);
                      setConfig(prev => ({
                        ...prev,
                        reminderSettings: { ...prev.reminderSettings, reminderTypes: types }
                      }));
                    }}
                  />
                  <span className="capitalize">{channel === 'email' ? 'אימייל' : channel === 'sms' ? 'SMS' : 'וואטסאפ'}</span>
                </label>
              ))}
            </div>
          </div>

          {/* תבניות התראה */}
          <div>
            <h4 className="font-medium mb-3">תבניות התראה</h4>
            {config.reminderSettings.reminderTypes.includes('email') && (
              <div className="space-y-3 p-4 border rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-1">נושא אימייל</label>
                  <input
                    type="text"
                    value={config.notificationContent.templates.email.subject}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      notificationContent: {
                        ...prev.notificationContent,
                        templates: {
                          ...prev.notificationContent.templates,
                          email: { ...prev.notificationContent.templates.email, subject: e.target.value }
                        }
                      }
                    }))}
                    className="w-full p-2 border rounded-lg"
                    placeholder="תזכורת פגישה - {clientName}"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">תוכן אימייל</label>
                  <textarea
                    value={config.notificationContent.templates.email.body}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      notificationContent: {
                        ...prev.notificationContent,
                        templates: {
                          ...prev.notificationContent.templates,
                          email: { ...prev.notificationContent.templates.email, body: e.target.value }
                        }
                      }
                    }))}
                    rows={4}
                    className="w-full p-2 border rounded-lg"
                    placeholder="שלום {clientName}, זוהי תזכורת לפגישה..."
                  />
                </div>
              </div>
            )}

            {config.reminderSettings.reminderTypes.includes('sms') && (
              <div className="space-y-3 p-4 border rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-1">תוכן SMS</label>
                  <textarea
                    value={config.notificationContent.templates.sms.message}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      notificationContent: {
                        ...prev.notificationContent,
                        templates: {
                          ...prev.notificationContent.templates,
                          sms: { message: e.target.value }
                        }
                      }
                    }))}
                    rows={2}
                    className="w-full p-2 border rounded-lg"
                    placeholder="תזכורת: פגישה עם {clientName} ב-{appointmentTime}"
                  />
                </div>
              </div>
            )}
          </div>

          {/* שמירה */}
          <div className="flex justify-end">
            <button
              onClick={saveConfig}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              שמור הגדרות
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
