import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { handleApiError } from '../../utils/errorHandler';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { IssueCredentialResponse } from '../../types';

const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENOTYPES = ['AA', 'AS', 'SS', 'AC', 'SC', 'CC'];

export default function ClinicIssueCredential() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [genotype, setGenotype] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [patientNumber, setPatientNumber] = useState('');
  const [issuerId, setIssuerId] = useState('');
  const [issuers, setIssuers] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [issuedCredential, setIssuedCredential] = useState<IssueCredentialResponse | null>(null);

  useEffect(() => {
    loadIssuers();
  }, []);

  const loadIssuers = async () => {
    try {
      const data = await apiClient.getIssuerNames();
      setIssuers(data);
      if (data.length === 1) {
        setIssuerId(data[0].id);
      }
    } catch (err) {
      setError(handleApiError(err as Error));
    }
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
    if (!name.trim() || !dob || !gender || !bloodGroup || !genotype || conditions.length === 0 || !patientNumber.trim()) {
      setError('All fields are required, including at least one condition');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await apiClient.issueCredential({
        name: name.trim(),
        dob,
        gender,
        bloodGroup,
        genotype,
        conditions,
        issuerId: issuerId || undefined,
        patientNumber: patientNumber.trim(),
      });

      setIssuedCredential(result);
      setSuccess(true);
    } catch (err) {
      setError(handleApiError(err as Error));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (success && issuedCredential) {
    return (
      <div className="container">
        <div className="success-message">
          <h2>Credential Issued Successfully!</h2>
          <div className="result-details">
            <p><strong>Issuer:</strong> {issuedCredential.issuerName}</p>
            <p><strong>Patient Number:</strong> {issuedCredential.patientNumber}</p>
            <p><strong>Patient Name:</strong> {issuedCredential.credential.claims.name}</p>
            <p><strong>Age:</strong> {issuedCredential.credential.claims.age}</p>
            <p><strong>Gender:</strong> {issuedCredential.credential.claims.gender}</p>
            <p><strong>Blood Group:</strong> {issuedCredential.credential.claims.bloodGroup}</p>
            <p><strong>Genotype:</strong> {issuedCredential.credential.claims.genotype}</p>
            <p><strong>Conditions:</strong> {issuedCredential.credential.claims.conditions.join(', ')}</p>
            <p><strong>Issued:</strong> {new Date(issuedCredential.credential.issuedAt).toLocaleString()}</p>
            <p><strong>Expires:</strong> {new Date(issuedCredential.credential.expiry).toLocaleString()}</p>
            <div className="credential-hash-section">
              <p><strong>Credential Hash (IMPORTANT - Share with patient):</strong></p>
              <div className="hash-display">
                <code>{issuedCredential.credentialHash}</code>
                <button 
                  onClick={() => copyToClipboard(issuedCredential.credentialHash)}
                  className="btn btn-outline"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="action-buttons">
          <button 
            onClick={() => {
              setSuccess(false);
              setIssuedCredential(null);
              setName('');
              setDob('');
              setGender('');
              setBloodGroup('');
              setGenotype('');
              setConditions([]);
              setPatientNumber('');
            }}
            className="btn btn-primary"
          >
            Issue Another Credential
          </button>
          <button 
            onClick={() => navigate('/clinic/credentials')}
            className="btn btn-secondary"
          >
            View All Credentials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Issue Credential to Patient</h1>
      
      <form onSubmit={handleSubmit}>
        {issuers.length > 1 && (
          <div className="form-group">
            <label htmlFor="issuer">Select Issuer</label>
            <select
              id="issuer"
              value={issuerId}
              onChange={(e) => setIssuerId(e.target.value)}
              disabled={loading}
            >
              <option value="">Select Issuer</option>
              {issuers.map(issuer => (
                <option key={issuer.id} value={issuer.id}>
                  {issuer.name}
                </option>
              ))}
            </select>
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
                <LoadingSpinner size="small" />
                <span>Issuing...</span>
              </>
            ) : (
              'Issue Credential'
            )}
          </button>
          <button 
            type="button"
            onClick={() => navigate('/clinic/credentials')}
            className="btn btn-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

