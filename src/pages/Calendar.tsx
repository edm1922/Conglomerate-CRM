import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listAppointments, createAppointment, updateAppointment, deleteAppointment, getConflictingAppointments } from "@/services/appointments";
import { listTasks, createTask, updateTask, deleteTask } from "@/services/tasks";
import { listClients } from "@/services/clients";
import { createReminder } from "@/services/reminders";
import { listAppointmentTemplates } from "@/services/appointmentTemplates";
import { CreateAppointmentSchema, type CreateAppointment, type UpdateAppointment, type AppointmentTemplate } from "@/types/validation";
import { CreateTaskSchema, type CreateTask, type UpdateTask } from "@/types/validation";
import { CreateReminderSchema, type CreateReminder } from "@/types/validation";
import { Appointment as AppointmentEntity, Task as TaskEntity, Client as ClientEntity, Profile as ProfileEntity } from "@/types/entities";
import GanttChart from "@/components/GanttChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  Building,
  Trash2,
  Edit,
  Bell,
} from "lucide-react";

export default function Calendar() {
  const queryClient = useQueryClient();

  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentEntity | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [conflictingAppointments, setConflictingAppointments] = useState<AppointmentEntity[]>([]);

  const { data: appointmentsData = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: listAppointments,
  });

  const { data: tasksData = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: listTasks,
  });

  const { data: clientsData = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: listClients,
  });

  const { data: appointmentTemplatesData = [] } = useQuery({
    queryKey: ["appointmentTemplates"],
    queryFn: listAppointmentTemplates,
  });

  const { register: registerAppointment, handleSubmit: handleAppointmentSubmit, reset: resetAppointment, setValue: setAppointmentValue, watch, formState: { errors: appointmentErrors } } = useForm<CreateAppointment>({
    resolver: zodResolver(CreateAppointmentSchema),
  });

  const appointmentValues = watch();

  useEffect(() => {
    const checkConflicts = async () => {
      if (appointmentValues.scheduled_date && appointmentValues.scheduled_time && appointmentValues.duration) {
        const conflicts = await getConflictingAppointments(appointmentValues.scheduled_date, appointmentValues.scheduled_time, appointmentValues.duration);
        setConflictingAppointments(conflicts);
      }
    };
    checkConflicts();
  }, [appointmentValues.scheduled_date, appointmentValues.scheduled_time, appointmentValues.duration]);


  const { register: registerTask, handleSubmit: handleTaskSubmit, reset: resetTask, setValue: setTaskValue, formState: { errors: taskErrors } } = useForm<CreateTask>({
    resolver: zodResolver(CreateTaskSchema),
  });

  const { register: registerReminder, handleSubmit: handleReminderSubmit, reset: resetReminder, formState: { errors: reminderErrors } } = useForm<CreateReminder>({
    resolver: zodResolver(CreateReminderSchema),
  });

  const createAppointmentMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      resetAppointment();
      setAppointmentDialogOpen(false);
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (data) => {
      console.log('Task created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      resetTask();
      setTaskDialogOpen(false);
    },
    onError: (error) => {
      console.error('Task creation failed:', error);
    },
  });

  const createReminderMutation = useMutation({
    mutationFn: createReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      resetReminder();
      setReminderDialogOpen(false);
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleCreateAppointmentSubmit = (values: CreateAppointment) => {
    createAppointmentMutation.mutate(values);
  };

  const handleCreateTaskSubmit = (values: CreateTask) => {
    console.log('Submitting task:', values);
    createTaskMutation.mutate(values);
  };

  const handleCreateReminderSubmit = (values: CreateReminder) => {
    if (selectedAppointment) {
      createReminderMutation.mutate({ ...values, appointment_id: selectedAppointment.id });
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = appointmentTemplatesData.find((t: AppointmentTemplate) => t.id === templateId);
    if (template) {
      setAppointmentValue("title", template.title);
      setAppointmentValue("type", template.type);
      setAppointmentValue("duration", template.duration);
      setAppointmentValue("location", template.location);
      setAppointmentValue("notes", template.notes);
    }
  };

  const todayAppointments = useMemo(() => {
    return (appointmentsData || []).filter(apt => apt.scheduled_date === selectedDate);
  }, [appointmentsData, selectedDate]);

  const todayTasks = useMemo(() => {
    console.log('All tasks data:', tasksData);
    console.log('Selected date:', selectedDate);
    const filtered = (tasksData || []).filter(task => {
      console.log('Task due_date:', task.due_date, 'Selected date:', selectedDate, 'Match:', task.due_date === selectedDate);
      return task.due_date === selectedDate;
    });
    console.log('Filtered tasks:', filtered);
    return filtered;
  }, [tasksData, selectedDate]);

  const upcomingAppointments = useMemo(() => {
    return (appointmentsData || []).filter(apt => apt.scheduled_date > selectedDate);
  }, [appointmentsData, selectedDate]);


  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: "default",
      confirmed: "success",
      completed: "success",
      cancelled: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    );
  };

  const getTaskPriorityBadge = (priority: string) => {
    const variants = {
      high: "destructive",
      medium: "warning",
      low: "secondary",
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || "secondary"}>
        {priority}
      </Badge>
    );
  };

  const getTaskStatusBadge = (status: string) => {
    const variants = {
      pending: "warning",
      in_progress: "default",
      completed: "success",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      "Site Visit": Building,
      "Follow-up": Clock,
      "Documentation": CheckCircle,
    } as const;

    const Icon = icons[type as keyof typeof icons] || CalendarIcon;
    return <Icon className="w-4 h-4" />;
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks & Calendar</h1>
          <p className="text-muted-foreground">Manage appointments, site visits, and daily tasks</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2"><Plus className="w-4 h-4" />Add Task</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>Create a new task with title, description, priority, and due date.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleTaskSubmit(handleCreateTaskSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="taskTitle">Task Title</Label>
                  <Input id="taskTitle" {...registerTask("title")} />
                  {taskErrors.title && <p className="text-sm text-red-500">{taskErrors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskDesc">Description</Label>
                  <Textarea id="taskDesc" {...registerTask("description")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskPriority">Priority</Label>
                  <Select onValueChange={(value) => setTaskValue("priority", value as "low" | "medium" | "high")}>
                    <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  {taskErrors.priority && <p className="text-sm text-red-500">{taskErrors.priority.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskDue">Due Date</Label>
                  <Input id="taskDue" type="date" {...registerTask("due_date")} />
                  {taskErrors.due_date && <p className="text-sm text-red-500">{taskErrors.due_date.message}</p>}
                </div>
                <Button className="w-full" type="submit" disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? "Adding..." : "Add Task"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" />Schedule Appointment</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Schedule New Appointment</DialogTitle></DialogHeader>
              <form onSubmit={handleAppointmentSubmit(handleCreateAppointmentSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aptTemplate">Template</Label>
                  <Select onValueChange={handleTemplateSelect}>
                    <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
                    <SelectContent>
                      {(appointmentTemplatesData || []).map((template: AppointmentTemplate) => <SelectItem key={template.id} value={template.id}>{template.template_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aptClient">Client</Label>
                  <Select onValueChange={(value) => setAppointmentValue("client_id", value)}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      {(clientsData || []).map(client => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {appointmentErrors.client_id && <p className="text-sm text-red-500">{appointmentErrors.client_id.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aptType">Appointment Type</Label>
                  <Select onValueChange={(value) => setAppointmentValue("type", value)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Site Visit">Site Visit</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Documentation">Documentation</SelectItem>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                  {appointmentErrors.type && <p className="text-sm text-red-500">{appointmentErrors.type.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aptDate">Date</Label>
                    <Input id="aptDate" type="date" {...registerAppointment("scheduled_date")} />
                    {appointmentErrors.scheduled_date && <p className="text-sm text-red-500">{appointmentErrors.scheduled_date.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aptTime">Time</Label>
                    <Input id="aptTime" type="time" {...registerAppointment("scheduled_time")} />
                    {appointmentErrors.scheduled_time && <p className="text-sm text-red-500">{appointmentErrors.scheduled_time.message}</p>}
                  </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="aptDuration">Duration (minutes)</Label>
                    <Input id="aptDuration" type="number" {...registerAppointment("duration")} />
                    {appointmentErrors.duration && <p className="text-sm text-red-500">{appointmentErrors.duration.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aptLocation">Location</Label>
                  <Input id="aptLocation" {...registerAppointment("location")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aptNotes">Notes</Label>
                  <Textarea id="aptNotes" {...registerAppointment("notes")} />
                </div>
                {conflictingAppointments.length > 0 && (
                    <div className="text-sm text-yellow-500">
                        Warning: This appointment conflicts with {conflictingAppointments.length} other appointment(s).
                    </div>
                )}
                <Button className="w-full" type="submit" disabled={createAppointmentMutation.isPending || conflictingAppointments.length > 0}>
                  {createAppointmentMutation.isPending ? "Scheduling..." : "Schedule Appointment"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Set Reminder</DialogTitle></DialogHeader>
              <form onSubmit={handleReminderSubmit(handleCreateReminderSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reminderDate">Reminder Date</Label>
                  <Input id="reminderDate" type="date" {...registerReminder("reminder_date")} />
                  {reminderErrors.reminder_date && <p className="text-sm text-red-500">{reminderErrors.reminder_date.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminderNotes">Notes</Label>
                  <Textarea id="reminderNotes" {...registerReminder("notes")} />
                </div>
                <Button className="w-full" type="submit" disabled={createReminderMutation.isPending}>
                  {createReminderMutation.isPending ? "Setting Reminder..." : "Set Reminder"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tasks and Appointments Gantt Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <GanttChart />
        </CardContent>
      </Card>

      <Card><CardContent className="p-4"><div className="flex items-center gap-4"><CalendarIcon className="w-5 h-5 text-primary" /><Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-auto" /><span className="text-sm text-muted-foreground">Showing schedule for selected date</span></div></CardContent></Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarIcon className="w-5 h-5" />Appointments ({todayAppointments.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No appointments scheduled</p>
              ) : (
                todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{appointment.title}</h4>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{appointment.client_id || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{appointment.scheduled_time} ({appointment.duration}min)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{appointment.location}</span>
                      </div>
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">{appointment.notes}</p>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-2"/>Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => { 
                        setSelectedAppointment(appointment); 
                        setReminderDialogOpen(true);
                      }}>
                        <Bell className="w-4 h-4 mr-2"/>Set Reminder
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1" onClick={() => { 
                        if (confirm("Are you sure?")) deleteAppointmentMutation.mutate(appointment.id); 
                      }}>
                        <Trash2 className="w-4 h-4 mr-2"/>Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>

        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5" />Tasks ({todayTasks.length}) - All Tasks: {(tasksData || []).length}</CardTitle></CardHeader>
          <CardContent><div className="space-y-4">{todayTasks.length === 0 ? <p className="text-muted-foreground text-center py-4">No tasks due</p> : todayTasks.map((task) => (<div key={task.id} className="border border-border rounded-lg p-4 space-y-3"><div className="flex items-center justify-between"><h4 className="font-medium">{task.title}</h4><div className="flex gap-2">{getTaskPriorityBadge(task.priority)}{getTaskStatusBadge(task.status)}</div></div><p className="text-sm text-muted-foreground">{task.description}</p><div className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-muted-foreground" /><span>Assigned to: {(task.profiles as ProfileEntity)?.full_name || "-"}</span></div><div className="flex gap-2"><Button variant="outline" size="sm" className="flex-1"><Edit className="w-4 h-4 mr-2"/>Edit</Button><Button variant="destructive" size="sm" className="flex-1" onClick={() => { if (confirm("Are you sure?")) deleteTaskMutation.mutate(task.id); }}><Trash2 className="w-4 h-4 mr-2"/>Delete</Button></div></div>))}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Upcoming Appointments</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingAppointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No upcoming appointments</p>
            ) : (
              upcomingAppointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(appointment.type)}
                    <div>
                      <h4 className="font-medium">{appointment.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {appointment.client_id || "-"} • {appointment.scheduled_date} at {appointment.scheduled_time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(appointment.status)}
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>

      </Card>
    </div>
  );
}
