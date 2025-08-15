import { NextRequest, NextResponse } from 'next/server';
import { TrackingData } from '@/types/affiliate';

export async function POST(request: NextRequest) {
  try {
    const trackingData: TrackingData = await request.json();
    
    // Validation des données
    if (!trackingData.productId || !trackingData.partnerId) {
      return NextResponse.json(
        { error: 'Données de tracking incomplètes' },
        { status: 400 }
      );
    }

    // Ici vous pourrez sauvegarder en base (Supabase)
    console.log('Tracking data:', {
      sessionId: trackingData.sessionId,
      productId: trackingData.productId,
      partnerId: trackingData.partnerId,
      source: trackingData.source,
      timestamp: trackingData.timestamp,
      userAgent: trackingData.userAgent?.substring(0, 200) // Limiter la taille
    });

    // TODO: Sauvegarder en Supabase
    /*
    const { data, error } = await supabase
      .from('affiliate_tracking')
      .insert([{
        session_id: trackingData.sessionId,
        product_id: trackingData.productId,
        partner_id: trackingData.partnerId,
        source: trackingData.source,
        timestamp: trackingData.timestamp,
        user_agent: trackingData.userAgent,
        referer: trackingData.referer
      }]);
    */

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur tracking API:', error);
    return NextResponse.json(
      { error: 'Erreur lors du tracking' },
      { status: 500 }
    );
  }
}