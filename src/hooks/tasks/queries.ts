
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/task";
import { TaskApi } from "./types";
import { useAuth } from "@/contexts/auth";

export function createTaskQueries(taskApi: TaskApi) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Hook do React Query para buscar todas as tarefas
  const useTasksQuery = () => {
    const { isAuthenticated } = useAuth();
    
    return useQuery({
      queryKey: ["tasks", user?.id],
      queryFn: taskApi.fetchTasks,
      enabled: isAuthenticated && !!user,
    });
  };

  // Hook do React Query para buscar uma tarefa específica
  const useTaskQuery = (id: string) => {
    const { isAuthenticated } = useAuth();
    
    return useQuery({
      queryKey: ["task", id, user?.id],
      queryFn: () => taskApi.fetchTaskById(id),
      enabled: isAuthenticated && !!user && !!id,
    });
  };

  // Mutation para adicionar uma tarefa
  const useAddTaskMutation = () => {
    return useMutation({
      mutationFn: taskApi.addTask,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks", user?.id] });
        toast({
          title: "Tarefa adicionada",
          description: "Tarefa adicionada com sucesso.",
        });
      },
      onError: (error: any) => {
        console.error("Error in useAddTaskMutation:", error);
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
      mutationFn: taskApi.updateTask,
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
      mutationFn: taskApi.toggleTaskCompletion,
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
      mutationFn: taskApi.deleteTask,
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
