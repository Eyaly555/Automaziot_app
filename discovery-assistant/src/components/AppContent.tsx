import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './Dashboard/Dashboard';
import { WizardMode } from './Wizard/WizardMode';
import { Login } from './Auth/Login';
import { AISettings } from './Settings/AISettings';
import { OverviewModule } from './Modules/Overview/OverviewModule';
import { LeadsAndSalesModule } from './Modules/LeadsAndSales/LeadsAndSalesModule';
import { CustomerServiceModule } from './Modules/CustomerService/CustomerServiceModule';
import { OperationsModule } from './Modules/Operations/OperationsModule';
import { ReportingModule } from './Modules/Reporting/ReportingModule';
import { AIAgentsModule } from './Modules/AIAgents/AIAgentsModule';
import { SystemsModule } from './Modules/Systems/SystemsModule';
import { ROIModule } from './Modules/ROI/ROIModule';
import { PlanningModule } from './Modules/Planning/PlanningModule';
import { useAccessibility, useSkipToContent } from '../hooks/useAccessibility';

export const AppContent = () => {
  // Enable accessibility features - now inside Router context
  useAccessibility();
  useSkipToContent();

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/wizard" element={<WizardMode />} />
      <Route path="/wizard/:stepId" element={<WizardMode />} />
      <Route path="/settings/ai" element={<AISettings />} />
      <Route path="/module/overview" element={<OverviewModule />} />
      <Route path="/module/leadsAndSales" element={<LeadsAndSalesModule />} />
      <Route path="/module/customerService" element={<CustomerServiceModule />} />
      <Route path="/module/operations" element={<OperationsModule />} />
      <Route path="/module/reporting" element={<ReportingModule />} />
      <Route path="/module/aiAgents" element={<AIAgentsModule />} />
      <Route path="/module/systems" element={<SystemsModule />} />
      <Route path="/module/roi" element={<ROIModule />} />
      <Route path="/module/planning" element={<PlanningModule />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};