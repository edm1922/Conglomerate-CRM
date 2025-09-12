import { supabase } from './supabase';
import type { Reminder } from '@/types/entities';

export const listReminders = async (): Promise<Reminder[]> => {
  const { data, error } = await supabase.from('reminders').select('*');
  if (error) throw new Error(error.message);
  return data;
};

export const createReminder = async (reminder: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>): Promise<Reminder> => {
  const { data, error } = await supabase.from('reminders').insert(reminder).single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateReminder = async (id: string, updates: Partial<Reminder>): Promise<Reminder> => {
  const { data, error } = await supabase.from('reminders').update(updates).eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteReminder = async (id: string): Promise<void> => {
  const { error } = await supabase.from('reminders').delete().eq('id', id);
  if (error) throw new Error(error.message);
};
