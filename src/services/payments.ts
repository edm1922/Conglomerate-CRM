import { supabase } from "./supabase";
import type { Payment } from "@/types/entities";
import type { CreatePayment, UpdatePayment } from "@/types/validation";

const PAYMENTS_TABLE = "payments";

// Payment CRUD operations
export async function listPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from(PAYMENTS_TABLE)
    .select("*, clients(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as Payment[];
}

export async function getPayment(id: string): Promise<Payment | null> {
  const { data, error } = await supabase
    .from(PAYMENTS_TABLE)
    .select("*, clients(name)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as Payment;
}

export async function createPayment(input: CreatePayment): Promise<Payment> {
  const { data, error } = await supabase
    .from(PAYMENTS_TABLE)
    .insert(input)
    .select("*, clients(name)")
    .single();
  if (error) throw error;
  return data as unknown as Payment;
}

export async function updatePayment(id: string, input: UpdatePayment): Promise<Payment> {
  const { data, error } = await supabase
    .from(PAYMENTS_TABLE)
    .update(input)
    .eq("id", id)
    .select("*, clients(name)")
    .single();
  if (error) throw error;
  return data as unknown as Payment;
}

export async function deletePayment(id: string): Promise<void> {
  const { error } = await supabase.from(PAYMENTS_TABLE).delete().eq("id", id);
  if (error) throw error;
}

export function onPaymentsChange(callback: (payload: any) => void) {
  return supabase
    .channel('payments-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: PAYMENTS_TABLE },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
}
