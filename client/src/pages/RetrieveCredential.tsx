import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { handleApiError } from '../utils/errorHandler';
import { storage } from '../utils/storage';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Issuer, Credential } from '../types';

export default function RetrieveCredential() {
  const navigate = useNavigate();
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [selectedIssuer, setSelectedIssuer] = useState('');
  const [patientNumber, setPatientNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingIssuers, setLoadingIssuers] = useState(true);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Clear local storage on mount
    storage.clear();
    loadIssuers();
  }, []);

  const loadIssuers = async () => {
    setLoadingIssuers(true);
    try {
      const data = await apiClient.getIssuerNames();
      setIssuers(data);
    } catch (err) {
      setError('Failed to load clinics');
    } finally {
      setLoadingIssuers(false);
    }
  };

  const handleRetrieve = async () => {
    if (!selectedIssuer || !patientNumber) {
      setError('Please select a clinic and enter your patient number');
      return;
    }

    setLoading(true);
    setError('');
    setCredentials([]);

    try {
      // Add delay before fetching credentials
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const data = await apiClient.retrieveCredentials(selectedIssuer, patientNumber);
      setCredentials(data);
    } catch (err) {
      setError(handleApiError(err as Error));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProof = (credential: Credential) => {
    navigate('/generate-proof', { state: { credential } });
  };

  return (
    <div className="container">
      <h1>Retrieve Your Credential</h1>
      
      {loadingIssuers ? (
        <div className="loading-container">
          <LoadingSpinner size="medium" />
          <p>Loading clinics...</p>
        </div>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="issuer-select">Select Clinic</label>
            <select
              id="issuer-select"
              value={selectedIssuer}
              onChange={(e) => setSelectedIssuer(e.target.value)}
              disabled={loading}
            >
              <option value="">Select Clinic</option>
              {issuers.map(issuer => (
                <option key={issuer.id} value={issuer.name}>
                  {issuer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="patient-number">Patient Number</label>
            <input
              id="patient-number"
              type="text"
              placeholder="Enter your patient number"
              value={patientNumber}
              onChange={(e) => setPatientNumber(e.target.value)}
              disabled={loading}
            />
          </div>

          <button 
            onClick={handleRetrieve} 
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span>Loading...</span>
              </>
            ) : (
              'Retrieve Credential'
            )}
          </button>

          {error && <div className="error">{error}</div>}
        </>
      )}

      {credentials.length > 0 && (
        <div className="credentials-list">
          {credentials.map((cred, index) => (
            <div key={index} className="credential-ticket">
              <div className="ticket-header">
                <div className="ticket-issuer">
                  <h3>{cred.issuerName}</h3>
                </div>
                <div className={`ticket-status status-${cred.status}`}>
                  {cred.status.toUpperCase()}
                </div>
              </div>
              
              <div className="ticket-body">
                <div className="ticket-hash-section">
                  <label>Credential Hash</label>
                  <div className="ticket-hash">
                    <code>{cred.credentialHash}</code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(cred.credentialHash);
                      }}
                      className="btn-copy"
                      title="Copy hash"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.5 2.5H11.5C12.0523 2.5 12.5 2.94772 12.5 3.5V9.5M5.5 2.5H3.5C2.94772 2.5 2.5 2.94772 2.5 3.5V11.5C2.5 12.0523 2.94772 12.5 3.5 12.5H9.5C10.0523 12.5 10.5 12.0523 10.5 11.5V9.5M5.5 2.5V6.5C5.5 7.05228 5.94772 7.5 6.5 7.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="ticket-history-link">
                  <a 
                    href={`/history/${cred.credentialHash}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/history/${cred.credentialHash}`);
                    }}
                    className="history-link"
                  >
                    View Proof History
                  </a>
                </div>
                
                <div className="ticket-details">
                  <div className="ticket-detail-item">
                    <span className="ticket-label">Issued</span>
                    <span className="ticket-value">{new Date(cred.issuedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="ticket-detail-item">
                    <span className="ticket-label">Expires</span>
                    <span className="ticket-value ticket-expiry">{new Date(cred.expiry).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="ticket-footer">
                {cred.status === 'active' && (
                  <button 
                    onClick={() => handleGenerateProof(cred)}
                    className="btn btn-primary btn-full"
                  >
                    Continue
                  </button>
                )}
                {cred.status !== 'active' && (
                  <div className="ticket-warning">
                    {cred.status === 'revoked' 
                      ? 'This credential has been revoked' 
                      : 'This credential has expired'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

