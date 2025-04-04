
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

type PriorityChartData = {
  name: string;
  value: number;
};

type TaskPriorityPieChartProps = {
  data: PriorityChartData[];
};

const COLORS = ["#0088FE", "#FFBB28", "#FF8042"];

export function TaskPriorityPieChart({ data }: TaskPriorityPieChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">Não há dados disponíveis</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
