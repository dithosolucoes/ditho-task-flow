
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Primeiro, configurar o listener para alterações de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed", event, newSession);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    );

    // Depois, verificar se já existe uma sessão
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Current session", currentSession);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // A sessão será atualizada via onAuthStateChange
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });
    } catch (error: any) {
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

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        throw error;
      }

      // A sessão será atualizada via onAuthStateChange

      toast({
        title: "Conta criada com sucesso",
        description: "Bem-vindo ao Ditho Task!",
      });
    } catch (error: any) {
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

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      // A sessão será atualizada via onAuthStateChange
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Você saiu da sua conta.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um erro ao tentar sair.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
