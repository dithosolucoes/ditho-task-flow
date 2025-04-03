
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";
import { useToast } from "@/hooks/use-toast";

export function useTasks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Função para buscar todas as tarefas do usuário
  const fetchTasks = async (): Promise<Task[]> => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // Converte as datas de string para objetos Date
    return data.map((task) => ({
      ...task,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      createdAt: new Date(task.created_at),
    })) as Task[];
  };

  // Função para buscar uma tarefa específica por ID
  const fetchTaskById = async (id: string): Promise<Task> => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      ...data,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      createdAt: new Date(data.created_at),
    } as Task;
  };

  // Função para adicionar uma nova tarefa
  const addTask = async (task: Omit<Task, "id" | "createdAt">): Promise<Task> => {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: task.title,
        description: task.description,
        completed: task.completed,
        due_date: task.dueDate,
        priority: task.priority,
        category: task.category,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      ...data,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      createdAt: new Date(data.created_at),
    } as Task;
  };

  // Função para atualizar uma tarefa existente
  const updateTask = async (task: Task): Promise<Task> => {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        title: task.title,
        description: task.description,
        completed: task.completed,
        due_date: task.dueDate,
        priority: task.priority,
        category: task.category,
      })
      .eq("id", task.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      ...data,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      createdAt: new Date(data.created_at),
    } as Task;
  };

  // Função para marcar uma tarefa como completa/incompleta
  const toggleTaskCompletion = async (id: string, completed: boolean): Promise<void> => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  };

  // Função para excluir uma tarefa
  const deleteTask = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  };

  // Hook do React Query para buscar todas as tarefas
  const useTasksQuery = () => {
    return useQuery({
      queryKey: ["tasks"],
      queryFn: fetchTasks,
    });
  };

  // Hook do React Query para buscar uma tarefa específica
  const useTaskQuery = (id: string) => {
    return useQuery({
      queryKey: ["task", id],
      queryFn: () => fetchTaskById(id),
      enabled: !!id,
    });
  };

  // Mutation para adicionar uma tarefa
  const useAddTaskMutation = () => {
    return useMutation({
      mutationFn: addTask,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
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
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
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
      mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
        toggleTaskCompletion(id, completed),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
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
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
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
