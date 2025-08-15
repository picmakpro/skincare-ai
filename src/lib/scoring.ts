export interface SkinScores {
  hydration: number
  sebum: number
  texture: number
  tone: number
  tolerance: number
}

export interface ScoreCalculationInput {
  concerns: string[]
  mainConcern?: string
  age?: string
  sensitivities?: string[]
  isConservative?: boolean
  confidence?: number
}

export function calculateSkinScores(input: ScoreCalculationInput): SkinScores {
  const { concerns, mainConcern, age, sensitivities = [], isConservative = false, confidence = 1.0 } = input
  
  // Base scores - mode conservateur a des scores plus élevés
  let hydration = isConservative ? 85 : 75
  let sebum = isConservative ? 88 : 75
  let texture = isConservative ? 87 : 75
  let tone = isConservative ? 92 : 75
  let tolerance = isConservative ? 95 : 75
  
  // Ajustements selon les concerns détaillés
  concerns.forEach(concern => {
    const lowerConcern = concern.toLowerCase()
    
    // Hydratation
    if (lowerConcern.includes('sèche') || lowerConcern.includes('déshydrat')) hydration -= 20
    if (lowerConcern.includes('tiraillement') || lowerConcern.includes('squame')) hydration -= 15
    
    // Sébum
    if (lowerConcern.includes('gras') || lowerConcern.includes('brillant')) sebum -= 25
    if (lowerConcern.includes('sébum') || lowerConcern.includes('luisant')) sebum -= 20
    
    // Texture
    if (lowerConcern.includes('pores') || lowerConcern.includes('dilaté')) texture -= 18
    if (lowerConcern.includes('rugue') || lowerConcern.includes('irrégulier')) texture -= 15
    if (lowerConcern.includes('grain')) texture -= 12
    
    // Uniformité du teint
    if (lowerConcern.includes('tache') || lowerConcern.includes('pigment')) tone -= 22
    if (lowerConcern.includes('rougeur') || lowerConcern.includes('couperose')) tone -= 18
    if (lowerConcern.includes('cernes') || lowerConcern.includes('terne')) tone -= 15
    
    // Tolérance
    if (lowerConcern.includes('sensib') || lowerConcern.includes('irritation')) tolerance -= 25
    if (lowerConcern.includes('réact') || lowerConcern.includes('allergie')) tolerance -= 30
    if (lowerConcern.includes('picotement') || lowerConcern.includes('brûlure')) tolerance -= 20
  })
  
  // Ajustements selon préoccupation principale
  switch(mainConcern) {
    case 'Acné':
      sebum -= 15
      texture -= 10
      tolerance -= 10
      break
    case 'Sécheresse':
      hydration -= 20
      tolerance -= 8
      break
    case 'Rides':
      hydration -= 12
      texture -= 15
      break
    case 'Taches':
      tone -= 20
      break
    case 'Sensibilité':
      tolerance -= 20
      hydration -= 8
      break
    case 'Pores dilatés':
      texture -= 18
      sebum -= 10
      break
  }
  
  // Ajustements selon âge
  const ageAdjustments: { [key: string]: Partial<SkinScores> } = {
    '16-25': { tolerance: -5, sebum: -10 }, // Plus de problèmes hormones
    '26-35': {}, // Âge optimal
    '36-45': { hydration: -8, texture: -5 }, // Début vieillissement
    '46+': { hydration: -15, texture: -12, tone: -8 } // Vieillissement visible
  }
  
  const ageAdj = ageAdjustments[age || '26-35'] || {}
  hydration += ageAdj.hydration || 0
  sebum += ageAdj.sebum || 0
  texture += ageAdj.texture || 0
  tone += ageAdj.tone || 0
  tolerance += ageAdj.tolerance || 0
  
  // Pénalité si sensibilités multiples
  if (sensitivities.length > 2) {
    tolerance -= sensitivities.length * 5
  }
  
  // Ajustement selon confidence de l'analyse
  if (confidence < 0.6) {
    // Si faible confidence, on reste prudent (scores plus moyens)
    const confidencePenalty = (0.6 - confidence) * 20
    hydration = Math.max(hydration - confidencePenalty, 50)
    sebum = Math.max(sebum - confidencePenalty, 50)
    texture = Math.max(texture - confidencePenalty, 50)
    tone = Math.max(tone - confidencePenalty, 50)
    tolerance = Math.max(tolerance - confidencePenalty, 40)
  }
  
  // Clamp final 0-100
  return {
    hydration: Math.max(0, Math.min(100, Math.round(hydration))),
    sebum: Math.max(0, Math.min(100, Math.round(sebum))),
    texture: Math.max(0, Math.min(100, Math.round(texture))),
    tone: Math.max(0, Math.min(100, Math.round(tone))),
    tolerance: Math.max(0, Math.min(100, Math.round(tolerance)))
  }
}

