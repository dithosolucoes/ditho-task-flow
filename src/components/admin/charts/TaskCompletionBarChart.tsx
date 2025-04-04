
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type CompletionChartData = {
  name: string;
  completed: number;
  pending: number;
};

type TaskCompletionBarChartProps = {
  data: CompletionChartData[];
};

export function TaskCompletionBarChart({ data }: TaskCompletionBarChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">Não há dados disponíveis</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 5,
          right: 30,
          left: 40,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={100} />
        <Tooltip />
        <Legend />
        <Bar dataKey="completed" name="Concluídas" fill="#4CAF50" />
        <Bar dataKey="pending" name="Pendentes" fill="#FFA726" />
      </BarChart>
    </ResponsiveContainer>
  );
}
