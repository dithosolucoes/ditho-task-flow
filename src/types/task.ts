
import { Database } from "@/integrations/supabase/types";

export type TaskPriority = Database["public"]["Enums"]["task_priority"];
export type TaskCategory = Database["public"]["Enums"]["task_category"];

export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority: TaskPriority;
  createdAt: Date;
  category?: TaskCategory;
  user_id?: string;
};

// Type for converting between Supabase and our app's data structure
export type SupabaseTask = Database["public"]["Tables"]["tasks"]["Row"];

// Function to convert from Supabase task to our app's task format
export const supabaseTaskToTask = (task: SupabaseTask): Task => {
  return {
    id: task.id,
    title: task.title,
    description: task.description || undefined,
    completed: task.completed,
    dueDate: task.due_date ? new Date(task.due_date) : undefined,
    priority: task.priority,
    createdAt: new Date(task.created_at),
    category: task.category || undefined,
    user_id: task.user_id
  };
};

// Function to convert from our app's task format to Supabase
export const taskToSupabaseTask = (task: Task, userId: string): Omit<SupabaseTask, 'id' | 'created_at' | 'updated_at'> => {
  return {
    title: task.title,
    description: task.description || null,
    completed: task.completed,
    due_date: task.dueDate ? task.dueDate.toISOString() : null,
    priority: task.priority,
    category: task.category || null,
    user_id: userId
  };
};
