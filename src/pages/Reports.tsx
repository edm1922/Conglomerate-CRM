import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Download, FileText, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateSalesReport, SalesReportData, generateLeadSourceReport, LeadSourceReportData } from "@/services/reports";
import { useToast } from "@/hooks/use-toast";
import { LeadSourceChart } from "@/components/LeadSourceChart";
import { SalesReportChart } from "@/components/SalesReportChart";

export default function Reports() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [salesReport, setSalesReport] = useState<SalesReportData | null>(null);
  const [leadSourceReport, setLeadSourceReport] = useState<LeadSourceReportData | null>(null);
  const [activeTab, setActiveTab] = useState("sales");

  const salesReportMutation = useMutation({
    mutationFn: async () => {
      if (!dateRange?.from || !dateRange?.to) {
        throw new Error("Please select a date range.");
      }
      return generateSalesReport(dateRange.from.toISOString(), dateRange.to.toISOString());
    },
    onSuccess: (data) => {
      setSalesReport(data);
      toast({ title: "Report Generated", description: "Sales report has been successfully generated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const leadSourceReportMutation = useMutation({
    mutationFn: async () => {
      if (!dateRange?.from || !dateRange?.to) {
        throw new Error("Please select a date range.");
      }
      return generateLeadSourceReport(dateRange.from.toISOString(), dateRange.to.toISOString());
    },
    onSuccess: (data) => {
      setLeadSourceReport(data);
      toast({ title: "Report Generated", description: "Lead source report has been successfully generated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleGenerateReport = () => {
    if (activeTab === 'sales') {
      salesReportMutation.mutate();
    } else if (activeTab === 'leads') {
      leadSourceReportMutation.mutate();
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const isGenerating = salesReportMutation.isPending || leadSourceReportMutation.isPending;

  const leadSourceChartData = useMemo(() => {
    if (!leadSourceReport) return [];
    return Object.entries(leadSourceReport.leadsBySource).map(([source, count]) => ({ source, count }));
  }, [leadSourceReport]);

  const salesReportChartData = useMemo(() => {
    if (!salesReport) return [];
    return Object.entries(salesReport.salesByLot).map(([name, { total }]) => ({ name, value: total }));
  }, [salesReport]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and view sales and performance reports</p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker dateRange={dateRange} onDateChange={setDateRange} />
          <Button className="gap-2" disabled={!dateRange?.from || !dateRange?.to || isGenerating} onClick={handleGenerateReport}>
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="leads">Lead Source Report</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Report</CardTitle>
            </CardHeader>
            <CardContent>
              {salesReportMutation.isPending ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              ) : salesReport ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader><CardTitle>Total Sales</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold">{formatCurrency(salesReport.totalSales)}</p></CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Number of Sales</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold">{salesReport.numberOfSales}</p></CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader><CardTitle>Sales by Lot</CardTitle></CardHeader>
                    <CardContent>
                      <SalesReportChart data={salesReportChartData} />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <p>Your generated sales report will appear here.</p>
                    <p>Select a date range and click "Generate Report" to get started.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Lead Source Report</CardTitle>
            </CardHeader>
            <CardContent>
            {leadSourceReportMutation.isPending ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              ) : leadSourceReport ? (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader><CardTitle>Total Leads</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{leadSourceReport.totalLeads}</p></CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>Leads by Source</CardTitle></CardHeader>
                    <CardContent>
                      <LeadSourceChart data={leadSourceChartData} />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <p>Your generated lead source report will appear here.</p>
                    <p>Select a date range and click "Generate Report" to get started.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
