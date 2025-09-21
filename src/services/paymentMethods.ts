
import { supabase } from "./supabase";
import { PAYMENT_METHODS } from "@/data/payment-methods";

export interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
  is_active?: boolean;
}

export interface CreatePaymentMethod {
  name: string;
  icon?: string;
}

export interface UpdatePaymentMethod {
  name?: string;
  icon?: string;
  is_active?: boolean;
}

const TABLE = "payment_methods";

export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  const { data: customMethods, error } = await supabase.from(TABLE).select("*");

  if (error) {
    console.warn(
      "Could not fetch custom payment methods. This might be because the 'payment_methods' table does not exist. Only predefined methods will be available.",
      error
    );
    return PAYMENT_METHODS;
  }

  return [...PAYMENT_METHODS, ...(customMethods as PaymentMethod[])];
}

export async function createPaymentMethod(input: CreatePaymentMethod): Promise<PaymentMethod> {
  const { data, error } = await supabase.from(TABLE).insert(input).select("*").single();
  if (error) throw error;
  return data as PaymentMethod;
}

export async function updatePaymentMethod(id: string, input: UpdatePaymentMethod): Promise<PaymentMethod> {
  const { data, error } = await supabase.from(TABLE).update(input).eq("id", id).select("*").single();
  if (error) throw error;
  return data as PaymentMethod;
}

export async function deletePaymentMethod(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
