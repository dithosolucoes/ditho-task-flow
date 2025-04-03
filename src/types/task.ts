
export type TaskPriority = "low" | "medium" | "high";
export type TaskCategory = "new" | "pending" | "scheduled";

export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority: TaskPriority;
  createdAt: Date;
  category?: TaskCategory;
};
