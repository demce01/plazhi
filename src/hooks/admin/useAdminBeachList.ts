
import { useState, useEffect } from 'react';
import { Beach } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAdminBeachList() {
  const { toast } = useToast();
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBeaches = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('beaches')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

        setBeaches(data || []);
      } catch (error: any) {
        console.error('Error fetching beaches:', error);
        toast({
          title: 'Error fetching beaches',
          description: error.message || 'Failed to load beaches',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBeaches();
  }, [toast]);

  return { beaches, isLoading };
}
