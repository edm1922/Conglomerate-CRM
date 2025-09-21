import { supabase } from "./supabase";
import type { Task } from "@/types/entities";
import type { CreateTask, UpdateTask } from "@/types/validation";
import { createNotification } from "./notifications";
import { getSession } from "./auth";

const TASKS_TABLE = "tasks";

// Task CRUD operations
export async function listTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .select("*, profiles(full_name)")
    .order("due_date", { ascending: true });
  if (error) throw error;
  return data as unknown as Task[];
}

export async function getTask(id: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .select("*, profiles(full_name)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as Task;
}

export async function createTask(input: CreateTask): Promise<Task> {
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .insert(input)
    .select("*, profiles(full_name)")
    .single();
  if (error) throw error;

  const session = await getSession();
  const userId = session?.user?.id;

  if (userId && data) {
    await createNotification(`New task: ${data.title}`, userId);
  }

  return data as unknown as Task;
}

export async function updateTask(id: string, input: UpdateTask): Promise<Task> {
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .update(input)
    .eq("id", id)
    .select("*, profiles(full_name)")
    .single();
  if (error) throw error;
  return data as unknown as Task;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from(TASKS_TABLE).delete().eq("id", id);
  if (error) throw error;
}

export function onTasksChange(callback: (payload: any) => void) {
  return supabase
    .channel('tasks-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TASKS_TABLE },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
}
