
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserManagementTab } from "@/components/admin/UserManagementTab";

export default function UserManagement() {
  return (
    <DashboardLayout>
      <UserManagementTab />
    </DashboardLayout>
  );
}
