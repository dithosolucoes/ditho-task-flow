
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useState } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
  title: string;
};

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get the user's name from user_metadata or custom claims
  const getUserName = () => {
    if (!user) return 'Usuário';
    
    // Try to get name from user_metadata (set during signup)
    if (user.user_metadata && user.user_metadata.name) {
      return user.user_metadata.name.split(' ')[0];
    }
    
    // Fallback to email
    if (user.email) {
      // Use the part before @ as a name
      return user.email.split('@')[0];
    }
    
    return 'Usuário';
  };

  return (
    <div className="flex h-screen bg-ditho-light-beige">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-ditho-beige shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="mr-4 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Logo className="hidden md:block" />
              <h1 className="ml-4 text-xl font-semibold text-ditho-navy">{title}</h1>
            </div>
            
            <div className="flex items-center">
              <div className="mr-4 text-sm text-gray-600">
                Olá, {getUserName()}
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="text-gray-500 hover:text-ditho-navy"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-ditho-light-beige p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
