import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/stores";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  Users,
  Building,
  Calendar,
  Printer,
} from "lucide-react";

export default function Reports() {
  const { 
    leads,
    appointments,
    payments,
    clients,
    lots
  } = useAppStore();
  
  const [selectedReport, setSelectedReport] = useState("daily-sales");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const dailySalesData = useMemo(() => {
    const dailyLeads = leads.filter(l => l.created_at.startsWith(selectedDate));
    const dailyAppointments = appointments.filter(a => a.scheduled_date === selectedDate);
    const dailyPayments = payments.filter(p => p.created_at.startsWith(selectedDate));
    
    const totalSales = dailyPayments.reduce((sum, p) => sum + p.amount, 0);
    const transactions = dailyPayments.length;

    return {
      date: selectedDate,
      totalSales,
      transactions,
      leadsGenerated: dailyLeads.length,
      appointmentsHeld: dailyAppointments.length,
      details: [
        ...dailyLeads.map(l => ({ time: l.created_at.split('T')[1].substring(0,5), activity: 'New Lead', client: l.name, outcome: `Source: ${l.source}`, amount: 0})),
        ...dailyAppointments.map(a => ({ time: a.scheduled_time, activity: a.type, client: (a.clients as any)?.name || '-', outcome: a.status, amount: 0})),
        ...dailyPayments.map(p => ({ time: p.created_at.split('T')[1].substring(0,5), activity: 'Payment', client: (p.clients as any)?.name || '-', outcome: p.payment_type, amount: p.amount})),
      ].sort((a,b) => a.time.localeCompare(b.time)),
    };
  }, [selectedDate, leads, appointments, payments]);

  const inventoryData = useMemo(() => {
    const available = lots.filter(l => l.status === 'available').length;
    const reserved = lots.filter(l => l.status === 'reserved').length;
    const sold = lots.filter(l => l.status === 'sold').length;
    
    const byBlock = lots.reduce((acc, lot) => {
      const block = acc.find(b => b.block === lot.block_number);
      if (block) {
        block.total++;
        if (lot.status === 'available') block.available++;
        if (lot.status === 'reserved') block.reserved++;
        if (lot.status === 'sold') block.sold++;
      } else {
        acc.push({
          block: lot.block_number,
          total: 1,
          available: lot.status === 'available' ? 1 : 0,
          reserved: lot.status === 'reserved' ? 1 : 0,
          sold: lot.status === 'sold' ? 1 : 0,
        });
      }
      return acc;
    }, [] as { block: string; total: number; available: number; reserved: number; sold: number }[]);

    const totalValue = lots.reduce((sum, lot) => sum + lot.price, 0);
    const soldValue = lots.filter(l => l.status === 'sold').reduce((sum, lot) => sum + lot.price, 0);
    const reservedValue = lots.filter(l => l.status === 'reserved').reduce((sum, lot) => sum + lot.price, 0);

    return {
      totalLots: lots.length,
      available,
      reserved,
      sold,
      byBlock,
      totalValue,
      soldValue,
      reservedValue,
    };
  }, [lots]);
  
  const leadsReportData = useMemo(() => {
    const sourceCounts = leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLeads: leads.length,
      sourceCounts,
      statusCounts,
      leadsByDate: leads.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    };
  }, [leads]);

  const paymentsReportData = useMemo(() => {
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    
    const byType = payments.reduce((acc, p) => {
      acc[p.payment_type] = (acc[p.payment_type] || 0) + p.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const byMethod = payments.reduce((acc, p) => {
      acc[p.payment_method] = (acc[p.payment_method] || 0) + p.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPayments: payments.length,
      totalCollected,
      byType,
      byMethod,
      paymentsByDate: payments.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    };
  }, [payments]);

  const handlePrint = () => window.print();
  
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Report: ${selectedReport} - ${selectedDate}`, 14, 16);
    
    switch(selectedReport) {
      case 'daily-sales':
        autoTable(doc, {
          startY: 20,
          head: [['Time', 'Activity', 'Client', 'Outcome', 'Amount']],
          body: dailySalesData.details.map(d => [d.time, d.activity, d.client, d.outcome, formatCurrency(d.amount)]),
        });
        break;
      case 'inventory':
        autoTable(doc, {
          startY: 20,
          head: [['Block', 'Total', 'Available', 'Reserved', 'Sold']],
          body: inventoryData.byBlock.map(b => [b.block, b.total, b.available, b.reserved, b.sold]),
        });
        break;
      case 'leads':
        autoTable(doc, {
          startY: 20,
          head: [['Date', 'Name', 'Source', 'Status']],
          body: leadsReportData.leadsByDate.map(l => [l.created_at.split('T')[0], l.name, l.source, l.status]),
        });
        break;
      case 'payments':
        autoTable(doc, {
          startY: 20,
          head: [['Date', 'Client', 'Type', 'Method', 'Amount']],
          body: paymentsReportData.paymentsByDate.map(p => [p.created_at.split('T')[0], (p.clients as any)?.name || '-', p.payment_type, p.payment_method, formatCurrency(p.amount)]),
        });
        break;
    }

    doc.save(`report-${selectedReport}-${selectedDate}.pdf`);
  };

  const reportTypes = [
    { id: "daily-sales", name: "Daily Sales Report", icon: BarChart3 },
    { id: "inventory", name: "Inventory Report", icon: Building },
    { id: "leads", name: "Leads Report", icon: Users },
    { id: "payments", name: "Payments Report", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and view business reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handlePrint}><Printer className="w-4 h-4" />Print</Button>
          <Button className="gap-2" onClick={handleExportPDF}><Download className="w-4 h-4" />Export PDF</Button>
        </div>
      </div>

      <Card><CardContent className="p-4"><div className="flex flex-col md:flex-row gap-4"><div className="flex-1"><Label htmlFor="reportType">Report Type</Label><Select value={selectedReport} onValueChange={setSelectedReport}><SelectTrigger><SelectValue placeholder="Select report type" /></SelectTrigger><SelectContent>{reportTypes.map((type) => (<SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>))}</SelectContent></Select></div><div><Label htmlFor="reportDate">Date</Label><Input id="reportDate" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} /></div></div></CardContent></Card>

      {selectedReport === "daily-sales" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Sales</p><p className="text-2xl font-bold">{formatCurrency(dailySalesData.totalSales)}</p></div><span className="text-2xl font-bold text-success">₱</span></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Transactions</p><p className="text-2xl font-bold">{dailySalesData.transactions}</p></div><FileText className="w-8 h-8 text-primary" /></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">New Leads</p><p className="text-2xl font-bold">{dailySalesData.leadsGenerated}</p></div><Users className="w-8 h-8 text-accent" /></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Appointments</p><p className="text-2xl font-bold">{dailySalesData.appointmentsHeld}</p></div><Calendar className="w-8 h-8 text-warning" /></div></CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle>Daily Activity Log</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Activity</TableHead><TableHead>Client</TableHead><TableHead>Outcome</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader><TableBody>{dailySalesData.details.map((activity, index) => (<TableRow key={index}><TableCell>{activity.time}</TableCell><TableCell>{activity.activity}</TableCell><TableCell>{activity.client}</TableCell><TableCell>{activity.outcome}</TableCell><TableCell className="font-semibold">{activity.amount > 0 ? formatCurrency(activity.amount) : "-"}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
        </div>
      )}

      {selectedReport === "inventory" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><div className="text-center"><p className="text-sm text-muted-foreground">Total Lots</p><p className="text-2xl font-bold">{inventoryData.totalLots}</p></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-center"><p className="text-sm text-muted-foreground">Available</p><p className="text-2xl font-bold text-success">{inventoryData.available}</p></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-center"><p className="text-sm text-muted-foreground">Reserved</p><p className="text-2xl font-bold text-warning">{inventoryData.reserved}</p></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-center"><p className="text-sm text-muted-foreground">Sold</p><p className="text-2xl font-bold text-destructive">{inventoryData.sold}</p></div></CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle>Inventory by Block</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Block</TableHead><TableHead>Total Lots</TableHead><TableHead>Available</TableHead><TableHead>Reserved</TableHead><TableHead>Sold</TableHead><TableHead>Occupancy Rate</TableHead></TableRow></TableHeader><TableBody>{inventoryData.byBlock.map((block, index) => { const occupancyRate = ((block.reserved + block.sold) / block.total * 100).toFixed(1); return (<TableRow key={index}><TableCell className="font-medium">{block.block}</TableCell><TableCell>{block.total}</TableCell><TableCell><Badge variant="success">{block.available}</Badge></TableCell><TableCell><Badge variant="warning">{block.reserved}</Badge></TableCell><TableCell><Badge variant="destructive">{block.sold}</Badge></TableCell><TableCell>{occupancyRate}%</TableCell></TableRow>);})}</TableBody></Table></CardContent></Card>
          <Card><CardHeader><CardTitle>Financial Summary</CardTitle></CardHeader><CardContent><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="text-center p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Total Inventory Value</p><p className="text-2xl font-bold">{formatCurrency(inventoryData.totalValue)}</p></div><div className="text-center p-4 bg-success/10 rounded-lg"><p className="text-sm text-muted-foreground">Sold Value</p><p className="text-2xl font-bold text-success">{formatCurrency(inventoryData.soldValue)}</p></div><div className="text-center p-4 bg-warning/10 rounded-lg"><p className="text-sm text-muted-foreground">Reserved Value</p><p className="text-2xl font-bold text-warning">{formatCurrency(inventoryData.reservedValue)}</p></div></div></CardContent></Card>
        </div>
      )}
      
      {selectedReport === "leads" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Leads</p><p className="text-2xl font-bold">{leadsReportData.totalLeads}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Leads by Status</p><div className="flex flex-wrap gap-2 mt-2">{Object.entries(leadsReportData.statusCounts).map(([status, count]) => <Badge key={status} variant="secondary">{status}: {count}</Badge>)}</div></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Leads by Source</p><div className="flex flex-wrap gap-2 mt-2">{Object.entries(leadsReportData.sourceCounts).map(([source, count]) => <Badge key={source} variant="outline">{source}: {count}</Badge>)}</div></CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle>All Leads</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Name</TableHead><TableHead>Source</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{leadsReportData.leadsByDate.map(lead => (<TableRow key={lead.id}><TableCell>{lead.created_at.split('T')[0]}</TableCell><TableCell>{lead.name}</TableCell><TableCell>{lead.source}</TableCell><TableCell>{lead.status}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
        </div>
      )}

      {selectedReport === "payments" && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Payments</p><p className="text-2xl font-bold">{paymentsReportData.totalPayments}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Collected</p><p className="text-2xl font-bold text-success">{formatCurrency(paymentsReportData.totalCollected)}</p></CardContent></Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">By Payment Type</p><div className="flex flex-wrap gap-2 mt-2">{Object.entries(paymentsReportData.byType).map(([type, amount]) => <Badge key={type} variant="secondary">{type}: {formatCurrency(amount)}</Badge>)}</div></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">By Payment Method</p><div className="flex flex-wrap gap-2 mt-2">{Object.entries(paymentsReportData.byMethod).map(([method, amount]) => <Badge key={method} variant="outline">{method}: {formatCurrency(amount)}</Badge>)}</div></CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle>All Payments</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Client</TableHead><TableHead>Type</TableHead><TableHead>Method</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader><TableBody>{paymentsReportData.paymentsByDate.map(p => (<TableRow key={p.id}><TableCell>{p.created_at.split('T')[0]}</TableCell><TableCell>{(p.clients as any)?.name || '-'}</TableCell><TableCell>{p.payment_type}</TableCell><TableCell>{p.payment_method}</TableCell><TableCell className="font-semibold">{formatCurrency(p.amount)}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
        </div>
      )}

    </div>
  );
}
