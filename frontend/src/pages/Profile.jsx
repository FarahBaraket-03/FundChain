// pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { DisplayCampaigns } from '../components';
import { useStateContext } from '../context';

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState(null);

  const { getUserCampaigns, address, isInitialized, connect } = useStateContext();

  const fetchCampaigns = async () => {
    if (!address || !isInitialized) {
      setCampaigns([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserCampaigns();
      setCampaigns(data);
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

      <DisplayCampaigns 
        title="Vos Campagnes"
        isLoading={isLoading}
        campaigns={campaigns}
      />
    </div>
  );
};

export default Profile;