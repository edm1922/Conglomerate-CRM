
import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { listLeads } from "@/services/leads";

const chartConfig = {
  leads: {
    label: "Leads",
    color: "hsl(var(--primary))",
  },
};

export default function Reports() {
  const { data: leadsData = [], isLoading: leadsLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: listLeads,
  });

  const leadsBySource = useMemo(() => {
    const sourceCounts: { [key: string]: number } = {};
    for (const lead of leadsData) {
      sourceCounts[lead.source] = (sourceCounts[lead.source] || 0) + 1;
    }
    return Object.entries(sourceCounts).map(([source, count]) => ({ source, count }));
  }, [leadsData]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
      <p className="text-muted-foreground">
        Gain insights into your sales and performance.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Leads by Source</CardTitle>
        </CardHeader>
        <CardContent>
          {leadsLoading ? (
            <p>Loading chart data...</p>
          ) : (
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart data={leadsBySource}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="source" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="count" fill="var(--color-leads)" radius={4} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
