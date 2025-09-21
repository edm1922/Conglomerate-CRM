import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface CommissionReportProps {
  data: {
    name: string;
    value: number;
  }[];
}

export function CommissionReport({ data }: CommissionReportProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" name="Commission" />
      </BarChart>
    </ResponsiveContainer>
  );
}
