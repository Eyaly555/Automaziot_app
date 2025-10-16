import { Meeting, ROIScenario, SelectOption } from '../types';
import { CustomValuesService } from '../services/customValuesService';

export interface ROIMetrics {
  hoursSavedMonthly: number;
  moneySavedMonthly: number;
  lostLeadsValue: number;
  paybackPeriod: number;
  totalMonthlySavings: number;
  breakdown: { [key: string]: number };
  // Phase 4: Advanced metrics
  implementationCosts: number;
  ongoingMonthlyCosts: number;
  netSavings12Month: number;
  netSavings24Month: number;
  netSavings36Month: number;
  roi12Month: number;
  roi24Month: number;
  roi36Month: number;
  scenarios: {
    conservative: ROIScenario;
    realistic: ROIScenario;
    optimistic: ROIScenario;
  };
}

const HOURLY_RATE = 100; // Default hourly rate in ILS
const AVG_DEAL_VALUE = 5000; // Default average deal value in ILS
const IMPLEMENTATION_COST = 50000; // Default implementation cost in ILS
const DEVELOPER_HOURLY_RATE = 250; // Developer hourly rate for implementation
const MAINTENANCE_HOURS_MONTHLY = 8; // Default maintenance hours per month

/**
 * Calculate implementation costs
 * Uses the total price from selected services in Proposal module
 * Falls back to default if proposal not yet created
 */
const calculateImplementationCosts = (meeting: Meeting): number => {
  // Try to get total price from proposal (sum of selected services)
  const proposalData = meeting.modules?.proposal;
  if (proposalData && proposalData.totalPrice) {
    return proposalData.totalPrice;
  }

  // Fallback: if no proposal yet, use default estimate
  return IMPLEMENTATION_COST;
};

/**
 * Calculate ongoing monthly costs
 * Future enhancement: Could analyze meeting data to estimate costs more accurately
 */
const calculateOngoingCosts = (): number => {
  // Monthly subscriptions for tools/platforms
  const subscriptionCosts = 3000;

  // Maintenance hours
  const maintenanceCosts = MAINTENANCE_HOURS_MONTHLY * DEVELOPER_HOURLY_RATE;

  // Support costs
  const supportCosts = 1000;

  return Math.round(subscriptionCosts + maintenanceCosts + supportCosts);
};

/**
 * Calculate net savings for a given period
 */
const calculateNetSavings = (
  monthlySavings: number,
  months: number,
  implementationCosts: number,
  ongoingMonthlyCosts: number
): number => {
  const totalSavings = monthlySavings * months;
  const totalOngoingCosts = ongoingMonthlyCosts * months;
  const netSavings = totalSavings - implementationCosts - totalOngoingCosts;
  return Math.round(netSavings);
};

/**
 * Calculate payback period in months
 */
const calculatePaybackPeriodMonths = (
  implementationCosts: number,
  monthlySavings: number,
  ongoingMonthlyCosts: number
): number => {
  const netMonthlySavings = monthlySavings - ongoingMonthlyCosts;
  if (netMonthlySavings <= 0) return 0;
  return Math.ceil(implementationCosts / netMonthlySavings);
};

/**
 * Calculate ROI percentage for a given period
 */
const calculateROIPercentage = (
  netSavings: number,
  implementationCosts: number
): number => {
  if (implementationCosts === 0) return 0;
  return Math.round((netSavings / implementationCosts) * 100);
};

/**
 * Calculate a complete ROI scenario
 */
const calculateScenario = (
  name: string,
  nameHebrew: string,
  multiplier: number,
  baseMonthlySavings: number,
  implementationCosts: number,
  ongoingMonthlyCosts: number
): ROIScenario => {
  const monthlySavings = Math.round(baseMonthlySavings * multiplier);
  const netSavings12 = calculateNetSavings(
    monthlySavings,
    12,
    implementationCosts,
    ongoingMonthlyCosts
  );
  const netSavings24 = calculateNetSavings(
    monthlySavings,
    24,
    implementationCosts,
    ongoingMonthlyCosts
  );
  const netSavings36 = calculateNetSavings(
    monthlySavings,
    36,
    implementationCosts,
    ongoingMonthlyCosts
  );

  return {
    name,
    nameHebrew,
    multiplier,
    monthlySavings,
    implementationCosts,
    ongoingMonthlyCosts,
    netSavings12Month: netSavings12,
    netSavings24Month: netSavings24,
    netSavings36Month: netSavings36,
    paybackPeriod: calculatePaybackPeriodMonths(
      implementationCosts,
      monthlySavings,
      ongoingMonthlyCosts
    ),
    roi12Month: calculateROIPercentage(netSavings12, implementationCosts),
    roi24Month: calculateROIPercentage(netSavings24, implementationCosts),
    roi36Month: calculateROIPercentage(netSavings36, implementationCosts),
  };
};

