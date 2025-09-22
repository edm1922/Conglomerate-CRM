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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-2">Dashboard</h1>
        <p className="text-lg text-[hsl(var(--muted-foreground))]">Overview of today's activities and key metrics</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-professional bg-gradient-to-br from-[hsl(var(--professional-blue))] to-[hsl(var(--professional-blue-dark))] text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Today's Leads</CardTitle>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{todayStats.leads}</div>
            <p className="text-xs opacity-80">New inquiries today</p>
          </CardContent>
        </Card>

        <Card className="card-professional bg-gradient-to-br from-[hsl(var(--professional-green))] to-[hsl(142_76%_31%)] text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Appointments</CardTitle>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{todayStats.appointments}</div>
            <p className="text-xs opacity-80">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Payments</CardTitle>
            <div className="w-8 h-8 bg-[hsl(var(--professional-green))]/10 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-[hsl(var(--professional-green))]">₱</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[hsl(var(--foreground))] mb-1">{todayStats.payments}</div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">₱{todayStats.totalPayments.toLocaleString()} collected today</p>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">New Clients</CardTitle>
            <div className="w-8 h-8 bg-[hsl(var(--professional-green))]/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-[hsl(var(--professional-green))]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[hsl(var(--foreground))] mb-1">{todayStats.newClients}</div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="card-professional">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-[hsl(var(--professional-blue))]/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-[hsl(var(--professional-blue))]" />
              </div>
              <div>
                <h3 className="font-bold text-[hsl(var(--foreground))]">Recent Leads</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] font-normal">Latest inquiries</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentLeads.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))]">No recent leads</p>
              </div>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 border border-[hsl(var(--border))] rounded-lg hover:shadow-md transition-shadow">
                  <div>
                    <h4 className="font-medium text-[hsl(var(--foreground))]">{lead.name}</h4>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{lead.source}</p>
                  </div>
                  <Badge 
                    variant={lead.status === "new" ? "default" : "secondary"}
                    className={lead.status === "new" ? "bg-[hsl(var(--professional-blue))] text-white" : ""}
                  >
                    {lead.status}
                  </Badge>
                </div>
              ))
            )}
            <Button asChild variant="outline" className="w-full mt-6 btn-secondary">
              <Link to="/leads">View All Leads</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-[hsl(var(--professional-green))]/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[hsl(var(--professional-green))]" />
              </div>
              <div>
                <h3 className="font-bold text-[hsl(var(--foreground))]">Today's Schedule</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] font-normal">Upcoming appointments</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))]">No appointments today</p>
              </div>
            ) : (
              todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center gap-4 p-4 border border-[hsl(var(--border))] rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-[hsl(var(--professional-green))]/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-[hsl(var(--professional-green))]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[hsl(var(--foreground))]">{(appointment.clients as any)?.name || 'Unknown Client'}</h4>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{appointment.type}</p>
                  </div>
                  <Badge variant="outline" className="text-[hsl(var(--professional-blue))] border-[hsl(var(--professional-blue))]">
                    {appointment.scheduled_time}
                  </Badge>
                </div>
              ))
            )}
            <Button asChild variant="outline" className="w-full mt-6 btn-secondary">
              <Link to="/calendar">View Calendar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Overview */}
      <Card className="card-professional">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-[hsl(var(--professional-blue))]/10 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-[hsl(var(--professional-blue))]" />
            </div>
            <div>
              <h3 className="font-bold text-[hsl(var(--foreground))]">Inventory Overview</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] font-normal">Property status breakdown</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-[hsl(var(--professional-green))]/10 rounded-lg border border-[hsl(var(--professional-green))]/20">
              <div className="text-3xl font-bold text-[hsl(var(--professional-green))] mb-2">{inventoryStatus.available}</div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">Available</p>
            </div>
            <div className="text-center p-6 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="text-3xl font-bold text-orange-600 mb-2">{inventoryStatus.reserved}</div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">Reserved</p>
            </div>
            <div className="text-center p-6 bg-[hsl(var(--professional-red))]/10 rounded-lg border border-[hsl(var(--professional-red))]/20">
              <div className="text-3xl font-bold text-[hsl(var(--professional-red))] mb-2">{inventoryStatus.sold}</div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">Sold</p>
            </div>
            <div className="text-center p-6 bg-[hsl(var(--professional-blue))]/10 rounded-lg border border-[hsl(var(--professional-blue))]/20">
              <div className="text-3xl font-bold text-[hsl(var(--professional-blue))] mb-2">{inventoryStatus.total}</div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">Total Lots</p>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full mt-6 btn-secondary">
            <Link to="/inventory">Manage Inventory</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
