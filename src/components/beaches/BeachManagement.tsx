
import { useState, useEffect } from "react";
import { Beach, Set, Zone } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BeachForm } from "./BeachForm";
import { BeachLayout } from "./BeachLayout";
import { ChevronDown, ChevronUp, Edit, MapPin, Plus, Trash, Grid3X3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BeachSetForm } from "./BeachSetForm";
import { ZoneForm } from "./ZoneForm";
import { ZoneManagement } from "./ZoneManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BeachManagementProps {
  beach: Beach;
  onUpdate: () => void;
}

export function BeachManagement({ beach, onUpdate }: BeachManagementProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sets, setSets] = useState<Set[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showZoneDialog, setShowZoneDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleBeachUpdate = (updatedBeach: Beach) => {
    setIsEditing(false);
    toast({
      title: "Beach updated",
      description: `${updatedBeach.name} has been successfully updated.`,
    });
    onUpdate();
  };

  const handleDeleteBeach = async () => {
    try {
      setIsLoading(true);
      
      // First, check for any managers that might be assigned to this beach
      const { data: managers, error: managersError } = await supabase
        .from("managers")
        .select("id")
        .eq("beach_id", beach.id);
        
      if (managersError) throw managersError;
      
      // If there are managers assigned to this beach, unassign them
      if (managers && managers.length > 0) {
        const { error: updateError } = await supabase
          .from("managers")
          .update({ beach_id: null })
          .eq("beach_id", beach.id);
          
        if (updateError) throw updateError;
      }
      
      // Delete all zones belonging to this beach
      const { error: zonesError } = await supabase
        .from("zones")
        .delete()
        .eq("beach_id", beach.id);
      
      if (zonesError) throw zonesError;
      
      // Delete all sets belonging to this beach
      const { error: setsError } = await supabase
        .from("sets")
        .delete()
        .eq("beach_id", beach.id);
      
      if (setsError) throw setsError;
      
      // Check for reservations related to this beach
      const { data: reservations, error: reservationsError } = await supabase
        .from("reservations")
        .select("id")
        .eq("beach_id", beach.id);
        
      if (reservationsError) throw reservationsError;
      
      // If there are reservations, delete them
      if (reservations && reservations.length > 0) {
        // Delete reservation_sets for each reservation
        for (const reservation of reservations) {
          const { error: rSetsError } = await supabase
            .from("reservation_sets")
            .delete()
            .eq("reservation_id", reservation.id);
            
          if (rSetsError) throw rSetsError;
        }
        
        // Now delete the reservations
        const { error: deleteReservationsError } = await supabase
          .from("reservations")
          .delete()
          .eq("beach_id", beach.id);
          
        if (deleteReservationsError) throw deleteReservationsError;
      }
      
      // Finally delete the beach itself
      const { error } = await supabase
        .from("beaches")
        .delete()
        .eq("id", beach.id);

      if (error) throw error;

      toast({
        title: "Beach deleted",
        description: `${beach.name} has been successfully deleted.`,
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete beach: ${error.message}`,
        variant: "destructive",
      });
      console.error("Delete beach error:", error);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const fetchSets = async () => {
    if (!isExpanded) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("sets")
        .select("*")
        .eq("beach_id", beach.id)
        .order("row_number")
        .order("position");

      if (error) throw error;
      setSets(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to load beach sets: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchZones = async () => {
    if (!isExpanded) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("zones")
        .select("*")
        .eq("beach_id", beach.id)
        .order("created_at");

      if (error) throw error;
      setZones(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to load beach zones: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetAdded = (newSet: Set) => {
    setSets(prev => [...prev, newSet]);
    toast({
      title: "Set added",
      description: `${newSet.name} has been added to ${beach.name}.`,
    });
  };

  const handleZoneAdded = (newZone: Zone) => {
    setZones(prev => [...prev, newZone]);
    setShowZoneDialog(false);
    toast({
      title: "Zone created",
      description: `${newZone.name} zone has been created with ${newZone.rows * newZone.spots_per_row} sets.`,
    });
    fetchSets();
  };

  const refreshData = () => {
    fetchZones();
    fetchSets();
  };

  const toggleExpand = () => {
    const newExpandState = !isExpanded;
    setIsExpanded(newExpandState);
    if (newExpandState) {
      fetchZones();
      fetchSets();
    }
  };

  useEffect(() => {
    if (isExpanded) {
      refreshData();
    }
  }, [isExpanded]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{beach.name}</CardTitle>
            {beach.location && (
              <CardDescription className="flex items-center mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {beach.location}
              </CardDescription>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setShowDeleteConfirm(true)} 
              disabled={isLoading}
            >
              <Trash className="h-4 w-4 text-destructive" />
            </Button>
            <Button variant="outline" size="icon" onClick={toggleExpand}>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the beach "{beach.name}" and all associated sets and zones.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteBeach}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Beach"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isEditing && (
        <CardContent>
          <BeachForm beach={beach} onSuccess={handleBeachUpdate} />
        </CardContent>
      )}

      {isExpanded && (
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Beach Layout</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {beach.description || "No description provided."}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <Button onClick={() => setShowZoneDialog(true)}>
                <Grid3X3 className="h-4 w-4 mr-1" /> Create Zone
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> Add Individual Set
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Beach Set</DialogTitle>
                    <DialogDescription>
                      Create a new umbrella and chair set for {beach.name}
                    </DialogDescription>
                  </DialogHeader>
                  <BeachSetForm beachId={beach.id} onSuccess={handleSetAdded} />
                </DialogContent>
              </Dialog>
            </div>

            <Dialog open={showZoneDialog} onOpenChange={setShowZoneDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Zone</DialogTitle>
                  <DialogDescription>
                    Define a new zone with multiple umbrella sets
                  </DialogDescription>
                </DialogHeader>
                <ZoneForm beachId={beach.id} onSuccess={handleZoneAdded} />
              </DialogContent>
            </Dialog>

            <Tabs defaultValue="zones" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="zones">Zones</TabsTrigger>
                <TabsTrigger value="sets">All Sets</TabsTrigger>
              </TabsList>
              
              <TabsContent value="zones" className="mt-4">
                {zones.length > 0 ? (
                  <div className="space-y-2">
                    {zones.map(zone => (
                      <ZoneManagement 
                        key={zone.id} 
                        zone={zone} 
                        onUpdate={refreshData}
                        sets={sets.filter(set => 
                          set.name.startsWith(zone.name)
                        )}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    No zones have been created yet. Create a zone to automatically generate umbrella sets.
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="sets" className="mt-4">
                {sets.length > 0 ? (
                  <BeachLayout sets={sets} beachName={beach.name} />
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    No sets have been added to this beach yet.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
