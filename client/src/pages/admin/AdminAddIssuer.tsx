import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { handleApiError } from '../../utils/errorHandler';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminAddIssuer() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [did, setDid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdIssuer, setCreatedIssuer] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Clinic name is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await apiClient.registerIssuer(name.trim(), did.trim() || undefined);
      setCreatedIssuer(result);
      setSuccess(true);
      setName('');
      setDid('');
    } catch (err) {
      setError(handleApiError(err as Error));
    } finally {
      setLoading(false);
    }
  };

  if (success && createdIssuer) {
    return (
      <div className="container">
        <div className="success-message">
          <h2>Issuer Registered Successfully!</h2>
          <div className="result-details">
            <p><strong>Name:</strong> {createdIssuer.name}</p>
            <p><strong>DID:</strong> <code>{createdIssuer.did}</code></p>
            <p><strong>Public Key:</strong> <code>{createdIssuer.publicKey}</code></p>
            <p><strong>Status:</strong> <span className="status-badge status-active">Active</span></p>
          </div>
        </div>
        <div className="action-buttons">
          <button 
            onClick={() => {
              setSuccess(false);
              setCreatedIssuer(null);
            }}
            className="btn btn-primary"
          >
            Add Another Issuer
          </button>
          <button 
            onClick={() => navigate('/admin/issuers')}
            className="btn btn-secondary"
          >
            View All Issuers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Add New Issuer (Clinic)</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Clinic Name *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="City General Hospital"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="did">DID (Optional)</label>
          <input
            id="did"
            type="text"
            value={did}
            onChange={(e) => setDid(e.target.value)}
            placeholder="did:clinic:002"
            disabled={loading}
          />
          <small>If not provided, system will auto-generate one</small>
        </div>

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
                <span>Registering...</span>
              </>
            ) : (
              'Register Clinic'
            )}
          </button>
          <button 
            type="button"
            onClick={() => navigate('/admin/issuers')}
            className="btn btn-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

