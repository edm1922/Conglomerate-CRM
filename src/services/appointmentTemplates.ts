import { supabase } from "./supabase";
import type { AppointmentTemplate } from "@/types/entities";
import type { CreateAppointmentTemplate, UpdateAppointmentTemplate } from "@/types/validation";

const APPOINTMENT_TEMPLATES_TABLE = "appointment_templates";

// Appointment Template CRUD operations
export async function listAppointmentTemplates(): Promise<AppointmentTemplate[]> {
  const { data, error } = await supabase
    .from(APPOINTMENT_TEMPLATES_TABLE)
    .select("*")
    .order("template_name", { ascending: true });
  if (error) throw error;
  return data as unknown as AppointmentTemplate[];
}

export async function createAppointmentTemplate(input: CreateAppointmentTemplate): Promise<AppointmentTemplate> {
  const { data, error } = await supabase
    .from(APPOINTMENT_TEMPLATES_TABLE)
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as AppointmentTemplate;
}

export async function updateAppointmentTemplate(id: string, input: UpdateAppointmentTemplate): Promise<AppointmentTemplate> {
  const { data, error } = await supabase
    .from(APPOINTMENT_TEMPLATES_TABLE)
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as AppointmentTemplate;
}

export async function deleteAppointmentTemplate(id: string): Promise<void> {
  const { error } = await supabase.from(APPOINTMENT_TEMPLATES_TABLE).delete().eq("id", id);
  if (error) throw error;
}

export function onAppointmentTemplatesChange(callback: (payload: any) => void) {
  return supabase
    .channel("appointment-templates-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: APPOINTMENT_TEMPLATES_TABLE },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
}
