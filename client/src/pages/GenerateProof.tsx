import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { handleApiError } from '../utils/errorHandler';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import type { Credential, SubmissionResult } from '../types';

export default function GenerateProof() {
  const location = useLocation();
  const navigate = useNavigate();
  const credential = location.state?.credential as Credential | undefined;

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    if (!credential) {
      navigate('/');
      return;
    }
    
    // Add delayed loader when navigating to this page
    setPageLoading(true);
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1500); // 1.5 second delay
    
    return () => clearTimeout(timer);
  }, [credential, navigate]);

  if (!credential) {
    return null;
  }

  const showToast = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleGenerateAndSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Step 1: Generate proof
      const proofData = await apiClient.generateProof(
        credential.credentialHash,
        credential.issuerDid,
        credential.credential
      );
      
      // Show proof generated notification first
      showToast('Proof generated successfully!');
      
      // Wait 2 seconds before submitting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update notification
      setNotificationMessage('Submitting proof for verification...');
      setShowNotification(true);
      
      // Wait 1 second before actual submission
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Automatically submit proof
      const result = await apiClient.submitProof({
        credentialHash: credential.credentialHash,
        proofHash: proofData.proofHash,
        nullifier: proofData.nullifier,
        issuerDID: credential.issuerDid,
        signature: proofData.signature,
      });
      
      // Hide notification
      setShowNotification(false);
      
      // Wait 1 second before showing modal
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmissionResult(result);
      setShowSubmissionModal(true);
    } catch (err) {
      // Hide notification on error
      setShowNotification(false);
      
      const errorMessage = handleApiError(err as Error);
      setError(errorMessage);
      
      // Wait 1 second before showing error modal
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a submission result with error status
      setSubmissionResult({
        status: 'failed',
        message: errorMessage,
        timestamp: new Date().toISOString(),
        proofId: '',
        eligibleTrials: [],
        matchedTrial: { id: '', codeName: '', displayName: '' },
      });
      setShowSubmissionModal(true);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="container">
        <div className="generating-loader">
          <div className="rolling-loader">
            <div className="rolling-spinner"></div>
          </div>
          <h2>Loading...</h2>
          <p>Preparing your proof generation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="proof-page-card">
        <div className="proof-card-header">
          <div className="proof-status-indicator">
            <span className={`status-badge status-${credential.status}`}>
              {credential.status.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="proof-card-body">
          <div className="credential-hash-display">
            <label>Credential Hash</label>
            <div className="hash-value">
              <code>{credential.credentialHash}</code>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="generating-loader">
          <div className="rolling-loader">
            <div className="rolling-spinner"></div>
          </div>
          <h2>Processing Your Proof...</h2>
          <p>Generating and submitting your proof. This may take a few moments.</p>
        </div>
      )}

      {!loading && !submissionResult && (
        <div className="action-section">
          <button 
            onClick={handleGenerateAndSubmit} 
            disabled={credential.status !== 'active' || loading}
            className="btn btn-primary btn-large"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span>Processing...</span>
              </>
            ) : (
              'Prove I Qualify'
            )}
          </button>
          {credential.status !== 'active' && (
            <p className="warning">
              Cannot generate proof: Credential is {credential.status}
            </p>
          )}
        </div>
      )}

      {showNotification && (
        <div className="toast-notification">
          <div className="toast-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" fill="#10b981" opacity="0.2"/>
              <path d="M10 4C6.69 4 4 6.69 4 10s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 9l-3.5-3.5 1.41-1.41L9 10.17l4.09-4.09L14.5 7.5 9 13z" fill="#10b981"/>
            </svg>
          </div>
          <span>{notificationMessage}</span>
        </div>
      )}

      <Modal 
        isOpen={showSubmissionModal} 
        onClose={async () => {
          setShowSubmissionModal(false);
          // Wait a moment before navigating
          await new Promise(resolve => setTimeout(resolve, 300));
          navigate('/');
        }}
        title={submissionResult?.status === 'verified' ? 'Proof Verified Successfully' : 'Submission Failed'}
      >
        {submissionResult?.status === 'verified' ? (
          <div className="submission-success-modal">
            <div className="success-seal-large">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="36" fill="#10b981" opacity="0.2"/>
                <path d="M40 16C26.75 16 16 26.75 16 40s10.75 24 24 24 24-10.75 24-24S53.25 16 40 16zm-2 34l-10-10-2.83 2.83L37.17 54.17l14.66-14.66L54.83 42.5 38 59.33z" fill="#10b981"/>
              </svg>
            </div>
            <h2>{submissionResult.message}</h2>
            <div className="result-details">
              <div className="result-detail-item">
                <span className="result-label">Status</span>
                <span className="result-value status-verified">{submissionResult.status.toUpperCase()}</span>
              </div>
              {submissionResult.txHash && (
                <div className="result-detail-item">
                  <span className="result-label">txHash</span>
                  <code className="result-value">{submissionResult.txHash}</code>
                </div>
              )}
              {submissionResult.eligibleTrials && submissionResult.eligibleTrials.length > 0 && (
                <div className="result-detail-item">
                  <span className="result-label">Eligible Trials</span>
                  <div className="eligible-trials-list">
                    {submissionResult.eligibleTrials.map(trial => (
                      <span key={trial.id} className="trial-badge">{trial.displayName}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="action-buttons">
              <button onClick={async () => {
                setShowSubmissionModal(false);
                // Wait a moment before navigating
                await new Promise(resolve => setTimeout(resolve, 300));
                navigate(`/history/${credential.credentialHash}`);
              }} className="btn btn-primary">
                View Proof History
              </button>
              <button onClick={async () => {
                setShowSubmissionModal(false);
                // Wait a moment before navigating
                await new Promise(resolve => setTimeout(resolve, 300));
                navigate('/');
              }} className="btn btn-outline">
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="submission-error-modal">
            <div className="error-icon">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <circle cx="30" cy="30" r="28" fill="#ef4444" opacity="0.2"/>
                <path d="M30 12C20.06 12 12 20.06 12 30s8.06 18 18 18 18-8.06 18-18S39.94 12 30 12zm3 21l-3 3-3-3-3-3 3-3 3 3 3-3 3 3-3 3z" fill="#ef4444"/>
              </svg>
            </div>
            <h2>Submission Failed</h2>
            <p>{error || submissionResult?.message || 'An error occurred while submitting your proof.'}</p>
            <div className="action-buttons">
              <button onClick={async () => {
                setShowSubmissionModal(false);
                // Wait a moment before navigating
                await new Promise(resolve => setTimeout(resolve, 300));
                navigate('/');
              }} className="btn btn-primary">
                Back to Home
              </button>
            </div>
          </div>
        )}
      </Modal>

      {error && !submissionResult && !loading && (
        <div className="error">{error}</div>
      )}
    </div>
  );
}

