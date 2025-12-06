import Web3 from 'web3';
const web3 = new Web3(process.env.WEB3_PROVIDER_URL || 'http://localhost:8545');

/**
 * Middleware d'authentification simplifié pour Ganache
 * - Vérifie la signature du message
 * - Vérifie que l'adresse correspond
 */
const ganacheAuth = async (req, res, next) => {
  // Pas besoin d'authentification pour les GET
  if (req.method === 'GET') {
    return next();
  }

  try {
    const { signature, message, address } = req.headers;

    if (!signature || !message || !address) {
      return res.status(401).json({ 
        error: 'Authentification Web3 requise',
        details: 'Headers: signature, message, address manquants'
      });
    }

    // Vérifier que l'adresse est valide
    if (!web3.utils.isAddress(address)) {
      return res.status(400).json({ 
        error: 'Adresse Ethereum invalide' 
      });
    }

    // Pour Ganache en développement, on peut simplifier la vérification
    // ou utiliser une vérification complète
    const recoveredAddress = web3.eth.accounts.recover(message, signature);
    
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      console.warn('Signature mismatch:', {
        recovered: recoveredAddress,
        provided: address
      });
      
      return res.status(401).json({ 
        error: 'Signature invalide',
        details: 'L\'adresse récupérée ne correspond pas à l\'adresse fournie'
      });
    }

    // Vérifier que l'adresse existe dans Ganache
    const accounts = await web3.eth.getAccounts();
    const accountExists = accounts.some(acc => 
      acc.toLowerCase() === address.toLowerCase()
    );

    if (!accountExists) {
      console.warn('Unknown Ganache address:', address);
      // En développement, on peut accepter quand même
      if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({ 
          error: 'Adresse non autorisée' 
        });
      }
    }

    // Ajouter l'adresse à la requête
    req.userAddress = address.toLowerCase();
    req.isGanacheAccount = accountExists;
    
    console.log(`✅ Authentifié: ${req.userAddress.substring(0, 10)}... (Ganache: ${accountExists})`);
    
    next();
  } catch (error) {
    console.error('❌ Erreur authentification Ganache:', error);
    
    // En développement, on peut bypass l'authentification pour les tests
    if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
      console.warn('⚠️ Bypass auth en développement');
      req.userAddress = '0x0000000000000000000000000000000000000000';
      req.isGanacheAccount = true;
      return next();
    }
    
    res.status(401).json({ 
      error: 'Authentification échouée',
      details: error.message 
    });
  }
};

/**
 * Vérifie que l'utilisateur est propriétaire de la campagne
 */
const checkCampaignOwnership = async (req, res, next) => {
  try {
    const campaignId = req.params.id;
    const Campaign = require('../models/Campaign').default;
    
    const campaign = await Campaign.findOne({
      where: { blockchain_id: campaignId }
    });

    if (!campaign) {
      return res.status(404).json({ 
        error: 'Campagne non trouvée' 
      });
    }

    if (campaign.owner_address.toLowerCase() !== req.userAddress) {
      console.warn('Tentative accès non autorisé:', {
        requester: req.userAddress,
        owner: campaign.owner_address
      });
      
      return res.status(403).json({ 
        error: 'Action réservée au propriétaire de la campagne' 
      });
    }

    req.campaign = campaign;
    next();
  } catch (error) {
    console.error('Erreur vérification propriété:', error);
    res.status(500).json({ 
      error: 'Erreur serveur' 
    });
  }
};

export default {
  ganacheAuth,
  checkCampaignOwnership
};