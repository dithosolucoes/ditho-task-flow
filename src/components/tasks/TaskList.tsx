
import { useState } from "react";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

type TaskPriority = "low" | "medium" | "high";

type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority: TaskPriority;
  createdAt: Date;
};

type TaskListProps = {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskComplete: (id: string, completed: boolean) => void;
  onAddTask: () => void;
};

export function TaskList({ tasks, onTaskClick, onTaskComplete, onAddTask }: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
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
        <Button onClick={onAddTask} className="bg-ditho-navy hover:bg-ditho-dark-navy">
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
              onClick={onTaskClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
