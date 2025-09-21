export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: "agent" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source: string;
  status: "new" | "contacted" | "site_visit" | "reserved" | "closed" | "converted";
  notes?: string;
  assigned_to?: string; // profiles.id
  score?: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: "active" | "reserved" | "inactive";
  total_investment: number;
  created_at: string;
  updated_at: string;
}

export interface Communication {
  id: string;
  client_id: string;
  type: "email" | "phone" | "meeting";
  notes?: string;
  created_at: string;
}

export interface Lot {
  id: string;
  block_number: string;
  lot_number: string;
  size: number;
  price: number;
  status: "available" | "reserved" | "sold";
  location?: string;
  description?: string;
  reserved_by?: string; // clients.id
  sold_to?: string; // clients.id
  date_reserved?: string;
  date_sold?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  receipt_no: string;
  client_id: string;
  lot_id?: string;
  amount: number;
  payment_method: string;
  payment_type: string;
  reference?: string;
  status: "pending" | "confirmed" | "failed";
  notes?: string;
  created_at: string;
  updated_at: string;
  parent_payment_id?: string;
  installment_number?: number;
  total_installments?: number;
  reconciled?: boolean;
  commission?: number;
}

export interface Appointment {
  id: string;
  title: string;
  client_id?: string;
  type: string;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:mm:ss
  duration: number;
  location?: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  due_date?: string; // YYYY-MM-DD
  status: "pending" | "in_progress" | "completed";
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  profiles?: { full_name?: string }; // Nested profile information
}

export interface Document {
  id: string;
  client_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  status: "pending" | "verified";
  uploaded_at: string;
}

export interface Reminder {
  id: string;
  lead_id?: string;
  user_id?: string;
  payment_id?: string;
  appointment_id?: string;
  reminder_date: string;
  notes?: string;
  status: "pending" | "completed";
  created_at: string;
  updated_at: string;
}

export interface Commission {
    id: string;
    payment_id: string;
    agent_id: string;
    amount: number;
    created_at: string;
}

export interface TaskTemplate {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}

export interface TaskWorkflow {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskWorkflowStep {
  id: string;
  workflow_id: string;
  template_id: string;
  step_order: number;
  delay_after_step?: string; // Interval format (e.g., '1 day', '3 hours')
  created_at: string;
  updated_at: string;
}
