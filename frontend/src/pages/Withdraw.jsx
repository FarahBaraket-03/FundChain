// pages/Withdraw.jsx
import React, { useState, useEffect } from 'react'; // Retirez le 'use' inutile
import { useNavigate } from 'react-router-dom';

import { useStateContext } from '../context';
import { CustomButton, FormField, Loader } from '../components';
import { money } from '../assets';

const Withdraw = () => {
  const navigate = useNavigate();
  const { 
    address, 
    isInitialized, 
    connect, 
    getWithdrawableCampaigns, 
    withdrawFunds, 
    getWithdrawalStats, 
    checkWithdrawalEligibility,
    getDonatorsnum
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

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      if (isInitialized && address) {
        setIsLoading(true);
        try {
          const [withdrawableCampaigns, statsData] = await Promise.all([
            getWithdrawableCampaigns(),
            getWithdrawalStats()
          ]);
          
          setCampaigns(withdrawableCampaigns);
          setStats(statsData);
        } catch (error) {
          console.error('Erreur chargement données:', error);
          setStatusMessage('❌ Erreur lors du chargement des données');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [isInitialized, address, getWithdrawableCampaigns, getWithdrawalStats]);


// Chargement des donateurs quand une campagne est sélectionnée
useEffect(() => {
    const fetchDonators = async () => {
      setLoadingDonators(true);
        if (selectedCampaign) {
            const campaign = campaigns.find(c => c.pId === parseInt(selectedCampaign));
            
            setSelectedCampaignDetails(campaign);
            
            // Vérifiez si la campagne a des donateurs avant d'appeler
            if (campaign && parseFloat(campaign.amountCollected) > 0) {
                try {
                    const n = await getDonatorsnum(parseInt(selectedCampaign));
                    setDonators(n);
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

    // Utilisez un debounce pour éviter des appels trop fréquents
    const timeoutId = setTimeout(() => {
        fetchDonators();
    }, 500); // Augmentez à 500ms pour éviter les appels rapides

    return () => clearTimeout(timeoutId);
}, [selectedCampaign, campaigns, getDonatorsnum]);


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
      // Vérification d'éligibilité
      setStatusMessage('🔍 Vérification des conditions...');
      const eligibility = await checkWithdrawalEligibility(selectedCampaign);
      
      if (!eligibility.eligible) {
        setStatusMessage(`❌ ${eligibility.message}`);
        setTimeout(() => setStatusMessage(''), 5000);
        setIsProcessing(false);
        return;
      }

      // Confirmation utilisateur
      const confirmWithdraw = window.confirm(
        `Êtes-vous sûr de vouloir retirer ${eligibility.availableAmount} ETH de la campagne "${selectedCampaignDetails?.title}" ?\n\nCette action est irréversible.`
      );

      if (!confirmWithdraw) {
        setIsProcessing(false);
        setStatusMessage('');
        return;
      }

      // Effectuer le retrait
      setStatusMessage('⏳ Transaction en cours...');
      await withdrawFunds(selectedCampaign);
      
      setStatusMessage('✅ Retrait effectué avec succès !');
      
      // Recharger les données après succès
      setTimeout(async () => {
        setIsLoading(true);
        try {
          const [updatedCampaigns, updatedStats] = await Promise.all([
            getWithdrawableCampaigns(),
            getWithdrawalStats()
          ]);
          
          setCampaigns(updatedCampaigns);
          setStats(updatedStats);
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
    const campaign = campaigns.find(c => c.pId === parseInt(campaignId));
    if (!campaign) return '0.0000';
    const available = (parseFloat(campaign.amountCollected) - parseFloat(campaign.fundsWithdrawn)).toFixed(4);
    return available;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
        {(isProcessing || loadingDonators ) && <Loader message={statusMessage || "Traitement en cours..."} />}
        
        {/* En-tête */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
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
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d] rounded-full flex items-center justify-center">
                  <span className="text-xl">💸</span>
                </div>
                <h2 className="font-epilogue font-bold text-2xl text-white">
                  Effectuer un Retrait
                </h2>
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
                          key={campaign.pId} 
                          value={campaign.pId}
                          className="bg-[#2c2f32] text-white p-2"
                        >
                          {campaign.title} - {getAvailableBalance(campaign.pId)} ETH disponible
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Détails de la campagne sélectionnée */}
                  {selectedCampaignDetails && (
                    <div className="bg-gradient-to-r from-[#1c1c24] to-[#23232d] border border-[#3a3a43] rounded-2xl p-6 transition-all duration-300">
                      <div className="flex items-start gap-4 mb-6">
                        <img 
                          src={selectedCampaignDetails.image} 
                          alt={selectedCampaignDetails.title}
                          className="w-20 h-20 rounded-xl object-cover border-2 border-[#3a3a43]"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x80/2c2f32/808191?text=📷';
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
                            {parseFloat(selectedCampaignDetails.amountCollected).toFixed(4)} ETH
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
                            {parseFloat(selectedCampaignDetails.target).toFixed(2)} ETH
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
                    Vous pouvez retirer vers ce portefeuille
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