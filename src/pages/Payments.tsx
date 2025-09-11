import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Plus,
  Receipt,
  Download,
  Search,
  Filter,
  CreditCard,
  Smartphone,
  Banknote,
} from "lucide-react";

interface Payment {
  id: string;
  receiptNo: string;
  date: string;
  clientName: string;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  reference: string;
  lot: string;
  status: string;
  notes: string;
}

export default function Payments() {
  const [payments] = useState<Payment[]>([
    {
      id: "1",
      receiptNo: "RCP-001",
      date: "2024-01-15",
      clientName: "Sofia Reyes",
      amount: 600000,
      paymentMethod: "Bank Transfer",
      paymentType: "Full Payment",
      reference: "BT-20240115-001",
      lot: "Block 7, Lot 3",
      status: "Confirmed",
      notes: "Final payment for lot purchase",
    },
    {
      id: "2",
      receiptNo: "RCP-002",
      date: "2024-01-14",
      clientName: "Carlos Miranda",
      amount: 50000,
      paymentMethod: "Cash",
      paymentType: "Additional Payment",
      reference: "CSH-20240114-001",
      lot: "Block 2, Lot 5",
      status: "Confirmed",
      notes: "Additional payment towards reservation",
    },
    {
      id: "3",
      receiptNo: "RCP-003",
      date: "2024-01-13",
      clientName: "Maria Santos",
      amount: 25000,
      paymentMethod: "GCash",
      paymentType: "Partial Payment",
      reference: "GC-20240113-001",
      lot: "Block 1, Lot 1",
      status: "Pending",
      notes: "Partial payment pending verification",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");

  const paymentMethods = [
    { id: "cash", name: "Cash", icon: Banknote },
    { id: "bank-transfer", name: "Bank Transfer", icon: CreditCard },
    { id: "gcash", name: "GCash", icon: Smartphone },
    { id: "cheque", name: "Cheque", icon: Receipt },
  ];

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = 
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.lot.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = selectedMethod === "all" || 
      payment.paymentMethod.toLowerCase().replace(" ", "-") === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Confirmed: "success",
      Pending: "warning",
      Failed: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    );
  };

  const getMethodIcon = (method: string) => {
    const icons = {
      "Cash": Banknote,
      "Bank Transfer": CreditCard,
      "GCash": Smartphone,
      "Cheque": Receipt,
    } as const;

    const Icon = icons[method as keyof typeof icons] || Banknote;
    return <Icon className="w-4 h-4" />;
  };

  const todayStats = {
    totalCollected: payments
      .filter(p => p.date === "2024-01-15" && p.status === "Confirmed")
      .reduce((sum, p) => sum + p.amount, 0),
    totalTransactions: payments.filter(p => p.date === "2024-01-15").length,
    cashPayments: payments
      .filter(p => p.date === "2024-01-15" && p.paymentMethod === "Cash")
      .reduce((sum, p) => sum + p.amount, 0),
    digitalPayments: payments
      .filter(p => p.date === "2024-01-15" && ["Bank Transfer", "GCash"].includes(p.paymentMethod))
      .reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cashiering & Payments</h1>
          <p className="text-muted-foreground">
            Record payments and manage transactions
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client Name</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sofia">Sofia Reyes</SelectItem>
                    <SelectItem value="carlos">Carlos Miranda</SelectItem>
                    <SelectItem value="maria">Maria Santos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (PHP)</Label>
                <Input id="amount" type="number" placeholder="Enter amount" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="gcash">GCash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Payment Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reservation">Reservation</SelectItem>
                    <SelectItem value="partial">Partial Payment</SelectItem>
                    <SelectItem value="full">Full Payment</SelectItem>
                    <SelectItem value="additional">Additional Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number</Label>
                <Input id="reference" placeholder="Enter reference number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Additional notes..." />
              </div>
              <Button className="w-full">Record Payment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Collection</p>
                <p className="text-2xl font-bold">{formatCurrency(todayStats.totalCollected)}</p>
              </div>
              <span className="text-2xl font-bold text-success">₱</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{todayStats.totalTransactions}</p>
              </div>
              <Receipt className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cash Payments</p>
                <p className="text-2xl font-bold">{formatCurrency(todayStats.cashPayments)}</p>
              </div>
              <Banknote className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Digital Payments</p>
                <p className="text-2xl font-bold">{formatCurrency(todayStats.digitalPayments)}</p>
              </div>
              <CreditCard className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by client, receipt number, or lot..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="gcash">GCash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Lot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.receiptNo}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>{payment.clientName}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMethodIcon(payment.paymentMethod)}
                      <span>{payment.paymentMethod}</span>
                    </div>
                  </TableCell>
                  <TableCell>{payment.paymentType}</TableCell>
                  <TableCell>{payment.lot}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Receipt className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reconciliation Summary */}
      <Card>
        <CardHeader>
          <CardTitle>End-of-Day Reconciliation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Cash on Hand</p>
              <p className="text-2xl font-bold">{formatCurrency(todayStats.cashPayments)}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Digital Receipts</p>
              <p className="text-2xl font-bold">{formatCurrency(todayStats.digitalPayments)}</p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Collection</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(todayStats.totalCollected)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}