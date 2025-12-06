// api.js (routes)
import { Router } from 'express';
const router = Router();
import verifyWeb3Signature from '../middlewares/web3Auth.js';

// Import controllers as default exports
import categoryController from '../controllers/categoryController.js';
import campaignController from '../controllers/campaignController.js';
import donationController from '../controllers/donationController.js';
import withdrawalController from '../controllers/withdrawalController.js';

// ========== CATÉGORIES ==========
router.get('/categories', categoryController.getAll);
router.get('/categories/:id', categoryController.getOne);
router.post('/categories', verifyWeb3Signature, categoryController.create);

// ========== CAMPAGNES ==========
// Public routes
router.get('/campaigns', campaignController.getAll);
router.get('/campaigns/stats', campaignController.getStats);
router.get('/campaigns/:id', campaignController.getOne);
router.get('/campaigns/owner/:address', campaignController.getByOwner);

// Authenticated routes
router.post('/campaigns/sync', verifyWeb3Signature, campaignController.syncCampaign);
router.put('/campaigns/:id/deadline', verifyWeb3Signature, campaignController.updateDeadline);
router.put('/campaigns/:id/cancel', verifyWeb3Signature, campaignController.cancelCampaign);

// ========== DONS ==========
// Public routes
router.get('/donations', donationController.getAll);
router.get('/donations/campaign/:campaignId', donationController.getByCampaign);
router.get('/donations/donor/:address', donationController.getByDonor);

// Authenticated routes
router.post('/donations', verifyWeb3Signature, donationController.create);

// ========== RETRAITS ==========
// Public routes
router.get('/withdrawals', withdrawalController.getAll);
router.get('/withdrawals/campaign/:campaignId', withdrawalController.getByCampaign);
router.get('/withdrawals/recipient/:address', withdrawalController.getByRecipient);

// Authenticated routes
router.post('/withdrawals', verifyWeb3Signature, withdrawalController.create);

// ========== UTILS ==========
// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Crowdfunding Tracker API',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root
router.get('/', (req, res) => {
  res.json({
    message: 'Crowdfunding Tracker API',
    description: 'Backend pour stocker les données de campagnes de crowdfunding',
    database: 'PostgreSQL',
    version: '1.0.0',
    endpoints: {
      categories: {
        GET_all: '/categories',
        GET_one: '/categories/:id',
        POST: '/categories (auth)'
      },
      campaigns: {
        GET_all: '/campaigns',
        GET_one: '/campaigns/:id',
        GET_owner: '/campaigns/owner/:address',
        GET_stats: '/campaigns/stats',
        POST_sync: '/campaigns/sync (auth)',
        PUT_deadline: '/campaigns/:id/deadline (auth)'
      },
      donations: {
        GET_all: '/donations',
        GET_campaign: '/donations/campaign/:campaignId',
        GET_donor: '/donations/donor/:address',
        POST: '/donations (auth)'
      },
      withdrawals: {
        GET_all: '/withdrawals',
        GET_campaign: '/withdrawals/campaign/:campaignId',
        GET_recipient: '/withdrawals/recipient/:address',
        POST: '/withdrawals (auth)'
      }
    }
  });
});

export default router;