'use client';

import React from 'react';
import { Product, ProductCategory } from '@/types/shop';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import { getRecommendedProducts } from '@/lib/recommendation-engine';
import { productCatalog } from '@/lib/product-catalog';
import { 
  ShoppingBag, 
  Sparkles, 
  TrendingUp, 
  Search,
  Loader2,
  Star,
  Shield,
  MessageCircle,
} from 'lucide-react';

interface ShopSectionProps {
  analysis?: any;
}

export default function ShopSection({ analysis }: ShopSectionProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<ProductCategory | 'all'>('all');
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [view, setView] = React.useState<'recommended' | 'category' | 'bestsellers'>('recommended');

  // Calcul des compteurs par catégorie
  const productCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: productCatalog.length };
    
    productCatalog.forEach(product => {
      counts[product.category] = (counts[product.category] || 0) + 1;
    });
    
    return counts;
  }, []);

  // Chargement initial des recommandations
  React.useEffect(() => {
    if (analysis) {
      const recommended = getRecommendedProducts(analysis);
      setProducts(recommended);
    } else {
      // Fallback: bestsellers
      const bestsellers = productCatalog.filter(p => p.isBestseller);
      setProducts(bestsellers);
    }
  }, [analysis]);

  // Filtrage par catégorie
  React.useEffect(() => {
    setLoading(true);
    
    setTimeout(() => {
      let filteredProducts = [...productCatalog];

      // Filtre par catégorie
      if (selectedCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
      }

      // Filtre par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.skinConcerns.some(concern => concern.toLowerCase().includes(query))
        );
      }

      // Tri selon la vue
      switch (view) {
        case 'recommended':
          if (analysis) {
            filteredProducts = getRecommendedProducts(analysis, selectedCategory !== 'all' ? selectedCategory : undefined);
          }
          break;
        case 'bestsellers':
          filteredProducts = filteredProducts.filter(p => p.isBestseller);
          break;
        case 'category':
          filteredProducts = filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
      }

      setProducts(filteredProducts);
      setLoading(false);
    }, 300);
  }, [selectedCategory, searchQuery, view, analysis]);

  return (
    <section className="py-12 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-100 p-3 rounded-2xl">
              <ShoppingBag className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Boutique Skincare
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {analysis 
              ? "Découvrez nos produits sélectionnés spécialement pour votre peau"
              : "Explorez notre sélection de produits skincare premium"
            }
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg flex gap-2">
            <button
              onClick={() => setView('recommended')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                view === 'recommended'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {analysis ? 'Mes Recommandations' : 'Sélection IA'}
            </button>
            <button
              onClick={() => setView('bestsellers')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                view === 'bestsellers'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Bestsellers
            </button>
            <button
              onClick={() => setView('category')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                view === 'category'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Star className="w-4 h-4" />
              Par Note
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un produit, marque..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          productCounts={productCounts}
        />

        {/* Products Grid */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-2xl">
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg">
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                <span className="font-semibold text-gray-700">Chargement des produits...</span>
              </div>
            </div>
          )}

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    source={view === 'recommended' ? 'recommendation' : 'category'}
                    priority={index < 4}
                  />
                ))}
              </div>

              {/* Load More (future feature) */}
              {products.length >= 12 && (
                <div className="text-center mt-12">
                  <button className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-3 rounded-2xl font-semibold hover:bg-purple-600 hover:text-white transition-all">
                    Voir plus de produits
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-gray-600">
                Essayez de modifier vos filtres ou votre recherche
              </p>
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Partenaires de Confiance</h4>
              <p className="text-gray-600 text-sm">Sephora, Nocibé, Amazon et autres retailers certifiés</p>
            </div>
            <div>
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Sélection IA</h4>
              <p className="text-gray-600 text-sm">Recommandations personnalisées basées sur votre analyse</p>
            </div>
            <div>
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Meilleurs Prix</h4>
              <p className="text-gray-600 text-sm">Comparaison automatique pour trouver les meilleures offres</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
