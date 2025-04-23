
import React from 'react';
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { AdminUsersTable } from "./AdminUsersTable";
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function UserManagementTab() {
  const { 
    users, 
    isLoading, 
    refreshUsers,
    refetch
  } = useAdminUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">View, create and manage user accounts and roles. "Employee" is for users that manage on-site bookings and payments.</p>
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <AdminUsersTable 
        users={users} 
        isLoading={isLoading} 
        onActionComplete={refreshUsers}
      />
    </div>
  );
}
