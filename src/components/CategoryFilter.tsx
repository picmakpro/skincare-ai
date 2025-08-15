'use client';

import React from 'react';
import { ProductCategory } from '@/types/shop';
import { 
  Droplets, 
  Sun, 
  Sparkles, 
  Shield, 
  Heart, 
  Zap, 
  Filter,
  X
} from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: ProductCategory | 'all';
  onCategoryChange: (category: ProductCategory | 'all') => void;
  productCounts?: Record<string, number>;
}

const categoryConfig = {
  all: { 
    label: 'Tous les produits', 
    icon: Filter, 
    color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
  },
  cleanser: { 
    label: 'Nettoyants', 
    icon: Droplets, 
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
  },
  moisturizer: { 
    label: 'Hydratants', 
    icon: Heart, 
    color: 'bg-pink-100 text-pink-700 hover:bg-pink-200' 
  },
  serum: { 
    label: 'Sérums', 
    icon: Sparkles, 
    color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
  },
  sunscreen: { 
    label: 'Protection solaire', 
    icon: Sun, 
    color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
  },
  treatment: { 
    label: 'Traitements', 
    icon: Zap, 
    color: 'bg-green-100 text-green-700 hover:bg-green-200' 
  },
  toner: { 
    label: 'Toniques', 
    icon: Droplets, 
    color: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200' 
  },
  mask: { 
    label: 'Masques', 
    icon: Shield, 
    color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
  },
  exfoliant: { 
    label: 'Exfoliants', 
    icon: Sparkles, 
    color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
  }
};

export default function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange, 
  productCounts = {} 
}: CategoryFilterProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-purple-600" />
          Filtrer par catégorie
        </h3>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden bg-purple-100 text-purple-600 p-2 rounded-xl"
        >
          {isExpanded ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
        </button>
      </div>

      <div className={`${isExpanded ? 'block' : 'hidden'} md:block`}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(categoryConfig).map(([category, config]) => {
            const Icon = config.icon;
            const count = productCounts[category] || 0;
            const isSelected = selectedCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => onCategoryChange(category as ProductCategory | 'all')}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 text-purple-700 scale-105 shadow-lg'
                    : `border-gray-200 ${config.color}`
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-semibold text-center leading-tight">
                  {config.label}
                </span>
                
                {count > 0 && (
                  <span className={`absolute -top-2 -right-2 text-xs font-bold px-2 py-1 rounded-full ${
                    isSelected 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-600 text-white'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Reset Filter */}
        {selectedCategory !== 'all' && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => onCategoryChange('all')}
              className="text-sm text-gray-600 hover:text-purple-600 flex items-center gap-1 transition-colors"
            >
              <X className="w-4 h-4" />
              Réinitialiser le filtre
            </button>
          </div>
        )}
      </div>
    </div>
  );
}