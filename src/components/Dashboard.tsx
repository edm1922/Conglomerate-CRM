import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export function Dashboard() {
  const todayStats = {
    leads: 12,
    appointments: 3,
    payments: 5,
    newClients: 2,
  };

  const recentLeads = [
    { name: "Maria Santos", source: "Facebook", status: "New", time: "2 hrs ago" },
    { name: "Juan Dela Cruz", source: "Walk-in", status: "Site Visit", time: "4 hrs ago" },
    { name: "Anna Rodriguez", source: "Referral", status: "Contacted", time: "6 hrs ago" },
  ];

  const todayAppointments = [
    { client: "Carlos Miranda", type: "Site Visit", time: "10:00 AM", lot: "Block 5, Lot 12" },
    { client: "Sofia Reyes", type: "Follow-up", time: "2:00 PM", lot: "Block 3, Lot 8" },
    { client: "Miguel Torres", type: "Contract Signing", time: "4:00 PM", lot: "Block 7, Lot 3" },
  ];

  const inventoryStatus = {
    available: 45,
    reserved: 12,
    sold: 23,
    total: 80,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of today's activities and key metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Leads</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.leads}</div>
            <p className="text-xs opacity-80">+2 from yesterday</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-accent text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.appointments}</div>
            <p className="text-xs opacity-80">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payments</CardTitle>
            <span className="text-lg font-bold text-success">₱</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.payments}</div>
            <p className="text-xs text-muted-foreground">₱245,000 collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Clients</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.newClients}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Recent Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.map((lead, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium">{lead.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {lead.source} • {lead.time}
                    </p>
                  </div>
                  <Badge
                    variant={
                      lead.status === "New"
                        ? "default"
                        : lead.status === "Site Visit"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {lead.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Leads
            </Button>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                  <div className="flex-shrink-0">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{appointment.client}</h4>
                    <p className="text-sm text-muted-foreground">
                      {appointment.type} • {appointment.lot}
                    </p>
                  </div>
                  <Badge variant="outline">{appointment.time}</Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Inventory Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success">{inventoryStatus.available}</div>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
            <div className="text-center p-4 bg-warning/10 rounded-lg">
              <div className="text-2xl font-bold text-warning">{inventoryStatus.reserved}</div>
              <p className="text-sm text-muted-foreground">Reserved</p>
            </div>
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <div className="text-2xl font-bold text-destructive">{inventoryStatus.sold}</div>
              <p className="text-sm text-muted-foreground">Sold</p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">{inventoryStatus.total}</div>
              <p className="text-sm text-muted-foreground">Total Lots</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}