// pages/Withdraw.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useStateContext } from '../context';
import { CustomButton, FormField, Loader } from '../components';
import { money } from '../assets';

// Inline SVG placeholder to avoid external network DNS issues
const INLINE_PLACEHOLDER = 'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">` +
    `<rect width="100%" height="100%" fill="#2c2f32"/>` +
    `<text x="50%" y="50%" font-size="28" fill="#808191" dominant-baseline="middle" text-anchor="middle">📷</text>` +
    `</svg>`
  );

// URL de votre backend API - PORT 3001
const API_BASE_URL = 'http://localhost:3001/api';

const Withdraw = () => {
  const navigate = useNavigate();
  const { 
    address, 
    isInitialized, 
    connect,
    withdrawFunds,
    checkWithdrawalEligibility
  } = useStateContext();
  
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [stats, setStats] = useState({ 
    totalAvailable: '0', 
    totalWithdrawn: '0', 
    withdrawableCampaigns: 0, 
    totalCampaigns: 0 
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [donators, setDonators] = useState(0);
  const [selectedCampaignDetails, setSelectedCampaignDetails] = useState(null);
  const [loadingDonators, setLoadingDonators] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [debugInfo, setDebugInfo] = useState([]);
  const [contractEligibilityMap, setContractEligibilityMap] = useState({});

  // Fonction pour appeler l'API backend
  const fetchFromAPI = async (endpoint) => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`🔄 Appel API: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Réponse API (${endpoint}):`, data);
      return data;
      
    } catch (error) {
      console.error(`❌ Erreur API (${endpoint}):`, error.message);
      throw error;
    }
  };

  // Fonction pour normaliser les adresses (lowercase)
  const normalizeAddress = (addr) => {
    return addr ? addr.toLowerCase() : '';
  };

  // Fonction pour convertir les strings en nombres
  const parseNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
  };

  // Fonction pour convertir le timestamp UNIX ou date ISO
  const parseDeadline = (deadline) => {
    if (!deadline) return new Date();
    
    // Convertir en nombre si c'est une string
    const deadlineNum = parseNumber(deadline);
    
    if (deadlineNum === 0) return new Date();
    
    // Vérifier si c'est en secondes (timestamp UNIX) ou millisecondes
    if (deadlineNum > 1000000000 && deadlineNum < 2000000000) {
      // C'est probablement un timestamp UNIX en secondes
      return new Date(deadlineNum * 1000);
    } else if (deadlineNum > 1000000000000) {
      // C'est probablement déjà en millisecondes
      return new Date(deadlineNum);
    }
    
    // Sinon, essayer de parser comme date ISO
    return new Date(deadline);
  };

  // Chargement des campagnes depuis la base de données - CORRIGÉ
  const fetchCampaignsFromDB = async () => {
    try {
      if (!address) {
        console.log('⚠️ Aucune adresse pour charger les campagnes');
        return [];
      }
      
      const normalizedAddress = normalizeAddress(address);
      console.log(`📡 Récupération campagnes pour: ${normalizedAddress}`);
      
      const response = await fetchFromAPI(`/campaigns/owner/${normalizedAddress}`);
      
      // DEBUG: Vérifiez la structure exacte
      console.log('📊 Données API reçues:', response);
      console.log('📊 Type de réponse:', typeof response);
      console.log('📊 Est un tableau?', Array.isArray(response));
      
      let campaignsArray = [];
      
      if (Array.isArray(response)) {
        // La réponse EST directement un tableau
        campaignsArray = response;
        console.log(`✅ Structure: Tableau direct (${campaignsArray.length} éléments)`);
      } else if (response && response.campaigns && Array.isArray(response.campaigns)) {
        // La réponse a une propriété campaigns
        campaignsArray = response.campaigns;
        console.log(`✅ Structure: data.campaigns (${campaignsArray.length} éléments)`);
      } else {
        console.log('❌ Structure inattendue:', response);
        return [];
      }
      
      // Log détaillé des campagnes
      if (campaignsArray.length > 0) {
        console.log(`🎉 ${campaignsArray.length} campagne(s) récupérée(s):`);
        campaignsArray.forEach((campaign, index) => {
          console.log(`  ${index + 1}. ID: ${campaign.blockchain_id}, "${campaign.title}"`);
          console.log(`     Collecté: ${campaign.amount_collected}, Objectif: ${campaign.target_amount}`);
          console.log(`     Retiré: ${campaign.funds_withdrawn}, Deadline: ${campaign.deadline}`);
        });
      }
      
      return campaignsArray;
      
    } catch (error) {
      console.error('Erreur chargement campagnes depuis DB:', error);
      return [];
    }
  };

  // Chargement des retraits depuis la base de données
  const fetchWithdrawalsFromDB = async () => {
    try {
      if (!address) return { withdrawals: [], stats: {} };
      
      const normalizedAddress = normalizeAddress(address);
      const data = await fetchFromAPI(`/withdrawals/recipient/${normalizedAddress}`);
      console.log('💰 Retraits récupérés:', data.withdrawals?.length || 0);
      return data;
    } catch (error) {
      console.error('Erreur chargement retraits depuis DB:', error);
      return { withdrawals: [], stats: {} };
    }
  };

  // Récupérer les donateurs d'une campagne depuis la DB
  const fetchDonatorsFromDB = async (campaignId) => {
    try {
      const data = await fetchFromAPI(`/donations/campaign/${campaignId}`);
      const donations = data.donations || [];
      
      // Compter les donateurs uniques
      const uniqueDonors = new Set(donations.map(d => d.donor_address));
      return uniqueDonors.size;
    } catch (error) {
      console.error('Erreur récupération donateurs depuis DB:', error);
      return 0;
    }
  };

  // Calculer les statistiques
  // Accepts an optional `withdrawals` array so "totalWithdrawn" is
  // calculated from recorded withdrawals (authoritative), matching the
  // bottom summary instead of relying solely on per-campaign fields.
  const calculateStats = (campaigns, withdrawals = []) => {
    console.log('🧮 Calcul des stats pour:', campaigns.length, 'campagnes');
    
    let totalAvailable = 0;
    let totalWithdrawn = 0;
    let withdrawableCampaigns = 0;
    
    const debugLogs = [];

    campaigns.forEach(campaign => {
      const collected = parseNumber(campaign.amount_collected);
      const withdrawn = parseNumber(campaign.funds_withdrawn);
      const target = parseNumber(campaign.target_amount);
      // Prefer contract-provided available amount when present
      let available = collected - withdrawn;
      if (contractEligibilityMap[campaign.blockchain_id] && typeof contractEligibilityMap[campaign.blockchain_id].available === 'number') {
        available = contractEligibilityMap[campaign.blockchain_id].available;
      }
      
      const deadlineDate = parseDeadline(campaign.deadline);
      const isPastDeadline = deadlineDate < new Date();
      const isGoalMet = collected >= target;
      
      // Éligible si : fonds disponibles ET (objectif atteint OU deadline passée avec fonds restants)
      const isEligible = available > 0 && (isGoalMet || (!isGoalMet && isPastDeadline));
      
      debugLogs.push({
        id: campaign.blockchain_id,
        title: campaign.title,
        collected,
        target,
        withdrawn,
        available,
        deadline: campaign.deadline,
        deadlineDate: deadlineDate.toISOString(),
        deadlineFormatted: deadlineDate.toLocaleDateString(),
        isPastDeadline,
        isGoalMet,
        isEligible
      });
      
      if (isEligible) {
        withdrawableCampaigns++;
        totalAvailable += available;
      }
    });

    // Use the withdrawals array as authoritative for total withdrawn.
    if (Array.isArray(withdrawals) && withdrawals.length > 0) {
      totalWithdrawn = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);
    } else {
      // Fallback: sum per-campaign withdrawn values we parsed earlier
      totalWithdrawn = debugLogs.reduce((sum, d) => sum + parseFloat(d.withdrawn || 0), 0);
    }

    // Stocker les logs de debug
    setDebugInfo(debugLogs);
    
    console.log('📊 Résultats stats:', {
      totalAvailable,
      totalWithdrawn,
      withdrawableCampaigns,
      totalCampaigns: campaigns.length
    });
    
    console.log('🔍 Debug logs:', debugLogs);

    return {
      totalAvailable: totalAvailable.toFixed(4),
      totalWithdrawn: totalWithdrawn.toFixed(4),
      withdrawableCampaigns,
      totalCampaigns: campaigns.length
    };
  };

  // Chargement initial des données depuis la DB
  useEffect(() => {
    const fetchData = async () => {
      if (isInitialized && address) {
        setIsLoading(true);
        setStatusMessage('🔄 Chargement des données depuis la base de données...');
        
        try {
          // Récupérer les données
          const [dbCampaigns, withdrawalsData] = await Promise.all([
            fetchCampaignsFromDB(),
            fetchWithdrawalsFromDB()
          ]);

          console.log('📊 Toutes les campagnes de la DB:', dbCampaigns);
          
          // If web3 is initialized and connected, prefer on-chain eligibility for campaigns owned by user
          const contractMap = {};

          if (isInitialized && address) {
            // Query on-chain eligibility for campaigns owned by the connected address
            await Promise.all(dbCampaigns.map(async (campaign) => {
              try {
                if (!campaign.owner_address) return;
                if (campaign.owner_address.toLowerCase() !== address.toLowerCase()) return;

                const result = await checkWithdrawalEligibility(campaign.blockchain_id);
                // result.availableAmount is a string like '0.000000'
                contractMap[campaign.blockchain_id] = {
                  eligible: result.eligible,
                  available: parseFloat(result.availableAmount || result.availableAmount || 0)
                };
              } catch (err) {
                console.warn('⚠️ Erreur récupération éligibilité on-chain pour', campaign.blockchain_id, err.message);
              }
            }));
          }

          // Filtrer les campagnes éligibles (préférence on-chain when available)
          const eligibleCampaigns = dbCampaigns.filter(campaign => {
            const collected = parseNumber(campaign.amount_collected);
            const withdrawn = parseNumber(campaign.funds_withdrawn);
            const target = parseNumber(campaign.target_amount);
            let available = collected - withdrawn;

            // prefer contract-provided available when present (from contractMap)
            if (contractMap[campaign.blockchain_id] && typeof contractMap[campaign.blockchain_id].available === 'number') {
              available = contractMap[campaign.blockchain_id].available;
            }

            const deadlineDate = parseDeadline(campaign.deadline);
            const isPastDeadline = deadlineDate < new Date();
            const isGoalMet = collected >= target;

            const isEligible = available > 0 && (isGoalMet || (!isGoalMet && isPastDeadline));

            console.log(`🔍 Campagne ${campaign.blockchain_id} - "${campaign.title}":`, {
              collected,
              target,
              goalMet: isGoalMet,
              withdrawn,
              available,
              deadline: campaign.deadline,
              deadlineDate: deadlineDate.toISOString(),
              deadlineFormatted: deadlineDate.toLocaleDateString(),
              pastDeadline: isPastDeadline,
              eligible: isEligible
            });

            return isEligible;
          });

          // Store contract eligibility map for UI usage
          setContractEligibilityMap(contractMap);

          console.log('✅ Campagnes éligibles après filtrage:', eligibleCampaigns);
          
          setCampaigns(eligibleCampaigns);
          setWithdrawalHistory(withdrawalsData.withdrawals || []);
          
          // Calculer les statistiques (passer l'historique des retraits pour total retiré)
          const calculatedStats = calculateStats(dbCampaigns, withdrawalsData.withdrawals || []);
          console.log('📈 Statistiques calculées:', calculatedStats);
          setStats(calculatedStats);

          if (eligibleCampaigns.length === 0 && dbCampaigns.length > 0) {
            console.log('⚠️ Aucune campagne éligible. Analyse:');
            dbCampaigns.forEach(c => {
              const collected = parseNumber(c.amount_collected);
              const target = parseNumber(c.target_amount);
              const withdrawn = parseNumber(c.funds_withdrawn);
              const available = collected - withdrawn;
              const deadlineDate = parseDeadline(c.deadline);
              
              console.log(`\n🔍 Campagne ${c.blockchain_id} - "${c.title}":`);
              console.log(`   Collecté: ${collected}, Objectif: ${target}, Objectif atteint: ${collected >= target ? '✅' : '❌'}`);
              console.log(`   Retiré: ${withdrawn}, Disponible: ${available}`);
              console.log(`   Deadline: ${deadlineDate.toLocaleDateString()}, Passée: ${deadlineDate < new Date() ? '✅' : '❌'}`);
              
              if (collected < target) {
                console.log(`   ❌ Objectif non atteint (${collected} < ${target})`);
              }
              if (deadlineDate >= new Date()) {
                console.log(`   ❌ Deadline non passée (${deadlineDate.toLocaleDateString()})`);
              }
              if (available <= 0) {
                console.log(`   ❌ Pas de fonds disponibles (${available})`);
              }
            });
            
            setStatusMessage(`ℹ️ ${dbCampaigns.length} campagne(s) trouvée(s) mais aucune éligible au retrait`);
          } else if (eligibleCampaigns.length > 0) {
            setStatusMessage(`✅ ${eligibleCampaigns.length} campagne(s) éligible(s) au retrait`);
          } else {
            setStatusMessage('ℹ️ Aucune campagne trouvée');
          }
          
          setTimeout(() => setStatusMessage(''), 3000);

        } catch (error) {
          console.error('❌ Erreur chargement données DB:', error);
          setStatusMessage('❌ Erreur lors du chargement des données');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [isInitialized, address]);

  // Chargement des donateurs quand une campagne est sélectionnée
  useEffect(() => {
    const fetchDonators = async () => {
      if (selectedCampaign) {
        setLoadingDonators(true);
        const campaign = campaigns.find(c => c.blockchain_id === parseInt(selectedCampaign));

        setSelectedCampaignDetails(campaign);

        if (campaign) {
          try {
            // Use the campaign.blockchain_id explicitly to match the select value
            const campaignIdForApi = campaign.blockchain_id;
            const donatorCount = await fetchDonatorsFromDB(campaignIdForApi);
            setDonators(donatorCount);
          } catch (error) {
            console.error('Erreur récupération donateurs:', error);
            setDonators(0);
          } finally {
            setLoadingDonators(false);
          }
        } else {
          setDonators(0);
          setLoadingDonators(false);
        }
      } else {
        setSelectedCampaignDetails(null);
        setDonators(0);
        setLoadingDonators(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchDonators();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedCampaign, campaigns]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setStatusMessage('❌ Erreur de connexion: ' + error.message);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (!selectedCampaign) {
      setStatusMessage('⚠️ Veuillez sélectionner une campagne');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('🔄 Vérification en cours...');

    try {
      setStatusMessage('🔍 Vérification des conditions...');
      const eligibility = await checkWithdrawalEligibility(selectedCampaign);
      
      if (!eligibility.eligible) {
        setStatusMessage(`❌ ${eligibility.message}`);
        setTimeout(() => setStatusMessage(''), 5000);
        setIsProcessing(false);
        return;
      }

      const availableAmount = getAvailableBalance(selectedCampaign);
      const confirmWithdraw = window.confirm(
        `Êtes-vous sûr de vouloir retirer ${availableAmount} ETH de la campagne "${selectedCampaignDetails?.title}" ?\n\nCette action est irréversible.`
      );

      if (!confirmWithdraw) {
        setIsProcessing(false);
        setStatusMessage('');
        return;
      }

      setStatusMessage('⏳ Transaction blockchain en cours...');
      await withdrawFunds(selectedCampaign);
      
      setStatusMessage('✅ Retrait effectué avec succès !');
      
      setTimeout(async () => {
        setIsLoading(true);
        try {
          const [dbCampaigns, withdrawalsData] = await Promise.all([
            fetchCampaignsFromDB(),
            fetchWithdrawalsFromDB()
          ]);

          const eligibleCampaigns = dbCampaigns.filter(campaign => {
            const collected = parseNumber(campaign.amount_collected);
            const withdrawn = parseNumber(campaign.funds_withdrawn);
            const target = parseNumber(campaign.target_amount);
            const available = collected - withdrawn;
            const deadlineDate = parseDeadline(campaign.deadline);
            const isPastDeadline = deadlineDate < new Date();
            const isGoalMet = collected >= target;
            
            // Éligible si : available > 0 AND (goal met OR (deadline passed AND available > 0 even if goal not met))
            return available > 0 && (isGoalMet || (!isGoalMet && isPastDeadline));
          });

          setCampaigns(eligibleCampaigns);
          setWithdrawalHistory(withdrawalsData.withdrawals || []);
          
          const calculatedStats = calculateStats(dbCampaigns, withdrawalsData.withdrawals || []);
          setStats(calculatedStats);
          
          setSelectedCampaign('');
          setSelectedCampaignDetails(null);
          setDonators(0);
        } catch (error) {
          console.error('Erreur rechargement:', error);
          setStatusMessage('⚠️ Retrait effectué mais erreur de rechargement');
        } finally {
          setIsLoading(false);
          setIsProcessing(false);
          setTimeout(() => setStatusMessage(''), 3000);
        }
      }, 2000);

    } catch (error) {
      console.error('Erreur retrait:', error);
      setStatusMessage('❌ Erreur: ' + error.message);
      
      setTimeout(() => {
        setIsProcessing(false);
        setStatusMessage('');
      }, 5000);
    }
  };

  const getAvailableBalance = (campaignId) => {
    const id = parseInt(campaignId);
    // Prefer contract-provided available amount if present
    if (contractEligibilityMap[id] && typeof contractEligibilityMap[id].available === 'number') {
      return contractEligibilityMap[id].available.toFixed(4);
    }

    const campaign = campaigns.find(c => c.blockchain_id === id);
    if (!campaign) return '0.0000';
    const collected = parseNumber(campaign.amount_collected);
    const withdrawn = parseNumber(campaign.funds_withdrawn);
    const available = Math.max(collected - withdrawn, 0).toFixed(4);
    return available;
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    
    const date = parseDeadline(dateInput);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Fonction pour forcer le rechargement des données
  const handleRefreshData = async () => {
    setIsLoading(true);
    setStatusMessage('🔄 Rechargement des données...');
    
    try {
      const [dbCampaigns, withdrawalsData] = await Promise.all([
        fetchCampaignsFromDB(),
        fetchWithdrawalsFromDB()
      ]);

      const eligibleCampaigns = dbCampaigns.filter(campaign => {
        const collected = parseNumber(campaign.amount_collected);
        const withdrawn = parseNumber(campaign.funds_withdrawn);
        const target = parseNumber(campaign.target_amount);
        const available = collected - withdrawn;
        const deadlineDate = parseDeadline(campaign.deadline);
        const isPastDeadline = deadlineDate < new Date();
        const isGoalMet = collected >= target;
        
        // Éligible si : available > 0 ET (objectif atteint OU deadline passée et fonds restants)
        return available > 0 && (isGoalMet || (!isGoalMet && isPastDeadline));
      });

      setCampaigns(eligibleCampaigns);
      setWithdrawalHistory(withdrawalsData.withdrawals || []);
      
      const calculatedStats = calculateStats(dbCampaigns, withdrawalsData.withdrawals || []);
      setStats(calculatedStats);
      
      setStatusMessage(`✅ ${eligibleCampaigns.length} campagne(s) éligible(s)`);
      setTimeout(() => setStatusMessage(''), 3000);
      
    } catch (error) {
      console.error('Erreur rechargement:', error);
      setStatusMessage('❌ Erreur rechargement données');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f15] to-[#1c1c24] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#23232d] border border-[#3a3a43] rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-[#8c6dfd] to-[#4a00e0] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">💎</span>
          </div>
          <h1 className="font-epilogue font-bold text-2xl text-white mb-3">
            Retrait de Fonds
          </h1>
          <p className="font-epilogue text-[#b2b2bf] mb-8">
            Connectez-vous à votre portefeuille pour gérer les retraits de vos campagnes
          </p>
          <CustomButton 
            btnType="button"
            title="🔗 Se connecter"
            styles="bg-gradient-to-r from-[#8c6dfd] to-[#6a4dfd] hover:from-[#7a5dfd] hover:to-[#5a3dfd] text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#8c6dfd]/30"
            handleClick={handleConnect}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f15] to-[#1c1c24] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {(isProcessing || loadingDonators) && <Loader message={statusMessage || "Traitement en cours..."} />}
        
        {/* En-tête */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[#1dc071] to-[#0da858] rounded-xl">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h1 className="font-epilogue font-bold text-3xl md:text-4xl text-white">
                  Retrait de Fonds
                </h1>
                <p className="font-epilogue text-[#b2b2bf] mt-1">
                  Gérez les retraits de vos campagnes terminées avec succès
                </p>
              </div>
            </div>
            
            {/* Bouton de rafraîchissement */}
            <CustomButton
              btnType="button"
              title="🔄 Rafraîchir"
              styles="bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d] text-white font-semibold py-2 px-4 rounded-xl hover:opacity-90 transition-all"
              handleClick={handleRefreshData}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Message de statut */}
        {statusMessage && !isProcessing && (
          <div className={`mb-8 p-4 rounded-2xl border transition-all duration-300 ${
            statusMessage.includes('✅') 
              ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/50' 
              : statusMessage.includes('❌')
              ? 'bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-500/50'
              : 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/50'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {statusMessage.includes('✅') ? '✅' : 
                 statusMessage.includes('❌') ? '❌' : '⚠️'}
              </span>
              <p className="font-epilogue font-medium text-white">
                {statusMessage.replace(/[✅❌⚠️🔄🔍⏳]/g, '')}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2">
            {/* Statistiques améliorées */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-[#23232d] to-[#2c2f32] border border-[#3a3a43] rounded-2xl p-6 shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-[#4acd8d] to-[#1dc071] rounded-xl">
                    <span className="text-xl">💎</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-epilogue font-semibold text-[16px] text-[#b2b2bf]">Fonds Disponibles</h3>
                    <p className="font-epilogue font-bold text-2xl text-white mt-1">
                      {stats.totalAvailable || '0'} <span className="text-[#4acd8d]">ETH</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-[#23232d] to-[#2c2f32] border border-[#3a3a43] rounded-2xl p-6 shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-[#8c6dfd] to-[#6a4dfd] rounded-xl">
                    <span className="text-xl">📈</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-epilogue font-semibold text-[16px] text-[#b2b2bf]">Campagnes Éligibles</h3>
                    <p className="font-epilogue font-bold text-2xl text-white mt-1">
                      {stats.withdrawableCampaigns || '0'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-[#23232d] to-[#2c2f32] border border-[#3a3a43] rounded-2xl p-6 shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-[#1dc071] to-[#0da858] rounded-xl">
                    <span className="text-xl">✅</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-epilogue font-semibold text-[16px] text-[#b2b2bf]">Déjà Retiré</h3>
                    <p className="font-epilogue font-bold text-2xl text-white mt-1">
                      {stats.totalWithdrawn || '0'} <span className="text-[#1dc071]">ETH</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire de retrait */}
            <div className="bg-gradient-to-b from-[#23232d] to-[#1c1c24] border border-[#3a3a43] rounded-2xl p-6 md:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d] rounded-full flex items-center justify-center">
                    <span className="text-xl">💸</span>
                  </div>
                  <h2 className="font-epilogue font-bold text-2xl text-white">
                    Effectuer un Retrait
                  </h2>
                </div>
                
                {/* Debug info */}
                {debugInfo.length > 0 && (
                  <div className="text-xs text-[#b2b2bf]">
                    {campaigns.length} sur {debugInfo.length} éligibles
                  </div>
                )}
              </div>
              
              {campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-32 h-32 mx-auto mb-6 opacity-30">
                    <img src={money} alt="money" className="w-full h-full" />
                  </div>
                  <h3 className="font-epilogue font-bold text-2xl text-white mb-3">
                    Aucune campagne éligible
                  </h3>
                  <p className="font-epilogue text-[#b2b2bf] mb-6 max-w-md mx-auto">
                    Les campagnes doivent être terminées avec succès et avoir atteint leur objectif pour être éligibles au retrait.
                  </p>
                  
                  {/* Debug: Afficher les détails des campagnes */}
                  {debugInfo.length > 0 && (
                    <div className="bg-[#2c2f32] rounded-xl p-4 mb-6 max-w-md mx-auto">
                      <p className="font-epilogue font-semibold text-[#ff6b6b] mb-2">🔍 Analyse des campagnes</p>
                      <div className="text-left text-sm text-[#b2b2bf] space-y-3 max-h-60 overflow-y-auto">
                          {debugInfo
                            .filter(c => !c.isEligible && parseFloat(c.available) > 0)
                            .map((campaign, index) => (
                            <div key={index} className="border-b border-[#3a3a43] pb-2">
                              <div className="font-semibold">#{campaign.id} - {campaign.title}</div>
                              <div className="text-xs grid grid-cols-2 gap-1 mt-1">
                                <div>Collecté: <span className={campaign.isGoalMet ? "text-green-500" : "text-red-500"}>{campaign.collected} ETH</span></div>
                                <div>Objectif: {campaign.target} ETH</div>
                                <div>Disponible: {campaign.available} ETH</div>
                                <div>Date fin: {campaign.deadlineFormatted}</div>
                                <div className="col-span-2">
                                  Statut: 
                                  <span className={`ml-2 text-red-500`}>
                                    ❌ Non éligible
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4 max-w-sm mx-auto">
                    <div className="bg-[#2c2f32] rounded-xl p-4">
                      <p className="font-epilogue font-semibold text-[#4acd8d] mb-2">📋 Conditions requises</p>
                      <ul className="text-left text-sm text-[#b2b2bf] space-y-2">
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          Objectif atteint
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          Date de fin passée
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          Fonds non retirés
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleWithdraw} className="space-y-6">
                  <div className="space-y-4">
                    <label className="font-epilogue font-semibold text-[18px] text-white flex items-center gap-2">
                      <span>📋</span>
                      Sélectionner une Campagne
                    </label>
                    
                    <select
                      value={selectedCampaign}
                      onChange={(e) => setSelectedCampaign(e.target.value)}
                      className="w-full bg-[#1c1c24] border-2 border-[#3a3a43] rounded-xl p-4 text-white font-epilogue focus:border-[#8c6dfd] focus:outline-none transition-all duration-300"
                    >
                      <option value="" className="text-[#808191]">Choisissez une campagne...</option>
                      {campaigns.map(campaign => (
                        <option 
                          key={campaign.blockchain_id} 
                          value={campaign.blockchain_id}
                          className="bg-[#2c2f32] text-white p-2"
                        >
                          {campaign.title} - {getAvailableBalance(campaign.blockchain_id)} ETH disponible
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Détails de la campagne sélectionnée */}
                  {selectedCampaignDetails && (
                    <div className="bg-gradient-to-r from-[#1c1c24] to-[#23232d] border border-[#3a3a43] rounded-2xl p-6 transition-all duration-300">
                      <div className="flex items-start gap-4 mb-6">
                        <img 
                          src={selectedCampaignDetails.image_url || INLINE_PLACEHOLDER} 
                          alt={selectedCampaignDetails.title}
                          className="w-20 h-20 rounded-xl object-cover border-2 border-[#3a3a43]"
                          onError={(e) => {
                            e.target.src = INLINE_PLACEHOLDER;
                            e.target.onerror = null;
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-epilogue font-bold text-xl text-white mb-2">
                            {selectedCampaignDetails.title}
                          </h3>
                          <p className="font-epilogue text-[#b2b2bf] line-clamp-2">
                            {selectedCampaignDetails.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-[#2c2f32] rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[#4acd8d]">💰</span>
                            <span className="font-epilogue font-semibold text-white">Montant disponible</span>
                          </div>
                          <p className="font-epilogue font-bold text-2xl text-[#4acd8d]">
                            {getAvailableBalance(selectedCampaign)} ETH
                          </p>
                        </div>
                        
                        <div className="bg-[#2c2f32] rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[#8c6dfd]">📊</span>
                            <span className="font-epilogue font-semibold text-white">Collecté total</span>
                          </div>
                          <p className="font-epilogue font-bold text-xl text-white">
                            {parseNumber(selectedCampaignDetails.amount_collected || 0).toFixed(4)} ETH
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                        <div className="bg-[#2c2f32] rounded-xl p-3 text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="text-[#1dc071]">📅</span>
                          </div>
                          <p className="font-epilogue font-semibold text-xs text-white">Fin de campagne</p>
                          <p className="font-epilogue text-[10px] text-[#b2b2bf]">
                            {formatDate(selectedCampaignDetails.deadline)}
                          </p>
                        </div>
                        
                        <div className="bg-[#2c2f32] rounded-xl p-3 text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="text-[#ffc107]">👥</span>
                          </div>
                          <p className="font-epilogue font-semibold text-xs text-white">Donateurs</p>
                          <p className="font-epilogue text-[10px] text-[#b2b2bf]">
                            {loadingDonators ? (
                              <span className="text-[#4acd8d] animate-pulse">Chargement...</span>
                            ) : (
                              donators
                            )}
                          </p>
                        </div>
                        
                        <div className="bg-[#2c2f32] rounded-xl p-3 text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="text-[#ff6b6b]">🎯</span>
                          </div>
                          <p className="font-epilogue font-semibold text-xs text-white">Objectif</p>
                          <p className="font-epilogue text-[10px] text-[#b2b2bf]">
                            {parseNumber(selectedCampaignDetails.target_amount || 0).toFixed(2)} ETH
                          </p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl text-green-500">✅</span>
                          <div>
                            <p className="font-epilogue font-semibold text-white">
                              Campagne éligible au retrait
                            </p>
                            <p className="font-epilogue text-sm text-[#b2b2bf]">
                              Cette campagne a atteint son objectif et les fonds sont disponibles
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bouton de soumission */}
                  <div className="pt-4">
                    <CustomButton 
                      btnType="submit"
                      title={
                        isProcessing 
                          ? "⏳ Traitement en cours..." 
                          : selectedCampaign
                          ? `💰 Retirer ${selectedCampaignDetails ? getAvailableBalance(selectedCampaign) : ''} ETH`
                          : "Sélectionnez une campagne"
                      }
                      styles={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                        !selectedCampaign || isProcessing
                          ? 'bg-gray-600 cursor-not-allowed opacity-70'
                          : 'bg-gradient-to-r from-[#1dc071] to-[#0da858] hover:from-[#17a862] hover:to-[#0c9550] hover:shadow-lg hover:shadow-[#1dc071]/30 transform hover:scale-[1.02]'
                      }`}
                      disabled={!selectedCampaign || isProcessing}
                    />
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar informative */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-8">
              {/* Conditions d'éligibilité */}
              <div className="bg-[#2c2f32] rounded-2xl p-6 border-2 border-[#3a3a43]">
                <h3 className="font-epilogue font-bold text-[18px] text-white mb-4 flex items-center">
                  <span className="text-yellow-400 mr-2">✅</span>
                  Conditions d'Éligibilité
                </h3>
                <div className="space-y-3">
                  <div className="bg-[#1c1c24] rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span className="text-green-500 text-sm">✓</span>
                      </div>
                      <p className="font-epilogue font-semibold text-sm text-white">
                        Objectif atteint
                      </p>
                    </div>
                    <p className="font-epilogue font-normal text-xs text-[#808191]">
                      La campagne doit avoir atteint ou dépassé son objectif de financement
                    </p>
                  </div>
                  
                  <div className="bg-[#1c1c24] rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span className="text-green-500 text-sm">✓</span>
                      </div>
                      <p className="font-epilogue font-semibold text-sm text-white">
                        Date de fin passée
                      </p>
                    </div>
                    <p className="font-epilogue font-normal text-xs text-[#808191]">
                      La période de collecte doit être terminée
                    </p>
                  </div>
                  
                  <div className="bg-[#1c1c24] rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span className="text-green-500 text-sm">✓</span>
                      </div>
                      <p className="font-epilogue font-semibold text-sm text-white">
                        Fonds disponibles
                      </p>
                    </div>
                    <p className="font-epilogue font-normal text-xs text-[#808191]">
                      Des fonds non retirés doivent être disponibles
                    </p>
                  </div>
                </div>
              </div>

              {/* Historique des retraits */}
              {withdrawalHistory.length > 0 && (
                <div className="bg-gradient-to-b from-[#23232d] to-[#1c1c24] border border-[#3a3a43] rounded-2xl p-6">
                  <h3 className="font-epilogue font-bold text-[18px] text-white mb-4 flex items-center">
                    <span className="text-[#8c6dfd] mr-2">📋</span>
                    Historique des Retraits
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {withdrawalHistory.slice(0, 5).map((withdrawal, index) => (
                      <div 
                        key={withdrawal.id || index} 
                        className="bg-[#2c2f32] rounded-xl p-3 hover:bg-[#3a3a43] transition-colors duration-200"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-epilogue font-semibold text-sm text-white">
                            {parseFloat(withdrawal.amount || 0).toFixed(4)} ETH
                          </span>
                          <span className="font-epilogue text-xs text-[#4acd8d] bg-[#4acd8d]/10 px-2 py-1 rounded">
                            Réussi
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-epilogue text-xs text-[#b2b2bf]">
                            {withdrawal.created_at ? new Date(withdrawal.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                          </span>
                          <span className="font-epilogue text-xs text-[#808191] truncate max-w-[80px]" title={withdrawal.transaction_hash}>
                            {withdrawal.transaction_hash?.substring(0, 6)}...
                          </span>
                        </div>
                        {withdrawal.campaign && (
                          <div className="mt-1 text-[10px] text-[#b2b2bf] truncate" title={withdrawal.campaign.title}>
                            📋 {withdrawal.campaign.title}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#3a3a43]">
                    <p className="font-epilogue text-xs text-[#b2b2bf] text-center">
                      Total retiré: {withdrawalHistory.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0).toFixed(4)} ETH
                    </p>
                  </div>
                </div>
              )}

              {/* Informations importantes */}
              <div className="bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-2xl p-6 text-white">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xl">⚠️</span>
                  </div>
                  <h3 className="font-epilogue font-bold text-[20px]">
                    Informations Importantes
                  </h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-white rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span className="font-epilogue font-normal text-[14px]">
                      Les retraits sont définitifs et irréversibles
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-white rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span className="font-epilogue font-normal text-[14px]">
                      Vérifiez l'adresse de réception dans votre wallet
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-white rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span className="font-epilogue font-normal text-[14px]">
                      Conservez un historique des transactions
                    </span>
                  </li>
                </ul>
              </div>

              {/* Statut de connexion */}
              <div className="bg-gradient-to-r from-[#2c2f32] to-[#23232d] rounded-2xl p-4 border-2 border-[#4acd8d]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="font-epilogue font-semibold text-[14px] text-white">
                      Connecté
                    </span>
                  </div>
                  <span className="font-epilogue font-normal text-[12px] text-[#b2b2bf] bg-[#1c1c24] px-2 py-1 rounded">
                    {address?.substring(0, 6)}...{address?.substring(38)}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="font-epilogue font-normal text-[11px] text-[#808191]">
                    {campaigns.length} campagne(s) éligible(s) au retrait
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;