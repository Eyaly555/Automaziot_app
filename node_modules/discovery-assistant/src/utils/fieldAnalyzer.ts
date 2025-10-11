/**
 * Field Analyzer Utility
 * 
 * Analyzes which service requirement components could benefit most
 * from smart field integration.
 */

import { FIELD_REGISTRY } from '../config/fieldRegistry';
import { RegistryField } from '../types/fieldRegistry';

export interface ServiceFieldAnalysis {
  serviceId: string;
  serviceName: string;
  registryFieldsAvailable: number;
  potentialAutofillCount: number;
  estimatedTimeSavings: number; // minutes
  priority: 'critical' | 'high' | 'medium' | 'low';
  registryFields: string[];
  missingFields: string[];
}

/**
 * Analyze all services to prioritize smart field implementation
 */
export function analyzeServicesForSmartFields(): ServiceFieldAnalysis[] {
  const serviceMap = new Map<string, {
    registryFields: RegistryField[];
    autofillCount: number;
  }>();

  // Group fields by service
  Object.values(FIELD_REGISTRY).forEach(field => {
    field.usedBy.forEach(serviceId => {
      if (!serviceMap.has(serviceId)) {
        serviceMap.set(serviceId, {
          registryFields: [],
          autofillCount: 0
        });
      }

      const service = serviceMap.get(serviceId)!;
      service.registryFields.push(field);
      
      if (field.autoPopulate) {
        service.autofillCount++;
      }
    });
  });

  // Generate analysis for each service
  const analyses: ServiceFieldAnalysis[] = [];

  serviceMap.forEach((data, serviceId) => {
    const { registryFields, autofillCount } = data;
    
    // Estimate time savings (30 seconds per auto-filled field)
    const estimatedTimeSavings = autofillCount * 0.5;

    // Determine priority
    let priority: 'critical' | 'high' | 'medium' | 'low';
    if (autofillCount >= 5) {
      priority = 'critical';
    } else if (autofillCount >= 3) {
      priority = 'high';
    } else if (autofillCount >= 1) {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    analyses.push({
      serviceId,
      serviceName: getServiceName(serviceId),
      registryFieldsAvailable: registryFields.length,
      potentialAutofillCount: autofillCount,
      estimatedTimeSavings,
      priority,
      registryFields: registryFields.map(f => f.id),
      missingFields: []
    });
  });

  // Sort by priority and autofill potential
  return analyses.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.potentialAutofillCount - a.potentialAutofillCount;
  });
}

/**
 * Generate markdown report of field analysis
 */
