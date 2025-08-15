import { AffiliatePartner } from '@/types/shop';

export const affiliatePartners: Record<string, AffiliatePartner> = {
  sephora: {
    id: 'sephora',
    name: 'Sephora',
    baseUrl: 'https://www.sephora.fr',
    commissionRate: 0.07,
    trackingParam: 'utm_source=skincare_ai&utm_medium=affiliate',
    currency: 'EUR',
    logo: '/images/partners/sephora-logo.png',
    trustScore: 9.5
  },
  nocibe: {
    id: 'nocibe',
    name: 'Nocibé',
    baseUrl: 'https://www.nocibe.fr',
    commissionRate: 0.08,
    trackingParam: 'utm_source=skincare_ai&utm_medium=affiliate',
    currency: 'EUR',
    logo: '/images/partners/nocibe-logo.png',
    trustScore: 8.8
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    baseUrl: 'https://www.amazon.fr',
    commissionRate: 0.06,
    trackingParam: 'tag=skincare_ai-21',
    currency: 'EUR',
    logo: '/images/partners/amazon-logo.png',
    trustScore: 9.2
  },
  beauteprivee: {
    id: 'beauteprivee',
    name: 'Beauté Privée',
    baseUrl: 'https://www.beauteprivee.fr',
    commissionRate: 0.10,
    trackingParam: 'utm_source=skincare_ai&utm_medium=affiliate',
    currency: 'EUR',
    logo: '/images/partners/beauteprivee-logo.png',
    trustScore: 8.5
  },
  feelunique: {
    id: 'feelunique',
    name: 'Feelunique',
    baseUrl: 'https://www.feelunique.com',
    commissionRate: 0.08,
    trackingParam: 'utm_source=skincare_ai&utm_medium=affiliate',
    currency: 'EUR',
    logo: '/images/partners/feelunique-logo.png',
    trustScore: 8.7
  },
  iherb: {
    id: 'iherb',
    name: 'iHerb',
    baseUrl: 'https://fr.iherb.com',
    commissionRate: 0.09,
    trackingParam: 'icode=SKINCARE_AI&rcode=SKINCARE_AI',
    currency: 'EUR',
    logo: '/images/partners/iherb-logo.png',
    trustScore: 9.0
  }
};

export const getPartner = (partnerId: string): AffiliatePartner | null => {
  return affiliatePartners[partnerId] || null;
};

export const getAllPartners = (): AffiliatePartner[] => {
  return Object.values(affiliatePartners);
};