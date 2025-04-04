
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Task } from "@/types/task";
import { AdminTask } from "@/contexts/admin/types";
import { AdminTaskCard } from "./AdminTaskCard";
import { AdminTaskDetails } from "./AdminTaskDetails";
import { AdminTaskForm } from "./AdminTaskForm";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdmin } from "@/contexts/admin";

export function AdminTaskList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AdminTask | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  
  const { tasks, isLoadingTasks, assignTask, updateTask, deleteTask } = useAdmin();
  const navigate = useNavigate();
  
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (task.userName && task.userName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddTaskClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleTaskClick = (task: AdminTask) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const handleAddTaskSubmit = (task: Omit<AdminTask, "id" | "createdAt">) => {
    assignTask(task);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateTask = (updatedTask: AdminTask) => {
    updateTask(updatedTask);
    setIsTaskDetailsOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    setIsTaskDetailsOpen(false);
  };

  const handleToggleTaskCompletion = (id: string, completed: boolean) => {
    if (!selectedTask) return;
    updateTask({ ...selectedTask, completed });
  };

  if (isLoadingTasks) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Carregando tarefas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar tarefas ou usuários..."
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
            <AdminTaskCard
              key={task.id}
              task={task}
              onComplete={handleToggleTaskCompletion}
              onClick={() => handleTaskClick(task)}
            />
          ))}
        </div>
      )}

      {/* Dialog para adicionar novas tarefas */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Nova Tarefa</DialogTitle>
          </DialogHeader>
          <AdminTaskForm 
            onSubmit={handleAddTaskSubmit} 
            onCancel={() => setIsCreateDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Detalhes da tarefa */}
      {selectedTask && (
        <AdminTaskDetails
          task={selectedTask}
          isOpen={isTaskDetailsOpen}
          onClose={() => setIsTaskDetailsOpen(false)}
          onComplete={handleToggleTaskCompletion}
          onSave={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}
