import { supabase } from "./supabase";
import type { Appointment } from "@/types/entities";
import type { CreateAppointment, UpdateAppointment } from "@/types/validation";

const TABLE = "appointments";

export async function listAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      clients!client_id (name, phone, email)
    `)
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true });
  if (error) throw error;
  return data as Appointment[];
}

export async function getAppointment(id: string): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      clients!client_id (name, phone, email)
    `)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Appointment;
}

export async function createAppointment(input: CreateAppointment): Promise<Appointment> {
  const payload = { 
    status: "scheduled", 
    duration: 60,
    ...input 
  };
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as Appointment;
}

export async function updateAppointment(id: string, input: UpdateAppointment): Promise<Appointment> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Appointment;
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

export async function getAppointmentsByDate(date: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      clients!client_id (name, phone, email)
    `)
    .eq("scheduled_date", date)
    .order("scheduled_time", { ascending: true });
  if (error) throw error;
  return data as Appointment[];
}

export async function getAppointmentsByClient(clientId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("client_id", clientId)
    .order("scheduled_date", { ascending: false })
    .order("scheduled_time", { ascending: false });
  if (error) throw error;
  return data as Appointment[];
}

export async function getUpcomingAppointments(): Promise<Appointment[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      clients!client_id (name, phone, email)
    `)
    .gte("scheduled_date", today)
    .in("status", ["scheduled", "confirmed"])
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true })
    .limit(10);
  if (error) throw error;
  return data as Appointment[];
}

export async function confirmAppointment(id: string): Promise<Appointment> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: "confirmed" })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Appointment;
}

export async function completeAppointment(id: string): Promise<Appointment> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: "completed" })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Appointment;
}

export async function cancelAppointment(id: string): Promise<Appointment> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: "cancelled" })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Appointment;
}

export function onAppointmentsChange(callback: (payload: Appointment) => void) {
  return supabase
    .channel("appointments-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: TABLE },
      (payload) => {
        callback(payload.new as Appointment);
      }
    )
    .subscribe();
}
