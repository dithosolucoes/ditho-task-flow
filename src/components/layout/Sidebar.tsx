
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CalendarDays, CheckSquare, Home, LayoutDashboard, ListTodo, Settings, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tarefas",
    href: "/tasks",
    icon: ListTodo,
  },
  {
    title: "Hoje",
    href: "/today",
    icon: CheckSquare,
  },
  {
    title: "Agenda",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/25 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-ditho-navy text-white transform transition-transform duration-200 ease-in-out md:translate-x-0 md:relative md:z-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="px-4 h-16 flex items-center justify-between border-b border-ditho-navy/30">
            <Logo variant="light" />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="md:hidden text-white hover:bg-ditho-navy/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                    location.pathname === item.href 
                      ? "bg-ditho-beige text-ditho-navy" 
                      : "text-white hover:bg-white/10"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </ScrollArea>
          
          <div className="p-4 text-xs text-white/60">
            Ditho Task © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </>
  );
}
