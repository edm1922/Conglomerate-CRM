import { supabase } from "./supabase";
import { Payment, Lead } from "@/types/entities";

export interface SalesReportData {
  totalSales: number;
  numberOfSales: number;
  salesByLot: Record<string, { total: number; count: number }>;
  payments: Payment[];
}

export interface LeadSourceReportData {
  totalLeads: number;
  leadsBySource: Record<string, number>;
}

export interface PaymentAnalyticsReportData {
  totalPayments: number;
  numberOfPayments: number;
  paymentsByMethod: Record<string, number>;
  averagePaymentAmount: number;
}

export interface FinancialSummaryReportData {
  totalRevenue: number;
  numberOfTransactions: number;
}

export interface CommissionReportData {
  totalCommission: number;
  commissionByAgent: Record<string, number>;
}

export async function generateSalesReport(startDate: string, endDate: string): Promise<SalesReportData> {
  const { data: payments, error } = await supabase
    .from('payments')
    .select(`
      *,
      lots ( block_number, lot_number )
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .eq('status', 'completed');

  if (error) {
    throw new Error(`Failed to fetch sales data: ${error.message}`);
  }

  const totalSales = payments.reduce((sum, p) => sum + p.amount, 0);
  const numberOfSales = payments.length;

  const salesByLot = payments.reduce((acc, p) => {
    const lotId = (p.lots as any)?.block_number ? `Block ${(p.lots as any).block_number}, Lot ${(p.lots as any).lot_number}` : 'Unknown Lot';
    if (!acc[lotId]) {
      acc[lotId] = { total: 0, count: 0 };
    }
    acc[lotId].total += p.amount;
    acc[lotId].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  return { totalSales, numberOfSales, salesByLot, payments: payments as Payment[] };
}

export async function generateLeadSourceReport(startDate: string, endDate: string): Promise<LeadSourceReportData> {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('source')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (error) {
    throw new Error(`Failed to fetch lead data: ${error.message}`);
  }

  const totalLeads = leads.length;
  const leadsBySource = leads.reduce((acc, lead) => {
    const source = lead.source || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return { totalLeads, leadsBySource };
}

export async function generatePaymentAnalyticsReport(startDate: string, endDate: string): Promise<PaymentAnalyticsReportData> {
  const { data: payments, error } = await supabase
    .from('payments')
    .select('amount, payment_method')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .eq('status', 'confirmed');

  if (error) {
    throw new Error(`Failed to fetch payment data: ${error.message}`);
  }

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const numberOfPayments = payments.length;
  const averagePaymentAmount = numberOfPayments > 0 ? totalPayments / numberOfPayments : 0;

  const paymentsByMethod = payments.reduce((acc, p) => {
    const method = p.payment_method || 'Unknown';
    acc[method] = (acc[method] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);

  return { totalPayments, numberOfPayments, paymentsByMethod, averagePaymentAmount };
}

export async function generateFinancialSummaryReport(startDate: string, endDate: string): Promise<FinancialSummaryReportData> {
  const { data: payments, error } = await supabase
    .from('payments')
    .select('amount')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .eq('status', 'confirmed');

  if (error) {
    throw new Error(`Failed to fetch payment data: ${error.message}`);
  }

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const numberOfTransactions = payments.length;

  return { totalRevenue, numberOfTransactions };
}

export async function generateCommissionReport(startDate: string, endDate: string): Promise<CommissionReportData> {
  const { data: payments, error } = await supabase
    .from('payments')
    .select(`
      amount,
      commission,
      client:clients ( lead:leads ( agent:profiles ( full_name ) ) )
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .eq('status', 'confirmed')
    .not('commission', 'is', null);

  if (error) {
    throw new Error(`Failed to fetch commission data: ${error.message}`);
  }

  const totalCommission = payments.reduce((sum, p) => sum + (p.commission || 0), 0);

  const commissionByAgent = payments.reduce((acc, p) => {
    const agentName = (p.client as any)?.lead?.agent?.full_name || 'Unknown Agent';
    acc[agentName] = (acc[agentName] || 0) + (p.commission || 0);
    return acc;
  }, {} as Record<string, number>);

  return { totalCommission, commissionByAgent };
}
