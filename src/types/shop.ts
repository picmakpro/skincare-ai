export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  description: string;
  category: ProductCategory;
  skinConcerns: SkinConcern[];
  ingredients: string[];
  rating: number;
  reviewCount: number;
  affiliateUrl: string;
  partnerId: string;
  commission: number;
  inStock: boolean;
  isBestseller?: boolean;
  isRecommended?: boolean;
}

export interface AffiliatePartner {
  id: string;
  name: string;
  baseUrl: string;
  commissionRate: number;
  trackingParam: string;
  currency: string;
  logo: string;
  trustScore: number;
}

export interface RecommendationContext {
  scores: {
    hydration: number;
    sebum: number;
    texture: number;
    evenness: number;
    tolerance: number;
  };
  skinAge: number;
  skinType: string;
  mainConcerns: SkinConcern[];
  budget?: 'low' | 'medium' | 'high';
}

export type ProductCategory = 
  | 'cleanser' 
  | 'moisturizer' 
  | 'serum' 
  | 'sunscreen' 
  | 'treatment' 
  | 'toner' 
  | 'mask' 
  | 'exfoliant';

export type SkinConcern = 
  | 'acne' 
  | 'aging' 
  | 'dryness' 
  | 'oiliness' 
  | 'sensitivity' 
  | 'pigmentation' 
  | 'pores' 
  | 'redness';

export interface AnalyticsEvent {
  eventType: 'product_view' | 'product_click' | 'purchase_intent' | 'conversion';
  productId: string;
  partnerId: string;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}