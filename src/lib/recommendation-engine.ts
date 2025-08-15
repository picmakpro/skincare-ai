import { Product, RecommendationContext, SkinConcern } from '@/types/shop';
import { productCatalog, getProductsByConcern } from './product-catalog';

export class RecommendationEngine {
  private static getScoreWeight(score: number): number {
    if (score <= 2) return 1.0; // Priorité très haute
    if (score <= 3) return 0.7; // Priorité haute
    return 0.4; // Priorité modérée
  }

  private static mapScoresToConcerns(scores: RecommendationContext['scores']): SkinConcern[] {
    const concerns: SkinConcern[] = [];
    
    // Logique basée sur vos scores de peau
    if (scores.hydration <= 2) concerns.push('dryness');
    if (scores.sebum >= 4) concerns.push('oiliness');
    if (scores.sebum >= 3 && scores.texture <= 3) concerns.push('acne');
    if (scores.evenness <= 2) concerns.push('pigmentation');
    if (scores.tolerance <= 2) concerns.push('sensitivity');
    if (scores.texture <= 2) concerns.push('pores');
    
    return concerns;
  }

  public static getPersonalizedRecommendations(
    context: RecommendationContext,
    limit: number = 6
  ): Product[] {
    const concerns = this.mapScoresToConcerns(context.scores);
    const { skinAge } = context;

    // Scoring des produits
    const scoredProducts = productCatalog.map(product => {
      let score = 0;
      let relevanceCount = 0;

      // Score basé sur les préoccupations détectées
      product.skinConcerns.forEach(concern => {
        if (concerns.includes(concern)) {
          const concernScore = this.getScoreForConcern(concern, context.scores);
          score += concernScore * 10;
          relevanceCount++;
        }
      });

      // Bonus pour l'âge de peau
      if (skinAge > 30 && product.skinConcerns.includes('aging')) {
        score += 15;
      }
      if (skinAge < 25 && product.skinConcerns.includes('acne')) {
        score += 10;
      }

      // Bonus qualité
      score += product.rating * 2;
      score += Math.min(product.reviewCount / 100, 10); // Max 10 points
      
      // Bonus recommandations et bestsellers
      if (product.isRecommended) score += 8;
      if (product.isBestseller) score += 5;

      // Malus si pas de stock
      if (!product.inStock) score = 0;

      // Score de pertinence (évite les recommandations non pertinentes)
      const relevanceScore = relevanceCount > 0 ? score : score * 0.1;

      return { product, score: relevanceScore, relevanceCount };
    });

    // Tri par score décroissant
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);
  }

  private static getScoreForConcern(concern: SkinConcern, scores: any): number {
    const scoreMap = {
      'dryness': this.getScoreWeight(scores.hydration),
      'oiliness': this.getScoreWeight(5 - scores.sebum),
      'acne': this.getScoreWeight(scores.sebum > 3 ? 5 - scores.texture : 5),
      'pigmentation': this.getScoreWeight(scores.evenness),
      'sensitivity': this.getScoreWeight(scores.tolerance),
      'pores': this.getScoreWeight(scores.texture),
      'aging': scores.age > 30 ? 1.0 : 0.3,
      'redness': this.getScoreWeight(scores.tolerance)
    };

    return scoreMap[concern] || 0.5;
  }

  public static getRoutineRecommendations(
    context: RecommendationContext
  ): { morning: Product[], evening: Product[] } {
    const allRecommendations = this.getPersonalizedRecommendations(context, 12);

    // Routine matin : focus protection et hydratation
    const morning = allRecommendations.filter(product => 
      ['cleanser', 'moisturizer', 'sunscreen', 'serum'].includes(product.category) &&
      !product.ingredients.some(ing => 
        ing.toLowerCase().includes('retinol') || 
        ing.toLowerCase().includes('aha') ||
        ing.toLowerCase().includes('bha')
      )
    ).slice(0, 4);

    // Routine soir : focus réparation et traitement
    const evening = allRecommendations.filter(product => 
      ['cleanser', 'moisturizer', 'serum', 'treatment'].includes(product.category)
    ).slice(0, 4);

    return { morning, evening };
  }

  public static getCategoryRecommendations(
    category: string,
    context: RecommendationContext,
    limit: number = 4
  ): Product[] {
    const categoryProducts = productCatalog.filter(p => p.category === category);
    const concerns = this.mapScoresToConcerns(context.scores);

    return categoryProducts
      .map(product => ({
        product,
        score: this.calculateProductScore(product, concerns, context)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);
  }

  private static calculateProductScore(
    product: Product, 
    concerns: SkinConcern[], 
    context: RecommendationContext
  ): number {
    let score = product.rating * 2;
    
    // Score préoccupations
    const matchingConcerns = product.skinConcerns.filter(c => concerns.includes(c));
    score += matchingConcerns.length * 5;
    
    // Bonus qualité
    if (product.isRecommended) score += 8;
    if (product.isBestseller) score += 5;
    
    return score;
  }
}

// Fonctions utilitaires
export const getRecommendedProducts = (
  analysis: any,
  category?: string
): Product[] => {
  const context: RecommendationContext = {
    scores: analysis.scores || {
      hydration: 3,
      sebum: 3,
      texture: 3,
      evenness: 3,
      tolerance: 3
    },
    skinAge: analysis.skinAge || 25,
    skinType: analysis.skinType || 'mixte',
    mainConcerns: analysis.concerns || []
  };

  if (category) {
    return RecommendationEngine.getCategoryRecommendations(category, context);
  }

  return RecommendationEngine.getPersonalizedRecommendations(context);
};

export const getRoutineProducts = (analysis: any) => {
  const context: RecommendationContext = {
    scores: analysis.scores,
    skinAge: analysis.skinAge,
    skinType: analysis.skinType || 'mixte',
    mainConcerns: analysis.concerns || []
  };

  return RecommendationEngine.getRoutineRecommendations(context);
};