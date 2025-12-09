// donationController.js
import { Campaign, Donation, sequelize } from '../models/index.js';

class DonationController {
  // Enregistrer un don
  async create(req, res) {
    try {
      const {
        campaign_id,
        donor_address,
        amount,
        transaction_hash,
        block_number
      } = req.body;

      // Coerce amount to number and validate
      const amountValue = parseFloat(amount);
      if (!isFinite(amountValue)) {
        return res.status(400).json({ error: 'Montant invalide' });
      }

      // Validation
      if (!campaign_id || !donor_address || !amount || !transaction_hash || !block_number) {
        return res.status(400).json({ 
          error: 'Tous les champs sont requis: campaign_id, donor_address, amount, transaction_hash, block_number' 
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
      const existing = await Donation.findOne({
        where: { transaction_hash }
      });

      if (existing) {
        return res.status(409).json({ error: 'Transaction déjà enregistrée' });
      }

      // Exécuter la création du don et la mise à jour du montant collecté dans une transaction
      const t = await sequelize.transaction();
      try {
        // Créer le don dans la transaction
        const donation = await Donation.create({
          campaign_id,
          donor_address: donor_address.toLowerCase(),
          amount: amountValue,
          transaction_hash,
          block_number
        }, { transaction: t });

        // Lire la valeur actuelle pour comparaison
        const before = await Campaign.findOne({ where: { blockchain_id: campaign_id }, transaction: t });
        const beforeAmount = parseFloat(before.amount_collected || 0);

        console.log(`🔄 Incrémenter amount_collected pour campaign ${campaign_id} de ${amountValue}`);
        // Essayer l'incrément natif
        await Campaign.increment('amount_collected', {
          by: amountValue,
          where: { blockchain_id: campaign_id },
          transaction: t
        });

        // Vérifier l'effet de l'incrément
        let updatedCampaign = await Campaign.findOne({ where: { blockchain_id: campaign_id }, transaction: t });
        const afterAmount = parseFloat(updatedCampaign.amount_collected || 0);

        // Si l'incrément natif n'a pas fonctionné comme attendu, appliquer un update explicite
        if (Math.abs(afterAmount - (beforeAmount + amountValue)) > 1e-8) {
          const newAmount = +(beforeAmount + amountValue).toFixed(8);
          console.warn('⚠️ Increment fallback: Sequelize.increment did not update as expected. Forcing explicit update.', { beforeAmount, amountValue, afterAmount, newAmount });
          await Campaign.update({ amount_collected: newAmount }, { where: { blockchain_id: campaign_id }, transaction: t });
          updatedCampaign = await Campaign.findOne({ where: { blockchain_id: campaign_id }, transaction: t });
        }

        // Commit transaction
        await t.commit();

        console.log('✅ Campaign after increment:', {
          blockchain_id: campaign_id,
          amount_collected: updatedCampaign ? updatedCampaign.amount_collected : null
        });

        return res.status(201).json({
          message: 'Don enregistré avec succès',
          donation,
          campaign: updatedCampaign
        });
      } catch (txErr) {
        // Rollback on error and rethrow
        await t.rollback();
        console.error('❌ Transaction failed while saving donation and updating campaign:', txErr);
        throw txErr;
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du don:', error);
      
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ error: 'ID de campagne invalide' });
      }
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Le hash de transaction existe déjà' });
      }
      
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Récupérer les dons d'une campagne
  async getByCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // Vérifier que la campagne existe
      const campaign = await Campaign.findOne({
        where: { blockchain_id: campaignId }
      });

      if (!campaign) {
        return res.status(404).json({ error: 'Campagne non trouvée' });
      }

      const { count, rows } = await Donation.findAndCountAll({
        where: { campaign_id: campaignId },
        include: [{
          model: Campaign,
          as: 'campaign',
          attributes: ['title', 'owner_address']
        }],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        donations: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des dons de campagne:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Récupérer les dons d'un donateur - CORRIGÉ
  async getByDonor(req, res) {
    try {
      const { address } = req.params;

      const donations = await Donation.findAll({
        where: { donor_address: address.toLowerCase() },
        include: [{
          model: Campaign,
          as: 'campaign',
          attributes: ['id', 'title', 'image_url', 'is_active', 'deadline', 'owner_address']
        }],
        order: [['created_at', 'DESC']],
        limit: 100
      });

      const stats = {
        totalDonated: donations.reduce((sum, d) => sum + parseFloat(d.amount), 0),
        totalDonations: donations.length,
        campaignsSupported: [...new Set(donations.map(d => d.campaign_id))].length
      };

      res.json({ 
        donations, 
        stats 
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des dons du donateur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Récupérer tous les dons (pagination)
  async getAll(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows } = await Donation.findAndCountAll({
        include: [{
          model: Campaign,
          as: 'campaign',
          attributes: ['title', 'owner_address']
        }],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        donations: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de tous les dons:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}

export default new DonationController();