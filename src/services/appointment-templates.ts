import { supabase } from './supabase';
import { AppointmentTemplate } from '@/types/appointment-templates';

const TABLE = 'appointment_templates';

export async function listAppointmentTemplates(): Promise<AppointmentTemplate[]> {
  const { data, error } = await supabase.from(TABLE).select('*');
  if (error) throw error;
  return data as AppointmentTemplate[];
}

export async function createAppointmentTemplate(template: Omit<AppointmentTemplate, 'id'>): Promise<AppointmentTemplate> {
  const { data, error } = await supabase.from(TABLE).insert(template).select('*').single();
  if (error) throw error;
  return data as AppointmentTemplate;
}

export async function updateAppointmentTemplate(id: string, template: Partial<AppointmentTemplate>): Promise<AppointmentTemplate> {
  const { data, error } = await supabase.from(TABLE).update(template).eq('id', id).select('*').single();
  if (error) throw error;
  return data as AppointmentTemplate;
}

export async function deleteAppointmentTemplate(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
