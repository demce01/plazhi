
import { Beach } from "@/types";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Edit, MapPin, Trash } from "lucide-react";

interface BeachHeaderProps {
  beach: Beach;
  isExpanded: boolean;
  isLoading: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function BeachHeader({
  beach,
  isExpanded,
  isLoading,
  onToggleExpand,
  onEdit,
  onDelete,
}: BeachHeaderProps) {
  return (
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
        <Button variant="outline" size="icon" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onDelete}
          disabled={isLoading}
        >
          <Trash className="h-4 w-4 text-destructive" />
        </Button>
        <Button variant="outline" size="icon" onClick={onToggleExpand}>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
