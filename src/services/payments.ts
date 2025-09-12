import { supabase } from "./supabase";
import type { Payment } from "@/types/entities";
import type { CreatePayment, UpdatePayment } from "@/types/validation";

const TABLE = "payments";

export async function listPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      clients!client_id (name),
      lots!lot_id (block_number, lot_number)
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Payment[];
}

export async function getPayment(id: string): Promise<Payment | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      clients!client_id (name),
      lots!lot_id (block_number, lot_number)
    `)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Payment;
}

export async function createPayment(input: CreatePayment): Promise<Payment> {
  const payload = { status: "pending", ...input };
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as Payment;
}

export async function updatePayment(id: string, input: UpdatePayment): Promise<Payment> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Payment;
}

export async function deletePayment(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

export async function getPaymentsByClient(clientId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      lots!lot_id (block_number, lot_number)
    `)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Payment[];
}

export async function getPaymentsByLot(lotId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      clients!client_id (name)
    `)
    .eq("lot_id", lotId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Payment[];
}

export async function confirmPayment(id: string): Promise<Payment> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: "confirmed" })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Payment;
}

export async function generateReceiptNumber(): Promise<string> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("receipt_no")
    .order("created_at", { ascending: false })
    .limit(1);
  
  if (error) throw error;
  
  if (data && data.length > 0) {
    const lastReceiptNo = data[0].receipt_no;
    const match = lastReceiptNo.match(/REC-(\d+)/);
    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      return `REC-${nextNumber.toString().padStart(6, '0')}`;
    }
  }
  
  return "REC-000001";
}

export function onPaymentsChange(callback: (payload: Payment) => void) {
  return supabase
    .channel("payments-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: TABLE },
      (payload) => {
        callback(payload.new as Payment);
      }
    )
    .subscribe();
}
