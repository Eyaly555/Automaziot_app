/**
 * integrationFlowSuggester.ts
 *
 * Analyzes Phase 1 integration needs and suggests Phase 2 integration flows.
 * Maps SystemIntegrationNeed from Phase 1 to IntegrationFlow for Phase 2.
 */

import { Meeting } from '../types';
import {
  IntegrationFlow,
  FlowTrigger,
  ErrorHandlingStrategy,
  TestCase
} from '../types/phase2';

const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Suggests integration flows based on Phase 1 integration needs
 */
export const suggestIntegrationFlows = (meeting: Meeting): IntegrationFlow[] => {
  const systems = meeting.modules?.systems?.detailedSystems || [];
  const flows: IntegrationFlow[] = [];

  // For each system with integration needs
  systems.forEach(sourceSystem => {
    if (!sourceSystem.integrationNeeds || sourceSystem.integrationNeeds.length === 0) {
      return;
    }

    sourceSystem.integrationNeeds.forEach(need => {
      // Find target system
      const targetSystem = systems.find(s => s.id === need.targetSystemId);

      if (!targetSystem) {
        console.warn(`Target system not found for integration need: ${need.targetSystemId}`);
        return;
      }

      // Create integration flow
      const flow: IntegrationFlow = {
        id: generateId(),
        name: `${sourceSystem.specificSystem} ↔ ${targetSystem.specificSystem}`,
        description: need.specificNeeds || `סנכרון נתונים בין ${sourceSystem.specificSystem} ל-${targetSystem.specificSystem}`,
        sourceSystem: sourceSystem.id,
        targetSystem: targetSystem.id,

        // Map frequency to trigger
        trigger: mapFrequencyToTrigger(need.frequency, need.integrationType),
        frequency: mapFrequencyToPhase2Frequency(need.frequency),

        // Map data flow direction
        direction: mapDataFlowToDirection(need.dataFlow),

        // Default steps (empty, to be filled in Phase 2)
        steps: [],

        // Map priority
        priority: mapCriticalityToPriority(need.criticalityLevel),

        // Estimate setup time based on integration type
        estimatedSetupTime: estimateSetupTime(need.integrationType, need.frequency),

        // Default error handling
        errorHandling: getDefaultErrorHandling(need.criticalityLevel),

        // Generate basic test cases
        testCases: generateBasicTestCases(sourceSystem.specificSystem, targetSystem.specificSystem, need)
      };

      flows.push(flow);
    });
  });

  return flows;
};

/**
 * Map Phase 1 frequency to Phase 2 trigger configuration
 */
const mapFrequencyToTrigger = (
  frequency: string,
  integrationType: string
): FlowTrigger => {
  switch (frequency) {
    case 'realtime':
      // Realtime = webhook or watch field
      if (integrationType === 'api' || integrationType === 'native') {
        return {
          type: 'webhook',
          configuration: {
            method: 'POST',
            authentication: 'bearer_token'
          }
        };
      }
      return {
        type: 'watch_field',
        configuration: {
          pollInterval: 60 // 1 minute
        }
      };

    case 'hourly':
    case 'daily':
    case 'weekly':
      return {
        type: 'schedule',
        configuration: {
          schedule: getScheduleExpression(frequency)
        }
      };

    case 'manual':
    default:
      return {
        type: 'manual',
        configuration: {}
      };
  }
};

/**
 * Get cron schedule expression for frequency
 */
const getScheduleExpression = (frequency: string): string => {
  switch (frequency) {
    case 'hourly':
      return '0 * * * *'; // Every hour at minute 0
    case 'daily':
      return '0 2 * * *'; // Every day at 2 AM
    case 'weekly':
      return '0 2 * * 0'; // Every Sunday at 2 AM
    default:
      return '0 * * * *';
  }
};

/**
 * Map Phase 1 frequency to Phase 2 frequency enum
 */
const mapFrequencyToPhase2Frequency = (
  frequency: string
): 'realtime' | 'every_5_min' | 'every_15_min' | 'hourly' | 'daily' | 'weekly' | 'manual' => {
  switch (frequency) {
    case 'realtime':
      return 'realtime';
    case 'hourly':
      return 'hourly';
    case 'daily':
      return 'daily';
    case 'weekly':
      return 'weekly';
    case 'manual':
      return 'manual';
    default:
      return 'hourly'; // Default
  }
};

/**
 * Map Phase 1 data flow to Phase 2 direction
 */
const mapDataFlowToDirection = (
  dataFlow: string
): 'one_way' | 'bidirectional' => {
  return dataFlow === 'bidirectional' ? 'bidirectional' : 'one_way';
};

/**
 * Map Phase 1 criticality to Phase 2 priority
 */
