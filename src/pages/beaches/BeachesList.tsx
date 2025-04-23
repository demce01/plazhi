
import { PublicBeachInfo } from "@/types";
import { Loader2, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function BeachesList() {
  const { data: beaches = [], isLoading } = useQuery<PublicBeachInfo[], Error>({
    queryKey: ['public-beaches'],
    queryFn: async (): Promise<PublicBeachInfo[]> => {
      const { data, error } = await supabase
        .from('beaches')
        .select('id, name, description, location')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Our Beaches</h1>
        <p className="text-muted-foreground mt-2">Select a beach to view available spots and make a reservation.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : beaches.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {beaches.map((beach) => (
            <Card key={beach.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{beach.name}</CardTitle>
                {beach.location && (
                  <CardDescription className="flex items-center pt-1">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    {beach.location}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {beach.description || "No description available."}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/beaches/${beach.id}/reserve`}>View Availability & Reserve</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground p-10">No beaches available at the moment. Please check back later.</p>
      )}
    </div>
  );
}
