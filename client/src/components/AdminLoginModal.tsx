import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { handleApiError } from '../utils/errorHandler';
import Modal from './Modal';

interface AdminLoginModalProps {
  isOpen: boolean;
  onValidate: (hash: string) => void;
  onCancel?: () => void;
}

export default function AdminLoginModal({ isOpen, onValidate, onCancel }: AdminLoginModalProps) {
  const [accessHash, setAccessHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAccessHash('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessHash.trim()) {
      setError('Please enter an access hash');
      return;
    }

    if (accessHash.trim().length !== 16) {
      setError('Access hash must be exactly 16 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await apiClient.verifyAdminHash(accessHash.trim());
      
      if (result.valid) {
        onValidate(accessHash.trim());
      } else {
        setError('Invalid access hash');
      }
    } catch (err) {
      const errorMessage = handleApiError(err as Error);
      if (errorMessage.includes('Invalid') || errorMessage.includes('Unauthorized')) {
        setError('Invalid access hash');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onCancel || (() => {})} 
      title="Admin Access"
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="admin-hash">Enter Admin Access Hash *</label>
          <input
            id="admin-hash"
            type="text"
            value={accessHash}
            onChange={(e) => {
              setAccessHash(e.target.value);
              setError('');
            }}
            placeholder="Enter 16-character hash"
            disabled={loading}
            required
            autoFocus
            maxLength={16}
            style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
          />
          <small>Enter your 16-character admin access hash</small>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="action-buttons">
          <button 
            type="submit" 
            disabled={loading || !accessHash.trim() || accessHash.trim().length !== 16}
            className="btn btn-primary btn-large"
          >
            {loading ? (
              <>
                <div className="rolling-loader">
                  <div className="rolling-spinner"></div>
                </div>
                <span>Verifying...</span>
              </>
            ) : (
              'Access Admin Panel'
            )}
          </button>
          {onCancel && (
            <button 
              type="button"
              onClick={onCancel}
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

