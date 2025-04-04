
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function Admin() {
  return (
    <AdminLayout activeTab="dashboard" title="Dashboard Administrativo">
      <AdminDashboard />
    </AdminLayout>
  );
}
