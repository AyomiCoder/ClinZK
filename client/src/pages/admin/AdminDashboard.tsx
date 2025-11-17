import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { handleApiError } from '../../utils/errorHandler';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    issuers: 0,
    trials: 0,
    loading: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [issuers, trials] = await Promise.all([
        apiClient.getIssuers(),
        apiClient.getTrials(),
      ]);
      setStats({
        issuers: issuers.length,
        trials: trials.length,
        loading: false,
      });
    } catch (err) {
      setError(handleApiError(err as Error));
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      
      {error && <div className="error">{error}</div>}

      <div className="dashboard-stats">
        <div className="stat-card">
          <h2>{stats.loading ? '...' : stats.issuers}</h2>
          <p>Registered Issuers</p>
          <button 
            onClick={() => navigate('/admin/issuers')}
            className="btn btn-outline"
          >
            View All
          </button>
        </div>
        <div className="stat-card">
          <h2>{stats.loading ? '...' : stats.trials}</h2>
          <p>Active Trials</p>
          <button 
            onClick={() => navigate('/admin/trials')}
            className="btn btn-outline"
          >
            View All
          </button>
        </div>
      </div>

    </div>
  );
}

