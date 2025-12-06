// src/services/withdrawalService.js
import api from './api';

class WithdrawalService {
  // Get all withdrawals
  async getAllWithdrawals() {
    return api.request('/withdrawals');
  }

  // Get withdrawals by campaign
  async getWithdrawalsByCampaign(campaignId) {
    return api.request(`/withdrawals/campaign/${campaignId}`);
  }

  // Get withdrawals by recipient
  async getWithdrawalsByRecipient(address) {
    return api.request(`/withdrawals/recipient/${address}`);
  }

  // Create withdrawal (authenticated)
  async createWithdrawal(withdrawalData, signer) {
    return api.authenticatedRequest('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(withdrawalData),
    }, signer);
  }
}

export default new WithdrawalService();