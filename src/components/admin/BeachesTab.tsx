
import { useState } from "react";
import { Beach } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BeachForm } from "@/components/beaches/BeachForm";
import { BeachManagement } from "@/components/beaches/BeachManagement";

interface BeachesTabProps {
  beaches: Beach[];
  onBeachCreated: (beach: Beach) => void;
  onUpdate: () => void;
}

export function BeachesTab({ beaches, onBeachCreated, onUpdate }: BeachesTabProps) {
  const [showBeachForm, setShowBeachForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Beaches</h2>
        <Button onClick={() => setShowBeachForm(!showBeachForm)}>
          <Plus className="mr-2 h-4 w-4" /> {showBeachForm ? "Cancel" : "Create Beach"}
        </Button>
      </div>

      {showBeachForm && (
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Create New Beach</h2>
          <BeachForm onSuccess={onBeachCreated} />
        </div>
      )}

      <div className="grid gap-4">
        {beaches.length === 0 ? (
          <div className="text-center p-10 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">No Beaches Yet</h2>
            <p className="text-muted-foreground mb-4">
              Start by creating your first beach and setting up the layout
            </p>
            <Button onClick={() => setShowBeachForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Your First Beach
            </Button>
          </div>
        ) : (
          beaches.map(beach => (
            <BeachManagement key={beach.id} beach={beach} onUpdate={onUpdate} />
          ))
        )}
      </div>
    </div>
  );
}
