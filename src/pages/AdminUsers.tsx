
import { AdminLayout } from "@/components/admin/AdminLayout";
import { UsersTable } from "@/components/admin/UsersTable";
import { useAdmin } from "@/contexts/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function AdminUsers() {
  const { users, isLoadingUsers, refreshData } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredUsers = users.filter(user =>
    (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout activeTab="users" title="Gerenciamento de Usuários">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar usuários..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button 
            onClick={refreshData} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
        
        <UsersTable users={filteredUsers} isLoading={isLoadingUsers} />
      </div>
    </AdminLayout>
  );
}