export function calculateSkinAge(scores: SkinScores, realAge: string, confidence: number = 1.0): number {
  const ageMap: { [key: string]: number } = {
    '16-25': 21,
    '26-35': 30,
    '36-45': 40,
    '46+': 50
  }
  
  const baseAge = ageMap[realAge] || 30
  let skinAge = baseAge
  
  // Ajustements basés sur les scores
  const avgScore = (scores.hydration + scores.sebum + scores.texture + scores.tone + scores.tolerance) / 5
  
  if (avgScore >= 85) skinAge -= 3 // Peau excellent état
  else if (avgScore >= 75) skinAge -= 1 // Peau en bon état
  else if (avgScore >= 60) skinAge += 0 // Peau état moyen
  else if (avgScore >= 45) skinAge += 2 // Peau fatiguée
  else skinAge += 3 // Peau très fatiguée
  
  // Ajustements spécifiques
  if (scores.texture < 50) skinAge += 1
  if (scores.tone < 50) skinAge += 1
  if (scores.hydration > 85) skinAge -= 1
  if (scores.tolerance > 90) skinAge -= 1
  
  // Si faible confidence, on reste proche de l'âge réel
  if (confidence < 0.6) {
    const diff = skinAge - baseAge
    skinAge = baseAge + (diff * 0.5) // Réduire l'écart
  }
  
  // Cap ±3 ans
  return Math.max(baseAge - 3, Math.min(baseAge + 3, Math.round(skinAge)))
}

export function getScoreLabel(score: number): { label: string; color: string; bgColor: string } {
  if (score >= 80) return { 
    label: 'Excellent', 
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  }
  if (score >= 60) return { 
    label: 'Bon', 
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  }
  if (score >= 40) return { 
    label: 'Moyen', 
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  }
  return { 
    label: 'Faible', 
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  }
}

export function getScoreInsights(scores: SkinScores): {
  strengths: string[]
  improvements: string[]
  priority: string
} {
  const scoreEntries = Object.entries(scores) as [keyof SkinScores, number][]
  const sortedScores = scoreEntries.sort((a, b) => b[1] - a[1])
  
  const strengthLabels: { [key in keyof SkinScores]: string } = {
    hydration: 'Excellente hydratation naturelle',
    sebum: 'Contrôle parfait du sébum',
    texture: 'Texture de peau remarquable',
    tone: 'Teint uniforme et lumineux',
    tolerance: 'Peau très tolérante'
  }
  
  const improvementLabels: { [key in keyof SkinScores]: string } = {
    hydration: 'Renforcer l\'hydratation quotidienne',
    sebum: 'Mieux contrôler la production de sébum',
    texture: 'Améliorer la texture et resserrer les pores',
    tone: 'Unifier le teint et réduire les taches',
    tolerance: 'Apaiser et renforcer la barrière cutanée'
  }
  
  const strengths = sortedScores
    .filter(([_, score]) => score >= 75)
    .slice(0, 2)
    .map(([key, _]) => strengthLabels[key])
  
  const improvements = sortedScores
    .filter(([_, score]) => score < 60)
    .slice(0, 2)
    .map(([key, _]) => improvementLabels[key])
  
  const lowestScore = sortedScores[sortedScores.length - 1]
  const priority = improvementLabels[lowestScore[0]]
  
  return { strengths, improvements, priority }
}