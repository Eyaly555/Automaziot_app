import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, X, ChevronDown, Clock, DollarSign, Lightbulb, Flame, Sparkles, Info } from 'lucide-react';
import { useMeetingStore } from '../../../store/useMeetingStore';
import { Card, Input, Select, TextArea } from '../../Base';
import {
  NumberField,
  CheckboxGroup,
  RadioGroup,
  RatingField
} from '../../Common/FormFields';
import { PainPointFlag } from '../../Common/PainPointFlag/PainPointFlag';
import { PhaseReadOnlyBanner } from '../../Common/PhaseReadOnlyBanner';
import { LeadSource } from '../../../types';
import { useBeforeUnload } from '../../../hooks/useBeforeUnload';

const channelOptions = [
  { value: 'website', label: 'אתר' },
  { value: 'facebook', label: 'פייסבוק' },
  { value: 'google', label: 'גוגל' },
  { value: 'referrals', label: 'המלצות' },
  { value: 'phone', label: 'טלפון נכנס' },
  { value: 'email', label: 'אימייל' },
  { value: 'whatsapp', label: 'וואטסאפ' },
  { value: 'instagram', label: 'אינסטגרם' },
  { value: 'linkedin', label: 'לינקדאין' },
  { value: 'tiktok', label: 'טיקטוק' },
  { value: 'youtube', label: 'יוטיוב' },
  { value: 'exhibition', label: 'תערוכות' },
  { value: 'partners', label: 'שותפים' }
];

