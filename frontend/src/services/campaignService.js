// src/services/campaignService.js
import api from './api';

class CampaignService {
  // Get all campaigns
  async getCampaigns(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/campaigns${queryParams ? `?${queryParams}` : ''}`;
    return api.request(endpoint);
  }

  // Get single campaign by ID
  async getCampaign(id) {
    return api.request(`/campaigns/${id}`);
  }

  // Get campaigns by owner address
  async getCampaignsByOwner(address) {
    return api.request(`/campaigns/owner/${address}`);
  }

  // Get campaign statistics
  async getCampaignStats() {
    return api.request('/campaigns/stats');
  }

  // Sync campaign from blockchain (authenticated)
  async syncCampaign(campaignData, signer, address) {
    return api.authenticatedRequest('/campaigns/sync', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    }, signer, address);
  }

  // Update campaign deadline (authenticated)
  async updateDeadline(campaignId, deadline, signer, address) {
    return api.authenticatedRequest(`/campaigns/${campaignId}/deadline`, {
      method: 'PUT',
      body: JSON.stringify({ deadline }),
    }, signer, address);
  }
}

export default new CampaignService();