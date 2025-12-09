import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import FundCard from './FundCard';
import { loader } from '../assets';
import { useStateContext } from '../context';
import { CustomButton } from './';

const DisplayCampaigns = ({ 
  title, 
  campaigns: propCampaigns, 
  showCancelButton = false, 
  onCampaignUpdate,
  isLoading = false,
  showFilters = true,
  emptyStateMessage,
  emptyStateAction,
  forceRefresh = false,
  preferPropCampaigns = false,
}) => {
  const navigate = useNavigate();
  const { 
    address, 
    cancelCampaign, 
    isLoading: contextLoading, 
    filteredCampaigns, 
    searchTerm,
    clearSearch,
    categories,
    getSearchStats,
    loadAllCampaigns
  } = useStateContext();
  
  const [sortBy, setSortBy] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  // Determine which campaigns to display:
  // - If a live search is active, prefer `filteredCampaigns` so search filters results.
  // - Otherwise, if the caller explicitly passes `propCampaigns`, use them when requested via `preferPropCampaigns`.
  // - Fallback to `propCampaigns` or `filteredCampaigns` as available.
  const campaignsToDisplay = useMemo(() => {
    const hasSearch = searchTerm && searchTerm.trim() !== '';
    if (hasSearch && filteredCampaigns && filteredCampaigns.length > 0) {
      return filteredCampaigns;
    }
    if (preferPropCampaigns && propCampaigns && propCampaigns.length > 0) {
      return propCampaigns;
    }
    // If no preference, fall back to propCampaigns if provided, otherwise filteredCampaigns
    if (propCampaigns && propCampaigns.length > 0) return propCampaigns;
    if (filteredCampaigns && filteredCampaigns.length > 0) return filteredCampaigns;
    return [];
  }, [filteredCampaigns, propCampaigns, searchTerm, preferPropCampaigns]);

  // Rafraîchir les données si demandé
  useEffect(() => {
    if (forceRefresh) {
      loadAllCampaigns();
    }
  }, [forceRefresh, loadAllCampaigns]);

  // Réinitialiser la pagination quand les filtres ou la recherche changent
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, filterStatus, selectedCategory, searchTerm, campaignsToDisplay]);

  // Fonctions restantes identiques à celles que vous avez déjà...
  // (handleNavigate, handleCancelCampaign, canCancelCampaign, getCampaignStatus)

  const handleNavigate = (campaign) => {
    navigate(`/campaign-details/${campaign.pId}`, { state: campaign });
  };

  const handleCancelCampaign = async (campaignId, campaignTitle, e) => {
    e.stopPropagation();
    
    if (!window.confirm(`Êtes-vous sûr de vouloir annuler la campagne "${campaignTitle}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      await cancelCampaign(campaignId);
      alert('Campagne annulée avec succès !');
      if (onCampaignUpdate) {
        onCampaignUpdate();
      }
      // Recharger les campagnes après annulation
      loadAllCampaigns();
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      alert('Erreur lors de l\'annulation: ' + error.message);
    }
  };

  const canCancelCampaign = (campaign) => {
    if (!address || campaign.owner.toLowerCase() !== address.toLowerCase()) {
      return false;
    }
    
    if (!campaign.isActive) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const isEnded = currentTime > Number(campaign.deadline);
    
    if (isEnded) {
      const goalReached = parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);
      return !goalReached;
    }
    
    return true;
  };

  

  const getCampaignStatus = (campaign) => {
    if (!campaign) return null; // AJOUTER CETTE VÉRIFICATION
    
    console.log('Vérification du statut pour la campagne:', campaign);
    const currentTime = Math.floor(Date.now() / 1000);
    const isEnded = currentTime > Number(campaign.deadline);
    const goalReached = parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);

    if (!campaign.isActive && goalReached) return 'success';
    if (isEnded && !goalReached) return 'failed';
    if (!campaign.isActive) return 'cancelled';
    if (campaign.isActive && !isEnded) return 'active';
    
    
    return 'ended';
  };

  // Fonctions de tri et filtrage (comme dans la version précédente)
  const sortOptions = [
    { value: 'newest', label: 'Plus récent' },
    { value: 'oldest', label: 'Plus ancien' },
    { value: 'most-funded', label: 'Plus financé' },
    { value: 'least-funded', label: 'Moins financé' },
    { value: 'ending-soon', label: 'Se termine bientôt' },
    { value: 'most-urgent', label: 'Plus urgent' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'active', label: 'Actives' },
    { value: 'success', label: 'Réussies' },
    { value: 'failed', label: 'Échouées' },
    { value: 'cancelled', label: 'Annulées' },
  ];

  const getSortedAndFilteredCampaigns = useMemo(() => {
    let campaigns = campaignsToDisplay.map(campaign => ({
      ...campaign,
      status: getCampaignStatus(campaign),
      progress: parseFloat(campaign.amountCollected) / parseFloat(campaign.target) * 100,
      daysLeft: Math.max(0, Number(campaign.deadline) - Math.floor(Date.now() / 1000)) / 86400
    }));

    // Filtrage par statut
    if (filterStatus !== 'all') {
      campaigns = campaigns.filter(campaign => campaign.status === filterStatus);
    }

    // Filtrage par catégorie
    if (selectedCategory !== 'all') {
      campaigns = campaigns.filter(campaign => 
        campaign.category && campaign.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Tri
    campaigns.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.pId - a.pId;
        case 'oldest':
          return a.pId - b.pId;
        case 'most-funded':
          return b.progress - a.progress;
        case 'least-funded':
          return a.progress - b.progress;
        case 'ending-soon':
          return a.daysLeft - b.daysLeft;
        case 'most-urgent':
          const aIsUrgent = a.daysLeft <= 7;
          const bIsUrgent = b.daysLeft <= 7;
          if (aIsUrgent && !bIsUrgent) return -1;
          if (!aIsUrgent && bIsUrgent) return 1;
          return a.daysLeft - b.daysLeft;
        default:
          return 0;
      }
    });

    return campaigns;
  }, [campaignsToDisplay, filterStatus, selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(getSortedAndFilteredCampaigns.length / itemsPerPage);
  const paginatedCampaigns = getSortedAndFilteredCampaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const loadingState = isLoading || contextLoading;

  // Message d'état vide
  const getEmptyStateMessage = () => {
    if (emptyStateMessage) return emptyStateMessage;
    
    if (searchTerm && searchTerm.trim() !== '') {
      return `Aucune campagne trouvée pour "${searchTerm}"`;
    }
    
    if (filterStatus !== 'all') {
      return `Aucune campagne ${statusOptions.find(s => s.value === filterStatus)?.label?.toLowerCase()}`;
    }
    
    if (selectedCategory !== 'all') {
      return `Aucune campagne dans la catégorie "${selectedCategory}"`;
    }
    
    if (title.includes("Your") || title.includes("Vos")) {
      return "Vous n'avez créé aucune campagne pour le moment";
    }
    
    return "Aucune campagne disponible pour le moment";
  };

  // Rendu de la pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pageNumbers.push(i);
      } else if (pageNumbers[pageNumbers.length - 1] !== '...') {
        pageNumbers.push('...');
      }
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 bg-[#2c2f32] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a3a43] transition-colors"
        >
          Précédent
        </button>
        
        {pageNumbers.map((num, index) => (
          num === '...' ? (
            <span key={`dots-${index}`} className="px-3 py-2 text-[#808191]">...</span>
          ) : (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentPage === num
                  ? 'bg-[#4acd8d] text-white'
                  : 'bg-[#2c2f32] text-white hover:bg-[#3a3a43]'
              }`}
            >
              {num}
            </button>
          )
        ))}
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 bg-[#2c2f32] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a3a43] transition-colors"
        >
          Suivant
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques de recherche */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="font-epilogue font-semibold text-[24px] text-white">
            {title}
          </h1>
          <p className="font-epilogue font-normal text-[14px] text-[#808191] mt-1">
            {getSortedAndFilteredCampaigns.length} campagne{getSortedAndFilteredCampaigns.length !== 1 ? 's' : ''} 
            {searchTerm && (
              <span className="text-[#4acd8d] ml-2">
                (Recherche: "{searchTerm}")
              </span>
            )}
          </p>
        </div>
        
        {/* Bouton pour effacer la recherche */}
        {searchTerm && (
          <CustomButton
            title="Effacer la recherche"
            handleClick={clearSearch}
            variant="outline"
            size="sm"
          />
        )}
      </div>

      {/* Le reste du code reste le même que dans la version précédente */}
      {/* ... (filtres, grille de campagnes, pagination) */}
      
      {loadingState ? (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain animate-spin" />
          <p className="mt-4 font-epilogue font-semibold text-[18px] text-white">
            {searchTerm ? 'Recherche en cours...' : 'Chargement des campagnes...'}
          </p>
        </div>
      ) : getSortedAndFilteredCampaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[300px] bg-[#1c1c24] rounded-[15px] p-8">
          <svg className="w-24 h-24 text-[#4b5264]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-6 font-epilogue font-semibold text-[18px] text-[#808191] text-center mb-2">
            {getEmptyStateMessage()}
          </p>
          <div className="flex gap-3 mt-4">
            {searchTerm && (
              <CustomButton
                title="Effacer la recherche"
                handleClick={clearSearch}
                variant="outline"
                size="sm"
              />
            )}
            {(filterStatus !== 'all' || selectedCategory !== 'all') && (
              <CustomButton
                title="Réinitialiser les filtres"
                handleClick={() => {
                  setFilterStatus('all');
                  setSelectedCategory('all');
                }}
                variant="outline"
                size="sm"
              />
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Barre de filtres (identique à la version précédente) */}
          {showFilters && (
            <div className="bg-[#1c1c24] rounded-[15px] p-4 space-y-4">
              {/* ... code des filtres ... */}
            </div>
          )}
          
          {/* Grille de campagnes */}
          <div className={`grid ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'grid-cols-1 gap-4'
          }`}>
            {paginatedCampaigns.map((campaign, index) => (
              <FundCard 
                key={campaign.pId || `campaign-${index}`}
                {...campaign}
                handleClick={() => handleNavigate(campaign)}
                showCancelButton={showCancelButton}
                canCancel={canCancelCampaign(campaign)}
                isCancelling={contextLoading}
                onCancel={(e) => handleCancelCampaign(campaign.pId, campaign.title, e)}
                campaignStatus={getCampaignStatus(campaign)}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {renderPagination()}
          
          {/* Info de pagination */}
          {getSortedAndFilteredCampaigns.length > itemsPerPage && (
            <div className="text-center font-epilogue font-normal text-[14px] text-[#808191] mt-4">
              Affichage {Math.min((currentPage - 1) * itemsPerPage + 1, getSortedAndFilteredCampaigns.length)}-
              {Math.min(currentPage * itemsPerPage, getSortedAndFilteredCampaigns.length)} sur {getSortedAndFilteredCampaigns.length} campagnes
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default DisplayCampaigns