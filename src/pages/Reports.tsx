import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Download, FileText, Loader2, FileSpreadsheet, BarChart3, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateSalesReport, type SalesReportData, generateLeadSourceReport, type LeadSourceReportData, generatePaymentAnalyticsReport, type PaymentAnalyticsReportData, generateFinancialSummaryReport, type FinancialSummaryReportData, generateCommissionReport, type CommissionReportData } from "@/services/reports";
import { generatePricingReport, type PricingReportData } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { LeadSourceChart } from "@/components/LeadSourceChart";
import { SalesReportChart } from "@/components/SalesReportChart";
import { PricingReportChart } from "@/components/PricingReportChart";
import { PaymentAnalyticsChart } from "@/components/PaymentAnalyticsChart";
import { FinancialSummary } from "@/components/FinancialSummary";
import { CommissionReport } from "@/components/CommissionReport";

export default function Reports() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [salesReport, setSalesReport] = useState<SalesReportData | null>(null);
  const [leadSourceReport, setLeadSourceReport] = useState<LeadSourceReportData | null>(null);
  const [pricingReport, setPricingReport] = useState<PricingReportData | null>(null);
  const [paymentAnalyticsReport, setPaymentAnalyticsReport] = useState<PaymentAnalyticsReportData | null>(null);
  const [financialSummaryReport, setFinancialSummaryReport] = useState<FinancialSummaryReportData | null>(null);
  const [commissionReport, setCommissionReport] = useState<CommissionReportData | null>(null);
  const [activeTab, setActiveTab] = useState("sales");

  const salesReportMutation = useMutation({
    mutationFn: async () => {
      if (!dateRange?.from || !dateRange?.to) {
        throw new Error("Please select a date range.");
      }
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      return generateSalesReport(dateRange.from.toISOString(), toDate.toISOString());
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
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      return generateLeadSourceReport(dateRange.from.toISOString(), toDate.toISOString());
    },
    onSuccess: (data) => {
      setLeadSourceReport(data);
      toast({ title: "Report Generated", description: "Lead source report has been successfully generated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const pricingReportMutation = useMutation({
    mutationFn: generatePricingReport,
    onSuccess: (data) => {
      setPricingReport(data);
      toast({ title: "Report Generated", description: "Pricing report has been successfully generated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const paymentAnalyticsReportMutation = useMutation({
    mutationFn: async () => {
      if (!dateRange?.from || !dateRange?.to) {
        throw new Error("Please select a date range.");
      }
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      return generatePaymentAnalyticsReport(dateRange.from.toISOString(), toDate.toISOString());
    },
    onSuccess: (data) => {
      setPaymentAnalyticsReport(data);
      toast({ title: "Report Generated", description: "Payment analytics report has been successfully generated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const financialSummaryReportMutation = useMutation({
    mutationFn: async () => {
      if (!dateRange?.from || !dateRange?.to) {
        throw new Error("Please select a date range.");
      }
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      return generateFinancialSummaryReport(dateRange.from.toISOString(), toDate.toISOString());
    },
    onSuccess: (data) => {
      setFinancialSummaryReport(data);
      toast({ title: "Report Generated", description: "Financial summary report has been successfully generated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const commissionReportMutation = useMutation({
    mutationFn: async () => {
      if (!dateRange?.from || !dateRange?.to) {
        throw new Error("Please select a date range.");
      }
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      return generateCommissionReport(dateRange.from.toISOString(), toDate.toISOString());
    },
    onSuccess: (data) => {
      setCommissionReport(data);
      toast({ title: "Report Generated", description: "Commission report has been successfully generated." });
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
    } else if (activeTab === 'pricing') {
      pricingReportMutation.mutate();
    } else if (activeTab === 'payments') {
      paymentAnalyticsReportMutation.mutate();
    } else if (activeTab === 'financial-summary') {
      financialSummaryReportMutation.mutate();
    } else if (activeTab === 'commission') {
      commissionReportMutation.mutate();
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast({ title: "Error", description: "No data to export", variant: "destructive" });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values that might contain commas by wrapping in quotes
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    
    toast({ title: "Success", description: `${filename}.csv exported successfully` });
  };

  const handleExportReport = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    if (activeTab === 'sales' && salesReport) {
      const exportData = salesReport.payments.map(payment => ({
        'Payment ID': payment.id,
        'Amount': payment.amount,
        'Payment Method': payment.payment_method,
        'Status': payment.status,
        'Date': new Date(payment.created_at).toLocaleDateString(),
        'Client': payment.client_id,
        'Lot': payment.lot_id
      }));
      exportToCSV(exportData, `sales-report-${currentDate}`);
    } else if (activeTab === 'leads' && leadSourceReport) {
      const exportData = Object.entries(leadSourceReport.leadsBySource).map(([source, count]) => ({
        'Lead Source': source,
        'Count': count
      }));
      exportToCSV(exportData, `lead-source-report-${currentDate}`);
    } else if (activeTab === 'pricing' && pricingReport) {
      const exportData = Object.entries(pricingReport.priceDistribution).map(([range, count]) => ({
        'Price Range': range,
        'Count': count
      }));
      exportToCSV(exportData, `pricing-report-${currentDate}`);
    } else if (activeTab === 'payments' && paymentAnalyticsReport) {
      const exportData = Object.entries(paymentAnalyticsReport.paymentsByMethod).map(([method, amount]) => ({
        'Payment Method': method,
        'Total Amount': amount
      }));
      exportToCSV(exportData, `payment-analytics-${currentDate}`);
    } else if (activeTab === 'financial-summary' && financialSummaryReport) {
      const exportData = [{
        'Total Revenue': financialSummaryReport.totalRevenue,
        'Number of Transactions': financialSummaryReport.numberOfTransactions
      }];
      exportToCSV(exportData, `financial-summary-${currentDate}`);
    } else if (activeTab === 'commission' && commissionReport) {
      const exportData = Object.entries(commissionReport.commissionByAgent).map(([agent, commission]) => ({
        'Agent': agent,
        'Commission': commission
      }));
      exportToCSV(exportData, `commission-report-${currentDate}`);
    } else {
      toast({ title: "Error", description: "No report data to export", variant: "destructive" });
    }
  };

  const isGenerating = salesReportMutation.isPending || leadSourceReportMutation.isPending || pricingReportMutation.isPending || paymentAnalyticsReportMutation.isPending || financialSummaryReportMutation.isPending || commissionReportMutation.isPending;

  const leadSourceChartData = useMemo(() => {
    if (!leadSourceReport) return [];
    return Object.entries(leadSourceReport.leadsBySource).map(([source, count]) => ({ source, count }));
  }, [leadSourceReport]);

  const salesReportChartData = useMemo(() => {
    if (!salesReport) return [];
    return Object.entries(salesReport.salesByLot).map(([name, { total }]) => ({ name, value: total }));
  }, [salesReport]);

  const pricingReportChartData = useMemo(() => {
    if (!pricingReport) return [];
    return Object.entries(pricingReport.priceDistribution).map(([name, value]) => ({ name, value }));
  }, [pricingReport]);

  const paymentAnalyticsChartData = useMemo(() => {
    if (!paymentAnalyticsReport) return [];
    return Object.entries(paymentAnalyticsReport.paymentsByMethod).map(([name, value]) => ({ name, value }));
  }, [paymentAnalyticsReport]);

  const commissionReportChartData = useMemo(() => {
    if (!commissionReport) return [];
    return Object.entries(commissionReport.commissionByAgent).map(([name, value]) => ({ name, value }));
  }, [commissionReport]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-2">Reports & Analytics</h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))]">Generate and view sales and performance reports</p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker dateRange={dateRange} onDateChange={setDateRange} />
          <Button className="gap-2 btn-primary" disabled={isGenerating} onClick={handleGenerateReport}>
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Generate Report
          </Button>
          <Button 
            variant="outline" 
            className="gap-2 btn-secondary" 
            onClick={handleExportReport}
            disabled={!salesReport && !leadSourceReport && !pricingReport && !paymentAnalyticsReport && !financialSummaryReport && !commissionReport}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales" onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm rounded-lg p-1">
          <TabsTrigger value="sales" className="data-[state=active]:bg-[hsl(var(--professional-blue))] data-[state=active]:text-white">Sales Report</TabsTrigger>
          <TabsTrigger value="leads" className="data-[state=active]:bg-[hsl(var(--professional-blue))] data-[state=active]:text-white">Lead Source</TabsTrigger>
          <TabsTrigger value="pricing" className="data-[state=active]:bg-[hsl(var(--professional-blue))] data-[state=active]:text-white">Pricing</TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-[hsl(var(--professional-blue))] data-[state=active]:text-white">Payments</TabsTrigger>
          <TabsTrigger value="financial-summary" className="data-[state=active]:bg-[hsl(var(--professional-blue))] data-[state=active]:text-white">Financial</TabsTrigger>
          <TabsTrigger value="commission" className="data-[state=active]:bg-[hsl(var(--professional-blue))] data-[state=active]:text-white">Commission</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <Card className="card-professional">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[hsl(var(--professional-blue))]/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-[hsl(var(--professional-blue))]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Sales Report</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] font-normal">Revenue and sales performance</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {salesReportMutation.isPending ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-[hsl(var(--professional-blue))] mx-auto mb-4" />
                    <p className="text-[hsl(var(--muted-foreground))]">Generating sales report...</p>
                  </div>
                </div>
              ) : salesReport ? (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Card className="border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                      <CardHeader className="pb-3"><CardTitle className="text-lg text-[hsl(var(--foreground))]">Total Sales</CardTitle></CardHeader>
                      <CardContent><p className="text-3xl font-bold text-[hsl(var(--professional-green))]">{formatCurrency(salesReport.totalSales)}</p></CardContent>
                    </Card>
                    <Card className="border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                      <CardHeader className="pb-3"><CardTitle className="text-lg text-[hsl(var(--foreground))]">Number of Sales</CardTitle></CardHeader>
                      <CardContent><p className="text-3xl font-bold text-[hsl(var(--professional-blue))]">{salesReport.numberOfSales}</p></CardContent>
                    </Card>
                  </div>
                  <Card className="border border-[hsl(var(--border))]">
                    <CardHeader className="pb-3"><CardTitle className="text-lg text-[hsl(var(--foreground))]">Sales by Lot</CardTitle></CardHeader>
                    <CardContent>
                      <SalesReportChart data={salesReportChartData} />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-[hsl(var(--border))] rounded-lg">
                  <div className="text-center text-[hsl(var(--muted-foreground))]">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-medium mb-2">Your generated sales report will appear here.</p>
                    <p className="text-sm">Select a date range and click "Generate Report" to get started.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="leads">
          <Card className="card-professional">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[hsl(var(--professional-green))]/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-[hsl(var(--professional-green))]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Lead Source Report</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] font-normal">Track lead generation sources</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
            {leadSourceReportMutation.isPending ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-[hsl(var(--professional-green))] mx-auto mb-4" />
                    <p className="text-[hsl(var(--muted-foreground))]">Generating lead source report...</p>
                  </div>
                </div>
              ) : leadSourceReport ? (
                <div className="grid grid-cols-2 gap-6">
                  <Card className="border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                    <CardHeader className="pb-3"><CardTitle className="text-lg text-[hsl(var(--foreground))]">Total Leads</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-[hsl(var(--professional-green))]">{leadSourceReport.totalLeads}</p></CardContent>
                  </Card>
                  <Card className="border border-[hsl(var(--border))]">
                    <CardHeader className="pb-3"><CardTitle className="text-lg text-[hsl(var(--foreground))]">Leads by Source</CardTitle></CardHeader>
                    <CardContent>
                      <LeadSourceChart data={leadSourceChartData} />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-[hsl(var(--border))] rounded-lg">
                  <div className="text-center text-[hsl(var(--muted-foreground))]">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-medium mb-2">Your generated lead source report will appear here.</p>
                    <p className="text-sm">Select a date range and click "Generate Report" to get started.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Report</CardTitle>
            </CardHeader>
            <CardContent>
              {pricingReportMutation.isPending ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              ) : pricingReport ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader><CardTitle>Total Lots</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold">{pricingReport.totalLots}</p></CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Average Price</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold">{formatCurrency(pricingReport.averagePrice)}</p></CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Average Price per SqM</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold">{formatCurrency(pricingReport.averagePricePerSqm)}</p></CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader><CardTitle>Price Distribution</CardTitle></CardHeader>
                    <CardContent>
                      <PricingReportChart data={pricingReportChartData} />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <p>Your generated pricing report will appear here.</p>
                    <p>Click "Generate Report" to get started.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentAnalyticsReportMutation.isPending ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              ) : paymentAnalyticsReport ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader><CardTitle>Total Collected</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold">{formatCurrency(paymentAnalyticsReport.totalPayments)}</p></CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Number of Payments</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold">{paymentAnalyticsReport.numberOfPayments}</p></CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Average Payment</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold">{formatCurrency(paymentAnalyticsReport.averagePaymentAmount)}</p></CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader><CardTitle>Payments by Method</CardTitle></CardHeader>
                    <CardContent>
                      <PaymentAnalyticsChart data={paymentAnalyticsChartData} />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <p>Your generated payment analytics report will appear here.</p>
                    <p>Select a date range and click "Generate Report" to get started.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="financial-summary">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {financialSummaryReportMutation.isPending ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              ) : financialSummaryReport ? (
                <FinancialSummary data={financialSummaryReport} />
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <p>Your generated financial summary report will appear here.</p>
                    <p>Select a date range and click "Generate Report" to get started.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="commission">
          <Card>
            <CardHeader>
              <CardTitle>Commission Report</CardTitle>
            </CardHeader>
            <CardContent>
              {commissionReportMutation.isPending ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              ) : commissionReport ? (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader><CardTitle>Total Commission</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{formatCurrency(commissionReport.totalCommission)}</p></CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>Commission by Agent</CardTitle></CardHeader>
                    <CardContent>
                      <CommissionReport data={commissionReportChartData} />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <p>Your generated commission report will appear here.</p>
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
