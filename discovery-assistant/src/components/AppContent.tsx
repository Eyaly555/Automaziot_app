import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './Dashboard/Dashboard';
import { ClientsListView } from './Clients/ClientsListView';
import { WizardMode } from './Wizard/WizardMode';
import { Login } from './Auth/Login';
import { AISettings } from './Settings/AISettings';
import { OverviewModule } from './Modules/Overview/OverviewModule';
import { LeadsAndSalesModule } from './Modules/LeadsAndSales/LeadsAndSalesModule';
import { CustomerServiceModule } from './Modules/CustomerService/CustomerServiceModule';
import { OperationsModule } from './Modules/Operations/OperationsModule';
import { ReportingModule } from './Modules/Reporting/ReportingModule';
import { AIAgentsModule } from './Modules/AIAgents/AIAgentsModule';
import { SystemsModuleEnhanced } from './Modules/Systems/SystemsModuleEnhanced';
import { ROIModule } from './Modules/ROI/ROIModule';
import { PlanningModule } from './Modules/Planning/PlanningModule';
import { SummaryTab } from './Summary/SummaryTab';
import { ImplementationSpecDashboard } from './Phase2/ImplementationSpecDashboard';
import { SystemDeepDive } from './Phase2/SystemDeepDive';
import { IntegrationFlowBuilder } from './Phase2/IntegrationFlowBuilder';
import { AIAgentDetailedSpec } from './Phase2/AIAgentDetailedSpec';
import { AcceptanceCriteriaBuilder } from './Phase2/AcceptanceCriteriaBuilder';
import { DeveloperDashboard } from './Phase3/DeveloperDashboard';
import { SprintView } from './Phase3/SprintView';
import { SystemView } from './Phase3/SystemView';
import { ProgressTracking } from './Phase3/ProgressTracking';
import { BlockerManagement } from './Phase3/BlockerManagement';
import { SyncStatusIndicator } from './Common/SyncStatusIndicator';
import { useAccessibility, useSkipToContent } from '../hooks/useAccessibility';
import { useMeetingStore } from '../store/useMeetingStore';
import { autoSyncService } from '../services/autoSyncService';

export const AppContent = () => {
  const { currentMeeting } = useMeetingStore();

  // Enable accessibility features - now inside Router context
  useAccessibility();
  useSkipToContent();

  // Auto-sync management based on current meeting
  useEffect(() => {
    const meeting = currentMeeting;

    if (meeting?.zohoIntegration?.syncEnabled) {
      console.log('[AppContent] Starting auto-sync for meeting:', meeting.clientName);
      autoSyncService.start();
    } else {
      console.log('[AppContent] Stopping auto-sync');
      autoSyncService.stop();
    }

    return () => {
      autoSyncService.stop();
    };
  }, [currentMeeting?.zohoIntegration?.syncEnabled, currentMeeting?.meetingId]);

  return (
    <>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/meeting/:recordId" element={<Dashboard />} />
      <Route path="/clients" element={<ClientsListView />} />
      <Route path="/login" element={<Login />} />
      <Route path="/summary" element={<SummaryTab />} />
      <Route path="/wizard" element={<WizardMode />} />
      <Route path="/wizard/:stepId" element={<WizardMode />} />
      <Route path="/settings/ai" element={<AISettings />} />
      <Route path="/module/overview" element={<OverviewModule />} />
      <Route path="/module/leadsAndSales" element={<LeadsAndSalesModule />} />
      <Route path="/module/customerService" element={<CustomerServiceModule />} />
      <Route path="/module/operations" element={<OperationsModule />} />
      <Route path="/module/reporting" element={<ReportingModule />} />
      <Route path="/module/aiAgents" element={<AIAgentsModule />} />
      <Route path="/module/systems" element={<SystemsModuleEnhanced />} />
      <Route path="/module/roi" element={<ROIModule />} />
      <Route path="/module/planning" element={<PlanningModule />} />
      <Route path="/phase2" element={<ImplementationSpecDashboard />} />
      <Route path="/phase2/systems/new" element={<SystemDeepDive />} />
      <Route path="/phase2/systems/:systemId" element={<SystemDeepDive />} />
      <Route path="/phase2/integrations/new" element={<IntegrationFlowBuilder />} />
      <Route path="/phase2/integrations/:flowId" element={<IntegrationFlowBuilder />} />
      <Route path="/phase2/agents/new" element={<AIAgentDetailedSpec />} />
      <Route path="/phase2/agents/:agentId" element={<AIAgentDetailedSpec />} />
      <Route path="/phase2/acceptance" element={<AcceptanceCriteriaBuilder />} />
      <Route path="/phase3" element={<DeveloperDashboard />} />
      <Route path="/phase3/sprints" element={<SprintView />} />
      <Route path="/phase3/systems" element={<SystemView />} />
      <Route path="/phase3/progress" element={<ProgressTracking />} />
      <Route path="/phase3/blockers" element={<BlockerManagement />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

    {/* Global Sync Status Indicator */}
    <SyncStatusIndicator />
  </>
  );
};