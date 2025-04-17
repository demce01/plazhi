
import { Manager } from "@/types";
import { Beach } from "@/types";
import { Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ManagersTabProps {
  managers: Manager[];
  beaches: Beach[];
}

export function ManagersTab({ managers, beaches }: ManagersTabProps) {
  // Helper function to get beach name
  const getBeachName = (manager: Manager) => {
    if (!manager.beach_id) return "Not assigned to any beach";
    
    // Find the beach in the beaches array
    const beach = beaches.find(b => b.id === manager.beach_id);
    return beach ? beach.name : "Unknown Beach";
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium mb-4">Beach Managers</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {managers.length === 0 ? (
          <div className="col-span-full text-center p-6 border rounded-lg">
            <Users className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No Managers Yet</h3>
            <p className="text-muted-foreground">
              Create managers using the Manager Management tab
            </p>
          </div>
        ) : (
          managers.map(manager => (
            <Card key={manager.id}>
              <CardHeader>
                <CardTitle>Manager</CardTitle>
                <CardDescription>ID: {manager.user_id}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {manager.beach_id ? (
                    <>Managing: {getBeachName(manager)}</>
                  ) : (
                    "Not assigned to any beach"
                  )}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
