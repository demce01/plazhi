
import { Manager } from "@/types";
import { Beach } from "@/types";
import { Users, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useManagerDetails, ManagerWithUserDetails } from "@/components/managers/useManagerDetails";

interface ManagersTabProps {
  managers: Manager[];
  beaches: Beach[];
}

export function ManagersTab({ managers, beaches }: ManagersTabProps) {
  const { enrichedManagers, loading } = useManagerDetails(managers);

  // Helper function to get beach name
  const getBeachName = (manager: Manager) => {
    if (!manager.beach_id) return "Not assigned to any beach";
    
    // Find the beach in the beaches array
    const beach = beaches.find(b => b.id === manager.beach_id);
    return beach ? beach.name : "Unknown Beach";
  };

  // Helper function to get manager initials for avatar
  const getInitials = (manager: ManagerWithUserDetails) => {
    if (!manager.userDetails?.fullName) {
      return "MG";
    }
    
    const nameParts = manager.userDetails.fullName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0].substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium mb-4">Beach Managers</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {enrichedManagers.length === 0 ? (
          <div className="col-span-full text-center p-6 border rounded-lg">
            <Users className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No Managers Yet</h3>
            <p className="text-muted-foreground">
              Create managers using the Manager Management tab
            </p>
          </div>
        ) : (
          enrichedManagers.map(manager => (
            <Card key={manager.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(manager)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {manager.userDetails?.fullName || "Manager"}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {manager.userDetails?.email || "No email"}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={manager.beach_id ? "outline" : "secondary"} className="ml-auto">
                    {manager.beach_id ? "Assigned" : "Unassigned"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">Manager ID:</p>
                  <p className="text-sm font-mono bg-muted p-1 rounded">{manager.user_id}</p>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Beach Assignment:</p>
                  <p className="font-medium">
                    {manager.beach_id ? getBeachName(manager) : "Not assigned to any beach"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
