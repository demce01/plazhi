import React from 'react';
import { Set, Zone } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Use Button for sets

interface VisualSetSelectionGridProps {
  zones: Zone[]; // Might be used for sectioning later
  sets: Set[]; // ALL sets for the beach, including status
  selectedSets: Set[];
  onSelectSet: (set: Set) => void;
  // Add onZoneSelect if needed for zone tabs/filtering
}

// Helper to group sets by row
const groupSetsByRow = (sets: Set[]) => {
  return sets.reduce((acc, set) => {
    const row = set.row_number ?? 0; // Group sets without row number in row 0
    if (!acc[row]) {
      acc[row] = [];
    }
    // Sort sets within the row by position
    acc[row].push(set);
    acc[row].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return acc;
  }, {} as Record<number, Set[]>);
};

export function VisualSetSelectionGrid({
  zones,
  sets,
  selectedSets,
  onSelectSet,
}: VisualSetSelectionGridProps) {
  const setsByRow = groupSetsByRow(sets);
  const sortedRows = Object.keys(setsByRow).map(Number).sort((a, b) => a - b);

  const getSetVariant = (set: Set): 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost' => {
      const isSelected = selectedSets.some(s => s.id === set.id);
      if (isSelected) return 'default'; // Primary color for selected
      if (set.status === 'reserved') return 'secondary'; // Greyed out for reserved
      return 'outline'; // Outline for available
  };

  return (
    <div className="space-y-6 p-4 border rounded-md bg-muted/20"> {/* Added padding/border */}
      <div className="text-center p-2 bg-blue-100 text-blue-800 rounded-md font-medium">Ocean</div>
      
      {sortedRows.map((rowNumber) => (
        <div key={`row-${rowNumber}`} className="flex items-center space-x-3">
          <div className="w-12 font-medium text-sm text-muted-foreground">Row {rowNumber}</div>
          <div className="flex flex-wrap gap-2">
            {setsByRow[rowNumber].map((set) => {
               const variant = getSetVariant(set);
               const isDisabled = set.status === 'reserved';
              return (
                <Button
                  key={set.id}
                  variant={variant}
                  size="icon"
                  className="rounded-full w-8 h-8 text-xs" // Smaller, rounded buttons
                  onClick={() => onSelectSet(set)}
                  disabled={isDisabled}
                >
                  {/* Display position number inside */}
                  {set.position ?? '-'}
                </Button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="text-center p-2 bg-yellow-100 text-yellow-800 rounded-md font-medium mt-4">Beach Entrance</div>
    </div>
  );
} 