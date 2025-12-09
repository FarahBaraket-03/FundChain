import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStateContext } from '../context';
import { CustomButton } from './';
import { logo, menu, search } from '../assets';
import { navlinks } from '../constants';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isActive, setIsActive] = useState('dashboard');
  const [toggleDrawer, setToggleDrawer] = useState(false);
  const { 
    connect, 
    address, 
    getShortAddress, 
    searchCampaigns, 
    clearSearch, 
    searchTerm,
    isLoading 
  } = useStateContext();
  
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Synchroniser avec le contexte
  useEffect(() => {
    setLocalSearchTerm(searchTerm || '');
  }, [searchTerm]);

  // Générer des suggestions basées sur l'historique ou les tendances
  const generateSuggestions = (term) => {
    if (!term || term.trim().length < 2) {
      setSearchSuggestions([]);
      return;
    }
    
    // Suggestions par défaut (à remplacer par des suggestions réelles)
    const defaultSuggestions = [
      { type: 'suggestion', text: term + ' campagnes' },
      { type: 'suggestion', text: term + ' financement' },
      { type: 'suggestion', text: 'Projets ' + term },
    ];
    
    setSearchSuggestions(defaultSuggestions);
  };

  // Fonction pour gérer la recherche
  const handleSearch = () => {
    if (localSearchTerm.trim() !== '') {
      searchCampaigns(localSearchTerm);
      setShowSuggestions(false);
      
      // Naviguer vers la page d'accueil si on est ailleurs
      if (location.pathname !== '/') {
        navigate('/');
      }
    } else {
      // Si vide, effacer la recherche
      handleClearSearch();
    }
  };

  // Fonction pour effacer la recherche
  const handleClearSearch = () => {
    setLocalSearchTerm('');
    clearSearch();
    setShowSuggestions(false);
  };

  // Fonction pour gérer la touche Entrée
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
      setShowSuggestions(false);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      if (localSearchTerm.trim() === '') {
        handleClearSearch();
      }
    }
  };

  // Sélectionner une suggestion
  const handleSuggestionClick = (suggestionText) => {
    setLocalSearchTerm(suggestionText);
    searchCampaigns(suggestionText);
    setShowSuggestions(false);
    
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  // Recherche en temps réel avec délai
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const v = localSearchTerm.trim();
      if (v !== '') {
        // update suggestions
        generateSuggestions(v);
        // perform search for live filtering (allow short terms >=1)
        searchCampaigns(v);
      } else {
        setSearchSuggestions([]);
        // clear global search results when input emptied
        clearSearch();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [localSearchTerm]);

  return (
    <div className="flex md:flex-row flex-col-reverse justify-between mb-[35px] gap-6 relative">
      {/* Barre de recherche améliorée avec suggestions */}
      <div className="lg:flex-1 flex flex-row max-w-[458px] py-2 pl-4 pr-2 h-[52px] bg-[#1c1c24] rounded-[100px] border border-[#2c2f32] hover:border-[#4acd8d] transition-colors duration-300 relative">
        <div className="flex items-center flex-1">
          <svg 
            className="w-5 h-5 text-[#4acd8d] mr-3 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Rechercher des campagnes, catégories..." 
            className="flex w-full font-epilogue font-normal text-[14px] placeholder:text-[#4b5264] text-white bg-transparent outline-none"
            value={localSearchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setLocalSearchTerm(value);
              setShowSuggestions(true);
              
              // Recherche en temps réel pour les termes longs
              if (value.length >= 3) {
                searchCampaigns(value);
              } else if (value.trim() === '') {
                clearSearch();
              }
            }}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {localSearchTerm && (
            <button 
              onClick={handleClearSearch}
              className="ml-2 p-1 rounded-full hover:bg-[#2c2f32] transition-colors duration-200 flex-shrink-0"
              title="Effacer la recherche"
              type="button"
            >
              <svg className="w-4 h-4 text-[#808191]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <button
          type="button"
          className={`w-[72px] h-full rounded-[20px] flex justify-center items-center cursor-pointer transition-all duration-200 ${
            localSearchTerm && !isLoading
              ? 'bg-[#1dc071] hover:bg-[#16a05a]' 
              : isLoading 
                ? 'bg-[#4acd8d] opacity-50 cursor-not-allowed' 
                : 'bg-[#4acd8d] hover:bg-[#3dbd7d]'
          }`}
          onClick={handleSearch}
          disabled={isLoading}
          aria-label="Rechercher"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <img src={search} alt="search" className="w-[15px] h-[15px] object-contain"/>
          )}
        </button>

        {/* Suggestions de recherche */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c1c24] border border-[#2c2f32] rounded-[15px] shadow-2xl z-50 overflow-hidden">
            <div className="p-2 border-b border-[#2c2f32]">
              <p className="font-epilogue font-normal text-[12px] text-[#808191] px-3 py-1">
                Suggestions
              </p>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-[#2c2f32] transition-colors duration-200 flex items-center gap-3"
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <svg className="w-4 h-4 text-[#4acd8d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="font-epilogue font-normal text-[14px] text-white">
                    {suggestion.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Indicateur de recherche active */}
      {searchTerm && searchTerm.trim() !== '' && (
        <div className="absolute top-full left-0 mt-2 bg-[#1dc071] text-white text-xs font-epilogue px-3 py-1 rounded-full animate-pulse">
          Recherche active
        </div>
      )}

      <div className="sm:flex hidden flex-row justify-end gap-4">
        <CustomButton 
          btnType="button"
          title={address ? 'Create a campaign' : 'Connect'}
          styles={address ? 'bg-[#1dc071]' : 'bg-[#8c6dfd]'}
          handleClick={() => {
            if(address) navigate('create-campaign')
            else connect()
          }}
        />

        <Link to="/profile">
          <div className="w-[52px] h-[52px] rounded-full bg-[#2c2f32] flex justify-center items-center cursor-pointer hover:bg-[#3a3a43] transition-colors duration-200">
            <div className="w-[60%] h-[60%] bg-[#8c6dfd] rounded-full flex items-center justify-center text-white font-bold text-[10px] hover:bg-[#7b5ef7] transition-colors duration-200">
              {address ? getShortAddress(address).substring(0, 2) : '??'}
            </div>
          </div>
        </Link>
      </div>

      {/* Small screen navigation */}
      <div className="sm:hidden flex justify-between items-center relative">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#2c2f32] flex justify-center items-center cursor-pointer">
          <img src={logo} alt="user" className="w-[60%] h-[60%] object-contain" />
        </div>

        <img 
          src={menu}
          alt="menu"
          className="w-[34px] h-[34px] object-contain cursor-pointer"
          onClick={() => setToggleDrawer((prev) => !prev)}
        />

        <div className={`absolute top-[60px] right-0 left-0 bg-[#1c1c24] z-10 shadow-secondary py-4 ${!toggleDrawer ? '-translate-y-[100vh]' : 'translate-y-0'} transition-all duration-700`}>
          <ul className="mb-4">
            {navlinks.map((link) => (
              <li
                key={link.name}
                className={`flex p-4 ${isActive === link.name && 'bg-[#3a3a43]'} hover:bg-[#2c2f32] transition-colors duration-200`}
                onClick={() => {
                  setIsActive(link.name);
                  setToggleDrawer(false);
                  navigate(link.link);
                }}
              >
                <img 
                  src={link.imgUrl}
                  alt={link.name}
                  className={`w-[24px] h-[24px] object-contain ${isActive === link.name ? 'grayscale-0' : 'grayscale'}`}
                />
                <p className={`ml-[20px] font-epilogue font-semibold text-[14px] ${isActive === link.name ? 'text-[#1dc071]' : 'text-[#808191]'}`}>
                  {link.name}
                </p>
              </li>
            ))}
          </ul>

          {/* Barre de recherche mobile */}
          <div className="px-4 mb-4">
            <div className="flex items-center bg-[#2c2f32] rounded-[100px] px-4 py-2">
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="flex-1 font-epilogue font-normal text-[14px] placeholder:text-[#4b5264] text-white bg-transparent outline-none"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-[#4acd8d] flex justify-center items-center cursor-pointer ml-2"
                onClick={handleSearch}
              >
                {isLoading ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <img src={search} alt="search" className="w-3 h-3 object-contain"/>
                )}
              </button>
            </div>
            {searchTerm && (
              <div className="mt-2 flex items-center justify-between px-2">
                <span className="font-epilogue font-normal text-[12px] text-[#4acd8d]">
                  "{searchTerm}"
                </span>
                <button
                  onClick={handleClearSearch}
                  className="text-[10px] text-[#808191] hover:text-white"
                >
                  Effacer
                </button>
              </div>
            )}
          </div>

          <div className="flex mx-4">
            <CustomButton 
              btnType="button"
              title={address ? 'Create a campaign' : 'Connect'}
              styles={address ? 'bg-[#1dc071]' : 'bg-[#8c6dfd]'}
              handleClick={() => {
                if(address) navigate('create-campaign')
                else connect();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar