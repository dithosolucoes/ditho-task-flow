
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Task } from "@/types/task";
import { TaskDetails } from "./TaskDetails";
import { TaskForm } from "./TaskForm";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/contexts/AuthContext";

type TaskListProps = {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskComplete: (id: string, completed: boolean) => void;
  onAddTask: (task: Omit<Task, "id" | "createdAt">) => void;
  onDeleteTask: (id: string) => void;
};

export function TaskList({ 
  tasks, 
  onTaskClick, 
  onTaskComplete, 
  onAddTask,
  onDeleteTask 
}: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const { useAddTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } = useTasks();
  const addTaskMutation = useAddTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();
  
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddTaskClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setIsCreateDialogOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
    onTaskClick(task);
  };

  const handleAddTaskSubmit = (task: Omit<Task, "id" | "createdAt">) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    addTaskMutation.mutate(task, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        onAddTask(task);
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
        onDeleteTask(id);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar tarefas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleAddTaskClick} className="bg-ditho-navy hover:bg-ditho-dark-navy">
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            {searchQuery ? "Nenhuma tarefa encontrada." : "Nenhuma tarefa disponível."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={onTaskComplete}
              onClick={() => handleTaskClick(task)}
            />
          ))}
        </div>
      )}

      {/* Dialog para adicionar novas tarefas */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Tarefa</DialogTitle>
          </DialogHeader>
          <TaskForm 
            onSubmit={handleAddTaskSubmit} 
            onCancel={() => setIsCreateDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Detalhes da tarefa */}
      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          isOpen={isTaskDetailsOpen}
          onClose={() => setIsTaskDetailsOpen(false)}
          onComplete={onTaskComplete}
          onSave={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}
