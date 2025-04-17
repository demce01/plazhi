
import { useState } from "react";
import { Beach, Set, Zone } from "@/types";
import { Button } from "@/components/ui/button";
import { Grid3X3, Plus } from "lucide-react";
import { BeachLayout } from "./BeachLayout";
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

interface BeachContentProps {
  beach: Beach;
  sets: Set[];
  zones: Zone[];
  onSetAdded: (newSet: Set) => void;
  onZoneAdded: (newZone: Zone) => void;
  onDataRefresh: () => void;
}

export function BeachContent({
  beach,
  sets,
  zones,
  onSetAdded,
  onZoneAdded,
  onDataRefresh,
}: BeachContentProps) {
  const [showZoneDialog, setShowZoneDialog] = useState(false);

  const handleZoneAdded = (newZone: Zone) => {
    onZoneAdded(newZone);
    setShowZoneDialog(false);
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Beach Layout</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {beach.description || "No description provided."}
        </p>
      </div>

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
            <BeachSetForm beachId={beach.id} onSuccess={onSetAdded} />
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

      <BeachTabs 
        zones={zones} 
        sets={sets} 
        beachName={beach.name} 
        onUpdate={onDataRefresh} 
      />
    </div>
  );
}

interface BeachTabsProps {
  zones: Zone[];
  sets: Set[];
  beachName: string;
  onUpdate: () => void;
}

function BeachTabs({ zones, sets, beachName, onUpdate }: BeachTabsProps) {
  return (
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
                onUpdate={onUpdate}
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
          <BeachLayout sets={sets} beachName={beachName} />
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            No sets have been added to this beach yet.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}
