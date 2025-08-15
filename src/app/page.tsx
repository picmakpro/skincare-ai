'use client'

import { useState, useEffect } from 'react'
import { Upload, Camera, MessageCircle, RotateCcw, ChevronRight, Star, ShoppingCart, Clock, Droplets, Sun, Moon, Award } from 'lucide-react'
import PhotoQualityGuide from '../components/PhotoQualityGuide'
import SkinScore from '../components/SkinScore'
import { calculateSkinScores, calculateSkinAge, SkinScores } from '../lib/scoring'

// Types identiques (gardez ceux existants)
interface DetailedProduct {
  name: string
  brand: string
  price: string
  originalPrice?: string
  discount?: string
  link: string
  category: string
  image: string
  benefits: string
  application: string
  frequency: string
}

interface RoutineStep {
  step: string
  product: string
  action: string
  duration: string
  tips: string
}

interface DetailedSkinAnalysis {
  skinType: string
  skinTypeExplanation: string
  concerns: string[]
  products: DetailedProduct[]
  routine: {
    title: string
    morning: { steps: RoutineStep[] }
    evening: { steps: RoutineStep[] }
    frequency: {
      daily: string
      weekly: string
      monthly: string
    }
  }
  scores?: SkinScores
  skinAge?: number
  confidence?: number
}

