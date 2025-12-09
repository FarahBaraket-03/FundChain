// campaignController.js
import { Campaign, Category, Donation, Withdrawal } from '../models/index.js';
import { Op } from 'sequelize';

class CampaignController {
  // Récupérer toutes les campagnes avec catégorie
  async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category_id,
        owner_address,
        search,
        is_active = true
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Filtres
      if (category_id) where.category_id = category_id;
      if (owner_address) where.owner_address = owner_address.toLowerCase();
      if (is_active !== undefined) where.is_active = is_active === 'true';
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Campaign.findAndCountAll({
        where,
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        campaigns: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des campagnes:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Récupérer une campagne spécifique
  async getOne(req, res) {
    try {
      const { id } = req.params;

      const campaign = await Campaign.findOne({
        where: { blockchain_id: id },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          {
            model: Donation,
            as: 'donations',
            attributes: ['id', 'donor_address', 'amount', 'transaction_hash', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 20
          },
          {
            model: Withdrawal,
            as: 'withdrawals',
            attributes: ['id', 'recipient_address', 'amount', 'transaction_hash', 'created_at'],
            order: [['created_at', 'DESC']]
          }
        ]
      });

      if (!campaign) {
        return res.status(404).json({ error: 'Campagne non trouvée' });
      }

      res.json(campaign);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la campagne:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Synchroniser une campagne depuis la blockchain
  async syncCampaign(req, res) {
    try {
      const {
        blockchain_id,
        owner_address,
        title,
        description,
        target_amount,
        deadline,
        amount_collected,
        image_url,
        is_active,
        is_verified,
        funds_withdrawn,
        category_id,
        social_links
      } = req.body;

      // Validation des champs obligatoires
      if (!blockchain_id || !owner_address || !title || !target_amount || !deadline) {
        return res.status(400).json({ 
          error: 'Champs obligatoires manquants: blockchain_id, owner_address, title, target_amount, deadline' 
        });
      }

      console.log(`🔄 data `, req.body);

      // Find existing campaign; if exists, update only provided fields to avoid
      // accidentally clearing description/image when sync payload is partial.
      const existing = await Campaign.findOne({ where: { blockchain_id } });

      if (existing) {
        const updateFields = {};
        if (owner_address) updateFields.owner_address = owner_address.toLowerCase();
        if (title !== undefined) updateFields.title = title;
        if (description !== undefined) updateFields.description = description;
        if (target_amount !== undefined) updateFields.target_amount = target_amount;
        if (deadline !== undefined) updateFields.deadline = deadline;
        if (amount_collected !== undefined) updateFields.amount_collected = amount_collected;
        if (image_url !== undefined) updateFields.image_url = image_url;
        if (is_active !== undefined) updateFields.is_active = is_active;
        if (is_verified !== undefined) updateFields.is_verified = is_verified;
        if (funds_withdrawn !== undefined) updateFields.funds_withdrawn = funds_withdrawn;
        if (category_id !== undefined) updateFields.category_id = category_id;
        if (social_links !== undefined) updateFields.social_links = social_links;

        // Only perform update if there are fields to change
        if (Object.keys(updateFields).length > 0) {
          await existing.update(updateFields);
        }

        const refreshed = await Campaign.findOne({ where: { blockchain_id } });
        return res.status(200).json({ message: 'Campagne mise à jour', campaign: refreshed });
      }

      // Create new campaign when not existing
      const createdCampaign = await Campaign.create({
        blockchain_id,
        owner_address: owner_address.toLowerCase(),
        title,
        description: description || null,
        target_amount,
        deadline,
        amount_collected: amount_collected ,
        image_url: image_url || null,
        is_active: is_active !== undefined ? is_active : true,
        is_verified: is_verified || false,
        funds_withdrawn: funds_withdrawn || 0,
        category_id: category_id || null,
        social_links: social_links || ''
      });

      res.status(201).json({ message: 'Campagne créée', campaign: createdCampaign });
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation de la campagne:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Campagne avec ce blockchain_id existe déjà' });
      }
      
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Mettre à jour uniquement la deadline
  async updateDeadline(req, res) {
    try {
      const { id } = req.params;
      const { deadline } = req.body;

      if (!deadline) {
        return res.status(400).json({ error: 'La date limite est requise' });
      }

      const campaign = await Campaign.findOne({
        where: { blockchain_id: id }
      });

      if (!campaign) {
        return res.status(404).json({ error: 'Campagne non trouvée' });
      }

      // Vérifier que l'utilisateur est le propriétaire
      if (campaign.owner_address.toLowerCase() !== req.userAddress) {
        return res.status(403).json({ error: 'Pas le propriétaire de la campagne' });
      }

      // Vérifier que la campagne est active
      if (!campaign.is_active) {
        return res.status(400).json({ error: 'Impossible de mettre à jour la date limite d\'une campagne inactive' });
      }

      // Mettre à jour uniquement la deadline
      await campaign.update({ deadline });

      res.json({
        message: 'Date limite mise à jour avec succès',
        campaign
      });
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la date limite:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Récupérer les campagnes d'un propriétaire
  async getByOwner(req, res) {
    try {
      const { address } = req.params;
      
      const campaigns = await Campaign.findAll({
        where: { 
          owner_address: address.toLowerCase() 
        },
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }],
        order: [['created_at', 'DESC']]
      });

      res.json(campaigns);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des campagnes du propriétaire:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }


  // Annuler une campagne
async cancelCampaign(req, res) {
    try {
        const { id } = req.params;
        
        // Vérifier que l'utilisateur est authentifié
        if (!req.userAddress) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        console.log(`🔍 Tentative d'annulation de la campagne ${id} par ${req.userAddress}`);

        // Rechercher la campagne
        const campaign = await Campaign.findOne({
            where: { blockchain_id: id }
        });

        if (!campaign) {
            return res.status(404).json({ error: 'Campagne non trouvée' });
        }

        // Vérifier que l'utilisateur est le propriétaire
        if (campaign.owner_address.toLowerCase() !== req.userAddress.toLowerCase()) {
            return res.status(403).json({ 
                error: 'Accès refusé',
                message: 'Seul le propriétaire peut annuler cette campagne'
            });
        }

        // Vérifier que la campagne est active
        if (!campaign.is_active) {
            return res.status(400).json({ 
                error: 'Campagne déjà inactive',
                message: 'Cette campagne est déjà annulée ou terminée'
            });
        }

        // Vérifier qu'aucun retrait n'a été effectué
        const withdrawals = await Withdrawal.count({
            where: { campaign_id: id }
        });

        if (withdrawals > 0) {
            return res.status(400).json({ 
                error: 'Retraits effectués',
                message: 'Impossible d\'annuler une campagne dont des fonds ont déjà été retirés'
            });
        }

        // Vérifier si la deadline est dépassée
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime > Number(campaign.deadline)) {
            return res.status(400).json({ 
                error: 'Deadline dépassée',
                message: 'Impossible d\'annuler une campagne dont la deadline est dépassée'
            });
        }

        // Vérifier si l'objectif est atteint
        if (parseFloat(campaign.amount_collected) >= parseFloat(campaign.target_amount)) {
            return res.status(400).json({ 
                error: 'Objectif atteint',
                message: 'Impossible d\'annuler une campagne dont l\'objectif est atteint'
            });
        }

        // Mettre à jour la campagne
        const [updatedRows] = await Campaign.update(
            {
                is_active: false,
                updated_at: new Date()
            },
            {
                where: { 
                    blockchain_id: id,
                    owner_address: req.userAddress.toLowerCase()
                }
            }
        );

        if (updatedRows === 0) {
            return res.status(400).json({ 
                error: 'Échec de la mise à jour',
                message: 'Impossible de mettre à jour la campagne'
            });
        }

        // Récupérer la campagne mise à jour
        const updatedCampaign = await Campaign.findOne({
            where: { blockchain_id: id }
        });

        console.log(`✅ Campagne ${id} annulée par ${req.userAddress}`);

        res.json({
            message: 'Campagne annulée avec succès',
            campaign: updatedCampaign
        });

    } catch (error) {
        console.error('❌ Erreur lors de l\'annulation de la campagne:', error);
        console.error('Stack:', error.stack);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ 
                error: 'Erreur de validation',
                details: error.errors.map(e => e.message)
            });
        }
        
        res.status(500).json({ 
            error: 'Erreur serveur',
            message: error.message
        });
    }
}

  // Statistiques
  async getStats(req, res) {
    try {
      const totalCampaigns = await Campaign.count();
      const activeCampaigns = await Campaign.count({ where: { is_active: true } });
      const totalDonations = await Donation.sum('amount') || 0;
      const totalWithdrawn = await Withdrawal.sum('amount') || 0;

      res.json({
        totalCampaigns,
        activeCampaigns,
        totalDonations: parseFloat(totalDonations),
        totalWithdrawn: parseFloat(totalWithdrawn),
        totalFunded: parseFloat(totalDonations) - parseFloat(totalWithdrawn)
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}

export default new CampaignController();