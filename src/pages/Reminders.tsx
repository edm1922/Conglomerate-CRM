
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createReminder,
  deleteReminder,
  listReminders,
  updateReminder,
} from "@/services/reminders";
import { listLeads } from "@/services/leads";
import type { Reminder, Lead } from "@/types/entities";

const reminderSchema = z.object({
  lead_id: z.string().min(1, "Lead is required"),
  reminder_date: z.string().min(1, "Reminder date is required"),
  notes: z.string().optional(),
  status: z.enum(["pending", "completed"]),
});

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const user = useUser();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof reminderSchema>>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      lead_id: "",
      reminder_date: "",
      notes: "",
      status: "pending",
    },
  });

  useEffect(() => {
    fetchReminders();
    fetchLeads();
  }, []);

  const fetchReminders = async () => {
    try {
      const reminders = await listReminders();
      setReminders(reminders);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to fetch reminders: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const fetchLeads = async () => {
    try {
      const leads = await listLeads();
      setLeads(leads);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to fetch leads: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: z.infer<typeof reminderSchema>) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create reminders",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert date to ISO string for database
      const reminderData = {
        ...data,
        user_id: user.id,
        reminder_date: new Date(data.reminder_date + 'T00:00:00Z').toISOString(),
      };

      if (editingReminder) {
        await updateReminder(editingReminder.id, reminderData);
        toast({
          title: "Success",
          description: "Reminder updated successfully",
        });
      } else {
        await createReminder(reminderData);
        toast({
          title: "Success",
          description: "Reminder created successfully",
        });
      }
      fetchReminders();
      reset();
      setEditingReminder(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to save reminder: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setValue("lead_id", reminder.lead_id);
    // Convert ISO date to YYYY-MM-DD format for date input
    setValue("reminder_date", reminder.reminder_date.slice(0, 10));
    setValue("notes", reminder.notes || "");
    setValue("status", reminder.status);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReminder(id);
      toast({
        title: "Success",
        description: "Reminder deleted successfully",
      });
      fetchReminders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete reminder: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Reminders</CardTitle>
            <CardDescription>Manage your reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Reminder Date</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reminders.map((reminder) => {
                  const lead = leads.find(l => l.id === reminder.lead_id);
                  return (
                  <TableRow key={reminder.id}>
                    <TableCell>{lead?.name || 'Unknown Lead'}</TableCell>
                    <TableCell>{reminder.user_id}</TableCell>
                    <TableCell>{new Date(reminder.reminder_date).toLocaleDateString()}</TableCell>
                    <TableCell>{reminder.notes || '-'}</TableCell>
                    <TableCell>{reminder.status}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(reminder)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(reminder.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>{editingReminder ? "Edit Reminder" : "Create Reminder"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="lead_id">Lead</Label>
                <select
                  id="lead_id"
                  {...register("lead_id")}
                  className="w-full p-2 border border-input rounded-md"
                >
                  <option value="">Select a lead...</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} - {lead.email || lead.phone || 'No contact'}
                    </option>
                  ))}
                </select>
                {errors.lead_id && (
                  <p className="text-red-500 text-sm">{errors.lead_id.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="reminder_date">Reminder Date</Label>
                <Input id="reminder_date" type="date" {...register("reminder_date")} />
                {errors.reminder_date && (
                  <p className="text-red-500 text-sm">{errors.reminder_date.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" {...register("notes")} />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select id="status" {...register("status")}>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <CardFooter>
                <Button type="submit">{editingReminder ? "Update" : "Create"}</Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
