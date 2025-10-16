/**
 * Tests for Smart Recommendations Engine
 */

import { describe, it, expect } from 'vitest';
import {
  SmartRecommendationsEngine,
  analyzePatterns,
  prioritizeRecommendations,
  getQuickWins,
  getSmartRecommendations,
  SmartRecommendation,
} from '../smartRecommendationsEngine';
import { Meeting } from '../../types';

describe('SmartRecommendationsEngine', () => {
  const mockMeeting: Meeting = {
    meetingId: 'test-123',
    clientName: 'Test Company',
    date: new Date(),
    modules: {
      overview: {},
      leadsAndSales: {
        leadSources: [
          { channel: 'whatsapp', volumePerMonth: 150, quality: 4 },
          { channel: 'website', volumePerMonth: 100, quality: 3 },
        ],
        speedToLead: {
          duringBusinessHours: 'manual',
          afterHours: 'no_response',
          weekends: 'no_response',
          unansweredPercentage: 35,
        },
        leadRouting: {
          method: 'manual',
        },
        followUp: {},
        appointments: {},
      },
      customerService: {
        channels: [
          { type: 'whatsapp', volumePerDay: 50 },
          { type: 'email', volumePerDay: 30 },
        ],
        autoResponse: {
          topQuestions: [
            { question: 'What are your hours?', frequencyPerDay: 25 },
            { question: 'How do I place an order?', frequencyPerDay: 30 },
            { question: 'Where is my order?', frequencyPerDay: 20 },
          ],
          commonRequests: [],
        },
        proactiveCommunication: {},
        communityManagement: { exists: false },
        reputationManagement: {},
        onboarding: {
          steps: [{ name: 'Setup', duration: '2 days' }],
        },
      },
      operations: {
        // Updated to match new OperationsModule v2 structure
        workProcesses: {
          processes: [
            {
              name: 'Data Entry',
              frequency: 'daily',
              duration: 30,
              automated: false,
            },
          ],
          commonFailures: ['Manual errors'],
          errorTrackingSystem: 'Excel',
          processDocumentation: 'None',
          automationReadiness: 7,
        },
        documentManagement: {
          flows: [
            {
              name: 'Invoice Processing',
              volumePerMonth: 80,
              automated: false,
            },
          ],
          storageLocations: ['Email', 'Google Drive'],
          searchDifficulties: 'Hard to find documents',
          versionControlMethod: 'Manual',
          approvalWorkflow: 'Email',
          documentRetention: 12,
        },
        projectManagement: {
          tools: ['Spreadsheets'],
          taskCreationSources: ['Email'],
          issues: [
            { type: 'Tracking', frequency: 'often', impact: 'high' },
            { type: 'Communication', frequency: 'sometimes', impact: 'medium' },
          ],
          resourceAllocationMethod: 'Manual',
          timelineAccuracy: 60,
          projectVisibility: 'Limited',
          deadlineMissRate: 25,
        },
        hr: {},
        logistics: {},
      },
      reporting: {
        scheduledReports: [{ name: 'Sales Report', frequency: 'daily' }],
      },
      aiAgents: {},
      systems: {
        detailedSystems: [
          {
            id: 'crm-1',
            category: 'crm',
            specificSystem: 'Salesforce',
            apiAccess: 'full',
            satisfactionScore: 4,
            mainPainPoints: [],
            integrationNeeds: [],
            migrationWillingness: 'reluctant',
            criticalFeatures: [],
          },
          {
            id: 'accounting-1',
            category: 'accounting',
            specificSystem: 'QuickBooks',
            apiAccess: 'full',
            satisfactionScore: 2,
            mainPainPoints: ['Slow', 'Complex'],
            integrationNeeds: [
              {
                id: 'int-1',
                targetSystemId: 'crm-1',
                targetSystemName: 'Salesforce',
                integrationType: 'api',
                frequency: 'daily',
                dataFlow: 'bidirectional',
                criticalityLevel: 'critical',
                currentStatus: 'missing',
              },
            ],
            migrationWillingness: 'open',
            criticalFeatures: [],
          },
        ],
      },
      roi: {},
      planning: {},
    },
    painPoints: [],
  };

  describe('Pattern Recognition', () => {
    it('should detect missing integrations', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const analysis = engine.getPatternAnalysis();

      expect(analysis.detectedPatterns.length).toBeGreaterThan(0);

      const missingIntegration = analysis.detectedPatterns.find(
        (p) => p.type === 'missing_integration'
      );

      expect(missingIntegration).toBeDefined();
    });

    // DEPRECATED TEST: Manual data entry detection removed in v2
    // The detectManualDataEntry method no longer checks systemSync.manualWork
    // Test skipped as the detection logic was removed
    it.skip('should detect manual data entry opportunities (deprecated)', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const analysis = engine.getPatternAnalysis();

      const manualEntry = analysis.detectedPatterns.find(
        (p) => p.type === 'manual_data_entry'
      );

      // This test is skipped because detectManualDataEntry logic was removed
      expect(manualEntry).toBeDefined();
    });

    it('should detect high volume tasks', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const analysis = engine.getPatternAnalysis();

      const highVolume = analysis.detectedPatterns.find(
        (p) => p.type === 'high_volume_task'
      );

      expect(highVolume).toBeDefined();
      expect(highVolume?.description).toContain('75 repetitive FAQ');
    });

    it('should detect after-hours gaps', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const analysis = engine.getPatternAnalysis();

      const afterHours = analysis.detectedPatterns.find(
        (p) => p.type === 'after_hours_gap'
      );

      expect(afterHours).toBeDefined();
      expect(afterHours?.severity).toBe('critical');
    });

    it('should detect low satisfaction systems', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const analysis = engine.getPatternAnalysis();

      const lowSatisfaction = analysis.detectedPatterns.find(
        (p) => p.type === 'low_satisfaction'
      );

      expect(lowSatisfaction).toBeDefined();
      expect(lowSatisfaction?.description).toContain('QuickBooks');
    });
  });

  describe('Recommendation Generation', () => {
    it('should generate recommendations based on patterns', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const recommendations = engine.getRecommendations();

      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should include integration recommendations', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const recommendations = engine.getRecommendations();

      const integration = recommendations.find(
        (r) => r.category === 'integration'
      );

      expect(integration).toBeDefined();
      // affectedSystems may be empty array if extracted from pattern
      expect(Array.isArray(integration?.affectedSystems)).toBe(true);
    });

    it('should include automation recommendations', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const recommendations = engine.getRecommendations();

      const automation = recommendations.find(
        (r) => r.category === 'automation'
      );

      expect(automation).toBeDefined();
      expect(automation?.implementationSteps.length).toBeGreaterThan(0);
    });

    it('should include AI agent recommendations', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const recommendations = engine.getRecommendations();

      const aiAgent = recommendations.find((r) => r.category === 'ai_agent');

      expect(aiAgent).toBeDefined();
      expect(aiAgent?.n8nWorkflowTemplate).toBeDefined();
    });

    it('should mark quick wins correctly', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const quickWins = engine.getQuickWins();

      quickWins.forEach((rec) => {
        expect(rec.quickWin).toBe(true);
        expect(rec.impactScore).toBeGreaterThanOrEqual(7);
        expect(rec.effortScore).toBeLessThanOrEqual(4);
      });
    });

    it('should calculate estimated ROI', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const recommendations = engine.getRecommendations();

      recommendations.forEach((rec) => {
        expect(rec.estimatedROI).toBeGreaterThan(0);
      });
    });
  });

  describe('Prioritization', () => {
    it('should prioritize quick wins first', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const recommendations = engine.getRecommendations();

      const quickWins = recommendations.filter((r) => r.quickWin);
      const nonQuickWins = recommendations.filter((r) => !r.quickWin);

      if (quickWins.length > 0 && nonQuickWins.length > 0) {
        const lastQuickWin = quickWins[quickWins.length - 1];
        const firstNonQuickWin = nonQuickWins[0];

        expect(lastQuickWin.priority).toBeLessThan(firstNonQuickWin.priority);
      }
    });

    it('should prioritize by impact/effort ratio', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const recommendations = engine.getRecommendations();

      for (let i = 0; i < recommendations.length - 1; i++) {
        const current = recommendations[i];
        const next = recommendations[i + 1];

        // If both are quick wins or both are not
        if (current.quickWin === next.quickWin) {
          const currentRatio = current.impactScore / current.effortScore;
          const nextRatio = next.impactScore / next.effortScore;

          expect(currentRatio).toBeGreaterThanOrEqual(nextRatio);
        }
      }
    });

    it('should assign sequential priority numbers', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const recommendations = engine.getRecommendations();

      recommendations.forEach((rec, index) => {
        expect(rec.priority).toBe(index + 1);
      });
    });
  });

  describe('N8n Workflow Templates', () => {
    it('should include CRM-WhatsApp integration template', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const recommendations = engine.getRecommendations();

      const crmWhatsApp = recommendations.find(
        (r) => r.n8nWorkflowTemplate?.name === 'CRM to WhatsApp Integration'
      );

      if (crmWhatsApp) {
        const template = crmWhatsApp.n8nWorkflowTemplate!;

        expect(template.nodes.length).toBeGreaterThan(0);
        expect(template.connections.length).toBeGreaterThan(0);
        expect(template.estimatedSetupTime).toBeGreaterThan(0);
      }
    });

    it('should include AI chatbot template', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const recommendations = engine.getRecommendations();

      const aiChatbot = recommendations.find(
        (r) => r.n8nWorkflowTemplate?.name === 'AI Customer Service Chatbot'
      );

      if (aiChatbot) {
        const template = aiChatbot.n8nWorkflowTemplate!;

        expect(template.nodes.some((n) => n.type === 'openai')).toBe(true);
        expect(template.nodes.some((n) => n.type === 'if')).toBe(true);
      }
    });

    it('should include after-hours response template', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const recommendations = engine.getRecommendations();

      const afterHours = recommendations.find(
        (r) => r.n8nWorkflowTemplate?.name === 'After Hours Auto-Response'
      );

      expect(afterHours).toBeDefined();
    });

    it('workflow templates should have valid node connections', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const recommendations = engine.getRecommendations();

      const withTemplates = recommendations.filter(
        (r) => r.n8nWorkflowTemplate
      );

      withTemplates.forEach((rec) => {
        const template = rec.n8nWorkflowTemplate!;
        const nodeIds = new Set(template.nodes.map((n) => n.id));

        template.connections.forEach((conn) => {
          expect(nodeIds.has(conn.from)).toBe(true);
          expect(nodeIds.has(conn.to)).toBe(true);
        });
      });
    });
  });

  describe('Helper Functions', () => {
    it('analyzePatterns should return pattern analysis', () => {
      const analysis = analyzePatterns(mockMeeting);

      expect(analysis.detectedPatterns).toBeDefined();
      expect(analysis.automationOpportunities).toBeGreaterThan(0);
      expect(analysis.totalPotentialSavings).toBeGreaterThan(0);
      expect(Array.isArray(analysis.criticalIssues)).toBe(true);
      expect(Array.isArray(analysis.quickWins)).toBe(true);
    });

    it('getSmartRecommendations should return all recommendations', () => {
      const recommendations = getSmartRecommendations(mockMeeting);

      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('getQuickWins should filter quick wins', () => {
      const quickWins = getQuickWins(mockMeeting);

      quickWins.forEach((rec) => {
        expect(rec.quickWin).toBe(true);
      });
    });

    it('prioritizeRecommendations should work on array', () => {
      const mockRecs: SmartRecommendation[] = [
        {
          id: '1',
          title: 'Low Priority',
          titleHebrew: 'עדיפות נמוכה',
          description: 'Test',
          category: 'automation',
          impactScore: 5,
          effortScore: 8,
          quickWin: false,
          estimatedROI: 1000,
          affectedSystems: [],
          suggestedTools: [],
          implementationSteps: [],
          priority: 0,
        },
        {
          id: '2',
          title: 'High Priority',
          titleHebrew: 'עדיפות גבוהה',
          description: 'Test',
          category: 'automation',
          impactScore: 9,
          effortScore: 2,
          quickWin: true,
          estimatedROI: 10000,
          affectedSystems: [],
          suggestedTools: [],
          implementationSteps: [],
          priority: 0,
        },
      ];

      const prioritized = prioritizeRecommendations(mockRecs);

      expect(prioritized[0].id).toBe('2'); // Quick win should be first
      expect(prioritized[0].priority).toBe(1);
      expect(prioritized[1].priority).toBe(2);
    });
  });

  describe('Public API Methods', () => {
    it('getRecommendations should return all recommendations', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const recommendations = engine.getRecommendations();

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('getQuickWins should return only quick wins', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const quickWins = engine.getQuickWins();

      quickWins.forEach((rec) => {
        expect(rec.quickWin).toBe(true);
      });
    });

    it('getByCategory should filter by category', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const integrations = engine.getByCategory('integration');

      integrations.forEach((rec) => {
        expect(rec.category).toBe('integration');
      });
    });

    it('getPatternAnalysis should return analysis result', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const analysis = engine.getPatternAnalysis();

      expect(analysis.detectedPatterns).toBeDefined();
      expect(analysis.automationOpportunities).toBeGreaterThanOrEqual(0);
      expect(analysis.totalPotentialSavings).toBeGreaterThanOrEqual(0);
    });

    it('getTopRecommendations should return top N', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const top3 = engine.getTopRecommendations(3);

      expect(top3.length).toBeLessThanOrEqual(3);

      if (top3.length > 1) {
        expect(top3[0].priority).toBe(1);
        expect(top3[1].priority).toBe(2);
      }
    });

    it('getTotalEstimatedROI should sum all ROI', () => {
      const engine = new SmartRecommendationsEngine(mockMeeting);
      const total = engine.getTotalEstimatedROI();
      const recommendations = engine.getRecommendations();

      const manualSum = recommendations.reduce(
        (sum, rec) => sum + rec.estimatedROI,
        0
      );

      expect(total).toBe(manualSum);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty meeting data', () => {
      const emptyMeeting: Meeting = {
        meetingId: 'empty',
        clientName: 'Empty',
        date: new Date(),
        modules: {
          overview: {},
          leadsAndSales: {
            leadSources: [],
            speedToLead: {},
            leadRouting: {},
            followUp: {},
            appointments: {},
          },
          customerService: {
            channels: [],
            autoResponse: { topQuestions: [], commonRequests: [] },
            proactiveCommunication: {},
            communityManagement: { exists: false },
            reputationManagement: {},
            onboarding: {},
          },
          operations: {
            // Updated to match new OperationsModule v2 structure
            workProcesses: {},
            documentManagement: {},
            projectManagement: {},
            hr: {},
            logistics: {},
          },
          reporting: {},
          aiAgents: {},
          systems: {},
          roi: {},
          planning: {},
        },
        painPoints: [],
      };

      const engine = new SmartRecommendationsEngine(emptyMeeting);
      const recommendations = engine.getRecommendations();

      // Should not crash, may have zero or template-based recommendations
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should handle undefined module properties gracefully', () => {
      const partialMeeting: Meeting = {
        meetingId: 'partial',
        clientName: 'Partial',
        date: new Date(),
        modules: {
          overview: {},
          leadsAndSales: {} as any,
          customerService: {} as any,
          operations: {} as any,
          reporting: {},
          aiAgents: {},
          systems: {},
          roi: {},
          planning: {},
        },
        painPoints: [],
      };

      expect(() => {
        new SmartRecommendationsEngine(partialMeeting);
      }).not.toThrow();
    });
  });
});