export const calculateROI = (meeting: Meeting): ROIMetrics => {
  let hoursSavedMonthly = 0;
  let moneySavedMonthly = 0;
  let lostLeadsValue = 0;
  let customValueImpact = 0;

  // Return default values if meeting or modules are not initialized
  if (!meeting || !meeting.modules) {
    const defaultScenario: ROIScenario = {
      name: '',
      nameHebrew: '',
      multiplier: 0,
      monthlySavings: 0,
      implementationCosts: 0,
      ongoingMonthlyCosts: 0,
      netSavings12Month: 0,
      netSavings24Month: 0,
      netSavings36Month: 0,
      paybackPeriod: 0,
      roi12Month: 0,
      roi24Month: 0,
      roi36Month: 0,
    };

    return {
      hoursSavedMonthly: 0,
      moneySavedMonthly: 0,
      lostLeadsValue: 0,
      paybackPeriod: 0,
      totalMonthlySavings: 0,
      breakdown: {},
      implementationCosts: 0,
      ongoingMonthlyCosts: 0,
      netSavings12Month: 0,
      netSavings24Month: 0,
      netSavings36Month: 0,
      roi12Month: 0,
      roi24Month: 0,
      roi36Month: 0,
      scenarios: {
        conservative: defaultScenario,
        realistic: defaultScenario,
        optimistic: defaultScenario,
      },
    };
  }

  const { modules, customFieldValues } = meeting;

  // Calculate from Leads and Sales module
  if (modules?.leadsAndSales) {
    const { speedToLead, followUp, appointments, leadSources } =
      modules.leadsAndSales;

    // Lost leads from slow response
    if (speedToLead?.unansweredPercentage) {
      const totalLeads =
        leadSources?.reduce(
          (sum, source) => sum + (source.volumePerMonth || 0),
          0
        ) || 0;
      const lostLeads = totalLeads * (speedToLead.unansweredPercentage / 100);
      lostLeadsValue = lostLeads * AVG_DEAL_VALUE * 0.1; // Assuming 10% conversion rate
    }

    // Time saved on follow-ups
    if (followUp?.attempts && followUp?.dropOffRate) {
      const followUpTime = (followUp.attempts || 0) * 5; // 5 minutes per follow-up
      hoursSavedMonthly += (followUpTime * 20) / 60; // Assuming 20 leads per month
    }

    // Time saved on appointments
    if (appointments?.avgSchedulingTime) {
      hoursSavedMonthly += (appointments.avgSchedulingTime * 30) / 60; // 30 appointments per month
    }
  }

  // Calculate from Customer Service module
  if (modules?.customerService) {
    const { autoResponse, channels, proactiveCommunication } =
      modules.customerService;

    // FAQ automation potential
    if (
      autoResponse?.topQuestions &&
      Array.isArray(autoResponse.topQuestions)
    ) {
      const totalFAQVolume = autoResponse.topQuestions.reduce(
        (sum, faq) => sum + (faq.frequencyPerDay || 0),
        0
      );
      hoursSavedMonthly += (totalFAQVolume * 20 * 3) / 60; // 3 minutes per FAQ, 20 working days
    }

    // Service channel optimization
    if (channels && Array.isArray(channels)) {
      const totalVolume = channels.reduce(
        (sum, channel) => sum + (channel.volumePerDay || 0),
        0
      );
      if (totalVolume > 50) {
        hoursSavedMonthly += (totalVolume * 0.5 * 20) / 60; // 30 seconds saved per interaction
      }
    }

    // Proactive communication time savings
    if (proactiveCommunication?.timeSpentWeekly) {
      hoursSavedMonthly += proactiveCommunication.timeSpentWeekly * 4 * 0.5; // 50% time saving
    }
  }

  // Calculate from Operations module
  if (modules?.operations) {
    const { documentManagement, projectManagement } = modules.operations;

    // DEPRECATED: systemSync.manualWork removed in OperationsModule v2
    // Old code: hoursSavedMonthly += systemSync.manualWork * 20
    // Note: workProcesses.automationReadiness could be used as a multiplier in future

    // Document processing time - updated to use new structure
    if (documentManagement?.flows && Array.isArray(documentManagement.flows)) {
      const docTime = documentManagement.flows.reduce(
        (sum, flow) => sum + (flow.volumePerMonth || 0) * 5, // Estimate 5 minutes per flow
        0
      );
      hoursSavedMonthly += (docTime / 60) * 0.7; // 70% time saving
    }

    // Project management inefficiencies - updated to use issues instead of bottlenecks
    if (projectManagement?.issues && projectManagement.issues.length > 0) {
      hoursSavedMonthly += projectManagement.issues.length * 10; // 10 hours per issue
    }
  }

  // Calculate from Reporting module
  if (modules.reporting) {
    const { scheduledReports } = modules.reporting;

    if (scheduledReports && Array.isArray(scheduledReports)) {
      const reportTime = scheduledReports.reduce((sum, report) => {
        const freq =
          report.frequency === 'daily'
            ? 20
            : report.frequency === 'weekly'
              ? 4
              : report.frequency === 'monthly'
                ? 1
                : 0;
        return sum + (report.timeToCreate || 0) * freq;
      }, 0);
      hoursSavedMonthly += (reportTime / 60) * 0.8; // 80% time saving with automation
    }
  }

  // Process custom values from all modules
  if (customFieldValues) {
    // Process custom systems
    // Note: customFieldValues.systems is an object { [fieldName: string]: SelectOption[] }
    const systemsValues = customFieldValues.systems
      ? Object.values(customFieldValues.systems).flat()
      : [];
    if (systemsValues.length > 0) {
      const systemImpact = CustomValuesService.processCustomForROI(
        systemsValues,
        'systems'
      );
      customValueImpact += systemImpact;

      // Estimate automation potential for custom systems
      systemsValues.forEach((system: SelectOption) => {
        CustomValuesService.estimateAutomationPotential(system.label, 'system');
      });
    }

    // Process custom lead sources
    const leadSourcesValues = customFieldValues.leadSources
      ? Object.values(customFieldValues.leadSources).flat()
      : [];
    if (leadSourcesValues.length > 0) {
      const leadSourceImpact = CustomValuesService.processCustomForROI(
        leadSourcesValues,
        'leadSources'
      );
      customValueImpact += leadSourceImpact;
    }

    // Process custom service channels
    const serviceChannelsValues = customFieldValues.serviceChannels
      ? Object.values(customFieldValues.serviceChannels).flat()
      : [];
    if (serviceChannelsValues.length > 0) {
      const channelImpact = CustomValuesService.processCustomForROI(
        serviceChannelsValues,
        'serviceChannels'
      );
      customValueImpact += channelImpact;

      // Additional hours saved from automating custom channels
      hoursSavedMonthly += serviceChannelsValues.length * 5; // 5 hours per custom channel
    }

    // Process custom processes from operations
    const processesValues = customFieldValues.processes
      ? Object.values(customFieldValues.processes).flat()
      : [];
    if (processesValues.length > 0) {
      const processImpact = CustomValuesService.processCustomForROI(
        processesValues,
        'processes'
      );
      customValueImpact += processImpact;

      // Each custom process identified is an automation opportunity
      hoursSavedMonthly += processesValues.length * 8; // 8 hours per custom process
    }

    // Process custom document types
    const documentTypesValues = customFieldValues.documentTypes
      ? Object.values(customFieldValues.documentTypes).flat()
      : [];
    if (documentTypesValues.length > 0) {
      const docImpact = CustomValuesService.processCustomForROI(
        documentTypesValues,
        'documents'
      );
      customValueImpact += docImpact;
    }

    // Process custom report types
    const reportTypesValues = customFieldValues.reportTypes
      ? Object.values(customFieldValues.reportTypes).flat()
      : [];
    if (reportTypesValues.length > 0) {
      const reportImpact = CustomValuesService.processCustomForROI(
        reportTypesValues,
        'reports'
      );
      customValueImpact += reportImpact;
      hoursSavedMonthly += reportTypesValues.length * 3; // 3 hours per custom report type
    }

    // Process custom AI use cases
    const aiUseCasesValues = customFieldValues.aiUseCases
      ? Object.values(customFieldValues.aiUseCases).flat()
      : [];
    if (aiUseCasesValues.length > 0) {
      const aiImpact = CustomValuesService.processCustomForROI(
        aiUseCasesValues,
        'ai'
      );
      customValueImpact += aiImpact;

      // AI use cases have high automation potential
      aiUseCasesValues.forEach((useCase: SelectOption) => {
        CustomValuesService.estimateAutomationPotential(useCase.label, 'ai');
      });
    }
  }

  // Calculate money saved including custom value impact
  moneySavedMonthly =
    hoursSavedMonthly * HOURLY_RATE + lostLeadsValue + customValueImpact;

  const totalMonthlySavings = moneySavedMonthly;
  const breakdown: { [key: string]: number } = {
    'חיסכון בזמן עבודה': Math.round(hoursSavedMonthly * HOURLY_RATE),
    'מניעת אובדן לידים': Math.round(lostLeadsValue),
    'אוטומציה של תהליכים': Math.round(moneySavedMonthly * 0.3),
    'שיפור יעילות': Math.round(moneySavedMonthly * 0.2),
  };

  // Add custom value impact to breakdown if present
  if (customValueImpact > 0) {
    breakdown['תהליכים מותאמים אישית'] = Math.round(customValueImpact);
  }

  // Phase 4: Calculate advanced metrics
  const implementationCosts = calculateImplementationCosts(meeting);
  const ongoingMonthlyCosts = calculateOngoingCosts();

  // Calculate net savings for different periods
  const netSavings12 = calculateNetSavings(
    moneySavedMonthly,
    12,
    implementationCosts,
    ongoingMonthlyCosts
  );
  const netSavings24 = calculateNetSavings(
    moneySavedMonthly,
    24,
    implementationCosts,
    ongoingMonthlyCosts
  );
  const netSavings36 = calculateNetSavings(
    moneySavedMonthly,
    36,
    implementationCosts,
    ongoingMonthlyCosts
  );

  // Calculate ROI percentages
  const roi12 = calculateROIPercentage(netSavings12, implementationCosts);
  const roi24 = calculateROIPercentage(netSavings24, implementationCosts);
  const roi36 = calculateROIPercentage(netSavings36, implementationCosts);

  // Calculate enhanced payback period with ongoing costs
  const enhancedPaybackPeriod = calculatePaybackPeriodMonths(
    implementationCosts,
    moneySavedMonthly,
    ongoingMonthlyCosts
  );

  // Generate three scenarios
  const scenarios = {
    conservative: calculateScenario(
      'Conservative',
      'שמרני',
      0.7, // 70% of estimated savings
      moneySavedMonthly,
      implementationCosts,
      ongoingMonthlyCosts
    ),
    realistic: calculateScenario(
      'Realistic',
      'ריאליסטי',
      1.0, // 100% of estimated savings
      moneySavedMonthly,
      implementationCosts,
      ongoingMonthlyCosts
    ),
    optimistic: calculateScenario(
      'Optimistic',
      'אופטימי',
      1.3, // 130% of estimated savings
      moneySavedMonthly,
      implementationCosts,
      ongoingMonthlyCosts
    ),
  };

  return {
    // Existing metrics
    hoursSavedMonthly: Math.round(hoursSavedMonthly),
    moneySavedMonthly: Math.round(moneySavedMonthly),
    lostLeadsValue: Math.round(lostLeadsValue),
    paybackPeriod: enhancedPaybackPeriod, // Now includes ongoing costs
    totalMonthlySavings: Math.round(totalMonthlySavings),
    breakdown,
    // Phase 4: New advanced metrics
    implementationCosts,
    ongoingMonthlyCosts,
    netSavings12Month: netSavings12,
    netSavings24Month: netSavings24,
    netSavings36Month: netSavings36,
    roi12Month: roi12,
    roi24Month: roi24,
    roi36Month: roi36,
    scenarios,
  };
};

export const calculatePainPointValue = (
  severity: string,
  hoursSaved?: number,
  potentialSaving?: number,
  isCustom?: boolean
): number => {
  const severityMultiplier =
    {
      low: 1,
      medium: 1.5,
      high: 2,
      critical: 3,
    }[severity] || 1;

  const baseValue = (hoursSaved || 0) * HOURLY_RATE + (potentialSaving || 0);

  // Custom values often require more effort but have higher impact
  const customMultiplier = isCustom ? 1.2 : 1;

  return Math.round(baseValue * severityMultiplier * customMultiplier);
};
