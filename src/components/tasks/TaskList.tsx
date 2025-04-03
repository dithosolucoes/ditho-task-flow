
import { useState } from "react";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Task } from "@/types/task";
import { TaskDetails } from "./TaskDetails";
import { TaskForm } from "./TaskForm";
import { Drawer, DrawerContent, DrawerTitle, DrawerHeader, DrawerDescription } from "@/components/ui/drawer";

type TaskListProps = {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskComplete: (id: string, completed: boolean) => void;
  onAddTask: () => void;
};

export function TaskList({ tasks, onTaskClick, onTaskComplete, onAddTask }: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewTaskDrawerOpen, setIsNewTaskDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddTaskClick = () => {
    setIsNewTaskDrawerOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
    onTaskClick(task);
  };

  const handleAddTaskSubmit = (task: Task) => {
    console.log("Adicionando nova tarefa:", task);
    setIsNewTaskDrawerOpen(false);
    onAddTask();
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

      {/* Drawer para adicionar novas tarefas */}
      <Drawer open={isNewTaskDrawerOpen} onOpenChange={setIsNewTaskDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b pb-4">
            <DrawerTitle className="text-xl font-bold">Nova Tarefa</DrawerTitle>
            <DrawerDescription>
              Preencha os campos para adicionar uma nova tarefa
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <TaskForm 
              onSubmit={handleAddTaskSubmit} 
              onCancel={() => setIsNewTaskDrawerOpen(false)} 
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Detalhes da tarefa */}
      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          isOpen={isTaskDetailsOpen}
          onClose={() => setIsTaskDetailsOpen(false)}
          onComplete={onTaskComplete}
          onSave={(updatedTask) => {
            console.log("Tarefa atualizada:", updatedTask);
            setIsTaskDetailsOpen(false);
          }}
          onDelete={(id) => {
            console.log("Excluindo tarefa:", id);
            setIsTaskDetailsOpen(false);
          }}
        />
      )}
    </div>
  );
}
