import { supabase } from "./supabase";
import type { Appointment } from "@/types/entities";
import type { CreateAppointment, UpdateAppointment } from "@/types/validation";

const APPOINTMENTS_TABLE = "appointments";

// Appointment CRUD operations
export async function listAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from(APPOINTMENTS_TABLE)
    .select("*, clients(name)")
    .order("scheduled_date", { ascending: false });
  if (error) throw error;
  return data as unknown as Appointment[];
}

export async function getAppointment(id: string): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from(APPOINTMENTS_TABLE)
    .select("*, clients(name)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as Appointment;
}

export async function createAppointment(input: CreateAppointment): Promise<Appointment> {
  const { data, error } = await supabase
    .from(APPOINTMENTS_TABLE)
    .insert(input)
    .select("*, clients(name)")
    .single();
  if (error) throw error;
  return data as unknown as Appointment;
}

export async function updateAppointment(id: string, input: UpdateAppointment): Promise<Appointment> {
  const { data, error } = await supabase
    .from(APPOINTMENTS_TABLE)
    .update(input)
    .eq("id", id)
    .select("*, clients(name)")
    .single();
  if (error) throw error;
  return data as unknown as Appointment;
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase.from(APPOINTMENTS_TABLE).delete().eq("id", id);
  if (error) throw error;
}

export function onAppointmentsChange(callback: (payload: any) => void) {
  return supabase
    .channel("appointments-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: APPOINTMENTS_TABLE },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
}
