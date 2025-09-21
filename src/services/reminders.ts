import { supabase } from "./supabase";
import type { Reminder } from "@/types/entities";
import type { CreateReminder, UpdateReminder } from "@/types/validation";
import { createNotification } from "./notifications";
import { getSession } from "./auth";

const REMINDERS_TABLE = "reminders";

// Reminder CRUD operations
export async function listReminders(): Promise<Reminder[]> {
    const { data, error } = await supabase
        .from(REMINDERS_TABLE)
        .select("*")
        .order("reminder_date", { ascending: true });
    if (error) throw error;
    return data as unknown as Reminder[];
}

export async function createReminder(input: CreateReminder): Promise<Reminder> {
    const { data, error } = await supabase
        .from(REMINDERS_TABLE)
        .insert(input)
        .select("*")
        .single();
    if (error) throw error;
    return data as unknown as Reminder;
}

export async function updateReminder(id: string, input: UpdateReminder): Promise<Reminder> {
    const { data, error } = await supabase
        .from(REMINDERS_TABLE)
        .update(input)
        .eq("id", id)
        .select("*")
        .single();
    if (error) throw error;
    return data as unknown as Reminder;
}

export async function deleteReminder(id: string): Promise<void> {
    const { error } = await supabase.from(REMINDERS_TABLE).delete().eq("id", id);
    if (error) throw error;
}

export async function checkReminders() {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) return;

  const now = new Date();
  const { data: reminders, error } = await supabase
    .from(REMINDERS_TABLE)
    .select("*, appointments(title)")
    .eq("user_id", userId)
    .eq("status", "pending")
    .lte("reminder_date", now.toISOString());

  if (error) {
    console.error("Error fetching reminders:", error);
    return;
  }

  for (const reminder of reminders) {
    const appointmentTitle = (reminder as any).appointments?.title ?? 'an appointment';
    await createNotification(`Reminder: ${appointmentTitle}`, userId);
    await updateReminder(reminder.id, { status: "completed" });
  }
}

export function onRemindersChange(callback: (payload: any) => void) {
    return supabase
        .channel("reminders-realtime")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: REMINDERS_TABLE },
            (payload) => {
                callback(payload);
            }
        )
        .subscribe();
}
