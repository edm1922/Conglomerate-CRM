import { supabase } from "./supabase";
import type { Client, Document } from "@/types/entities";
import type { CreateClient, UpdateClient, CreateDocument, UpdateDocument } from "@/types/validation";

const CLIENTS_TABLE = "clients";
const DOCUMENTS_TABLE = "documents";

// Client CRUD operations
export async function listClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from(CLIENTS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Client[];
}

export async function getClient(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from(CLIENTS_TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Client;
}

export async function createClient(input: CreateClient): Promise<Client> {
  const payload = { 
    status: "active", 
    total_investment: 0,
    ...input 
  };
  const { data, error } = await supabase
    .from(CLIENTS_TABLE)
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as Client;
}

export async function updateClient(id: string, input: UpdateClient): Promise<Client> {
  const { data, error } = await supabase
    .from(CLIENTS_TABLE)
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Client;
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from(CLIENTS_TABLE).delete().eq("id", id);
  if (error) throw error;
}

// Document operations
export async function insertDocumentRecord(input: CreateDocument): Promise<Document> {
  const payload = { status: "pending", ...input };
  const { data, error } = await supabase
    .from(DOCUMENTS_TABLE)
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as Document;
}

export async function listDocumentsByClient(clientId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from(DOCUMENTS_TABLE)
    .select("*")
    .eq("client_id", clientId)
    .order("uploaded_at", { ascending: false });
  if (error) throw error;
  return data as Document[];
}

export async function updateDocument(id: string, input: UpdateDocument): Promise<Document> {
  const { data, error } = await supabase
    .from(DOCUMENTS_TABLE)
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Document;
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from(DOCUMENTS_TABLE).delete().eq("id", id);
  if (error) throw error;
}

export function onClientsChange(callback: (payload: any) => void) {
  return supabase
    .channel('clients-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: CLIENTS_TABLE },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
}

// Legacy function for backward compatibility
export async function createClientLegacy(params: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
}): Promise<string> {
  const client = await createClient(params);
  return client.id;
}
