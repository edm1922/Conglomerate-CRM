import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  Building,
} from "lucide-react";

interface Appointment {
  id: string;
  title: string;
  client: string;
  type: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  status: string;
  notes: string;
  lot?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  status: string;
  assignedTo: string;
}

export default function Calendar() {
  const [appointments] = useState<Appointment[]>([
    {
      id: "1",
      title: "Site Visit",
      client: "Carlos Miranda",
      type: "Site Visit",
      date: "2024-01-16",
      time: "10:00 AM",
      duration: 120,
      location: "Property Site - Block 2",
      status: "Confirmed",
      notes: "Show Block 2, Lot 5. Client interested in corner lots.",
      lot: "Block 2, Lot 5",
    },
    {
      id: "2",
      title: "Follow-up Call",
      client: "Maria Santos",
      type: "Follow-up",
      date: "2024-01-16",
      time: "2:00 PM",
      duration: 30,
      location: "Office - Phone Call",
      status: "Pending",
      notes: "Discuss financing options and payment terms.",
    },
    {
      id: "3",
      title: "Contract Signing",
      client: "Sofia Reyes",
      type: "Documentation",
      date: "2024-01-16",
      time: "4:00 PM",
      duration: 60,
      location: "Main Office",
      status: "Confirmed",
      notes: "Final contract signing for Block 7, Lot 3.",
      lot: "Block 7, Lot 3",
    },
    {
      id: "4",
      title: "Site Visit",
      client: "Anna Rodriguez",
      type: "Site Visit",
      date: "2024-01-17",
      time: "9:00 AM",
      duration: 90,
      location: "Property Site - Block 1",
      status: "Scheduled",
      notes: "First-time visit. Show available lots in Block 1.",
    },
  ]);

  const [tasks] = useState<Task[]>([
    {
      id: "1",
      title: "Call Maria Santos",
      description: "Follow up on site visit feedback and financing questions",
      priority: "High",
      dueDate: "2024-01-16",
      status: "Pending",
      assignedTo: "John Doe",
    },
    {
      id: "2",
      title: "Prepare Contract Documents",
      description: "Prepare contract documents for Sofia Reyes - Block 7, Lot 3",
      priority: "High",
      dueDate: "2024-01-16",
      status: "In Progress",
      assignedTo: "John Doe",
    },
    {
      id: "3",
      title: "Update Inventory Status",
      description: "Update lot availability after recent sales",
      priority: "Medium",
      dueDate: "2024-01-17",
      status: "Pending",
      assignedTo: "John Doe",
    },
    {
      id: "4",
      title: "Send Weekly Report",
      description: "Compile and send weekly sales report to management",
      priority: "Low",
      dueDate: "2024-01-18",
      status: "Pending",
      assignedTo: "John Doe",
    },
  ]);

  const [selectedDate, setSelectedDate] = useState("2024-01-16");

  const getStatusBadge = (status: string) => {
    const variants = {
      Confirmed: "success",
      Scheduled: "default",
      Pending: "warning",
      Completed: "success",
      Cancelled: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    );
  };

  const getTaskPriorityBadge = (priority: string) => {
    const variants = {
      High: "destructive",
      Medium: "warning",
      Low: "secondary",
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || "secondary"}>
        {priority}
      </Badge>
    );
  };

  const getTaskStatusBadge = (status: string) => {
    const variants = {
      Pending: "warning",
      "In Progress": "default",
      Completed: "success",
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

  const todayAppointments = appointments.filter(apt => apt.date === selectedDate);
  const todayTasks = tasks.filter(task => task.dueDate === selectedDate);
  const upcomingAppointments = appointments.filter(apt => apt.date > selectedDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks & Calendar</h1>
          <p className="text-muted-foreground">
            Manage appointments, site visits, and daily tasks
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="taskTitle">Task Title</Label>
                  <Input id="taskTitle" placeholder="Enter task title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskDesc">Description</Label>
                  <Textarea id="taskDesc" placeholder="Task description..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskPriority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskDue">Due Date</Label>
                  <Input id="taskDue" type="date" />
                </div>
                <Button className="w-full">Add Task</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aptClient">Client</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maria">Maria Santos</SelectItem>
                      <SelectItem value="carlos">Carlos Miranda</SelectItem>
                      <SelectItem value="anna">Anna Rodriguez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aptType">Appointment Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="site-visit">Site Visit</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aptDate">Date</Label>
                    <Input id="aptDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aptTime">Time</Label>
                    <Input id="aptTime" type="time" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aptLocation">Location</Label>
                  <Input id="aptLocation" placeholder="Meeting location" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aptNotes">Notes</Label>
                  <Textarea id="aptNotes" placeholder="Additional notes..." />
                </div>
                <Button className="w-full">Schedule Appointment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Date Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <span className="text-sm text-muted-foreground">
              Showing schedule for selected date
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Appointments ({todayAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No appointments scheduled for this date
                </p>
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
                        <span>{appointment.client}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{appointment.time} ({appointment.duration}min)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{appointment.location}</span>
                      </div>
                      {appointment.lot && (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span>{appointment.lot}</span>
                        </div>
                      )}
                    </div>
                    
                    {appointment.notes && (
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {appointment.notes}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Reschedule
                      </Button>
                      <Button size="sm" className="flex-1">
                        Mark Complete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Tasks ({todayTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No tasks due for this date
                </p>
              ) : (
                todayTasks.map((task) => (
                  <div key={task.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="flex gap-2">
                        {getTaskPriorityBadge(task.priority)}
                        {getTaskStatusBadge(task.status)}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Assigned to: {task.assignedTo}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button size="sm" className="flex-1">
                        Mark Complete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingAppointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No upcoming appointments
              </p>
            ) : (
              upcomingAppointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(appointment.type)}
                    <div>
                      <h4 className="font-medium">{appointment.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {appointment.client} • {appointment.date} at {appointment.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(appointment.status)}
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
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