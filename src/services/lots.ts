import { supabase } from "./supabase";
import type { Lot } from "@/types/entities";
import type { CreateLot, UpdateLot } from "@/types/validation";

const TABLE = "lots";

export async function listLots(): Promise<Lot[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Lot[];
}

export async function getLot(id: string): Promise<Lot | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Lot;
}

export async function createLot(input: CreateLot): Promise<Lot> {
  const payload = { status: "available", ...input };
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as Lot;
}

export async function updateLot(id: string, input: UpdateLot): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update(input)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteLot(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

export async function reserveLot(id: string, clientId: string): Promise<Lot> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      status: "reserved",
      reserved_by: clientId,
      date_reserved: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Lot;
}

export async function unreserveLot(id: string): Promise<Lot> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      status: "available",
      reserved_by: null,
      date_reserved: null,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Lot;
}

export async function sellLot(id: string, clientId: string): Promise<Lot> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      status: "sold",
      sold_to: clientId,
      date_sold: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Lot;
}

export async function listAvailableLots(): Promise<Lot[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("status", "available")
    .order("block_number", { ascending: true })
    .order("lot_number", { ascending: true });
  if (error) throw error;
  return data as Lot[];
}

export function onLotsChange(callback: (payload: any) => void) {
  return supabase
    .channel("lots-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: TABLE },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
}

export async function bookLot({ lotId, clientId }: { lotId: string; clientId: string; }): Promise<Lot> {
    return sellLot(lotId, clientId);
}
