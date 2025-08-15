'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Camera, CheckCircle, AlertCircle, X, Upload, RotateCcw } from 'lucide-react'
import { validatePhotoQuality, PhotoValidationResult } from '../lib/photo-validation'

interface PhotoFile {
  file: File
  preview: string
  validation: PhotoValidationResult
  id: string
}

interface PhotoQualityGuideProps {
  onPhotosValidated: (validPhotos: PhotoFile[]) => void
  maxFiles?: number
}

export default function PhotoQualityGuide({ 
  onPhotosValidated, 
  maxFiles = 5 
}: PhotoQualityGuideProps) {
  const [photos, setPhotos] = useState<PhotoFile[]>([])
  const [isValidating, setIsValidating] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsValidating(true)
    
    const newPhotos: PhotoFile[] = []
    
    for (const file of acceptedFiles.slice(0, maxFiles)) {
      const preview = URL.createObjectURL(file)
      const validation = await validatePhotoQuality(file)
      
      newPhotos.push({
        file,
        preview,
        validation,
        id: Math.random().toString(36).substr(2, 9)
      })
    }
    
    setPhotos(prev => [...prev, ...newPhotos].slice(0, maxFiles))
    setIsValidating(false)
  }, [maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxFiles - photos.length,
    disabled: photos.length >= maxFiles
  })

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  const retakePhoto = () => {
    setPhotos([])
  }

  const proceedWithPhotos = () => {
    const validPhotos = photos.filter(p => p.validation.isValid)
    onPhotosValidated(validPhotos)
  }

  const validPhotosCount = photos.filter(p => p.validation.isValid).length
  const canProceed = validPhotosCount > 0 // ✅ CORRECTION ICI

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-pink-100">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Photos de Qualité pour un Diagnostic Précis
        </h2>
        <p className="text-gray-600">
          Prenez 1 à {maxFiles} photos pour une analyse optimale
        </p>
      </div>

      {/* Checklist Qualité */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
          Checklist pour des Photos Parfaites
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Visage net et centré</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Lumière naturelle face à la fenêtre</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Sans maquillage si possible</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Cheveux dégagés du visage</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Pas de filtre ou retouche</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Distance : 30-50 cm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zone Upload */}
      {photos.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`border-3 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive 
              ? 'border-pink-400 bg-pink-50' 
              : 'border-pink-300 hover:border-pink-400 bg-gradient-to-br from-pink-25 to-purple-25'
          }`}
        >
          <input {...getInputProps()} />
          <Camera className="w-12 h-12 text-pink-400 mx-auto mb-4" />
          {isValidating ? (
            <div>
              <div className="animate-spin w-8 h-8 border-3 border-pink-400 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-gray-600">Validation en cours...</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Déposez vos photos ici' : 'Cliquez ou glissez vos photos'}
              </p>
              <p className="text-gray-500">
                {photos.length === 0 
                  ? `Jusqu'à ${maxFiles} photos acceptées` 
                  : `Encore ${maxFiles - photos.length} photo(s) possible(s)`
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Photos Uploadées */}
      {photos.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800">
              Photos Analysées ({photos.length}/{maxFiles})
            </h4>
            <button
              onClick={retakePhoto}
              className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">Tout reprendre</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {photos.map((photo) => (
              <div key={photo.id} className="relative">
                <div className={`rounded-lg border-2 overflow-hidden ${
                  photo.validation.isValid 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-orange-300 bg-orange-50'
                }`}>
                  <div className="aspect-square relative">
                    <img
                      src={photo.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="p-3">
                    <div className="flex items-center mb-2">
                      {photo.validation.isValid ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange-500 mr-2" />
                      )}
                      <span className={`text-sm font-medium ${
                        photo.validation.isValid ? 'text-green-700' : 'text-orange-700'
                      }`}>
                        {photo.validation.isValid ? 'Photo validée' : 'À améliorer'}
                      </span>
                    </div>
                    
                    {!photo.validation.isValid && (
                      <div className="space-y-1">
                        {photo.validation.issues.map((issue, index) => (
                          <p key={index} className="text-xs text-orange-600">
                            • {issue}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Résumé & CTA */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">
                  {validPhotosCount} photo(s) validée(s) sur {photos.length}
                </p>
                {validPhotosCount === 0 ? (
                  <p className="text-sm text-orange-600 mt-1">
                    Améliorez la qualité de vos photos pour continuer
                  </p>
                ) : (
                  <p className="text-sm text-green-600 mt-1">
                    Prêt pour une analyse de qualité !
                  </p>
                )}
              </div>
              
              <button
                onClick={proceedWithPhotos}
                disabled={!canProceed}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Continuer l'Analyse</span>
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}