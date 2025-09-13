
import { supabase } from "./supabase";
import type { Communication } from "@/types/entities";
import type { CreateCommunication } from "@/types/validation";

export const listCommunications = async (clientId: string): Promise<Communication[]> => {
  const { data, error } = await supabase
    .from("communications")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

export const createCommunication = async (communication: CreateCommunication): Promise<Communication> => {
  const { data, error } = await supabase
    .from("communications")
    .insert(communication)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};
