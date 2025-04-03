
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { ptBR } from "date-fns/locale";
import { Task } from "@/types/task";
import { TaskCard } from "@/components/tasks/TaskCard";
import { useToast } from "@/hooks/use-toast";

// Mock data for calendar tasks
const mockCalendarTasks: Task[] = [
  {
    id: "c1",
    title: "Reunião com cliente",
    description: "Discussão sobre novos projetos",
    completed: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    priority: "high",
    createdAt: new Date(),
    category: "scheduled"
  },
  {
    id: "c2",
    title: "Entrega de relatório",
    description: "Finalizar e enviar relatório mensal",
    completed: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    priority: "medium",
    createdAt: new Date(),
    category: "scheduled"
  },
  {
    id: "c3",
    title: "Revisão de código",
    description: "Revisão do código do projeto X",
    completed: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    priority: "low",
    createdAt: new Date(),
    category: "scheduled"
  }
];

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[]>(mockCalendarTasks);
  const { toast } = useToast();

  const handleTaskComplete = (id: string, completed: boolean) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed } : task
    ));
    
    toast({
      title: completed ? "Tarefa concluída!" : "Tarefa reaberta",
      description: "Status da tarefa atualizado com sucesso.",
    });
  };

  const handleTaskClick = (task: Task) => {
    toast({
      title: "Detalhes da tarefa",
      description: `Visualizando detalhes de: ${task.title}`,
    });
  };

  // Filter tasks for the selected date
  const tasksForSelectedDate = date 
    ? tasks.filter(task => 
        task.dueDate && 
        task.dueDate.getDate() === date.getDate() &&
        task.dueDate.getMonth() === date.getMonth() &&
        task.dueDate.getFullYear() === date.getFullYear()
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
          <CardHeader>
            <CardTitle>
              {date ? date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Selecione uma data'}
            </CardTitle>
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
                <Button className="mt-4">
                  Adicionar Tarefa
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
