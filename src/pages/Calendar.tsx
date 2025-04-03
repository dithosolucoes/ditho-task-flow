
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ptBR } from "date-fns/locale";
import { Task } from "@/types/task";
import { TaskCard } from "@/components/tasks/TaskCard";
import { useTasks } from "@/hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskDetails } from "@/components/tasks/TaskDetails";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  
  const { 
    useTasksQuery, 
    useToggleTaskCompletionMutation, 
    useAddTaskMutation,
    useUpdateTaskMutation,
    useDeleteTaskMutation
  } = useTasks();
  
  const tasksQuery = useTasksQuery();
  const toggleTaskMutation = useToggleTaskCompletionMutation();
  const addTaskMutation = useAddTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  const handleTaskComplete = (id: string, completed: boolean) => {
    toggleTaskMutation.mutate({ id, completed });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const handleAddTaskClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleAddTaskSubmit = (task: Omit<Task, "id" | "createdAt">) => {
    // Se estiver adicionando uma tarefa a partir da visualização do calendário, 
    // define a data de vencimento para a data selecionada no calendário
    addTaskMutation.mutate({
      ...task,
      dueDate: date || undefined
    }, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      }
    });
  };

  const handleUpdateTask = (updatedTask: Task) => {
    updateTaskMutation.mutate(updatedTask, {
      onSuccess: () => {
        setIsTaskDetailsOpen(false);
      }
    });
  };

  const handleDeleteTask = (id: string) => {
    deleteTaskMutation.mutate(id, {
      onSuccess: () => {
        setIsTaskDetailsOpen(false);
      }
    });
  };

  // Dados do carregamento
  if (tasksQuery.isLoading) {
    return (
      <DashboardLayout title="Agenda">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 md:col-span-1" />
          <Skeleton className="h-96 md:col-span-2" />
        </div>
      </DashboardLayout>
    );
  }

  // Tratamento de erro
  if (tasksQuery.isError) {
    return (
      <DashboardLayout title="Agenda">
        <div className="text-center py-10">
          <p className="text-red-500 text-lg">
            Erro ao carregar tarefas. Tente novamente mais tarde.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // Filter tasks for the selected date
  const tasks = tasksQuery.data || [];
  const tasksForSelectedDate = date 
    ? tasks.filter(task => 
        task.dueDate && 
        new Date(task.dueDate).getDate() === date.getDate() &&
        new Date(task.dueDate).getMonth() === date.getMonth() &&
        new Date(task.dueDate).getFullYear() === date.getFullYear()
      )
    : [];

  return (
    <DashboardLayout title="Agenda">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              className="border rounded-md p-2"
            />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {date ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione uma data'}
            </CardTitle>
            {date && (
              <Button onClick={handleAddTaskClick}>
                Nova Tarefa
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {tasksForSelectedDate.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                {tasksForSelectedDate.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={handleTaskComplete}
                    onClick={handleTaskClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Nenhuma tarefa para esta data.</p>
                {date && (
                  <Button className="mt-4" onClick={handleAddTaskClick}>
                    Adicionar Tarefa
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para adicionar novas tarefas */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Tarefa</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para criar uma nova tarefa.
            </DialogDescription>
          </DialogHeader>
          <TaskForm 
            onSubmit={handleAddTaskSubmit} 
            onCancel={() => setIsCreateDialogOpen(false)} 
            defaultCategory="scheduled"
          />
        </DialogContent>
      </Dialog>

      {/* Detalhes da tarefa */}
      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          isOpen={isTaskDetailsOpen}
          onClose={() => setIsTaskDetailsOpen(false)}
          onComplete={handleTaskComplete}
          onSave={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </DashboardLayout>
  );
};

export default Calendar;
