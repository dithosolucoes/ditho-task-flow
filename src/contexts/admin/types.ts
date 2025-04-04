
import { User } from "@supabase/supabase-js";
import { Task } from "@/types/task";

export interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  role: 'user' | 'admin';
  avatar_url: string | null;
}

export interface AdminTask extends Task {
  user_id: string;
  userName?: string;
}

export interface AdminContextType {
  users: AdminUser[];
  tasks: AdminTask[];
  isLoadingUsers: boolean;
  isLoadingTasks: boolean;
  error: Error | null;
  refreshData: () => void;
  assignTask: (task: Omit<AdminTask, "id" | "createdAt">) => void;
  updateTask: (task: AdminTask) => void;
  deleteTask: (id: string) => void;
  isAdmin: boolean;
}
