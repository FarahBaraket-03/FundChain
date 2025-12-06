// pages/CampaignDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useStateContext } from '../context';
import { CountBox, CustomButton, Loader } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';


const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    donate, 
    getDonations, 
    getCampaignDetails, 
    address, 
    isLoading,
    cancelCampaign,
    updateDeadline,
    checkWithdrawalEligibility
  } = useStateContext();

  const [campaign, setCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [donators, setDonators] = useState([]);
  const [isUpdatingDeadline, setIsUpdatingDeadline] = useState(false);
  const [newDeadline, setNewDeadline] = useState('');
  const [withdrawalEligibility, setWithdrawalEligibility] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Icônes alternatives en texte/emoji
  const icons = {
    calendar: '📅',
    edit: '✏️',
    cancel: '❌'
  };

  const fetchCampaignDetails = async () => {
    try {
      setPageLoading(true);
      const data = await getCampaignDetails(id);
      setCampaign(data);
      
      // Vérifier l'éligibilité au retrait si l'utilisateur est connecté
      if (address && data && data.owner.toLowerCase() === address.toLowerCase()) {
        try {
          const eligibility = await checkWithdrawalEligibility(id);
          setWithdrawalEligibility(eligibility);
        } catch (error) {
          console.error('Erreur vérification éligibilité:', error);
        }
      }
    } catch (error) {
      console.error('Erreur chargement détails campagne:', error);
      setCampaign(null);
    } finally {
      setPageLoading(false);
    }
  };

  const fetchDonators = async () => {
    try {
      const data = await getDonations(id);
      setDonators(data);
    } catch (error) {
      console.error('Erreur chargement donateurs:', error);
      setDonators([]);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCampaignDetails();
      fetchDonators();
    }
  }, [id]);

  // Fonction sécurisée pour obtenir le statut de la campagne
  const getCampaignStatus = () => {
    if (!campaign) return null; // AJOUTER CETTE VÉRIFICATION
    
    console.log('Vérification du statut pour la campagne:', campaign);
    const currentTime = Math.floor(Date.now() / 1000);
    const isEnded = currentTime > Number(campaign.deadline);
    const goalReached = parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);

    if (!campaign.isActive && goalReached) return 'success';
    if (!campaign.isActive && !goalReached) return 'failed';
    if (campaign.isActive && !isEnded) return 'active';
    if (!campaign.isActive) return 'cancelled';
    
    return 'ended';
  };

  const getStatusConfig = () => {
    const status = getCampaignStatus();
    
    // AJOUTER UN CAS POUR LE STATUT NULL
    if (status === null) {
      return { 
        text: 'Chargement...', 
        color: 'gray', 
        bgColor: 'bg-gray-500/10', 
        borderColor: 'border-gray-500' 
      };
    }
    
    switch (status) {
      case 'cancelled':
        return { text: 'Campagne Annulée', color: 'red', bgColor: 'bg-red-500/10', borderColor: 'border-red-500' };
      case 'success':
        return { text: 'Objectif Atteint', color: 'green', bgColor: 'bg-green-500/10', borderColor: 'border-green-500' };
      case 'failed':
        return { text: 'Objectif Non Atteint', color: 'orange', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500' };
      case 'ended':
        return { text: 'Terminée', color: 'purple', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500' };
      default:
        return { text: 'En Cours', color: 'blue', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500' };
    }
  };

  // Fonctions sécurisées qui vérifient campaign avant utilisation
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date non disponible';
    return new Date(Number(timestamp) * 1000).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDonate = async () => {
    if (!address) {
      alert('Veuillez vous connecter à votre portefeuille');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Veuillez entrer un montant valide (minimum 0.001 ETH)');
      return;
    }

    if (parseFloat(donationAmount) < 0.001) {
      alert('Le montant minimum est de 0.001 ETH');
      return;
    }

    try {
      await donate(id, donationAmount);
      // Recharger les données après le don
      fetchCampaignDetails();
      fetchDonators();
      setDonationAmount('');
      alert('✅ Don effectué avec succès!');
    } catch (error) {
      console.error('Erreur donation:', error);
      alert('❌ Erreur lors du don: ' + error.message);
    }
  };

  const handleCancelCampaign = async () => {
    if (!campaign) return;
    
    if (!window.confirm(`Êtes-vous sûr de vouloir annuler la campagne "${campaign.title}" ?\n\nCette action est irréversible et permettra aux donateurs de récupérer leurs fonds.`)) {
      return;
    }

    try {
      await cancelCampaign(id);
      alert('✅ Campagne annulée avec succès !');
      fetchCampaignDetails(); // Recharger les données
    } catch (error) {
      console.error('Erreur annulation:', error);
      alert('❌ Erreur lors de l\'annulation: ' + error.message);
    }
  };

  const handleUpdateDeadline = async () => {
    if (!campaign) return;
    
    if (!newDeadline) {
      alert('Veuillez sélectionner une nouvelle date limite');
      return;
    }

    const newDate = new Date(newDeadline);
    const currentDate = new Date();
    
    if (newDate <= currentDate) {
      alert('La nouvelle date doit être dans le futur');
      return;
    }

    if (!window.confirm(`Êtes-vous sûr de vouloir mettre à jour la date limite ?\n\nNouvelle date: ${newDate.toLocaleDateString('fr-FR')}`)) {
      return;
    }

    try {
      await updateDeadline(id, newDeadline);
      alert('✅ Date limite mise à jour avec succès !');
      setIsUpdatingDeadline(false);
      setNewDeadline('');
      fetchCampaignDetails(); // Recharger les données
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      alert('❌ Erreur lors de la mise à jour: ' + error.message);
    }
  };

  const openUpdateDeadlineModal = () => {
    if (!campaign) return;
    
    setIsUpdatingDeadline(true);
    // Pré-remplir avec la date actuelle + 7 jours
    const currentDeadline = new Date(Number(campaign.deadline) * 1000);
    const oneWeekLater = new Date(currentDeadline.getTime() + 7 * 24 * 60 * 60 * 1000);
    setNewDeadline(oneWeekLater.toISOString().split('T')[0]);
  };

  // Définir les variables conditionnelles APRÈS les vérifications
  const status = getCampaignStatus();
  const isOwner = address && campaign && campaign.owner.toLowerCase() === address.toLowerCase();
  const canUpdateDeadline = isOwner && status === 'active';
  const canCancelCampaign = isOwner && status === 'active';
  const statusConfig = getStatusConfig();
  const remainingDays = campaign ? daysLeft(campaign.deadline) : 0;
  const campaignStatus = campaign ? getCampaignStatus() : null;

  // Afficher le loader pendant le chargement
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#1c1c24] flex items-center justify-center">
        <Loader message="Chargement des détails de la campagne..." />
      </div>
    );
  }

  // Afficher un message si la campagne n'est pas trouvée
  if (!campaign) {
    return (
      <div className="min-h-screen bg-[#1c1c24] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-[#2c2f32] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-[48px]">❌</span>
          </div>
          <h1 className="font-epilogue font-bold text-[32px] text-white mb-4">
            Campagne Non Trouvée
          </h1>
          <p className="font-epilogue font-normal text-[18px] text-[#808191] mb-8 max-w-md">
            La campagne que vous recherchez n'existe pas ou n'a pas pu être chargée.
          </p>
          <CustomButton 
            btnType="button"
            title="Retour à l'Accueil"
            styles="bg-[#8c6dfd] hover:bg-[#7b5dfa]"
            handleClick={() => navigate('/')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1c1c24] py-8">
      {isLoading && <Loader />}

      {/* Modal de mise à jour de deadline */}
      {isUpdatingDeadline && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2c2f32] rounded-[20px] p-6 w-full max-w-md border-2 border-[#8c6dfd]">
            <h3 className="font-epilogue font-bold text-[22px] text-white mb-4 text-center">
              {icons.calendar} Modifier la Date Limite
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="font-epilogue font-semibold text-[16px] text-white mb-3 block">
                  Nouvelle date limite
                </label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1c1c24] border-2 border-[#3a3a43] rounded-[15px] text-white font-epilogue focus:border-[#8c6dfd] focus:outline-none transition-colors"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="font-epilogue font-normal text-[12px] text-[#808191] mt-2">
                  Date actuelle: {formatDate(campaign.deadline)}
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsUpdatingDeadline(false)}
                  className="flex-1 px-4 py-3 bg-[#6c757d] text-white rounded-[15px] font-epilogue font-semibold hover:bg-[#5a6268] transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateDeadline}
                  disabled={!newDeadline || isLoading}
                  className="flex-1 px-4 py-3 bg-[#8c6dfd] text-white rounded-[15px] font-epilogue font-semibold hover:bg-[#7b5dfa] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Mise à jour...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête avec statut */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="font-epilogue font-bold text-[32px] text-white leading-tight">
              {campaign.title}
            </h1>
            {campaign && (
              <div className={`inline-flex items-center px-4 py-2 rounded-full mt-2 ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
                <span className={`font-epilogue font-semibold text-[14px] ${statusConfig.color === 'gray' ? 'text-gray-400' : statusConfig.color === 'red' ? 'text-red-400' : statusConfig.color === 'green' ? 'text-green-400' : statusConfig.color === 'orange' ? 'text-orange-400' : statusConfig.color === 'purple' ? 'text-purple-400' : 'text-blue-400'}`}>
                  {statusConfig.text}
                </span>
              </div>
            )}
          </div>
          
          {/* Actions du propriétaire */}
          {isOwner && (
            <div className="flex flex-wrap gap-3">
              {canUpdateDeadline && (
                <button
                  onClick={openUpdateDeadlineModal}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-[#8c6dfd] hover:bg-[#7b5dfa] text-white rounded-[15px] font-epilogue font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  <span className="mr-2 text-[16px]">{icons.edit}</span>
                  Modifier Date
                </button>
              )}
              
              {canCancelCampaign && (
                <button
                  onClick={handleCancelCampaign}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-[15px] font-epilogue font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  <span className="mr-2 text-[16px]">{icons.cancel}</span>
                  Annuler
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="xl:col-span-2 space-y-8">
            {/* Image et progression */}
            <div className="bg-[#2c2f32] rounded-[20px] overflow-hidden border-2 border-[#3a3a43]">
              <img 
                src={campaign.image} 
                alt="campaign" 
                className="w-full h-[400px] object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400/2c2f32/808191?text=Image+Non+Disponible';
                }} 
              />
              
              {/* Barre de progression */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-epilogue font-semibold text-[16px] text-[#b2b3bd]">
                    Progression
                  </span>
                  <span className="font-epilogue font-bold text-[18px] text-[#4acd8d]">
                    {calculateBarPercentage(campaign.target, campaign.amountCollected)}%
                  </span>
                </div>
                <div className="w-full bg-[#1c1c24] rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-[#4acd8d] to-[#8c6dfd] h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${calculateBarPercentage(campaign.target, campaign.amountCollected)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="font-epilogue font-normal text-[14px] text-[#808191]">
                    0 ETH
                  </span>
                  <span className="font-epilogue font-normal text-[14px] text-[#808191]">
                    {campaign.target} ETH
                  </span>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CountBox 
                title="Jours Restants" 
                value={remainingDays} 
                icon={icons.calendar}
                subtitle={formatDate(campaign.deadline)}
              />
              <CountBox 
                title="Montant Collecté" 
                value={`${campaign.amountCollected} ETH`}
                subtitle={`Objectif: ${campaign.target} ETH`}
              />
              <CountBox 
                title="Total Donateurs" 
                value={donators.length}
                subtitle="Soutiens"
              />
            </div>

            {/* Informations détaillées */}
            <div className="bg-[#2c2f32] rounded-[20px] p-6 border-2 border-[#3a3a43]">
              <h3 className="font-epilogue font-bold text-[24px] text-white mb-6 flex items-center">
                <div className="w-2 h-6 bg-[#8c6dfd] rounded-full mr-3"></div>
                À Propos de cette Campagne
              </h3>

              {/* Créateur */}
              <div className="mb-6">
                <h4 className="font-epilogue font-semibold text-[18px] text-white mb-4">Créateur</h4>
                <div className="flex items-center gap-4 p-4 bg-[#1c1c24] rounded-[15px]">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d]">
                    <div className="w-14 h-14 bg-[#2c2f32] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-[18px]">
                        {campaign.owner ? campaign.owner.substring(2, 4).toUpperCase() : '??'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-epilogue font-semibold text-[16px] text-white break-all">
                      {isOwner ? 'Vous' : campaign.owner}
                    </h5>
                    <p className="font-epilogue font-normal text-[14px] text-[#808191]">
                      {isOwner ? 'Propriétaire de la campagne' : 'Créateur de la campagne'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="font-epilogue font-semibold text-[18px] text-white mb-4">Description</h4>
                <div className="p-4 bg-[#1c1c24] rounded-[15px]">
                  <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-relaxed">
                    {campaign.description}
                  </p>
                </div>
              </div>

              {/* Donateurs */}
              <div>
                <h4 className="font-epilogue font-semibold text-[18px] text-white mb-4">
                  Donateurs ({donators.length})
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {donators.length > 0 ? donators.map((item, index) => (
                    <div 
                      key={`${item.donator}-${index}`} 
                      className="flex justify-between items-center p-3 bg-[#1c1c24] rounded-[10px] hover:bg-[#25252e] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#8c6dfd] rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-[12px]">
                            {index + 1}
                          </span>
                        </div>
                        <p className="font-epilogue font-normal text-[14px] text-[#b2b3bd]">
                          {item.donator === address ? 
                            'Vous' : 
                            `${item.donator.substring(0, 6)}...${item.donator.substring(38)}`
                          }
                        </p>
                      </div>
                      <p className="font-epilogue font-semibold text-[16px] text-[#4acd8d]">
                        {item.donation} ETH
                      </p>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-[#3a3a43] rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-[#808191] text-2xl">💫</span>
                      </div>
                      <p className="font-epilogue font-normal text-[16px] text-[#808191]">
                        Aucun donateur pour le moment. Soyez le premier !
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Faire un don */}
          <div className="xl:col-span-1">
            <div className="bg-[#2c2f32] rounded-[20px] p-6 border-2 border-[#3a3a43] sticky top-8">
              <h3 className="font-epilogue font-bold text-[24px] text-white mb-6 text-center">
                Soutenir cette Campagne
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="font-epilogue font-semibold text-[16px] text-white mb-2 block">
                    Montant du don (ETH)
                  </label>
                  <input 
                    type="number"
                    placeholder="0.1"
                    step="0.001"
                    min="0.001"
                    className="w-full px-4 py-3 bg-[#1c1c24] border-2 border-[#3a3a43] rounded-[15px] text-white font-epilogue text-[18px] placeholder:text-[#4b5264] focus:border-[#8c6dfd] focus:outline-none transition-colors"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                  />
                  <p className="font-epilogue font-normal text-[12px] text-[#808191] mt-2">
                    Montant minimum: 0.001 ETH
                  </p>
                </div>

                <div className="p-4 bg-[#1c1c24] rounded-[15px] border border-[#3a3a43]">
                  <h4 className="font-epilogue font-semibold text-[16px] text-white mb-2">
                    💫 Pourquoi soutenir ?
                  </h4>
                  <p className="font-epilogue font-normal text-[14px] text-[#808191] leading-relaxed">
                    Votre soutien permet de concrétiser ce projet. Chaque contribution, même modeste, fait la différence.
                  </p>
                </div>

                <CustomButton 
                  btnType="button"
                  title={!address ? "Connectez-vous" : "Faire un Don"}
                  styles="w-full bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d] hover:from-[#7b5dfa] hover:to-[#3dbc7d] py-4 rounded-[15px] font-bold text-[18px]"
                  handleClick={handleDonate}
                  disabled={!address || isLoading || (campaignStatus !== 'active' && campaignStatus !== null)}
                />

                {campaignStatus && campaignStatus !== 'active' && campaignStatus !== 'ended' && (
                  <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-[10px] text-center">
                    <p className="font-epilogue font-semibold text-[14px] text-yellow-400">
                      {campaignStatus === 'cancelled' ? 'Campagne annulée' : 
                       campaignStatus === 'success' ? 'Objectif atteint' : 
                       'Objectif non atteint'}
                    </p>
                  </div>
                )}

                {/* Information retrait pour le propriétaire */}
                {withdrawalEligibility && (
                  <div className={`p-4 rounded-[15px] ${
                    withdrawalEligibility.eligible ? 
                    'bg-green-500/20 border border-green-500/30' : 
                    'bg-blue-500/20 border border-blue-500/30'
                  }`}>
                    <p className="font-epilogue font-semibold text-[14px] text-white mb-2">
                      💰 Statut de retrait
                    </p>
                    <p className="font-epilogue font-normal text-[12px] text-[#808191]">
                      {withdrawalEligibility.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;