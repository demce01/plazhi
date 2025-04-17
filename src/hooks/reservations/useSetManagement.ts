
import { Set } from "@/types";

export function useSetManagement() {
  const getSetsForZone = (zoneName: string, sets: Set[]) => {
    return sets.filter(set => set.name.startsWith(zoneName));
  };

  const getSetsByRow = (zoneSets: Set[]) => {
    const rows = new Map<number, Set[]>();
    
    zoneSets.forEach(set => {
      const rowNum = set.row_number || 0;
      if (!rows.has(rowNum)) {
        rows.set(rowNum, []);
      }
      rows.get(rowNum)?.push(set);
    });
    
    // Sort rows by row number and sets by position within each row
    return Array.from(rows.entries())
      .sort(([a], [b]) => a - b)
      .map(([rowNum, sets]) => ({
        rowNum,
        sets: sets.sort((a, b) => (a.position || 0) - (b.position || 0))
      }));
  };

  return {
    getSetsForZone,
    getSetsByRow
  };
}
