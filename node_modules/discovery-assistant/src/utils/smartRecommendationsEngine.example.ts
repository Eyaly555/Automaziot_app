/**
 * Example Usage of Smart Recommendations Engine
 *
 * This file demonstrates how to use the Phase 5 Smart Recommendations Engine
 * to analyze meeting data and generate actionable recommendations.
 */

import {
  SmartRecommendationsEngine,
  analyzePatterns,
  getQuickWins,
  getSmartRecommendations,
  prioritizeRecommendations,
  SmartRecommendation
} from './smartRecommendationsEngine';
import { Meeting } from '../types';

// =============================================================================
// EXAMPLE 1: Basic Usage
// =============================================================================

export function exampleBasicUsage(meeting: Meeting) {
  console.log('=== Example 1: Basic Usage ===\n');

  // Create engine instance
  const engine = new SmartRecommendationsEngine(meeting);

  // Get all recommendations
  const recommendations = engine.getRecommendations();
  console.log(`Total recommendations: ${recommendations.length}\n`);

  // Display top 3 recommendations
  const top3 = engine.getTopRecommendations(3);
  console.log('Top 3 Recommendations:');
  top3.forEach(rec => {
    console.log(`${rec.priority}. ${rec.titleHebrew}`);
    console.log(`   Category: ${rec.category}`);
    console.log(`   Impact: ${rec.impactScore}/10, Effort: ${rec.effortScore}/10`);
    console.log(`   Quick Win: ${rec.quickWin ? 'Yes' : 'No'}`);
    console.log(`   Estimated ROI: ₪${rec.estimatedROI.toLocaleString()}\n`);
  });

  // Get total estimated ROI
  const totalROI = engine.getTotalEstimatedROI();
  console.log(`Total Estimated ROI: ₪${totalROI.toLocaleString()}\n`);
}

// =============================================================================
// EXAMPLE 2: Pattern Analysis
// =============================================================================

export function examplePatternAnalysis(meeting: Meeting) {
  console.log('=== Example 2: Pattern Analysis ===\n');

  // Analyze patterns in meeting data
  const analysis = analyzePatterns(meeting);

  console.log('Detected Patterns:');
  console.log(`- Automation Opportunities: ${analysis.automationOpportunities}`);
  console.log(`- Total Potential Savings: ₪${analysis.totalPotentialSavings.toLocaleString()}\n`);

  console.log('Critical Issues:');
  analysis.criticalIssues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });

  console.log('\nQuick Wins:');
  analysis.quickWins.forEach((win, index) => {
    console.log(`${index + 1}. ${win}`);
  });

  console.log('\nDetailed Pattern Analysis:');
  analysis.detectedPatterns.forEach(pattern => {
    console.log(`\nType: ${pattern.type}`);
    console.log(`Description: ${pattern.description}`);
    console.log(`Severity: ${pattern.severity}`);
    console.log(`Estimated Impact: ₪${pattern.estimatedImpact.toLocaleString()}`);
    console.log(`Affected Modules: ${pattern.affectedModules.join(', ')}`);
  });
}

// =============================================================================
// EXAMPLE 3: Quick Wins Focus
// =============================================================================

