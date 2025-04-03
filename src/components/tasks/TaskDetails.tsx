
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Task, TaskPriority } from "@/types/task";
import { Button } from "@/components/ui/button";
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle 
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle, CheckCircle2, Edit } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { TaskForm } from "./TaskForm";

const priorityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  high: "bg-red-100 text-red-800 hover:bg-red-200",
};

const priorityLabels: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const categoryIcons: Record<string, any> = {
  new: <Clock className="h-5 w-5 text-blue-500" />,
  pending: <AlertTriangle className="h-5 w-5 text-red-500" />,
  scheduled: <Calendar className="h-5 w-5 text-green-500" />,
};

const categoryLabels: Record<string, string> = {
  new: "Nova",
  pending: "Pendente",
  scheduled: "Agendada",
};

type TaskDetailsProps = {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (id: string, completed: boolean) => void;
  onSave: (task: Task) => void;
  onDelete: (id: string) => void;
};

export function TaskDetails({ 
  task, 
  isOpen, 
  onClose, 
  onComplete, 
  onSave,
  onDelete
}: TaskDetailsProps) {
  const [editing, setEditing] = useState(false);

  if (!task) return null;

  const handleComplete = () => {
    onComplete(task.id, !task.completed);
  };

  const handleSave = (updatedTask: Task) => {
    onSave(updatedTask);
    setEditing(false);
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="text-xl font-bold flex items-center justify-between">
            {!editing ? (
              <>
                <span className={task.completed ? "line-through text-gray-400" : ""}>
                  {task.title}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setEditing(true)}
                  className="ml-2"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </>
            ) : (
              "Editar Tarefa"
            )}
          </DrawerTitle>
          {!editing && task.category && (
            <DrawerDescription className="flex items-center mt-2">
              {categoryIcons[task.category]}
              <span className="ml-2">Tarefa {categoryLabels[task.category]}</span>
            </DrawerDescription>
          )}
        </DrawerHeader>

        {editing ? (
          <div className="px-4 py-2">
            <TaskForm 
              task={task} 
              onSubmit={handleSave} 
              onCancel={() => setEditing(false)} 
            />
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {task.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
                <p className="text-sm">{task.description}</p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Prioridade</h3>
                <Badge className={priorityColors[task.priority]}>
                  {priorityLabels[task.priority]}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <Badge variant={task.completed ? "outline" : "secondary"}>
                  {task.completed ? "Concluída" : "Em Aberto"}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Data de Criação</h3>
              <p className="text-sm flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                {format(task.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            
            {task.dueDate && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Data Limite</h3>
                <p className="text-sm flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {format(task.dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            )}

            <Separator />
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleComplete}
                className="flex items-center"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {task.completed ? "Reabrir Tarefa" : "Marcar como Concluída"}
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={handleDelete}
              >
                Excluir Tarefa
              </Button>
            </div>
          </div>
        )}
        
        {!editing && (
          <DrawerFooter className="border-t pt-4">
            <DrawerClose asChild>
              <Button variant="outline">Fechar</Button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
