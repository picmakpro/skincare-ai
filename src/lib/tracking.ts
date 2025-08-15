import { AnalyticsEvent } from '@/types/shop';

export class SkincareAnalytics {
  private static generateSessionId(): string {
    return `skincare_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('skincare_session_id');
      if (!sessionId) {
        sessionId = this.generateSessionId();
        sessionStorage.setItem('skincare_session_id', sessionId);
      }
      return sessionId;
    }
    return this.generateSessionId();
  }

  // ✅ MÉTHODE CORRIGÉE
  public static trackProductView(productId: string, partnerId: string, source: string = 'recommendation'): void {
    const event: AnalyticsEvent = {
      eventType: 'product_view',
      productId,
      partnerId,
      timestamp: new Date(),
      metadata: { source }
    };

    // ✅ Appeler la méthode statique correctement
    SkincareAnalytics.sendAnalyticsEvent(event); // Au lieu de this.sendAnalyticsEvent
    
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'view_item', {
        currency: 'EUR',
        value: 0,
        items: [{
          item_id: productId,
          item_name: productId,
          item_category: 'skincare',
          item_brand: partnerId,
          quantity: 1
        }]
      });
    }
  }

  // ✅ MÉTHODE CORRIGÉE
  public static trackAffiliateClick(
    productId: string, 
    partnerId: string, 
    price: number,
    source: string = 'recommendation'
  ): void {
    const trackingData = {
      sessionId: SkincareAnalytics.getSessionId(), // ✅ Appel correct
      productId,
      partnerId,
      source: source as any,
      timestamp: new Date(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      referer: typeof window !== 'undefined' ? document.referrer : undefined
    };

    // Envoie à notre API de tracking
    SkincareAnalytics.sendTrackingData(trackingData); // ✅ Appel correct

    const event: AnalyticsEvent = {
      eventType: 'product_click',
      productId,
      partnerId,
      timestamp: new Date(),
      metadata: { source, price }
    };

    SkincareAnalytics.sendAnalyticsEvent(event); // ✅ Appel correct

    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'select_item', {
        currency: 'EUR',
        value: price * 0.07,
        items: [{
          item_id: productId,
          item_name: productId,
          item_category: 'skincare',
          item_brand: partnerId,
          quantity: 1,
          price: price
        }]
      });
    }
  }

  public static trackPurchaseIntent(productId: string, partnerId: string, price: number): void {
    const event: AnalyticsEvent = {
      eventType: 'purchase_intent',
      productId,
      partnerId,
      timestamp: new Date(),
      metadata: { price }
    };

    SkincareAnalytics.sendAnalyticsEvent(event); // ✅ Appel correct
  }

  // ✅ MÉTHODES PRIVÉES STATIQUES
  private static async sendTrackingData(data: any): Promise<void> {
    try {
      console.log('Track data:', data); // Pour le développement
      // TODO: Implémenter l'envoi réel vers l'API
    } catch (error) {
      console.error('Erreur tracking:', error);
    }
  }

  private static async sendAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
    try {
      console.log('Analytics event:', event); // Pour le développement
      
      // Stockage local pour retry en cas d'échec
      if (typeof window !== 'undefined') {
        const events = JSON.parse(localStorage.getItem('skincare_analytics_queue') || '[]');
        events.push(event);
        localStorage.setItem('skincare_analytics_queue', JSON.stringify(events));
      }

      // TODO: Implémenter l'envoi réel vers l'API
    } catch (error) {
      console.error('Erreur analytics:', error);
    }
  }

  // Génération des liens d'affiliation avec tracking
  public static generateAffiliateUrl(
    baseUrl: string, 
    trackingParams: string, 
    productId: string,
    partnerId: string
  ): string {
    const sessionId = SkincareAnalytics.getSessionId(); // ✅ Appel correct
    const timestamp = Date.now();
    
    const additionalParams = `&skincare_session=${sessionId}&skincare_product=${productId}&skincare_time=${timestamp}`;
    
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${trackingParams}${additionalParams}`;
  }
}

// Fonctions utilitaires exportées
export const trackView = SkincareAnalytics.trackProductView;
export const trackClick = SkincareAnalytics.trackAffiliateClick;
export const trackIntent = SkincareAnalytics.trackPurchaseIntent;
export const generateUrl = SkincareAnalytics.generateAffiliateUrl;