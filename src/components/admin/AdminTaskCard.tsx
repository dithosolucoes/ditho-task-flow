
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AdminTask } from "@/contexts/admin/types";

type AdminTaskCardProps = {
  task: AdminTask;
  onComplete: (id: string, completed: boolean) => void;
  onClick: (task: AdminTask) => void;
};

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

export function AdminTaskCard({ task, onComplete, onClick }: AdminTaskCardProps) {
  const handleCheckboxChange = (checked: boolean) => {
    onComplete(task.id, checked);
  };

  return (
    <Card 
      className="border border-ditho-beige/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(task)}
    >
      <CardHeader className="p-4 pb-0 flex flex-row items-start space-y-0">
        <div className="flex items-start gap-3 flex-1">
          <Checkbox 
            checked={task.completed} 
            onCheckedChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5"
          />
          <div className="space-y-1">
            <h3 className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-ditho-navy'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
            )}
          </div>
        </div>
        <Badge className={priorityColors[task.priority]}>
          {priorityLabels[task.priority]}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
          <User className="h-3 w-3 mr-1" />
          <span className="font-medium">{task.userName}</span>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {formatDistanceToNow(task.createdAt, { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </div>
          {task.dueDate && (
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {task.dueDate.toLocaleDateString("pt-BR")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
