// pages/CreateCampaign.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useStateContext } from '../context';
import { money } from '../assets';
import { CustomButton, FormField, Loader } from '../components';
import { checkIfImage } from '../utils';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { createCampaign, address, isLoading } = useStateContext();
  const [form, setForm] = useState({
    name: '',
    title: '',
    description: '',
    target: '', 
    deadline: '',
    image: '',
    category: '',
    link: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  // Ref to prevent duplicate submissions (defensive guard)
  const isSubmittingRef = useRef(false);
  const [showAIModal, setShowAIModal] = useState(false);
  
  // AI Suggestion States
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiError, setAiError] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState(null);
  
  // Ref for AI textarea to keep focus while typing
  const aiTextareaRef = useRef(null);

  const [n8nStatus, setN8nStatus] = useState('pending');

  // Vérifier la connexion n8n au chargement
  useEffect(() => {
    checkN8nConnection();
  }, []);

  const checkN8nConnection = async () => {
    try {
      const response = await fetch('https://nonunified-maxwell-noisome.ngrok-free.dev/webhook/test');
      if (response.ok) {
        setN8nStatus('connected');
      } else {
        setN8nStatus('error');
      }
    } catch (error) {
      setN8nStatus('error');
    }
  };

  // Keep the AI textarea focused while the modal is open and restore caret on re-renders
  useEffect(() => {
    if (showAIModal && aiTextareaRef.current) {
      // focus on open
      aiTextareaRef.current.focus();
      // move caret to end
      const len = aiTextareaRef.current.value?.length || 0;
      aiTextareaRef.current.setSelectionRange(len, len);
    }
  }, [showAIModal]);

  // Defensive: if aiInput changes and focus was lost, restore focus and caret
  useEffect(() => {
    if (showAIModal && aiTextareaRef.current && document.activeElement !== aiTextareaRef.current) {
      aiTextareaRef.current.focus();
      const len = aiTextareaRef.current.value?.length || 0;
      aiTextareaRef.current.setSelectionRange(len, len);
    }
  }, [aiInput, showAIModal]);

  const getAISuggestions = async (title, description) => {
    setIsAILoading(true);
    setAiError('');
    setAiSuggestions(null);
    console.log('Demande de suggestions IA avec:', { title, description, prompt: aiInput });
    try {
      const response = await fetch('link of ngrok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description,
          prompt: aiInput || "Génère une description optimisée pour une campagne de crowdfunding"
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data.myField);
        console.log('Suggestions IA reçues:', aiSuggestions);
        setIsAILoading(false);
        return data;
      } else {
        const errorText = await response.text();
        setAiError(`Erreur ${response.status}: ${errorText}`);
        setIsAILoading(false);
        return null;
      }
    } catch (error) {
      console.error('Erreur AI suggestions:', error);
      setAiError('Erreur de connexion au serveur AI');
      setIsAILoading(false);
      return null;
    }
  };

  const applyAISuggestion = (suggestion) => {
    setForm(prev => ({ ...prev, description: suggestion }));
    setShowAIModal(false);
    setAiInput('');
    setAiSuggestions(null);
    setAiError('');
  };

  const AISuggestionModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2c2f32] rounded-[20px] p-6 max-w-md w-full border-2 border-[#8c6dfd] animate-fadeIn max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d] rounded-full flex items-center justify-center mr-3 animate-pulse">
              <span className="text-white text-lg">🤖</span>
            </div>
            <div>
              <h3 className="font-epilogue font-bold text-[20px] text-white">
                Assistant IA
              </h3>
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  n8nStatus === 'connected' ? 'bg-green-500' :
                  n8nStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <p className="font-epilogue font-normal text-[12px] text-[#808191]">
                  {n8nStatus === 'connected' ? 'Connecté à n8n' :
                   n8nStatus === 'error' ? 'Déconnecté' : 'Vérification...'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setShowAIModal(false);
              setAiInput('');
              setAiError('');
              setAiSuggestions(null);
            }}
            className="text-[#808191] hover:text-white text-2xl transition-colors"
            disabled={isAILoading}
          >
            ×
          </button>
        </div>
        
        <div className="mb-4">
          <label className="font-epilogue font-semibold text-[14px] text-white mb-2 block">
            Titre actuel: 
          </label>
          <div className="bg-[#1c1c24] p-3 rounded-[10px] border border-[#3a3a43]">
            <p className="text-white">{form.title || "Aucun titre fourni"}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="font-epilogue font-semibold text-[14px] text-white mb-2 block">
            Instructions pour l'IA (optionnel):
          </label>
          <textarea
            placeholder="Ex: 'Rends la description plus professionnelle', 'Ajoute des détails sur l'impact', 'Fais une version courte'..."
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            ref={aiTextareaRef}
            // defensive: if blurred while modal open, re-focus
            onBlur={() => {
              if (showAIModal && aiTextareaRef.current) {
                aiTextareaRef.current.focus();
              }
            }}
            rows={3}
            className="w-full bg-[#1c1c24] border-2 border-[#3a3a43] rounded-[10px] py-3 px-4 text-white font-epilogue font-normal text-[14px] placeholder-[#4b5264] focus:border-[#8c6dfd] focus:outline-none resize-none"
          />
        </div>
        
        {isAILoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8c6dfd] mx-auto mb-4"></div>
            <p className="text-white">Génération des suggestions IA...</p>
          </div>
        ) : aiError ? (
          <div className="bg-red-500/20 border border-red-500 rounded-[10px] p-4 mb-4">
            <p className="text-red-400">{aiError}</p>
          </div>
        ) : aiSuggestions ? (
          <div className="space-y-4">
            <h4 className="font-epilogue font-bold text-[16px] text-white">
              Suggestions générées:
            </h4>
            {aiSuggestions && (
              <div  
                className="bg-[#1c1c24] border border-[#3a3a43] rounded-[10px] p-4 hover:border-[#8c6dfd] transition-colors cursor-pointer"
                onClick={() => applyAISuggestion(aiSuggestions)}
              >
                <p className="text-white text-sm mb-2">{aiSuggestions}</p>
                <button className="text-[#8c6dfd] text-xs font-semibold">
                  👆 Cliquer pour appliquer
                </button>
              </div>
            )}
          </div>
        ) : null}
        
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => setShowAIModal(false)}
            className="px-4 py-2 bg-[#3a3a43] text-white rounded-[10px] font-semibold hover:bg-[#4b4b57] transition-colors"
          >
            Annuler
          </button>
          
          <button
            type="button"
            onClick={() => getAISuggestions(form.title, form.description || aiInput)}
            disabled={isAILoading || !form.title?.trim()}
            className={`px-4 py-2 rounded-[10px] font-semibold transition-colors ${
              isAILoading || !form.title?.trim()
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d] text-white hover:from-[#7b5dfa] hover:to-[#3dbc7d]'
            }`}
          >
            {aiSuggestions ? '🔁 Regénérer' : '✨ Générer des suggestions'}
          </button>
        </div>
      </div>
    </div>
  );
  
  // Catégories disponibles
  const categories = [
    { id: '0', name: 'Charity & Non-Profit', icon: '🤝' },
    { id: '1', name: 'Startup & Business', icon: '💼' },
    { id: '2', name: 'Community Projects', icon: '👥' },
    { id: '3', name: 'Technology & Innovation', icon: '🚀' },
    { id: '4', name: 'Art & Creative', icon: '🎨' },
    { id: '5', name: 'Education & Research', icon: '📚' },
    { id: '6', name: 'Environment & Sustainability', icon: '🌱' },
    { id: '7', name: 'Health & Wellness', icon: '🏥' },
    { id: '8', name: 'Gaming & Entertainment', icon: '🎮' },
    { id: '9', name: 'Other', icon: '📋' }
  ];

  const handleFormFieldChange = (fieldName, e) => {
    const value = e.target.value;
    setForm({ ...form, [fieldName]: value });
    
    // Effacer l'erreur du champ quand l'utilisateur tape
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
    
    // Prévisualisation d'image automatique
    if (fieldName === 'image' && value) {
      checkIfImage(value, (exists) => {
        if (exists) {
          setImagePreview(value);
          setErrors(prev => ({ ...prev, image: '' }));
        } else {
          setImagePreview('');
        }
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.title?.trim()) newErrors.title = 'Le titre est requis';
    else if (form.title.length < 5) newErrors.title = 'Le titre doit faire au moins 5 caractères';
    
    if (!form.description?.trim()) newErrors.description = 'La description est requise';
    else if (form.description.length < 20) newErrors.description = 'La description doit faire au moins 20 caractères';
    
    if (!form.target || parseFloat(form.target) <= 0) newErrors.target = 'L\'objectif doit être supérieur à 0';
    else if (parseFloat(form.target) > 1000) newErrors.target = 'L\'objectif ne peut pas dépasser 1000 ETH';
    
    if (!form.deadline) newErrors.deadline = 'La date limite est requise';
    else if (new Date(form.deadline) <= new Date()) newErrors.deadline = 'La date doit être dans le futur';
    else if (new Date(form.deadline) > new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) {
      newErrors.deadline = 'La date ne peut pas dépasser 1 an';
    }
    
    if (!form.image?.trim()) newErrors.image = 'L\'image est requise';
    
    if (!form.category) newErrors.category = 'La catégorie est requise';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!address) {
      alert('Veuillez vous connecter à votre portefeuille');
      return;
    }

    // Prevent double-submit
    if (isSubmittingRef.current) {
      console.warn('Submission blocked: already submitting');
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Mark as submitting right away to avoid races
    isSubmittingRef.current = true;
    setIsUploading(true);

    // Wrap callback to ensure it only runs once (defensive against double-calls)
    let callbackCalled = false;
    const oneTimeCallback = async (exists) => {
      if (callbackCalled) return;
      callbackCalled = true;

      if (exists) {
        try {
          const campaignData = {
            ...form,
            socialLinks: { link: form.link }
          };

          await createCampaign(campaignData);
          console.log('Données de la campagne à créer:', campaignData);
          alert('🎉 Campagne créée avec succès!');
          navigate('/');
        } catch (error) {
          console.error('Erreur création campagne:', error);
          alert('❌ Erreur lors de la création: ' + error.message);
        }
      } else {
        setErrors(prev => ({ ...prev, image: 'URL d\'image invalide' }));
        setImagePreview('');
      }

      setIsUploading(false);
      // release guard so user can retry after completion/error
      isSubmittingRef.current = false;
    };

    // Call image checker with one-time callback
    try {
      checkIfImage(form.image, oneTimeCallback);
    } catch (err) {
      console.error('Erreur lors de la vérification de l\'image:', err);
      setIsUploading(false);
      isSubmittingRef.current = false;
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    return oneYearLater.toISOString().split('T')[0];
  };

  const handleCategorySelect = (categoryId) => {
    setForm({ ...form, category: categoryId });
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-[#1c1c24] flex items-center justify-center p-4">
        <div className="bg-[#2c2f32] rounded-[20px] p-8 max-w-md w-full text-center border-2 border-[#8c6dfd]">
          <div className="w-20 h-20 bg-[#3a3a43] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-[32px]">🔐</span>
          </div>
          <h1 className="font-epilogue font-bold text-[28px] text-white mb-4">
            Connexion Requise
          </h1>
          <p className="font-epilogue font-normal text-[16px] text-[#808191] mb-6">
            Veuillez vous connecter à votre portefeuille pour créer une campagne de crowdfunding.
          </p>
          <CustomButton 
            btnType="button"
            title="Se connecter avec MetaMask"
            styles="bg-[#8c6dfd] hover:bg-[#7b5dfa] w-full py-3"
            handleClick={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1c1c24] to-[#2c2f32] py-8 px-2">
      {(isLoading || isUploading) && <Loader message={isUploading ? "Validation de l'image..." : "Création de la campagne..."} />}
      
      {/* Modal d'assistant IA */}
      {showAIModal && <AISuggestionModal />}
      
      <div className="max-w-1xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d] rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-xl">✨</span>
            </div>
            <h1 className="font-epilogue font-bold text-[32px] bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d] bg-clip-text text-transparent">
              Créer une Campagne
            </h1>
          </div>
          <p className="font-epilogue font-normal text-[16px] text-[#808191] max-w-2xl mx-auto">
            Lancez votre projet et collectez des fonds grâce à la puissance de la blockchain Ethereum. 
            Remplissez les informations ci-dessous pour commencer.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <div className="bg-[#2c2f32] rounded-[20px] p-6 border-2 border-[#3a3a43]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations de base */}
                <div className="bg-[#1c1c24] rounded-[15px] p-4">
                  <h3 className="font-epilogue font-bold text-[20px] text-white mb-4 flex items-center">
                    <div className="w-2 h-6 bg-[#8c6dfd] rounded-full mr-3"></div>
                    Informations de Base
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField 
                      labelName="Votre Nom"
                      placeholder="John Doe"
                      inputType="text"
                      value={form.name}
                      handleChange={(e) => handleFormFieldChange('name', e)}
                      error={errors.name}
                      optional
                    />
                    <FormField 
                      labelName="Titre de la Campagne *"
                      placeholder="Sauver les océans"
                      inputType="text"
                      value={form.title}
                      handleChange={(e) => handleFormFieldChange('title', e)}
                      error={errors.title}
                    />
                  </div>
                  
                  {/* Description avec IA */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-epilogue font-semibold text-[14px] leading-[22px] text-white">
                        Description *
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowAIModal(true)}
                          disabled={!form.title?.trim()}
                          className={`flex items-center px-3 py-1 rounded-[8px] font-epilogue font-semibold text-[12px] transition-all ${
                            !form.title?.trim()
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d] text-white hover:from-[#7b5dfa] hover:to-[#3dbc7d] hover:shadow-lg'
                          }`}
                        >
                          <span className="mr-1">🤖</span>
                          Assistant IA
                        </button>
                        
                        {form.description && (
                          <button
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, description: '' }))}
                            className="px-2 py-1 bg-[#3a3a43] text-white rounded-[6px] text-xs hover:bg-[#4b4b57]"
                          >
                            Effacer
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <textarea
                      placeholder="Décrivez votre projet en détail... Quelle est sa mission ? Comment les fonds seront-ils utilisés ? Cliquez sur 'Assistant IA' pour générer automatiquement une description professionnelle."
                      value={form.description}
                      onChange={(e) => handleFormFieldChange('description', e)}
                      rows={6}
                      className={`w-full bg-[#1c1c24] border-2 ${
                        errors.description ? 'border-red-500' : 'border-[#3a3a43]'
                      } rounded-[10px] py-3 px-4 text-white font-epilogue font-normal text-[14px] placeholder-[#4b5264] focus:border-[#8c6dfd] focus:outline-none resize-none transition-colors`}
                    />
                    
                    {errors.description && (
                      <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                    )}
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center space-x-4">
                        <p className="text-[#808191] text-xs">
                          {form.description.length} caractères
                        </p>
                        <p className={`text-xs ${
                          form.description.length < 20 ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {form.description.length < 20 ? 'Minimum 20 caractères' : '✓ Longueur suffisante'}
                        </p>
                      </div>
                      
                      {form.description.length > 0 && (
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-1 ${
                            form.description.length < 50 ? 'bg-red-500' : 
                            form.description.length < 150 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <span className="text-[#808191] text-xs">
                            {form.description.length < 50 ? 'Court' : 
                             form.description.length < 150 ? 'Moyen' : 'Détaillé'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Catégorie */}
                <div className="bg-[#1c1c24] rounded-[15px] p-4">
                  <h3 className="font-epilogue font-bold text-[20px] text-white mb-4 flex items-center">
                    <div className="w-2 h-6 bg-[#4acd8d] rounded-full mr-3"></div>
                    Catégorie du Projet *
                  </h3>
                  
                  <div className="mb-4">
                    <label className="font-epilogue font-semibold text-[16px] text-white mb-3 block">
                      Sélectionnez une catégorie
                    </label>
                    {errors.category && (
                      <p className="text-red-500 text-sm mb-3">{errors.category}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleCategorySelect(category.id)}
                          className={`p-4 rounded-[12px] border-2 transition-all duration-200 flex flex-col items-center justify-center ${
                            form.category === category.id
                              ? 'border-[#8c6dfd] bg-[#8c6dfd]/10'
                              : 'border-[#3a3a43] bg-[#2c2f32] hover:border-[#4acd8d] hover:bg-[#1c1c24]'
                          }`}
                        >
                          <span className="text-2xl mb-2">{category.icon}</span>
                          <span className="font-epilogue font-semibold text-[14px] text-white text-center">
                            {category.name}
                          </span>
                        </button>
                      ))}
                    </div>
                    
                    {form.category && (
                      <div className="mt-4 p-3 bg-[#2c2f32] rounded-[10px] border border-[#4acd8d]">
                        <p className="font-epilogue font-semibold text-white flex items-center">
                          <span className="mr-2">
                            {categories.find(c => c.id === form.category)?.icon}
                          </span>
                          Catégorie sélectionnée: {categories.find(c => c.id === form.category)?.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Objectif et date */}
                <div className="bg-[#1c1c24] rounded-[15px] p-4">
                  <h3 className="font-epilogue font-bold text-[20px] text-white mb-4 flex items-center">
                    <div className="w-2 h-6 bg-[#4acd8d] rounded-full mr-3"></div>
                    Objectif et Durée
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField 
                      labelName="Objectif (ETH) *"
                      placeholder="0.50"
                      inputType="number"
                      step="0.01"
                      min="0.01"
                      max="1000"
                      value={form.target}
                      handleChange={(e) => handleFormFieldChange('target', e)}
                      error={errors.target}
                    />
                    <FormField 
                      labelName="Date de Fin *"
                      placeholder=""
                      inputType="date"
                      value={form.deadline}
                      handleChange={(e) => handleFormFieldChange('deadline', e)}
                      error={errors.deadline}
                      min={getMinDate()}
                      max={getMaxDate()}
                    />
                  </div>
                </div>

                {/* Image */}
                <div className="bg-[#1c1c24] rounded-[15px] p-4">
                  <h3 className="font-epilogue font-bold text-[20px] text-white mb-4 flex items-center">
                    <div className="w-2 h-6 bg-[#1dc071] rounded-full mr-3"></div>
                    Image de la Campagne
                  </h3>
                  
                  <FormField 
                    labelName="URL de l'Image *"
                    placeholder="https://example.com/image.jpg"
                    inputType="url"
                    value={form.image}
                    handleChange={(e) => handleFormFieldChange('image', e)}
                    error={errors.image}
                  />
                  
                  {/* Prévisualisation d'image */}
                  {imagePreview && (
                    <div className="mt-4">
                      <p className="font-epilogue font-semibold text-[14px] text-white mb-2">
                        Aperçu de l'image:
                      </p>
                      <div className="relative rounded-[10px] overflow-hidden border-2 border-[#4acd8d]">
                        <img 
                          src={imagePreview} 
                          alt="Aperçu" 
                          className="w-full h-48 object-cover"
                          onError={() => {
                            setImagePreview('');
                            setErrors(prev => ({ ...prev, image: 'Image non accessible' }));
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          ✓ Valide
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Liens sociaux et web */}
                <div className="bg-[#1c1c24] rounded-[15px] p-4">
                  <h3 className="font-epilogue font-bold text-[20px] text-white mb-4 flex items-center">
                    <div className="w-2 h-6 bg-[#FF6B35] rounded-full mr-3"></div>
                    Liens et Réseaux Sociaux
                  </h3>
                  
                  <p className="font-epilogue font-normal text-[14px] text-[#808191] mb-4">
                    Ajoutez des liens vers votre site web et réseaux sociaux pour plus de visibilité.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        labelName="Lien (site web ou réseau)"
                        placeholder="https://votre-projet.com"
                        inputType="url"
                        value={form.link}
                        handleChange={(e) => handleFormFieldChange('link', e)}
                        icon="🔗"
                        optional
                      />
                    </div>
                  </div>
                </div>

                {/* Bouton de soumission */}
                <div className="flex justify-center pt-4">
                  <CustomButton 
                    btnType="submit"
                    title={
                      isLoading || isUploading 
                        ? "Création en cours..." 
                        : "🚀 Lancer la Campagne"
                    }
                    styles="bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d] hover:from-[#7b5dfa] hover:to-[#3dbc7d] w-full md:w-auto px-8 py-4 rounded-[15px] font-bold text-[18px] transition-all duration-300 transform hover:scale-105"
                    disabled={isLoading || isUploading}
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar informative */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-8">
              {/* Carte d'information */}
              <div className="bg-gradient-to-br from-[#8c6dfd] to-[#4acd8d] rounded-[20px] p-6 text-white">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xl">💫</span>
                  </div>
                  <h3 className="font-epilogue font-bold text-[20px]">
                    Avantages
                  </h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                    <span className="font-epilogue font-normal text-[14px]">
                      100% des fonds collectés
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                    <span className="font-epilogue font-normal text-[14px]">
                      Pas de frais intermédiaires
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                    <span className="font-epilogue font-normal text-[14px]">
                      Sécurité blockchain
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                    <span className="font-epilogue font-normal text-[14px]">
                      Transparence totale
                    </span>
                  </li>
                </ul>
              </div>

              {/* Conseils par catégorie */}
              <div className="bg-[#2c2f32] rounded-[20px] p-6 border-2 border-[#3a3a43]">
                <h3 className="font-epilogue font-bold text-[18px] text-white mb-4 flex items-center">
                  <span className="text-yellow-400 mr-2">💡</span>
                  Conseils par Catégorie
                </h3>
                <div className="space-y-3">
                  {form.category && categories.find(c => c.id === form.category) && (
                    <div className="bg-[#1c1c24] rounded-[10px] p-3">
                      <p className="font-epilogue font-semibold text-[12px] text-[#4acd8d] mb-1">
                        {categories.find(c => c.id === form.category)?.icon} 
                        {categories.find(c => c.id === form.category)?.name}
                      </p>
                      <p className="font-epilogue font-normal text-[11px] text-[#808191]">
                        {form.category === 'charity' && 'Montrez l\'impact concret de chaque don et partagez des témoignages.'}
                        {form.category === 'startup' && 'Présentez votre business model et votre équipe. Les investisseurs aiment voir la roadmap.'}
                        {form.category === 'community' && 'Impliquez la communauté dès le début. Montrez le soutien local.'}
                        {form.category === 'technology' && 'Démontrez l\'innovation et l\'utilité de votre technologie. Prototypes et démos aident.'}
                        {form.category === 'art' && 'Partagez votre vision artistique. Des visuels de qualité sont essentiels.'}
                        {form.category === 'education' && 'Expliquez l\'impact éducatif et les bénéficiaires. Les partenariats institutionnels sont un plus.'}
                        {form.category === 'environment' && 'Quantifiez l\'impact environnemental. Les données scientifiques renforcent la crédibilité.'}
                        {form.category === 'health' && 'Respectez les régulations. Les certifications et avis d\'experts sont importants.'}
                        {form.category === 'gaming' && 'Montrez du gameplay et l\'engagement de la communauté. Les bêta-testeurs aident.'}
                        {form.category === 'other' && 'Clarifiez votre vision unique. Expliquez pourquoi votre projet est spécial.'}
                      </p>
                    </div>
                  )}
                  <div className="bg-[#1c1c24] rounded-[10px] p-3">
                    <p className="font-epilogue font-semibold text-[12px] text-[#4acd8d] mb-1">
                      Image attrayante
                    </p>
                    <p className="font-epilogue font-normal text-[11px] text-[#808191]">
                      Choisissez une image de qualité qui représente bien votre projet
                    </p>
                  </div>
                  <div className="bg-[#1c1c24] rounded-[10px] p-3">
                    <p className="font-epilogue font-semibold text-[12px] text-[#4acd8d] mb-1">
                      Liens sociaux
                    </p>
                    <p className="font-epilogue font-normal text-[11px] text-[#808191]">
                      Ajoutez vos réseaux pour plus de crédibilité et de visibilité
                    </p>
                  </div>
                </div>
              </div>

              {/* Importance des catégories */}
              <div className="bg-[#2c2f32] rounded-[20px] p-4 border-2 border-[#8c6dfd]">
                <h3 className="font-epilogue font-bold text-[16px] text-white mb-2 flex items-center">
                  <span className="text-[#8c6dfd] mr-2">🏷️</span>
                  Pourquoi choisir une catégorie ?
                </h3>
                <p className="font-epilogue font-normal text-[12px] text-[#808191]">
                  La catégorie aide les donateurs à trouver votre projet et garantis que votre campagne atteint le bon public. Elle améliore la découvrabilité de 40%.
                </p>
              </div>

              {/* Statut de connexion */}
              <div className="bg-[#2c2f32] rounded-[20px] p-4 border-2 border-[#4acd8d]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="font-epilogue font-semibold text-[14px] text-white">
                      Connecté
                    </span>
                  </div>
                  <span className="font-epilogue font-normal text-[12px] text-[#808191]">
                    {address.substring(0, 6)}...{address.substring(38)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;