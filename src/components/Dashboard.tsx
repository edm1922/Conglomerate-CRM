import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listLeads } from "@/services/leads";
import { listClients } from "@/services/clients";
import { listLots } from "@/services/lots";
import { listPayments } from "@/services/payments";
import { listAppointments } from "@/services/appointments";
import { useRealtimeStore } from "@/hooks/useRealtimeStore";
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
  console.log('Dashboard component rendering...');
  
  try {
    useRealtimeStore();
  } catch (error) {
    console.error('Error in useRealtimeStore:', error);
  }
  
  // Fetch real data from database
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: listLeads,
  });
  
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: listClients,
  });
  
  const { data: lots = [] } = useQuery({
    queryKey: ["lots"],
    queryFn: listLots,
  });
  
  const { data: payments = [] } = useQuery({
    queryKey: ["payments"],
    queryFn: listPayments,
  });
  
  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: listAppointments,
  });

  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayLeads = leads.filter(lead => lead.created_at.startsWith(today));
    const todayAppointments = appointments.filter(apt => apt.scheduled_date === today);
    const todayPayments = payments.filter(p => p.created_at.startsWith(today) && p.status === 'confirmed');
    
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const newClientsThisWeek = clients.filter(c => {
      const clientDate = new Date(c.created_at);
      return clientDate >= startOfWeek && clientDate <= endOfWeek;
    });

    const totalPaymentsToday = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      leads: todayLeads.length,
      appointments: todayAppointments.length,
      payments: todayPayments.length,
      newClients: newClientsThisWeek.length,
      totalPayments: totalPaymentsToday,
    };
  }, [leads, appointments, payments, clients]);

  const recentLeads = useMemo(() => {
    return leads.slice(0, 3);
  }, [leads]);

  const todayAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.scheduled_date === today).slice(0, 3);
  }, [appointments]);

  const inventoryStatus = useMemo(() => {
    const available = lots.filter(l => l.status === 'available').length;
    const reserved = lots.filter(l => l.status === 'reserved').length;
    const sold = lots.filter(l => l.status === 'sold').length;
    return {
      available,
      reserved,
      sold,
      total: lots.length
    };
  }, [lots]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of today's activities and key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Leads</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.leads}</div>
            <p className="text-xs opacity-80">Newly created today</p>
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
            <p className="text-xs text-muted-foreground">₱{todayStats.totalPayments.toLocaleString()} collected today</p>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium">{lead.name}</h4>
                    <p className="text-sm text-muted-foreground">{lead.source}</p>
                  </div>
                  <Badge variant={lead.status === "new" ? "default" : "secondary"}>{lead.status}</Badge>
                </div>
              ))}
            </div>
            <Button asChild variant="outline" className="w-full mt-4"><Link to="/leads">View All Leads</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                  <div className="flex-shrink-0"><Clock className="w-4 h-4 text-muted-foreground" /></div>
                  <div className="flex-1">
                    <h4 className="font-medium">{(appointment.clients as any)?.name || 'Unknown Client'}</h4>
                    <p className="text-sm text-muted-foreground">{appointment.type}</p>
                  </div>
                  <Badge variant="outline">{appointment.scheduled_time}</Badge>
                </div>
              ))}
            </div>
            <Button asChild variant="outline" className="w-full mt-4"><Link to="/calendar">View Calendar</Link></Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building className="w-5 h-5" />Inventory Overview</CardTitle>
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
          <Button asChild variant="outline" className="w-full mt-4"><Link to="/inventory">Manage Inventory</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
