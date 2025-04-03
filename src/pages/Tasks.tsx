
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TaskList } from "@/components/tasks/TaskList";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task } from "@/types/task";
import { v4 as uuidv4 } from "uuid";

// Mock data
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Finalizar relatório mensal",
    description: "Completar o relatório de vendas do mês de agosto",
    completed: false,
    dueDate: new Date(2023, 8, 28),
    priority: "high",
    createdAt: new Date(2023, 8, 20),
  },
  {
    id: "2",
    title: "Reunião com equipe de marketing",
    description: "Discutir a nova campanha de lançamento do produto",
    completed: false,
    dueDate: new Date(2023, 8, 25),
    priority: "medium",
    createdAt: new Date(2023, 8, 19),
  },
  {
    id: "3",
    title: "Atualizar documentação",
    description: "Revisar e atualizar a documentação do projeto",
    completed: true,
    dueDate: new Date(2023, 8, 22),
    priority: "low",
    createdAt: new Date(2023, 8, 18),
  },
  {
    id: "4",
    title: "Preparar apresentação",
    description: "Criar slides para a apresentação na conferência",
    completed: false,
    dueDate: new Date(2023, 8, 30),
    priority: "medium",
    createdAt: new Date(2023, 8, 21),
  },
  {
    id: "5",
    title: "Revisar código do projeto",
    description: "Fazer code review das novas funcionalidades implementadas",
    completed: false,
    priority: "high",
    createdAt: new Date(2023, 8, 21),
  },
  {
    id: "6",
    title: "Atualizar plugins",
    description: "Atualizar plugins do site para as versões mais recentes",
    completed: true,
    dueDate: new Date(2023, 8, 15),
    priority: "low",
    createdAt: new Date(2023, 8, 10),
  },
];

const Tasks = () => {
  const [tasks, setTasks] = useState(mockTasks);
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

  const handleTaskClick = (task: Task) => {
    toast({
      title: "Detalhes da tarefa",
      description: `Visualizando detalhes de: ${task.title}`,
    });
  };

  const handleAddTask = () => {
    const newTask: Task = {
      id: uuidv4(),
      title: "Nova tarefa",
      description: "Descrição da nova tarefa",
      completed: false,
      priority: "medium",
      createdAt: new Date(),
      category: "new"
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    
    toast({
      title: "Tarefa adicionada",
      description: "Nova tarefa adicionada com sucesso.",
    });
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

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
