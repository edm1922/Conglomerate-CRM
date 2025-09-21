
import { supabase } from "./supabase";
import type { Lot } from "@/types/entities";

export interface PricingReportData {
  totalLots: number;
  averagePrice: number;
  averagePricePerSqm: number;
  priceDistribution: Record<string, number>;
}

/**
 * Generates a report on lot pricing.
 * @returns The generated pricing report data.
 */
export async function generatePricingReport(): Promise<PricingReportData> {
  const { data: lots, error } = await supabase
    .from("lots")
    .select("price, size");

  if (error) {
    throw new Error(`Failed to fetch lots: ${error.message}`);
  }

  if (!lots || lots.length === 0) {
    return {
      totalLots: 0,
      averagePrice: 0,
      averagePricePerSqm: 0,
      priceDistribution: {},
    };
  }

  const totalLots = lots.length;
  const totalSalesValue = lots.reduce((acc, lot) => acc + lot.price, 0);
  const totalSize = lots.reduce((acc, lot) => acc + lot.size, 0);

  const averagePrice = totalSalesValue / totalLots;
  const averagePricePerSqm = totalSalesValue / totalSize;

  // Define price ranges for the distribution chart
  const priceRanges = {
    "< 500K": (p: number) => p < 500000,
    "500K - 1M": (p: number) => p >= 500000 && p < 1000000,
    "1M - 2M": (p: number) => p >= 1000000 && p < 2000000,
    "> 2M": (p: number) => p >= 2000000,
  };

  const priceDistribution = lots.reduce((acc, lot) => {
    for (const range in priceRanges) {
      if (priceRanges[range as keyof typeof priceRanges](lot.price)) {
        acc[range] = (acc[range] || 0) + 1;
        break;
      }
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    totalLots,
    averagePrice,
    averagePricePerSqm,
    priceDistribution,
  };
}
