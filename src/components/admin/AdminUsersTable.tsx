
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminManagedUser } from '@/hooks/admin/useAdminUsers';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from "sonner";
import { Loader2, Save, UserPlus, Search, X, Filter, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format, parseISO } from 'date-fns';

interface AdminUsersTableProps {
  users: AdminManagedUser[];
  isLoading: boolean;
  onActionComplete: () => void;
}

export function AdminUsersTable({ 
  users,
  isLoading,
  onActionComplete 
}: AdminUsersTableProps) {
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null); 
  const [selectedRole, setSelectedRole] = useState<{[key: string]: string}>({}); 
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('client');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const handleRoleChange = (userId: string, newRole: string) => {
    setSelectedRole(prev => ({...prev, [userId]: newRole}));
  };

  const saveRoleChange = async (userId: string) => {
    const newRole = selectedRole[userId];
    if (!newRole) return;

    setProcessingId(userId);
    try {
      console.log("Updating role for user:", userId, "New role:", newRole);
      const { error } = await supabase.rpc('set_user_role', { 
          target_user_id: userId,
          new_role: newRole 
      });

      if (error) {
          console.error("Set role RPC error:", error);
          if (error.code === 'P0001' || error.message.includes('Requires admin privileges') || error.message.includes('Invalid role')) { 
              throw new Error(error.message);
          } else {
              throw new Error(error.message || "Failed to update role");
          }
      }
      
      sonnerToast.success(`User role updated to ${newRole}.`);
      onActionComplete();
      setSelectedRole(prev => { 
          const newState = {...prev};
          delete newState[userId];
          return newState;
      });

    } catch (error: any) {
      console.error("Role update failed:", error);
      toast({ title: "Role Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const createNewUser = async () => {
    if (!newUserEmail.trim()) {
      toast({ 
        title: "Invalid Email", 
        description: "Please enter a valid email address", 
        variant: "destructive" 
      });
      return;
    }

    setProcessingId('new-user');
    try {
      console.log("Creating new user:", newUserEmail, "Role:", newUserRole);
      
      // First, sign up the user using the auth API with a temporary password
      const tempPassword = 'Temp' + Math.random().toString(36).slice(-8) + '!';
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: newUserEmail.trim(),
        password: tempPassword,
        options: {
          data: {
            role: newUserRole
          }
        }
      });

      if (signUpError) {
        console.error("Create user error:", signUpError);
        throw new Error(signUpError.message || "Failed to create user");
      }

      // Set the role explicitly
      if (authData.user) {
        const { error: roleError } = await supabase.rpc('set_user_role', {
          target_user_id: authData.user.id,
          new_role: newUserRole
        });

        if (roleError) {
          console.warn("Error setting user role:", roleError);
          // Continue anyway as user is created
        }
      }

      console.log("User created:", authData);
      sonnerToast.success(`User ${newUserEmail} created with role ${newUserRole}`);
      setNewUserEmail('');
      setShowAddUser(false);
      onActionComplete();
    } catch (error: any) {
      console.error("User creation failed:", error);
      toast({ 
        title: "User Creation Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Format the date string or return a placeholder
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (e) {
      console.error("Date parsing error:", e);
      return "Invalid date";
    }
  };

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading && users.length === 0) {
    return <div className="text-center p-6"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;
  }

  if (!isLoading && users.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground mb-4">No users found. Add your first user below.</p>
        <Button onClick={() => setShowAddUser(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-[250px]"
            />
            {searchTerm && (
              <Button 
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="client">Client</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowAddUser(!showAddUser)}>
          <UserPlus className="mr-2 h-4 w-4" />
          {showAddUser ? 'Cancel' : 'Add User'}
        </Button>
      </div>

      {showAddUser && (
        <Card className="border-dashed border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Create New User</CardTitle>
            <CardDescription>Add a new user and assign them a role (including employee)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Enter email address"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="flex-1"
              />
              <Select value={newUserRole} onValueChange={setNewUserRole}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={createNewUser} disabled={processingId === 'new-user' || !newUserEmail.trim()}>
                {processingId === 'new-user' ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <UserPlus className="h-4 w-4 mr-2"/>}
                Create User
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-background border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="hidden md:table-cell">Last Sign In</TableHead>
              <TableHead>Change Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No users match your search criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const isProcessing = processingId === user.user_id;
                const currentRoleSelection = selectedRole[user.user_id] || user.role;
                const hasChanged = selectedRole[user.user_id] && selectedRole[user.user_id] !== user.role;
                
                return (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">{user.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={
                        user.role === 'admin' ? 'default' : 
                        user.role === 'employee' ? 'secondary' : 'outline'
                      }>
                        {user.role || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-3 w-3 opacity-70" />
                        {formatDate(user.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {user.last_sign_in ? (
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-3 w-3 opacity-70" />
                          {formatDate(user.last_sign_in)}
                        </div>
                      ) : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={currentRoleSelection || 'client'} 
                        onValueChange={(value) => handleRoleChange(user.user_id, value)}
                        disabled={isProcessing}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant={hasChanged ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => saveRoleChange(user.user_id)} 
                        disabled={!hasChanged || isProcessing}
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Save className="h-4 w-4 mr-2"/>}
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
