import { supabase } from "./supabase";
import type { Appointment } from "@/types/entities";
import type { CreateAppointment, UpdateAppointment } from "@/types/validation";
import { createNotification } from "./notifications";
import { getSession } from "./auth";
import { createReminder, updateReminder, deleteReminder } from "./reminders";

const APPOINTMENTS_TABLE = "appointments";

// Helper to get conflicting appointments
export async function getConflictingAppointments(date: string, time: string, duration: number, excludeId?: string): Promise<Appointment[]> {
  const startTime = new Date(`${date}T${time}`);
  const endTime = new Date(startTime.getTime() + duration * 60000);

  let query = supabase
    .from(APPOINTMENTS_TABLE)
    .select("*")
    .eq("scheduled_date", date)
    .filter("status", "in", '("scheduled", "confirmed")');

  if (excludeId) {
    query = query.not("id", "eq", excludeId);
  }

  const { data: appointments, error } = await query;
  if (error) throw error;

  const conflicting = appointments.filter(apt => {
    const aptStartTime = new Date(`${apt.scheduled_date}T${apt.scheduled_time}`);
    const aptEndTime = new Date(aptStartTime.getTime() + apt.duration * 60000);
    return (startTime < aptEndTime && endTime > aptStartTime);
  });

  return conflicting;
}

// Appointment CRUD operations
export async function listAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from(APPOINTMENTS_TABLE)
    .select("*, clients(name)")
    .order("scheduled_date", { ascending: false });
  if (error) throw error;
  return data as unknown as Appointment[];
}

export async function getAppointment(id: string): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from(APPOINTMENTS_TABLE)
    .select("*, clients(name)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as Appointment;
}

export async function createAppointment(input: CreateAppointment): Promise<Appointment> {
    const { reminder_minutes_before, ...appointmentData } = input;

    const conflicts = await getConflictingAppointments(appointmentData.scheduled_date, appointmentData.scheduled_time, appointmentData.duration);
    if (conflicts.length > 0) {
        throw new Error(`Scheduling conflict detected with ${conflicts.length} other appointment(s).`);
    }

    const { data, error } = await supabase
        .from(APPOINTMENTS_TABLE)
        .insert(appointmentData)
        .select("*, clients(name)")
        .single();
    if (error) throw error;

    const newAppointment = data as Appointment;

    const session = await getSession();
    const userId = session?.user?.id;

    if (userId && newAppointment) {
        const clientName = (newAppointment as any).clients?.name ?? 'a client';
        await createNotification(`New appointment scheduled with ${clientName}`, userId);

        if (reminder_minutes_before) {
            const appointmentDate = new Date(`${newAppointment.scheduled_date}T${newAppointment.scheduled_time}`);
            const reminderDate = new Date(appointmentDate.getTime() - reminder_minutes_before * 60000);
            await createReminder({
                appointment_id: newAppointment.id,
                user_id: userId,
                reminder_date: reminderDate.toISOString(),
                notes: `Appointment: ${newAppointment.title}`,
            });
        }
    }

    return newAppointment;
}

export async function updateAppointment(id: string, input: UpdateAppointment): Promise<Appointment> {
    const { reminder_minutes_before, ...appointmentData } = input;
    
    if (input.scheduled_date && input.scheduled_time && input.duration) {
        const conflicts = await getConflictingAppointments(input.scheduled_date, input.scheduled_time, input.duration, id);
        if (conflicts.length > 0) {
            throw new Error(`Scheduling conflict detected with ${conflicts.length} other appointment(s).`);
        }
    }

    const { data, error } = await supabase
        .from(APPOINTMENTS_TABLE)
        .update(appointmentData)
        .eq("id", id)
        .select("*, clients(name)")
        .single();
    if (error) throw error;

    const updatedAppointment = data as Appointment;

    const session = await getSession();
    const userId = session?.user?.id;

    if (userId && updatedAppointment) {
        const { data: existingReminder } = await supabase
            .from("reminders")
            .select("id")
            .eq("appointment_id", updatedAppointment.id)
            .single();

        if (reminder_minutes_before) {
            const appointmentDate = new Date(`${updatedAppointment.scheduled_date}T${updatedAppointment.scheduled_time}`);
            const reminderDate = new Date(appointmentDate.getTime() - reminder_minutes_before * 60000);

            if (existingReminder) {
                await updateReminder(existingReminder.id, {
                    reminder_date: reminderDate.toISOString(),
                    status: 'pending',
                });
            } else {
                await createReminder({
                    appointment_id: updatedAppointment.id,
                    user_id: userId,
                    reminder_date: reminderDate.toISOString(),
                    notes: `Appointment: ${updatedAppointment.title}`,
                });
            }
        } else if (existingReminder) {
            await deleteReminder(existingReminder.id);
        }
    }

    return updatedAppointment;
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase.from(APPOINTMENTS_TABLE).delete().eq("id", id);
  if (error) throw error;
}

export function onAppointmentsChange(callback: (payload: any) => void) {
  return supabase
    .channel("appointments-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: APPOINTMENTS_TABLE },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
}
