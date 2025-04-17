
import { Beach } from "@/types";
import { Loader2 } from "lucide-react";
import { BeachesTab } from "@/components/admin/BeachesTab";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function BeachesList() {
  const { data: beaches = [], isLoading, refetch } = useQuery({
    queryKey: ['beaches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beaches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Beach[];
    },
  });

  const handleBeachCreated = (beach: Beach) => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Beach Management</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <BeachesTab 
          beaches={beaches} 
          onBeachCreated={handleBeachCreated}
          onUpdate={refetch}
        />
      )}
    </div>
  );
}
