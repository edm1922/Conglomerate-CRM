import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialSummaryProps {
  data: {
    totalRevenue: number;
    numberOfTransactions: number;
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
};

export function FinancialSummary({ data }: FinancialSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Number of Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data.numberOfTransactions}</p>
        </CardContent>
      </Card>
    </div>
  );
}
