import Web3 from 'web3';

// Créer une instance Web3 pour vérifier les signatures
const web3 = new Web3();

/**
 * Vérifie la signature Web3 pour les requêtes
 */
const verifyWeb3Signature = async (req, res, next) => {
  // Pas besoin d'authentification pour les GET (sauf données sensibles)
  if (req.method === 'GET') {
    return next();
  }

  try {
    const { signature, message, address } = req.headers;

    if (!signature || !message || !address) {
      return res.status(401).json({ 
        error: 'Web3 authentication required',
        details: 'Missing signature, message, or address headers'
      });
    }

    // Vérifier que l'adresse est valide
    if (!web3.utils.isAddress(address)) {
      return res.status(400).json({ 
        error: 'Invalid Ethereum address' 
      });
    }

    // Vérifier la signature
    const recoveredAddress = web3.eth.accounts.recover(message, signature);
    
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      console.warn('⚠️ Signature mismatch:', {
        recovered: recoveredAddress,
        provided: address
      });
      
      return res.status(401).json({ 
        error: 'Invalid signature' 
      });
    }

    // Ajouter l'adresse à la requête
    req.userAddress = address.toLowerCase();
    
    console.log(`✅ Authenticated: ${req.userAddress.substring(0, 10)}...`);
    
    next();
  } catch (error) {
    console.error('❌ Web3 auth error:', error);
    
    // En développement, on peut bypass pour les tests
    if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
      console.warn('⚠️ Bypassing auth in development mode');
      req.userAddress = '0x0000000000000000000000000000000000000000';
      return next();
    }
    
    res.status(401).json({ 
      error: 'Authentication failed',
      details: error.message 
    });
  }
};

export default verifyWeb3Signature
;