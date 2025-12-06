// src/services/index.js
import api from './api';
import campaignService from './campaignService';
import donationService from './donationService';
import categoryService from './categoryService';

// Check if withdrawalService exists, otherwise export a placeholder
let withdrawalService;
try {
  withdrawalService = require('./withdrawalService').default;
} catch (error) {
  // Create a placeholder if file doesn't exist
  withdrawalService = {
    getAllWithdrawals: () => Promise.reject(new Error('withdrawalService not implemented')),
    getWithdrawalsByCampaign: () => Promise.reject(new Error('withdrawalService not implemented')),
    getWithdrawalsByRecipient: () => Promise.reject(new Error('withdrawalService not implemented')),
    createWithdrawal: () => Promise.reject(new Error('withdrawalService not implemented')),
  };
}

export {
  api,
  campaignService,
  donationService,
  withdrawalService,
  categoryService,
};