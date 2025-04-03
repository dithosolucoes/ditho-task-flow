
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, ListTodo, CalendarClock } from "lucide-react";
import { TaskCard } from "@/components/tasks/TaskCard";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockTasks = [
  {
    id: "1",
    title: "Finalizar relatório mensal",
    description: "Completar o relatório de vendas do mês de agosto",
    completed: false,
    dueDate: new Date(2023, 8, 28),
    priority: "high" as const,
    createdAt: new Date(2023, 8, 20),
  },
  {
    id: "2",
    title: "Reunião com equipe de marketing",
    description: "Discutir a nova campanha de lançamento do produto",
    completed: false,
    dueDate: new Date(2023, 8, 25),
    priority: "medium" as const,
    createdAt: new Date(2023, 8, 19),
  },
  {
    id: "3",
    title: "Atualizar documentação",
    description: "Revisar e atualizar a documentação do projeto",
    completed: true,
    dueDate: new Date(2023, 8, 22),
    priority: "low" as const,
    createdAt: new Date(2023, 8, 18),
  },
  {
    id: "4",
    title: "Preparar apresentação",
    description: "Criar slides para a apresentação na conferência",
    completed: false,
    dueDate: new Date(2023, 8, 30),
    priority: "medium" as const,
    createdAt: new Date(2023, 8, 21),
  },
];

const Dashboard = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleTaskComplete = (id: string, completed: boolean) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed } : task
      )
    );
    
    toast({
      title: completed ? "Tarefa concluída!" : "Tarefa reaberta",
      description: "Status da tarefa atualizado com sucesso.",
    });
  };

  const handleTaskClick = (task: any) => {
    navigate("/tasks");
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const today = new Date();
    return (
      task.dueDate.getDate() === today.getDate() &&
      task.dueDate.getMonth() === today.getMonth() &&
      task.dueDate.getFullYear() === today.getFullYear()
    );
  });

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingTasks.length} pendentes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((completedTasks.length / tasks.length) * 100) || 0}% do total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Para Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayTasks.filter(t => !t.completed).length} pendentes para hoje
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingTasks.filter(t => t.dueDate && t.dueDate > new Date()).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Tarefas com prazo futuro
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4 text-ditho-navy">Tarefas para Hoje</h2>
        {todayTasks.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Nenhuma tarefa para hoje!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {todayTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleTaskComplete}
                onClick={handleTaskClick}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4 text-ditho-navy">Tarefas Recentes</h2>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {tasks.slice(0, 3).map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={handleTaskComplete}
              onClick={handleTaskClick}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
