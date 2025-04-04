
import { Task } from "@/types/task";

export interface TaskApi {
  fetchTasks: () => Promise<Task[]>;
  fetchTaskById: (id: string) => Promise<Task>;
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<Task>;
  updateTask: (task: Task) => Promise<Task>;
  toggleTaskCompletion: (params: { id: string; completed: boolean }) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}
