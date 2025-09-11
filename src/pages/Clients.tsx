import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useToast } from "@/hooks/use-toast";
import { uploadClientDocument, createSignedUrl } from "@/services/storage";
import { insertDocumentRecord, createClient, listDocumentsByClient } from "@/services/clients";
import {
  UserCircle,
  Search,
  Plus,
  FileText,
  Upload,
  Building,
  Eye,
  Download,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  dateRegistered: string;
  totalInvestment: number;
  bookedLots: Array<{
    blockNumber: string;
    lotNumber: string;
    size: number;
    price: number;
    status: string;
  }>;
  documents: Array<{
    type: string;
    fileName: string;
    uploadDate: string;
    status: string;
  }>;
  paymentHistory: Array<{
    date: string;
    amount: number;
    type: string;
    reference: string;
  }>;
}

export default function Clients() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [clients, setClients] = useState<Client[]>([
    {
      id: "1",
      name: "Sofia Reyes",
      email: "sofia.reyes@email.com",
      phone: "+63 921 567 8901",
      address: "123 Rizal St, Quezon City",
      status: "Active",
      dateRegistered: "2024-01-08",
      totalInvestment: 750000,
      bookedLots: [
        {
          blockNumber: "7",
          lotNumber: "3",
          size: 250,
          price: 750000,
          status: "Fully Paid",
        },
      ],
      documents: [
        { type: "Valid ID", fileName: "sofia_id.pdf", uploadDate: "2024-01-08", status: "Verified" },
        { type: "Proof of Income", fileName: "sofia_income.pdf", uploadDate: "2024-01-08", status: "Verified" },
        { type: "Birth Certificate", fileName: "sofia_birth_cert.pdf", uploadDate: "2024-01-09", status: "Verified" },
      ],
      paymentHistory: [
        { date: "2024-01-08", amount: 150000, type: "Reservation", reference: "RES-001" },
        { date: "2024-01-12", amount: 600000, type: "Full Payment", reference: "FP-001" },
      ],
    },
    {
      id: "2",
      name: "Carlos Miranda",
      email: "carlos.miranda@email.com",
      phone: "+63 920 456 7890",
      address: "456 Bonifacio Ave, Manila",
      status: "Reserved",
      dateRegistered: "2024-01-10",
      totalInvestment: 660000,
      bookedLots: [
        {
          blockNumber: "2",
          lotNumber: "5",
          size: 220,
          price: 660000,
          status: "Reserved",
        },
      ],
      documents: [
        { type: "Valid ID", fileName: "carlos_id.pdf", uploadDate: "2024-01-10", status: "Verified" },
        { type: "Proof of Income", fileName: "carlos_income.pdf", uploadDate: "2024-01-11", status: "Pending" },
      ],
      paymentHistory: [
        { date: "2024-01-10", amount: 132000, type: "Reservation (20%)", reference: "RES-002" },
      ],
    },
  ]);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "", address: "" });
  const [creatingClient, setCreatingClient] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !selectedClient) return;
      // Ensure we have a UUID client id. If demo data has string numeric ids, create a real client row to own the file.
      const clientUuid = /^[0-9a-fA-F-]{36}$/.test(selectedClient.id)
        ? selectedClient.id
        : await createClient({ name: selectedClient.name, email: selectedClient.email, phone: selectedClient.phone, address: selectedClient.address });

      const { filePath } = await uploadClientDocument(clientUuid, file);
      await insertDocumentRecord({
        client_id: clientUuid,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type || "application/octet-stream",
        file_size: file.size,
        status: "pending",
      });

      // Refresh document list from DB for this client
      const fresh = await listDocumentsByClient(clientUuid);
      setClients((prev) => prev.map((c) => (c.id === selectedClient.id ? { ...c, documents: fresh.map((d: any) => ({ type: d.file_type, fileName: d.file_name, uploadDate: new Date(d.uploaded_at).toISOString().slice(0,10), status: d.status === 'verified' ? 'Verified' : 'Pending' })) } : c)));

      toast({ title: "Document uploaded", description: file.name });
      e.target.value = "";
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Active: "success",
      Reserved: "warning",
      Inactive: "secondary",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Profiles</h1>
          <p className="text-muted-foreground">
            Manage client information and documents
          </p>
        </div>
        <Dialog>
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Full Name</Label>
                <Input id="clientName" placeholder="Enter full name" value={newClient.name} onChange={(e) => setNewClient((c) => ({ ...c, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input id="clientEmail" type="email" placeholder="Enter email address" value={newClient.email} onChange={(e) => setNewClient((c) => ({ ...c, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Phone Number</Label>
                <Input id="clientPhone" placeholder="Enter phone number" value={newClient.phone} onChange={(e) => setNewClient((c) => ({ ...c, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientAddress">Address</Label>
                <Input id="clientAddress" placeholder="Enter complete address" value={newClient.address} onChange={(e) => setNewClient((c) => ({ ...c, address: e.target.value }))} />
              </div>
              <Button className="w-full" disabled={creatingClient} onClick={async () => {
                try {
                  setCreatingClient(true);
                  if (!newClient.name) return;
                  const id = await createClient({ name: newClient.name, email: newClient.email, phone: newClient.phone, address: newClient.address });
                  setClients((prev) => [
                    {
                      id,
                      name: newClient.name,
                      email: newClient.email,
                      phone: newClient.phone,
                      address: newClient.address,
                      status: "Active",
                      dateRegistered: new Date().toISOString().slice(0,10),
                      totalInvestment: 0,
                      bookedLots: [],
                      documents: [],
                      paymentHistory: [],
                    },
                    ...prev,
                  ]);
                  setNewClient({ name: "", email: "", phone: "", address: "" });
                  toast({ title: "Client added" });
                } catch (err: any) {
                  toast({ title: "Failed to add client", description: err.message, variant: "destructive" });
                } finally {
                  setCreatingClient(false);
                }
              }}> {creatingClient ? "Adding..." : "Add Client"} </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
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

      {/* Client Grid */}
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
              <div className="text-sm text-muted-foreground">
                Phone: {client.phone}
              </div>
              
              <div className="text-sm">
                <strong>Total Investment:</strong> {formatCurrency(client.totalInvestment)}
              </div>
              
              <div className="text-sm">
                <strong>Booked Lots:</strong> {client.bookedLots.length}
              </div>
              
              <div className="text-sm">
                <strong>Documents:</strong> {client.documents.filter(d => d.status === "Verified").length}/{client.documents.length} verified
              </div>
              
              <div className="text-xs text-muted-foreground">
                Registered: {client.dateRegistered}
              </div>
              
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setSelectedClient(client)}
              >
                <Eye className="w-4 h-4" />
                View Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client Detail Modal */}
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile Info</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="lots">Booked Lots</TabsTrigger>
                <TabsTrigger value="payments">Payment History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input value={selectedClient.email} readOnly />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={selectedClient.phone} readOnly />
                  </div>
                  <div className="col-span-2">
                    <Label>Address</Label>
                    <Input value={selectedClient.address} readOnly />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="pt-2">
                      {getStatusBadge(selectedClient.status)}
                    </div>
                  </div>
                  <div>
                    <Label>Date Registered</Label>
                    <Input value={selectedClient.dateRegistered} readOnly />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">KYC Documents</h3>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button size="sm" className="gap-2" onClick={handleUploadClick}>
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Type</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedClient.documents.map((doc, index) => (
                      <TableRow key={index}>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>{doc.fileName}</TableCell>
                        <TableCell>{doc.uploadDate}</TableCell>
                        <TableCell>
                          <Badge variant={doc.status === "Verified" ? "success" : "warning"}>
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                // Note: in mock data we don't have file_path; this will work for uploaded ones
                                const signedUrl = await createSignedUrl(`${selectedClient.id}/${doc.fileName}`);
                                window.open(signedUrl, "_blank");
                              } catch {
                                // ignore for mock rows
                              }
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="lots" className="space-y-4">
                <h3 className="font-semibold">Booked Properties</h3>
                {selectedClient.bookedLots.map((lot, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building className="w-5 h-5 text-primary" />
                          <div>
                            <h4 className="font-medium">
                              Block {lot.blockNumber}, Lot {lot.lotNumber}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {lot.size} sqm • {formatCurrency(lot.price)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={lot.status === "Fully Paid" ? "success" : "warning"}>
                          {lot.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="payments" className="space-y-4">
                <h3 className="font-semibold">Payment History</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedClient.paymentHistory.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>{payment.type}</TableCell>
                        <TableCell>{payment.reference}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}