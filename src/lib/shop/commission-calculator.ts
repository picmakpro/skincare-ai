import { CommissionData } from '@/types/affiliate';
import { affiliatePartners } from '../affiliate-partners';

export class CommissionCalculator {
  public static calculateCommission(
    partnerId: string,
    basePrice: number,
    quantity: number = 1
  ): CommissionData {
    const partner = affiliatePartners[partnerId];
    
    if (!partner) {
      throw new Error(`Partner ${partnerId} not found`);
    }

    const totalPrice = basePrice * quantity;
    const estimatedCommission = totalPrice * partner.commissionRate;

    return {
      partnerId,
      productId: '', // Sera rempli par l'appelant
      basePrice: totalPrice,
      commissionRate: partner.commissionRate,
      estimatedCommission: Math.round(estimatedCommission * 100) / 100,
      currency: partner.currency
    };
  }

  public static calculateDailyProjection(
    avgOrderValue: number,
    dailyClicks: number,
    conversionRate: number,
    avgCommissionRate: number = 0.07
  ): {
    dailyRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
  } {
    const dailyOrders = dailyClicks * (conversionRate / 100);
    const dailyRevenue = dailyOrders * avgOrderValue * avgCommissionRate;
    
    return {
      dailyRevenue: Math.round(dailyRevenue * 100) / 100,
      monthlyRevenue: Math.round(dailyRevenue * 30 * 100) / 100,
      yearlyRevenue: Math.round(dailyRevenue * 365 * 100) / 100
    };
  }

  public static getTopPerformingPartners(
    commissionData: CommissionData[]
  ): { partnerId: string; totalCommission: number; orderCount: number }[] {
    const partnerStats = commissionData.reduce((acc, data) => {
      if (!acc[data.partnerId]) {
        acc[data.partnerId] = {
          partnerId: data.partnerId,
          totalCommission: 0,
          orderCount: 0
        };
      }
      
      acc[data.partnerId].totalCommission += data.estimatedCommission;
      acc[data.partnerId].orderCount += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(partnerStats)
      .sort((a: any, b: any) => b.totalCommission - a.totalCommission);
  }
}