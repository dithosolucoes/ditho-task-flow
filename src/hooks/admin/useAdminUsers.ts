
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminUser } from "@/contexts/admin/types";

export function useAdminUsers() {
  // Função para buscar todos os usuários
  const fetchAllUsers = async (): Promise<AdminUser[]> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching users:", error);
      throw new Error(error.message);
    }

    return data || [];
  };

  // Hook para buscar todos os usuários
  const useAllUsersQuery = () => {
    return useQuery({
      queryKey: ["admin-users"],
      queryFn: fetchAllUsers,
    });
  };

  // Função para verificar se o usuário atual é administrador
  const checkIsAdmin = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      console.error("Error checking admin status:", error);
      return false;
    }

    return data.role === 'admin';
  };

  // Hook para verificar se o usuário é administrador
  const useIsAdminQuery = () => {
    return useQuery({
      queryKey: ["is-admin"],
      queryFn: checkIsAdmin,
    });
  };

  return {
    useAllUsersQuery,
    useIsAdminQuery
  };
}
