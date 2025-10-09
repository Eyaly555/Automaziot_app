import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import type { IntCalendarRequirements, SystemConfig } from '../../../../types/integrationServices';

export function IntCalendarSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<IntCalendarRequirements>>({
    calendarProviders: {
      google: {
        enabled: false,
        config: {
          name: 'Google Calendar',
          authType: 'oauth2',
          credentials: {},
          apiVersion: 'v3',
          quotas: {
            queriesPerDay: 1000000,
            perUserQuotas: true
          },
          cloudProjectId: ''
        }
      },
      microsoft: {
        enabled: false,
        config: {
          name: 'Microsoft Calendar',
          authType: 'oauth2',
          credentials: {},
          apiVersion: 'v1.0',
          graphEndpoint: 'https://graph.microsoft.com',
          azureAppId: '',
          permissions: ['Calendar.ReadWrite']
        }
      }
    },
    crmIntegration: {
      system: '',
      module: 'events',
      config: {
        name: '',
        authType: 'oauth2',
        credentials: {}
      }
    },
    syncConfig: {
      direction: 'bi-directional',
      frequency: 'real-time',
      crmToCalendar: {
        enabled: true,
        triggerEvents: [],
        defaultCalendar: 'primary',
        conflictCheck: true
      },
      calendarToCrm: {
        enabled: true,
        updateEvents: [],
        createMeetingInCrm: true
      }
    },
    webhookConfig: {
      google: {
        enabled: false,
        pushNotifications: true,
        renewalFrequencyHours: 20,
        verificationToken: ''
      },
      microsoft: {
        enabled: false,
        subscriptions: true,
        expirationMinutes: 4230,
        renewalFrequencyDays: 3,
        validationToken: ''
      }
    },
    webhookRenewal: {
      enabled: true,
      cronSchedule: '0 */12 * * *',
      alertOnFailure: true
    },
    eventMappings: {
      summary: { crmField: '', calendarField: 'summary' },
      description: { crmField: '', calendarField: 'description' },
      startTime: { crmField: '', calendarField: 'start' },
      endTime: { crmField: '', calendarField: 'end' },
      location: { crmField: '', calendarField: 'location' },
      attendees: {
        enabled: true,
        crmField: '',
        calendarField: 'attendees',
        externalAttendeesAllowed: true
      }
    },
    timezoneConfig: {
      defaultTimezone: 'Asia/Jerusalem',
      convertUserTimezones: true,
      alwaysUseIanaFormat: true
    },
    recurringEvents: {
      enabled: true,
      useRruleFormat: true,
      syncIndividualOccurrences: false
    },
    meetingTypes: {
      crmMeetingTypes: [],
      calendarCategories: [],
      mapping: []
    },
    reminders: {
      syncEnabled: true,
      defaultReminder: {
        google: { method: 'popup', minutes: 30 },
        microsoft: { minutes: 15 }
      },
      syncCrmTasksToReminders: false
    },
    privacySettings: {
      respectPrivateEvents: true,
      defaultVisibility: 'default'
    },
    videoConferencing: {
      google: {
        autoAddGoogleMeet: false
      },
      microsoft: {
        autoAddTeams: false
      }
    },
    availabilityCheck: {
      enabled: true,
      freeBusyQuery: true,
      conflictResolution: 'prefer-calendar'
    },
    allDayEvents: {
      enabled: true,
      handleWithoutTimezone: true
    },
    attachments: {
      google: {
        enabled: false,
        syncAttachments: false
      },
      microsoft: {
        enabled: false,
        useOneDriveLinks: false
      }
    },
    errorHandling: {
      retryAttempts: 3,
      retryDelays: [1, 2, 4],
      alertChannels: ['email'],
      alertRecipients: [],
      rateLimitHandling: {
        googleDailyLimit: true,
        microsoftThrottling: true,
        exponentialBackoff: [1, 2, 4, 8]
      },
      http429Handling: true
    },
    metadata: {
      complexity: 'medium',
      estimatedHours: 30,
      prerequisites: [],
      monthlyApiCalls: 10000,
      monthlyCost: 0
    }
  });

  useEffect(() => {
    const integrationServices = currentMeeting?.implementationSpec?.integrationServices || [];
    const existing = integrationServices.find(i => i.serviceId === 'int-calendar');
    if (existing?.requirements) {
      setConfig(existing.requirements as Partial<IntCalendarRequirements>);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const integrationServices = currentMeeting?.implementationSpec?.integrationServices || [];
    const updated = integrationServices.filter(i => i.serviceId !== 'int-calendar');

    updated.push({
      serviceId: 'int-calendar',
      serviceName: 'אינטגרציית Calendar APIs',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        integrationServices: updated,
      },
    });
  };

  return (
    <div className="space-y-6 p-8" dir="rtl">
      <Card title="שירות #38: אינטגרציית Calendar APIs">
        <div className="space-y-6">

          {/* Calendar Providers */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">ספקי יומן</h3>

            {/* Google Calendar */}
            <div className="mb-4">
              <label className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  checked={config.calendarProviders?.google?.enabled || false}
                  onChange={(e) => setConfig({
                    ...config,
                    calendarProviders: {
                      ...config.calendarProviders!,
                      google: {
                        ...config.calendarProviders!.google!,
                        enabled: e.target.checked
                      }
                    }
                  })}
                  className="rounded"
                />
                <span className="font-medium">Google Calendar</span>
              </label>

              {config.calendarProviders?.google?.enabled && (
                <div className="mr-6 space-y-3 bg-gray-50 p-4 rounded">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Cloud Project ID</label>
                    <input
                      type="text"
                      value={config.calendarProviders?.google?.config?.cloudProjectId || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        calendarProviders: {
                          ...config.calendarProviders!,
                          google: {
                            ...config.calendarProviders!.google!,
                            config: {
                              ...config.calendarProviders!.google!.config!,
                              cloudProjectId: e.target.value
                            }
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Queries Per Day</label>
                      <input
                        type="number"
                        value={config.calendarProviders?.google?.config?.quotas?.queriesPerDay || 1000000}
                        onChange={(e) => setConfig({
                          ...config,
                          calendarProviders: {
                            ...config.calendarProviders!,
                            google: {
                              ...config.calendarProviders!.google!,
                              config: {
                                ...config.calendarProviders!.google!.config!,
                                quotas: {
                                  ...config.calendarProviders!.google!.config!.quotas!,
                                  queriesPerDay: parseInt(e.target.value)
                                }
                              }
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="flex items-center mt-6">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.calendarProviders?.google?.config?.quotas?.perUserQuotas || false}
                          onChange={(e) => setConfig({
                            ...config,
                            calendarProviders: {
                              ...config.calendarProviders!,
                              google: {
                                ...config.calendarProviders!.google!,
                                config: {
                                  ...config.calendarProviders!.google!.config!,
                                  quotas: {
                                    ...config.calendarProviders!.google!.config!.quotas!,
                                    perUserQuotas: e.target.checked
                                  }
                                }
                              }
                            }
                          })}
                          className="rounded"
                        />
                        <span>Per User Quotas</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Microsoft Calendar */}
            <div>
              <label className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  checked={config.calendarProviders?.microsoft?.enabled || false}
                  onChange={(e) => setConfig({
                    ...config,
                    calendarProviders: {
                      ...config.calendarProviders!,
                      microsoft: {
                        ...config.calendarProviders!.microsoft!,
                        enabled: e.target.checked
                      }
                    }
                  })}
                  className="rounded"
                />
                <span className="font-medium">Microsoft Calendar / Outlook</span>
              </label>

              {config.calendarProviders?.microsoft?.enabled && (
                <div className="mr-6 space-y-3 bg-gray-50 p-4 rounded">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Azure App ID</label>
                    <input
                      type="text"
                      value={config.calendarProviders?.microsoft?.config?.azureAppId || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        calendarProviders: {
                          ...config.calendarProviders!,
                          microsoft: {
                            ...config.calendarProviders!.microsoft!,
                            config: {
                              ...config.calendarProviders!.microsoft!.config!,
                              azureAppId: e.target.value
                            }
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Graph Endpoint</label>
                    <input
                      type="url"
                      value={config.calendarProviders?.microsoft?.config?.graphEndpoint || 'https://graph.microsoft.com'}
                      onChange={(e) => setConfig({
                        ...config,
                        calendarProviders: {
                          ...config.calendarProviders!,
                          microsoft: {
                            ...config.calendarProviders!.microsoft!,
                            config: {
                              ...config.calendarProviders!.microsoft!.config!,
                              graphEndpoint: e.target.value
                            }
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CRM Integration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">CRM Integration</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">מערכת CRM</label>
                  <input
                    type="text"
                    value={config.crmIntegration?.system || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      crmIntegration: { ...config.crmIntegration!, system: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Zoho CRM, Salesforce, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CRM Module</label>
                  <select
                    value={config.crmIntegration?.module || 'events'}
                    onChange={(e) => setConfig({
                      ...config,
                      crmIntegration: { ...config.crmIntegration!, module: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="events">Events</option>
                    <option value="meetings">Meetings</option>
                    <option value="calls">Calls</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sync Configuration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">הגדרות סנכרון</h3>
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.syncConfig?.crmToCalendar?.enabled || false}
                    onChange={(e) => setConfig({
                      ...config,
                      syncConfig: {
                        ...config.syncConfig!,
                        crmToCalendar: {
                          ...config.syncConfig!.crmToCalendar!,
                          enabled: e.target.checked
                        }
                      }
                    })}
                    className="rounded"
                  />
                  <span>CRM → Calendar</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.syncConfig?.calendarToCrm?.enabled || false}
                    onChange={(e) => setConfig({
                      ...config,
                      syncConfig: {
                        ...config.syncConfig!,
                        calendarToCrm: {
                          ...config.syncConfig!.calendarToCrm!,
                          enabled: e.target.checked
                        }
                      }
                    })}
                    className="rounded"
                  />
                  <span>Calendar → CRM</span>
                </label>
              </div>

              {config.syncConfig?.crmToCalendar?.enabled && (
                <div className="bg-blue-50 p-4 rounded space-y-3">
                  <h4 className="font-medium">CRM → Calendar</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Default Calendar</label>
                      <input
                        type="text"
                        value={config.syncConfig?.crmToCalendar?.defaultCalendar || 'primary'}
                        onChange={(e) => setConfig({
                          ...config,
                          syncConfig: {
                            ...config.syncConfig!,
                            crmToCalendar: {
                              ...config.syncConfig!.crmToCalendar!,
                              defaultCalendar: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="flex items-center mt-6">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.syncConfig?.crmToCalendar?.conflictCheck || false}
                          onChange={(e) => setConfig({
                            ...config,
                            syncConfig: {
                              ...config.syncConfig!,
                              crmToCalendar: {
                                ...config.syncConfig!.crmToCalendar!,
                                conflictCheck: e.target.checked
                              }
                            }
                          })}
                          className="rounded"
                        />
                        <span>בדיקת קונפליקטים</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {config.syncConfig?.calendarToCrm?.enabled && (
                <div className="bg-green-50 p-4 rounded">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.syncConfig?.calendarToCrm?.createMeetingInCrm || false}
                      onChange={(e) => setConfig({
                        ...config,
                        syncConfig: {
                          ...config.syncConfig!,
                          calendarToCrm: {
                            ...config.syncConfig!.calendarToCrm!,
                            createMeetingInCrm: e.target.checked
                          }
                        }
                      })}
                      className="rounded"
                    />
                    <span>צור פגישה ב-CRM</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Event Field Mapping */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">מיפוי שדות אירוע</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Summary / Title (CRM Field)</label>
                  <input
                    type="text"
                    value={config.eventMappings?.summary?.crmField || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      eventMappings: {
                        ...config.eventMappings!,
                        summary: { ...config.eventMappings!.summary!, crmField: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Subject"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Description (CRM Field)</label>
                  <input
                    type="text"
                    value={config.eventMappings?.description?.crmField || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      eventMappings: {
                        ...config.eventMappings!,
                        description: { ...config.eventMappings!.description!, crmField: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Description"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Start Time (CRM Field)</label>
                  <input
                    type="text"
                    value={config.eventMappings?.startTime?.crmField || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      eventMappings: {
                        ...config.eventMappings!,
                        startTime: { ...config.eventMappings!.startTime!, crmField: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">End Time (CRM Field)</label>
                  <input
                    type="text"
                    value={config.eventMappings?.endTime?.crmField || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      eventMappings: {
                        ...config.eventMappings!,
                        endTime: { ...config.eventMappings!.endTime!, crmField: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Location (CRM Field)</label>
                  <input
                    type="text"
                    value={config.eventMappings?.location?.crmField || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      eventMappings: {
                        ...config.eventMappings!,
                        location: { ...config.eventMappings!.location!, crmField: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.eventMappings?.attendees?.enabled || false}
                    onChange={(e) => setConfig({
                      ...config,
                      eventMappings: {
                        ...config.eventMappings!,
                        attendees: { ...config.eventMappings!.attendees!, enabled: e.target.checked }
                      }
                    })}
                    className="rounded"
                  />
                  <span>סנכרן משתתפים</span>
                </label>
              </div>
            </div>
          </div>

          {/* Timezone Configuration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Timezone Configuration</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Timezone</label>
                <select
                  value={config.timezoneConfig?.defaultTimezone || 'Asia/Jerusalem'}
                  onChange={(e) => setConfig({
                    ...config,
                    timezoneConfig: { ...config.timezoneConfig!, defaultTimezone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Asia/Jerusalem">Asia/Jerusalem (IL)</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.timezoneConfig?.convertUserTimezones || false}
                    onChange={(e) => setConfig({
                      ...config,
                      timezoneConfig: { ...config.timezoneConfig!, convertUserTimezones: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span>המר אזורי זמן של משתמשים</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.timezoneConfig?.alwaysUseIanaFormat || false}
                    onChange={(e) => setConfig({
                      ...config,
                      timezoneConfig: { ...config.timezoneConfig!, alwaysUseIanaFormat: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span>השתמש תמיד בפורמט IANA</span>
                </label>
              </div>
            </div>
          </div>

          {/* Video Conferencing */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">וידאו קונפרנס</h3>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.videoConferencing?.google?.autoAddGoogleMeet || false}
                  onChange={(e) => setConfig({
                    ...config,
                    videoConferencing: {
                      ...config.videoConferencing!,
                      google: { autoAddGoogleMeet: e.target.checked }
                    }
                  })}
                  className="rounded"
                />
                <span>הוסף אוטומטית Google Meet</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.videoConferencing?.microsoft?.autoAddTeams || false}
                  onChange={(e) => setConfig({
                    ...config,
                    videoConferencing: {
                      ...config.videoConferencing!,
                      microsoft: { autoAddTeams: e.target.checked }
                    }
                  })}
                  className="rounded"
                />
                <span>הוסף אוטומטית Microsoft Teams</span>
              </label>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">תכונות מתקדמות</h3>
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.recurringEvents?.enabled || false}
                    onChange={(e) => setConfig({
                      ...config,
                      recurringEvents: { ...config.recurringEvents!, enabled: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span>אירועים חוזרים</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.allDayEvents?.enabled || false}
                    onChange={(e) => setConfig({
                      ...config,
                      allDayEvents: { ...config.allDayEvents!, enabled: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span>אירועי יום שלם</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.reminders?.syncEnabled || false}
                    onChange={(e) => setConfig({
                      ...config,
                      reminders: { ...config.reminders!, syncEnabled: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span>סנכרן תזכורות</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">פתרון קונפליקטים</label>
                <select
                  value={config.availabilityCheck?.conflictResolution || 'prefer-calendar'}
                  onChange={(e) => setConfig({
                    ...config,
                    availabilityCheck: { ...config.availabilityCheck!, conflictResolution: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="prefer-calendar">Prefer Calendar</option>
                  <option value="prefer-crm">Prefer CRM</option>
                  <option value="manual">Manual Review</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Handling */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">טיפול בשגיאות</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">ניסיונות חוזרים</label>
                  <input
                    type="number"
                    min="0"
                    value={config.errorHandling?.retryAttempts || 3}
                    onChange={(e) => setConfig({
                      ...config,
                      errorHandling: { ...config.errorHandling!, retryAttempts: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.errorHandling?.rateLimitHandling?.googleDailyLimit || false}
                    onChange={(e) => setConfig({
                      ...config,
                      errorHandling: {
                        ...config.errorHandling!,
                        rateLimitHandling: {
                          ...config.errorHandling!.rateLimitHandling!,
                          googleDailyLimit: e.target.checked
                        }
                      }
                    })}
                    className="rounded"
                  />
                  <span>Google Daily Limit Handling</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.errorHandling?.rateLimitHandling?.microsoftThrottling || false}
                    onChange={(e) => setConfig({
                      ...config,
                      errorHandling: {
                        ...config.errorHandling!,
                        rateLimitHandling: {
                          ...config.errorHandling!.rateLimitHandling!,
                          microsoftThrottling: e.target.checked
                        }
                      }
                    })}
                    className="rounded"
                  />
                  <span>Microsoft Throttling Handling</span>
                </label>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Metadata</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שעות משוערות</label>
                <input
                  type="number"
                  min="1"
                  value={config.metadata?.estimatedHours || 30}
                  onChange={(e) => setConfig({
                    ...config,
                    metadata: { ...config.metadata!, estimatedHours: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">קריאות API חודשיות</label>
                <input
                  type="number"
                  min="0"
                  value={config.metadata?.monthlyApiCalls || 10000}
                  onChange={(e) => setConfig({
                    ...config,
                    metadata: { ...config.metadata!, monthlyApiCalls: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              שמור הגדרות
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
