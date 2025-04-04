
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/auth/AuthCard";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Mail } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, emailConfirmationPending, pendingEmail } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor preencha todos os campos",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await login(email, password);
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao Ditho Task",
      });
      navigate("/dashboard");
    } catch (error) {
      // Toast is already shown in the login function
      console.error("Login error in component:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-fill email if coming from registration with pending confirmation
  if (pendingEmail && email === "") {
    setEmail(pendingEmail);
  }

  return (
    <AuthCard 
      title="Entrar" 
      description="Faça login na sua conta para continuar"
      footer={
        <div className="text-center w-full">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link 
              to="/register" 
              className="text-ditho-navy hover:underline font-medium"
            >
              Registrar
            </Link>
          </p>
        </div>
      }
    >
      {emailConfirmationPending && (
        <Alert variant="warning" className="mb-4 bg-amber-50 border-amber-200">
          <Mail className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Confirmação de email pendente</AlertTitle>
          <AlertDescription className="text-amber-700">
            Por favor, verifique seu email e clique no link de confirmação para ativar sua conta.
            {pendingEmail && ` Enviamos um email para ${pendingEmail}.`}
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link 
              to="/forgot-password" 
              className="text-sm text-ditho-navy hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-ditho-navy hover:bg-ditho-dark-navy text-white"
          disabled={isLoading}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </AuthCard>
  );
};

export default Login;

