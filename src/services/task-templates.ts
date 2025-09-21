import { supabase } from './supabase';
import { TaskTemplate } from '@/types/entities';

const TABLE = 'task_templates';

export async function listTaskTemplates(): Promise<TaskTemplate[]> {
  const { data, error } = await supabase.from(TABLE).select('*');
  if (error) throw error;
  return data as TaskTemplate[];
}

export async function createTaskTemplate(template: Omit<TaskTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<TaskTemplate> {
  const { data, error } = await supabase.from(TABLE).insert(template).select('*').single();
  if (error) throw error;
  return data as TaskTemplate;
}

export async function updateTaskTemplate(id: string, template: Partial<TaskTemplate>): Promise<TaskTemplate> {
  const { data, error } = await supabase.from(TABLE).update(template).eq('id', id).select('*').single();
  if (error) throw error;
  return data as TaskTemplate;
}

export async function deleteTaskTemplate(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
