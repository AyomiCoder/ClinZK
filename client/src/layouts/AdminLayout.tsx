import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminLoginModal from '../components/AdminLoginModal';
import { apiClient } from '../api/client';
import { storage } from '../utils/storage';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [adminHash, setAdminHash] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const savedHash = storage.getAdminHash();
      if (savedHash) {
        try {
          apiClient.setAdminHash(savedHash);
          const result = await apiClient.verifyAdminHash(savedHash);
          if (result.valid) {
            setAdminHash(savedHash);
            setShowLoginModal(false);
          } else {
            storage.clearAdminHash();
            apiClient.setAdminHash(null);
            setAdminHash(null);
            setShowLoginModal(true);
          }
        } catch (err) {
          storage.clearAdminHash();
          apiClient.setAdminHash(null);
          setAdminHash(null);
          setShowLoginModal(true);
        }
      } else {
        setShowLoginModal(true);
      }
      setIsVerifying(false);
    };
    checkAdminAccess();

    const handleHashInvalid = () => {
      setAdminHash(null);
      setShowLoginModal(true);
    };

    window.addEventListener('adminHashInvalid', handleHashInvalid);
    return () => {
      window.removeEventListener('adminHashInvalid', handleHashInvalid);
    };
  }, []);

  const handleValidate = (hash: string) => {
    storage.saveAdminHash(hash);
    apiClient.setAdminHash(hash);
    setAdminHash(hash);
    setShowLoginModal(false);
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (isVerifying) {
    return (
      <div className="admin-layout">
        <div className="loading-container">
          <div className="rolling-loader">
            <div className="rolling-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!adminHash) {
    return (
      <div className="admin-layout">
        <AdminLoginModal 
          isOpen={showLoginModal} 
          onValidate={handleValidate}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <Outlet />
      </main>
      <AdminLoginModal 
        isOpen={showLoginModal} 
        onValidate={handleValidate}
        onCancel={handleCancel}
      />
    </div>
  );
}