export function generateFieldAnalysisReport(): string {
  const analyses = analyzeServicesForSmartFields();

  let report = '# Smart Field Implementation Priority Report\n\n';
  report += `Generated: ${new Date().toLocaleDateString('he-IL')}\n\n`;
  report += `Total services analyzed: ${analyses.length}\n\n`;

  // Summary stats
  const critical = analyses.filter(a => a.priority === 'critical');
  const high = analyses.filter(a => a.priority === 'high');
  const medium = analyses.filter(a => a.priority === 'medium');
  const low = analyses.filter(a => a.priority === 'low');

  report += '## Priority Breakdown\n\n';
  report += `- **Critical Priority:** ${critical.length} services (5+ auto-fill fields)\n`;
  report += `- **High Priority:** ${high.length} services (3-4 auto-fill fields)\n`;
  report += `- **Medium Priority:** ${medium.length} services (1-2 auto-fill fields)\n`;
  report += `- **Low Priority:** ${low.length} services (0 auto-fill fields)\n\n`;

  // Total time savings potential
  const totalSavings = analyses.reduce((sum, a) => sum + a.estimatedTimeSavings, 0);
  report += `## Time Savings Potential\n\n`;
  report += `**Total:** ${Math.round(totalSavings)} minutes saved across all services\n`;
  report += `**Per service average:** ${Math.round(totalSavings / analyses.length)} minutes\n\n`;

  // Critical priority services
  if (critical.length > 0) {
    report += '## Critical Priority Services (Implement First)\n\n';
    report += 'These services have 5+ fields that can be auto-filled:\n\n';
    
    critical.forEach((analysis, idx) => {
      report += `### ${idx + 1}. ${analysis.serviceName} (\`${analysis.serviceId}\`)\n\n`;
      report += `- **Auto-fill potential:** ${analysis.potentialAutofillCount} fields\n`;
      report += `- **Total registry fields:** ${analysis.registryFieldsAvailable}\n`;
      report += `- **Time savings:** ~${Math.round(analysis.estimatedTimeSavings)} minutes\n`;
      report += `- **Fields:** ${analysis.registryFields.join(', ')}\n\n`;
    });
  }

  // High priority services
  if (high.length > 0) {
    report += '## High Priority Services\n\n';
    report += 'These services have 3-4 fields that can be auto-filled:\n\n';
    
    high.forEach(analysis => {
      report += `- **${analysis.serviceName}** (\`${analysis.serviceId}\`) - ${analysis.potentialAutofillCount} auto-fill, ~${Math.round(analysis.estimatedTimeSavings)}min savings\n`;
    });
    report += '\n';
  }

  // Implementation guide
  report += '## Implementation Guide\n\n';
  report += `1. Start with Critical Priority (${critical.length} services)\n`;
  report += `2. Then High Priority (${high.length} services)\n`;
  report += `3. Finally Medium Priority (${medium.length} services)\n`;
  report += `4. Low priority can be skipped (no auto-fill benefit)\n\n`;

  // Estimated total work
  const totalServices = critical.length + high.length + medium.length;
  const estimatedHours = totalServices * 0.5; // 30 min per service
  report += `**Total work:** ~${Math.round(estimatedHours)} hours to implement remaining services\n`;
  report += `**Benefit:** ~${Math.round(totalSavings)} minutes saved for EVERY client meeting\n`;
  report += `**ROI:** Break-even after ~${Math.ceil(estimatedHours * 60 / totalSavings)} client meetings\n\n`;

  return report;
}

/**
 * Get user-friendly service name from ID
 */
function getServiceName(serviceId: string): string {
  const nameMap: Record<string, string> = {
    'auto-lead-response': 'Auto Lead Response',
    'auto-form-to-crm': 'Form to CRM Integration',
    'auto-crm-update': 'Auto CRM Update',
    'auto-data-sync': 'Data Sync',
    'auto-email-templates': 'Email Templates',
    'auto-welcome-email': 'Welcome Email',
    'auto-notifications': 'Notifications',
    'auto-sms-whatsapp': 'SMS/WhatsApp',
    'auto-appointment-reminders': 'Appointment Reminders',
    'auto-service-workflow': 'Service Workflow',
    'auto-meeting-scheduler': 'Meeting Scheduler',
    'ai-sales-agent': 'AI Sales Agent',
    'ai-service-agent': 'AI Service Agent',
    'ai-faq-bot': 'AI FAQ Bot',
    'ai-lead-qualifier': 'AI Lead Qualifier',
    'int-simple': 'Simple Integration',
    'int-complex': 'Complex Integration',
    'int-crm-marketing': 'CRM-Marketing Integration',
    'int-calendar': 'Calendar Integration',
    'impl-crm': 'CRM Implementation',
    'whatsapp-api-setup': 'WhatsApp API Setup'
  };

  return nameMap[serviceId] || serviceId;
}

/**
 * Console log the analysis report
 */
export function logFieldAnalysis() {
  const report = generateFieldAnalysisReport();
  console.log('\n' + report + '\n');
  return report;
}

/**
 * Get specific service analysis
 */
export function getServiceAnalysis(serviceId: string): ServiceFieldAnalysis | null {
  const analyses = analyzeServicesForSmartFields();
  return analyses.find(a => a.serviceId === serviceId) || null;
}

