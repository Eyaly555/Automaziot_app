import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AutoWelcomeEmailRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';
import { Plus, Trash2, Save } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function AutoWelcomeEmailSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<AutoWelcomeEmailRequirements>({
    triggerEvents: {
      newLead: true,
      newCustomer: true,
      appointmentBooked: false,
      serviceCompleted: false
    },
    emailSettings: {
      provider: 'gmail',
      fromName: '{companyName}',
      fromEmail: 'welcome@{companyDomain}.com',
      replyTo: 'support@{companyDomain}.com'
    },
    contentTemplates: {
      newLead: {
        subject: 'ברוכים הבאים! {clientName} - בואו נכיר',
        body: `שלום {clientName},

תודה שהתעניינת בשירותינו!

אנחנו שמחים שהגעת אלינו ורוצים להכיר אותך טוב יותר.

בימים הקרובים ניצור איתך קשר כדי:
• להבין את הצרכים שלך
• להציע פתרונות מותאמים
• לענות על כל השאלות שלך

בינתיים, אתה מוזמן לבקר באתר שלנו או לעיין בחומרים ששלחנו.

בברכה,
{companyName}
{senderName}
{contactPhone}
{contactEmail}`
      },
      newCustomer: {
        subject: 'ברוכים הבאים ל{companyName}! התחלנו לעבוד יחד',
        body: `שלום {clientName},

שמחים להודיע שהתחלנו לעבוד יחד!

מה השלבים הבאים:
1. נקבע פגישת היכרות מפורטת
2. נאסוף את כל הפרטים הנדרשים
3. נתחיל בתהליך היישום

צוות {companyName} עומד לרשותך לכל שאלה.

בברכה,
צוות {companyName}`
      },
      appointmentBooked: {
        subject: 'אישור פגישה - {appointmentDate}',
        body: `שלום {clientName},

פגישתנו נקבעה ל-{appointmentDate} בשעה {appointmentTime}.

פרטי הפגישה:
📍 מיקום: {appointmentLocation}
⏱️ משך זמן: {appointmentDuration}
👤 עם: {appointmentWith}

נשמח לראות אותך!

בברכה,
{companyName}`
      }
    },
    personalization: {
      fields: ['clientName', 'companyName', 'senderName', 'companyDomain', 'contactPhone', 'contactEmail'],
      dynamicContent: true
    },
    scheduling: {
      sendImmediately: true,
      delayHours: 0,
      businessHoursOnly: true,
      skipWeekends: true
    },
    tracking: {
      openTracking: true,
      clickTracking: true,
      unsubscribeLink: true
    }
  });

  useEffect(() => {
    if (currentMeeting?.implementationSpec?.automations) {
      const existing = currentMeeting.implementationSpec.automations.find(
        (a: any) => a.serviceId === 'auto-welcome-email'
      );
      if (existing) {
        setConfig(existing.requirements);
      }
    }
  }, [currentMeeting]);

  const saveConfig = () => {
    if (!currentMeeting) return;

    const updatedAutomations = [...(currentMeeting.implementationSpec?.automations || [])];
    const existingIndex = updatedAutomations.findIndex((a: any) => a.serviceId === 'auto-welcome-email');

    const automationData = {
      serviceId: 'auto-welcome-email',
      serviceName: 'אימיילי קבלת פנים אוטומטיים',
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
      <Card title="אימיילי קבלת פנים אוטומטיים" subtitle="הגדר אימיילים אוטומטיים לשלבים שונים במחזור חיי הלקוח">
        <div className="space-y-6">
          {/* אירועי טריגר */}
          <div>
            <h4 className="font-medium mb-3">אירועי טריגר לשליחה</h4>
            <div className="space-y-2">
              {Object.entries(config.triggerEvents).map(([event, enabled]) => (
                <label key={event} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      triggerEvents: { ...prev.triggerEvents, [event]: e.target.checked }
                    }))}
                  />
                  <span>
                    {event === 'newLead' && 'ליד חדש'}
                    {event === 'newCustomer' && 'לקוח חדש'}
                    {event === 'appointmentBooked' && 'פגישה נקבעה'}
                    {event === 'serviceCompleted' && 'שירות הושלם'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* הגדרות אימייל */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">ספק אימייל</label>
              <select
                value={config.emailSettings.provider}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  emailSettings: { ...prev.emailSettings, provider: e.target.value as any }
                }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="gmail">Gmail</option>
                <option value="outlook">Outlook</option>
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">שם השולח</label>
              <input
                type="text"
                value={config.emailSettings.fromName}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  emailSettings: { ...prev.emailSettings, fromName: e.target.value }
                }))}
                className="w-full p-2 border rounded-lg"
                placeholder="{companyName}"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">כתובת אימייל לשליחה</label>
              <input
                type="email"
                value={config.emailSettings.fromEmail}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  emailSettings: { ...prev.emailSettings, fromEmail: e.target.value }
                }))}
                className="w-full p-2 border rounded-lg"
                placeholder="welcome@{companyDomain}.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">כתובת מענה</label>
              <input
                type="email"
                value={config.emailSettings.replyTo}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  emailSettings: { ...prev.emailSettings, replyTo: e.target.value }
                }))}
                className="w-full p-2 border rounded-lg"
                placeholder="support@{companyDomain}.com"
              />
            </div>
          </div>

          {/* תבניות תוכן */}
          <div>
            <h4 className="font-medium mb-3">תבניות תוכן</h4>

            {config.triggerEvents.newLead && (
              <div className="mb-6 p-4 border rounded-lg">
                <h5 className="font-medium mb-3">ליד חדש</h5>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">נושא</label>
                    <input
                      type="text"
                      value={config.contentTemplates.newLead.subject}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        contentTemplates: {
                          ...prev.contentTemplates,
                          newLead: { ...prev.contentTemplates.newLead, subject: e.target.value }
                        }
                      }))}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">תוכן</label>
                    <textarea
                      value={config.contentTemplates.newLead.body}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        contentTemplates: {
                          ...prev.contentTemplates,
                          newLead: { ...prev.contentTemplates.newLead, body: e.target.value }
                        }
                      }))}
                      rows={8}
                      className="w-full p-2 border rounded-lg font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {config.triggerEvents.newCustomer && (
              <div className="mb-6 p-4 border rounded-lg">
                <h5 className="font-medium mb-3">לקוח חדש</h5>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">נושא</label>
                    <input
                      type="text"
                      value={config.contentTemplates.newCustomer.subject}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        contentTemplates: {
                          ...prev.contentTemplates,
                          newCustomer: { ...prev.contentTemplates.newCustomer, subject: e.target.value }
                        }
                      }))}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">תוכן</label>
                    <textarea
                      value={config.contentTemplates.newCustomer.body}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        contentTemplates: {
                          ...prev.contentTemplates,
                          newCustomer: { ...prev.contentTemplates.newCustomer, body: e.target.value }
                        }
                      }))}
                      rows={6}
                      className="w-full p-2 border rounded-lg font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {config.triggerEvents.appointmentBooked && (
              <div className="mb-6 p-4 border rounded-lg">
                <h5 className="font-medium mb-3">פגישה נקבעה</h5>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">נושא</label>
                    <input
                      type="text"
                      value={config.contentTemplates.appointmentBooked.subject}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        contentTemplates: {
                          ...prev.contentTemplates,
                          appointmentBooked: { ...prev.contentTemplates.appointmentBooked, subject: e.target.value }
                        }
                      }))}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">תוכן</label>
                    <textarea
                      value={config.contentTemplates.appointmentBooked.body}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        contentTemplates: {
                          ...prev.contentTemplates,
                          appointmentBooked: { ...prev.contentTemplates.appointmentBooked, body: e.target.value }
                        }
                      }))}
                      rows={5}
                      className="w-full p-2 border rounded-lg font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* הגדרות תזמון */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.scheduling.sendImmediately}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    scheduling: { ...prev.scheduling, sendImmediately: e.target.checked }
                  }))}
                />
                <span className="text-sm">שלח מיידית</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">עיכוב בשעות (אם לא מיידי)</label>
              <input
                type="number"
                value={config.scheduling.delayHours}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  scheduling: { ...prev.scheduling, delayHours: parseInt(e.target.value) || 0 }
                }))}
                className="w-full p-2 border rounded-lg"
                min="0"
                max="72"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.scheduling.businessHoursOnly}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    scheduling: { ...prev.scheduling, businessHoursOnly: e.target.checked }
                  }))}
                />
                <span className="text-sm">שלח רק בשעות עבודה</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.scheduling.skipWeekends}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    scheduling: { ...prev.scheduling, skipWeekends: e.target.checked }
                  }))}
                />
                <span className="text-sm">דלג על סופי שבוע</span>
              </label>
            </div>
          </div>

          {/* מעקב וניתוח */}
          <div>
            <h4 className="font-medium mb-3">מעקב וניתוח</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.tracking.openTracking}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    tracking: { ...prev.tracking, openTracking: e.target.checked }
                  }))}
                />
                <span className="text-sm">מעקב פתיחת אימיילים</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.tracking.clickTracking}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    tracking: { ...prev.tracking, clickTracking: e.target.checked }
                  }))}
                />
                <span className="text-sm">מעקב לחיצות על קישורים</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.tracking.unsubscribeLink}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    tracking: { ...prev.tracking, unsubscribeLink: e.target.checked }
                  }))}
                />
                <span className="text-sm">קישור ביטול מנוי</span>
              </label>
            </div>
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
