
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, ListTodo, CalendarClock } from "lucide-react";
import { TaskCard } from "@/components/tasks/TaskCard";
import { useToast } from "@/hooks/use-toast";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/types/task";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    useTasksQuery, 
    useToggleTaskCompletionMutation 
  } = useTasks();
  
  const tasksQuery = useTasksQuery();
  const toggleTaskMutation = useToggleTaskCompletionMutation();

  const handleTaskComplete = (id: string, completed: boolean) => {
    toggleTaskMutation.mutate({ id, completed }, {
      onSuccess: () => {
        toast({
          title: completed ? "Tarefa concluída!" : "Tarefa reaberta",
          description: "Status da tarefa atualizado com sucesso.",
        });
      }
    });
  };

  const handleTaskClick = (task: Task) => {
    navigate("/tasks");
  };

  // Dados do carregamento
  if (tasksQuery.isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="mt-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Tratamento de erro
  if (tasksQuery.isError) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="text-center py-10">
          <p className="text-red-500 text-lg">
            Erro ao carregar tarefas. Tente novamente mais tarde.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const tasks = tasksQuery.data || [];
  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  // Tarefas para hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  });

  // Tarefas futuras
  const futureTasks = pendingTasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() > today.getTime();
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
              {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}% do total
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
            <div className="text-2xl font-bold">{futureTasks.length}</div>
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
        {tasks.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Nenhuma tarefa disponível.</p>
            </CardContent>
          </Card>
        ) : (
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
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
