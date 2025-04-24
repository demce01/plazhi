
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Beach } from '@/types';

export function useBeachSelection() {
  const { toast } = useToast();
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [selectedBeach, setSelectedBeach] = useState<Beach | null>(null);
  const [isBeachLoading, setIsBeachLoading] = useState(false);

  useEffect(() => {
    const fetchBeaches = async () => {
      setIsBeachLoading(true);
      const { data, error } = await supabase.from('beaches').select('*');
      
      if (error) {
        toast({ 
          title: 'Error fetching beaches', 
          description: error.message, 
          variant: 'destructive' 
        });
      } else {
        setBeaches(data || []);
      }
      setIsBeachLoading(false);
    };

    fetchBeaches();
  }, [toast]);

  return {
    beaches,
    selectedBeach,
    isBeachLoading,
    setSelectedBeach
  };
}
