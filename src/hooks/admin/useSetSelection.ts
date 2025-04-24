
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Set } from '@/types';

export function useSetSelection() {
  const { toast } = useToast();
  const [selectedSets, setSelectedSets] = useState<Set[]>([]);

  // Updated to match the expected signature by removing the second parameter
  const handleSelectSet = (set: Set) => {
    // We'll retrieve the status from the set itself
    const status = (set as any).status;
    if (status === 'reserved') { 
      toast({ 
        title: "Set Reserved", 
        description: `${set.name} is already reserved for this date.`, 
      });
      return; 
    }

    setSelectedSets(prev => {
      const isSelected = prev.some(s => s.id === set.id);
      if (isSelected) {
        return prev.filter(s => s.id !== set.id);
      } else {
        return [...prev, set]; 
      }
    });
  };

  const handleRemoveSet = (setId: string) => {
    setSelectedSets(prev => prev.filter(s => s.id !== setId));
  };

  return {
    selectedSets,
    handleSelectSet,
    handleRemoveSet,
    setSelectedSets
  };
}
