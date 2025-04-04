
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AdminUser } from "@/contexts/admin/types";

type UsersTableProps = {
  users: AdminUser[];
  isLoading: boolean;
};

export function UsersTable({ users, isLoading }: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Carregando usuários...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Avatar className="h-8 w-8">
                  {user.avatar_url ? (
                    <AvatarImage src={user.avatar_url} alt={user.name || "Avatar"} />
                  ) : (
                    <AvatarFallback>
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{user.name || "Sem nome"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === "admin" ? "default" : "outline"}>
                  {user.role === "admin" ? "Administrador" : "Usuário"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {/* Ações seriam adicionadas aqui em uma fase posterior */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
