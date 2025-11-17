import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { handleApiError } from '../../utils/errorHandler';
import { storage } from '../../utils/storage';
import Modal from '../../components/Modal';
import ClinicIssueCredentialForm from './ClinicIssueCredentialForm';
import type { CredentialListItem } from '../../types';

interface ClinicLayoutContext {
  clinicName: string | null;
  setClinicName: (name: string | null) => void;
}

export default function ClinicCredentials() {
  const { clinicName } = useOutletContext<ClinicLayoutContext>() || { clinicName: storage.getClinicName() };
  const [credentials, setCredentials] = useState<CredentialListItem[]>([]);
  const [filteredCredentials, setFilteredCredentials] = useState<CredentialListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [credentialToRevoke, setCredentialToRevoke] = useState<string | null>(null);

  useEffect(() => {
    if (clinicName) {
      loadCredentials();
    }
  }, [clinicName]);

  useEffect(() => {
    filterCredentials();
  }, [credentials, statusFilter, searchTerm]);

  const loadCredentials = async () => {
    if (!clinicName) {
      setError('Please select a clinic first');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Add delay before fetching
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = await apiClient.getCredentials(clinicName);
      setCredentials(data);
    } catch (err) {
      setError(handleApiError(err as Error));
    } finally {
      setLoading(false);
    }
  };

  const filterCredentials = () => {
    let filtered = [...credentials];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.patientNumber.toLowerCase().includes(term) ||
        c.credentialHash.toLowerCase().includes(term)
      );
    }

    setFilteredCredentials(filtered);
  };

  const handleRevokeClick = (credentialId: string) => {
    setCredentialToRevoke(credentialId);
    setShowRevokeModal(true);
  };

  const handleRevokeConfirm = async () => {
    if (!credentialToRevoke) return;

    setShowRevokeModal(false);
    setRevokingId(credentialToRevoke);
    setError('');
    
    try {
      await apiClient.revokeCredential(credentialToRevoke);
      await loadCredentials();
      setCredentialToRevoke(null);
    } catch (err) {
      setError(handleApiError(err as Error));
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeCancel = () => {
    setShowRevokeModal(false);
    setCredentialToRevoke(null);
  };

  const truncateHash = (hash: string) => {
    if (hash.length <= 20) return hash;
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}`;
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Credentials</h1>
        <button 
          onClick={() => setIsIssueModalOpen(true)}
          className="btn btn-primary"
        >
          Issue New Credential
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="filters">
        <div className="form-group">
          <label htmlFor="status-filter">Filter by Status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="revoked">Revoked</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Patient number or credential hash"
          />
        </div>
      </div>

      {!clinicName ? (
        <div className="empty-state">
          <p>Please select a clinic to view credentials.</p>
        </div>
      ) : loading ? (
        <div className="loading-container">
          <div className="rolling-loader">
            <div className="rolling-spinner"></div>
          </div>
        </div>
      ) : filteredCredentials.length === 0 ? (
        <div className="empty-state">
          {credentials.length === 0 
            ? `No credentials issued yet for ${clinicName}.`
            : 'No credentials match your filters.'}
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Number</th>
                <th>Credential Hash</th>
                <th>Status</th>
                <th>Issued</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCredentials.map((credential) => (
                <tr key={credential.id}>
                  <td><strong>{credential.patientNumber}</strong></td>
                  <td><code>{truncateHash(credential.credentialHash)}</code></td>
                  <td>
                    <span className={`status-badge status-${credential.status}`}>
                      {credential.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(credential.issuedAt).toLocaleDateString()}</td>
                  <td>{new Date(credential.expiry).toLocaleDateString()}</td>
                  <td>
                    {credential.status === 'active' && (
                      <button
                        onClick={() => handleRevokeClick(credential.id)}
                        disabled={revokingId === credential.id}
                        className="btn btn-outline btn-small"
                      >
                        {revokingId === credential.id ? (
                          <>
                            <div className="rolling-loader">
                              <div className="rolling-spinner"></div>
                            </div>
                            <span>Revoking...</span>
                          </>
                        ) : (
                          'Revoke'
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal 
        isOpen={isIssueModalOpen} 
        onClose={() => setIsIssueModalOpen(false)} 
        title="Issue New Credential"
      >
        <ClinicIssueCredentialForm 
          onSuccess={() => {
            setIsIssueModalOpen(false);
            loadCredentials();
          }}
          onCancel={() => setIsIssueModalOpen(false)}
        />
      </Modal>

      <Modal 
        isOpen={showRevokeModal} 
        onClose={handleRevokeCancel} 
        title="Revoke Credential"
      >
        <div className="revoke-confirmation">
          <div className="revoke-warning">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#ef4444" opacity="0.2"/>
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Are you sure you want to revoke this credential?</h3>
          <p>This action cannot be undone.</p>
          <p>The patient will no longer be able to use this credential.</p>
          <div className="action-buttons">
            <button 
              onClick={handleRevokeConfirm}
              className="btn btn-primary"
            >
              Yes, Revoke Credential
            </button>
            <button 
              onClick={handleRevokeCancel}
              className="btn btn-outline"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

