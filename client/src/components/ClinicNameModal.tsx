import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../api/client';
import { handleApiError } from '../utils/errorHandler';
import Modal from './Modal';

interface ClinicNameModalProps {
  isOpen: boolean;
  onValidate: (clinicName: string, loginId: string) => void;
  onCancel?: () => void;
  showCloseButton?: boolean;
  initialClinicName?: string;
  initialLoginId?: string;
}

export default function ClinicNameModal({ isOpen, onValidate, onCancel, showCloseButton = false, initialClinicName, initialLoginId }: ClinicNameModalProps) {
  const [loginId, setLoginId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [issuers, setIssuers] = useState<Array<{ id: string; name: string; loginId?: string }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIssuer, setSelectedIssuer] = useState<{ id: string; name: string; loginId?: string } | null>(null);
  const [validatingLoginId, setValidatingLoginId] = useState(false);
  const [loginIdValid, setLoginIdValid] = useState<boolean | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      setValidatingLoginId(false);
      if (initialClinicName && initialLoginId) {
        setSearchTerm(initialClinicName);
        setLoginId(initialLoginId);
        setError('');
        setShowDropdown(false);
      } else {
        setLoginId('');
        setSearchTerm('');
        setError('');
        setSelectedIssuer(null);
        setShowDropdown(false);
      }
      setLoginIdValid(null);
      loadIssuers();
    }
  }, [isOpen, initialClinicName, initialLoginId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const loadIssuers = async () => {
    try {
      const data = await apiClient.getIssuerNames();
      setIssuers(data);
      
      if (initialClinicName && data.length > 0) {
        const matchedIssuer = data.find(issuer => 
          issuer.name.toLowerCase() === initialClinicName.toLowerCase()
        );
        if (matchedIssuer) {
          setSelectedIssuer(matchedIssuer);
        }
      }
    } catch (err) {
      setError('Failed to load clinic list');
    }
  };

  const filteredIssuers = issuers.filter(issuer => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return issuer.name.toLowerCase().includes(term) || 
           (issuer.loginId && issuer.loginId.toLowerCase().includes(term));
  });

  const handleSelectIssuer = (issuer: { id: string; name: string; loginId?: string }) => {
    setSelectedIssuer(issuer);
    setLoginId('');
    setSearchTerm(issuer.name);
    setShowDropdown(false);
    setError('');
    setLoginIdValid(null);
  };

  const handleVerifyLoginId = async (loginIdValue: string) => {
    if (!selectedIssuer || !loginIdValue.trim()) {
      setLoginIdValid(null);
      return;
    }

    setValidatingLoginId(true);
    setError('');
    setLoginIdValid(null);

    try {
      await apiClient.verifyLoginId(selectedIssuer.name, loginIdValue.trim());
      setLoginIdValid(true);
    } catch (err) {
      const errorMessage = handleApiError(err as Error);
      setLoginIdValid(false);
      if (errorMessage.includes('not found')) {
        setError(errorMessage);
      }
    } finally {
      setValidatingLoginId(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssuer) {
      setError('Please select a clinic from the list');
      return;
    }
    if (!loginId.trim()) {
      setError('Please enter a clinic login ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        await apiClient.verifyLoginId(selectedIssuer.name, loginId.trim());
        onValidate(selectedIssuer.name, loginId.trim());
      } catch (verifyErr) {
        const errorMessage = handleApiError(verifyErr as Error);
        setError(errorMessage);
        setLoginIdValid(false);
        setLoading(false);
      }
    } catch (err) {
      const errorMessage = handleApiError(err as Error);
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onCancel || (() => {})} 
      title="Select Your Clinic"
      showCloseButton={showCloseButton}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="clinic-search">Select Clinic *</label>
          <div className="searchable-dropdown" ref={dropdownRef}>
            <input
              id="clinic-search"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                setShowDropdown(true);
                setError('');
                
                if (!value.trim()) {
                  setSelectedIssuer(null);
                  setLoginId('');
                }
              }}
              onFocus={() => {
                if (issuers.length > 0) {
                  setShowDropdown(true);
                }
              }}
              placeholder="Search or select a clinic..."
              disabled={loading}
              required
              autoFocus
            />
            {showDropdown && !searchTerm.trim() && issuers.length > 0 && (
              <div className="dropdown-list">
                {issuers.slice(0, 10).map((issuer) => (
                  <button
                    key={issuer.id}
                    type="button"
                    onClick={() => handleSelectIssuer(issuer)}
                    className={`dropdown-item ${selectedIssuer?.id === issuer.id ? 'selected' : ''}`}
                  >
                    <div className="dropdown-item-name">{issuer.name}</div>
                    {issuer.loginId && (
                      <div className="dropdown-item-login-id">{issuer.loginId}</div>
                    )}
                  </button>
                ))}
                {issuers.length > 10 && (
                  <div className="dropdown-empty" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                    Type to search {issuers.length} clinics...
                  </div>
                )}
              </div>
            )}
            {showDropdown && searchTerm.trim() && filteredIssuers.length > 0 && (
              <div className="dropdown-list">
                {filteredIssuers.map((issuer) => (
                  <button
                    key={issuer.id}
                    type="button"
                    onClick={() => handleSelectIssuer(issuer)}
                    className={`dropdown-item ${selectedIssuer?.id === issuer.id ? 'selected' : ''}`}
                  >
                    <div className="dropdown-item-name">{issuer.name}</div>
                    {issuer.loginId && (
                      <div className="dropdown-item-login-id">{issuer.loginId}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
            {showDropdown && searchTerm.trim() && filteredIssuers.length === 0 && (
              <div className="dropdown-list">
                <div className="dropdown-empty">No clinics found matching "{searchTerm}"</div>
              </div>
            )}
          </div>
          <small>Search and select your registered clinic from the list</small>
        </div>

        <div className="form-group">
          <label htmlFor="login-id">Clinic Login ID *</label>
          <div style={{ position: 'relative' }}>
            <input
              id="login-id"
              type="text"
              value={loginId}
              onChange={(e) => {
                setLoginId(e.target.value);
                setError('');
                setLoginIdValid(null);
              }}
              onBlur={() => {
                if (loginId.trim() && selectedIssuer) {
                  handleVerifyLoginId(loginId);
                }
              }}
              placeholder="e.g., CITY-A1B2C3D4"
              disabled={loading}
              required
              style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
              className={loginIdValid === true ? 'input-valid' : loginIdValid === false ? 'input-invalid' : ''}
            />
            {validatingLoginId && (
              <div className="rolling-loader" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px' }}>
                <div className="rolling-spinner"></div>
              </div>
            )}
            {loginIdValid === true && !validatingLoginId && (
              <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#10b981', fontSize: '1.2rem' }}>✓</div>
            )}
            {loginIdValid === false && !validatingLoginId && (
              <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ef4444', fontSize: '1.2rem' }}>✗</div>
            )}
          </div>
          <small>Enter the login ID provided by your admin</small>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="action-buttons">
          <button 
            type="submit" 
            disabled={loading || !selectedIssuer || !loginId.trim()}
            className="btn btn-primary btn-large"
          >
            {loading ? (
              <>
                <div className="rolling-loader">
                  <div className="rolling-spinner"></div>
                </div>
                <span>Validating...</span>
              </>
            ) : (
              'Continue'
            )}
          </button>
          {(onCancel || showCloseButton) && (
            <button 
              type="button"
              onClick={onCancel || (() => {})}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}

