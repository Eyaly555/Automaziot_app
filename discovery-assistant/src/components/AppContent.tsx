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
import { ProposalModule } from './Modules/Proposal/ProposalModule';
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
import { ProtectedRoute } from './Common/ProtectedRoute';
import { PhaseNavigator } from './PhaseWorkflow/PhaseNavigator';
import { RequirementsFlow } from './PhaseWorkflow/RequirementsFlow';
import { ClientApprovalView } from './PhaseWorkflow/ClientApprovalView';
import { useAccessibility, useSkipToContent } from '../hooks/useAccessibility';
import { usePhaseGuard } from '../hooks/usePhaseGuard';
import { useMeetingStore } from '../store/useMeetingStore';
import { autoSyncService } from '../services/autoSyncService';
import { useLocation } from 'react-router-dom';

export const AppContent = () => {
  const { currentMeeting } = useMeetingStore();
  const location = useLocation();

  // Enable accessibility features - now inside Router context
  useAccessibility();
  useSkipToContent();

  // Determine language for phase guard (English for Phase 3, Hebrew otherwise)
  const phaseGuardLanguage = currentMeeting?.phase === 'development' ? 'en' : 'he';

  // Enable phase-based route guards
  usePhaseGuard(phaseGuardLanguage);

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

  // Determine if we should show the phase navigator
  const showPhaseNavigator = currentMeeting &&
    !location.pathname.includes('/login') &&
    !location.pathname.includes('/clients');

  // Determine language for phase navigator (English for Phase 3, Hebrew otherwise)
  const phaseNavigatorLanguage = currentMeeting?.phase === 'development' ? 'en' : 'he';

  return (
    <>
    {/* Phase Navigator - shown on all pages except login and clients list */}
    {showPhaseNavigator && (
      <PhaseNavigator
        language={phaseNavigatorLanguage}
        showProgress={true}
      />
    )}

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
      <Route path="/module/proposal" element={<ProposalModule />} />
      <Route path="/module/planning" element={<ProposalModule />} /> {/* Keep for backward compatibility */}

      {/* Requirements Flow - Protected: Discovery phase, complete status */}
      <Route
        path="/requirements"
        element={
          <ProtectedRoute
            requiredPhase="discovery"
            allowedStatuses={['discovery_complete', 'awaiting_client_decision']}
            errorMessage={{
              he: 'יש להשלים את שלב הגילוי לפני איסוף דרישות',
              en: 'Complete discovery phase before requirements collection'
            }}
            language={phaseGuardLanguage}
          >
            <RequirementsFlow />
          </ProtectedRoute>
        }
      />

      {/* Client Approval - Protected: Discovery phase, awaiting decision */}
      <Route
        path="/approval"
        element={
          <ProtectedRoute
            requiredPhase="discovery"
            allowedStatuses={['awaiting_client_decision', 'client_approved']}
            errorMessage={{
              he: 'דף אישור לקוח זמין רק לאחר השלמת הגילוי',
              en: 'Client approval page available only after discovery completion'
            }}
            language={phaseGuardLanguage}
          >
            <ClientApprovalView />
          </ProtectedRoute>
        }
      />

      {/* Phase 2 Routes - Protected: Implementation Spec phase */}
      <Route
        path="/phase2"
        element={
          <ProtectedRoute
            requiredPhase="implementation_spec"
            errorMessage={{
              he: 'יש לקבל אישור לקוח ולעבור לשלב מפרט היישום',
              en: 'Client approval required to access implementation spec phase'
            }}
            language={phaseGuardLanguage}
          >
            <ImplementationSpecDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/phase2/systems/new"
        element={
          <ProtectedRoute requiredPhase="implementation_spec" language={phaseGuardLanguage}>
            <SystemDeepDive />
          </ProtectedRoute>
        }
      />
      <Route
        path="/phase2/systems/:systemId"
        element={
          <ProtectedRoute requiredPhase="implementation_spec" language={phaseGuardLanguage}>
            <SystemDeepDive />
          </ProtectedRoute>
        }
      />
      <Route
        path="/phase2/integrations/new"
        element={
          <ProtectedRoute requiredPhase="implementation_spec" language={phaseGuardLanguage}>
            <IntegrationFlowBuilder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/phase2/integrations/:flowId"
        element={
          <ProtectedRoute requiredPhase="implementation_spec" language={phaseGuardLanguage}>
            <IntegrationFlowBuilder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/phase2/agents/new"
        element={
          <ProtectedRoute requiredPhase="implementation_spec" language={phaseGuardLanguage}>
            <AIAgentDetailedSpec />
          </ProtectedRoute>
        }
      />
      <Route
        path="/phase2/agents/:agentId"
        element={
          <ProtectedRoute requiredPhase="implementation_spec" language={phaseGuardLanguage}>
            <AIAgentDetailedSpec />
          </ProtectedRoute>
        }
      />
      <Route
        path="/phase2/acceptance"
        element={
          <ProtectedRoute requiredPhase="implementation_spec" language={phaseGuardLanguage}>
            <AcceptanceCriteriaBuilder />
          </ProtectedRoute>
        }
      />

      {/* Phase 3 Routes - Protected: Development phase */}
      <Route
        path="/phase3"
        element={
          <ProtectedRoute
            requiredPhase="development"
            errorMessage={{
              he: 'יש להשלים את מפרט היישום לפני גישה לשלב הפיתוח',
              en: 'Implementation spec must be complete to access development phase'
            }}
            language="en"
          >
            <DeveloperDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/phase3/sprints"
        element={
          <ProtectedRoute requiredPhase="development" language="en">
            <SprintView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/phase3/systems"
        element={
          <ProtectedRoute requiredPhase="development" language="en">
            <SystemView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/phase3/progress"
        element={
          <ProtectedRoute requiredPhase="development" language="en">
            <ProgressTracking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/phase3/blockers"
        element={
          <ProtectedRoute requiredPhase="development" language="en">
            <BlockerManagement />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

    {/* Global Sync Status Indicator */}
    <SyncStatusIndicator />
  </>
  );
};