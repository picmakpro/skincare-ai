import { NextRequest, NextResponse } from 'next/server';
import { productCatalog, getProductsByCategory, getProductsByConcern } from '@/lib/product-catalog';
import { getRecommendedProducts } from '@/lib/recommendation-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const concern = searchParams.get('concern');
    const limit = parseInt(searchParams.get('limit') || '12');
    const analysis = searchParams.get('analysis');

    let products = productCatalog;

    // Filtrage par catégorie
    if (category) {
      products = getProductsByCategory(category);
    }

    // Filtrage par préoccupation
    if (concern) {
      products = getProductsByConcern(concern);
    }

    // Recommandations personnalisées
    if (analysis) {
      try {
        const parsedAnalysis = JSON.parse(decodeURIComponent(analysis));
        products = getRecommendedProducts(parsedAnalysis, category || undefined);
      } catch (error) {
        console.error('Erreur parsing analysis:', error);
      }
    }

    // Limite les résultats
    const limitedProducts = products.slice(0, limit);

    return NextResponse.json({
      products: limitedProducts,
      total: products.length,
      hasMore: products.length > limit
    });

  } catch (error) {
    console.error('Erreur API products:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    );
  }
}