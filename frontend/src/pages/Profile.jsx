// pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DisplayCampaigns, CustomButton } from '../components';
import { useStateContext } from '../context';
import { money } from '../assets';

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState(null);

  const { getUserCampaigns, getCampaigns, address, isInitialized, connect } = useStateContext();
  const navigate = useNavigate();

  const fetchCampaigns = async () => {
    if (!address || !isInitialized) {
      setCampaigns([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log('Profile.fetchCampaigns - address:', address, 'isInitialized:', isInitialized);

      // Helper: robust ownership detection across possible API shapes
      const isOwnedByAddress = (campaign, addr) => {
        if (!campaign || !addr) return false;
        const a = addr.toLowerCase();
        const ownersToCheck = [
          campaign.owner,
          campaign.owner_address,
          campaign.ownerAddress,
          campaign.creator,
          campaign.createdBy,
          campaign.created_by,
          campaign.user,
          // some APIs may nest owner object
          campaign.owner?.address,
          campaign.user?.address,
        ];
        for (const o of ownersToCheck) {
          if (!o) continue;
          try {
            if (typeof o === 'string' && o.toLowerCase() === a) return true;
            if (typeof o === 'object' && o.address && typeof o.address === 'string' && o.address.toLowerCase() === a) return true;
          } catch (e) {
            // ignore
          }
        }
        return false;
      };

      // Prefer the dedicated helper, pass address explicitly to avoid desync
      let data = await getUserCampaigns(address);
      console.log('getUserCampaigns result:', (data && data.length) || 0);

      // If helper returned empty (possible desync or missing server support), fallback to fetching all campaigns and filter locally
      if ((!data || data.length === 0) && typeof getCampaigns === 'function') {
        try {
          const all = await getCampaigns();
          const filtered = (all || []).filter(c => isOwnedByAddress(c, address));
          console.log('Fallback getCampaigns -> filtered count:', filtered.length);
          data = filtered;
        } catch (err) {
          console.warn('Fallback filtering failed:', err.message);
        }
      }

      // As an extra safeguard, always enforce ownership filter client-side
      const finalList = (data || []).filter(c => isOwnedByAddress(c, address));
      setCampaigns(finalList);
      console.log('Campagnes récupérées (après filtrage):', finalList.length);
    } catch (error) {
      console.error('Erreur chargement campagnes:', error);
      setError(error.message);
      setCampaigns([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isInitialized && address) {
      fetchCampaigns();
    } else {
      setCampaigns([]);
    }
  }, [isInitialized, address]);

  const handleConnectAndLoad = async () => {
    try {
      await connect();
      await fetchCampaigns();
    } catch (error) {
      console.error('Erreur connexion:', error);
    }
  };

  return (
    <div>
      {!isInitialized && (
        <div className="bg-[#1c1c24] p-6 rounded-[10px] mb-6 text-center">
          <p className="text-[#808191] mb-4">Veuillez vous connecter pour voir vos campagnes</p>
          <button 
            onClick={handleConnectAndLoad}
            className="bg-[#8c6dfd] text-white px-6 py-3 rounded-[10px] font-epilogue font-semibold"
          >
            Se connecter
          </button>
        </div>
      )}

      {isInitialized && !address && (
        <div className="bg-[#1c1c24] p-6 rounded-[10px] mb-6 text-center">
          <p className="text-[#808191]">Aucun portefeuille connecté</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500 p-4 rounded-[10px] mb-6">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Always show section title */}
      <div className="mb-6">
        <h1 className="font-epilogue font-semibold text-[24px] text-white">Vos Campagnes</h1>
      </div>

      {isLoading ? (
        <DisplayCampaigns 
            title=""
            isLoading={isLoading}
            campaigns={campaigns}
            preferPropCampaigns={true}
          />
      ) : campaigns && campaigns.length === 0 ? (
        <div className="bg-[#1c1c24] p-6 rounded-[10px] text-center text-[#808191]">
          <div className="max-w-md mx-auto">
            <img src={money} alt="empty" className="mx-auto w-32 h-32 mb-4 opacity-90" />
            <h3 className="text-white font-bold text-xl mb-2">Aucune campagne trouvée</h3>
            <p className="text-[#b2b2bf] mb-4">Vous n'avez actuellement aucune campagne associée à votre adresse.</p>
            <div className="flex items-center justify-center gap-3">
              <CustomButton
                btnType="button"
                title="➕ Créer une campagne"
                handleClick={() => navigate('/create-campaign')}
                styles="px-4 py-2 bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d] text-white rounded"
              />
              <CustomButton
                btnType="button"
                title="🔄 Rafraîchir"
                handleClick={() => fetchCampaigns()}
                styles="px-4 py-2 bg-[#3a3a43] text-white rounded"
              />
            </div>
            <p className="text-xs text-[#808191] mt-3">Adresse connectée: {address ? `${address.substring(0,6)}...${address.substring(address.length - 4)}` : 'Inconnue'}</p>
          </div>
        </div>
      ) : (
        <DisplayCampaigns 
          title=""
          isLoading={isLoading}
          campaigns={campaigns}
          preferPropCampaigns={true}
        />
      )}
    </div>
  );
};

export default Profile;