
import { supabase } from "./supabase";
import type { Lot } from "@/types/entities";

const TABLE = "lots";

// Simulated demand factor (can be replaced with a real-time value)
const DEMAND_FACTOR = 1.05; 

/**
 * Calculates a new price for a lot based on its current price and a demand factor.
 * @param currentPrice The current price of the lot.
 * @returns The new, dynamically adjusted price.
 */
function calculateNewPrice(currentPrice: number): number {
  return currentPrice * DEMAND_FACTOR;
}

/**
 * Updates the price of a specific lot using a dynamic pricing algorithm.
 * @param lotId The ID of the lot to update.
 * @returns The updated lot object.
 */
export async function updateLotPrice(lotId: string): Promise<Lot> {
  // First, get the current lot data
  const { data: currentLot, error: fetchError } = await supabase
    .from(TABLE)
    .select("price")
    .eq("id", lotId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch lot: ${fetchError.message}`);
  }

  if (!currentLot) {
    throw new Error("Lot not found.");
  }

  // Calculate the new price
  const newPrice = calculateNewPrice(currentLot.price);

  // Now, update the lot with the new price
  const { data: updatedLot, error: updateError } = await supabase
    .from(TABLE)
    .update({ price: newPrice })
    .eq("id", lotId)
    .select("*")
    .single();

  if (updateError) {
    throw new Error(`Failed to update lot price: ${updateError.message}`);
  }

  return updatedLot as Lot;
}
