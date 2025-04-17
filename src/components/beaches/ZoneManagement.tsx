
import { useState } from "react";
import { Zone, Set } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit, Trash, Grid, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ZoneForm } from "./ZoneForm";

interface ZoneManagementProps {
  zone: Zone;
  onUpdate: () => void;
  sets: Set[];
}

export function ZoneManagement({ zone, onUpdate, sets }: ZoneManagementProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const zonesSetCount = sets.filter(set => 
    set.row_number && set.row_number <= zone.rows && 
    set.position && set.position <= zone.spots_per_row
  ).length;

  const handleZoneUpdate = (updatedZone: Zone) => {
    setIsEditing(false);
    toast({
      title: "Zone updated",
      description: `${updatedZone.name} has been successfully updated.`,
    });
    onUpdate();
  };

  const handleDeleteZone = async () => {
    if (!confirm(`Are you sure you want to delete the zone "${zone.name}"? This will also delete all sets in this zone.`)) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("zones")
        .delete()
        .eq("id", zone.id);

      if (error) throw error;

      toast({
        title: "Zone deleted",
        description: `${zone.name} zone has been successfully deleted.`,
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete zone: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{zone.name}</CardTitle>
            <CardDescription>
              {zone.rows} rows × {zone.spots_per_row} spots (Price: ${Number(zone.price).toFixed(2)})
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleDeleteZone} disabled={isLoading}>
              <Trash className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          <Grid className="h-4 w-4 mr-1" />
          <span>{zonesSetCount} sets in this zone</span>
          <ArrowRight className="h-3 w-3 mx-1" />
          <span>Total capacity: {zone.rows * zone.spots_per_row} sets</span>
        </div>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Zone</DialogTitle>
              <DialogDescription>
                Make changes to the zone configuration
              </DialogDescription>
            </DialogHeader>
            <ZoneForm beachId={zone.beach_id} zone={zone} onSuccess={handleZoneUpdate} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
