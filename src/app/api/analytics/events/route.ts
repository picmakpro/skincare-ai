import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEvent } from '@/types/affiliate';

export async function POST(request: NextRequest) {
  try {
    const event: AnalyticsEvent = await request.json();

    // Validation
    if (!event.eventType || !event.productId || !event.partnerId) {
      return NextResponse.json(
        { error: 'Données d\'événement incomplètes' },
        { status: 400 }
      );
    }

    // Log pour développement
    console.log('Analytics Event:', {
      type: event.eventType,
      product: event.productId,
      partner: event.partnerId,
      timestamp: event.timestamp,
      metadata: event.metadata
    });

    // TODO: Sauvegarder en Supabase
    /*
    const { data, error } = await supabase
      .from('analytics_events')
      .insert([{
        event_type: event.eventType,
        product_id: event.productId,
        partner_id: event.partnerId,
        user_id: event.userId,
        timestamp: event.timestamp,
        metadata: event.metadata
      }]);

    if (error) throw error;
    */

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur analytics API:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de l\'événement' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const partnerId = searchParams.get('partnerId');

    // TODO: Récupérer depuis Supabase
    // Pour le moment, données mockées
    const mockEvents: AnalyticsEvent[] = [
      {
        eventType: 'product_view',
        productId: 'cerave-foaming-cleanser',
        partnerId: 'sephora',
        timestamp: new Date(),
        metadata: { source: 'recommendation' }
      }
    ];

    const filteredEvents = partnerId 
      ? mockEvents.filter(e => e.partnerId === partnerId)
      : mockEvents;

    return NextResponse.json({
      success: true,
      events: filteredEvents,
      count: filteredEvents.length
    });

  } catch (error) {
    console.error('Erreur récupération analytics:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}