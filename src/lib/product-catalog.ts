import { Product } from '@/types/shop';

export const productCatalog: Product[] = [
  // NETTOYANTS
  {
    id: 'cerave-foaming-cleanser',
    name: 'Gel Nettoyant Moussant',
    brand: 'CeraVe',
    price: 12.90,
    image: '/images/products/cerave-cleanser.jpg',
    description: 'Gel nettoyant doux aux céramides essentielles',
    category: 'cleanser',
    skinConcerns: ['oiliness', 'acne'],
    ingredients: ['Ceramides', 'Hyaluronic Acid', 'Niacinamide'],
    rating: 4.5,
    reviewCount: 1247,
    affiliateUrl: 'https://www.sephora.fr/cerave-gel-nettoyant',
    partnerId: 'sephora',
    commission: 0.90,
    inStock: true,
    isBestseller: true
  },
  {
    id: 'la-roche-posay-toleriane',
    name: 'Toleriane Caring Wash',
    brand: 'La Roche-Posay',
    price: 15.50,
    image: '/images/products/lrp-toleriane.jpg',
    description: 'Soin lavant apaisant peaux sensibles',
    category: 'cleanser',
    skinConcerns: ['sensitivity', 'redness'],
    ingredients: ['Thermal Water', 'Glycerin'],
    rating: 4.3,
    reviewCount: 892,
    affiliateUrl: 'https://www.nocibe.fr/la-roche-posay-toleriane',
    partnerId: 'nocibe',
    commission: 1.24,
    inStock: true
  },

  // HYDRATANTS
  {
    id: 'cerave-daily-moisturizer',
    name: 'Crème Hydratante Quotidienne',
    brand: 'CeraVe',
    price: 16.90,
    image: '/images/products/cerave-moisturizer.jpg',
    description: 'Hydratation 24h avec céramides et acide hyaluronique',
    category: 'moisturizer',
    skinConcerns: ['dryness'],
    ingredients: ['Ceramides', 'Hyaluronic Acid', 'MVE Technology'],
    rating: 4.6,
    reviewCount: 2156,
    affiliateUrl: 'https://www.amazon.fr/cerave-creme-hydratante',
    partnerId: 'amazon',
    commission: 1.01,
    inStock: true,
    isBestseller: true,
    isRecommended: true
  },
  {
    id: 'neutrogena-hydro-boost',
    name: 'Hydro Boost Gel-Crème',
    brand: 'Neutrogena',
    price: 14.99,
    image: '/images/products/neutrogena-hydroboost.jpg',
    description: 'Gel-crème à l\'acide hyaluronique',
    category: 'moisturizer',
    skinConcerns: ['dryness', 'oiliness'],
    ingredients: ['Hyaluronic Acid', 'Glycerin'],
    rating: 4.4,
    reviewCount: 1834,
    affiliateUrl: 'https://www.beauteprivee.fr/neutrogena-hydro-boost',
    partnerId: 'beauteprivee',
    commission: 1.50,
    inStock: true
  },

  // SÉRUMS
  {
    id: 'the-ordinary-niacinamide',
    name: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    price: 7.90,
    image: '/images/products/the-ordinary-niacinamide.jpg',
    description: 'Sérum régulateur de sébum et anti-imperfections',
    category: 'serum',
    skinConcerns: ['oiliness', 'acne', 'pores'],
    ingredients: ['Niacinamide', 'Zinc PCA'],
    rating: 4.2,
    reviewCount: 5647,
    affiliateUrl: 'https://www.feelunique.com/the-ordinary-niacinamide',
    partnerId: 'feelunique',
    commission: 0.63,
    inStock: true,
    isBestseller: true
  },
  {
    id: 'mad-hippie-vitamin-c',
    name: 'Vitamin C Serum',
    brand: 'Mad Hippie',
    price: 33.99,
    image: '/images/products/mad-hippie-vitc.jpg',
    description: 'Sérum vitamine C stabilisée + antioxydants',
    category: 'serum',
    skinConcerns: ['aging', 'pigmentation'],
    ingredients: ['Vitamin C', 'Vitamin E', 'Ferulic Acid'],
    rating: 4.7,
    reviewCount: 723,
    affiliateUrl: 'https://fr.iherb.com/mad-hippie-vitamin-c',
    partnerId: 'iherb',
    commission: 3.06,
    inStock: true,
    isRecommended: true
  },

  // PROTECTION SOLAIRE
  {
    id: 'avene-fluide-spf50',
    name: 'Fluide Minéral Teinté SPF50+',
    brand: 'Avène',
    price: 24.50,
    image: '/images/products/avene-spf50.jpg',
    description: 'Protection solaire très haute pour peaux sensibles',
    category: 'sunscreen',
    skinConcerns: ['sensitivity', 'aging'],
    ingredients: ['Zinc Oxide', 'Titanium Dioxide', 'Thermal Water'],
    rating: 4.5,
    reviewCount: 967,
    affiliateUrl: 'https://www.sephora.fr/avene-fluide-spf50',
    partnerId: 'sephora',
    commission: 1.72,
    inStock: true,
    isRecommended: true
  }
];

export const getProductsByCategory = (category: string): Product[] => {
  return productCatalog.filter(product => product.category === category);
};

export const getProductsByConcern = (concern: string): Product[] => {
  return productCatalog.filter(product => 
    product.skinConcerns.includes(concern as any)
  );
};

export const getBestsellerProducts = (): Product[] => {
  return productCatalog.filter(product => product.isBestseller);
};

export const getRecommendedProducts = (): Product[] => {
  return productCatalog.filter(product => product.isRecommended);
};

export const getProductById = (id: string): Product | undefined => {
  return productCatalog.find(product => product.id === id);
};