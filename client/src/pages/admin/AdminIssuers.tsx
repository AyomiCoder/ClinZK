import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { handleApiError } from '../../utils/errorHandler';
import Modal from '../../components/Modal';
import type { IssuerFull } from '../../types';

export default function AdminIssuers() {
  const [issuers, setIssuers] = useState<IssuerFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [createdLoginId, setCreatedLoginId] = useState<string | null>(null);
  const [showLoginIdModal, setShowLoginIdModal] = useState(false);

  useEffect(() => {
    loadIssuers();
  }, []);

  const showToast = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const loadIssuers = async () => {
    setLoading(true);
    setError('');
    try {
      // Add delay before fetching
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = await apiClient.getIssuers();
      setIssuers(data);
    } catch (err) {
      setError(handleApiError(err as Error));
    } finally {
      setLoading(false);
    }
  };

  const truncateKey = (key: string) => {
    if (key.length <= 20) return key;
    return `${key.substring(0, 10)}...${key.substring(key.length - 10)}`;
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setName('');
    setSubmitError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setName('');
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setSubmitError('Clinic name is required');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      // Add delay before submitting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await apiClient.registerIssuer(name.trim());
      
      // Show login ID modal
      setCreatedLoginId(result.loginId);
      setShowLoginIdModal(true);
      
      // Close form modal
      handleCloseModal();
      
      // Reload issuers
      await loadIssuers();
    } catch (err) {
      setSubmitError(handleApiError(err as Error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Issuers</h1>
        <button 
          onClick={handleOpenModal}
          className="btn btn-primary"
        >
          Add New Issuer
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="rolling-loader">
            <div className="rolling-spinner"></div>
          </div>
        </div>
      ) : issuers.length === 0 ? (
        <div className="empty-state">
          <p>No issuers registered yet.</p>
          <button 
            onClick={handleOpenModal}
            className="btn btn-primary"
          >
            Add First Issuer
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Login ID</th>
                <th>DID</th>
                <th>Public Key</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {issuers.map((issuer) => (
                <tr key={issuer.id}>
                  <td><strong>{issuer.name}</strong></td>
                  <td>
                    {issuer.loginId ? (
                      <code className="login-id-cell">
                        {issuer.loginId}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(issuer.loginId!);
                            showToast('Login ID copied to clipboard!');
                          }}
                          className="btn-copy-small"
                          title="Copy Login ID"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.5 2.5H11.5C12.0523 2.5 12.5 2.94772 12.5 3.5V9.5M5.5 2.5H3.5C2.94772 2.5 2.5 2.94772 2.5 3.5V11.5C2.5 12.0523 2.94772 12.5 3.5 12.5H9.5C10.0523 12.5 10.5 12.0523 10.5 11.5V9.5M5.5 2.5V6.5C5.5 7.05228 5.94772 7.5 6.5 7.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </code>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td><code>{issuer.did}</code></td>
                  <td><code>{truncateKey(issuer.publicKey)}</code></td>
                  <td>
                    <span className={`status-badge ${issuer.isActive ? 'status-active' : 'status-revoked'}`}>
                      {issuer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(issuer.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add New Issuer">
        <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Clinic Name *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="City General Hospital"
                disabled={submitting}
                required
              />
            </div>

            {submitError && <div className="error">{submitError}</div>}

            <div className="action-buttons">
              <button 
                type="submit" 
                disabled={submitting}
                className="btn btn-primary btn-large"
              >
                {submitting ? (
                  <>
                    <div className="rolling-loader">
                      <div className="rolling-spinner"></div>
                    </div>
                    <span>Registering...</span>
                  </>
                ) : (
                  'Register Clinic'
                )}
              </button>
              <button 
                type="button"
                onClick={handleCloseModal}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
      </Modal>

      <Modal 
        isOpen={showLoginIdModal} 
        onClose={() => {
          setShowLoginIdModal(false);
          setCreatedLoginId(null);
        }} 
        title="Issuer Created Successfully"
      >
        <div className="login-id-display">
          <div className="success-seal-large">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="36" fill="#10b981" opacity="0.2"/>
              <path d="M40 16C26.75 16 16 26.75 16 40s10.75 24 24 24 24-10.75 24-24S53.25 16 40 16zm-2 34l-10-10-2.83 2.83L37.17 54.17l14.66-14.66L54.83 42.5 38 59.33z" fill="#10b981"/>
            </svg>
          </div>
          <h3>Save This Login ID</h3>
          <p className="login-id-warning">
            Share this Login ID securely with the clinic. They will need it to issue credentials.
          </p>
          <div className="login-id-card">
            <label>Clinic Login ID</label>
            <div className="login-id-display-box">
              <code>{createdLoginId}</code>
              <button
                onClick={() => {
                  if (createdLoginId) {
                    navigator.clipboard.writeText(createdLoginId);
                    showToast('Login ID copied to clipboard!');
                  }
                }}
                className="btn-copy"
                title="Copy Login ID"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.5 2.5H11.5C12.0523 2.5 12.5 2.94772 12.5 3.5V9.5M5.5 2.5H3.5C2.94772 2.5 2.5 2.94772 2.5 3.5V11.5C2.5 12.0523 2.94772 12.5 3.5 12.5H9.5C10.0523 12.5 10.5 12.0523 10.5 11.5V9.5M5.5 2.5V6.5C5.5 7.05228 5.94772 7.5 6.5 7.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="action-buttons">
            <button
              onClick={() => {
                setShowLoginIdModal(false);
                setCreatedLoginId(null);
              }}
              className="btn btn-primary"
            >
              Got It
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

