
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/auth";
import { TaskApi } from "./types";

// Define the database task type
type DbTask = Database["public"]["Tables"]["tasks"]["Row"];

// Convert database task to app task model
const mapDbTaskToTask = (task: DbTask): Task => ({
  id: task.id,
  title: task.title,
  description: task.description || undefined,
  completed: task.completed,
  dueDate: task.due_date ? new Date(task.due_date) : undefined,
  priority: task.priority,
  category: task.category || undefined,
  createdAt: new Date(task.created_at)
});

export function createTaskApi(): TaskApi {
  const { user, isAuthenticated } = useAuth();

  // Função para buscar todas as tarefas do usuário
  const fetchTasks = async (): Promise<Task[]> => {
    if (!isAuthenticated || !user) {
      console.log("User not authenticated in fetchTasks, user ID:", user?.id);
      return [];
    }

    console.log("Fetching tasks for user:", user.id);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      throw new Error(error.message);
    }

    // Converte as datas de string para objetos Date e mapeia para o tipo Task
    return (data || []).map(mapDbTaskToTask);
  };

  // Função para buscar uma tarefa específica por ID
  const fetchTaskById = async (id: string): Promise<Task> => {
    if (!isAuthenticated || !user) {
      console.log("User not authenticated in fetchTaskById, user ID:", user?.id);
      throw new Error("Usuário não autenticado");
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Tarefa não encontrada");
    }

    return mapDbTaskToTask(data);
  };

  // Função para adicionar uma nova tarefa
  const addTask = async (task: Omit<Task, "id" | "createdAt">): Promise<Task> => {
    if (!isAuthenticated || !user) {
      console.log("User not authenticated in addTask, user ID:", user?.id);
      throw new Error("Usuário não autenticado");
    }
    
    console.log("Adding task for user:", user.id);
    const taskData = {
      title: task.title,
      description: task.description,
      completed: task.completed,
      due_date: task.dueDate ? task.dueDate.toISOString() : null,
      priority: task.priority,
      category: task.category,
      user_id: user.id
    };

    console.log("Task data being sent:", taskData);

    const { data, error } = await supabase
      .from("tasks")
      .insert(taskData)
      .select()
      .single();

    if (error) {
      console.error("Error adding task:", error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Erro ao criar tarefa");
    }

    return mapDbTaskToTask(data);
  };

  // Função para atualizar uma tarefa existente
  const updateTask = async (task: Task): Promise<Task> => {
    if (!isAuthenticated || !user) {
      console.log("User not authenticated in updateTask, user ID:", user?.id);
      throw new Error("Usuário não autenticado");
    }

    const taskData = {
      title: task.title,
      description: task.description,
      completed: task.completed,
      due_date: task.dueDate ? task.dueDate.toISOString() : null,
      priority: task.priority,
      category: task.category,
    };

    const { data, error } = await supabase
      .from("tasks")
      .update(taskData)
      .eq("id", task.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Erro ao atualizar tarefa");
    }

    return mapDbTaskToTask(data);
  };

  // Função para marcar uma tarefa como completa/incompleta
  const toggleTaskCompletion = async ({ id, completed }: { id: string; completed: boolean }): Promise<void> => {
    if (!isAuthenticated || !user) {
      console.log("User not authenticated in toggleTaskCompletion, user ID:", user?.id);
      throw new Error("Usuário não autenticado");
    }

    const { error } = await supabase
      .from("tasks")
      .update({ completed })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }
  };

  // Função para excluir uma tarefa
  const deleteTask = async (id: string): Promise<void> => {
    if (!isAuthenticated || !user) {
      console.log("User not authenticated in deleteTask, user ID:", user?.id);
      throw new Error("Usuário não autenticado");
    }

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }
  };

  return {
    fetchTasks,
    fetchTaskById,
    addTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask
  };
}
