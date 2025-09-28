import { Meeting } from '../types';

export interface ROIMetrics {
  hoursSavedMonthly: number;
  moneySavedMonthly: number;
  lostLeadsValue: number;
  automationPotential: number;
  paybackPeriod: number;
  totalMonthlySavings: number;
  breakdown: { [key: string]: number };
}

const HOURLY_RATE = 100; // Default hourly rate in ILS
const AVG_DEAL_VALUE = 5000; // Default average deal value in ILS
const IMPLEMENTATION_COST = 50000; // Default implementation cost in ILS

export const calculateROI = (meeting: Meeting): ROIMetrics => {
  let hoursSavedMonthly = 0;
  let moneySavedMonthly = 0;
  let lostLeadsValue = 0;
  let automationPotential = 0;

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

  const { modules } = meeting;

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
    if (autoResponse?.topQuestions) {
      const totalFAQVolume = autoResponse.topQuestions.reduce(
        (sum, faq) => sum + (faq.frequencyPerDay || 0),
        0
      );
      hoursSavedMonthly += (totalFAQVolume * 20 * 3) / 60; // 3 minutes per FAQ, 20 working days
      automationPotential += totalFAQVolume > 10 ? 30 : totalFAQVolume * 3;
    }

    // Service channel optimization
    if (channels) {
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
    if (documentManagement?.documentTypes) {
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

    if (scheduledReports) {
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

  // Calculate money saved
  moneySavedMonthly = hoursSavedMonthly * HOURLY_RATE + lostLeadsValue;

  // Calculate payback period
  const paybackPeriod = moneySavedMonthly > 0
    ? Math.ceil(IMPLEMENTATION_COST / moneySavedMonthly)
    : 0;

  const totalMonthlySavings = moneySavedMonthly;
  const breakdown = {
    'חיסכון בזמן עבודה': Math.round(hoursSavedMonthly * HOURLY_RATE),
    'מניעת אובדן לידים': Math.round(lostLeadsValue),
    'אוטומציה של תהליכים': Math.round(moneySavedMonthly * 0.3),
    'שיפור יעילות': Math.round(moneySavedMonthly * 0.2)
  };

  return {
    hoursSavedMonthly: Math.round(hoursSavedMonthly),
    moneySavedMonthly: Math.round(moneySavedMonthly),
    lostLeadsValue: Math.round(lostLeadsValue),
    automationPotential: Math.min(100, Math.round(automationPotential)),
    paybackPeriod,
    totalMonthlySavings: Math.round(totalMonthlySavings),
    breakdown
  };
};

export const calculatePainPointValue = (
  severity: string,
  hoursSaved?: number,
  potentialSaving?: number
): number => {
  const severityMultiplier = {
    'low': 1,
    'medium': 1.5,
    'high': 2,
    'critical': 3
  }[severity] || 1;

  const baseValue = (hoursSaved || 0) * HOURLY_RATE + (potentialSaving || 0);
  return Math.round(baseValue * severityMultiplier);
};