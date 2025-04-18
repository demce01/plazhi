import { useState } from "react";
import { Beach } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { BeachForm } from "./BeachForm";
import { BeachHeader } from "./BeachHeader";
import { BeachContent } from "./BeachContent";
import { BeachDeleteDialog } from "./BeachDeleteDialog";
import { useBeachData } from "./useBeachData";
import { useBeachOperations } from "./useBeachOperations";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BeachManagementProps {
  beach: Beach;
  onUpdate: () => void;
}

export function BeachManagement({ beach, onUpdate }: BeachManagementProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Custom hooks for data and operations
  const { 
    sets, 
    zones, 
    isLoading: dataLoading, 
    setSets, 
    setZones, 
    refreshData 
  } = useBeachData(beach, isExpanded);

  const { 
    isLoading: operationsLoading, 
    handleBeachUpdate, 
    handleDeleteBeach, 
    handleSetAdded, 
    handleZoneAdded 
  } = useBeachOperations(beach, onUpdate);

  const isLoading = dataLoading || operationsLoading;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card>
      <CardHeader>
        <BeachHeader 
          beach={beach}
          isExpanded={isExpanded}
          isLoading={isLoading}
          onToggleExpand={toggleExpand}
          onEdit={() => setIsEditing(!isEditing)}
          onDelete={() => setShowDeleteConfirm(true)}
        />
      </CardHeader>

      <BeachDeleteDialog
        beachName={beach.name}
        isOpen={showDeleteConfirm}
        isLoading={isLoading}
        onOpenChange={setShowDeleteConfirm}
        onConfirmDelete={handleDeleteBeach}
      />

      {isEditing && (
        <CardContent>
          <BeachForm beach={beach} onSuccess={handleBeachUpdate} />
        </CardContent>
      )}

      {isExpanded && (
        <CardContent>
          <BeachContent 
            beach={beach}
            sets={sets}
            zones={zones}
            onSetAdded={(newSet) => handleSetAdded(newSet, sets, setSets)}
            onZoneAdded={(newZone) => handleZoneAdded(newZone, zones, setZones)}
            onDataRefresh={refreshData}
          />
        </CardContent>
      )}
    </Card>
  );
}
