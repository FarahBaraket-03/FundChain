import React from 'react';
import { useNavigate } from 'react-router-dom';
import FundCard from './FundCard';
import { loader } from '../assets';
import { useStateContext } from '../context';

const DisplayCampaigns = ({ title, isLoading, campaigns, showCancelButton = false, onCampaignUpdate }) => {
  const navigate = useNavigate();
  const { address, cancelCampaign, isLoading: contextLoading } = useStateContext();

  const handleNavigate = (campaign) => {
    navigate(`/campaign-details/${campaign.pId}`, { state: campaign })
  }

  const handleCancelCampaign = async (campaignId, campaignTitle, e) => {
    e.stopPropagation(); // Empêcher la navigation vers les détails
    
    if (!window.confirm(`Êtes-vous sûr de vouloir annuler la campagne "${campaignTitle}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      await cancelCampaign(campaignId);
      alert('Campagne annulée avec succès !');
      // Rafraîchir les données si une fonction de callback est fournie
      if (onCampaignUpdate) {
        onCampaignUpdate();
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      alert('Erreur lors de l\'annulation: ' + error.message);
    }
  }

  // Fonction pour déterminer si l'utilisateur peut annuler une campagne
  const canCancelCampaign = (campaign) => {
    // Vérifier si l'utilisateur est connecté et propriétaire
    if (!address || campaign.owner.toLowerCase() !== address.toLowerCase()) {
      return false;
    }
    
    // Vérifier si la campagne est active
    if (!campaign.isActive) {
      return false;
    }

    // Vérifier si la campagne n'est pas encore terminée
    const currentTime = Math.floor(Date.now() / 1000);
    const isEnded = currentTime > Number(campaign.deadline);
    
    // Permettre l'annulation seulement si la campagne n'est pas terminée
    // ou si elle est terminée mais l'objectif n'est pas atteint
    if (isEnded) {
      const goalReached = parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);
      return !goalReached; // Permettre l'annulation seulement si l'objectif n'est pas atteint
    }
    
    return true; // Permettre l'annulation si la campagne est en cours
  }

  // Fonction pour obtenir le statut de la campagne
  const getCampaignStatus = (campaign) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const isEnded = currentTime > Number(campaign.deadline);
    
    if (!campaign.isActive) return 'cancelled';
    if (isEnded) {
      const goalReached = parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);
      return goalReached ? 'success' : 'failed';
    }
    return 'active';
  }

  return (
    <div>
      <h1 className="font-epilogue font-semibold text-[18px] text-white text-left">
        {title} ({campaigns.length})
      </h1>

      <div className="flex flex-wrap mt-[20px] gap-[26px]">
        {isLoading && (
          <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain" />
        )}

        {!isLoading && campaigns.length === 0 && (
          <p className="font-epilogue font-semibold text-[14px] leading-[30px] text-[#818183]">
            {title.includes("Your") || title.includes("Vos") ? "Vous n'avez créé aucune campagne pour le moment" : "Aucune campagne trouvée"}
          </p>
        )}

        {!isLoading && campaigns.length > 0 && campaigns.map((campaign, index) => (
          <FundCard 
            key={campaign.pId || `campaign-${index}`}
            {...campaign}
            handleClick={() => handleNavigate(campaign)}
            // Props supplémentaires pour l'annulation
            showCancelButton={showCancelButton}
            canCancel={canCancelCampaign(campaign)}
            isCancelling={contextLoading}
            onCancel={(e) => handleCancelCampaign(campaign.pId, campaign.title, e)}
            campaignStatus={getCampaignStatus(campaign)}
          />
        ))}
      </div>
    </div>
  )
}

export default DisplayCampaigns