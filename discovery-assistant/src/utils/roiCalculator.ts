import { Meeting, ROIScenario } from '../types';
import { CustomValuesService } from '../services/customValuesService';

export interface ROIMetrics {
  hoursSavedMonthly: number;
  moneySavedMonthly: number;
  lostLeadsValue: number;
  automationPotential: number;
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
 * Calculate implementation costs based on project complexity
 */
const calculateImplementationCosts = (meeting: Meeting): number => {
  const baseCost = IMPLEMENTATION_COST;

  // Adjust based on number of modules with data
  const activeModules = Object.keys(meeting.modules || {}).filter(key => {
    const module = meeting.modules[key as keyof typeof meeting.modules];
    return module && Object.keys(module).length > 0;
  }).length;

  // More active modules = more complex implementation
  const complexityMultiplier = 1 + (activeModules * 0.1);

  // Add developer time costs (estimated 200 hours for base implementation)
  const developerHours = 200 * complexityMultiplier;
  const developerCosts = developerHours * DEVELOPER_HOURLY_RATE;

  // Tools and licenses (estimated)
  const toolsCosts = 10000;

  // Training costs
  const trainingCosts = 5000;

  return Math.round(baseCost + developerCosts + toolsCosts + trainingCosts);
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
  const netSavings12 = calculateNetSavings(monthlySavings, 12, implementationCosts, ongoingMonthlyCosts);
  const netSavings24 = calculateNetSavings(monthlySavings, 24, implementationCosts, ongoingMonthlyCosts);
  const netSavings36 = calculateNetSavings(monthlySavings, 36, implementationCosts, ongoingMonthlyCosts);

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
    paybackPeriod: calculatePaybackPeriodMonths(implementationCosts, monthlySavings, ongoingMonthlyCosts),
    roi12Month: calculateROIPercentage(netSavings12, implementationCosts),
    roi24Month: calculateROIPercentage(netSavings24, implementationCosts),
    roi36Month: calculateROIPercentage(netSavings36, implementationCosts)
  };
};

