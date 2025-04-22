
import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Beach } from "@/types";
import { BeachManagement } from "@/components/beaches/BeachManagement";
import { BeachForm } from "@/components/beaches/BeachForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function BeachesManagement() {
  const { toast } = useToast();
  const [showBeachForm, setShowBeachForm] = useState(false);

  const { data: beaches = [], refetch: refreshBeaches } = useQuery<Beach[]>({
    queryKey: ['adminBeaches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beaches')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleBeachCreated = useCallback((beach: Beach) => {
    setShowBeachForm(false);
    refreshBeaches();
    toast({
      title: "Beach created",
      description: `${beach.name} has been successfully created.`,
    });
  }, [refreshBeaches, toast]);

  console.log("BeachesManagement rendering, beaches:", beaches); // Debug log

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Beaches</h1>
          <p className="text-muted-foreground">Manage your beaches and their layouts</p>
        </div>

        <Button onClick={() => setShowBeachForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Beach
        </Button>
      </div>

      <Dialog open={showBeachForm} onOpenChange={setShowBeachForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Beach</DialogTitle>
            <DialogDescription>
              Add a new beach to your portfolio
            </DialogDescription>
          </DialogHeader>
          <BeachForm onSuccess={handleBeachCreated} />
        </DialogContent>
      </Dialog>

      <div className="grid gap-6">
        {beaches.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Beaches Yet</CardTitle>
              <CardDescription>Start by creating your first beach</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowBeachForm(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Your First Beach
              </Button>
            </CardContent>
          </Card>
        ) : (
          beaches.map((beach) => (
            <BeachManagement 
              key={beach.id} 
              beach={beach}
              onUpdate={refreshBeaches}
            />
          ))
        )}
      </div>
    </div>
  );
}
