
import { useState, useEffect } from "react";
import { Beach, Manager } from "@/types";
import { Loader2, UserPlus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
        <h3 className="text-lg font-medium mb-2">No Managers Available</h3>
        <p className="text-muted-foreground mb-4">
          Create your first manager to start assigning them to beaches
        </p>
        <Button onClick={onCreateManager}>
          <UserPlus className="mr-2 h-4 w-4" /> Create Manager
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert variant="default" className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          Changes to beach assignments take effect immediately
        </AlertDescription>
      </Alert>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Manager ID</TableHead>
            <TableHead>Assigned Beach</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localManagers.map(manager => (
            <TableRow key={manager.id}>
              <TableCell className="font-mono text-xs">{manager.id.substring(0, 8)}...</TableCell>
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
                    <SelectTrigger className="w-[180px]">
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
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Unassigned
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Manager info</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>User ID: {manager.user_id}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
