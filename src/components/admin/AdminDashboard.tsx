
import { useAdmin } from "@/contexts/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskPriorityPieChart } from "./charts/TaskPriorityPieChart";
import { TaskCompletionBarChart } from "./charts/TaskCompletionBarChart";
import { Users, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function AdminDashboard() {
  const { users, tasks, isLoadingUsers, isLoadingTasks } = useAdmin();
  const [stats, setStats] = useState({
    totalUsers: 0,
    completedTasks: 0,
    pendingTasks: 0,
    urgentTasks: 0
  });

  useEffect(() => {
    if (!isLoadingUsers && !isLoadingTasks) {
      setStats({
        totalUsers: users.length,
        completedTasks: tasks.filter(task => task.completed).length,
        pendingTasks: tasks.filter(task => !task.completed).length,
        urgentTasks: tasks.filter(task => task.priority === 'high' && !task.completed).length
      });
    }
  }, [users, tasks, isLoadingUsers, isLoadingTasks]);

  // Preparar dados para os gráficos
  const priorityData = useMemo(() => {
    if (isLoadingTasks) return [];
    
    const counts = { low: 0, medium: 0, high: 0 };
    tasks.forEach(task => {
      counts[task.priority] += 1;
    });
    
    return [
      { name: 'Baixa', value: counts.low },
      { name: 'Média', value: counts.medium },
      { name: 'Alta', value: counts.high },
    ];
  }, [tasks, isLoadingTasks]);

  const completionData = useMemo(() => {
    if (isLoadingTasks || isLoadingUsers) return [];
    
    const userCompletionMap = new Map();
    users.forEach(user => {
      userCompletionMap.set(user.id, {
        name: user.name || user.email?.split('@')[0] || 'Usuário',
        completed: 0,
        pending: 0
      });
    });
    
    tasks.forEach(task => {
      if (userCompletionMap.has(task.user_id)) {
        const userData = userCompletionMap.get(task.user_id);
        if (task.completed) {
          userData.completed += 1;
        } else {
          userData.pending += 1;
        }
      }
    });
    
    return Array.from(userCompletionMap.values())
      .filter(data => data.completed > 0 || data.pending > 0)
      .sort((a, b) => (b.completed + b.pending) - (a.completed + a.pending))
      .slice(0, 5);
  }, [users, tasks, isLoadingUsers, isLoadingTasks]);

  if (isLoadingUsers || isLoadingTasks) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.urgentTasks}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribuição por Prioridade</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <TaskPriorityPieChart data={priorityData} />
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Conclusão por Usuário</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <TaskCompletionBarChart data={completionData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
