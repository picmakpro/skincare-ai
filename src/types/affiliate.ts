export interface TrackingData {
  userId?: string;
  sessionId: string;
  productId: string;
  partnerId: string;
  source: 'recommendation' | 'category' | 'search';
  timestamp: Date;
  userAgent: string;
  referer?: string;
}

export interface CommissionData {
  partnerId: string;
  productId: string;
  basePrice: number;
  commissionRate: number;
  estimatedCommission: number;
  currency: string;
}

export interface ConversionGoal {
  type: 'click' | 'view' | 'purchase_intent';
  value: number;
  weight: number;
}