
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTaskList } from "@/components/admin/AdminTaskList";

export default function AdminTasks() {
  return (
    <AdminLayout activeTab="tasks" title="Gestão de Tarefas">
      <AdminTaskList />
    </AdminLayout>
  );
}
