

import { useState, useCallback } from 'react';
import { Zone, Set } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function useVisualSetSelection() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBeachId, setSelectedBeachId] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [availableZones, setAvailableZones] = useState<Zone[]>([]);
  const [availableSets, setAvailableSets] = useState<Set[]>([]);
  const [selectedSets, setSelectedSets] = useState<Set[]>([]);

  const fetchZonesAndSets = useCallback(async (beachId: string, date: Date) => {
    if (!beachId) return;
    
    setIsLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Fetch zones for the selected beach
      const { data: zonesData, error: zonesError } = await supabase
        .from('zones')
        .select('*')
        .eq('beach_id', beachId);
        
      if (zonesError) throw zonesError;
      setAvailableZones(zonesData || []);
      
      // Fetch sets with availability status
      const { data: setsData, error: setsError } = await supabase
        .rpc('get_sets_with_status', {
          target_beach_id: beachId,
          target_date: dateStr
        });
        
      if (setsError) throw setsError;
      setAvailableSets(setsData || []);
      
      // Clear selected sets when beach or date changes
      setSelectedSets([]);
      
    } catch (error: any) {
      console.error('Error fetching zones and sets:', error);
      toast({
        title: 'Error loading data',
        description: error.message || 'Failed to load beach layout data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleSelectSet = useCallback((set: Set) => {
    // Check if the set is already reserved
    const setInAvailableSets = availableSets.find(s => s.id === set.id);
    if (setInAvailableSets && (setInAvailableSets as any).status === 'reserved') {
      toast({
        title: 'Set Unavailable',
        description: `${set.name} is already reserved for this date.`,
        variant: 'destructive',
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
  }, [availableSets, toast]);

  const handleRemoveSet = useCallback((setId: string) => {
    setSelectedSets(prev => prev.filter(s => s.id !== setId));
  }, []);

  return {
    selectedBeachId,
    setSelectedBeachId,
    selectedZone,
    setSelectedZone,
    availableZones,
    availableSets,
    selectedSets,
    isLoading,
    fetchZonesAndSets,
    handleSelectSet,
    handleRemoveSet
  };
}
