
import { useState } from "react";
import { Beach, Manager } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ManagerForm } from "./ManagerForm";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, UserPlus } from "lucide-react";

interface ManagerManagementProps {
  managers: Manager[];
  beaches: Beach[];
  onUpdate: () => void;
}

export function ManagerManagement({ managers, beaches, onUpdate }: ManagerManagementProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const getBeachName = (beachId: string | null) => {
    if (!beachId) return "Not assigned";
    const beach = beaches.find(b => b.id === beachId);
    return beach ? beach.name : "Unknown Beach";
  };

  const handleBeachAssignment = async (managerId: string, beachId: string | null) => {
    try {
      setUpdating(managerId);
      
      const { error } = await supabase
        .from("managers")
        .update({ beach_id: beachId === "none" ? null : beachId })
        .eq("id", managerId);
      
      if (error) throw error;
      
      toast({
        title: "Manager updated",
        description: beachId && beachId !== "none" 
          ? `Manager assigned to ${getBeachName(beachId)}`
          : "Manager removed from beach assignment",
      });
      
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Beach Managers</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            "Cancel"
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" /> Create Manager
            </>
          )}
        </Button>
      </div>
      
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Manager</CardTitle>
            <CardDescription>
              Add a new manager and optionally assign them to a beach
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ManagerForm 
              beaches={beaches} 
              onSuccess={() => {
                setShowForm(false);
                onUpdate();
              }} 
            />
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Beach Assignments</CardTitle>
          <CardDescription>
            Assign or reassign managers to different beaches
          </CardDescription>
        </CardHeader>
        <CardContent>
          {managers.length === 0 ? (
            <div className="text-center p-6">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Managers Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first manager to help manage beach operations
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Manager
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manager ID</TableHead>
                  <TableHead>Assigned Beach</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.map(manager => (
                  <TableRow key={manager.id}>
                    <TableCell className="font-medium">{manager.user_id}</TableCell>
                    <TableCell>
                      {updating === manager.id ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Updating...
                        </div>
                      ) : (
                        <Select 
                          defaultValue={manager.beach_id || "none"}
                          onValueChange={(value) => handleBeachAssignment(manager.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue>
                              {getBeachName(manager.beach_id)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Not assigned</SelectItem>
                            {beaches.map((beach) => (
                              <SelectItem key={beach.id} value={beach.id}>
                                {beach.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      {/* Additional actions can be added here */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
