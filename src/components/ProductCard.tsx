'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/types/shop';
import { trackView, trackClick, generateUrl } from '@/lib/tracking';
import { getPartner } from '@/lib/affiliate-partners';
import { Star, ShoppingCart, Award, Zap, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  source?: string;
  showFullDescription?: boolean;
  priority?: boolean;
}

export default function ProductCard({ 
  product, 
  source = 'recommendation',
  showFullDescription = false,
  priority = false 
}: ProductCardProps) {
  const partner = getPartner(product.partnerId);
  
  React.useEffect(() => {
    // Track product view when component mounts
    trackView(product.id, product.partnerId, source);
  }, [product.id, product.partnerId, source]);

  const handleProductClick = () => {
    // Track click before redirect
    trackClick(product.id, product.partnerId, product.price, source);
    
    // Generate tracked affiliate URL
    const affiliateUrl = generateUrl(
      product.affiliateUrl, 
      partner?.trackingParam || '', 
      product.id,
      product.partnerId
    );
    
    // Open in new tab
    window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <Image
          src={product.image}
          alt={`${product.brand} ${product.name}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          priority={priority}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isBestseller && (
            <div className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Award className="w-3 h-3" />
              Bestseller
            </div>
          )}
          {product.isRecommended && (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Recommandé IA
            </div>
          )}
          {discountPercentage && (
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              -{discountPercentage}%
            </div>
          )}
        </div>

        {/* Partner Logo */}
        {partner && (
          <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md">
            <Image
              src={partner.logo}
              alt={partner.name}
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
        )}

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full font-semibold">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand & Name */}
        <div className="mb-2">
          <p className="text-sm font-semibold text-purple-600 mb-1">{product.brand}</p>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        {/* Description */}
        <p className={`text-gray-600 text-sm mb-4 ${showFullDescription ? '' : 'line-clamp-2'}`}>
          {product.description}
        </p>

        {/* Skin Concerns Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {product.skinConcerns.slice(0, 3).map((concern) => (
            <span
              key={concern}
              className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium"
            >
              {concern === 'dryness' && '🏜️ Sécheresse'}
              {concern === 'oiliness' && '✨ Peau grasse'}
              {concern === 'acne' && '🎯 Acné'}
              {concern === 'aging' && '⏰ Anti-âge'}
              {concern === 'sensitivity' && '🌸 Sensibilité'}
              {concern === 'pigmentation' && '🌟 Éclat'}
              {concern === 'pores' && '🔍 Pores'}
              {concern === 'redness' && '🌹 Rougeurs'}
            </span>
          ))}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-purple-600">
              {product.price.toFixed(2)}€
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {product.originalPrice.toFixed(2)}€
              </span>
            )}
          </div>
          
          <button
            onClick={handleProductClick}
            disabled={!product.inStock}
            className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 ${
              product.inStock
                ? 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105 shadow-lg hover:shadow-purple-500/25'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {product.inStock ? 'Voir le prix' : 'Indisponible'}
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Commission Info (for dev/admin) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 text-xs text-gray-500 border-t pt-2">
            Commission: {product.commission.toFixed(2)}€ ({((product.commission/product.price)*100).toFixed(1)}%)
          </div>
        )}
      </div>
    </div>
  );
}