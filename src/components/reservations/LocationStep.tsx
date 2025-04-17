
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Set, Zone } from "@/types";

interface LocationStepProps {
  isActive: boolean;
  zones: Zone[];
  selectedZone: Zone | null;
  onZoneSelect: (zone: Zone) => void;
  getSetsForZone: (zoneName: string) => Set[];
  getSetsByRow: (zoneSets: Set[]) => { rowNum: number; sets: Set[] }[];
  selectedSets: Set[];
  onSelectSet: (set: Set) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function LocationStep({
  isActive,
  zones,
  selectedZone,
  onZoneSelect,
  getSetsForZone,
  getSetsByRow,
  selectedSets,
  onSelectSet,
  onContinue,
  onBack
}: LocationStepProps) {
  return (
    <div className={cn("space-y-6", !isActive && "hidden")}>
      <h2 className="text-xl font-semibold mb-4">Choose Your Beach Location</h2>
      
      {/* Zone Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {zones.length === 0 ? (
          <div className="col-span-3 p-8 text-center rounded-md border border-dashed">
            <p>No zones available for this beach. Please try another date or beach.</p>
          </div>
        ) : (
          zones.map(zone => (
            <Card 
              key={zone.id}
              className={cn(
                "cursor-pointer hover:border-blue-400 transition-all",
                selectedZone?.id === zone.id && "border-blue-500 ring-2 ring-blue-200"
              )}
              onClick={() => onZoneSelect(zone)}
            >
              <CardContent className="pt-6 text-center">
                <h3 className="font-semibold text-lg">{zone.name}</h3>
                <p className="text-blue-600 text-xl font-bold my-2">${Number(zone.price).toFixed(2)}</p>
                <p className="text-gray-500 text-sm">
                  {getSetsForZone(zone.name).filter(s => s.status !== "reserved").length} of {getSetsForZone(zone.name).length} spots available
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Beach Layout */}
      {selectedZone && (
        <div className="mt-8">
          <h3 className="font-medium mb-2">Select a specific location:</h3>
          
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="w-full p-3 mb-8 bg-blue-400 text-white text-center font-bold rounded">
              Ocean
            </div>
            
            {getSetsByRow(getSetsForZone(selectedZone.name)).map(({ rowNum, sets: rowSets }) => (
              <div key={rowNum} className="mb-4 flex items-center">
                <div className="w-16 text-right pr-4 font-medium">
                  Row {rowNum}
                </div>
                <div className="flex flex-wrap gap-2">
                  {rowSets.map(set => (
                    <button
                      key={set.id}
                      disabled={set.status === "reserved"}
                      onClick={() => onSelectSet(set)}
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all",
                        set.status === "reserved" && "bg-gray-200 border-gray-300 cursor-not-allowed",
                        selectedSets.some(s => s.id === set.id) && "bg-blue-500 text-white border-blue-600",
                        set.status !== "reserved" && !selectedSets.some(s => s.id === set.id) && "bg-green-100 border-green-300 hover:bg-green-200"
                      )}
                    >
                      {set.position}
                      {selectedSets.some(s => s.id === set.id) && (
                        <Check className="h-3 w-3 absolute top-0 right-0 text-white bg-blue-600 rounded-full p-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="w-full p-3 mt-8 bg-yellow-100 text-yellow-800 text-center font-medium rounded">
              Beach Entrance
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4 justify-end">
            <div className="flex items-center gap-1 text-xs">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="h-3 w-3 rounded-full bg-gray-300"></div>
              <span>Reserved</span>
            </div>
          </div>
          
          <div className="flex justify-end mt-6 space-x-4">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button 
              onClick={onContinue}
              disabled={selectedSets.length === 0}
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
