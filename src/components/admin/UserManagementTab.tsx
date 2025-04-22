
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">View, create and manage user accounts and roles.</p>
        </div>
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
