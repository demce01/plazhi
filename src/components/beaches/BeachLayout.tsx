
import { useMemo } from "react";
import { Set } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Umbrella } from "lucide-react";

interface BeachLayoutProps {
  sets: Set[];
  beachName: string;
  onSelectSet?: (set: Set) => void;
  selectedSets?: Set[];
  disabledSets?: Set[];
}

export function BeachLayout({ 
  sets, 
  beachName, 
  onSelectSet,
  selectedSets = [],
  disabledSets = []
}: BeachLayoutProps) {
  // Group sets by row number
  const rowsMap = useMemo(() => {
    const map = new Map<number, Set[]>();
    
    sets.forEach(set => {
      const rowNumber = set.row_number || 0;
      if (!map.has(rowNumber)) {
        map.set(rowNumber, []);
      }
      map.get(rowNumber)?.push(set);
    });
    
    // Sort each row by position
    map.forEach((rowSets, rowNum) => {
      map.set(
        rowNum,
        rowSets.sort((a, b) => (a.position || 0) - (b.position || 0))
      );
    });
    
    return map;
  }, [sets]);

  // Convert to sorted array of rows
  const rows = useMemo(() => {
    return Array.from(rowsMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([rowNum, rowSets]) => ({
        rowNum,
        sets: rowSets
      }));
  }, [rowsMap]);

  const isSetSelected = (set: Set) => {
    return selectedSets.some(s => s.id === set.id);
  };

  const isSetDisabled = (set: Set) => {
    return set.status === 'reserved' || 
           disabledSets.some(s => s.id === set.id);
  };

  const handleSetClick = (set: Set) => {
    if (!onSelectSet || isSetDisabled(set)) return;
    onSelectSet(set);
  };

  if (rows.length === 0) {
    return (
      <div className="text-center p-6 border rounded-md">
        <p className="text-muted-foreground">
          No beach sets found for {beachName}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{beachName} Layout</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-xs">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-xs">Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span className="text-xs">Reserved</span>
          </div>
        </div>
      </div>
      
      {/* Beach representation */}
      <div className="border rounded-lg p-4 bg-blue-50">
        <div className="w-full p-3 mb-8 bg-blue-400 text-white text-center font-bold rounded">
          Sea
        </div>
        
        <div className="space-y-4">
          {rows.map(({ rowNum, sets: rowSets }) => (
            <div key={rowNum} className="flex justify-center gap-3">
              <div className="w-8 text-center text-sm font-medium flex items-center justify-center">
                {rowNum}
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {rowSets.map(set => (
                  <div
                    key={set.id}
                    onClick={() => handleSetClick(set)}
                    className={cn(
                      "w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 cursor-pointer transition-all",
                      isSetSelected(set) && "bg-blue-500 text-white border-blue-600",
                      isSetDisabled(set) && !isSetSelected(set) && "bg-red-500 text-white border-red-600",
                      !isSetDisabled(set) && !isSetSelected(set) && "bg-green-500 text-white border-green-600",
                      onSelectSet && !isSetDisabled(set) && "hover:scale-110"
                    )}
                    title={`${set.name} - ${set.price} per day`}
                  >
                    <Umbrella className="h-6 w-6" />
                    <span className="text-xs font-bold">{set.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {sets.length > 0 && (
          <div className="text-sm">
            <span className="font-medium">Sets: </span>
            {sets.length}
          </div>
        )}
        {selectedSets.length > 0 && (
          <div className="text-sm">
            <span className="font-medium">Selected: </span>
            {selectedSets.length}
          </div>
        )}
        {selectedSets.length > 0 && (
          <div className="text-sm col-span-2">
            <span className="font-medium">Total price: </span>
            {selectedSets.reduce((sum, set) => sum + Number(set.price || 0), 0).toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}
