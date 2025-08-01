import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = await window.Clerk?.session?.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          window.location.href = '/sign-in';
        }
        return Promise.reject(error);
      }
    );
  }

  // User endpoints
  async getCurrentUser() {
    const response = await this.client.get('/auth/me/');
    return response.data;
  }

  // WebAuthn endpoints
  async webAuthnRegisterBegin() {
    const response = await this.client.post('/webauthn/register/begin/');
    return response.data;
  }

  async webAuthnRegisterComplete(credential, challenge, name) {
    const response = await this.client.post('/webauthn/register/complete/', {
      credential,
      challenge,
      name,
    });
    return response.data;
  }

  async webAuthnVerifyBegin() {
    const response = await this.client.post('/webauthn/verify/begin/');
    return response.data;
  }

  async webAuthnVerifyComplete(credential, challenge, forAdminAccess = false) {
    const response = await this.client.post('/webauthn/verify/complete/', {
      credential,
      challenge,
      for_admin_access: forAdminAccess,
    });
    return response.data;
  }

  // Balance endpoints (for UAT functionality)
  async getBalances(accountType = 'main') {
    const response = await this.client.get(`/balances/${accountType}/`);
    return response.data;
  }

  // Transfer endpoints
  async initiateTransfer(transferData) {
    const response = await this.client.post('/transfers/', transferData);
    return response.data;
  }

  async getTransactionHistory(accountType = 'main') {
    const response = await this.client.get(`/transactions/${accountType}/`);
    return response.data;
  }
}

export default new ApiService();