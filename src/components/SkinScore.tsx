'use client'

import { Award, TrendingUp, Target } from 'lucide-react'
import { SkinScores, getScoreLabel, getScoreInsights } from '../lib/scoring'

interface SkinScoreProps {
  scores: SkinScores
  skinAge?: number
  realAge?: string
  confidence?: number
  className?: string
}

export default function SkinScore({ 
  scores, 
  skinAge, 
  realAge, 
  confidence = 1.0,
  className = '' 
}: SkinScoreProps) {
  const insights = getScoreInsights(scores)
  
  const scoreItems = [
    { 
      key: 'hydration' as keyof SkinScores, 
      label: 'Hydratation', 
      icon: '💧', 
      score: scores.hydration,
      description: 'Niveau d\'hydratation cutanée'
    },
    { 
      key: 'sebum' as keyof SkinScores, 
      label: 'Contrôle Sébum', 
      icon: '✨', 
      score: scores.sebum,
      description: 'Régulation de la production de sébum'
    },
    { 
      key: 'texture' as keyof SkinScores, 
      label: 'Texture', 
      icon: '🏆', 
      score: scores.texture,
      description: 'Lissité et finesse du grain de peau'
    },
    { 
      key: 'tone' as keyof SkinScores, 
      label: 'Uniformité', 
      icon: '🎯', 
      score: scores.tone,
      description: 'Homogénéité et éclat du teint'
    },
    { 
      key: 'tolerance' as keyof SkinScores, 
      label: 'Tolérance', 
      icon: '🛡️', 
      score: scores.tolerance,
      description: 'Résistance et tolérance cutanée'
    }
  ]

  return (
    <div className={`bg-white rounded-3xl shadow-2xl p-8 border border-pink-100 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Award className="w-8 h-8 text-pink-500 mr-3" />
          <h3 className="text-2xl font-bold text-gray-800">Vos Scores Peau</h3>
        </div>
        <p className="text-gray-600">Analyse sur 5 piliers essentiels</p>
        {confidence < 0.6 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              ⚠️ Analyse prudente - Qualité photo moyenne. Scores ajustés pour plus de sécurité.
            </p>
          </div>
        )}
      </div>

      {/* Scores Grid */}
      <div className="grid md:grid-cols-5 gap-6 mb-8">
        {scoreItems.map((item) => {
          const { label: scoreLabel, color, bgColor } = getScoreLabel(item.score)
          const circumference = 2 * Math.PI * 15.9155
          const strokeDasharray = `${(item.score / 100) * circumference}, ${circumference}`
          
          return (
            <div key={item.key} className="text-center group">
              {/* Icon & Label */}
              <div className="mb-4">
                <span className="text-3xl mb-2 block transform group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <h4 className="font-semibold text-gray-800 text-sm leading-tight">
                  {item.label}
                </h4>
                <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.description}
                </p>
              </div>
              
              {/* Circular Progress */}
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background circle */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="2"
                  />
                  {/* Progress circle */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={
                      item.score >= 80 ? "#10B981" : 
                      item.score >= 60 ? "#3B82F6" : 
                      item.score >= 40 ? "#F59E0B" : "#EF4444"
                    }
                    strokeWidth="2"
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{
                      animation: 'drawCircle 1.5s ease-out forwards'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-800">{item.score}</span>
                </div>
              </div>
              
              {/* Score Label */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${color}`}>
                {scoreLabel}
              </div>
            </div>
          )
        })}
      </div>

      {/* Skin Age Section */}
      {skinAge && realAge && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 mb-6">
          <div className="text-center">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500 mr-2" />
              Estimation Âge de Peau
            </h4>
            <div className="flex items-center justify-center space-x-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Âge réel</p>
                <p className="text-2xl font-bold text-gray-700">
                  {realAge.includes('-') ? realAge.split('-')[0] + '-' + realAge.split('-')[1] : realAge} ans
                </p>
              </div>
              <div className="text-4xl text-gray-300">→</div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Âge de peau</p>
                <p className="text-3xl font-bold text-purple-600">{skinAge} ans</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Estimation ludique basée sur l'état de votre peau • Non médicale
            </p>
            {confidence < 0.6 && (
              <p className="text-xs text-yellow-600 mt-1">
                Estimation prudente en raison de la qualité des photos
              </p>
            )}
          </div>
        </div>
      )}

      {/* Insights Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Points Forts */}
        {insights.strengths.length > 0 && (
          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <h5 className="font-semibold text-green-800 mb-3 flex items-center">
              <span className="text-lg mr-2">💪</span>
              Vos Points Forts
            </h5>
            <ul className="space-y-2">
              {insights.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-green-700 flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Axes d'Amélioration */}
        {insights.improvements.length > 0 && (
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
            <h5 className="font-semibold text-blue-800 mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Axes d'Amélioration
            </h5>
            <ul className="space-y-2">
              {insights.improvements.map((improvement, index) => (
                <li key={index} className="text-sm text-blue-700 flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5">→</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Priority Focus */}
      <div className="mt-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-5 border border-pink-200">
        <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
          <span className="text-xl mr-2">🎯</span>
          Priorité N°1Ò
        </h5>
        <p className="text-gray-700 text-sm">
          {insights.priority}
        </p>
      </div>

      <style jsx>{`
        @keyframes drawCircle {
          from {
            stroke-dasharray: 0, 100;
          }
        }
      `}</style>
    </div>
  )
}