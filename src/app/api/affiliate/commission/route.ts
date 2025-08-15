import { NextRequest, NextResponse } from 'next/server';
import { CommissionCalculator } from '@/lib/shop/commission-calculator';

export async function POST(request: NextRequest) {
  try {
    const { partnerId, basePrice, quantity = 1 } = await request.json();

    if (!partnerId || !basePrice) {
      return NextResponse.json(
        { error: 'Partner ID et prix requis' },
        { status: 400 }
      );
    }

    const commissionData = CommissionCalculator.calculateCommission(
      partnerId,
      basePrice,
      quantity
    );

    return NextResponse.json({
      success: true,
      commission: commissionData
    });

  } catch (error) {
    console.error('Erreur calcul commission:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul de commission' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const avgOrderValue = parseFloat(searchParams.get('avgOrderValue') || '50');
    const dailyClicks = parseInt(searchParams.get('dailyClicks') || '100');
    const conversionRate = parseFloat(searchParams.get('conversionRate') || '3');

    const projection = CommissionCalculator.calculateDailyProjection(
      avgOrderValue,
      dailyClicks,
      conversionRate
    );

    return NextResponse.json({
      success: true,
      projection
    });

  } catch (error) {
    console.error('Erreur projection revenus:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul des projections' },
      { status: 500 }
    );
  }
}