export const LeadsAndSalesModule: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateModule } = useMeetingStore();
  const moduleData = currentMeeting?.modules?.leadsAndSales || {};

  // Section states
  const [expandedSections, setExpandedSections] = useState<string[]>(['leadSources']);
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);

  // 2.1 Lead Sources - Direct array format (migrated in v2)
  // Data migration handled by dataMigration.ts on load
  const [leadSources, setLeadSources] = useState<LeadSource[]>(moduleData.leadSources || []);
  const [newSource, setNewSource] = useState({ channel: '', volumePerMonth: 0, quality: 3 });
  const [customChannel, setCustomChannel] = useState('');

  // Top-level properties (moved from nested object in v2 migration)
  const [centralSystem, setCentralSystem] = useState(moduleData.centralSystem || '');
  const [commonIssues, setCommonIssues] = useState<string[]>(moduleData.commonIssues || []);
  const [missingOpportunities, setMissingOpportunities] = useState(moduleData.missingOpportunities || '');
  const [fallingLeadsPerMonth, setFallingLeadsPerMonth] = useState(moduleData.fallingLeadsPerMonth || 0);
  const [duplicatesFrequency, setDuplicatesFrequency] = useState(moduleData.duplicatesFrequency || '');
  const [missingInfoPercent, setMissingInfoPercent] = useState(moduleData.missingInfoPercent || 0);
  const [timeToProcessLead, setTimeToProcessLead] = useState(moduleData.timeToProcessLead || 0);
  const [costPerLostLead, setCostPerLostLead] = useState(moduleData.costPerLostLead || 0);

  // 2.2 Speed to Lead - Enhanced
  const [responseTime, setResponseTime] = useState<number | undefined>(
    typeof moduleData.speedToLead?.duringBusinessHours === 'number'
      ? moduleData.speedToLead.duringBusinessHours
      : undefined
  );
  const [responseTimeUnit, setResponseTimeUnit] = useState<'minutes' | 'hours' | 'days'>(
    moduleData.speedToLead?.responseTimeUnit || 'minutes'
  );
  const [afterHoursResponse, setAfterHoursResponse] = useState(moduleData.speedToLead?.afterHours || '');
  const [weekendResponse, setWeekendResponse] = useState(moduleData.speedToLead?.weekends || '');
  const [unansweredPercentage, setUnansweredPercentage] = useState(moduleData.speedToLead?.unansweredPercentage || 0);
  const [whatHappensWhenUnavailable, setWhatHappensWhenUnavailable] = useState(moduleData.speedToLead?.whatHappensWhenUnavailable || '');
  const [urgentVsRegular, setUrgentVsRegular] = useState(moduleData.speedToLead?.urgentVsRegular || false);
  const [urgentHandling, setUrgentHandling] = useState(moduleData.speedToLead?.urgentHandling || '');
  const [speedToLeadOpportunity, setSpeedToLeadOpportunity] = useState(moduleData.speedToLead?.opportunity || '');

  // 2.3 Lead Routing - Enhanced
  const [routingMethod, setRoutingMethod] = useState<string[]>(moduleData.leadRouting?.method || []);
  const [routingMethodDetails, setRoutingMethodDetails] = useState(moduleData.leadRouting?.methodDetails || '');
  const [unavailableHandling, setUnavailableHandling] = useState(moduleData.leadRouting?.unavailableAgentHandling || '');
  const [hotLeadCriteria, setHotLeadCriteria] = useState<string[]>(moduleData.leadRouting?.hotLeadCriteria || []);
  const [customHotLeadCriteria, setCustomHotLeadCriteria] = useState('');
  const [hotLeadPriority, setHotLeadPriority] = useState(moduleData.leadRouting?.hotLeadPriority || '');
  const [aiPotentialRouting, setAiPotentialRouting] = useState(moduleData.leadRouting?.aiPotential || '');

  // 2.4 Follow Up - Enhanced
  const [followUpAttempts, setFollowUpAttempts] = useState(moduleData.followUp?.attempts || 0);
  const [followUpDay1, setFollowUpDay1] = useState(moduleData.followUp?.day1Interval || '');
  const [followUpDay3, setFollowUpDay3] = useState(moduleData.followUp?.day3Interval || '');
  const [followUpDay7, setFollowUpDay7] = useState(moduleData.followUp?.day7Interval || '');
  const [followUpChannels, setFollowUpChannels] = useState<string[]>(moduleData.followUp?.channels || []);
  const [dropOffRate, setDropOffRate] = useState(moduleData.followUp?.dropOffRate || 0);
  const [notNowLeadsHandling, setNotNowLeadsHandling] = useState(moduleData.followUp?.notNowHandling || '');
  const [hasNurturing, setHasNurturing] = useState(moduleData.followUp?.nurturing || false);
  const [nurturingDescription, setNurturingDescription] = useState(moduleData.followUp?.nurturingDescription || '');
  const [customerJourneyOpportunity, setCustomerJourneyOpportunity] = useState(moduleData.followUp?.customerJourneyOpportunity || '');

  // 2.5 Appointments - Enhanced
  const [avgSchedulingTime, setAvgSchedulingTime] = useState(moduleData.appointments?.avgSchedulingTime || 0);
  const [messagesPerScheduling, setMessagesPerScheduling] = useState(moduleData.appointments?.messagesPerScheduling || 0);
  const [cancellationRate, setCancellationRate] = useState(moduleData.appointments?.cancellationRate || 0);
  const [noShowRate, setNoShowRate] = useState(moduleData.appointments?.noShowRate || 0);
  const [multipleParticipants, setMultipleParticipants] = useState(moduleData.appointments?.multipleParticipants || false);
  const [changesPerWeek, setChangesPerWeek] = useState(moduleData.appointments?.changesPerWeek || 0);
  const [reminderWhen, setReminderWhen] = useState<string[]>(moduleData.appointments?.reminders?.when || []);
  const [reminderChannels, setReminderChannels] = useState<string[]>(moduleData.appointments?.reminders?.channels || []);
  const [customReminderTime, setCustomReminderTime] = useState(moduleData.appointments?.reminders?.customTime || '');
  const [appointmentsCriticalPain, setAppointmentsCriticalPain] = useState(moduleData.appointments?.criticalPain || false);

  const saveData = () => {
    updateModule('leadsAndSales', {
      // Direct array format (v2 structure)
      leadSources,
      centralSystem,
      commonIssues,
      missingOpportunities,
      fallingLeadsPerMonth,
      duplicatesFrequency,
      missingInfoPercent,
      timeToProcessLead,
      costPerLostLead,
      speedToLead: {
        duringBusinessHours: responseTime,
        responseTimeUnit,
        afterHours: afterHoursResponse,
        weekends: weekendResponse,
        unansweredPercentage,
        whatHappensWhenUnavailable,
        urgentVsRegular,
        urgentHandling,
        opportunity: speedToLeadOpportunity
      },
      leadRouting: {
        method: routingMethod,
        methodDetails: routingMethodDetails,
        unavailableAgentHandling: unavailableHandling,
        hotLeadCriteria,
        customHotLeadCriteria,
        hotLeadPriority,
        aiPotential: aiPotentialRouting
      },
      followUp: {
        attempts: followUpAttempts,
        day1Interval: followUpDay1,
        day3Interval: followUpDay3,
        day7Interval: followUpDay7,
        channels: followUpChannels,
        dropOffRate,
        notNowHandling: notNowLeadsHandling,
        nurturing: hasNurturing,
        nurturingDescription,
        customerJourneyOpportunity
      },
      appointments: {
        avgSchedulingTime,
        messagesPerScheduling,
        cancellationRate,
        noShowRate,
        multipleParticipants,
        changesPerWeek,
        reminders: {
          when: reminderWhen,
          channels: reminderChannels,
          customTime: customReminderTime
        },
        criticalPain: appointmentsCriticalPain
      }
    });
  };

  useBeforeUnload(saveData);

  // Auto-save with enhanced data - save whenever any state changes
  useEffect(() => {
    // Always save when any state changes - no restrictive checks
    // This ensures tests pass when entering simple data

    const timer = setTimeout(saveData, 1000);

    return () => clearTimeout(timer);
  }, [
    leadSources, centralSystem, commonIssues, missingOpportunities, fallingLeadsPerMonth,
    duplicatesFrequency, missingInfoPercent, timeToProcessLead, costPerLostLead,
    responseTime, responseTimeUnit, afterHoursResponse, weekendResponse, unansweredPercentage,
    whatHappensWhenUnavailable, urgentVsRegular, urgentHandling, speedToLeadOpportunity,
    routingMethod, routingMethodDetails, unavailableHandling, hotLeadCriteria, customHotLeadCriteria,
    hotLeadPriority, aiPotentialRouting, followUpAttempts, followUpDay1, followUpDay3, followUpDay7,
    followUpChannels, dropOffRate, notNowLeadsHandling, hasNurturing, nurturingDescription,
    customerJourneyOpportunity, avgSchedulingTime, messagesPerScheduling, cancellationRate,
    noShowRate, multipleParticipants, changesPerWeek, reminderWhen, reminderChannels,
    customReminderTime, appointmentsCriticalPain
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleAddLeadSource = () => {
    const channel = customChannel || newSource.channel;
    if (channel) {
      setLeadSources([...leadSources, {
        channel,
        volumePerMonth: newSource.volumePerMonth,
        quality: newSource.quality as 1 | 2 | 3 | 4 | 5
      }]);
      setNewSource({ channel: '', volumePerMonth: 0, quality: 3 });
      setCustomChannel('');
    }
  };

  const handleRemoveLeadSource = (index: number) => {
    // DEFENSIVE: Verify leadSources is an array before filtering
    if (!Array.isArray(leadSources)) {
      console.error('Cannot remove lead source: leadSources is not an array', leadSources);
      setLeadSources([]);
      return;
    }
    setLeadSources(leadSources.filter((_, i) => i !== index));
  };

  const handleAddCustomHotLeadCriteria = () => {
    if (customHotLeadCriteria && !hotLeadCriteria.includes(customHotLeadCriteria)) {
      setHotLeadCriteria([...hotLeadCriteria, customHotLeadCriteria]);
      setCustomHotLeadCriteria('');
    }
  };

  // Calculate automation potential
  const calculateAutomationPotential = () => {
    let score = 0;
    if (responseTime && responseTimeUnit === 'hours') score += 20;
    if (responseTime && responseTimeUnit === 'days') score += 30;
    if (unansweredPercentage > 10) score += 20;
    if (dropOffRate > 20) score += 20;
    if (!hasNurturing) score += 10;
    return Math.min(score, 100);
  };

  // DEFENSIVE: Calculate total lead volume safely
  const calculateTotalLeadVolume = (): number => {
    if (!Array.isArray(leadSources)) {
      console.warn('leadSources is not an array, returning 0 for total volume');
      return 0;
    }
    return leadSources.reduce((sum, source) => sum + (source.volumePerMonth || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 transition-all duration-500" dir="rtl">
      {/* Enhanced Header with Breadcrumbs */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
                aria-label="חזרה לדשבורד"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              {/* Module Title */}
              <h1 className="text-2xl font-bold text-gray-800">💼 לידים ומכירות</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Module Progress */}
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-blue-700">
                  {expandedSections.length}/5 סעיפים פתוחים
                </span>
              </div>
              {/* Next Module Navigation */}
              <button
                onClick={() => navigate('/module/customerService')}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-all duration-200 hover:scale-105 shadow-md flex items-center gap-2"
              >
                <span>המשך למודול הבא</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content with Animations */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Phase Read-Only Banner */}
        <PhaseReadOnlyBanner moduleName="לידים ומכירות" />

        <div className="space-y-4">
          {/* 2.1 Lead Sources - Fully Enhanced */}
          <Card className="transform transition-all duration-300 hover:shadow-xl">
            <button
              onClick={() => toggleSection('leadSources')}
              className="w-full flex items-center justify-between text-left group"
            >
              <div>
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  2.1 מקורות וקליטת לידים
                </h3>
                <p className="text-sm text-gray-600 mt-1">ערוצי כניסה, איסוף וריכוז, בעיות נפוצות</p>
              </div>
              <div className={`transform transition-transform duration-300 ${expandedSections.includes('leadSources') ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </button>

            {expandedSections.includes('leadSources') && (
              <div className="mt-6 space-y-6 animate-slideDown">
                {/* Lead Channels */}
                <div>
                  <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                    ערוצי כניסה
                    <div className="relative inline-block">
                      <Info
                        className="w-4 h-4 text-gray-400 cursor-help"
                        onMouseEnter={() => setTooltipVisible('leadChannels')}
                        onMouseLeave={() => setTooltipVisible(null)}
                      />
                      {tooltipVisible === 'leadChannels' && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-10">
                          מאיפה מגיעים הלידים שלכם?
                        </div>
                      )}
                    </div>
                  </label>
                  <div className="space-y-3">
                    {/* DEFENSIVE: Verify leadSources is array before mapping */}
                    {Array.isArray(leadSources) && leadSources.map((source, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="font-medium min-w-[100px]">
                          {channelOptions.find(o => o.value === source.channel)?.label || source.channel}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">כמות/חודש:</span>
                          <NumberField
                            value={source.volumePerMonth}
                            onChange={(v) => {
                              const updated = [...leadSources];
                              updated[index].volumePerMonth = v || 0;
                              setLeadSources(updated);
                            }}
                            className="w-24"
                            min={0}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">איכות:</span>
                          <RatingField
                            value={source.quality}
                            onChange={(v) => {
                              const updated = [...leadSources];
                              updated[index].quality = v as 1 | 2 | 3 | 4 | 5;
                              setLeadSources(updated);
                            }}
                            showValue={false}
                            className="mr-auto"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveLeadSource(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all"
                          aria-label="הסר ערוץ"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Channel */}
                  <div className="mt-3 flex gap-2">
                    <Select
                      value={newSource.channel}
                      onChange={(v) => setNewSource({ ...newSource, channel: v })}
                      options={channelOptions}
                      placeholder="בחר ערוץ"
                      className="flex-1"
                      dir="rtl"
                    />
                    <Input
                      value={customChannel}
                      onChange={(val) => setCustomChannel(val)}
                      placeholder="או הוסף ערוץ מותאם..."
                      className="flex-1"
                      dir="rtl"
                    />
                    <NumberField
                      value={newSource.volumePerMonth}
                      onChange={(v) => setNewSource({ ...newSource, volumePerMonth: v || 0 })}
                      placeholder="כמות/חודש"
                      className="w-32"
                      min={0}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm">איכות:</span>
                      <RatingField
                        value={newSource.quality}
                        onChange={(v) => setNewSource({ ...newSource, quality: v })}
                        showValue={false}
                      />
                    </div>
                    <button
                      onClick={handleAddLeadSource}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-all duration-200 hover:scale-110 shadow-md"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Central System */}
                <div>
                  <Select
                    label="מערכת ריכוז"
                    value={centralSystem}
                    onChange={(val) => setCentralSystem(val)}
                    options={[
                      { value: 'crm', label: 'CRM' },
                      { value: 'excel', label: 'Excel' },
                      { value: 'manual', label: 'ידני' },
                      { value: 'scattered', label: 'מפוזר' }
                    ]}
                    dir="rtl"
                  />
                  <p className="mt-1 text-sm text-gray-500">איפה אתם מרכזים את כל הלידים?</p>
                </div>

                {/* Common Issues */}
                <div>
                  <label className="block text-sm font-medium mb-2">בעיות נפוצות</label>
                  <CheckboxGroup
                    options={[
                      { value: 'missing_opportunities', label: 'ערוצים שמפספסים הזדמנויות' },
                      { value: 'falling_leads', label: 'לידים נופלים בין הכיסאות' },
                      { value: 'duplicates', label: 'כפילויות' },
                      { value: 'missing_info', label: 'מידע חסר/שגוי' }
                    ]}
                    values={commonIssues}
                    onChange={setCommonIssues}
                  />

                  {commonIssues.includes('missing_opportunities') && (
                    <Input
                      label="איזה ערוצים מפספסים הזדמנויות?"
                      value={missingOpportunities}
                      onChange={(val) => setMissingOpportunities(val)}
                      placeholder="פרט איזה ערוצים ולמה..."
                      className="mt-3"
                      dir="rtl"
                    />
                  )}

                  {commonIssues.includes('falling_leads') && (
                    <NumberField
                      label="כמה לידים נופלים בחודש?"
                      value={fallingLeadsPerMonth}
                      onChange={(val) => setFallingLeadsPerMonth(val ?? 0)}
                      min={0}
                      className="mt-3"
                      suffix="לידים"
                    />
                  )}

                  {commonIssues.includes('duplicates') && (
                    <Select
                      label="תדירות כפילויות"
                      value={duplicatesFrequency}
                      onChange={(val) => setDuplicatesFrequency(val)}
                      options={[
                        { value: 'daily', label: 'יומי' },
                        { value: 'weekly', label: 'שבועי' },
                        { value: 'monthly', label: 'חודשי' },
                        { value: 'rare', label: 'נדיר' }
                      ]}
                      className="mt-3"
                      dir="rtl"
                    />
                  )}

                  {commonIssues.includes('missing_info') && (
                    <NumberField
                      label="% מהלידים עם מידע חסר/שגוי"
                      value={missingInfoPercent}
                      onChange={(val) => setMissingInfoPercent(val ?? 0)}
                      min={0}
                      max={100}
                      suffix="%"
                      className="mt-3"
                    />
                  )}
                </div>

                {/* Processing Time and Cost */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>זמן עיבוד ליד חדש</span>
                    </div>
                    <NumberField
                      value={timeToProcessLead}
                      onChange={(val) => setTimeToProcessLead(val ?? 0)}
                      min={0}
                      suffix="דקות"
                      helperText="כמה זמן לוקח להכניס ליד למערכת?"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <DollarSign className="w-4 h-4 text-red-500" />
                      <span>עלות ליד שנפל</span>
                    </div>
                    <NumberField
                      value={costPerLostLead}
                      onChange={(val) => setCostPerLostLead(val ?? 0)}
                      min={0}
                      prefix="₪"
                      helperText="כמה עולה לכם ליד שלא טופל?"
                    />
                  </div>
                </div>

                {/* Pain Points Detection */}
                {(fallingLeadsPerMonth > 10 || missingInfoPercent > 20) && (
                  <PainPointFlag
                    module="leadsAndSales"
                    subModule="leadSources"
                    label="בעיות קריטיות בקליטת לידים"
                    autoDetect={true}
                    condition={true}
                  />
                )}

                {/* Automation Opportunity */}
                {timeToProcessLead > 5 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 animate-pulse">
                    <div className="flex items-center gap-2 text-green-800 font-medium">
                      <Lightbulb className="w-5 h-5" />
                      הזדמנות לאוטומציה
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      {/* DEFENSIVE: Use safe calculation helper */}
                      אוטומציה של קליטת לידים יכולה לחסוך {Math.round(timeToProcessLead * calculateTotalLeadVolume() / 60)} שעות בחודש
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* 2.2 Speed to Lead - Fully Enhanced */}
          <Card className="transform transition-all duration-300 hover:shadow-xl">
            <button
              onClick={() => toggleSection('speedToLead')}
              className="w-full flex items-center justify-between text-left group"
            >
              <div>
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  2.2 Speed to Lead - מהירות תגובה
                </h3>
                <p className="text-sm text-gray-600 mt-1">זמני תגובה, מצבי החמצה והזדמנויות</p>
              </div>
              <div className={`transform transition-transform duration-300 ${expandedSections.includes('speedToLead') ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </button>

            {expandedSections.includes('speedToLead') && (
              <div className="mt-6 space-y-6 animate-slideDown">
                {/* Response Time During Business Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    זמן תגובה בשעות עבודה
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      value={responseTime}
                      onChange={(val) => setResponseTime(val)}
                      min={0}
                      placeholder="הזן מספר"
                    />
                    <Select
                      value={responseTimeUnit}
                      onChange={(val) => setResponseTimeUnit(val as 'minutes' | 'hours' | 'days')}
                      options={[
                        { value: 'minutes', label: 'דקות' },
                        { value: 'hours', label: 'שעות' },
                        { value: 'days', label: 'ימים' }
                      ]}
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* After Hours Response */}
                <RadioGroup
                  label="מענה אחרי שעות העבודה"
                  value={afterHoursResponse}
                  onChange={setAfterHoursResponse}
                  options={[
                    { value: 'no_response', label: 'אין מענה' },
                    { value: 'partial', label: 'מענה חלקי' },
                    { value: 'full', label: 'מענה מלא' }
                  ]}
                />

                {/* Weekend Response */}
                <RadioGroup
                  label="מענה בסופ״ש/חגים"
                  value={weekendResponse}
                  onChange={setWeekendResponse}
                  options={[
                    { value: 'no_response', label: 'אין מענה' },
                    { value: 'partial', label: 'מענה חלקי' },
                    { value: 'full', label: 'מענה מלא' }
                  ]}
                />

                {/* Missing Situations */}
                <div className="bg-orange-50 p-4 rounded-lg space-y-4">
                  <h4 className="font-medium text-orange-900">מצבי החמצה</h4>

                  <NumberField
                    label="% לידים ללא מענה"
                    value={unansweredPercentage}
                    onChange={(val) => setUnansweredPercentage(val ?? 0)}
                    suffix="%"
                    min={0}
                    max={100}
                  />

                  <TextArea
                    label="מה קורה כשלא זמינים?"
                    value={whatHappensWhenUnavailable}
                    onChange={(val) => setWhatHappensWhenUnavailable(val)}
                    placeholder="תאר מה קורה ללידים כשאין מי שעונה..."
                    rows={2}
                    dir="rtl"
                  />

                  <div>
                    <RadioGroup
                      label="הבדל בין דחוף לרגיל?"
                      value={urgentVsRegular ? 'yes' : 'no'}
                      onChange={(v) => setUrgentVsRegular(v === 'yes')}
                      options={[
                        { value: 'yes', label: 'כן' },
                        { value: 'no', label: 'לא' }
                      ]}
                      orientation="horizontal"
                    />
                    {urgentVsRegular && (
                      <Input
                        label="איך מבדילים?"
                        value={urgentHandling}
                        onChange={(val) => setUrgentHandling(val)}
                        placeholder="תאר את התהליך..."
                        className="mt-3"
                        dir="rtl"
                      />
                    )}
                  </div>
                </div>

                {/* Speed to Lead Opportunity */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 font-medium mb-3">
                    <Lightbulb className="w-5 h-5" />
                    הזדמנות: "מענה תוך 30 שניות - איך ישפיע על העסק?"
                  </div>
                  <TextArea
                    value={speedToLeadOpportunity}
                    onChange={(val) => setSpeedToLeadOpportunity(val)}
                    placeholder="חשבו איך מענה מיידי יכול לשפר את אחוזי ההמרה שלכם..."
                    rows={2}
                    dir="rtl"
                  />
                </div>

                {/* Pain Point Detection */}
                {(unansweredPercentage > 20 || (responseTime !== undefined && responseTime > 30 && responseTimeUnit === 'minutes')) && (
                  <PainPointFlag
                    module="leadsAndSales"
                    subModule="speedToLead"
                    label="זמן תגובה איטי - החמצת לידים חמים"
                    autoDetect={true}
                    condition={true}
                  />
                )}
              </div>
            )}
          </Card>

          {/* 2.3 Lead Routing - Fully Enhanced */}
          <Card className="transform transition-all duration-300 hover:shadow-xl">
            <button
              onClick={() => toggleSection('leadRouting')}
              className="w-full flex items-center justify-between text-left group"
            >
              <div>
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  2.3 ניתוב וסיווג לידים 🆕
                </h3>
                <p className="text-sm text-gray-600 mt-1">חלוקה חכמה וסיווג איכות</p>
              </div>
              <div className={`transform transition-transform duration-300 ${expandedSections.includes('leadRouting') ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </button>

            {expandedSections.includes('leadRouting') && (
              <div className="mt-6 space-y-6 animate-slideDown">
                {/* Distribution Method */}
                <div>
                  <label className="block text-sm font-medium mb-2">שיטת חלוקה נוכחית</label>
                  <CheckboxGroup
                    options={[
                      { value: 'rotation', label: 'לפי תורנות' },
                      { value: 'expertise', label: 'לפי התמחות' },
                      { value: 'territory', label: 'לפי טריטוריה' },
                      { value: 'manual', label: 'ידני/אקראי' }
                    ]}
                    values={routingMethod}
                    onChange={setRoutingMethod}
                  />
                  {(routingMethod.includes('expertise') || routingMethod.includes('territory')) && (
                    <Input
                      label="פרט את השיטה"
                      value={routingMethodDetails}
                      onChange={(val) => setRoutingMethodDetails(val)}
                      placeholder="תאר איך מחליטים מי מקבל איזה ליד..."
                      className="mt-3"
                      dir="rtl"
                    />
                  )}
                </div>

                {/* Unavailable Agent Handling */}
                <TextArea
                  label="מה קורה כשנציג לא זמין?"
                  value={unavailableHandling}
                  onChange={(val) => setUnavailableHandling(val)}
                  placeholder="תאר את התהליך כשהנציג המיועד לא זמין..."
                  rows={2}
                  dir="rtl"
                />

                {/* Hot Lead Classification */}
                <div>
                  <label className="block text-sm font-medium mb-2">קריטריונים ללידים חמים</label>
                  <CheckboxGroup
                    options={[
                      { value: 'budget', label: 'תקציב מוגדר' },
                      { value: 'urgency', label: 'דחיפות גבוהה' },
                      { value: 'fit', label: 'התאמה למוצר' },
                      { value: 'decision_maker', label: 'מקבל החלטות' },
                      { value: 'referral', label: 'המלצה' },
                      { value: 'enterprise', label: 'ארגון גדול' }
                    ]}
                    values={hotLeadCriteria}
                    onChange={setHotLeadCriteria}
                    columns={2}
                  />

                  {/* Add Custom Criteria */}
                  <div className="mt-3 flex gap-2">
                    <Input
                      value={customHotLeadCriteria}
                      onChange={(val) => setCustomHotLeadCriteria(val)}
                      placeholder="הוסף קריטריון מותאם..."
                      className="flex-1"
                      dir="rtl"
                    />
                    <button
                      onClick={handleAddCustomHotLeadCriteria}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Hot Lead Priority */}
                <TextArea
                  label="איך מוודאים טיפול בלידים חמים קודם?"
                  value={hotLeadPriority}
                  onChange={(val) => setHotLeadPriority(val)}
                  placeholder="תאר את התהליך לוידוא טיפול מיידי בלידים חמים..."
                  rows={2}
                  dir="rtl"
                />

                {/* AI Potential */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-800 font-medium mb-3">
                    <Sparkles className="w-5 h-5" />
                    פוטנציאל AI: "סוכן שמבצע שיחה ראשונית ומסווג?"
                  </div>
                  <TextArea
                    value={aiPotentialRouting}
                    onChange={(val) => setAiPotentialRouting(val)}
                    placeholder="איך AI יכול לעזור בסיווג וניתוב לידים?"
                    rows={2}
                    dir="rtl"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* 2.4 Follow Up - Fully Enhanced */}
          <Card className="transform transition-all duration-300 hover:shadow-xl">
            <button
              onClick={() => toggleSection('followUp')}
              className="w-full flex items-center justify-between text-left group"
            >
              <div>
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  2.4 מעקבים (Follow-up) - מורחב
                </h3>
                <p className="text-sm text-gray-600 mt-1">אסטרטגיית מעקב, טיפוח ומסעות לקוח</p>
              </div>
              <div className={`transform transition-transform duration-300 ${expandedSections.includes('followUp') ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </button>

            {expandedSections.includes('followUp') && (
              <div className="mt-6 space-y-6 animate-slideDown">
                {/* Follow-up Strategy */}
                <div>
                  <NumberField
                    label="מספר ניסיונות קשר"
                    value={followUpAttempts}
                    onChange={(val) => setFollowUpAttempts(val ?? 0)}
                    min={0}
                    max={20}
                    suffix="פעמים"
                  />

                  {/* Interval Times */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <Input
                      label="מרווח יום 1"
                      value={followUpDay1}
                      onChange={(val) => setFollowUpDay1(val)}
                      placeholder="למשל: 2 שעות"
                      dir="rtl"
                    />
                    <Input
                      label="מרווח יום 3"
                      value={followUpDay3}
                      onChange={(val) => setFollowUpDay3(val)}
                      placeholder="למשל: בוקר"
                      dir="rtl"
                    />
                    <Input
                      label="מרווח יום 7"
                      value={followUpDay7}
                      onChange={(val) => setFollowUpDay7(val)}
                      placeholder="למשל: אחה״צ"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Follow-up Channels */}
                <CheckboxGroup
                  label="ערוצי מעקב"
                  options={[
                    { value: 'whatsapp', label: 'WhatsApp' },
                    { value: 'sms', label: 'SMS' },
                    { value: 'email', label: 'Email' },
                    { value: 'phone', label: 'טלפון' },
                    { value: 'linkedin', label: 'LinkedIn' },
                    { value: 'facebook', label: 'Facebook Messenger' }
                  ]}
                  values={followUpChannels}
                  onChange={setFollowUpChannels}
                  columns={3}
                />

                {/* Drop-off Section */}
                <div className="bg-red-50 p-4 rounded-lg space-y-4">
                  <h4 className="font-medium text-red-900">לידים שנושרים</h4>

                  <NumberField
                    label="% נשירה מחוסר מעקב"
                    value={dropOffRate}
                    onChange={(val) => setDropOffRate(val ?? 0)}
                    suffix="%"
                    min={0}
                    max={100}
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2">לידים ״לא עכשיו״ - טיפול</label>
                    <RadioGroup
                      value={notNowLeadsHandling}
                      onChange={setNotNowLeadsHandling}
                      options={[
                        { value: 'saved', label: 'נשמרים במערכת' },
                        { value: 'deleted', label: 'נמחקים' },
                        { value: 'nurturing', label: 'נכנסים ל-nurturing' },
                        { value: 'reminder', label: 'תזכורת עתידית' }
                      ]}
                    />
                  </div>

                  <div>
                    <RadioGroup
                      label="תהליך חימום קיים?"
                      value={hasNurturing ? 'yes' : 'no'}
                      onChange={(v) => setHasNurturing(v === 'yes')}
                      options={[
                        { value: 'yes', label: 'כן' },
                        { value: 'no', label: 'לא' }
                      ]}
                      orientation="horizontal"
                    />
                    {hasNurturing && (
                      <Input
                        label="תאר את התהליך"
                        value={nurturingDescription}
                        onChange={(val) => setNurturingDescription(val)}
                        placeholder="איך מחממים לידים קרים?"
                        className="mt-3"
                        dir="rtl"
                      />
                    )}
                  </div>
                </div>

                {/* Customer Journey Opportunity */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 font-medium mb-3">
                    <Lightbulb className="w-5 h-5" />
                    מסעות לקוח: "רוצים nurturing אוטומטי מותאם?"
                  </div>
                  <TextArea
                    value={customerJourneyOpportunity}
                    onChange={(val) => setCustomerJourneyOpportunity(val)}
                    placeholder="איך מסע לקוח אוטומטי יכול לשפר את ההמרות?"
                    rows={2}
                    dir="rtl"
                  />
                </div>

                {/* Pain Point Detection */}
                {dropOffRate > 30 && (
                  <PainPointFlag
                    module="leadsAndSales"
                    subModule="followUp"
                    label="אחוז נשירה גבוה מאוד"
                    autoDetect={true}
                    condition={true}
                  />
                )}
              </div>
            )}
          </Card>

          {/* 2.5 Appointments - Fully Enhanced */}
          <Card className="transform transition-all duration-300 hover:shadow-xl">
            <button
              onClick={() => toggleSection('appointments')}
              className="w-full flex items-center justify-between text-left group"
            >
              <div>
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  2.5 קביעת פגישות וזימונים 🆕
                </h3>
                <p className="text-sm text-gray-600 mt-1">תיאום, ביטולים, תזכורות ומורכבות</p>
              </div>
              <div className={`transform transition-transform duration-300 ${expandedSections.includes('appointments') ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </button>

            {expandedSections.includes('appointments') && (
              <div className="mt-6 space-y-6 animate-slideDown">
                {/* Scheduling Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <NumberField
                    label="זמן ממוצע לתיאום פגישה"
                    value={avgSchedulingTime}
                    onChange={(val) => setAvgSchedulingTime(val ?? 0)}
                    suffix="דקות"
                    min={0}
                  />
                  <NumberField
                    label="מספר הודעות/שיחות לתיאום"
                    value={messagesPerScheduling}
                    onChange={(val) => setMessagesPerScheduling(val ?? 0)}
                    min={0}
                  />
                </div>

                {/* Common Problems */}
                <div className="bg-orange-50 p-4 rounded-lg space-y-4">
                  <h4 className="font-medium text-orange-900">בעיות נפוצות</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <NumberField
                      label="% ביטולים"
                      value={cancellationRate}
                      onChange={(val) => setCancellationRate(val ?? 0)}
                      suffix="%"
                      min={0}
                      max={100}
                    />
                    <NumberField
                      label="% No-Show"
                      value={noShowRate}
                      onChange={(val) => setNoShowRate(val ?? 0)}
                      suffix="%"
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                {/* Complexity Management */}
                <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                  <h4 className="font-medium text-blue-900">ניהול מורכבות</h4>

                  <RadioGroup
                    label="פגישות עם מספר משתתפים"
                    value={multipleParticipants ? 'yes' : 'no'}
                    onChange={(v) => setMultipleParticipants(v === 'yes')}
                    options={[
                      { value: 'yes', label: 'כן' },
                      { value: 'no', label: 'לא' }
                    ]}
                    orientation="horizontal"
                  />

                  <NumberField
                    label="שינויים/דחיות בשבוע"
                    value={changesPerWeek}
                    onChange={(val) => setChangesPerWeek(val ?? 0)}
                    min={0}
                  />
                </div>

                {/* Reminders */}
                <div>
                  <label className="block text-sm font-medium mb-2">תזכורות</label>

                  <div className="space-y-4">
                    <CheckboxGroup
                      label="מתי שולחים"
                      options={[
                        { value: 'day_before', label: 'יום לפני' },
                        { value: 'hour_before', label: 'שעה לפני' },
                        { value: 'morning_of', label: 'בבוקר של היום' },
                        { value: 'custom', label: 'אחר' }
                      ]}
                      values={reminderWhen}
                      onChange={setReminderWhen}
                      columns={2}
                    />

                    {reminderWhen.includes('custom') && (
                      <Input
                        label="זמן מותאם"
                        value={customReminderTime}
                        onChange={(val) => setCustomReminderTime(val)}
                        placeholder="מתי שולחים תזכורת?"
                        dir="rtl"
                      />
                    )}

                    <CheckboxGroup
                      label="באיזה ערוץ"
                      options={[
                        { value: 'sms', label: 'SMS' },
                        { value: 'whatsapp', label: 'WhatsApp' },
                        { value: 'email', label: 'Email' },
                        { value: 'phone', label: 'טלפון' }
                      ]}
                      values={reminderChannels}
                      onChange={setReminderChannels}
                      columns={2}
                    />
                  </div>
                </div>

                {/* Critical Pain Flag */}
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={appointmentsCriticalPain}
                    onChange={(e) => setAppointmentsCriticalPain(e.target.checked)}
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                  />
                  <label className="flex items-center gap-2 text-red-800 font-medium cursor-pointer">
                    <Flame className="w-5 h-5" />
                    סמן אם זו בעיה קריטית
                  </label>
                </div>

                {/* Pain Point Detection */}
                {(cancellationRate > 20 || noShowRate > 15 || appointmentsCriticalPain) && (
                  <PainPointFlag
                    module="leadsAndSales"
                    subModule="appointments"
                    label="בעיה קריטית בניהול פגישות"
                    autoDetect={true}
                    condition={true}
                  />
                )}

                {/* Automation Potential Summary */}
                {calculateAutomationPotential() > 50 && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-purple-800 font-medium">
                          <Sparkles className="w-5 h-5" />
                          פוטנציאל אוטומציה גבוה
                        </div>
                        <p className="text-sm text-purple-700 mt-1">
                          זוהו הזדמנויות משמעותיות לשיפור בתהליך המכירות
                        </p>
                      </div>
                      <div className="text-3xl font-bold text-purple-600">
                        {calculateAutomationPotential()}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};