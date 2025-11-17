import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { handleApiError } from '../../utils/errorHandler';
import { storage } from '../../utils/storage';

interface ClinicLayoutContext {
  clinicName: string | null;
  setClinicName: (name: string | null) => void;
}

export default function ClinicDashboard() {
  const { clinicName } = useOutletContext<ClinicLayoutContext>() || { clinicName: storage.getClinicName() };
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revoked: 0,
    loading: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (clinicName) {
      loadStats();
    }
  }, [clinicName]);

  const loadStats = async () => {
    if (!clinicName) {
      setError('Please select a clinic first');
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Add delay before fetching
      await new Promise(resolve => setTimeout(resolve, 1000));
      const credentials = await apiClient.getCredentials(clinicName);
      const active = credentials.filter(c => c.status === 'active').length;
      const revoked = credentials.filter(c => c.status === 'revoked').length;
      setStats({
        total: credentials.length,
        active,
        revoked,
        loading: false,
      });
    } catch (err) {
      setError(handleApiError(err as Error));
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="container">
      <h1>Clinic Dashboard</h1>
      
      {error && <div className="error">{error}</div>}

      {stats.loading ? (
        <div className="loading-container">
          <div className="rolling-loader">
            <div className="rolling-spinner"></div>
          </div>
        </div>
      ) : (
        <div className="dashboard-stats">
          <div className="stat-card">
            <h2>{stats.total}</h2>
            <p>Total Credentials</p>
          </div>
          <div className="stat-card">
            <h2>{stats.active}</h2>
            <p>Active Credentials</p>
          </div>
          <div className="stat-card">
            <h2>{stats.revoked}</h2>
            <p>Revoked Credentials</p>
          </div>
        </div>
      )}
    </div>
  );
}

