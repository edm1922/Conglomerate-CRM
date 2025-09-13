
import { useEffect, useMemo, useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listClients, createClient, updateClient, deleteClient, onClientsChange, listDocumentsByClient, insertDocumentRecord, deleteDocument, updateDocument } from "@/services/clients";
import { uploadClientDocument, createSignedUrl, deleteClientDocument } from "@/services/storage";
import { CreateClientSchema, UpdateClientSchema, type CreateClient, type UpdateClient, CreateCommunicationSchema, type CreateCommunication } from "@/types/validation";
import { Client as ClientEntity, Document as DocumentEntity, Communication as CommunicationEntity } from "@/types/entities";
import { listCommunications, createCommunication } from "@/services/communications";
import CommunicationList from "@/components/communications/CommunicationList";
import CommunicationForm from "@/components/communications/CommunicationForm";
import BookedLotsTab from "@/components/BookedLotsTab";
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
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientLotBookingDialog from "@/components/ClientLotBookingDialog";


export default function Clients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientEntity | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientEntity | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

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
      setDialogOpen(false);
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search clients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                </div>
                {getStatusBadge(client.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">Phone: {client.phone}</div>
              <div className="text-sm"><strong>Total Investment:</strong> {formatCurrency(client.total_investment)}</div>
              <div className="text-xs text-muted-foreground">Registered: {new Date(client.created_at).toLocaleDateString()}</div>
              <Button variant="outline" className="w-full gap-2" onClick={() => setSelectedClient(client)}>
                <Eye className="w-4 h-4" />
                View Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedClient && (
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <UserCircle className="w-6 h-6" />
                {selectedClient.name}
              </DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile">Profile Info</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="communications">Communications</TabsTrigger>
                <TabsTrigger value="lots">Booked Lots</TabsTrigger>
                <TabsTrigger value="payments">Payment History</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Email</Label><Input value={selectedClient.email || ''} readOnly /></div>
                  <div><Label>Phone</Label><Input value={selectedClient.phone || ''} readOnly /></div>
                  <div className="col-span-2"><Label>Address</Label><Input value={selectedClient.address || ''} readOnly /></div>
                  <div><Label>Status</Label><div className="pt-2">{getStatusBadge(selectedClient.status)}</div></div>
                  <div><Label>Date Registered</Label><Input value={new Date(selectedClient.created_at).toLocaleDateString()} readOnly /></div>
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
                  <Button size="sm" className="gap-2" onClick={() => setBookingDialogOpen(true)}>
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
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {bookingDialogOpen && selectedClient && (
        <ClientLotBookingDialog client={selectedClient} onBooking={() => setBookingDialogOpen(false)} />
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

  const deleteDocumentMutation = useMutation(
    async (doc: DocumentEntity) => {
      await deleteClientDocument(doc.file_path);
      await deleteDocument(doc.id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["documents", clientId] });
        toast({ title: "Success", description: "Document deleted successfully." });
      },
      onError: (error: Error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      },
    }
  );
  const verifyDocumentMutation = useMutation(
    (doc: DocumentEntity) => updateDocument(doc.id, { status: "verified" }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["documents", clientId] });
        toast({ title: "Success", description: "Document verified successfully." });
      },
      onError: (error: Error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      },
    }
  );


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
    fn: () => listCommunications(clientId),
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
