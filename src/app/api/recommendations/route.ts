import { NextRequest, NextResponse } from 'next/server';
import { getRecommendedProducts, getRoutineProducts } from '@/lib/recommendation-engine';

export async function POST(request: NextRequest) {
  try {
    const { analysis, category, type = 'general', limit = 6 } = await request.json();

    if (!analysis) {
      return NextResponse.json(
        { error: 'Données d\'analyse requises' },
        { status: 400 }
      );
    }

    let recommendations;

    switch (type) {
      case 'routine':
        recommendations = getRoutineProducts(analysis);
        break;
      case 'category':
        recommendations = getRecommendedProducts(analysis, category);
        break;
      default:
        recommendations = getRecommendedProducts(analysis);
        break;
    }

    return NextResponse.json({
      success: true,
      recommendations: type === 'routine' ? recommendations : recommendations.slice(0, limit),
      type
    });

  } catch (error) {
    console.error('Erreur API recommendations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération des recommandations' },
      { status: 500 }
    );
  }
}