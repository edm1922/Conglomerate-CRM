
import { useEffect, useMemo, useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listClients, createClient, updateClient, deleteClient, onClientsChange, listDocumentsByClient, insertDocumentRecord, deleteDocument, updateDocument } from "@/services/clients";
import { listAvailableLots } from "@/services/lots";
import { uploadClientDocument, createSignedUrl, deleteClientDocument } from "@/services/storage";
import { CreateClientSchema, UpdateClientSchema, type CreateClient, type UpdateClient, CreateCommunicationSchema, type CreateCommunication } from "@/types/validation";
import { Client as ClientEntity, Document as DocumentEntity, Communication as CommunicationEntity, Lot } from "@/types/entities";
import { listCommunications, createCommunication } from "@/services/communications";
import CommunicationList from "@/components/communications/CommunicationList";
import CommunicationForm from "@/components/communications/CommunicationForm";
import BookedLotsTab from "@/components/BookedLotsTab";
import { sendEmail } from "@/services/email";
import { sendSms } from "@/services/sms";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  UserCircle,
  Search,
  Plus,
  FileText,
  Upload,
  Building,
  Eye,
  Download,
  Trash2,
  Edit,
  CheckCircle,
  Mail,
  MessageSquare,
  Ruler,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientLotBookingDialog from "@/components/ClientLotBookingDialog";


