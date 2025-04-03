
import { Task } from "@/types/task";
import { TaskCard } from "./TaskCard";

type TaskCategorizedProps = {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskComplete: (id: string, completed: boolean) => void;
  categoryColor?: string;
};

export function TaskCategorized({ 
  tasks, 
  onTaskClick, 
  onTaskComplete, 
  categoryColor = "" 
}: TaskCategorizedProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <div key={task.id} className={`rounded-lg ${categoryColor}`}>
          <TaskCard
            task={task}
            onComplete={onTaskComplete}
            onClick={onTaskClick}
          />
        </div>
      ))}
    </div>
  );
}
