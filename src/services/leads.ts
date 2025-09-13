import { supabase } from "./supabase";
import type { Lead } from "@/types/entities";

export interface CreateLeadInput {
  name: string;
  email?: string;
  phone?: string;
  source: string;
  status?: Lead["status"];
  notes?: string;
  assigned_to?: string;
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {}

const TABLE = "leads";

export async function listLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Lead[];
}

export async function getLead(id: string): Promise<Lead | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Lead;
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const payload = { status: "new", ...input };
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as Lead;
}

export async function updateLead(id: string, input: UpdateLeadInput): Promise<Lead> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Lead;
}

export async function deleteLead(id: string): Promise<{ id: string }> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
  return { id };
}

export async function convertLeadToClient(leadId: string): Promise<{ clientId: string; updatedLead: Lead }> {
  // Get the lead data
  const lead = await getLead(leadId);
  if (!lead) {
    throw new Error("Lead not found");
  }

  // Create client from lead data
  const { createClient } = await import("./clients");
  const client = await createClient({
    name: lead.name,
    email: lead.email || undefined,
    phone: lead.phone || undefined,
    status: "active",
  });

  // Update lead status to converted
  const updatedLead = await updateLead(leadId, {
    status: "converted",
    notes: lead.notes ? `${lead.notes}\n\nConverted to client on ${new Date().toISOString()}` : `Converted to client on ${new Date().toISOString()}`
  });

  return {
    clientId: client.id,
    updatedLead
  };
}

export function onLeadsChange(callback: (payload: any) => void) {
  return supabase
    .channel('leads-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
}
