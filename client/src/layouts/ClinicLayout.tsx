import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ClinicSidebar from '../components/ClinicSidebar';
import ClinicNameModal from '../components/ClinicNameModal';
import { storage } from '../utils/storage';

export default function ClinicLayout() {
  const [clinicName, setClinicName] = useState<string | null>(null);
  const [clinicLoginId, setClinicLoginId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isChangingClinic, setIsChangingClinic] = useState(false);

  useEffect(() => {
    const savedClinicName = storage.getClinicName();
    const savedLoginId = storage.getClinicLoginId();
    if (savedClinicName && savedLoginId) {
      setClinicName(savedClinicName);
      setClinicLoginId(savedLoginId);
      setShowModal(false);
    } else {
      setShowModal(true);
    }
  }, []);

  const handleValidate = (name: string, loginId: string) => {
    storage.saveClinicName(name);
    storage.saveClinicLoginId(loginId);
    setClinicName(name);
    setClinicLoginId(loginId);
    setShowModal(false);
    setIsChangingClinic(false);
  };

  const handleChangeClinic = () => {
    setIsChangingClinic(true);
    setShowModal(true);
  };

  const handleCancelModal = () => {
    if (isChangingClinic) {
      setShowModal(false);
      setIsChangingClinic(false);
    } else {
      window.history.back();
    }
  };

  return (
    <div className="clinic-layout">
      <ClinicSidebar />
      <main className="clinic-main">
        {clinicName && (
          <div className="clinic-badge-container">
            <div className="clinic-badge">
              <span className="clinic-badge-icon">🏥</span>
              <span className="clinic-badge-name">{clinicName}</span>
              <button 
                onClick={handleChangeClinic}
                className="clinic-badge-change"
                title="Change Clinic"
              >
                Change
              </button>
            </div>
          </div>
        )}
        <Outlet context={{ clinicName, clinicLoginId, setClinicName }} />
      </main>
      <ClinicNameModal 
        isOpen={showModal} 
        onValidate={handleValidate}
        onCancel={handleCancelModal}
        showCloseButton={isChangingClinic}
        initialClinicName={isChangingClinic ? (clinicName ?? undefined) : undefined}
        initialLoginId={isChangingClinic ? (clinicLoginId ?? undefined) : undefined}
      />
    </div>
  );
}

