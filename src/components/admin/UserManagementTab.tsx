
import React, { useState } from 'react';
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { AdminUsersTable } from "./AdminUsersTable";
import { AddUserForm } from "./AddUserForm";
import { Button } from '@/components/ui/button';
import { RefreshCw, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function UserManagementTab() {
  const [activeTab, setActiveTab] = useState<string>("usersList");
  const { 
    users, 
    isLoading, 
    refreshUsers,
    refetch
  } = useAdminUsers();

  const handleUserCreated = () => {
    refreshUsers();
    setActiveTab("usersList");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">View, create and manage user accounts and roles. "Employee" is for users that manage on-site bookings and payments.</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="usersList">Users List</TabsTrigger>
            <TabsTrigger value="addUser">Add Employee</TabsTrigger>
          </TabsList>
          
          {activeTab === "usersList" && (
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          
          {activeTab === "usersList" && (
            <Button onClick={() => setActiveTab("addUser")}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          )}
        </div>
        
        <TabsContent value="usersList" className="mt-4">
          <AdminUsersTable 
            users={users} 
            isLoading={isLoading} 
            onActionComplete={refreshUsers}
          />
        </TabsContent>
        
        <TabsContent value="addUser" className="mt-4">
          <AddUserForm 
            onSuccess={handleUserCreated}
            defaultRole="employee"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
