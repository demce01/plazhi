import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { AdminUsersTable } from "./AdminUsersTable";

export function UserManagementTab() {
  const { 
    users, 
    isLoading, 
    refreshUsers 
  } = useAdminUsers();

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View and manage user accounts and roles.</CardDescription>
      </CardHeader>
      <CardContent>
        <AdminUsersTable 
          users={users} 
          isLoading={isLoading} 
          onActionComplete={refreshUsers}
        />
      </CardContent>
    </Card>
  );
} 