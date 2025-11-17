const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

class ApiClient {
  private adminHash: string | null = null;

  setAdminHash(hash: string | null) {
    this.adminHash = hash;
  }

  getAdminHash(): string | null {
    return this.adminHash;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAdmin: boolean = false
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (requireAdmin && this.adminHash) {
      headers['X-Admin-Hash'] = this.adminHash;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = data;
      if (response.status === 401 && requireAdmin) {
        this.adminHash = null;
        if (typeof window !== 'undefined') {
          const { storage } = await import('../utils/storage');
          storage.clearAdminHash();
          window.dispatchEvent(new CustomEvent('adminHashInvalid'));
        }
      }
      throw new Error(error.message || 'An error occurred');
    }

    return data;
  }

  async verifyAdminHash(hash: string) {
    return this.request<{
      valid: boolean;
      message: string;
    }>('/admin/verify-hash', {
      method: 'POST',
      body: JSON.stringify({ accessHash: hash }),
    });
  }

  async getIssuerNames() {
    return this.request<Array<{ id: string; name: string; loginId?: string }>>('/issuer/names');
  }

  async verifyLoginId(issuerName: string, issuerLoginId: string) {
    return this.request<{
      valid: boolean;
      message: string;
      issuerName: string;
    }>('/issuer/verify-login', {
      method: 'POST',
      body: JSON.stringify({ issuerName, issuerLoginId }),
    });
  }

  async retrieveCredentials(issuerName: string, patientNumber: string) {
    return this.request<Array<{
      id: string;
      credentialHash: string;
      issuerDid: string;
      issuerId: string;
      issuerName: string;
      issuedAt: string;
      expiry: string;
      status: 'active' | 'revoked' | 'expired';
      credential: {
        issuer: string;
        claims: {
          name: string;
          age: number;
          gender: string;
          bloodGroup: string;
          genotype: string;
          conditions: string[];
        };
        issuedAt: string;
        expiry: string;
      };
    }>>('/issuer/credentials/retrieve', {
      method: 'POST',
      body: JSON.stringify({ issuerName, patientNumber }),
    });
  }

  async generateProof(credentialHash: string, issuerDID: string, credential?: any) {
    return this.request<{
      credentialHash: string;
      issuerDID: string;
      proofHash: string;
      nullifier: string;
      signature: string;
    }>('/proof/generate', {
      method: 'POST',
      body: JSON.stringify({ credentialHash, issuerDID, credential }),
    });
  }

  async submitProof(data: {
    credentialHash: string;
    proofHash: string;
    nullifier: string;
    issuerDID: string;
    signature: string;
  }) {
    return this.request<{
      status: string;
      message: string;
      txHash?: string;
      timestamp: string;
      proofId: string;
      eligibleTrials: Array<{
        id: string;
        codeName: string;
        displayName: string;
      }>;
      matchedTrial: {
        id: string;
        codeName: string;
        displayName: string;
      };
    }>('/proof/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProofHistory(credentialHash: string) {
    return this.request<{
      credentialStatus: 'active' | 'revoked' | 'expired';
      issuerName: string;
      proofs: Array<{
        proofHash: string;
        credentialHash: string;
        status: 'verified' | 'rejected' | 'expired' | 'pending';
        txHash: string | null;
        verifiedAt: string | null;
        createdAt: string;
        eligibleTrials?: Array<{
          id: string;
          codeName: string;
          displayName: string;
        }>;
      }>;
    }>(`/proof/history/${credentialHash}`);
  }

  async getProofStatus(proofHash: string) {
    return this.request<{
      proofHash: string;
      credentialHash: string;
      status: 'verified' | 'rejected' | 'expired' | 'pending';
      txHash: string | null;
      verifiedAt: string | null;
      issuerName: string;
      createdAt: string;
    }>(`/proof/status/${proofHash}`);
  }

  async registerIssuer(name: string, did?: string) {
    return this.request<{
      id: string;
      name: string;
      loginId: string;
      did: string;
      publicKey: string;
      isActive: boolean;
      createdAt: string;
    }>('/issuer/register', {
      method: 'POST',
      body: JSON.stringify({ name, did }),
    }, true);
  }

  async getIssuers() {
    return this.request<Array<{
      id: string;
      name: string;
      loginId?: string;
      did: string;
      publicKey: string;
      isActive: boolean;
      createdAt: string;
    }>>('/issuer/list', {}, true);
  }

  async createTrial(trial: {
    codeName: string;
    displayName: string;
    requirements: {
      minAge?: number;
      maxAge?: number;
      genders?: string[];
      bloodGroups?: string[];
      genotypes?: string[];
      conditions?: string[];
    };
  }) {
    return this.request<{
      id: string;
      codeName: string;
      displayName: string;
      requirements: any;
      isActive: boolean;
      createdAt: string;
    }>('/trial/create', {
      method: 'POST',
      body: JSON.stringify(trial),
    }, true);
  }

  async createTrialsBulk(trials: Array<{
    codeName: string;
    displayName: string;
    requirements: {
      minAge?: number;
      maxAge?: number;
      genders?: string[];
      bloodGroups?: string[];
      genotypes?: string[];
      conditions?: string[];
    };
  }>) {
    return this.request<{
      created: Array<{
        id: string;
        codeName: string;
        displayName: string;
      }>;
      errors: Array<{
        codeName: string;
        error: string;
      }>;
      summary: {
        total: number;
        successful: number;
        failed: number;
      };
    }>('/trial/create-bulk', {
      method: 'POST',
      body: JSON.stringify({ trials }),
    }, true);
  }

  async getTrials() {
    return this.request<Array<{
      id: string;
      codeName: string;
      displayName: string;
      requirements: any;
      createdAt: string;
    }>>('/trial/list', {}, true);
  }

  async issueCredential(data: {
    name: string;
    dob: string;
    gender: string;
    bloodGroup: string;
    genotype: string;
    conditions: string[];
    issuerId?: string;
    issuerName?: string;
    issuerLoginId?: string;
    patientNumber: string;
  }) {
    return this.request<{
      credential: {
        issuer: string;
        claims: {
          name: string;
          age: number;
          gender: string;
          bloodGroup: string;
          genotype: string;
          conditions: string[];
        };
        issuedAt: string;
        expiry: string;
      };
      signature: string;
      credentialHash: string;
      issuerPublicKey: string;
      issuerDID: string;
      credentialId: string;
      issuerId: string;
      issuerName: string;
      patientNumber: string;
    }>('/issuer/issue', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async revokeCredential(credentialId: string) {
    return this.request<{
      message: string;
      credentialId: string;
      status: string;
    }>('/issuer/revoke', {
      method: 'POST',
      body: JSON.stringify({ credentialId }),
    });
  }

  async getCredentials(issuerName?: string) {
    const queryParam = issuerName ? `?issuerName=${encodeURIComponent(issuerName)}` : '';
    return this.request<Array<{
      id: string;
      credentialHash: string;
      issuedAt: string;
      expiry: string;
      issuerDid: string;
      issuerId: string;
      issuerName: string;
      patientNumber: string;
      status: 'active' | 'revoked' | 'expired';
      createdAt: string;
      updatedAt: string;
    }>>(`/issuer/credentials${queryParam}`);
  }
}

export const apiClient = new ApiClient();

