import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TaskCategorized } from "@/components/tasks/TaskCategorized";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Calendar, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Task, TaskCategory } from "@/types/task";
import { TaskDetails } from "@/components/tasks/TaskDetails";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks } from "@/hooks/useTasks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Today = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createCategory, setCreateCategory] = useState<TaskCategory>("new");
  const { toast } = useToast();

  const { 
    useTasksQuery,
    useAddTaskMutation,
    useUpdateTaskMutation,
    useDeleteTaskMutation,
    useToggleTaskCompletionMutation
  } = useTasks();
  
  const tasksQuery = useTasksQuery();
  const addTaskMutation = useAddTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();
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
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const handleAddTask = (category?: TaskCategory) => {
    if (category) {
      setCreateCategory(category);
    }
    setIsCreateDialogOpen(true);
  };

  const handleTaskCreate = (newTask: Omit<Task, "id" | "createdAt">) => {
    addTaskMutation.mutate({
      ...newTask,
      category: newTask.category || createCategory
    }, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        toast({
          title: "Tarefa criada",
          description: `"${newTask.title}" foi adicionada com sucesso.`,
        });
      }
    });
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    updateTaskMutation.mutate(updatedTask, {
      onSuccess: () => {
        toast({
          title: "Tarefa atualizada",
          description: "As alterações foram salvas com sucesso.",
        });
      }
    });
  };

  const handleTaskDelete = (id: string) => {
    deleteTaskMutation.mutate(id, {
      onSuccess: () => {
        setIsDetailsOpen(false);
        toast({
          title: "Tarefa excluída",
          description: "A tarefa foi removida permanentemente.",
          variant: "destructive",
        });
      }
    });
  };

  // Dados do carregamento
  if (tasksQuery.isLoading) {
    return (
      <DashboardLayout title="Hoje">
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-8 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Tratamento de erro
  if (tasksQuery.isError) {
    return (
      <DashboardLayout title="Hoje">
        <div className="text-center py-10">
          <p className="text-red-500 text-lg">
            Erro ao carregar tarefas. Tente novamente mais tarde.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const tasks = tasksQuery.data || [];
  
  // Filtrar apenas tarefas para hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTasks = tasks.filter(task => {
    if (task.dueDate) {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    }
    // Incluir tarefas sem data como sendo de hoje
    return !task.dueDate && task.category === "new";
  });

  // Filtrando as tarefas por categoria
  const newTasks = todayTasks.filter(task => task.category === "new");
  const pendingTasks = todayTasks.filter(task => task.category === "pending");
  const scheduledTasks = todayTasks.filter(task => task.category === "scheduled");
  
  // Calculando o progresso das tarefas de hoje
  const totalTasks = todayTasks.length;
  const completedTasksCount = todayTasks.filter(task => task.completed).length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  return (
    <DashboardLayout title="Hoje">
      <div className="space-y-6">
        {/* Cabeçalho com data e resumo */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
          <div>
            <h2 className="text-2xl font-bold text-ditho-navy">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h2>
            <p className="text-muted-foreground">
              {totalTasks} tarefas hoje: {newTasks.length} novas, {pendingTasks.length} pendentes, {scheduledTasks.length} agendadas
            </p>
          </div>
          <Button onClick={() => handleAddTask()} className="bg-ditho-navy hover:bg-ditho-dark-navy">
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa para Hoje
          </Button>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progresso do dia</span>
            <span className="text-sm font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Seção de tarefas pendentes (atrasadas) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-red-700">Tarefas Pendentes</h3>
              <Badge variant="outline" className="bg-red-100 text-red-800 ml-2">
                {pendingTasks.length}
              </Badge>
            </div>
            <Button 
              onClick={() => handleAddTask("pending")} 
              variant="outline" 
              size="sm"
              className="text-red-700 border-red-300 hover:bg-red-50"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Adicionar
            </Button>
          </div>
          {pendingTasks.length > 0 ? (
            <TaskCategorized 
              tasks={pendingTasks} 
              onTaskClick={handleTaskClick} 
              onTaskComplete={handleTaskComplete}
              categoryColor="bg-red-50 border-red-200"
            />
          ) : (
            <p className="text-muted-foreground text-sm">Não há tarefas pendentes. Muito bem!</p>
          )}
        </div>

        {/* Seção de novas tarefas para hoje */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-blue-700">Novas Tarefas</h3>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 ml-2">
                {newTasks.length}
              </Badge>
            </div>
            <Button 
              onClick={() => handleAddTask("new")} 
              variant="outline" 
              size="sm"
              className="text-blue-700 border-blue-300 hover:bg-blue-50"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Adicionar
            </Button>
          </div>
          {newTasks.length > 0 ? (
            <TaskCategorized 
              tasks={newTasks} 
              onTaskClick={handleTaskClick} 
              onTaskComplete={handleTaskComplete}
              categoryColor="bg-blue-50 border-blue-200"
            />
          ) : (
            <p className="text-muted-foreground text-sm">Não há novas tarefas para hoje.</p>
          )}
        </div>

        {/* Seção de tarefas agendadas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-green-700">Tarefas Agendadas</h3>
              <Badge variant="outline" className="bg-green-100 text-green-800 ml-2">
                {scheduledTasks.length}
              </Badge>
            </div>
            <Button 
              onClick={() => handleAddTask("scheduled")} 
              variant="outline" 
              size="sm"
              className="text-green-700 border-green-300 hover:bg-green-50"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Adicionar
            </Button>
          </div>
          {scheduledTasks.length > 0 ? (
            <TaskCategorized 
              tasks={scheduledTasks} 
              onTaskClick={handleTaskClick} 
              onTaskComplete={handleTaskComplete}
              categoryColor="bg-green-50 border-green-200"
            />
          ) : (
            <p className="text-muted-foreground text-sm">Não há tarefas agendadas para hoje.</p>
          )}
        </div>

        {/* Drawer de detalhes da tarefa */}
        <TaskDetails 
          task={selectedTask}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onComplete={handleTaskComplete}
          onSave={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />

        {/* Dialog para criar nova tarefa */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para criar uma nova tarefa.
              </DialogDescription>
            </DialogHeader>
            <TaskForm 
              onSubmit={handleTaskCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
              defaultCategory={createCategory}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Today;
