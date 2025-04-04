
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { AdminTask } from "@/contexts/admin/types";
import { TaskPriority, TaskCategory } from "@/types/task";
import { useAdmin } from "@/contexts/admin";

type AdminTaskFormProps = {
  task?: AdminTask;
  onSubmit: (task: any) => void;
  onCancel: () => void;
};

export function AdminTaskForm({ task, onSubmit, onCancel }: AdminTaskFormProps) {
  const { users } = useAdmin();
  
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || "medium");
  const [category, setCategory] = useState<TaskCategory | undefined>(task?.category);
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate);
  const [userId, setUserId] = useState<string>(task?.user_id || "");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask = {
      ...task,
      title,
      description,
      priority,
      category,
      dueDate,
      completed: task?.completed || false,
      user_id: userId
    };
    
    onSubmit(newTask);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input 
          id="title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea 
          id="description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="user">Atribuir a</Label>
        <Select 
          value={userId} 
          onValueChange={setUserId}
          required
        >
          <SelectTrigger id="user">
            <SelectValue placeholder="Selecione um usuário" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name || user.email || 'Usuário sem nome'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select 
            value={priority} 
            onValueChange={(value) => setPriority(value as TaskPriority)}
          >
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select 
            value={category || ""} 
            onValueChange={(value) => setCategory(value as TaskCategory || undefined)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Nova</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="scheduled">Agendada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Data Limite</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {task ? "Salvar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}
