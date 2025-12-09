// context/index.jsx - VERSION COMPLÈTE AVEC RECHERCHE
import React, { useContext, createContext, useState, useEffect } from 'react';
import contractFunctions from '../utils/Fonction';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  // États de base
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // États pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [categories, setCategories] = useState([]);

  // ===== FONCTIONS DE RECHERCHE =====

  // Fonction pour charger toutes les campagnes
  const loadAllCampaigns = async () => {
    try {
      setIsLoading(true);
      const campaigns = await contractFunctions.getCampaigns();
      setAllCampaigns(campaigns);
      setFilteredCampaigns(campaigns); // Initialiser avec toutes les campagnes
      
      // Extraire les catégories uniques
      const uniqueCategories = [...new Set(campaigns
        .map(campaign => campaign.category)
        .filter(category => category && category.trim() !== '')
      )];
      setCategories(uniqueCategories);
      
      setIsLoading(false);
      return campaigns;
    } catch (error) {
      setIsLoading(false);
      console.error('Erreur loadAllCampaigns:', error);
      throw error;
    }
  };

  // Fonction de recherche
  const searchCampaigns = (term) => {
    console.log('🔍 Recherche pour:', term);
    setSearchTerm(term);
    
    if (!term || term.trim() === '') {
      console.log('❌ Terme vide, réinitialisation');
      setFilteredCampaigns(allCampaigns);
      return [];
    }

    const lowercasedTerm = term.toLowerCase().trim();
    console.log('📋 Nombre total de campagnes:', allCampaigns.length);
    
    const results = allCampaigns.filter(campaign => {
      const matches = (
        (campaign.title && campaign.title.toLowerCase().includes(lowercasedTerm)) ||
        (campaign.description && campaign.description.toLowerCase().includes(lowercasedTerm)) ||
        (campaign.owner && campaign.owner.toLowerCase().includes(lowercasedTerm)) ||
        (campaign.category && campaign.category.toLowerCase().includes(lowercasedTerm))
      );
      
      if (matches) {
        console.log('✅ Campagne correspondante:', campaign.title);
      }
      
      return matches;
    });

    console.log('📊 Résultats trouvés:', results.length);
    setFilteredCampaigns(results);
    return results;
  };

  // Fonction pour effacer la recherche
  const clearSearch = () => {
    console.log('🧹 Effacement de la recherche');
    setSearchTerm('');
    setFilteredCampaigns(allCampaigns);
  };

  // ===== FONCTIONS EXISTANTES (connexion, création, etc.) =====

  const connect = async () => {
    try {
      setIsLoading(true);
      const account = await contractFunctions.connectWallet();
      setAddress(account);
      setIsConnected(true);
      setIsInitialized(true);
      
      // Charger les campagnes après connexion
      await loadAllCampaigns();
      
      setIsLoading(false);
      return account;
    } catch (error) {
      setIsLoading(false);
      console.error('Erreur de connexion:', error);
      alert('Erreur de connexion: ' + error.message);
      throw error;
    }
  };

  // Fonction getCampaigns mise à jour
  const getCampaigns = async () => {
    try {
      if (!isInitialized) {
        throw new Error('Veuillez vous connecter d\'abord');
      }
      setIsLoading(true);
      const campaigns = await contractFunctions.getCampaigns();
      setAllCampaigns(campaigns);
      setFilteredCampaigns(campaigns);
      setIsLoading(false);
      return campaigns;
    } catch (error) {
      setIsLoading(false);
      console.error('Erreur getCampaigns:', error);
      throw error;
    }
  };

  const getUserCampaigns = async () => {
    try {
      if (!isInitialized) {
        throw new Error('Veuillez vous connecter d\'abord');
      }
      setIsLoading(true);
      // Pass the connected address explicitly to avoid relying on internal contract state
      const campaigns = await contractFunctions.getUserCampaigns(address);
      setIsLoading(false);
      return campaigns;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const createCampaign = async (form) => {
    try {
      if (!isInitialized) {
        throw new Error('Veuillez vous connecter d\'abord');
      }
      setIsLoading(true);
      const result = await contractFunctions.createCampaign(form);
      
      // Recharger les campagnes après création
      await loadAllCampaigns();
      
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const donate = async (pId, amount) => {
    try {
      if (!isInitialized) {
        throw new Error('Veuillez vous connecter d\'abord');
      }
      setIsLoading(true);
      const result = await contractFunctions.donate(pId, amount);
      
      // Recharger les campagnes après don
      await loadAllCampaigns();
      
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const getDonations = async (pId) => {
    try {
      if (!isInitialized) {
        throw new Error('Veuillez vous connecter d\'abord');
      }
      setIsLoading(true);
      const donations = await contractFunctions.getDonations(pId);
      setIsLoading(false);
      return donations;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const getCampaignDetails = async (pId) => {
    try {
      if (!isInitialized) {
        throw new Error('Veuillez vous connecter d\'abord');
      }
      setIsLoading(true);
      const details = await contractFunctions.getCampaignDetails(pId);
      setIsLoading(false);
      return details;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const getShortAddress = (address) => {
    return contractFunctions.getShortAddress(address);
  };

  // ... (gardez toutes vos autres fonctions existantes)

  const getWithdrawableCampaigns = async () => {
    try {
        if (!isInitialized) {
            throw new Error('Veuillez vous connecter d\'abord');
        }
        setIsLoading(true);
        const campaigns = await contractFunctions.getWithdrawableCampaigns();
        setIsLoading(false);
        return campaigns;
    } catch (error) {
        setIsLoading(false);
        throw error;
    }
  };

  const withdrawFunds = async (pId) => {
    try {
        if (!isInitialized) {
            throw new Error('Veuillez vous connecter d\'abord');
        }
        console.log('🚀 Tentative de retrait des fonds pour la campagne ID:', pId);
        setIsLoading(true);
        const result = await contractFunctions.withdrawFunds(pId);
        setIsLoading(false);
        return result;
    } catch (error) {
        setIsLoading(false);
        throw error;
    }
  };

  const cancelCampaign = async (pId) => {
    try {
        if (!isInitialized) {
            throw new Error('Veuillez vous connecter d\'abord');
        }
        setIsLoading(true);
        const result = await contractFunctions.cancelCampaign(pId);
        
        // Recharger les campagnes après annulation
        await loadAllCampaigns();
        
        setIsLoading(false);
        return result;
    } catch (error) {
        setIsLoading(false);
        throw error;
    }
  };

  const claimRefundAfterCancellation = async (pId) => {
    try {
        if (!isInitialized) {
            throw new Error('Veuillez vous connecter d\'abord');
        }
        setIsLoading(true);
        const result = await contractFunctions.claimRefundAfterCancellation(pId);
        setIsLoading(false);
        return result;
    } catch (error) {
        setIsLoading(false);
        throw error;
    }
  };

  const refundDonation = async (pId) => {
    try {
        if (!isInitialized) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        console.log('🔄 Remboursement pour campagne:', pId);
        setIsLoading(true);
        const result = await contractFunctions.refundDonation(pId);
        console.log('✅ Remboursement effectué avec succès:', result);
        setIsLoading(false);
        return result;
    } catch (error) {
        setIsLoading(false);
        console.error('❌ Erreur refundDonation:', error);
        throw error;
    }
  };

  const claimRefundIfGoalNotMet = async(pId) => {
    try {
        if (!isInitialized ) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        console.log('🔄 Remboursement objectif non atteint pour campagne:', pId);
        setIsLoading(true);
        const result = await contractFunctions.claimRefundIfGoalNotMet(pId)
        
        console.log('✅ Remboursement effectué avec succès:', result);
        setIsLoading(false);
        return result;
    } catch (error) {
        setIsLoading(false);
        console.error('❌ Erreur claimRefundIfGoalNotMet:', error);
        throw error;
    }
  };

  const getWithdrawalStats = async () => {
    try {
        if (!isInitialized) {
            throw new Error('Veuillez vous connecter d\'abord');
        }
        setIsLoading(true);
        const stats = await contractFunctions.getWithdrawalStats();
        setIsLoading(false);
        return stats;
    } catch (error) {
        setIsLoading(false);
        throw error;
    }
  };

  const checkWithdrawalEligibility = async (pId) => {
    try {
        if (!isInitialized) {
            throw new Error('Veuillez vous connecter d\'abord');
        }
        setIsLoading(true);
        const eligibility = await contractFunctions.checkWithdrawalEligibility(pId);
        setIsLoading(false);
        return eligibility;
    } catch (error) {
        setIsLoading(false);
        throw error;
    }
  };

  const getUserDonations = async () => {
    try {
        if (!isInitialized) {
            throw new Error('Veuillez vous connecter d\'abord');
        }
        setIsLoading(true);
        const donations = await contractFunctions.getUserDonations();
        setIsLoading(false);
        return donations;
    } catch (error) {
        setIsLoading(false);
        throw error;
    }
  };

  const getUserDonationStats = async () => {
    try {
        if (!isInitialized) {
            throw new Error('Veuillez vous connecter d\'abord');
        }
        setIsLoading(true);
        const stats = await contractFunctions.getUserDonationStats();
        setIsLoading(false);
        return stats;
    } catch (error) {
        setIsLoading(false);
        throw error;
    }
  };

  const updateDeadline = async (pId, newDeadline) => {
    try {
      if (!isInitialized) {
        throw new Error('Veuillez vous connecter d\'abord');
      }
      setIsLoading(true);
      const result = await contractFunctions.updateDeadline(pId, newDeadline);
      
      // Recharger les campagnes après mise à jour
      await loadAllCampaigns();
      
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const getDonatorsnum = async (pId) => {
    try {
      if (!isInitialized) {
        throw new Error('Veuillez vous connecter d\'abord');
      }
      setIsLoading(true);
      const donators = await contractFunctions.getDonatorsnum(pId);
      setIsLoading(false);
      console.log('Nombre de donateurs pour la campagne', pId, ':', donators);
      return donators;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // ===== EFFETS =====

  // Vérifier la connexion au chargement
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            // Initialiser le contrat
            await contractFunctions.init();
            setIsInitialized(true);
            
            // Charger les campagnes
            await loadAllCampaigns();
          }
        } catch (error) {
          console.error('Erreur vérification connexion:', error);
        }
      }
    };

    checkConnection();

    // Écouter les changements de compte
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          await contractFunctions.init();
          setIsInitialized(true);
          
          // Recharger les campagnes
          await loadAllCampaigns();
        } else {
          setAddress(null);
          setIsConnected(false);
          setIsInitialized(false);
          setAllCampaigns([]);
          setFilteredCampaigns([]);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  // ===== VALEURS DU CONTEXTE =====
  return (
    <StateContext.Provider
        value={{ 
            // États
            address,
            isConnected,
            isLoading,
            isInitialized,
            searchTerm,
            filteredCampaigns,
            categories,
            
            // Fonctions de recherche
            searchCampaigns,
            clearSearch,
            
            // Fonctions existantes
            connect,
            createCampaign,
            getCampaigns,
            getUserCampaigns,
            donate,
            getDonations,
            getCampaignDetails,
            getShortAddress,
            getWithdrawableCampaigns,
            withdrawFunds,
            cancelCampaign,
            claimRefundAfterCancellation,
            getWithdrawalStats,
            checkWithdrawalEligibility,
            getUserDonations,
            getUserDonationStats,
            updateDeadline,
            refundDonation,
            claimRefundIfGoalNotMet,
            getDonatorsnum
        }}
    >
        {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);