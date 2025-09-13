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
