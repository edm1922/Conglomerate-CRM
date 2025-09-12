import { supabase } from "./supabase";
import type { Task } from "@/types/entities";
import type { CreateTask, UpdateTask } from "@/types/validation";

const TABLE = "tasks";

export async function listTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      profiles!assigned_to (full_name, email)
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Task[];
}

export async function getTask(id: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      profiles!assigned_to (full_name, email)
    `)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Task;
}

export async function createTask(input: CreateTask): Promise<Task> {
  const payload = { 
    status: "pending", 
    priority: "medium",
    ...input 
  };
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as Task;
}

export async function updateTask(id: string, input: UpdateTask): Promise<Task> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

export async function getTasksByUser(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("assigned_to", userId)
    .order("due_date", { ascending: true })
    .order("priority", { ascending: false });
  if (error) throw error;
  return data as Task[];
}

export async function getPendingTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      profiles!assigned_to (full_name, email)
    `)
    .in("status", ["pending", "in_progress"])
    .order("due_date", { ascending: true })
    .order("priority", { ascending: false });
  if (error) throw error;
  return data as Task[];
}

export async function getOverdueTasks(): Promise<Task[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      profiles!assigned_to (full_name, email)
    `)
    .lt("due_date", today)
    .in("status", ["pending", "in_progress"])
    .order("due_date", { ascending: true });
  if (error) throw error;
  return data as Task[];
}

export async function startTask(id: string): Promise<Task> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: "in_progress" })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Task;
}

export async function completeTask(id: string): Promise<Task> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: "completed" })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Task;
}

export function onTasksChange(callback: (payload: Task) => void) {
  return supabase
    .channel("tasks-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: TABLE },
      (payload) => {
        callback(payload.new as Task);
      }
    )
    .subscribe();
}
