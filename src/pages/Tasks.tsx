
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TaskList } from "@/components/tasks/TaskList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task } from "@/types/task";
import { useTasks } from "@/hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";

const Tasks = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const { 
    useTasksQuery, 
    useAddTaskMutation, 
    useToggleTaskCompletionMutation,
    useDeleteTaskMutation 
  } = useTasks();
  
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

  if (tasksQuery.isLoading) {
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
          />
        </TabsContent>
        
        <TabsContent value="pending">
          <TaskList
            tasks={pendingTasks}
            onTaskClick={handleTaskClick}
            onTaskComplete={handleTaskComplete}
            onAddTask={handleAddTask}
          />
        </TabsContent>
        
        <TabsContent value="completed">
          <TaskList
            tasks={completedTasks}
            onTaskClick={handleTaskClick}
            onTaskComplete={handleTaskComplete}
            onAddTask={handleAddTask}
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Tasks;
