import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { handleApiError } from '../../utils/errorHandler';
import LoadingSpinner from '../../components/LoadingSpinner';

const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENOTYPES = ['AA', 'AS', 'SS', 'AC', 'SC', 'CC'];

export default function AdminCreateTrial() {
  const navigate = useNavigate();
  const [codeName, setCodeName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [minAge, setMinAge] = useState<number | ''>('');
  const [maxAge, setMaxAge] = useState<number | ''>('');
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedBloodGroups, setSelectedBloodGroups] = useState<string[]>([]);
  const [selectedGenotypes, setSelectedGenotypes] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdTrial, setCreatedTrial] = useState<any>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeName.trim() || !displayName.trim()) {
      setError('Code name and display name are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
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

      setCreatedTrial(result);
      setSuccess(true);
    } catch (err) {
      setError(handleApiError(err as Error));
    } finally {
      setLoading(false);
    }
  };

  if (success && createdTrial) {
    return (
      <div className="container">
        <div className="success-message">
          <h2>Trial Created Successfully!</h2>
          <div className="result-details">
            <p><strong>Code Name:</strong> {createdTrial.codeName}</p>
            <p><strong>Display Name:</strong> {createdTrial.displayName}</p>
          </div>
        </div>
        <div className="action-buttons">
          <button 
            onClick={() => {
              setSuccess(false);
              setCreatedTrial(null);
              setCodeName('');
              setDisplayName('');
              setMinAge('');
              setMaxAge('');
              setSelectedGenders([]);
              setSelectedBloodGroups([]);
              setSelectedGenotypes([]);
              setConditions([]);
            }}
            className="btn btn-primary"
          >
            Create Another Trial
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
      <h1>Create Clinical Trial</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="codeName">Code Name *</label>
          <input
            id="codeName"
            type="text"
            value={codeName}
            onChange={(e) => setCodeName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
            placeholder="BLOOD_BANK"
            disabled={loading}
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
            disabled={loading}
            required
          />
        </div>

        <div className="form-section">
          <h3>Requirements (All Optional)</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="minAge">Minimum Age</label>
              <input
                id="minAge"
                type="number"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value === '' ? '' : Number(e.target.value))}
                min="0"
                disabled={loading}
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
                disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
          </div>
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
                <span>Creating...</span>
              </>
            ) : (
              'Create Trial'
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

