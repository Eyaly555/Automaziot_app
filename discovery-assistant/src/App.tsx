import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppContent } from './components/AppContent';
import { ZohoIntegrationWrapper } from './components/ZohoIntegrationWrapper';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ZohoIntegrationWrapper>
          <AppContent />
        </ZohoIntegrationWrapper>
      </Router>
    </AuthProvider>
  );
}

export default App;