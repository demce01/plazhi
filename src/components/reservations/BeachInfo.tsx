
import { Beach, Set } from "@/types";
import { MapPin } from "lucide-react";

interface BeachInfoProps {
  beach: Beach;
  sets: Set[];
}

export function BeachInfo({ beach, sets }: BeachInfoProps) {
  return (
    <div className="bg-card p-6 rounded-lg border shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Beach Information</h2>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Beach</p>
          <p className="font-medium">{beach.name}</p>
        </div>
        
        {beach.location && (
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {beach.location}
            </p>
          </div>
        )}
        
        <div>
          <p className="text-sm text-muted-foreground">Reserved Sets</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {sets.map((set) => (
              <div key={set.id} className="px-2 py-1 bg-primary/10 rounded text-sm">
                {set.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
