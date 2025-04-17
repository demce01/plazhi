
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Beach } from "@/types";
import { BeachCard } from "@/components/beaches/BeachCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function BeachesList() {
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBeaches = async () => {
      try {
        const { data, error } = await supabase
          .from("beaches")
          .select("*")
          .order("name");

        if (error) throw error;

        setBeaches(data || []);
      } catch (err: any) {
        console.error("Error loading beaches:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBeaches();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Beaches</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[180px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Error Loading Beaches</h1>
        <p className="text-gray-600 mb-8">{error}</p>
      </div>
    );
  }

  if (beaches.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">No Beaches Found</h1>
        <p className="text-gray-600">No beaches are currently available.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Beaches</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {beaches.map((beach) => (
          <BeachCard key={beach.id} beach={beach} />
        ))}
      </div>
    </div>
  );
}
