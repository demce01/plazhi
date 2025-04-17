
import { useState, useEffect } from "react";
import { Beach, Manager } from "@/types";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useManagerOperations } from "./useManagerOperations";

interface ManagerAssignmentTableProps {
  managers: Manager[];
  beaches: Beach[];
  onUpdate: () => void;
  onCreateManager: () => void;
  loading: boolean;
}

export function ManagerAssignmentTable({ 
  managers, 
  beaches, 
  onUpdate, 
  onCreateManager,
  loading 
}: ManagerAssignmentTableProps) {
  const { updating, getBeachName, handleBeachAssignment } = useManagerOperations(onUpdate);
  const [localManagers, setLocalManagers] = useState<Manager[]>([]);

  useEffect(() => {
    console.log("ManagerAssignmentTable received managers:", managers);
    setLocalManagers(managers);
  }, [managers]);

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (localManagers.length === 0) {
    return (
      <div className="text-center p-6">
        <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Managers Yet</h3>
        <p className="text-muted-foreground mb-4">
          Create your first manager to help manage beach operations
        </p>
        <Button onClick={onCreateManager}>
          <UserPlus className="mr-2 h-4 w-4" /> Create Manager
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Manager ID</TableHead>
          <TableHead>Assigned Beach</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {localManagers.map(manager => (
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
                  onValueChange={(value) => handleBeachAssignment(manager.id, value, beaches)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {getBeachName(manager.beach_id, beaches)}
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
              {manager.beach_id ? (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  Unassigned
                </Badge>
              )}
            </TableCell>
            <TableCell>
              {/* Additional actions can be added here */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