interface QuestionnaireData {
  age: string
  sensitivities: string[]
  currentRoutine: string
  mainConcern: string
  budget: string
  routineComplexity: string
  unknownConcern: boolean
  customSensitivity: string
  customRoutine: string
  freeText: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface PhotoFile {
  file: File
  preview: string
  validation: any
  id: string
}

export default function Home() {
  // 🔧 Fix hydratation avec état mounted
  const [mounted, setMounted] = useState(false)
  
  // États identiques (gardez tous les états existants)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [validatedPhotos, setValidatedPhotos] = useState<PhotoFile[]>([])
  const [analysis, setAnalysis] = useState<DetailedSkinAnalysis | null>(null)
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'upload' | 'questionnaire' | 'analysis' | 'chat'>('upload')

  const [formData, setFormData] = useState<QuestionnaireData>({
    age: '',
    sensitivities: [],
    currentRoutine: '',
    mainConcern: '',
    budget: '',
    routineComplexity: '',
    unknownConcern: false,
    customSensitivity: '',
    customRoutine: '',
    freeText: ''
  })
  const [showCustomSensitivity, setShowCustomSensitivity] = useState(false)
  const [showCustomRoutine, setShowCustomRoutine] = useState(false)

  // 🔧 Fix hydratation
  useEffect(() => {
    setMounted(true)
  }, [])

  // 🔧 FONCTIONS DÉPLACÉES AVANT LE RETURN
  const handleSaveAnalysis = () => {
    if (analysis && questionnaire) {
      // Sauvegarder temporairement l'analyse
      localStorage.setItem('skincare_analysis', JSON.stringify(analysis));
      localStorage.setItem('skincare_questionnaire', JSON.stringify(questionnaire));
      
      // Rediriger vers authentification avec retour sur sauvegarde
      window.location.href = '/auth?action=save&redirect=/dashboard';
    } else {
      alert('Aucune analyse à sauvegarder');
    }
  }

  const handleViewFullShop = () => {
    if (analysis) {
      // Sauvegarder temporairement l'analyse pour la boutique
      localStorage.setItem('skincare_analysis', JSON.stringify(analysis));
      
      // Rediriger vers authentification avec retour sur boutique
      window.location.href = '/auth?action=shop&redirect=/shop';
    } else {
      alert('Aucune analyse disponible');
    }
  }

  // Fonctions identiques
  const handlePhotosValidated = (validPhotos: PhotoFile[]) => {
    setValidatedPhotos(validPhotos)
    
    const photoPromises = validPhotos.map(photo => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(photo.file)
      })
    })
    
    Promise.all(photoPromises).then(base64Photos => {
      setSelectedImages(base64Photos)
      setCurrentStep('questionnaire')
      setShowQuestionnaire(true)
    })
  }

  const handleQuestionnaireSubmit = async () => {
    if (selectedImages.length === 0) return

    setIsAnalyzing(true)
    setShowQuestionnaire(false)
    setCurrentStep('analysis')
    setQuestionnaire(formData)

    try {
      const response = await fetch('/api/analyze-skin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: selectedImages,
          questionnaire: formData
        })
      })

      const data = await response.json()
      console.log('📊 Données reçues:', data)
      
      // Vérification et fallback
      let finalAnalysis = data.analysis || {}
      
      if (!finalAnalysis.scores) {
        console.log('🔢 Calcul des scores...')
        finalAnalysis.scores = calculateSkinScores({
          concerns: finalAnalysis.concerns || [],
          mainConcern: formData.mainConcern,
          age: formData.age,
          sensitivities: formData.sensitivities,
          isConservative: formData.unknownConcern,
          confidence: finalAnalysis.confidence || 0.8
        })
      }
      
      if (!finalAnalysis.skinAge) {
        console.log('🎂 Calcul de l\'âge de peau...')
        finalAnalysis.skinAge = calculateSkinAge(
          finalAnalysis.scores,
          formData.age,
          finalAnalysis.confidence || 0.8
        )
      }
      
      if (!finalAnalysis.skinType) {
        console.log('⚠️ Utilisation du fallback complet')
        finalAnalysis = {
          skinType: "Peau Mixte avec Besoins Spécifiques",
          skinTypeExplanation: "Analyse basée sur votre questionnaire. Des photos de meilleure qualité permettraient un diagnostic plus précis.",
          concerns: [
            "Zone T légèrement grasse",
            "Joues normales à sèches", 
            "Pores visibles zone médiane"
          ],
          confidence: 0.7,
          scores: calculateSkinScores({
            concerns: ["Zone T légèrement grasse", "Pores visibles"],
            mainConcern: formData.mainConcern,
            age: formData.age,
            sensitivities: formData.sensitivities,
            isConservative: formData.unknownConcern,
            confidence: 0.7
          }),
          products: [
            {
              name: "Gel Nettoyant Moussant",
              brand: "CeraVe",
              price: "12.99€",
              originalPrice: "15.99€",
              discount: "19%",
              link: "https://amzn.to/cerave-gel",
              category: "Nettoyant Équilibrant",
              image: "https://m.media-amazon.com/images/I/41vCLcQ7B0L._UF350,350_QL80_.jpg",
              benefits: "Nettoie en douceur sans dessécher",
              application: "Masser 30 secondes sur peau humide",
              frequency: "Matin et soir"
            },
            {
              name: "Hydratant Visage SPF30",
              brand: "La Roche-Posay",
              price: "19.99€",
              link: "https://amzn.to/lrp-hydratant",
              category: "Hydratant + Protection",
              image: "https://images.asos-media.com/products/la-roche-posay-toleriane-caring-wash-400ml/203417131-1-nocolour",
              benefits: "Hydrate et protège des UV",
              application: "Appliquer généreusement le matin",
              frequency: "Chaque matin"
            }
          ],
          routine: {
            title: "Routine Équilibrée - Peau Mixte",
            morning: {
              steps: [
                {
                  step: "1",
                  product: "Gel Nettoyant CeraVe",
                  action: "Masser délicatement 30 secondes",
                  duration: "30 secondes",
                  tips: "Insister légèrement sur zone T"
                },
                {
                  step: "2",
                  product: "Hydratant SPF30",
                  action: "Appliquer uniformément",
                  duration: "1 minute",
                  tips: "Ne pas oublier le cou"
                }
              ]
            },
            evening: {
              steps: [
                {
                  step: "1",
                  product: "Gel Nettoyant CeraVe",
                  action: "Double nettoyage si maquillage",
                  duration: "1 minute",
                  tips: "Rincer à l'eau tiède"
                },
                {
                  step: "2",
                  product: "Crème de nuit",
                  action: "Appliquer en tapotant",
                  duration: "30 secondes",
                  tips: "Plus généreusement sur les joues"
                }
              ]
            },
            frequency: {
              daily: "Nettoyant et hydratant",
              weekly: "Gommage doux zone T",
              monthly: "Masque hydratant si besoin"
            }
          }
        }
        
        finalAnalysis.skinAge = calculateSkinAge(
          finalAnalysis.scores,
          formData.age,
          0.7
        )
      }
      
      console.log('✅ Analyse finale:', finalAnalysis)
      setAnalysis(finalAnalysis)
      setCurrentStep('chat') // ✅ Aller directement au chat (dernière étape)
      
    } catch (error) {
      console.error('❌ Erreur:', error)
      
      const emergencyAnalysis = {
        skinType: "Diagnostic Temporaire",
        skinTypeExplanation: "Une erreur technique s'est produite. Réessayez avec des photos plus claires.",
        concerns: ["Analyse en cours", "Données à compléter"],
        confidence: 0.5,
        scores: calculateSkinScores({
          concerns: ["Analyse en cours"],
          mainConcern: formData.mainConcern || "Pores dilatés",
          age: formData.age || "26-35",
          sensitivities: formData.sensitivities || [],
          isConservative: true,
          confidence: 0.5
        }),
        products: [],
        routine: {
          title: "Routine de Base",
          morning: { steps: [] },
          evening: { steps: [] },
          frequency: { daily: "À définir", weekly: "À définir", monthly: "À définir" }
        }
      }
      
      emergencyAnalysis.skinAge = calculateSkinAge(
        emergencyAnalysis.scores,
        formData.age || "26-35",
        0.5
      )
      
      setAnalysis(emergencyAnalysis)
      setCurrentStep('chat')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSensitivityChange = (sensitivity: string) => {
    if (sensitivity === 'Autre') {
      setShowCustomSensitivity(true)
      return
    }
    
    setFormData(prev => ({
      ...prev,
      sensitivities: prev.sensitivities.includes(sensitivity)
        ? prev.sensitivities.filter(s => s !== sensitivity)
        : [...prev.sensitivities, sensitivity]
    }))
  }

  const handleMainConcernChange = (concern: string) => {
    if (concern === 'Je ne sais pas') {
      setFormData(prev => ({ ...prev, mainConcern: concern, unknownConcern: true }))
    } else {
      setFormData(prev => ({ ...prev, mainConcern: concern, unknownConcern: false }))
    }
  }

  const handleRoutineChange = (routine: string) => {
    if (routine === 'Autre') {
      setShowCustomRoutine(true)
      return
    }
    
    setFormData(prev => ({ ...prev, currentRoutine: routine }))
  }

  const sendChatMessage = async () => {
    if (!currentMessage.trim() || !analysis) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsChatLoading(true)

    try {
      const response = await fetch('/api/chat-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMessage,
          analysis: analysis,
          questionnaire: questionnaire,
          chatHistory: chatMessages
        })
      })

      const data = await response.json()
      const cleanedResponse = data.response
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .replace(/`(.*?)`/g, '$1')

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: cleanedResponse,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Erreur chat:', error)
    } finally {
      setIsChatLoading(false)
    }
  }

  const resetAnalysis = () => {
    setSelectedImages([])
    setValidatedPhotos([])
    setAnalysis(null)
    setQuestionnaire(null)
    setShowQuestionnaire(false)
    setShowChat(false)
    setChatMessages([])
    setCurrentMessage('')
    setCurrentStep('upload')
    setShowCustomSensitivity(false)
    setShowCustomRoutine(false)
    setFormData({
      age: '',
      sensitivities: [],
      currentRoutine: '',
      mainConcern: '',
      budget: '',
      routineComplexity: '',
      unknownConcern: false,
      customSensitivity: '',
      customRoutine: '',
      freeText: ''
    })
  }

  // 🔧 Eviter l'erreur d'hydratation Dashlane
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">SkinCare AI</h2>
          <p className="text-gray-600">Chargement en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header avec bouton sauvegarde */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">SkinCare AI</h1>
              <p className="text-sm text-gray-500">Diagnostic personnalisé par IA</p>
            </div>
          </div>
          
          {/* 🆕 BOUTON SAUVEGARDE EN HAUT */}
          {analysis && (
            <button
              onClick={handleSaveAnalysis}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>💾</span>
              Sauvegarder mon diagnostic
            </button>
          )}
          
          {/* Navigation étapes (4 étapes) */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${currentStep === 'upload' ? 'bg-pink-500' : currentStep !== 'upload' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${currentStep === 'questionnaire' ? 'bg-pink-500' : ['analysis', 'chat'].includes(currentStep) ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${currentStep === 'analysis' ? 'bg-pink-500' : currentStep === 'chat' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${currentStep === 'chat' ? 'bg-pink-500' : 'bg-gray-300'}`} />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Upload Section */}
        {currentStep === 'upload' && (
          <PhotoQualityGuide
            onPhotosValidated={handlePhotosValidated}
            maxFiles={5}
          />
        )}

        {/* Questionnaire Section */}
        {showQuestionnaire && currentStep === 'questionnaire' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-pink-100">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Questions pour personnaliser votre analyse
              </h3>
              <p className="text-gray-600">6 questions stratégiques + options personnalisées</p>
            </div>

            <div className="space-y-6">
              {/* Question 1: Âge */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Dans quelle tranche d'âge êtes-vous ?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['16-25', '26-35', '36-45', '46+'].map(age => (
                    <button
                      key={age}
                      onClick={() => setFormData(prev => ({ ...prev, age }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.age === age
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {age} ans
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Sensibilités */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Avez-vous des sensibilités ou allergies connues ?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {['Parfums', 'Alcool', 'Huiles essentielles', 'Rétinoïdes', 'Acides (AHA/BHA)', 'Aucune', 'Autre'].map(sensitivity => (
                    <button
                      key={sensitivity}
                      onClick={() => handleSensitivityChange(sensitivity)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.sensitivities.includes(sensitivity)
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {sensitivity}
                    </button>
                  ))}
                </div>
                {showCustomSensitivity && (
                  <textarea
                    value={formData.customSensitivity}
                    onChange={(e) => setFormData(prev => ({ ...prev, customSensitivity: e.target.value }))}
                    placeholder="Précisez vos sensibilités..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                    rows={2}
                    maxLength={120}
                  />
                )}
              </div>

              {/* Question 3: Routine actuelle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Votre routine actuelle ?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {['Aucune routine', 'Nettoyant uniquement', 'Routine complète', 'Autre'].map(routine => (
                    <button
                      key={routine}
                      onClick={() => handleRoutineChange(routine)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.currentRoutine === routine
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {routine}
                    </button>
                  ))}
                </div>
                {showCustomRoutine && (
                  <textarea
                    value={formData.customRoutine}
                    onChange={(e) => setFormData(prev => ({ ...prev, customRoutine: e.target.value }))}
                    placeholder="Décrivez votre routine actuelle..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                    rows={2}
                    maxLength={120}
                  />
                )}
              </div>

              {/* Question 4: Préoccupation principale */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Votre préoccupation N°1 ?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Acné', 'Rides', 'Taches', 'Sécheresse', 'Sensibilité', 'Pores dilatés', 'Je ne sais pas'].map(concern => (
                    <button
                      key={concern}
                      onClick={() => handleMainConcernChange(concern)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.mainConcern === concern
                          ? concern === 'Je ne sais pas' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {concern}
                    </button>
                  ))}
                </div>
                {formData.unknownConcern && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      💡 Pas de souci ! Notre analyse sera plus prudente et proposera une routine douce et progressive.
                    </p>
                  </div>
                )}
              </div>

              {/* Question 5: Budget */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Budget mensuel skincare ?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['< 30€', '30-60€', '60-100€', '100€+'].map(budget => (
                    <button
                      key={budget}
                      onClick={() => setFormData(prev => ({ ...prev, budget }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.budget === budget
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {budget}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 6: Complexité routine */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Préférence de routine ?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Simple (2-3 produits)', 'Complète (5+ étapes)'].map(complexity => (
                    <button
                      key={complexity}
                      onClick={() => setFormData(prev => ({ ...prev, routineComplexity: complexity }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.routineComplexity === complexity
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {complexity}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleQuestionnaireSubmit}
              disabled={!formData.age || !formData.mainConcern || !formData.budget || !formData.routineComplexity || (!formData.currentRoutine && !showCustomRoutine)}
              className="w-full mt-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>Lancer l'analyse IA ({selectedImages.length} photo{selectedImages.length > 1 ? 's' : ''})</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Loading Analysis */}
        {isAnalyzing && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-pink-100 text-center">
            <div className="animate-spin w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Analyse de {selectedImages.length} photo{selectedImages.length > 1 ? 's' : ''} en cours...
            </h3>
            <p className="text-gray-600">Notre IA analyse chaque détail pour un diagnostic ultra-précis</p>
          </div>
        )}

        {/* 🆕 NOUVEAU FLOW OPTIMISÉ - TUNNEL DE VENTE */}
        {analysis && currentStep === 'chat' && (
          <div className="space-y-8">
            
            {/* 1. ✅ Scores de Peau */}
            {analysis.scores && (
              <SkinScore 
                scores={analysis.scores}
                skinAge={analysis.skinAge}
                realAge={questionnaire?.age}
                confidence={analysis.confidence}
              />
            )}

            {/* 2. ✅ Diagnostic Personnalisé */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-pink-100">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Award className="w-8 h-8" />
                    <div>
                      <h3 className="text-2xl font-bold">Diagnostic Personnalisé</h3>
                      <p className="opacity-90">Analyse IA de {selectedImages.length} photo{selectedImages.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <button
                    onClick={resetAnalysis}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Nouvelle analyse</span>
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Type de peau */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100">
                      <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                        <Droplets className="w-5 h-5 text-pink-500 mr-2" />
                        Type de Peau Identifié
                      </h4>
                      <div className="bg-white rounded-xl p-4 border border-pink-200">
                        <p className="text-xl font-bold text-pink-600 mb-2">{analysis.skinType}</p>
                        <p className="text-gray-700 text-sm leading-relaxed">{analysis.skinTypeExplanation}</p>
                      </div>
                    </div>

                    {/* Zones d'attention */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Star className="w-5 h-5 text-orange-500 mr-2" />
                        Observations Détaillées
                      </h4>
                      <div className="space-y-3">
                        {analysis.concerns.map((concern, index) => (
                          <div key={index} className="bg-white rounded-xl p-4 border border-orange-200">
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-orange-600 font-bold text-sm">{index + 1}</span>
                              </div>
                              <p className="text-gray-800 font-medium leading-relaxed">{concern}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Routine Personnalisée */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <Clock className="w-5 h-5 text-blue-500 mr-2" />
                      {analysis.routine.title}
                    </h4>

                    <div className="space-y-6">
                      {/* Routine Matin */}
                      <div className="bg-white rounded-xl p-5 border border-blue-200">
                        <div className="flex items-center mb-4">
                          <Sun className="w-5 h-5 text-yellow-500 mr-2" />
                          <span className="font-bold text-gray-800">ROUTINE MATIN</span>
                        </div>
                        <div className="space-y-3">
                          {analysis.routine.morning.steps?.map((step, index) => (
                            <div key={index} className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                              <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-yellow-800 font-bold text-xs">{step.step}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-800 text-sm">{step.product}</p>
                                  <p className="text-gray-700 text-xs mt-1">{step.action}</p>
                                  <div className="flex items-center mt-2 text-xs text-gray-600">
                                    <Clock className="w-3 h-3 mr-1" />
                                    <span className="mr-3">{step.duration}</span>
                                    <span className="text-blue-600 font-medium">💡 {step.tips}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )) || (
                            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                              <p className="text-yellow-800 text-sm">Routine matin personnalisée en cours de chargement...</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Routine Soir */}
                      <div className="bg-white rounded-xl p-5 border border-blue-200">
                        <div className="flex items-center mb-4">
                          <Moon className="w-5 h-5 text-indigo-500 mr-2" />
                          <span className="font-bold text-gray-800">ROUTINE SOIR</span>
                        </div>
                        <div className="space-y-3">
                          {analysis.routine.evening.steps?.map((step, index) => (
                            <div key={index} className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                              <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-indigo-800 font-bold text-xs">{step.step}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-800 text-sm">{step.product}</p>
                                  <p className="text-gray-700 text-xs mt-1">{step.action}</p>
                                  <div className="flex items-center mt-2 text-xs text-gray-600">
                                    <Clock className="w-3 h-3 mr-1" />
                                    <span className="mr-3">{step.duration}</span>
                                    <span className="text-blue-600 font-medium">💡 {step.tips}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )) || (
                            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                              <p className="text-indigo-800 text-sm">Routine soir personnalisée en cours de chargement...</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Fréquences */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <h5 className="font-semibold text-gray-800 mb-3 text-sm">📅 Calendrier d'Usage</h5>
                        <div className="space-y-2 text-xs">
                          <div><span className="font-medium text-green-700">Quotidien:</span> <span className="text-gray-700">{analysis.routine.frequency?.daily}</span></div>
                          <div><span className="font-medium text-blue-700">Hebdomadaire:</span> <span className="text-gray-700">{analysis.routine.frequency?.weekly}</span></div>
                          <div><span className="font-medium text-purple-700">Mensuel:</span> <span className="text-gray-700">{analysis.routine.frequency?.monthly}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. 🆕 RECOMMANDATIONS PRODUITS AVEC BOUTON BOUTIQUE */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-pink-100">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex items-center">
                  <ShoppingCart className="w-8 h-8 text-pink-500 mr-3" />
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800">Produits Recommandés</h4>
                    <p className="text-gray-600">Sélectionnés spécialement pour votre peau</p>
                  </div>
                </div>
                
                {/* 🆕 BOUTON BOUTIQUE COMPLÈTE - TUNNEL DE VENTE */}
                <button
                  onClick={handleViewFullShop}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 transform hover:scale-105"
                >
                  <span>🛍️</span>
                  Voir la boutique complète
                </button>
              </div>

              {/* Grille produits recommandés */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysis.products.map((product, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 hover:border-pink-300 transition-all duration-300 hover:shadow-xl group">
                    <div className="relative bg-white rounded-t-2xl p-6 flex items-center justify-center h-48">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="object-contain group-hover:scale-105 transition-transform duration-300 max-w-full max-h-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEg4MFY4MEg0MFY0MFoiIGZpbGw9IiNEMUQ1REIiLz4KPHN2Zz4K';
                        }}
                      />
                      {product.discount && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                          -{product.discount}
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-pink-600 bg-pink-100 px-2 py-1 rounded-full">
                            {product.category}
                          </span>
                        </div>
                        <h5 className="font-bold text-gray-800 text-lg leading-tight">{product.name}</h5>
                        <p className="text-gray-600 text-sm font-medium">{product.brand}</p>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-blue-800 text-sm font-medium">✨ Pourquoi ce produit ?</p>
                        <p className="text-blue-700 text-xs mt-1">{product.benefits}</p>
                      </div>

                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="text-green-800 text-sm font-medium">📋 Mode d'emploi</p>
                        <p className="text-green-700 text-xs mt-1">{product.application}</p>
                        <p className="text-green-600 text-xs mt-1 font-medium">🕒 {product.frequency}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex flex-col">
                          {product.originalPrice && (
                            <span className="text-gray-400 line-through text-sm">{product.originalPrice}</span>
                          )}
                          <span className="text-2xl font-bold text-gray-800">{product.price}</span>
                        </div>
                        <a
                          href={product.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Acheter</span>
                        </a>
                      </div>

                      <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
                        <p className="text-yellow-800 text-xs text-center font-medium">
                          🎁 Réduction exclusive via ce lien !
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. ✅ Discussion avec le conseiller IA */}
            <div className="bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-6 h-6" />
                  <div>
                    <h4 className="font-semibold">Discussion avec votre conseiller IA</h4>
                    <p className="text-sm opacity-90">Posez vos questions sur votre analyse</p>
                  </div>
                </div>
              </div>

              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-16">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Posez-moi vos questions sur votre analyse !</p>
                    <p className="text-sm mt-2">Ex: "Comment appliquer ces produits ?" ou "Puis-je utiliser du rétinol ?"</p>
                  </div>
                ) : (
                  chatMessages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-3/4 p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-pink-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Tapez votre question..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-500"
                    disabled={isChatLoading}
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={!currentMessage.trim() || isChatLoading}
                    className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Envoyer
                  </button>
                </div>
              </div>
            </div>

            {/* 5. 🆕 BOUTON SAUVEGARDE FINAL - CONVERSION */}
            <div className="flex justify-center">
              <button
                onClick={handleSaveAnalysis}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-3 transform hover:scale-105 animate-pulse"
              >
                <span>💾</span>
                Enregistrer mon diagnostic personnalisé
                <span>✨</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}