export function exampleQuickWins(meeting: Meeting) {
  console.log('=== Example 3: Quick Wins ===\n');

  // Get only quick win recommendations
  const quickWins = getQuickWins(meeting);

  console.log(`Found ${quickWins.length} Quick Wins:\n`);

  quickWins.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec.titleHebrew}`);
    console.log(`   ${rec.description}`);
    console.log(`   Impact: ${rec.impactScore}/10, Effort: ${rec.effortScore}/10`);
    console.log(`   ROI: ₪${rec.estimatedROI.toLocaleString()}`);
    console.log(`   Affected Systems: ${rec.affectedSystems.join(', ')}`);
    console.log(`   Tools: ${rec.suggestedTools.join(', ')}`);
    console.log(`   Steps:`);
    rec.implementationSteps.forEach((step, i) => {
      console.log(`      ${i + 1}. ${step}`);
    });
    console.log('');
  });
}

// =============================================================================
// EXAMPLE 4: Category-based Filtering
// =============================================================================

export function exampleCategoryFiltering(meeting: Meeting) {
  console.log('=== Example 4: Category-based Filtering ===\n');

  const engine = new SmartRecommendationsEngine(meeting);

  const categories: Array<SmartRecommendation['category']> = [
    'integration',
    'automation',
    'ai_agent',
    'process_improvement'
  ];

  categories.forEach(category => {
    const recs = engine.getByCategory(category);
    console.log(`\n${category.toUpperCase()} (${recs.length} recommendations):`);

    recs.forEach(rec => {
      console.log(`  - ${rec.titleHebrew} (Priority: ${rec.priority})`);
      console.log(`    ROI: ₪${rec.estimatedROI.toLocaleString()}, Quick Win: ${rec.quickWin ? 'Yes' : 'No'}`);
    });
  });
}

// =============================================================================
// EXAMPLE 5: n8n Workflow Templates
// =============================================================================

export function exampleWorkflowTemplates(meeting: Meeting) {
  console.log('=== Example 5: n8n Workflow Templates ===\n');

  const recommendations = getSmartRecommendations(meeting);

  const withTemplates = recommendations.filter(r => r.n8nWorkflowTemplate);

  console.log(`Found ${withTemplates.length} recommendations with n8n templates:\n`);

  withTemplates.forEach((rec, index) => {
    const template = rec.n8nWorkflowTemplate!;

    console.log(`${index + 1}. ${rec.titleHebrew}`);
    console.log(`   Workflow: ${template.name}`);
    console.log(`   Description: ${template.description}`);
    console.log(`   Setup Time: ${template.estimatedSetupTime} minutes`);
    console.log(`   Nodes: ${template.nodes.length}`);
    console.log(`   Connections: ${template.connections.length}`);

    console.log(`   Node Types:`);
    const nodeTypeSet = new Set(template.nodes.map(n => n.type));
    const nodeTypes = Array.from(nodeTypeSet);
    nodeTypes.forEach(type => {
      const count = template.nodes.filter(n => n.type === type).length;
      console.log(`      - ${type}: ${count}`);
    });

    console.log(`   Workflow Structure:`);
    template.nodes.forEach(node => {
      console.log(`      [${node.type}] ${node.name} @ (${node.position[0]}, ${node.position[1]})`);
    });

    console.log(`   Connections:`);
    template.connections.forEach(conn => {
      console.log(`      ${conn.from} -> ${conn.to}`);
    });

    console.log('');
  });
}

// =============================================================================
// EXAMPLE 6: Custom Prioritization
// =============================================================================

export function exampleCustomPrioritization() {
  console.log('=== Example 6: Custom Prioritization ===\n');

  // Create some mock recommendations
  const mockRecommendations: SmartRecommendation[] = [
    {
      id: '1',
      title: 'System Integration',
      titleHebrew: 'אינטגרציה בין מערכות',
      description: 'Connect CRM with WhatsApp',
      category: 'integration',
      impactScore: 8,
      effortScore: 3,
      quickWin: true,
      estimatedROI: 10000,
      affectedSystems: ['CRM', 'WhatsApp'],
      suggestedTools: ['n8n'],
      implementationSteps: ['Step 1', 'Step 2'],
      priority: 0
    },
    {
      id: '2',
      title: 'Process Automation',
      titleHebrew: 'אוטומציה של תהליך',
      description: 'Automate invoice generation',
      category: 'automation',
      impactScore: 9,
      effortScore: 2,
      quickWin: true,
      estimatedROI: 15000,
      affectedSystems: ['Accounting'],
      suggestedTools: ['n8n'],
      implementationSteps: ['Step 1', 'Step 2'],
      priority: 0
    },
    {
      id: '3',
      title: 'System Upgrade',
      titleHebrew: 'שדרוג מערכת',
      description: 'Upgrade legacy system',
      category: 'process_improvement',
      impactScore: 6,
      effortScore: 9,
      quickWin: false,
      estimatedROI: 5000,
      affectedSystems: ['ERP'],
      suggestedTools: [],
      implementationSteps: ['Step 1', 'Step 2'],
      priority: 0
    }
  ];

  // Prioritize using the utility function
  const prioritized = prioritizeRecommendations(mockRecommendations);

  console.log('Prioritized Recommendations:\n');
  prioritized.forEach(rec => {
    const ratio = (rec.impactScore / rec.effortScore).toFixed(2);
    console.log(`${rec.priority}. ${rec.titleHebrew}`);
    console.log(`   Impact/Effort Ratio: ${ratio}`);
    console.log(`   Quick Win: ${rec.quickWin ? 'Yes' : 'No'}`);
    console.log(`   ROI: ₪${rec.estimatedROI.toLocaleString()}\n`);
  });
}

// =============================================================================
// EXAMPLE 7: Exporting Recommendations for Reporting
// =============================================================================

export function exampleExportForReporting(meeting: Meeting) {
  console.log('=== Example 7: Export for Reporting ===\n');

  const engine = new SmartRecommendationsEngine(meeting);
  const recommendations = engine.getRecommendations();

  // Format for CSV export
  const csvData = recommendations.map(rec => ({
    Priority: rec.priority,
    Title: rec.titleHebrew,
    Category: rec.category,
    ImpactScore: rec.impactScore,
    EffortScore: rec.effortScore,
    QuickWin: rec.quickWin,
    EstimatedROI: rec.estimatedROI,
    AffectedSystems: rec.affectedSystems.join(';'),
    SuggestedTools: rec.suggestedTools.join(';')
  }));

  console.log('CSV Export Format:');
  console.log(JSON.stringify(csvData, null, 2));

  // Format for executive summary
  const summary = {
    totalRecommendations: recommendations.length,
    quickWins: recommendations.filter(r => r.quickWin).length,
    totalEstimatedROI: engine.getTotalEstimatedROI(),
    byCategory: {
      integration: recommendations.filter(r => r.category === 'integration').length,
      automation: recommendations.filter(r => r.category === 'automation').length,
      ai_agent: recommendations.filter(r => r.category === 'ai_agent').length,
      process_improvement: recommendations.filter(r => r.category === 'process_improvement').length
    },
    top5: engine.getTopRecommendations(5).map(r => ({
      priority: r.priority,
      title: r.titleHebrew,
      roi: r.estimatedROI
    }))
  };

  console.log('\nExecutive Summary:');
  console.log(JSON.stringify(summary, null, 2));
}

// =============================================================================
// EXAMPLE 8: Integration with Discovery Assistant UI
// =============================================================================

export function exampleUIIntegration(meeting: Meeting) {
  console.log('=== Example 8: UI Integration ===\n');

  const engine = new SmartRecommendationsEngine(meeting);

  // Data structure ready for React component
  const uiData = {
    // For dashboard summary card
    summary: {
      totalRecommendations: engine.getRecommendations().length,
      quickWinsCount: engine.getQuickWins().length,
      totalROI: engine.getTotalEstimatedROI()
    },

    // For quick wins section
    quickWins: engine.getQuickWins().map(rec => ({
      id: rec.id,
      title: rec.titleHebrew,
      description: rec.description,
      roi: rec.estimatedROI,
      impactScore: rec.impactScore,
      effortScore: rec.effortScore,
      badge: 'Quick Win'
    })),

    // For full recommendations list
    allRecommendations: engine.getRecommendations().map(rec => ({
      id: rec.id,
      priority: rec.priority,
      title: rec.titleHebrew,
      category: rec.category,
      quickWin: rec.quickWin,
      impactScore: rec.impactScore,
      effortScore: rec.effortScore,
      roi: rec.estimatedROI,
      affectedSystems: rec.affectedSystems,
      tools: rec.suggestedTools,
      steps: rec.implementationSteps,
      hasWorkflow: !!rec.n8nWorkflowTemplate
    })),

    // For pattern analysis visualization
    patterns: analyzePatterns(meeting)
  };

  console.log('UI Data Structure:');
  console.log(JSON.stringify(uiData, null, 2));
}

// =============================================================================
// MAIN DEMO RUNNER
// =============================================================================

export function runAllExamples(meeting: Meeting) {
  console.log('\n'.repeat(2));
  console.log('='.repeat(80));
  console.log('SMART RECOMMENDATIONS ENGINE - COMPLETE DEMO');
  console.log('='.repeat(80));
  console.log('\n'.repeat(2));

  exampleBasicUsage(meeting);
  console.log('\n' + '='.repeat(80) + '\n');

  examplePatternAnalysis(meeting);
  console.log('\n' + '='.repeat(80) + '\n');

  exampleQuickWins(meeting);
  console.log('\n' + '='.repeat(80) + '\n');

  exampleCategoryFiltering(meeting);
  console.log('\n' + '='.repeat(80) + '\n');

  exampleWorkflowTemplates(meeting);
  console.log('\n' + '='.repeat(80) + '\n');

  exampleCustomPrioritization();
  console.log('\n' + '='.repeat(80) + '\n');

  exampleExportForReporting(meeting);
  console.log('\n' + '='.repeat(80) + '\n');

  exampleUIIntegration(meeting);
  console.log('\n' + '='.repeat(80) + '\n');
}

// =============================================================================
// USAGE IN REAL APPLICATION
// =============================================================================

/*
// In a React component:
import { SmartRecommendationsEngine } from '@/utils/smartRecommendationsEngine';
import { useMeetingStore } from '@/store/useMeetingStore';

function RecommendationsPage() {
  const { currentMeeting } = useMeetingStore();
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);

  useEffect(() => {
    if (currentMeeting) {
      const engine = new SmartRecommendationsEngine(currentMeeting);
      setRecommendations(engine.getRecommendations());
    }
  }, [currentMeeting]);

  return (
    <div>
      <h1>Smart Recommendations</h1>
      {recommendations.map(rec => (
        <RecommendationCard key={rec.id} recommendation={rec} />
      ))}
    </div>
  );
}

// In an export/report function:
export function generateRecommendationsReport(meeting: Meeting): string {
  const engine = new SmartRecommendationsEngine(meeting);
  const quickWins = engine.getQuickWins();
  const analysis = engine.getPatternAnalysis();

  return `
    Recommendations Report
    =====================

    Quick Wins: ${quickWins.length}
    Total Potential ROI: ₪${engine.getTotalEstimatedROI().toLocaleString()}

    Critical Issues:
    ${analysis.criticalIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

    Top 5 Recommendations:
    ${engine.getTopRecommendations(5).map(r => `${r.priority}. ${r.titleHebrew}`).join('\n')}
  `;
}
*/