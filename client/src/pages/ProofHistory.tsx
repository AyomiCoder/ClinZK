import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { handleApiError } from '../utils/errorHandler';
import { storage } from '../utils/storage';
import LoadingSpinner from '../components/LoadingSpinner';
import type { ProofHistory } from '../types';

export default function ProofHistory() {
  const { credentialHash } = useParams<{ credentialHash: string }>();
  const navigate = useNavigate();
  const [inputHash, setInputHash] = useState(credentialHash || '');
  const [history, setHistory] = useState<ProofHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedHash = storage.getCredentialHash();
    if (savedHash && !credentialHash) {
      setInputHash(savedHash);
    }
    if (credentialHash) {
      loadHistory(credentialHash);
    }
  }, [credentialHash]);

  const loadHistory = async (hash: string) => {
    if (!hash) {
      setError('Please enter your credential hash');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await apiClient.getProofHistory(hash);
      setHistory(data);
      storage.saveCredentialHash(hash);
    } catch (err) {
      setError(handleApiError(err as Error));
    } finally {
      setLoading(false);
    }
  };

  const handleLoadHistory = () => {
    if (inputHash) {
      navigate(`/history/${inputHash}`);
    } else {
      loadHistory(inputHash);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'status-verified';
      case 'rejected': return 'status-rejected';
      case 'expired': return 'status-expired';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };

  return (
    <div className="container">
      <h1>Proof History</h1>

      <div className="form-group">
        <label htmlFor="credential-hash">Credential Hash</label>
        <input
          id="credential-hash"
          type="text"
          placeholder="Enter your credential hash"
          value={inputHash}
          onChange={(e) => setInputHash(e.target.value)}
          disabled={loading}
        />
        <button 
          onClick={handleLoadHistory} 
          disabled={loading || !inputHash}
          className="btn btn-primary"
        >
          {loading ? (
            <>
              <LoadingSpinner size="small" />
              <span>Loading...</span>
            </>
          ) : (
            'View History'
          )}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {history && (
        <div className="history-container">
          <div className="proofs-section">
            <h2>Proof Submissions ({history.proofs.length})</h2>
            {history.proofs.length === 0 ? (
              <p className="empty-state">No proofs submitted yet.</p>
            ) : (
              <div className="proofs-list">
                {history.proofs.map((proof, index) => (
                  <div key={index} className={`proof-item-simple ${proof.status === 'verified' ? 'proof-verified' : ''}`}>
                    {proof.status === 'verified' && (
                      <div className="verification-seal">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                          <circle cx="20" cy="20" r="18" fill="#10b981" opacity="0.2"/>
                          <path d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8zm-1 17l-5-5 1.41-1.41L19 22.17l7.59-7.59L28 16l-9 9z" fill="#10b981"/>
                        </svg>
                        <span>Verified</span>
                      </div>
                    )}
                    <div className="proof-header">
                      <div className="proof-issuer">
                        <h3>{history.issuerName}</h3>
                        {proof.status !== 'verified' && (
                          <span className={`status-badge ${getStatusColor(proof.status)}`}>
                            {proof.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="proof-hash-display">
                      <label>Proof Hash</label>
                      <code>{proof.proofHash}</code>
                    </div>
                    {proof.status === 'verified' && proof.txHash && (
                      <div className="proof-tx">
                        <label>txHash</label>
                        <code>{proof.txHash}</code>
                      </div>
                    )}
                    {proof.status === 'verified' && proof.verifiedAt && (
                      <div className="proof-verified-at">
                        <label>Verified at</label>
                        <span>{new Date(proof.verifiedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {proof.eligibleTrials && proof.eligibleTrials.length > 0 && (
                      <div className="proof-eligible-trials">
                        <label>Eligible Trials</label>
                        <span className="eligible-trials-count">
                          You are eligible for {proof.eligibleTrials.length} clinical trial{proof.eligibleTrials.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {proof.status !== 'verified' && (
                      <div className="proof-created-at">
                        <label>Created at</label>
                        <span>{new Date(proof.createdAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button onClick={() => navigate('/')} className="btn btn-outline">
          Back to Home
        </button>
      </div>
    </div>
  );
}