const mapCriticalityToPriority = (
  criticality: string
): 'critical' | 'high' | 'medium' | 'low' => {
  switch (criticality) {
    case 'critical':
      return 'critical';
    case 'important':
      return 'high';
    case 'nice-to-have':
      return 'medium';
    default:
      return 'low';
  }
};

/**
 * Estimate setup time in minutes based on integration type
 */
const estimateSetupTime = (
  integrationType: string,
  frequency: string
): number => {
  let baseTime = 60; // Base 1 hour

  // Add time based on integration type
  switch (integrationType) {
    case 'native':
      baseTime = 30; // Native integrations are faster
      break;
    case 'api':
      baseTime = 90; // API integrations take longer
      break;
    case 'zapier':
    case 'n8n':
    case 'make':
      baseTime = 45; // Integration platforms are moderate
      break;
    case 'manual':
      baseTime = 15; // Manual = just documentation
      break;
    case 'other':
      baseTime = 120; // Unknown = longer estimate
      break;
  }

  // Add time based on frequency (realtime is more complex)
  if (frequency === 'realtime') {
    baseTime += 30;
  }

  return baseTime;
};

/**
 * Get default error handling based on criticality
 */
const getDefaultErrorHandling = (criticality: string): ErrorHandlingStrategy => {
  if (criticality === 'critical') {
    return {
      retryCount: 5,
      retryDelay: 10, // 10 seconds
      fallbackAction: 'alert',
      notifyOnFailure: true,
      failureEmail: ''
      // Fix: Removed 'escalationTrigger' - not in ErrorHandlingStrategy interface
    };
  } else if (criticality === 'important') {
    return {
      retryCount: 3,
      retryDelay: 5,
      fallbackAction: 'queue',
      notifyOnFailure: true,
      failureEmail: ''
    };
  } else {
    return {
      retryCount: 2,
      retryDelay: 5,
      fallbackAction: 'log',
      notifyOnFailure: false,
      failureEmail: ''
    };
  }
};

/**
 * Generate basic test cases for the integration
 */
const generateBasicTestCases = (
  sourceSystemName: string,
  targetSystemName: string,
  need: any
): TestCase[] => {
  const testCases: TestCase[] = [];

  // Test 1: Basic data sync
  testCases.push({
    id: generateId(),
    scenario: `יצירת רשומה ב-${sourceSystemName} ובדיקת סנכרון ל-${targetSystemName}`,
    input: {
      action: 'create_record',
      system: sourceSystemName
    },
    expectedOutput: {
      action: 'record_created',
      system: targetSystemName,
      syncTime: need.frequency === 'realtime' ? '< 2 minutes' : 'according to schedule'
    },
    actualOutput: {},
    status: 'pending'
  });

  // Test 2: Error handling
  testCases.push({
    id: generateId(),
    scenario: `בדיקת טיפול בשגיאות - שדה חובה חסר`,
    input: {
      action: 'create_incomplete_record',
      system: sourceSystemName
    },
    expectedOutput: {
      action: 'error_logged',
      retry: true,
      notification: need.criticalityLevel === 'critical'
    },
    actualOutput: {},
    status: 'pending'
  });

  // Test 3: Bidirectional sync (if applicable)
  if (need.dataFlow === 'bidirectional') {
    testCases.push({
      id: generateId(),
      scenario: `עדכון רשומה ב-${targetSystemName} ובדיקת סנכרון חזרה ל-${sourceSystemName}`,
      input: {
        action: 'update_record',
        system: targetSystemName
      },
      expectedOutput: {
        action: 'record_updated',
        system: sourceSystemName,
        syncTime: need.frequency === 'realtime' ? '< 2 minutes' : 'according to schedule'
      },
      actualOutput: {},
      status: 'pending'
    });
  }

  return testCases;
};

/**
 * Get integration flow suggestions count by priority
 */
export const getIntegrationFlowStats = (flows: IntegrationFlow[]) => {
  return {
    total: flows.length,
    critical: flows.filter(f => f.priority === 'critical').length,
    high: flows.filter(f => f.priority === 'high').length,
    medium: flows.filter(f => f.priority === 'medium').length,
    low: flows.filter(f => f.priority === 'low').length,
    realtime: flows.filter(f => f.frequency === 'realtime').length,
    bidirectional: flows.filter(f => f.direction === 'bidirectional').length,
    totalEstimatedSetupTime: flows.reduce((acc, f) => acc + f.estimatedSetupTime, 0)
  };
};

/**
 * Check if integration flows have been suggested for a meeting
 */
export const hasIntegrationFlowSuggestions = (meeting: Meeting): boolean => {
  const systems = meeting.modules?.systems?.detailedSystems || [];
  const totalIntegrationNeeds = systems.reduce(
    (acc, system) => acc + (system.integrationNeeds?.length || 0),
    0
  );

  return totalIntegrationNeeds > 0;
};
