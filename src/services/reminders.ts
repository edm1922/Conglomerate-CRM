import { supabase } from './supabase';
import type { Reminder } from '@/types/entities';

export const listReminders = async (): Promise<Reminder[]> => {
  const { data, error } = await supabase.from('reminders').select('*');
  if (error) throw new Error(error.message);
  return data;
};

export const createReminder = async (reminder: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>): Promise<Reminder> => {
  const reminderData = { ...reminder };

  // If user_id is not a valid UUID (i.e., it's empty or not provided correctly from the form),
  // then get the current authenticated user's ID.
  // The workflow passes a valid UUID, so it will skip this block.
  // The form passes an empty string, so it will enter this block.
  if (!reminderData.user_id) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error(userError?.message || 'User not found. A user must be logged in to create a reminder without specifying a user_id.');
    }
    reminderData.user_id = user.id;
  }

  const { data, error } = await supabase.from('reminders').insert(reminderData).select().single();
  
  if (error) {
    console.error('Failed to create reminder. Data:', reminderData);
    throw new Error(error.message);
  }
  
  return data;
};

export const updateReminder = async (id: string, updates: Partial<Reminder>): Promise<Reminder> => {
  const { data, error } = await supabase.from('reminders').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteReminder = async (id: string): Promise<void> => {
  const { error } = await supabase.from('reminders').delete().eq('id', id);
  if (error) throw new Error(error.message);
};
