
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

  // Function to fetch all tasks for the user
  const fetchTasks = async (): Promise<Task[]> => {
    if (!isAuthenticated || !user) {
      console.log("User not authenticated when fetching tasks", { isAuthenticated, userId: user?.id });
      return [];
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      throw new Error(error.message);
    }

    // Convert dates from string to Date objects and map to Task type
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

  // Function to fetch a specific task by ID
  const fetchTaskById = async (id: string): Promise<Task> => {
    if (!isAuthenticated || !user) {
      throw new Error("User not authenticated");
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
      throw new Error("Task not found");
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

  // Function to add a new task
  const addTask = async (task: Omit<Task, "id" | "createdAt">): Promise<Task> => {
    if (!isAuthenticated || !user) {
      console.error("User not authenticated when adding task", { isAuthenticated, userId: user?.id });
      throw new Error("User not authenticated");
    }

    const taskData = {
      title: task.title,
      description: task.description,
      completed: task.completed,
      due_date: task.dueDate ? task.dueDate.toISOString() : null,
      priority: task.priority,
      category: task.category,
      user_id: user.id
    };

    console.log("Adding task with data:", taskData);

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
      throw new Error("Error creating task");
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

  // Function to update an existing task
  const updateTask = async (task: Task): Promise<Task> => {
    if (!isAuthenticated || !user) {
      throw new Error("User not authenticated");
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
      throw new Error("Error updating task");
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

  // Function to mark a task as complete/incomplete
  const toggleTaskCompletion = async ({ id, completed }: { id: string; completed: boolean }): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error("User not authenticated");
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

  // Function to delete a task
  const deleteTask = async (id: string): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error("User not authenticated");
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

  // React Query hook to fetch all tasks
  const useTasksQuery = () => {
    return useQuery({
      queryKey: ["tasks", user?.id],
      queryFn: fetchTasks,
      enabled: isAuthenticated && !!user, // Only run the query if the user is authenticated
    });
  };

  // React Query hook to fetch a specific task
  const useTaskQuery = (id: string) => {
    return useQuery({
      queryKey: ["task", id, user?.id],
      queryFn: () => fetchTaskById(id),
      enabled: !!id && isAuthenticated && !!user, // Only run the query if the ID exists and the user is authenticated
    });
  };

  // Mutation to add a task
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
        console.error("Error in add task mutation:", error);
        toast({
          title: "Erro ao adicionar tarefa",
          description: error.message || "Ocorreu um erro ao adicionar a tarefa.",
          variant: "destructive",
        });
      },
    });
  };

  // Mutation to update a task
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

  // Mutation to toggle task completion
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

  // Mutation to delete a task
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
