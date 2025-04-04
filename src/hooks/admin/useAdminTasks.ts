import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminTask } from "@/contexts/admin/types";
import { Task } from "@/types/task";

export function useAdminTasks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Função para buscar todas as tarefas de todos os usuários
  const fetchAllTasks = async (): Promise<AdminTask[]> => {
    // First fetch all tasks
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select('*')
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all tasks:", error);
      throw new Error(error.message);
    }

    // For each task, fetch the user profile separately
    const tasksWithUsers = await Promise.all(
      tasks.map(async (task) => {
        // Get the user profile for this task
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, email")
          .eq("id", task.user_id)
          .single();

        return {
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          completed: task.completed,
          dueDate: task.due_date ? new Date(task.due_date) : undefined,
          priority: task.priority,
          category: task.category || undefined,
          createdAt: new Date(task.created_at),
          user_id: task.user_id,
          userName: profile?.name || 
                   profile?.email?.split('@')[0] || 
                   'Usuário'
        };
      })
    );

    return tasksWithUsers;
  };

  // Hook para buscar todas as tarefas
  const useAllTasksQuery = () => {
    return useQuery({
      queryKey: ["admin-tasks"],
      queryFn: fetchAllTasks,
    });
  };

  // Função para atribuir uma tarefa a um usuário
  const assignTask = async (task: Omit<AdminTask, "id" | "createdAt">): Promise<AdminTask> => {
    const taskData = {
      title: task.title,
      description: task.description,
      completed: task.completed,
      due_date: task.dueDate ? task.dueDate.toISOString() : null,
      priority: task.priority,
      category: task.category,
      user_id: task.user_id
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert(taskData)
      .select()
      .single();

    if (error) {
      console.error("Error assigning task:", error);
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
      createdAt: new Date(data.created_at),
      user_id: data.user_id
    };
  };

  // Mutation para atribuir uma tarefa
  const useAssignTaskMutation = () => {
    return useMutation({
      mutationFn: assignTask,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
        toast({
          title: "Tarefa atribuída",
          description: "Tarefa atribuída com sucesso.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Erro ao atribuir tarefa",
          description: error.message || "Ocorreu um erro ao atribuir a tarefa.",
          variant: "destructive",
        });
      },
    });
  };

  // Função para atualizar uma tarefa
  const updateTask = async (task: AdminTask): Promise<AdminTask> => {
    const taskData = {
      title: task.title,
      description: task.description,
      completed: task.completed,
      due_date: task.dueDate ? task.dueDate.toISOString() : null,
      priority: task.priority,
      category: task.category,
      user_id: task.user_id
    };

    const { data, error } = await supabase
      .from("tasks")
      .update(taskData)
      .eq("id", task.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating task:", error);
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
      createdAt: new Date(data.created_at),
      user_id: data.user_id
    };
  };

  // Mutation para atualizar uma tarefa
  const useUpdateTaskMutation = () => {
    return useMutation({
      mutationFn: updateTask,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
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

  // Função para excluir uma tarefa
  const deleteTask = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting task:", error);
      throw new Error(error.message);
    }
  };

  // Mutation para excluir uma tarefa
  const useDeleteTaskMutation = () => {
    return useMutation({
      mutationFn: deleteTask,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
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
    useAllTasksQuery,
    useAssignTaskMutation,
    useUpdateTaskMutation,
    useDeleteTaskMutation
  };
}
