
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Beach, Zone, Set } from '@/types';

export function useDateAndZoneSelection() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [zones, setZones] = useState<Zone[]>([]);
  const [sets, setSets] = useState<Set[]>([]); 
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isLayoutLoading, setIsLayoutLoading] = useState(false);

  const fetchLayoutAndSetStatuses = async (beach: Beach, date: Date) => {
    setIsLayoutLoading(true);
    const dateString = format(date, 'yyyy-MM-dd');

    try {
      const zonesPromise = supabase
        .from('zones')
        .select('*')
        .eq('beach_id', beach.id);

      const setsWithStatusPromise = supabase.rpc('get_sets_with_status', {
        target_beach_id: beach.id,
        target_date: dateString
      });
      
      const [zonesResult, setsWithStatusResult] = await Promise.all([zonesPromise, setsWithStatusPromise]);

      if (zonesResult.error) throw zonesResult.error;
      setZones(zonesResult.data || []);

      if (setsWithStatusResult.error) throw setsWithStatusResult.error;
      const allSetsWithStatus = setsWithStatusResult.data || []; 
      setSets(allSetsWithStatus as Set[]); 

    } catch (error: any) {
      console.error("Error fetching layout/sets:", error);
      toast({ 
        title: 'Error loading beach layout', 
        description: error.message, 
        variant: 'destructive' 
      });
      setZones([]);
      setSets([]);
    } finally {
      setIsLayoutLoading(false);
      setSelectedZone(null); 
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    zones,
    sets,
    selectedZone,
    isLayoutLoading,
    setSelectedZone,
    fetchLayoutAndSetStatuses
  };
}
