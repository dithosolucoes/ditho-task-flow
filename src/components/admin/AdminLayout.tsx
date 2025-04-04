
import { ReactNode, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminProvider } from "@/contexts/admin";
import { Users, ListTodo, BarChart } from "lucide-react";

type AdminLayoutProps = {
  children: ReactNode;
  activeTab: string;
  title?: string;
};

export function AdminLayout({ children, activeTab, title = "Administração" }: AdminLayoutProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart className="h-4 w-4" />, href: "/admin" },
    { id: "users", label: "Usuários", icon: <Users className="h-4 w-4" />, href: "/admin/users" },
    { id: "tasks", label: "Tarefas", icon: <ListTodo className="h-4 w-4" />, href: "/admin/tasks" },
  ];

  return (
    <AdminProvider>
      <DashboardLayout title={title}>
        <div className="space-y-4">
          <Tabs defaultValue={activeTab} className="w-full">
            <TabsList className="bg-ditho-beige/50 border border-ditho-beige/20">
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id}
                  onClick={() => window.location.href = tab.href}
                  className="flex items-center gap-2"
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={activeTab} className="mt-6">
              {children}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AdminProvider>
  );
}
