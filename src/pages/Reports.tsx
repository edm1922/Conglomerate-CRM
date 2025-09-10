import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DollarSign,
  Users,
  Building,
  Calendar,
  Printer,
} from "lucide-react";

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState("daily-sales");
  const [selectedDate, setSelectedDate] = useState("2024-01-15");

  const dailySalesData = {
    date: "2024-01-15",
    totalSales: 850000,
    transactions: 3,
    leadsGenerated: 5,
    appointmentsHeld: 4,
    followUps: 8,
    reservations: 2,
    fullPayments: 1,
    details: [
      {
        time: "9:00 AM",
        activity: "Site Visit",
        client: "Anna Rodriguez",
        outcome: "Interested in Block 1",
        amount: 0,
      },
      {
        time: "10:30 AM",
        activity: "Payment Collection",
        client: "Sofia Reyes",
        outcome: "Full Payment",
        amount: 600000,
      },
      {
        time: "2:00 PM",
        activity: "Follow-up Call",
        client: "Maria Santos",
        outcome: "Scheduled Site Visit",
        amount: 0,
      },
      {
        time: "3:30 PM",
        activity: "New Lead",
        client: "Pedro Garcia",
        outcome: "Facebook Inquiry",
        amount: 0,
      },
      {
        time: "4:00 PM",
        activity: "Payment Collection",
        client: "Carlos Miranda",
        outcome: "Additional Payment",
        amount: 250000,
      },
    ],
  };

  const inventoryData = {
    totalLots: 80,
    available: 45,
    reserved: 12,
    sold: 23,
    byBlock: [
      { block: "Block 1", total: 20, available: 15, reserved: 3, sold: 2 },
      { block: "Block 2", total: 20, available: 12, reserved: 4, sold: 4 },
      { block: "Block 3", total: 20, available: 8, reserved: 3, sold: 9 },
      { block: "Block 4", total: 20, available: 10, reserved: 2, sold: 8 },
    ],
    totalValue: 48000000,
    soldValue: 17250000,
    reservedValue: 7920000,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Available: "success",
      Reserved: "warning",
      Sold: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    );
  };

  const reportTypes = [
    { id: "daily-sales", name: "Daily Sales Report", icon: BarChart3 },
    { id: "inventory", name: "Inventory Report", icon: Building },
    { id: "leads", name: "Leads Report", icon: Users },
    { id: "payments", name: "Payments Report", icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate and view business reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reportDate">Date</Label>
              <Input
                id="reportDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Sales Report */}
      {selectedReport === "daily-sales" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="text-2xl font-bold">{formatCurrency(dailySalesData.totalSales)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-2xl font-bold">{dailySalesData.transactions}</p>
                  </div>
                  <FileText className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">New Leads</p>
                    <p className="text-2xl font-bold">{dailySalesData.leadsGenerated}</p>
                  </div>
                  <Users className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Appointments</p>
                    <p className="text-2xl font-bold">{dailySalesData.appointmentsHeld}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-warning" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Details */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailySalesData.details.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell>{activity.time}</TableCell>
                      <TableCell>{activity.activity}</TableCell>
                      <TableCell>{activity.client}</TableCell>
                      <TableCell>{activity.outcome}</TableCell>
                      <TableCell className="font-semibold">
                        {activity.amount > 0 ? formatCurrency(activity.amount) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inventory Report */}
      {selectedReport === "inventory" && (
        <div className="space-y-6">
          {/* Inventory Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Lots</p>
                  <p className="text-2xl font-bold">{inventoryData.totalLots}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold text-success">{inventoryData.available}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Reserved</p>
                  <p className="text-2xl font-bold text-warning">{inventoryData.reserved}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Sold</p>
                  <p className="text-2xl font-bold text-destructive">{inventoryData.sold}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory by Block */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory by Block</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Block</TableHead>
                    <TableHead>Total Lots</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead>Sold</TableHead>
                    <TableHead>Occupancy Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryData.byBlock.map((block, index) => {
                    const occupancyRate = ((block.reserved + block.sold) / block.total * 100).toFixed(1);
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{block.block}</TableCell>
                        <TableCell>{block.total}</TableCell>
                        <TableCell>
                          <Badge variant="success">{block.available}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="warning">{block.reserved}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{block.sold}</Badge>
                        </TableCell>
                        <TableCell>{occupancyRate}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Inventory Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(inventoryData.totalValue)}</p>
                </div>
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Sold Value</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(inventoryData.soldValue)}</p>
                </div>
                <div className="text-center p-4 bg-warning/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Reserved Value</p>
                  <p className="text-2xl font-bold text-warning">{formatCurrency(inventoryData.reservedValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Other Report Types Placeholder */}
      {(selectedReport === "leads" || selectedReport === "payments") && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Report Coming Soon</h3>
              <p className="text-muted-foreground">
                {selectedReport === "leads" ? "Leads analysis" : "Payment analytics"} report will be available in the next update.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
