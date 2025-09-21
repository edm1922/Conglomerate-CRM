import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listPayments, createPayment, deletePayment, updatePayment, onPaymentsChange } from "@/services/payments";
import { listClients } from "@/services/clients";
import { listPaymentMethods } from "@/services/paymentMethods";
import { CreatePaymentSchema, type CreatePayment } from "@/types/validation";
import { Payment as PaymentEntity, Client as ClientEntity, PaymentMethod } from "@/types/entities";
import Icon from "@/components/Icon";
import ReceiptGenerator from "@/components/ReceiptGenerator";
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
import { Plus, Receipt, Download, Search, Filter, Trash2, Printer, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Payments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");
  const [isInstallment, setIsInstallment] = useState(false);

  const { data: paymentsData = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: listPayments,
  });

  const { data: clientsData = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: listClients,
  });

  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ["payment_methods"],
    queryFn: listPaymentMethods,
  });

  useEffect(() => {
    const channel = onPaymentsChange(() => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    });
    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreatePayment>({
    resolver: zodResolver(CreatePaymentSchema),
  });

  const paymentType = watch("payment_type");

  useEffect(() => {
    setIsInstallment(paymentType === "Installment");
  }, [paymentType]);

  const createMutation = useMutation({
    mutationFn: async (values: CreatePayment) => {
      if (isInstallment && values.total_installments && values.total_installments > 1) {
        const { amount, total_installments, ...rest } = values;
        const installmentAmount = amount / total_installments;
        const parentPayment = await createPayment({
          ...rest,
          amount: installmentAmount,
          installment_number: 1,
          total_installments,
        });

        if (parentPayment) {
          for (let i = 2; i <= total_installments; i++) {
            await createPayment({
              ...rest,
              amount: installmentAmount,
              parent_payment_id: parentPayment.id,
              installment_number: i,
              total_installments,
              status: "pending", // Subsequent installments are pending
            });
          }
        }
      } else {
        await createPayment(values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      reset();
      setDialogOpen(false);
      toast({ title: "Success", description: "Payment recorded successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updatePayment(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast({ title: "Success", description: "Payment status updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast({ title: "Success", description: "Payment deleted successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleCreateSubmit = (values: CreatePayment) => {
    createMutation.mutate(values);
  };

  const handleStatusChange = (id: string, status: string) => {
    updateMutation.mutate({ id, status });
  };

  const filteredPayments = useMemo(() => {
    return (paymentsData || []).filter((payment) => {
      const clientName = (payment.clients as ClientEntity)?.name || "";
      const matchesSearch =
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.receipt_no.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMethod =
        selectedMethod === "all" ||
        payment.payment_method.toLowerCase().replace(" ", "-") === selectedMethod;
      return matchesSearch && matchesMethod;
    });
  }, [paymentsData, searchTerm, selectedMethod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ph', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: "success",
      pending: "warning",
      failed: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    );
  };

  const todayStats = {
    totalCollected: (paymentsData || [])
      .filter(p => new Date(p.created_at).toDateString() === new Date().toDateString() && p.status === "confirmed")
      .reduce((sum, p) => sum + p.amount, 0),
    totalTransactions: (paymentsData || []).filter(p => new Date(p.created_at).toDateString() === new Date().toDateString()).length,
    cashPayments: (paymentsData || [])
      .filter(p => new Date(p.created_at).toDateString() === new Date().toDateString() && p.payment_method === "Cash")
      .reduce((sum, p) => sum + p.amount, 0),
    digitalPayments: (paymentsData || [])
      .filter(p => new Date(p.created_at).toDateString() === new Date().toDateString() && ["Bank Transfer", "GCash"].includes(p.payment_method))
      .reduce((sum, p) => sum + p.amount, 0),
  };

  if (paymentsLoading || clientsLoading || paymentMethodsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cashiering & Payments</h1>
          <p className="text-muted-foreground">Record payments and manage transactions</p>
        </div>
        <div className="flex items-center space-x-4">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md overflow-y-auto" style={{maxHeight: "90vh"}}>
              <DialogHeader>
                <DialogTitle>Record New Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client_id">Client Name</Label>
                  <Select onValueChange={(value) => setValue("client_id", value)}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      {(clientsData || []).map((client) => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.client_id && <p className="text-sm text-red-500">{errors.client_id.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (PHP)</Label>
                  <Input id="amount" type="number" {...register("amount", { valueAsNumber: true })} />
                  {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select onValueChange={(value) => setValue("payment_method", value)}>
                    <SelectTrigger><SelectValue placeholder="Select payment method" /></SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.name}>{method.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.payment_method && <p className="text-sm text-red-500">{errors.payment_method.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_type">Payment Type</Label>
                  <Select onValueChange={(value) => setValue("payment_type", value)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Reservation">Reservation</SelectItem>
                      <SelectItem value="Partial Payment">Partial Payment</SelectItem>
                      <SelectItem value="Full Payment">Full Payment</SelectItem>
                      <SelectItem value="Additional Payment">Additional Payment</SelectItem>
                      <SelectItem value="Installment">Installment</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.payment_type && <p className="text-sm text-red-500">{errors.payment_type.message}</p>}
                </div>
                {isInstallment && (
                  <div className="space-y-2">
                    <Label htmlFor="total_installments">Number of Installments</Label>
                    <Input id="total_installments" type="number" {...register("total_installments", { valueAsNumber: true, min: 2 })} />
                    {errors.total_installments && <p className="text-sm text-red-500">{errors.total_installments.message}</p>}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="receipt_no">Receipt Number</Label>
                  <Input id="receipt_no" {...register("receipt_no")} />
                  {errors.receipt_no && <p className="text-sm text-red-500">{errors.receipt_no.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input id="reference" {...register("reference")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" {...register("notes")} />
                </div>
                <Button className="w-full" type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Recording..." : "Record Payment"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Today's Collection</p><p className="text-2xl font-bold">{formatCurrency(todayStats.totalCollected)}</p></div><span className="text-2xl font-bold text-success">₱</span></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Transactions</p><p className="text-2xl font-bold">{todayStats.totalTransactions}</p></div><Icon name="Receipt" className="w-8 h-8 text-primary" /></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Cash Payments</p><p className="text-2xl font-bold">{formatCurrency(todayStats.cashPayments)}</p></div><Icon name="Banknote" className="w-8 h-8 text-warning" /></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Digital Payments</p><p className="text-2xl font-bold">{formatCurrency(todayStats.digitalPayments)}</p></div><Icon name="CreditCard" className="w-8 h-8 text-accent" /></CardContent></Card>
      </div>

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
                  {paymentMethods.map(method => (
                    <SelectItem key={method.id} value={method.name.toLowerCase().replace(" ", "-")}>{method.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.receipt_no}
                    {payment.parent_payment_id && (
                      <Badge variant="outline" className="ml-2">
                        {payment.installment_number}/{payment.total_installments}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{(payment.clients as ClientEntity)?.name || "-"}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><Icon name={paymentMethods.find(p => p.name === payment.payment_method)?.icon || "Banknote"} /><span>{payment.payment_method}</span></div></TableCell>
                  <TableCell>{payment.payment_type}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ReceiptGenerator payment={payment} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onSelect={() => handleStatusChange(payment.id, "confirmed")}>
                            Mark as Confirmed
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleStatusChange(payment.id, "pending")}>
                            Mark as Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleStatusChange(payment.id, "failed")}>
                            Mark as Failed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="destructive" size="sm" onClick={() => { if (confirm("Are you sure?")) deleteMutation.mutate(payment.id); }}><Trash2 className="w-4 h-4" /></Button>
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
