
import * as z from "zod";
import { TaskPriority, TaskCategory } from "@/types/task";

export const taskFormSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"] as const),
  category: z.enum(["new", "pending", "scheduled"] as const),
  dueDate: z.date().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
