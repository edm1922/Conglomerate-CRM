import { z } from "zod";

// Profile schemas
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().optional(),
  role: z.enum(["agent", "admin"]),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateProfileSchema = ProfileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateProfileSchema = CreateProfileSchema.partial();

// Lead schemas
export const LeadSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  source: z.string().min(1, "Source is required"),
  status: z.enum(["new", "contacted", "site_visit", "reserved", "closed", "converted"]),
  notes: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  score: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateLeadSchema = LeadSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  status: z.enum(["new", "contacted", "site_visit", "reserved", "closed", "converted"]).default("new"),
});

export const UpdateLeadSchema = CreateLeadSchema.partial();

// Client schemas
export const ClientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["active", "reserved", "inactive"]),
  total_investment: z.number().min(0),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateClientSchema = ClientSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  status: z.enum(["active", "reserved", "inactive"]).default("active"),
  total_investment: z.number().min(0).default(0),
});

export const UpdateClientSchema = CreateClientSchema.partial();

// Lot schemas
export const LotSchema = z.object({
  id: z.string().uuid(),
  block_number: z.string().min(1, "Block number is required"),
  lot_number: z.string().min(1, "Lot number is required"),
  size: z.number().positive("Size must be positive"),
  price: z.number().positive("Price must be positive"),
  status: z.enum(["available", "reserved", "sold"]),
  location: z.string().optional(),
  description: z.string().optional(),
  reserved_by: z.string().uuid().optional(),
  sold_to: z.string().uuid().optional(),
  date_reserved: z.string().optional(),
  date_sold: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateLotSchema = LotSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  status: z.enum(["available", "reserved", "sold"]).default("available"),
});

export const UpdateLotSchema = CreateLotSchema.partial();

// Payment schemas
export const PaymentSchema = z.object({
  id: z.string().uuid(),
  receipt_no: z.string().min(1, "Receipt number is required"),
  client_id: z.string().uuid(),
  lot_id: z.string().uuid().optional(),
  amount: z.number().positive("Amount must be positive"),
  payment_method: z.string().min(1, "Payment method is required"),
  payment_type: z.string().min(1, "Payment type is required"),
  reference: z.string().optional(),
  status: z.enum(["pending", "confirmed", "failed"]),
  notes: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreatePaymentSchema = PaymentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  status: z.enum(["pending", "confirmed", "failed"]).default("pending"),
});

export const UpdatePaymentSchema = CreatePaymentSchema.partial();

// Appointment schemas
export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  client_id: z.string().uuid().optional(),
  type: z.string().min(1, "Type is required"),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Time must be in HH:mm:ss format"),
  duration: z.number().positive(),
  location: z.string().optional(),
  status: z.enum(["scheduled", "confirmed", "completed", "cancelled"]),
  notes: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateAppointmentSchema = AppointmentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  duration: z.number().positive().default(60),
  status: z.enum(["scheduled", "confirmed", "completed", "cancelled"]).default("scheduled"),
});

export const UpdateAppointmentSchema = CreateAppointmentSchema.partial();

// Task schemas
export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  status: z.enum(["pending", "in_progress", "completed"]),
  assigned_to: z.string().uuid().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateTaskSchema = TaskSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

// Document schemas
export const DocumentSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  file_name: z.string().min(1, "File name is required"),
  file_path: z.string().min(1, "File path is required"),
  file_type: z.string().min(1, "File type is required"),
  file_size: z.number().positive().optional(),
  status: z.enum(["pending", "verified"]),
  uploaded_at: z.string(),
});

export const CreateDocumentSchema = DocumentSchema.omit({
  id: true,
  uploaded_at: true,
}).extend({
  status: z.enum(["pending", "verified"]).default("pending"),
});

export const UpdateDocumentSchema = CreateDocumentSchema.partial();

// Reminder schemas
export const ReminderSchema = z.object({
  id: z.string().uuid(),
  lead_id: z.string().uuid(),
  user_id: z.string().uuid(),
  reminder_date: z.string(),
  notes: z.string().optional(),
  status: z.enum(["pending", "completed"]),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateReminderSchema = ReminderSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  status: z.enum(["pending", "completed"]).default("pending"),
});

export const UpdateReminderSchema = CreateReminderSchema.partial();

// Export types from schemas
export type Profile = z.infer<typeof ProfileSchema>;
export type CreateProfile = z.infer<typeof CreateProfileSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

export type Lead = z.infer<typeof LeadSchema>;
export type CreateLead = z.infer<typeof CreateLeadSchema>;
export type UpdateLead = z.infer<typeof UpdateLeadSchema>;

export type Client = z.infer<typeof ClientSchema>;
export type CreateClient = z.infer<typeof CreateClientSchema>;
export type UpdateClient = z.infer<typeof UpdateClientSchema>;

export type Lot = z.infer<typeof LotSchema>;
export type CreateLot = z.infer<typeof CreateLotSchema>;
export type UpdateLot = z.infer<typeof UpdateLotSchema>;

export type Payment = z.infer<typeof PaymentSchema>;
export type CreatePayment = z.infer<typeof CreatePaymentSchema>;
export type UpdatePayment = z.infer<typeof UpdatePaymentSchema>;

export type Appointment = z.infer<typeof AppointmentSchema>;
export type CreateAppointment = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointment = z.infer<typeof UpdateAppointmentSchema>;

export type Task = z.infer<typeof TaskSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;

export type Document = z.infer<typeof DocumentSchema>;
export type CreateDocument = z.infer<typeof CreateDocumentSchema>;
export type UpdateDocument = z.infer<typeof UpdateDocumentSchema>;

export type Reminder = z.infer<typeof ReminderSchema>;
export type CreateReminder = z.infer<typeof CreateReminderSchema>;
export type UpdateReminder = z.infer<typeof UpdateReminderSchema>;
