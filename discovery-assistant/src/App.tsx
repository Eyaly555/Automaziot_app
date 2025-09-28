import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './components/Dashboard/Dashboard';
import { OverviewModule } from './components/Modules/Overview/OverviewModule';
import { LeadsAndSalesModule } from './components/Modules/LeadsAndSales/LeadsAndSalesModule';
import { CustomerServiceModule } from './components/Modules/CustomerService/CustomerServiceModule';
import { OperationsModule } from './components/Modules/Operations/OperationsModule';
import { ReportingModule } from './components/Modules/Reporting/ReportingModule';
import { AIAgentsModule } from './components/Modules/AIAgents/AIAgentsModule';
import { SystemsModule } from './components/Modules/Systems/SystemsModule';
import { ROIModule } from './components/Modules/ROI/ROIModule';
import { PlanningModule } from './components/Modules/Planning/PlanningModule';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
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
    </Router>
  );
}

export default App;