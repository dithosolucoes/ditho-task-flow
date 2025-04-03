
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

// Define the database task type
type DbTask = Database["public"]["Tables"]["tasks"]["Row"];

export function useTasks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // Função para buscar todas as tarefas do usuário
  const fetchTasks = async (): Promise<Task[]> => {
    if (!isAuthenticated || !user) {
      console.log("User not authenticated in fetchTasks");
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
    return (data || []).map((task: DbTask) => ({
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      completed: task.completed,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      priority: task.priority,
      category: task.category || undefined,
      createdAt: new Date(task.created_at)
    }));
  };

  // Função para buscar uma tarefa específica por ID
  const fetchTaskById = async (id: string): Promise<Task> => {
    if (!isAuthenticated || !user) {
      console.log("User not authenticated in fetchTaskById");
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

    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      completed: data.completed,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      priority: data.priority,
      category: data.category || undefined,
      createdAt: new Date(data.created_at)
    };
  };

  // Função para adicionar uma nova tarefa
  const addTask = async (task: Omit<Task, "id" | "createdAt">): Promise<Task> => {
    if (!isAuthenticated || !user) {
      console.log("User not authenticated in addTask");
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

    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      completed: data.completed,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      priority: data.priority,
      category: data.category || undefined,
      createdAt: new Date(data.created_at)
    };
  };

  // Função para atualizar uma tarefa existente
  const updateTask = async (task: Task): Promise<Task> => {
    if (!isAuthenticated || !user) {
      console.log("User not authenticated in updateTask");
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

    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      completed: data.completed,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      priority: data.priority,
      category: data.category || undefined,
      createdAt: new Date(data.created_at)
    };
  };

  // Função para marcar uma tarefa como completa/incompleta
  const toggleTaskCompletion = async ({ id, completed }: { id: string; completed: boolean }): Promise<void> => {
    if (!isAuthenticated || !user) {
      console.log("User not authenticated in toggleTaskCompletion");
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
      console.log("User not authenticated in deleteTask");
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

  // Hook do React Query para buscar todas as tarefas
  const useTasksQuery = () => {
    return useQuery({
      queryKey: ["tasks", user?.id],
      queryFn: fetchTasks,
      enabled: isAuthenticated && !!user,
    });
  };

  // Hook do React Query para buscar uma tarefa específica
  const useTaskQuery = (id: string) => {
    return useQuery({
      queryKey: ["task", id, user?.id],
      queryFn: () => fetchTaskById(id),
      enabled: isAuthenticated && !!user && !!id,
    });
  };

  // Mutation para adicionar uma tarefa
  const useAddTaskMutation = () => {
    return useMutation({
      mutationFn: addTask,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks", user?.id] });
        toast({
          title: "Tarefa adicionada",
          description: "Tarefa adicionada com sucesso.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Erro ao adicionar tarefa",
          description: error.message || "Ocorreu um erro ao adicionar a tarefa.",
          variant: "destructive",
        });
      },
    });
  };

  // Mutation para atualizar uma tarefa
  const useUpdateTaskMutation = () => {
    return useMutation({
      mutationFn: updateTask,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks", user?.id] });
        toast({
          title: "Tarefa atualizada",
          description: "Tarefa atualizada com sucesso.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Erro ao atualizar tarefa",
          description: error.message || "Ocorreu um erro ao atualizar a tarefa.",
          variant: "destructive",
        });
      },
    });
  };

  // Mutation para alternar a conclusão de uma tarefa
  const useToggleTaskCompletionMutation = () => {
    return useMutation({
      mutationFn: toggleTaskCompletion,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks", user?.id] });
      },
      onError: (error: any) => {
        toast({
          title: "Erro ao atualizar tarefa",
          description: error.message || "Ocorreu um erro ao atualizar a tarefa.",
          variant: "destructive",
        });
      },
    });
  };

  // Mutation para excluir uma tarefa
  const useDeleteTaskMutation = () => {
    return useMutation({
      mutationFn: deleteTask,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks", user?.id] });
        toast({
          title: "Tarefa excluída",
          description: "Tarefa excluída com sucesso.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Erro ao excluir tarefa",
          description: error.message || "Ocorreu um erro ao excluir a tarefa.",
          variant: "destructive",
        });
      },
    });
  };

  return {
    useTasksQuery,
    useTaskQuery,
    useAddTaskMutation,
    useUpdateTaskMutation,
    useToggleTaskCompletionMutation,
    useDeleteTaskMutation,
  };
}
