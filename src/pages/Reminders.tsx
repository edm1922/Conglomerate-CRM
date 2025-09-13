
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import type { Reminder } from "@/types/entities";

const reminderSchema = z.object({
  lead_id: z.string().min(1, "Lead ID is required"),
  user_id: z.string().min(1, "User ID is required"),
  reminder_date: z.string().min(1, "Reminder date is required"),
  notes: z.string().optional(),
  status: z.enum(["pending", "completed"]),
});

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

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
      user_id: "",
      reminder_date: "",
      notes: "",
      status: "pending",
    },
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    const reminders = await listReminders();
    setReminders(reminders);
  };

  const onSubmit = async (data: z.infer<typeof reminderSchema>) => {
    if (editingReminder) {
      await updateReminder(editingReminder.id, data);
    } else {
      await createReminder(data);
    }
    fetchReminders();
    reset();
    setEditingReminder(null);
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setValue("lead_id", reminder.lead_id);
    setValue("user_id", reminder.user_id);
    setValue("reminder_date", reminder.reminder_date);
    setValue("notes", reminder.notes);
    setValue("status", reminder.status);
  };

  const handleDelete = async (id: string) => {
    await deleteReminder(id);
    fetchReminders();
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
                  <TableHead>Lead ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Reminder Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reminders.map((reminder) => (
                  <TableRow key={reminder.id}>
                    <TableCell>{reminder.lead_id}</TableCell>
                    <TableCell>{reminder.user_id}</TableCell>
                    <TableCell>{reminder.reminder_date}</TableCell>
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
                ))}
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
                <Label htmlFor="lead_id">Lead ID</Label>
                <Input id="lead_id" {...register("lead_id")} />
                {errors.lead_id && (
                  <p className="text-red-500 text-sm">{errors.lead_id.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="user_id">User ID</Label>
                <Input id="user_id" {...register("user_id")} />
                {errors.user_id && (
                  <p className="text-red-500 text-sm">{errors.user_id.message}</p>
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