export default function Clients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false); // For "Add New Client" dialog
  const [clientDetailsDialogOpen, setClientDetailsDialogOpen] = useState(false); // For client details dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientEntity | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientEntity | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [bookingLot, setBookingLot] = useState<Lot | null>(null);
  const [lotSelectionDialogOpen, setLotSelectionDialogOpen] = useState(false);

  const { data: clientsData = [], isLoading: clientsLoading, isError, error } = useQuery({
    queryKey: ["clients"],
    queryFn: listClients,
  });

  useEffect(() => {
    const channel = onClientsChange(() => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    });
    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateClient>({
    resolver: zodResolver(CreateClientSchema),
  });

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      reset();
      setCreateDialogOpen(false);
      toast({ title: "Success", description: "Client created successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClient }) => updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setEditDialogOpen(false);
      setEditingClient(null);
      toast({ title: "Success", description: "Client updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Success", description: "Client deleted successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  
  const emailMutation = useMutation({
    mutationFn: (values: { to: string; subject: string; body: string }) => sendEmail(values.to, values.subject, values.body),
    onSuccess: () => {
        toast({ title: "Email Sent", description: "The email has been sent successfully." });
        setEmailDialogOpen(false);
    },
    onError: (error: Error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    },
});

  const smsMutation = useMutation({
    mutationFn: (values: { to: string; body: string }) => sendSms(values.to, values.body),
    onSuccess: () => {
        toast({ title: "SMS Sent", description: "The SMS has been sent successfully." });
        setSmsDialogOpen(false);
    },
    onError: (error: Error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateSubmit = (values: CreateClient) => {
    createMutation.mutate(values);
  };

  const handleUpdateSubmit = (values: UpdateClient) => {
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data: values });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClient) return;

    try {
      const { filePath } = await uploadClientDocument(selectedClient.id, file);
      await insertDocumentRecord({
        client_id: selectedClient.id,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type || "application/octet-stream",
        file_size: file.size,
        status: "pending",
      });

      queryClient.invalidateQueries({ queryKey: ["documents", selectedClient.id] });
      toast({ title: "Document uploaded", description: file.name });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      e.target.value = "";
    }
  };

  const filteredClients = useMemo(() => {
    return (clientsData || []).filter((client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone || "").includes(searchTerm)
    );
  }, [clientsData, searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "success",
      reserved: "warning",
      inactive: "secondary",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    );
  };

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading clients...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load clients: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Profiles</h1>
          <p className="text-muted-foreground">Manage client information and documents</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-4">
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
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" {...register("address")} />
              </div>
              <Button className="w-full" type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Add Client"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search clients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {clientsLoading ? (
            <div className="flex items-center justify-center h-32">
              <p>Loading clients...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Investment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedClient(client); setClientDetailsDialogOpen(true); }}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {client.email && <div>{client.email}</div>}
                        {client.phone && <div>{client.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>{formatCurrency(client.total_investment)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedClient(client); setClientDetailsDialogOpen(true); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedClient && (
        <Dialog open={clientDetailsDialogOpen} onOpenChange={(open) => { 
          setClientDetailsDialogOpen(open); 
          if (!open) {
            setSelectedClient(null);
            setEditingClient(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-2">
                    <UserCircle className="w-6 h-6" />
                    {selectedClient.name}
                  </DialogTitle>
                  <div className="text-sm text-muted-foreground">{selectedClient.email} | {selectedClient.phone}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditingClient(selectedClient); }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => {
                    if (confirm("Are you sure you want to delete this client?")) {
                      deleteMutation.mutate(selectedClient.id);
                    }
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            {editingClient ? (
              <form onSubmit={handleSubmit(handleUpdateSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input id="edit-name" defaultValue={editingClient.name} {...register("name")} />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" type="email" defaultValue={editingClient.email || ""} {...register("email")} />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input id="edit-phone" defaultValue={editingClient.phone || ""} {...register("phone")} />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Address</Label>
                  <Textarea id="edit-address" defaultValue={editingClient.address || ""} {...register("address")} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingClient(null)}>Cancel</Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="communications">Communications</TabsTrigger>
                  <TabsTrigger value="lots">Lots</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div><span className="font-medium">Email:</span> {selectedClient.email || "N/A"}</div>
                        <div><span className="font-medium">Phone:</span> {selectedClient.phone || "N/A"}</div>
                        <div><span className="font-medium">Address:</span> {selectedClient.address || "N/A"}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Client Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div><span className="font-medium">Status:</span> {getStatusBadge(selectedClient.status)}</div>
                        <div><span className="font-medium">Total Investment:</span> {formatCurrency(selectedClient.total_investment)}</div>
                        <div><span className="font-medium">Client Since:</span> {new Date(selectedClient.created_at).toLocaleDateString()}</div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="documents" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">KYC Documents</h3>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                    <Button size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4" />
                      Upload Document
                    </Button>
                  </div>
                  <DocumentsTable clientId={selectedClient.id} />
                </TabsContent>
                <TabsContent value="communications" className="space-y-4">
                  <CommunicationsTab clientId={selectedClient.id} />
                </TabsContent>
                <TabsContent value="lots" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Booked Properties</h3>
                    <Button size="sm" className="gap-2" onClick={() => setLotSelectionDialogOpen(true)}>
                      <Plus className="w-4 h-4" />
                      Book a Lot
                    </Button>
                  </div>
                  <BookedLotsTab clientId={selectedClient.id} />
                </TabsContent>
                <TabsContent value="payments" className="space-y-4">
                  <h3 className="font-semibold">Payment History</h3>
                  <p className="text-muted-foreground">No payment history yet.</p>
                </TabsContent>
                <TabsContent value="actions" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Communication</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button className="w-full gap-2" variant="outline" onClick={() => setEmailDialogOpen(true)}>
                          <Mail className="w-4 h-4" />
                          Send Email
                        </Button>
                        <Button className="w-full gap-2" variant="outline" onClick={() => setSmsDialogOpen(true)}>
                          <MessageSquare className="w-4 h-4" />
                          Send SMS
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      )}

      {emailDialogOpen && selectedClient && (
        <EmailDialog
            client={selectedClient}
            open={emailDialogOpen}
            onOpenChange={setEmailDialogOpen}
            onSubmit={(values) => emailMutation.mutate(values)}
            isSending={emailMutation.isPending}
        />
      )}

      {smsDialogOpen && selectedClient && (
        <SmsDialog
            client={selectedClient}
            open={smsDialogOpen}
            onOpenChange={setSmsDialogOpen}
            onSubmit={(values) => smsMutation.mutate(values)}
            isSending={smsMutation.isPending}
        />
      )}

      {bookingDialogOpen && selectedClient && bookingLot && (
        <ClientLotBookingDialog 
          lot={bookingLot} 
          onBooking={() => {
            setBookingDialogOpen(false);
            setBookingLot(null);
          }} 
        />
      )}

      {/* Lot Selection Dialog */}
      {lotSelectionDialogOpen && selectedClient && (
        <LotSelectionDialog 
          client={selectedClient}
          open={lotSelectionDialogOpen}
          onOpenChange={(open) => {
            setLotSelectionDialogOpen(open);
            if (!open) {
              setBookingLot(null);
            }
          }}
          onLotSelect={(lot) => {
            setBookingLot(lot);
            setLotSelectionDialogOpen(false);
            setBookingDialogOpen(true);
          }}
        />
      )}
    </div>
  );
}

function DocumentsTable({ clientId }: { clientId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents", clientId],
    queryFn: () => listDocumentsByClient(clientId),
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (doc: DocumentEntity) => {
      await deleteClientDocument(doc.file_path);
      await deleteDocument(doc.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", clientId] });
      toast({ title: "Success", description: "Document deleted successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  const verifyDocumentMutation = useMutation({
    mutationFn: (doc: DocumentEntity) => updateDocument(doc.id, { status: "verified" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", clientId] });
      toast({ title: "Success", description: "Document verified successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });


  if (isLoading) return <p>Loading documents...</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>File Name</TableHead>
          <TableHead>Upload Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc: DocumentEntity) => (
          <TableRow key={doc.id}>
            <TableCell>{doc.file_name}</TableCell>
            <TableCell>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
            <TableCell><Badge variant={doc.status === "verified" ? "success" : "warning"}>{doc.status}</Badge></TableCell>
            <TableCell className="space-x-2">
              <Button variant="ghost" size="sm" onClick={async () => { window.open(await createSignedUrl(doc.file_path), "_blank"); }}>
                <Download className="w-4 h-4" />
              </Button>
              {doc.status !== "verified" && (
                <Button variant="ghost" size="sm" onClick={() => verifyDocumentMutation.mutate(doc)}>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => deleteDocumentMutation.mutate(doc)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CommunicationsTab({ clientId }: { clientId: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: communications = [], isLoading } = useQuery({
    queryKey: ["communications", clientId],
    queryFn: () => listCommunications(clientId),
  });

  const createCommunicationMutation = useMutation({
    mutationFn: createCommunication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communications", clientId] });
      toast({ title: "Success", description: "Communication logged successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCommunicationSubmit = (data: CreateCommunication) => {
    createCommunicationMutation.mutate(data);
  };

  if (isLoading) return <p>Loading communications...</p>;

  return (
    <div className="space-y-4">
      <CommunicationForm clientId={clientId} onSubmit={handleCommunicationSubmit} />
      <CommunicationList communications={communications} />
    </div>
  );
}

function EmailDialog({ client, open, onOpenChange, onSubmit, isSending }: {
    client: ClientEntity;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: { to: string; subject: string; body: string }) => void;
    isSending: boolean;
}) {
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");

    const handleSubmit = () => {
        if (client.email) {
            onSubmit({ to: client.email, subject, body });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Send Email to {client.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="body">Body</Label>
                        <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={10} />
                    </div>
                    <Button onClick={handleSubmit} disabled={isSending || !client.email}>
                        {isSending ? "Sending..." : "Send Email"}
                    </Button>
                    {!client.email && <p className="text-sm text-red-500">This client does not have an email address.</p>}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function SmsDialog({ client, open, onOpenChange, onSubmit, isSending }: {
    client: ClientEntity;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: { to: string; body: string }) => void;
    isSending: boolean;
}) {
    const [body, setBody] = useState("");

    const handleSubmit = () => {
        if (client.phone) {
            onSubmit({ to: client.phone, body });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Send SMS to {client.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="body">Message</Label>
                        <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={5} />
                    </div>
                    <Button onClick={handleSubmit} disabled={isSending || !client.phone}>
                        {isSending ? "Sending..." : "Send SMS"}
                    </Button>
                    {!client.phone && <p className="text-sm text-red-500">This client does not have a phone number.</p>}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function LotSelectionDialog({ 
  client, 
  open, 
  onOpenChange,
  onLotSelect
}: { 
  client: ClientEntity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLotSelect: (lot: Lot) => void;
}) {
  const { data: lots = [], isLoading } = useQuery({
    queryKey: ["available-lots"],
    queryFn: listAvailableLots,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a Lot for {client.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">Choose an available lot to book for this client</p>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <p>Loading available lots...</p>
          </div>
        ) : lots.length === 0 ? (
          <div className="text-center py-8">
            <Building className="w-12 h-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 font-medium">No available lots</h3>
            <p className="text-sm text-muted-foreground mt-1">
              There are currently no lots available for booking.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lots.map((lot) => (
              <Card 
                key={lot.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onLotSelect(lot)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Block {lot.block_number}, Lot {lot.lot_number}</CardTitle>
                    <Badge variant="success">Available</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm"><Ruler className="w-4 h-4 text-muted-foreground" /><span>{lot.size} sqm</span></div>
                  <div className="flex items-center gap-2"><span className="text-sm font-bold text-muted-foreground">₱</span><span className="font-semibold">{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(lot.price)}</span></div>
                  {lot.location && <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4" /><span>{lot.location}</span></div>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


