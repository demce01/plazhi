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
import { AdminManagedUser } from '@/hooks/admin/useAdminUsers'; // Import type
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from "sonner";
import { Loader2, Save } from 'lucide-react';

interface AdminUsersTableProps {
  users: AdminManagedUser[];
  isLoading: boolean;
  onActionComplete: () => void; // Callback to refresh data
}

export function AdminUsersTable({ 
  users,
  isLoading,
  onActionComplete 
}: AdminUsersTableProps) {
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null); 
  const [selectedRole, setSelectedRole] = useState<{[key: string]: string}>({}); // Store role changes locally

  const handleRoleChange = (userId: string, newRole: string) => {
    setSelectedRole(prev => ({...prev, [userId]: newRole}));
  };

  const saveRoleChange = async (userId: string) => {
    const newRole = selectedRole[userId];
    if (!newRole) return; // Should not happen if button is enabled

    setProcessingId(userId);
    try {
      // Cast supabase to any for RPC call
      const { error } = await (supabase as any).rpc('set_user_role', { 
          target_user_id: userId,
          new_role: newRole 
      });

      if (error) {
          console.error("Set role RPC error:", error);
          // Check for specific permission error if needed
          if (error.code === 'P0001' || error.message.includes('Requires admin privileges') || error.message.includes('Invalid role')) { 
              throw new Error(error.message); // Show specific error from function
          } else {
              throw new Error(error.message || "Failed to update role");
          }
      }
      
      sonnerToast.success(`User role updated to ${newRole}.`);
      onActionComplete(); // Refresh user list
      // Clear local change state for this user
      setSelectedRole(prev => { 
          const newState = {...prev};
          delete newState[userId];
          return newState;
      });

    } catch (error: any) {
      toast({ title: "Role Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading && users.length === 0) {
    return <div className="text-center p-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
  }

  if (!isLoading && users.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">No users found.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Current Role</TableHead>
          <TableHead>Change Role</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isProcessing = processingId === user.user_id;
          const currentRoleSelection = selectedRole[user.user_id] || user.role;
          const hasChanged = selectedRole[user.user_id] && selectedRole[user.user_id] !== user.role;
          
          return (
            <TableRow key={user.user_id}>
              <TableCell>{user.email || 'N/A'}</TableCell>
              <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role || 'Unknown'}</Badge></TableCell>
              <TableCell>
                 <Select 
                    value={currentRoleSelection || 'client'} 
                    onValueChange={(value) => handleRoleChange(user.user_id, value)}
                    disabled={isProcessing}
                 >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
              </TableCell>
              <TableCell>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => saveRoleChange(user.user_id)} 
                  disabled={!hasChanged || isProcessing}
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
} 