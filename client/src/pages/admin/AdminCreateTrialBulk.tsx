import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { handleApiError } from '../../utils/errorHandler';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { TrialCreateRequest } from '../../types';

export default function AdminCreateTrialBulk() {
  const navigate = useNavigate();
  const [trials, setTrials] = useState<TrialCreateRequest[]>([
    { codeName: '', displayName: '', requirements: {} }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const updateTrial = (index: number, field: keyof TrialCreateRequest, value: any) => {
    const updated = [...trials];
    if (field === 'requirements') {
      updated[index].requirements = { ...updated[index].requirements, ...value };
    } else {
      (updated[index] as any)[field] = value;
    }
    setTrials(updated);
  };

  const addTrial = () => {
    setTrials([...trials, { codeName: '', displayName: '', requirements: {} }]);
  };

  const removeTrial = (index: number) => {
    if (trials.length > 1) {
      setTrials(trials.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validTrials = trials.filter(t => t.codeName.trim() && t.displayName.trim());
    if (validTrials.length === 0) {
      setError('At least one valid trial is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedTrials = validTrials.map(t => ({
        codeName: t.codeName.trim().toUpperCase().replace(/[^A-Z0-9_]/g, ''),
        displayName: t.displayName.trim(),
        requirements: t.requirements,
      }));

      const response = await apiClient.createTrialsBulk(formattedTrials);
      setResult(response);
    } catch (err) {
      setError(handleApiError(err as Error));
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="container">
        <h1>Bulk Creation Results</h1>
        
        <div className="result-summary">
          <h2>Summary</h2>
          <p><strong>Total:</strong> {result.summary.total}</p>
          <p><strong>Successful:</strong> <span className="success">{result.summary.successful}</span></p>
          <p><strong>Failed:</strong> <span className="error">{result.summary.failed}</span></p>
        </div>

        {result.created.length > 0 && (
          <div className="success-message">
            <h3>Successfully Created ({result.created.length})</h3>
            <ul>
              {result.created.map((trial: any, idx: number) => (
                <li key={idx}>
                  <strong>{trial.displayName}</strong> ({trial.codeName})
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.errors.length > 0 && (
          <div className="error">
            <h3>Failed ({result.errors.length})</h3>
            <ul>
              {result.errors.map((err: any, idx: number) => (
                <li key={idx}>
                  <strong>{err.codeName}:</strong> {err.error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="action-buttons">
          <button 
            onClick={() => {
              setResult(null);
              setTrials([{ codeName: '', displayName: '', requirements: {} }]);
            }}
            className="btn btn-primary"
          >
            Create More
          </button>
          <button 
            onClick={() => navigate('/admin/trials')}
            className="btn btn-secondary"
          >
            View All Trials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Create Trials (Bulk)</h1>
      
      <form onSubmit={handleSubmit}>
        {trials.map((trial, index) => (
          <div key={index} className="bulk-trial-entry">
            <div className="bulk-entry-header">
              <h3>Trial {index + 1}</h3>
              {trials.length > 1 && (
                <button 
                  type="button"
                  onClick={() => removeTrial(index)}
                  className="btn btn-outline"
                  disabled={loading}
                >
                  Remove
                </button>
              )}
            </div>

            <div className="form-group">
              <label>Code Name *</label>
              <input
                type="text"
                value={trial.codeName}
                onChange={(e) => updateTrial(index, 'codeName', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                placeholder="BLOOD_BANK"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label>Display Name *</label>
              <input
                type="text"
                value={trial.displayName}
                onChange={(e) => updateTrial(index, 'displayName', e.target.value)}
                placeholder="Blood Bank Trial"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label>Conditions (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(trial.requirements.conditions) ? trial.requirements.conditions.join(', ') : ''}
                onChange={(e) => {
                  const conditions = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                  updateTrial(index, 'requirements', { conditions });
                }}
                placeholder="Anemia, Blood Disorder"
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Min Age</label>
                <input
                  type="number"
                  value={trial.requirements.minAge || ''}
                  onChange={(e) => updateTrial(index, 'requirements', { 
                    minAge: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Max Age</label>
                <input
                  type="number"
                  value={trial.requirements.maxAge || ''}
                  onChange={(e) => updateTrial(index, 'requirements', { 
                    maxAge: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        ))}

        <button 
          type="button"
          onClick={addTrial}
          className="btn btn-outline"
          disabled={loading}
        >
          + Add Another Trial
        </button>

        {error && <div className="error">{error}</div>}

        <div className="action-buttons">
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary btn-large"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span>Creating...</span>
              </>
            ) : (
              'Create All Trials'
            )}
          </button>
          <button 
            type="button"
            onClick={() => navigate('/admin/trials')}
            className="btn btn-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

