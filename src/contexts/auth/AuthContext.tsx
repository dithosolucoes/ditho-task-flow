
import { createContext, useContext, ReactNode } from "react";
import { AuthContextType } from "./types";
import { useAuthState } from "./useAuthState";
import { login, logout, register } from "./authOperations";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    user,
    setUser,
    session,
    setSession,
    loading,
    setLoading,
    emailConfirmationPending,
    setEmailConfirmationPending,
    pendingEmail,
    setPendingEmail,
    navigate
  } = useAuthState();

  // Wrap the auth operations
  const handleLogin = async (email: string, password: string) => {
    return login(
      email, 
      password, 
      setLoading, 
      setEmailConfirmationPending, 
      setPendingEmail, 
      navigate
    );
  };

  const handleRegister = async (name: string, email: string, password: string, role: 'user' | 'admin' = 'user') => {
    return register(
      name, 
      email, 
      password,
      role, 
      setLoading, 
      setEmailConfirmationPending, 
      setPendingEmail, 
      navigate
    );
  };

  const handleLogout = async () => {
    return logout(
      setLoading, 
      setUser, 
      setSession, 
      setEmailConfirmationPending, 
      setPendingEmail, 
      navigate
    );
  };

  // Only render children when auth state is determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ditho-beige">
        <div className="animate-pulse text-center">
          <p className="text-lg text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user && !!session,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        loading,
        emailConfirmationPending,
        pendingEmail
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
