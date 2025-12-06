import React from 'react';
import { tagType, thirdweb } from '../assets';
import { daysLeft } from '../utils';

const FundCard = ({ 
  pId, 
  owner, 
  title, 
  description, 
  target, 
  deadline, 
  amountCollected, 
  image, 
  handleClick,
  // Nouvelles props pour l'annulation
  showCancelButton = false,
  canCancel = false,
  isCancelling = false,
  onCancel,
  campaignStatus = 'active'
}) => {
  const remainingDays = daysLeft(deadline);
  
  // Styles conditionnels basés sur le statut
  const getStatusStyles = () => {
    switch (campaignStatus) {
      case 'cancelled':
        return 'border-red-500 bg-red-500/10';
      case 'success':
        return 'border-green-500 bg-green-500/10';
      case 'failed':
        return 'border-orange-500 bg-orange-500/10';
      default:
        return 'border-[#4acd8d]';
    }
  }

  const getStatusText = () => {
    switch (campaignStatus) {
      case 'cancelled':
        return 'Annulée';
      case 'success':
        return 'Réussie';
      case 'failed':
        return 'Échouée';
      default:
        return `${remainingDays} jours restants`;
    }
  }

  return (
    <div 
      className={`sm:w-[288px] w-full rounded-[15px] bg-[#1c1c24] cursor-pointer border-2 ${getStatusStyles()} transition-all duration-300 hover:scale-105 hover:shadow-xl`}
      onClick={handleClick}
    >
      <img 
        src={image} 
        alt="fund" 
        className="w-full h-[158px] object-cover rounded-t-[15px]" 
      />

      <div className="flex flex-col p-4">
        {/* Badge de statut */}
        <div className="flex items-center mb-2">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            campaignStatus === 'active' ? 'bg-[#4acd8d]' :
            campaignStatus === 'success' ? 'bg-green-500' :
            campaignStatus === 'failed' ? 'bg-orange-500' :
            'bg-red-500'
          }`} />
          <span className={`text-[12px] font-epilogue font-semibold ${
            campaignStatus === 'active' ? 'text-[#4acd8d]' :
            campaignStatus === 'success' ? 'text-green-500' :
            campaignStatus === 'failed' ? 'text-orange-500' :
            'text-red-500'
          }`}>
            {getStatusText()}
          </span>
        </div>

        <div className="block">
          <h3 className="font-epilogue font-semibold text-[16px] text-white text-left leading-[26px] truncate">
            {title}
          </h3>
          <p className="mt-[5px] font-epilogue font-normal text-[#808191] text-left leading-[18px] truncate">
            {description}
          </p>
        </div>

        <div className="flex justify-between flex-wrap mt-[15px] gap-2">
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">
              {amountCollected} ETH
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">
              Collecté sur {target} ETH
            </p>
          </div>
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">
              {remainingDays}
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">
              Jours restants
            </p>
          </div>
        </div>

        {/* Bouton d'annulation pour le propriétaire */}
        {showCancelButton && canCancel && campaignStatus === 'active' && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#2c2f32]">
            <div className="flex items-center">
              <img 
                src={thirdweb} 
                alt="user" 
                className="w-[30px] h-[30px] rounded-full border-2 border-[#8c6dfd]" 
              />
              <p className="ml-2 font-epilogue font-normal text-[12px] text-[#808191] break-all">
                Votre campagne
              </p>
            </div>
            
            <button
              onClick={onCancel}
              disabled={isCancelling}
              className={`px-3 py-1 text-[12px] font-epilogue font-semibold rounded-[10px] transition-all duration-200 ${
                isCancelling 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isCancelling ? '...' : 'Annuler'}
            </button>
          </div>
        )}

        {/* Indicateur pour les campagnes annulées */}
        {campaignStatus === 'cancelled' && (
          <div className="mt-3 p-2 bg-red-500/20 rounded-[10px] text-center">
            <p className="font-epilogue font-semibold text-[12px] text-red-400">
              Campagne annulée
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FundCard