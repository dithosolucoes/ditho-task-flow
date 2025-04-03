
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User, AuthError } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Inicializar a sessão e configurar ouvinte de eventos de autenticação
  useEffect(() => {
    // Primeiro configurar o ouvinte de alterações de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Log de eventos de autenticação
        console.log('Auth event:', event);
      }
    );

    // Então verificar a sessão existente
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    // Limpar inscrição ao desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Função de login real com Supabase
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return;
    } catch (error) {
      const authError = error as AuthError;
      console.error("Erro de login:", authError);
      
      // Traduzir mensagens de erro comuns
      let errorMessage = "Verifique suas credenciais e tente novamente";
      
      if (authError.message.includes("Invalid login credentials")) {
        errorMessage = "Credenciais inválidas";
      } else if (authError.message.includes("Email not confirmed")) {
        errorMessage = "Email não confirmado. Verifique sua caixa de entrada";
      }
      
      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de registro real com Supabase
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Registrar novo usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (authError) throw authError;
      
      return;
    } catch (error) {
      const authError = error as AuthError;
      console.error("Erro de registro:", authError);
      
      // Traduzir mensagens de erro comuns
      let errorMessage = "Não foi possível criar a conta";
      
      if (authError.message.includes("already registered")) {
        errorMessage = "Este email já está registrado";
      } else if (authError.message.includes("weak password")) {
        errorMessage = "A senha é muito fraca";
      }
      
      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout real com Supabase
  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: "Não foi possível encerrar sua sessão",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
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
