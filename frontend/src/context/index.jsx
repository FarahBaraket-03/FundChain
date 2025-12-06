// context/index.jsx
import React, { useContext, createContext, useState, useEffect } from 'react';
import contractFunctions from '../utils/Fonction';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const connect = async () => {
    try {
      setIsLoading(true);
      const account = await contractFunctions.connectWallet();
      setAddress(account);
      setIsConnected(true);
      setIsInitialized(true);
      setIsLoading(false);
      return account;
    } catch (error) {
      setIsLoading(false);
      alert('Erreur de connexion: ' + error.message);
      throw error;
    }
  };

  const getCampaigns = async () => {
    try {
      if (!isInitialized) {
        throw new Error('Veuillez vous connecter d\'abord');
      }
      setIsLoading(true);
      const campaigns = await contractFunctions.getCampaigns();
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
      const campaigns = await contractFunctions.getUserCampaigns();
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

  

  const refundDonation = async (pId) =>{
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
        } else {
          setAddress(null);
          setIsConnected(false);
          setIsInitialized(false);
        }
      });
    }
  }, []);

  return (
    <StateContext.Provider
        value={{ 
            address,
            isConnected,
            isLoading,
            isInitialized,
            connect,
            createCampaign,
            getCampaigns,
            getUserCampaigns,
            donate,
            getDonations,
            getCampaignDetails,
            getShortAddress,
            // Nouvelles méthodes pour les retraits
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