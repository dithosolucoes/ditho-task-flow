import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Today = () => {
  const { user } = useAuth();
  const { tasks, loading, updateTask, addTask, deleteTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createCategory, setCreateCategory] = useState<TaskCategory>("new");
  const { toast } = useToast();

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleTaskComplete = (id: string, completed: boolean) => {
    const taskToUpdate = tasks.find(task => task.id === id);
    if (taskToUpdate) {
      const updatedTask = { ...taskToUpdate, completed };
      updateTask(updatedTask);
      
      toast({
        title: completed ? "Tarefa concluída!" : "Tarefa reaberta",
        description: "Status da tarefa atualizado com sucesso.",
      });

      // Update selected task if it's the one being completed
      if (selectedTask && selectedTask.id === id) {
        setSelectedTask(updatedTask);
      }
    }
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

  const handleTaskCreate = async (newTask: Task) => {
    const createdTask = await addTask({
      ...newTask,
      category: newTask.category || createCategory
    });
    
    if (createdTask) {
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Tarefa criada",
        description: `"${newTask.title}" foi adicionada com sucesso.`,
      });
    }
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    const success = await updateTask(updatedTask);
    
    if (success) {
      setSelectedTask(updatedTask);
      
      toast({
        title: "Tarefa atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    }
  };

  const handleTaskDelete = async (id: string) => {
    const success = await deleteTask(id);
    
    if (success) {
      setIsDetailsOpen(false);
      
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi removida permanentemente.",
        variant: "destructive",
      });
    }
  };

  // Filtrando as tarefas por categoria
  const newTasks = tasks.filter(task => task.category === "new");
  const pendingTasks = tasks.filter(task => task.category === "pending");
  const scheduledTasks = tasks.filter(task => task.category === "scheduled");
  
  // Calculando o progresso das tarefas de hoje
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(task => task.completed).length;
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
              {loading ? 'Carregando tarefas...' : 
                `${totalTasks} tarefas hoje: ${newTasks.length} novas, ${pendingTasks.length} pendentes, ${scheduledTasks.length} agendadas`
              }
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
