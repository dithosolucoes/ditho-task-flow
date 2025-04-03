
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TaskList } from "@/components/tasks/TaskList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task } from "@/types/task";
import { useTasks } from "@/hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Tasks = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const { 
    useTasksQuery, 
    useAddTaskMutation, 
    useToggleTaskCompletionMutation,
    useDeleteTaskMutation 
  } = useTasks();
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const tasksQuery = useTasksQuery();
  const toggleTaskMutation = useToggleTaskCompletionMutation();
  const deleteTaskMutation = useDeleteTaskMutation();
  const addTaskMutation = useAddTaskMutation();

  const handleTaskComplete = (id: string, completed: boolean) => {
    toggleTaskMutation.mutate({ id, completed });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleAddTask = (task: Omit<Task, "id" | "createdAt">) => {
    addTaskMutation.mutate(task);
  };

  const handleDeleteTask = (id: string) => {
    deleteTaskMutation.mutate(id);
  };

  // Dados para as abas
  const tasks = tasksQuery.data || [];
  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  if (!isAuthenticated && !authLoading) {
    return (
      <DashboardLayout title="Tarefas">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Não autenticado</AlertTitle>
          <AlertDescription>
            Você precisa estar logado para visualizar e gerenciar suas tarefas.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate("/login")}>Ir para o Login</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (tasksQuery.isLoading || authLoading) {
    return (
      <DashboardLayout title="Tarefas">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (tasksQuery.isError) {
    return (
      <DashboardLayout title="Tarefas">
        <div className="text-center py-10">
          <p className="text-red-500 text-lg">
            Erro ao carregar tarefas. Tente novamente mais tarde.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Tarefas">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Todas ({tasks.length})</TabsTrigger>
          <TabsTrigger value="pending">Pendentes ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Concluídas ({completedTasks.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <TaskList
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onTaskComplete={handleTaskComplete}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
          />
        </TabsContent>
        
        <TabsContent value="pending">
          <TaskList
            tasks={pendingTasks}
            onTaskClick={handleTaskClick}
            onTaskComplete={handleTaskComplete}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
          />
        </TabsContent>
        
        <TabsContent value="completed">
          <TaskList
            tasks={completedTasks}
            onTaskClick={handleTaskClick}
            onTaskComplete={handleTaskComplete}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Tasks;
