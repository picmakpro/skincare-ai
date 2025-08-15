'use client';

import React from 'react';
import { Product } from '@/types/shop';
import ProductCard from '../ProductCard';
import { Loader2 } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  source?: string;
}

export default function ProductGrid({ products, loading = false, source = 'category' }: ProductGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg">
          <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
          <span className="font-semibold text-gray-700">Chargement des produits...</span>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucun produit trouvé
        </h3>
        <p className="text-gray-600">
          Essayez de modifier vos filtres ou votre recherche
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          source={source}
          priority={index < 4}
        />
      ))}
    </div>
  );
}