
import { useState, useEffect } from "react";
import { Beach, Manager } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ManagerCreationCard } from "./ManagerCreationCard";
import { ManagerAssignmentTable } from "./ManagerAssignmentTable";

interface ManagerManagementProps {
  managers: Manager[];
  beaches: Beach[];
  onUpdate: () => void;
}

export function ManagerManagement({ managers, beaches, onUpdate }: ManagerManagementProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localManagers, setLocalManagers] = useState<Manager[]>([]);

  // Update local managers when the prop changes
  useEffect(() => {
    console.log("ManagerManagement received managers:", managers);
    setLocalManagers(managers);
  }, [managers]);

  // If we have no managers, let's fetch them directly
  const fetchManagers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('managers')
        .select('*');
      
      if (error) throw error;
      
      console.log("Directly fetched managers:", data);
      setLocalManagers(data || []);
    } catch (error: any) {
      console.error("Error fetching managers:", error);
      toast({
        title: "Error loading managers",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch managers on component mount if none were provided
  useEffect(() => {
    if (managers.length === 0) {
      fetchManagers();
    }
  }, []);

  const handleSuccess = () => {
    setShowForm(false);
    onUpdate();
    fetchManagers(); // Refresh our local list
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
        <ManagerCreationCard 
          beaches={beaches} 
          onSuccess={handleSuccess} 
        />
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Beach Assignments</CardTitle>
          <CardDescription>
            Assign or reassign managers to different beaches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ManagerAssignmentTable 
            managers={localManagers}
            beaches={beaches}
            onUpdate={onUpdate}
            onCreateManager={() => setShowForm(true)}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
