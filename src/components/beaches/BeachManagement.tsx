
import { useState } from "react";
import { Beach, Set } from "@/types";
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
import { ChevronDown, ChevronUp, Edit, MapPin, Plus, Trash } from "lucide-react";
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

interface BeachManagementProps {
  beach: Beach;
  onUpdate: () => void;
}

export function BeachManagement({ beach, onUpdate }: BeachManagementProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sets, setSets] = useState<Set[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleBeachUpdate = (updatedBeach: Beach) => {
    setIsEditing(false);
    toast({
      title: "Beach updated",
      description: `${updatedBeach.name} has been successfully updated.`,
    });
    onUpdate();
  };

  const handleDeleteBeach = async () => {
    if (!confirm(`Are you sure you want to delete ${beach.name}?`)) return;

    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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

  const handleSetAdded = (newSet: Set) => {
    setSets(prev => [...prev, newSet]);
    toast({
      title: "Set added",
      description: `${newSet.name} has been added to ${beach.name}.`,
    });
  };

  const toggleExpand = () => {
    const newExpandState = !isExpanded;
    setIsExpanded(newExpandState);
    if (newExpandState) {
      fetchSets();
    }
  };

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
            <Button variant="outline" size="icon" onClick={handleDeleteBeach} disabled={isLoading}>
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
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Beach Set
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

            {sets.length > 0 ? (
              <BeachLayout sets={sets} beachName={beach.name} />
            ) : (
              <p>No sets have been added to this beach yet.</p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
