// src/services/donationService.js
import api from './api';

class DonationService {
  // Get all donations
  async getAllDonations(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/donations${queryParams ? `?${queryParams}` : ''}`;
    return api.request(endpoint);
  }

  // Get donations by campaign
  async getDonationsByCampaign(campaignId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/donations/campaign/${campaignId}${queryParams ? `?${queryParams}` : ''}`;
    return api.request(endpoint);
  }

  // Get donations by donor
  async getDonationsByDonor(address) {
    return api.request(`/donations/donor/${address}`);
  }

  // Create donation (authenticated)
  async createDonation(donationData, signer, address) {
    return api.authenticatedRequest('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    }, signer, address);
  }
}

export default new DonationService();