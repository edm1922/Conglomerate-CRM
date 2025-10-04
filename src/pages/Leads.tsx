
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listLeads, createLead, updateLead, deleteLead, onLeadsChange, convertLeadToClient, type CreateLeadInput, type UpdateLeadInput } from "@/services/leads";
import { listReminders, createReminder, updateReminder, deleteReminder } from "@/services/reminders";
import { useAppStore } from "@/stores";
import { CreateLeadSchema, UpdateLeadSchema, type CreateLead, type UpdateLead, CreateReminderSchema, type CreateReminder } from "@/types/validation";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  MoreHorizontal,
  Eye,
  UserCheck,
  TrendingUp,
  Trash2,
  Edit,
  Bell,
  Zap,
} from "lucide-react";
import { calculateLeadScore } from "@/lib/utils";
import type { Lead as LeadEntity, Reminder as ReminderEntity } from "@/types/entities";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@supabase/auth-helpers-react";

type Lead = LeadEntity;

function EditLeadDialog({ lead, open, onOpenChange, onUpdate }: { lead: Lead; open: boolean; onOpenChange: (open: boolean) => void; onUpdate: (data: UpdateLead) => void; }) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UpdateLead>({
    resolver: zodResolver(UpdateLeadSchema),
    defaultValues: {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      notes: lead.notes,
      score: lead.score,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        status: lead.status,
        notes: lead.notes,
        score: lead.score,
      });
    }
  }, [open, lead, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={handleSubmit(onUpdate)}
        >
          <div className="space-y-2">
            <Label htmlFor="name-edit">Full Name</Label>
            <Input id="name-edit" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-edit">Email</Label>
            <Input id="email-edit" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone-edit">Phone Number</Label>
            <Input id="phone-edit" {...register("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source-edit">Source</Label>
            <Select defaultValue={lead.source} onValueChange={(v) => setValue("source", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="Google">Google</SelectItem>
                <SelectItem value="Walk-in">Walk-in</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
              </SelectContent>
            </Select>
            {errors.source && <p className="text-sm text-red-500">{errors.source.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="score-edit">Lead Score</Label>
            <Input id="score-edit" type="number" {...register("score", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes-edit">Notes</Label>
            <Textarea id="notes-edit" {...register("notes")} />
          </div>
          <Button className="w-full" type="submit">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReminderDialog({ lead, open, onOpenChange, onCreate }: { lead: Lead; open: boolean; onOpenChange: (open: boolean) => void; onCreate: (data: CreateReminder) => void; }) {
  const user = useUser();
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateReminder>({
    resolver: zodResolver(CreateReminderSchema),
  });

  useEffect(() => {
    if (open && user?.id) {
      reset({ 
        lead_id: lead.id, 
        user_id: user.id,
        reminder_date: '',
        notes: '',
        status: 'pending'
      });
    }
  }, [open, lead, user, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Reminder for {lead.name}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={handleSubmit((data) => {
            if (!user?.id) {
              toast({
                title: "Authentication Error",
                description: "You must be logged in to set reminders.",
                variant: "destructive",
              });
              return;
            }
            // Convert date to ISO format
            const reminderData = {
              ...data,
              user_id: user.id,
              reminder_date: new Date(data.reminder_date + 'T00:00:00Z').toISOString(),
            };
            onCreate(reminderData);
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="reminder_date">Reminder Date</Label>
            <Input id="reminder_date" type="date" {...register("reminder_date")} />
            {errors.reminder_date && <p className="text-sm text-red-500">{errors.reminder_date.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} />
          </div>
          <Button className="w-full" type="submit">
            Set Reminder
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CommunicationHistory({ lead }: { lead: Lead }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication History</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">No communication history yet.</p>
      </CardContent>
    </Card>
  );
}

export default function Leads() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const {
    filters,
    setLeadFilter,
  } = useAppStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [remindingLead, setRemindingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { data: leadsData = [], isLoading: leadsLoading, isError: leadsIsError, error: leadsError } = useQuery({
    queryKey: ["leads"],
    queryFn: listLeads,
  });

  const { data: remindersData = [], isLoading: remindersLoading } = useQuery({
    queryKey: ["reminders"],
    queryFn: listReminders,
  });

  useEffect(() => {
    const channel = onLeadsChange(() => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    });
    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateLead>({
    resolver: zodResolver(CreateLeadSchema),
    defaultValues: {
      status: 'new',
      score: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (newLead: CreateLead) => {
        const score = calculateLeadScore(newLead);
        return createLead({
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          source: newLead.source,
          status: newLead.status,
          notes: newLead.notes,
          assigned_to: newLead.assigned_to,
          score: score
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      reset();
      setDialogOpen(false);
      toast({ title: "Success", description: "Lead created successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLead }) => {
        const score = calculateLeadScore(data);
        return updateLead(id, {
          name: data.name,
          email: data.email,
          phone: data.phone,
          source: data.source,
          status: data.status,
          notes: data.notes,
          assigned_to: data.assigned_to,
          score: score
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setEditDialogOpen(false);
      setEditingLead(null);
      toast({ title: "Success", description: "Lead updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        toast({ title: "Success", description: "Lead deleted successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const convertMutation = useMutation({
    mutationFn: convertLeadToClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Success", description: "Lead converted to client successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: `Failed to convert lead: ${error.message}`, variant: "destructive" });
    },
  });

  const createReminderMutation = useMutation({
    mutationFn: createReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      setReminderDialogOpen(false);
      toast({ title: "Success", description: "Reminder set successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteReminderMutation = useMutation({
    mutationFn: deleteReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({ title: "Success", description: "Reminder marked as done!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: `Failed to complete reminder: ${error.message}`, variant: "destructive" });
    }
  });
  
  // Remove the automatedFollowUpMutation entirely

  const handleCreateSubmit = (values: CreateLead) => {
    createMutation.mutate(values);
  };

  const handleUpdateSubmit = (values: UpdateLead) => {
    if (editingLead) {
        updateMutation.mutate({ id: editingLead.id, data: values });
    }
  };

  const handleCreateReminderSubmit = (values: CreateReminder) => {
    createReminderMutation.mutate(values);
  };

  const sendEmail = (lead: Lead) => {
    toast({ title: "Info", description: `Sending email to ${lead.name} at ${lead.email}` });
  };

  const sendSMS = (lead: Lead) => {
    toast({ title: "Info", description: `Sending SMS to ${lead.name} at ${lead.phone}` });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      New: "default",
      Contacted: "secondary",
      "Site Visit": "outline",
      Reserved: "warning",
      Closed: "success",
      Converted: "success",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status}
      </Badge>
    );
  };

  const filteredLeads = useMemo(() => {
    const { status, source, search } = filters.leads;
    return (leadsData || []).filter((lead) => {
      const matchesStatus = (status === "all") || ((lead.status || "").toLowerCase() === (status || "").toLowerCase());
      const matchesSource = (source === "all") || ((lead.source || "").toLowerCase() === (source || "").toLowerCase());
      const matchesSearch = (lead.name || "").toLowerCase().includes((search || "").toLowerCase()) ||
                           (lead.email || "").toLowerCase().includes((search || "").toLowerCase()) ||
                           (lead.phone || "").includes(search || "");
      return matchesStatus && matchesSearch && matchesSource;
    });
  }, [leadsData, filters.leads]);

  if (leadsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading leads...</p>
      </div>
    );
  }

  if (leadsIsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load leads: {leadsError.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leads & Inquiries</h1>
            <p className="text-muted-foreground">
              Manage and track potential clients
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add New Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Lead</DialogTitle>
                </DialogHeader>
                <form
                  className="space-y-4"
                  onSubmit={handleSubmit(handleCreateSubmit)}
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" {...register("name")} />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register("email")} />
                     {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" {...register("phone")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Select onValueChange={(v) => setValue("source", v)}>
                      <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="Google">Google</SelectItem>
                        <SelectItem value="Walk-in">Walk-in</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                      </SelectContent>
                    </Select>
                     {errors.source && <p className="text-sm text-red-500">{errors.source.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="score">Lead Score</Label>
                    <Input id="score" type="number" {...register("score", { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" {...register("notes")} />
                  </div>
                  <Button className="w-full" type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Adding..." : "Add Lead"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search leads by name, email, or phone..."
                    value={filters.leads.search}
                    onChange={(e) => setLeadFilter('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filters.leads.status} onValueChange={(value) => setLeadFilter('status', value)}>
                  <SelectTrigger className="w-[180px]"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Filter by status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Site Visit">Site Visit</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.leads.source} onValueChange={(value) => setLeadFilter('source', value)}>
                  <SelectTrigger className="w-[180px]"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Filter by source" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id} onClick={() => setSelectedLead(lead)}>
                    <TableCell>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">{lead.notes}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm"><Button variant="ghost" size="sm" onClick={() => sendEmail(lead)}><Mail className="w-3 h-3" /></Button>{lead.email}</div>
                        <div className="flex items-center gap-2 text-sm"><Button variant="ghost" size="sm" onClick={() => sendSMS(lead)}><Phone className="w-3 h-3" /></Button>{lead.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell><Badge>{lead.source}</Badge></TableCell>
                    <TableCell>{getStatusBadge((lead.status || "").charAt(0).toUpperCase() + (lead.status || "").slice(1))}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="font-bold">{lead.score || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {lead.status !== "converted" && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => convertMutation.mutate(lead.id)}
                            disabled={convertMutation.isPending}
                            title="Convert to Client"
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                             <DropdownMenuItem onSelect={() => {
                              setEditingLead(lead);
                              setEditDialogOpen(true);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                             <DropdownMenuItem onSelect={() => {
                              setRemindingLead(lead);
                              setReminderDialogOpen(true);
                            }}>
                              <Bell className="mr-2 h-4 w-4" />
                              <span>Set Reminder</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => {
                              if (confirm(`Are you sure you want to delete lead \"${lead.name}\"?`)) {
                                deleteMutation.mutate(lead.id);
                              }
                            }}
                            className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
          <Card>
              <CardHeader>
                  <CardTitle>Upcoming Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                  {remindersLoading ? (
                      <p>Loading...</p>
                  ) : (
                      <ul className="space-y-2">
                          {remindersData.map(r => (
                              <li key={r.id} className="flex justify-between items-center p-2 rounded-md bg-gray-100">
                                  <div>
                                    <p className="font-semibold">{(leadsData || []).find(l => l.id === r.lead_id)?.name}</p>
                                    <p className="text-sm text-gray-500">{new Date(r.reminder_date).toLocaleDateString()}</p>
                                    <p className="text-sm">{r.notes}</p>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => deleteReminderMutation.mutate(r.id)}
                                    disabled={deleteReminderMutation.isPending}
                                  >
                                    {deleteReminderMutation.isPending ? "Updating..." : "Done"}
                                  </Button>
                              </li>
                          ))
                          }
                      </ul>
                  )}
              </CardContent>
          </Card>
          {selectedLead && <CommunicationHistory lead={selectedLead} />}
      </div>
      
      {editingLead && (
        <EditLeadDialog 
            lead={editingLead}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onUpdate={handleUpdateSubmit}
        />
      )}
      {remindingLead && (
        <ReminderDialog 
            lead={remindingLead}
            open={reminderDialogOpen}
            onOpenChange={setReminderDialogOpen}
            onCreate={handleCreateReminderSubmit}
        />
      )}
    </div>
  );
}
