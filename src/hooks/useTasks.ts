
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { User } from "@supabase/supabase-js";

// Define the database task type
type DbTask = Database["public"]["Tables"]["tasks"]["Row"];

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
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
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
    // Obter o usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
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

    const { data, error } = await supabase
      .from("tasks")
      .insert(taskData)
      .select()
      .single();

    if (error) {
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
      mutationFn: toggleTaskCompletion,
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
