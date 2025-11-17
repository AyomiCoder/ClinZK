import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import RetrieveCredential from './pages/RetrieveCredential';
import GenerateProof from './pages/GenerateProof';
import ProofHistory from './pages/ProofHistory';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminIssuers from './pages/admin/AdminIssuers';
import AdminTrials from './pages/admin/AdminTrials';
import ClinicLayout from './layouts/ClinicLayout';
import ClinicDashboard from './pages/clinic/ClinicDashboard';
import ClinicCredentials from './pages/clinic/ClinicCredentials';
import './App.css';

function AppContent() {
  return (
    <div className="App">
      <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/retrieve" element={<RetrieveCredential />} />
            <Route path="/generate-proof" element={<GenerateProof />} />
            <Route path="/history/:credentialHash" element={<ProofHistory />} />
            <Route path="/history" element={<ProofHistory />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="issuers" element={<AdminIssuers />} />
              <Route path="trials" element={<AdminTrials />} />
            </Route>
            <Route path="/clinic" element={<ClinicLayout />}>
              <Route index element={<ClinicDashboard />} />
              <Route path="credentials" element={<ClinicCredentials />} />
            </Route>
          </Routes>
        </main>
        <footer className="App-footer">
          <div className="footer-content">
            <Link to="/" className="footer-logo">ClinZK</Link>
            <span className="footer-separator">•</span>
            <span className="footer-text">Powered by</span>
            <a href="https://midnight.io" target="_blank" rel="noopener noreferrer" className="midnight-logo">
              Midnight
            </a>
          </div>
        </footer>
      </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
