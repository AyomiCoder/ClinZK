import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { handleApiError } from '../../utils/errorHandler';
import { storage } from '../../utils/storage';
import type { IssueCredentialResponse } from '../../types';

const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENOTYPES = ['AA', 'AS', 'SS', 'AC', 'SC', 'CC'];

interface ClinicIssueCredentialFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ClinicLayoutContext {
  clinicName: string | null;
  clinicLoginId: string | null;
  setClinicName: (name: string | null) => void;
}

export default function ClinicIssueCredentialForm({ onSuccess, onCancel }: ClinicIssueCredentialFormProps) {
  const context = useOutletContext<ClinicLayoutContext>() || { 
    clinicName: storage.getClinicName(),
    clinicLoginId: storage.getClinicLoginId()
  };
  const { clinicName, clinicLoginId } = context;
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [genotype, setGenotype] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [patientNumber, setPatientNumber] = useState('');
  const [loginId, setLoginId] = useState(clinicLoginId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [issuedCredential, setIssuedCredential] = useState<IssueCredentialResponse | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    if (!clinicName) {
      setError('Please select a clinic first');
    }
    if (clinicLoginId) {
      setLoginId(clinicLoginId);
    }
  }, [clinicName, clinicLoginId]);

  const showToast = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const addCondition = () => {
    if (newCondition.trim() && !conditions.includes(newCondition.trim())) {
      setConditions([...conditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const removeCondition = (condition: string) => {
    setConditions(conditions.filter(c => c !== condition));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicName) {
      setError('Please select a clinic first');
      return;
    }
    if (!loginId.trim()) {
      setError('Clinic Login ID is required');
      return;
    }
    if (!name.trim() || !dob || !gender || !bloodGroup || !genotype || conditions.length === 0 || !patientNumber.trim()) {
      setError('All fields are required, including at least one condition');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Add delay before submitting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await apiClient.issueCredential({
        name: name.trim(),
        dob,
        gender,
        bloodGroup,
        genotype,
        conditions,
        issuerName: clinicName,
        issuerLoginId: clinicLoginId || loginId.trim(),
        patientNumber: patientNumber.trim(),
      });

      setIssuedCredential(result);
      setSuccess(true);
      showToast('Credential issued successfully!');
      
      // Wait a moment then close
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(handleApiError(err as Error));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Credential hash copied to clipboard!');
  };

  if (success && issuedCredential) {
    return (
      <div className="credential-issue-success">
        <div className="success-seal-large">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="36" fill="#10b981" opacity="0.2"/>
            <path d="M40 16C26.75 16 16 26.75 16 40s10.75 24 24 24 24-10.75 24-24S53.25 16 40 16zm-2 34l-10-10-2.83 2.83L37.17 54.17l14.66-14.66L54.83 42.5 38 59.33z" fill="#10b981"/>
          </svg>
        </div>
        <h2>Credential Issued Successfully!</h2>
        <div className="credential-hash-card">
          <label>Credential Hash</label>
          <div className="hash-display-large">
            <code>{issuedCredential.credentialHash}</code>
            <button 
              onClick={() => copyToClipboard(issuedCredential.credentialHash)}
              className="btn-copy"
              title="Copy hash"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 2.5H11.5C12.0523 2.5 12.5 2.94772 12.5 3.5V9.5M5.5 2.5H3.5C2.94772 2.5 2.5 2.94772 2.5 3.5V11.5C2.5 12.0523 2.94772 12.5 3.5 12.5H9.5C10.0523 12.5 10.5 12.0523 10.5 11.5V9.5M5.5 2.5V6.5C5.5 7.05228 5.94772 7.5 6.5 7.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p className="hash-note">Share this hash with the patient</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        {clinicName && (
          <div className="form-group">
            <label htmlFor="clinic-display">Clinic</label>
            <input
              id="clinic-display"
              type="text"
              value={clinicName}
              disabled
              className="readonly-input"
            />
            <small>This clinic name will be used for issuing the credential</small>
          </div>
        )}

        {clinicLoginId && (
          <div className="form-group">
            <label htmlFor="login-id">Clinic Login ID</label>
            <input
              id="login-id"
              type="text"
              value={loginId}
              disabled
              className="readonly-input"
              style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
            />
            <small>This login ID was validated when you selected your clinic</small>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="patientNumber">Patient Number *</label>
          <input
            id="patientNumber"
            type="text"
            value={patientNumber}
            onChange={(e) => setPatientNumber(e.target.value)}
            placeholder="PAT-12345"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">Patient Name *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dob">Date of Birth *</label>
          <input
            id="dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender *</label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Select Gender</option>
            {GENDERS.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="bloodGroup">Blood Group *</label>
          <select
            id="bloodGroup"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Select Blood Group</option>
            {BLOOD_GROUPS.map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="genotype">Genotype *</label>
          <select
            id="genotype"
            value={genotype}
            onChange={(e) => setGenotype(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Select Genotype</option>
            {GENOTYPES.map(gt => (
              <option key={gt} value={gt}>{gt}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Conditions *</label>
          <div className="tag-input-group">
            <input
              type="text"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCondition();
                }
              }}
              placeholder="Add condition and press Enter"
              disabled={loading}
            />
            <button type="button" onClick={addCondition} className="btn btn-outline" disabled={loading}>
              Add
            </button>
          </div>
          {conditions.length > 0 && (
            <div className="tags-list">
              {conditions.map((condition, idx) => (
                <span key={idx} className="tag">
                  {condition}
                  <button type="button" onClick={() => removeCondition(condition)} className="tag-remove">×</button>
                </span>
              ))}
            </div>
          )}
          <small>At least one condition is required</small>
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
                <div className="rolling-loader">
                  <div className="rolling-spinner"></div>
                </div>
                <span>Issuing...</span>
              </>
            ) : (
              'Issue Credential'
            )}
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
          >
            Cancel
          </button>
        </div>
      </form>
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
    </>
  );
}

