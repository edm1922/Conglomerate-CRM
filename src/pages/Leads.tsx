import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listLeads, createLead, onLeadsChange } from "@/services/leads";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  MoreHorizontal,
  Edit,
  Eye,
} from "lucide-react";

import type { Lead as LeadEntity } from "@/types/entities";

type Lead = LeadEntity;

export default function Leads() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: listLeads,
  });

  useEffect(() => {
    const channel = onLeadsChange(() => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    });
    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  const { register, handleSubmit, reset } = useForm<{ name: string; email?: string; phone?: string; source: string; notes?: string; }>();

  const createMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      reset();
      setDialogOpen(false);
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      New: "default",
      Contacted: "secondary",
      "Site Visit": "outline",
      Reserved: "warning",
      Closed: "success",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status}
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    const colors = {
      Facebook: "bg-blue-500",
      Google: "bg-green-500",
      "Walk-in": "bg-purple-500",
      Referral: "bg-orange-500",
    } as const;

    return (
      <Badge
        variant="outline"
        className={`${colors[source as keyof typeof colors] || "bg-gray-500"} text-white border-0`}
      >
        {source}
      </Badge>
    );
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus = selectedStatus === "all" || (lead.status || "").toLowerCase() === selectedStatus.toLowerCase();
      const matchesSearch = (lead.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (lead.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (lead.phone || "").includes(searchTerm);
      return matchesStatus && matchesSearch;
    });
  }, [leads, searchTerm, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leads & Inquiries</h1>
          <p className="text-muted-foreground">
            Manage and track potential clients
          </p>
        </div>
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
              onSubmit={handleSubmit((values) =>
                createMutation.mutate({
                  name: values.name,
                  email: values.email,
                  phone: values.phone,
                  source: values.source || "Facebook",
                  notes: values.notes,
                })
              )}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter full name" {...register("name", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email address" {...register("email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="Enter phone number" {...register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select onValueChange={(v) => {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  register("source").onChange({ target: { value: v } });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Additional notes..." {...register("notes")} />
              </div>
              <Button className="w-full" type="submit" disabled={createMutation.isLoading}>
                {createMutation.isLoading ? "Adding..." : "Add Lead"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search leads by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Site Visit">Site Visit</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads ({isLoading ? "..." : filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!isLoading ? filteredLeads : []).map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {lead.notes}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3" />
                        {lead.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getSourceBadge(lead.source)}</TableCell>
                  <TableCell>{getStatusBadge(
                    (lead.status || "New")
                      .replace("site_visit", "Site Visit")
                      .replace("new", "New")
                      .replace("contacted", "Contacted")
                      .replace("reserved", "Reserved")
                      .replace("closed", "Closed")
                  )}</TableCell>
                  <TableCell>{new Date(lead.created_at).toISOString().slice(0,10)}</TableCell>
                  <TableCell>{new Date(lead.updated_at).toISOString().slice(0,10)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}