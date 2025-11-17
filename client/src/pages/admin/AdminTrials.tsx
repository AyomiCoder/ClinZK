import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { handleApiError } from '../../utils/errorHandler';
import Modal from '../../components/Modal';
import type { Trial, TrialCreateRequest } from '../../types';

const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENOTYPES = ['AA', 'AS', 'SS', 'AC', 'SC', 'CC'];

export default function AdminTrials() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  
  const [codeName, setCodeName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [minAge, setMinAge] = useState<number | ''>('');
  const [maxAge, setMaxAge] = useState<number | ''>('');
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedBloodGroups, setSelectedBloodGroups] = useState<string[]>([]);
  const [selectedGenotypes, setSelectedGenotypes] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  const [bulkTrials, setBulkTrials] = useState<TrialCreateRequest[]>([
    { codeName: '', displayName: '', requirements: {} }
  ]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [bulkResult, setBulkResult] = useState<any>(null);

  useEffect(() => {
    loadTrials();
  }, []);

  const loadTrials = async () => {
    setLoading(true);
    setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = await apiClient.getTrials();
      setTrials(data);
    } catch (err) {
      setError(handleApiError(err as Error));
    } finally {
      setLoading(false);
    }
  };

  const formatRequirements = (req: Trial['requirements']) => {
    const parts: string[] = [];
    if (req.minAge || req.maxAge) {
      parts.push(`Age: ${req.minAge || 'any'}-${req.maxAge || 'any'}`);
    }
    if (req.genders && req.genders.length > 0) {
      parts.push(`Genders: ${req.genders.join(', ')}`);
    }
    if (req.bloodGroups && req.bloodGroups.length > 0) {
      parts.push(`Blood Groups: ${req.bloodGroups.join(', ')}`);
    }
    if (req.genotypes && req.genotypes.length > 0) {
      parts.push(`Genotypes: ${req.genotypes.join(', ')}`);
    }
    if (req.conditions && req.conditions.length > 0) {
      parts.push(`Conditions: ${req.conditions.join(', ')}`);
    }
    return parts.length > 0 ? parts.join(' | ') : 'No specific requirements';
  };

  const resetCreateForm = () => {
    setCodeName('');
    setDisplayName('');
    setMinAge('');
    setMaxAge('');
    setSelectedGenders([]);
    setSelectedBloodGroups([]);
    setSelectedGenotypes([]);
    setConditions([]);
    setNewCondition('');
    setSubmitError('');
  };

  const showToast = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const resetBulkForm = () => {
    setBulkTrials([{ codeName: '', displayName: '', requirements: {} }]);
    setBulkError('');
    setBulkResult(null);
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    resetCreateForm();
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    resetCreateForm();
  };

  const handleOpenBulkModal = () => {
    setIsBulkModalOpen(true);
    resetBulkForm();
  };

  const handleCloseBulkModal = () => {
    setIsBulkModalOpen(false);
    resetBulkForm();
  };

  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeName.trim() || !displayName.trim()) {
      setSubmitError('Code name and display name are required');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      // Add delay before submitting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const requirements: any = {};
      if (minAge !== '') requirements.minAge = Number(minAge);
      if (maxAge !== '') requirements.maxAge = Number(maxAge);
      if (selectedGenders.length > 0) requirements.genders = selectedGenders;
      if (selectedBloodGroups.length > 0) requirements.bloodGroups = selectedBloodGroups;
      if (selectedGenotypes.length > 0) requirements.genotypes = selectedGenotypes;
      if (conditions.length > 0) requirements.conditions = conditions;

      const result = await apiClient.createTrial({
        codeName: codeName.trim().toUpperCase(),
        displayName: displayName.trim(),
        requirements,
      });

      showToast(`Trial "${result.displayName}" created successfully!`);
      handleCloseCreateModal();
      await loadTrials();
    } catch (err) {
      setSubmitError(handleApiError(err as Error));
    } finally {
      setSubmitting(false);
    }
  };

  const updateBulkTrial = (index: number, field: keyof TrialCreateRequest, value: any) => {
    const updated = [...bulkTrials];
    if (field === 'requirements') {
      updated[index].requirements = { ...updated[index].requirements, ...value };
    } else {
      (updated[index] as any)[field] = value;
    }
    setBulkTrials(updated);
  };

  const addBulkTrial = () => {
    setBulkTrials([...bulkTrials, { codeName: '', displayName: '', requirements: {} }]);
  };

  const removeBulkTrial = (index: number) => {
    if (bulkTrials.length > 1) {
      setBulkTrials(bulkTrials.filter((_, i) => i !== index));
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validTrials = bulkTrials.filter(t => t.codeName.trim() && t.displayName.trim());
    if (validTrials.length === 0) {
      setBulkError('At least one valid trial is required');
      return;
    }

    setBulkSubmitting(true);
    setBulkError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const formattedTrials = validTrials.map(t => ({
        codeName: t.codeName.trim().toUpperCase().replace(/[^A-Z0-9_]/g, ''),
        displayName: t.displayName.trim(),
        requirements: t.requirements,
      }));

      const response = await apiClient.createTrialsBulk(formattedTrials);
      setBulkResult(response);
      await loadTrials();
    } catch (err) {
      setBulkError(handleApiError(err as Error));
    } finally {
      setBulkSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Clinical Trials</h1>
        <div className="header-actions">
          <button 
            onClick={handleOpenCreateModal}
            className="btn btn-primary"
          >
            Create Trial
          </button>
          <button 
            onClick={handleOpenBulkModal}
            className="btn btn-secondary"
          >
            Create Bulk
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="rolling-loader">
            <div className="rolling-spinner"></div>
          </div>
        </div>
      ) : trials.length === 0 ? (
        <div className="empty-state">
          <p>No trials created yet.</p>
          <button 
            onClick={handleOpenCreateModal}
            className="btn btn-primary"
          >
            Create First Trial
          </button>
        </div>
      ) : (
        <div className="trials-list">
          {trials.map((trial) => (
            <div key={trial.id} className="trial-card">
              <div className="trial-header">
                <div>
                  <h3>{trial.displayName}</h3>
                </div>
                <span className={`status-badge ${trial.isActive !== false ? 'status-active' : 'status-revoked'}`}>
                  {trial.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="trial-requirements">
                <strong>Requirements:</strong> {formatRequirements(trial.requirements)}
              </div>
              <div className="trial-footer">
                <span className="date">Created: {new Date(trial.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} title="Create Clinical Trial">
        <form onSubmit={handleCreateSubmit} className="trial-create-form">
            <div className="form-group">
              <label htmlFor="codeName">Code Name *</label>
              <input
                id="codeName"
                type="text"
                value={codeName}
                onChange={(e) => setCodeName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                placeholder="BLOOD_BANK"
                disabled={submitting}
                required
              />
              <small>Uppercase letters, numbers, and underscores only</small>
            </div>

            <div className="form-group">
              <label htmlFor="displayName">Display Name *</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Blood Bank Trial"
                disabled={submitting}
                required
              />
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Requirements (All Optional)</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="minAge">Minimum Age</label>
                  <input
                    id="minAge"
                    type="number"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value === '' ? '' : Number(e.target.value))}
                    min="0"
                    disabled={submitting}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="maxAge">Maximum Age</label>
                  <input
                    id="maxAge"
                    type="number"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value === '' ? '' : Number(e.target.value))}
                    min="0"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Genders</label>
                <div className="checkbox-group">
                  {GENDERS.map(gender => (
                    <label key={gender} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedGenders.includes(gender)}
                        onChange={() => toggleArrayItem(selectedGenders, gender, setSelectedGenders)}
                        disabled={submitting}
                      />
                      {gender}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Blood Groups</label>
                <div className="checkbox-group">
                  {BLOOD_GROUPS.map(bg => (
                    <label key={bg} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedBloodGroups.includes(bg)}
                        onChange={() => toggleArrayItem(selectedBloodGroups, bg, setSelectedBloodGroups)}
                        disabled={submitting}
                      />
                      {bg}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Genotypes</label>
                <div className="checkbox-group">
                  {GENOTYPES.map(gt => (
                    <label key={gt} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedGenotypes.includes(gt)}
                        onChange={() => toggleArrayItem(selectedGenotypes, gt, setSelectedGenotypes)}
                        disabled={submitting}
                      />
                      {gt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Conditions</label>
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
                    disabled={submitting}
                  />
                  <button type="button" onClick={addCondition} className="btn btn-outline" disabled={submitting}>
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
              </div>
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
                    <span>Creating...</span>
                  </>
                ) : (
                  'Create Trial'
                )}
              </button>
              <button 
                type="button"
                onClick={handleCloseCreateModal}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
      </Modal>

      <Modal isOpen={isBulkModalOpen} onClose={handleCloseBulkModal} title="Create Trials (Bulk)">
        {bulkResult ? (
          <div>
            <div className="result-summary">
              <h3>Summary</h3>
              <p><strong>Total:</strong> {bulkResult.summary.total}</p>
              <p><strong>Successful:</strong> <span className="success">{bulkResult.summary.successful}</span></p>
              <p><strong>Failed:</strong> <span className="error">{bulkResult.summary.failed}</span></p>
            </div>

            {bulkResult.created.length > 0 && (
              <div className="success-message">
                <h3>Successfully Created ({bulkResult.created.length})</h3>
                <ul>
                  {bulkResult.created.map((trial: any, idx: number) => (
                    <li key={idx}>
                      <strong>{trial.displayName}</strong> ({trial.codeName})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {bulkResult.errors.length > 0 && (
              <div className="error">
                <h3>Failed ({bulkResult.errors.length})</h3>
                <ul>
                  {bulkResult.errors.map((err: any, idx: number) => (
                    <li key={idx}>
                      <strong>{err.codeName}:</strong> {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="action-buttons">
              <button onClick={resetBulkForm} className="btn btn-primary">
                Create More
              </button>
              <button onClick={handleCloseBulkModal} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBulkSubmit}>
            <div className="modal-scrollable">
              {bulkTrials.map((trial, index) => (
                <div key={index} className="bulk-trial-entry">
                  <div className="bulk-entry-header">
                    <h3>Trial {index + 1}</h3>
                    {bulkTrials.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeBulkTrial(index)}
                        className="btn btn-outline"
                        disabled={bulkSubmitting}
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
                      onChange={(e) => updateBulkTrial(index, 'codeName', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                      placeholder="BLOOD_BANK"
                      disabled={bulkSubmitting}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Display Name *</label>
                    <input
                      type="text"
                      value={trial.displayName}
                      onChange={(e) => updateBulkTrial(index, 'displayName', e.target.value)}
                      placeholder="Blood Bank Trial"
                      disabled={bulkSubmitting}
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
                        updateBulkTrial(index, 'requirements', { conditions });
                      }}
                      placeholder="Anemia, Blood Disorder"
                      disabled={bulkSubmitting}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Min Age</label>
                      <input
                        type="number"
                        value={trial.requirements.minAge || ''}
                        onChange={(e) => updateBulkTrial(index, 'requirements', { 
                          minAge: e.target.value ? Number(e.target.value) : undefined 
                        })}
                        disabled={bulkSubmitting}
                      />
                    </div>
                    <div className="form-group">
                      <label>Max Age</label>
                      <input
                        type="number"
                        value={trial.requirements.maxAge || ''}
                        onChange={(e) => updateBulkTrial(index, 'requirements', { 
                          maxAge: e.target.value ? Number(e.target.value) : undefined 
                        })}
                        disabled={bulkSubmitting}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="button"
              onClick={addBulkTrial}
              className="btn btn-outline"
              disabled={bulkSubmitting}
            >
              + Add Another Trial
            </button>

            {bulkError && <div className="error">{bulkError}</div>}

            <div className="action-buttons">
              <button 
                type="submit" 
                disabled={bulkSubmitting}
                className="btn btn-primary btn-large"
              >
                {bulkSubmitting ? (
                  <>
                    <div className="rolling-loader">
                      <div className="rolling-spinner"></div>
                    </div>
                    <span>Creating...</span>
                  </>
                ) : (
                  'Create All Trials'
                )}
              </button>
              <button 
                type="button"
                onClick={handleCloseBulkModal}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>

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
    </div>
  );
}

