import { supabase } from "./supabase";

export async function insertDocumentRecord(params: {
  client_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  status?: string;
}) {
  const { data, error } = await supabase
    .from("documents")
    .insert({
      client_id: params.client_id,
      file_name: params.file_name,
      file_path: params.file_path,
      file_type: params.file_type,
      file_size: params.file_size ?? null,
      status: params.status ?? "pending",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function createClient(params: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
}) {
  const { data, error } = await supabase
    .from("clients")
    .insert({
      name: params.name,
      email: params.email ?? null,
      phone: params.phone ?? null,
      address: params.address ?? null,
      status: params.status ?? "active",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function listDocumentsByClient(clientId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("id, file_name, file_path, file_type, file_size, status, uploaded_at")
    .eq("client_id", clientId)
    .order("uploaded_at", { ascending: false });
  if (error) throw error;
  return data;
}


