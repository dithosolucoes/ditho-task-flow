
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AdminContextType, AdminUser, AdminTask } from "./types";
import { useAdminUsers, useAdminTasks } from "@/hooks/admin";
import { useNavigate } from "react-router-dom";

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  const navigate = useNavigate();
  
  const { useAllUsersQuery, useIsAdminQuery } = useAdminUsers();
  const { useAllTasksQuery, useAssignTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } = useAdminTasks();
  
  const { data: usersData, isLoading: isLoadingUsers, refetch: refetchUsers } = useAllUsersQuery();
  const { data: tasksData, isLoading: isLoadingTasks, refetch: refetchTasks } = useAllTasksQuery();
  const { data: isAdmin = false, isLoading: isLoadingAdmin } = useIsAdminQuery();
  
  const assignTaskMutation = useAssignTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  useEffect(() => {
    if (usersData) {
      setUsers(usersData);
    }
  }, [usersData]);

  useEffect(() => {
    if (tasksData) {
      setTasks(tasksData);
    }
  }, [tasksData]);

  // Redirecionar se não for administrador
  useEffect(() => {
    if (!isLoadingAdmin && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, isLoadingAdmin, navigate]);

  const refreshData = () => {
    refetchUsers();
    refetchTasks();
  };

  const assignTask = (task: Omit<AdminTask, "id" | "createdAt">) => {
    assignTaskMutation.mutate(task);
  };

  const updateTask = (task: AdminTask) => {
    updateTaskMutation.mutate(task);
  };

  const deleteTask = (id: string) => {
    deleteTaskMutation.mutate(id);
  };

  const value = {
    users,
    tasks,
    isLoadingUsers,
    isLoadingTasks,
    error,
    refreshData,
    assignTask,
    updateTask,
    deleteTask,
    isAdmin
  };

  // Enquanto carrega o status de administrador, mostra carregando
  if (isLoadingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ditho-beige">
        <div className="animate-pulse text-center">
          <p className="text-lg text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Só renderiza se for administrador
  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