export const calculateROI = (meeting: Meeting): ROIMetrics => {
  let hoursSavedMonthly = 0;
  let moneySavedMonthly = 0;
  let lostLeadsValue = 0;
  let automationPotential = 0;
  let customValueImpact = 0;

  // Return default values if meeting or modules are not initialized
  if (!meeting || !meeting.modules) {
    return {
      hoursSavedMonthly: 0,
      moneySavedMonthly: 0,
      lostLeadsValue: 0,
      automationPotential: 0,
      paybackPeriod: 0,
      totalMonthlySavings: 0,
      breakdown: {}
    };
  }

  const { modules, customFieldValues } = meeting;

  // Calculate from Leads and Sales module
  if (modules?.leadsAndSales) {
    const { speedToLead, followUp, appointments, leadSources } = modules.leadsAndSales;

    // Lost leads from slow response
    if (speedToLead?.unansweredPercentage) {
      const totalLeads = leadSources?.reduce((sum, source) => sum + (source.volumePerMonth || 0), 0) || 0;
      const lostLeads = totalLeads * (speedToLead.unansweredPercentage / 100);
      lostLeadsValue = lostLeads * AVG_DEAL_VALUE * 0.1; // Assuming 10% conversion rate
    }

    // Time saved on follow-ups
    if (followUp?.attempts && followUp?.dropOffRate) {
      const followUpTime = (followUp.attempts || 0) * 5; // 5 minutes per follow-up
      hoursSavedMonthly += followUpTime * 20 / 60; // Assuming 20 leads per month
    }

    // Time saved on appointments
    if (appointments?.avgSchedulingTime) {
      hoursSavedMonthly += (appointments.avgSchedulingTime * 30) / 60; // 30 appointments per month
    }
  }

  // Calculate from Customer Service module
  if (modules?.customerService) {
    const { autoResponse, channels, proactiveCommunication } = modules.customerService;

    // FAQ automation potential
    if (autoResponse?.topQuestions && Array.isArray(autoResponse.topQuestions)) {
      const totalFAQVolume = autoResponse.topQuestions.reduce(
        (sum, faq) => sum + (faq.frequencyPerDay || 0),
        0
      );
      hoursSavedMonthly += (totalFAQVolume * 20 * 3) / 60; // 3 minutes per FAQ, 20 working days
      automationPotential += totalFAQVolume > 10 ? 30 : totalFAQVolume * 3;
    }

    // Service channel optimization
    if (channels && Array.isArray(channels)) {
      const totalVolume = channels.reduce((sum, channel) => sum + (channel.volumePerDay || 0), 0);
      if (totalVolume > 50) {
        hoursSavedMonthly += totalVolume * 0.5 * 20 / 60; // 30 seconds saved per interaction
      }
    }

    // Proactive communication time savings
    if (proactiveCommunication?.timeSpentWeekly) {
      hoursSavedMonthly += proactiveCommunication.timeSpentWeekly * 4 * 0.5; // 50% time saving
    }
  }

  // Calculate from Operations module
  if (modules?.operations) {
    const { systemSync, documentManagement, projectManagement } = modules.operations;

    // System sync manual work
    if (systemSync?.manualWork) {
      hoursSavedMonthly += systemSync.manualWork * 20; // Daily manual work * 20 working days
    }

    // Document processing time
    if (documentManagement?.documentTypes && Array.isArray(documentManagement.documentTypes)) {
      const docTime = documentManagement.documentTypes.reduce(
        (sum, doc) => sum + ((doc.volumePerMonth || 0) * (doc.timePerDocument || 0)),
        0
      );
      hoursSavedMonthly += docTime / 60 * 0.7; // 70% time saving
    }

    // Project management inefficiencies
    if (projectManagement?.bottlenecks && projectManagement.bottlenecks.length > 0) {
      hoursSavedMonthly += projectManagement.bottlenecks.length * 10; // 10 hours per bottleneck
    }
  }

  // Calculate from Reporting module
  if (modules.reporting) {
    const { scheduledReports } = modules.reporting;

    if (scheduledReports && Array.isArray(scheduledReports)) {
      const reportTime = scheduledReports.reduce(
        (sum, report) => {
          const freq = report.frequency === 'daily' ? 20 :
                      report.frequency === 'weekly' ? 4 :
                      report.frequency === 'monthly' ? 1 : 0;
          return sum + ((report.timeToCreate || 0) * freq);
        },
        0
      );
      hoursSavedMonthly += reportTime / 60 * 0.8; // 80% time saving with automation
    }
  }

  // Process custom values from all modules
  if (customFieldValues) {
    // Process custom systems
    if (customFieldValues.systems?.length > 0) {
      const systemImpact = CustomValuesService.processCustomForROI(
        customFieldValues.systems,
        'systems'
      );
      customValueImpact += systemImpact;

      // Estimate automation potential for custom systems
      customFieldValues.systems.forEach(system => {
        const potential = CustomValuesService.estimateAutomationPotential(
          system.label,
          'system'
        );
        automationPotential += potential / customFieldValues.systems.length;
      });
    }

    // Process custom lead sources
    if (customFieldValues.leadSources?.length > 0) {
      const leadSourceImpact = CustomValuesService.processCustomForROI(
        customFieldValues.leadSources,
        'leadSources'
      );
      customValueImpact += leadSourceImpact;
    }

    // Process custom service channels
    if (customFieldValues.serviceChannels?.length > 0) {
      const channelImpact = CustomValuesService.processCustomForROI(
        customFieldValues.serviceChannels,
        'serviceChannels'
      );
      customValueImpact += channelImpact;

      // Additional hours saved from automating custom channels
      hoursSavedMonthly += customFieldValues.serviceChannels.length * 5; // 5 hours per custom channel
    }

    // Process custom processes from operations
    if (customFieldValues.processes?.length > 0) {
      const processImpact = CustomValuesService.processCustomForROI(
        customFieldValues.processes,
        'processes'
      );
      customValueImpact += processImpact;

      // Each custom process identified is an automation opportunity
      hoursSavedMonthly += customFieldValues.processes.length * 8; // 8 hours per custom process
    }

    // Process custom document types
    if (customFieldValues.documentTypes?.length > 0) {
      const docImpact = CustomValuesService.processCustomForROI(
        customFieldValues.documentTypes,
        'documents'
      );
      customValueImpact += docImpact;
    }

    // Process custom report types
    if (customFieldValues.reportTypes?.length > 0) {
      const reportImpact = CustomValuesService.processCustomForROI(
        customFieldValues.reportTypes,
        'reports'
      );
      customValueImpact += reportImpact;
      hoursSavedMonthly += customFieldValues.reportTypes.length * 3; // 3 hours per custom report type
    }

    // Process custom AI use cases
    if (customFieldValues.aiUseCases?.length > 0) {
      const aiImpact = CustomValuesService.processCustomForROI(
        customFieldValues.aiUseCases,
        'ai'
      );
      customValueImpact += aiImpact;

      // AI use cases have high automation potential
      customFieldValues.aiUseCases.forEach(useCase => {
        const potential = CustomValuesService.estimateAutomationPotential(
          useCase.label,
          'ai'
        );
        automationPotential += potential / customFieldValues.aiUseCases.length;
      });
    }
  }

  // Calculate money saved including custom value impact
  moneySavedMonthly = hoursSavedMonthly * HOURLY_RATE + lostLeadsValue + customValueImpact;

  const totalMonthlySavings = moneySavedMonthly;
  const breakdown: { [key: string]: number } = {
    'חיסכון בזמן עבודה': Math.round(hoursSavedMonthly * HOURLY_RATE),
    'מניעת אובדן לידים': Math.round(lostLeadsValue),
    'אוטומציה של תהליכים': Math.round(moneySavedMonthly * 0.3),
    'שיפור יעילות': Math.round(moneySavedMonthly * 0.2)
  };

  // Add custom value impact to breakdown if present
  if (customValueImpact > 0) {
    breakdown['תהליכים מותאמים אישית'] = Math.round(customValueImpact);
  }

  // Phase 4: Calculate advanced metrics
  const implementationCosts = calculateImplementationCosts(meeting);
  const ongoingMonthlyCosts = calculateOngoingCosts();

  // Calculate net savings for different periods
  const netSavings12 = calculateNetSavings(moneySavedMonthly, 12, implementationCosts, ongoingMonthlyCosts);
  const netSavings24 = calculateNetSavings(moneySavedMonthly, 24, implementationCosts, ongoingMonthlyCosts);
  const netSavings36 = calculateNetSavings(moneySavedMonthly, 36, implementationCosts, ongoingMonthlyCosts);

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
    )
  };

  return {
    // Existing metrics
    hoursSavedMonthly: Math.round(hoursSavedMonthly),
    moneySavedMonthly: Math.round(moneySavedMonthly),
    lostLeadsValue: Math.round(lostLeadsValue),
    automationPotential: Math.min(100, Math.round(automationPotential)),
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
    scenarios
  };
};

export const calculatePainPointValue = (
  severity: string,
  hoursSaved?: number,
  potentialSaving?: number,
  isCustom?: boolean
): number => {
  const severityMultiplier = {
    'low': 1,
    'medium': 1.5,
    'high': 2,
    'critical': 3
  }[severity] || 1;

  const baseValue = (hoursSaved || 0) * HOURLY_RATE + (potentialSaving || 0);

  // Custom values often require more effort but have higher impact
  const customMultiplier = isCustom ? 1.2 : 1;

  return Math.round(baseValue * severityMultiplier * customMultiplier);
};