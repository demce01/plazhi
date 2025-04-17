
import { useState } from "react";
import { Manager } from "@/types";
import { Beach } from "@/types";
import { Users, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useManagerDetails, ManagerWithUserDetails } from "@/components/managers/useManagerDetails";
import { ManagerCreationCard } from "@/components/managers/ManagerCreationCard";
import { ManagerAssignmentTable } from "@/components/managers/ManagerAssignmentTable";

interface ManagersTabProps {
  managers: Manager[];
  beaches: Beach[];
  onUpdate: () => void;
}

export function ManagersTab({ managers, beaches, onUpdate }: ManagersTabProps) {
  const { enrichedManagers, loading } = useManagerDetails(managers);
  const [showForm, setShowForm] = useState(false);
  const [activeManagerTab, setActiveManagerTab] = useState("list");

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

  const handleSuccess = () => {
    setShowForm(false);
    onUpdate();
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
        <ManagerCreationCard 
          beaches={beaches} 
          onSuccess={handleSuccess} 
        />
      )}
      
      <Tabs value={activeManagerTab} onValueChange={setActiveManagerTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="list">Managers List</TabsTrigger>
          <TabsTrigger value="assignments">Beach Assignments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrichedManagers.length === 0 ? (
              <div className="col-span-full text-center p-6 border rounded-lg">
                <Users className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No Managers Yet</h3>
                <p className="text-muted-foreground">
                  Create managers using the Create Manager button above
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
        </TabsContent>
        
        <TabsContent value="assignments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Beach Assignments</CardTitle>
              <CardDescription>
                Assign or reassign managers to different beaches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ManagerAssignmentTable 
                managers={managers}
                beaches={beaches}
                onUpdate={onUpdate}
                onCreateManager={() => setShowForm(true)}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
