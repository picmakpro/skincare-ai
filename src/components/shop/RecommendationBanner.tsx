'use client';

import React from 'react';
import { Sparkles, TrendingUp, Award } from 'lucide-react';

interface RecommendationBannerProps {
  skinAge?: number;
  mainConcerns?: string[];
  onViewRecommendations?: () => void;
}

export default function RecommendationBanner({ 
  skinAge, 
  mainConcerns = [], 
  onViewRecommendations 
}: RecommendationBannerProps) {
  const getConcernEmoji = (concern: string) => {
    const emojiMap: Record<string, string> = {
      'dryness': '🏜️',
      'oiliness': '✨',
      'acne': '🎯',
      'aging': '⏰',
      'sensitivity': '🌸',
      'pigmentation': '🌟',
      'pores': '🔍',
      'redness': '🌹'
    };
    return emojiMap[concern] || '🌿';
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-2xl p-6 text-white mb-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-4 right-4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 rounded-full p-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">
                Recommandations Personnalisées
              </h3>
            </div>

            <div className="space-y-3">
              {skinAge && (
                <div className="flex items-center gap-2 text-white/90">
                  <Award className="w-4 h-4" />
                  <span>Âge de peau estimé : <strong>{skinAge} ans</strong></span>
                </div>
              )}
              
              {mainConcerns.length > 0 && (
                <div className="flex items-center gap-2 text-white/90">
                  <TrendingUp className="w-4 h-4" />
                  <span>Préoccupations principales :</span>
                  <div className="flex gap-1">
                    {mainConcerns.slice(0, 3).map((concern, index) => (
                      <span key={concern} className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                        {getConcernEmoji(concern)} {concern}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-white/80 text-sm">
                Nous avons sélectionné les meilleurs produits adaptés à votre profil unique
              </p>
            </div>
          </div>

          {onViewRecommendations && (
            <button
              onClick={onViewRecommendations}
              className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex-shrink-0 ml-4"
            >
              Voir mes produits
            </button>
          )}
        </div>
      </div>
    </div>
  );
}