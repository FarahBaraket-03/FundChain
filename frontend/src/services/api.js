// src/services/api.js
const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error ${endpoint}:`, error);
      throw error;
    }
  }

  // Helper to sign messages for Web3 auth
  async signMessage(message, signer) {
    try {
      // Use ethers.js or web3 to sign the message
      // If using ethers.js v6:
      const signature = await signer.signMessage(message);
      return signature;
      
      // If using web3:
      // const signature = await signer.sign(message);
      // return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }

  // Create authenticated request
  async authenticatedRequest(endpoint, options = {}, signer, address) {
    const timestamp = Date.now();
    const message = `Authentication required at ${timestamp}`;
    const signature = await this.signMessage(message, signer);

    const authHeaders = {
      signature,
      message,
      address,
    };

    return this.request(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        ...authHeaders,
      },
    });
  }
}

export default new ApiService();