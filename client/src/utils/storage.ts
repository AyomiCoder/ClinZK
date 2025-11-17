const STORAGE_KEYS = {
  CREDENTIAL_HASH: 'clinz_credential_hash',
  ISSUER_NAME: 'clinz_issuer_name',
  PATIENT_NUMBER: 'clinz_patient_number',
  CLINIC_NAME: 'clinz_clinic_name',
  CLINIC_LOGIN_ID: 'clinz_clinic_login_id',
  CLINIC_NAME_TIMESTAMP: 'clinz_clinic_name_timestamp',
  CLINIC_LOGIN_ID_TIMESTAMP: 'clinz_clinic_login_id_timestamp',
  ADMIN_HASH_TIMESTAMP: 'clinz_admin_hash_timestamp',
};

const ONE_HOUR_MS = 60 * 60 * 1000;

export const storage = {
  saveCredentialHash: (hash: string) => {
    localStorage.setItem(STORAGE_KEYS.CREDENTIAL_HASH, hash);
  },

  getCredentialHash: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.CREDENTIAL_HASH);
  },

  saveRetrievalInfo: (issuerName: string, patientNumber: string) => {
    localStorage.setItem(STORAGE_KEYS.ISSUER_NAME, issuerName);
    localStorage.setItem(STORAGE_KEYS.PATIENT_NUMBER, patientNumber);
  },

  getRetrievalInfo: () => {
    return {
      issuerName: localStorage.getItem(STORAGE_KEYS.ISSUER_NAME),
      patientNumber: localStorage.getItem(STORAGE_KEYS.PATIENT_NUMBER),
    };
  },

  saveClinicName: (name: string) => {
    const timestamp = Date.now();
    localStorage.setItem(STORAGE_KEYS.CLINIC_NAME, name);
    localStorage.setItem(STORAGE_KEYS.CLINIC_NAME_TIMESTAMP, timestamp.toString());
  },

  getClinicName: (): string | null => {
    const name = localStorage.getItem(STORAGE_KEYS.CLINIC_NAME);
    const timestamp = localStorage.getItem(STORAGE_KEYS.CLINIC_NAME_TIMESTAMP);
    
    if (!name || !timestamp) {
      return null;
    }
    
    const savedTime = parseInt(timestamp, 10);
    const now = Date.now();
    
    if (now - savedTime > ONE_HOUR_MS) {
      localStorage.removeItem(STORAGE_KEYS.CLINIC_NAME);
      localStorage.removeItem(STORAGE_KEYS.CLINIC_NAME_TIMESTAMP);
      return null;
    }
    
    return name;
  },

  saveClinicLoginId: (loginId: string) => {
    const timestamp = Date.now();
    localStorage.setItem(STORAGE_KEYS.CLINIC_LOGIN_ID, loginId);
    localStorage.setItem(STORAGE_KEYS.CLINIC_LOGIN_ID_TIMESTAMP, timestamp.toString());
  },

  getClinicLoginId: (): string | null => {
    const loginId = localStorage.getItem(STORAGE_KEYS.CLINIC_LOGIN_ID);
    const timestamp = localStorage.getItem(STORAGE_KEYS.CLINIC_LOGIN_ID_TIMESTAMP);
    
    if (!loginId || !timestamp) {
      return null;
    }
    
    const savedTime = parseInt(timestamp, 10);
    const now = Date.now();
    
    if (now - savedTime > ONE_HOUR_MS) {
      localStorage.removeItem(STORAGE_KEYS.CLINIC_LOGIN_ID);
      localStorage.removeItem(STORAGE_KEYS.CLINIC_LOGIN_ID_TIMESTAMP);
      return null;
    }
    
    return loginId;
  },

  clearClinicName: () => {
    localStorage.removeItem(STORAGE_KEYS.CLINIC_NAME);
    localStorage.removeItem(STORAGE_KEYS.CLINIC_LOGIN_ID);
    localStorage.removeItem(STORAGE_KEYS.CLINIC_NAME_TIMESTAMP);
    localStorage.removeItem(STORAGE_KEYS.CLINIC_LOGIN_ID_TIMESTAMP);
  },

  saveAdminHash: (hash: string) => {
    const timestamp = Date.now();
    sessionStorage.setItem('adminAccessHash', hash);
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_HASH_TIMESTAMP, timestamp.toString());
  },

  getAdminHash: (): string | null => {
    const hash = sessionStorage.getItem('adminAccessHash');
    const timestamp = sessionStorage.getItem(STORAGE_KEYS.ADMIN_HASH_TIMESTAMP);
    
    if (!hash || !timestamp) {
      return null;
    }
    
    const savedTime = parseInt(timestamp, 10);
    const now = Date.now();
    
    if (now - savedTime > ONE_HOUR_MS) {
      sessionStorage.removeItem('adminAccessHash');
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_HASH_TIMESTAMP);
      return null;
    }
    
    return hash;
  },

  clearAdminHash: () => {
    sessionStorage.removeItem('adminAccessHash');
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_HASH_TIMESTAMP);
  },

  clear: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    sessionStorage.removeItem('adminAccessHash');
  },
};

