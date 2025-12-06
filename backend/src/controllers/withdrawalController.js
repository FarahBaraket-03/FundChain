// withdrawalController.js
import { Campaign, Withdrawal } from '../models/index.js';

class WithdrawalController {
  // Enregistrer un retrait
  async create(req, res) {
    try {
      const {
        campaign_id,
        recipient_address,
        amount,
        transaction_hash,
        block_number
      } = req.body;

      // Validation
      if (!campaign_id || !recipient_address || !amount || !transaction_hash || !block_number) {
        return res.status(400).json({ 
          error: 'Tous les champs sont requis: campaign_id, recipient_address, amount, transaction_hash, block_number' 
        });
      }

      // Vérifier que la campagne existe
      const campaign = await Campaign.findOne({
        where: { blockchain_id: campaign_id }
      });

      if (!campaign) {
        return res.status(404).json({ error: 'Campagne non trouvée' });
      }

      // Vérifier si la transaction existe déjà
      const existing = await Withdrawal.findOne({
        where: { transaction_hash }
      });

      if (existing) {
        return res.status(409).json({ error: 'Transaction déjà enregistrée' });
      }

      // Créer le retrait
      const withdrawal = await Withdrawal.create({
        campaign_id,
        recipient_address: recipient_address.toLowerCase(),
        amount,
        transaction_hash,
        block_number
      });

      // Mettre à jour les fonds retirés de la campagne
      await Campaign.increment('funds_withdrawn', {
        by: amount,
        where: { blockchain_id: campaign_id }
      });

      res.status(201).json({
        message: 'Retrait enregistré avec succès',
        withdrawal
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du retrait:', error);
      
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ error: 'ID de campagne invalide' });
      }
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Le hash de transaction existe déjà' });
      }
      
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Récupérer les retraits d'une campagne
  async getByCampaign(req, res) {
    try {
      const { campaignId } = req.params;

      // Vérifier que la campagne existe
      const campaign = await Campaign.findOne({
        where: { blockchain_id: campaignId }
      });

      if (!campaign) {
        return res.status(404).json({ error: 'Campagne non trouvée' });
      }

      const withdrawals = await Withdrawal.findAll({
        where: { campaign_id: campaignId },
        order: [['created_at', 'DESC']]
      });

      const total = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);

      res.json({
        withdrawals,
        total: parseFloat(total),
        campaignTitle: campaign.title
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des retraits de campagne:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Récupérer les retraits d'un receveur - CORRIGÉ
  async getByRecipient(req, res) {
    try {
      const { address } = req.params;

      const withdrawals = await Withdrawal.findAll({
        where: { recipient_address: address.toLowerCase() },
        include: [{
          model: Campaign,
          as: 'campaign',
          attributes: ['title', 'owner_address', 'blockchain_id']
        }],
        order: [['created_at', 'DESC']],
        limit: 100
      });

      const stats = {
        totalWithdrawn: withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0),
        totalWithdrawals: withdrawals.length,
        campaignsWithdrawn: [...new Set(withdrawals.map(w => w.campaign_id))].length
      };

      res.json({ 
        withdrawals, 
        stats 
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des retraits du receveur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Récupérer tous les retraits - CORRIGÉ
  async getAll(req, res) {
    try {
      const withdrawals = await Withdrawal.findAll({
        include: [{
          model: Campaign,
          as: 'campaign',
          attributes: ['title', 'owner_address']
        }],
        order: [['created_at', 'DESC']],
        limit: 100
      });

      res.json(withdrawals);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de tous les retraits:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}

export default new WithdrawalController();