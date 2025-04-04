
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";

export const login = async (
  email: string, 
  password: string,
  setLoading: (loading: boolean) => void,
  setEmailConfirmationPending: (pending: boolean) => void,
  setPendingEmail: (email: string | null) => void,
  navigate: NavigateFunction
) => {
  try {
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Handle specific error for email not confirmed
      if (error.message === "Email not confirmed") {
        setEmailConfirmationPending(true);
        setPendingEmail(email);
        throw new Error("Email não confirmado. Por favor, verifique sua caixa de entrada para o link de confirmação.");
      }
      throw error;
    }

    console.log("Login successful, user:", data.user?.id);
    
    // Verificar se o usuário é admin e redirecionar adequadamente
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user?.id)
      .single();
      
    if (profileData?.role === 'admin') {
      toast({
        title: "Login de administrador realizado",
        description: "Bem-vindo ao painel administrativo!",
      });
      navigate("/admin");
    } else {
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });
      navigate("/dashboard");
    }
  } catch (error: any) {
    console.error("Login error:", error);
    toast({
      title: "Erro ao fazer login",
      description: error.message || "Ocorreu um erro ao tentar fazer login.",
      variant: "destructive",
    });
    throw error;
  } finally {
    setLoading(false);
  }
};

export const register = async (
  name: string, 
  email: string, 
  password: string,
  role: 'user' | 'admin' = 'user',
  setLoading: (loading: boolean) => void,
  setEmailConfirmationPending: (pending: boolean) => void,
  setPendingEmail: (email: string | null) => void,
  navigate: NavigateFunction
) => {
  try {
    setLoading(true);
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role, // Incluindo o papel do usuário nos metadados
        },
      },
    });

    if (error) {
      throw error;
    }

    console.log("Registration successful, user:", data.user?.id);
    
    // Check if email confirmation is needed
    if (data?.user && !data.session) {
      setEmailConfirmationPending(true);
      setPendingEmail(email);
      
      toast({
        title: "Quase lá!",
        description: "Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.",
      });
      
      navigate("/login");
    } else {
      // Se o usuário for admin, redirecionar para o painel admin
      if (role === 'admin') {
        toast({
          title: "Conta de administrador criada",
          description: "Você foi registrado como administrador do sistema.",
        });
        
        navigate("/admin");
      } else {
        toast({
          title: "Conta criada com sucesso",
          description: "Você está agora autenticado no sistema.",
        });
        
        navigate("/dashboard");
      }
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    toast({
      title: "Erro ao criar conta",
      description: error.message || "Ocorreu um erro ao tentar criar sua conta.",
      variant: "destructive",
    });
    throw error;
  } finally {
    setLoading(false);
  }
};

export const logout = async (
  setLoading: (loading: boolean) => void,
  setUser: (user: null) => void,
  setSession: (session: null) => void,
  setEmailConfirmationPending: (pending: boolean) => void,
  setPendingEmail: (email: string | null) => void,
  navigate: NavigateFunction
) => {
  try {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    // Clear user and session state
    setUser(null);
    setSession(null);
    setEmailConfirmationPending(false);
    setPendingEmail(null);
    
    toast({
      title: "Logout realizado com sucesso",
      description: "Você saiu da sua conta.",
    });
    
    navigate("/login");
  } catch (error: any) {
    console.error("Logout error:", error);
    toast({
      title: "Erro ao fazer logout",
      description: error.message || "Ocorreu um erro ao tentar sair.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
