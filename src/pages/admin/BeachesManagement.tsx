import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Beach } from "@/types";
import { BeachManagement } from "@/components/beaches/BeachManagement";
import { BeachForm } from "@/components/beaches/BeachForm";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

export default function BeachesManagement() {
  const { toast } = useToast();
  const [showBeachForm, setShowBeachForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("name");

  const { data: beaches = [], refetch: refreshBeaches } = useQuery<Beach[]>({
    queryKey: ['adminBeaches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beaches')
        .select('*')
        .order(sortBy);
      
      if (error) throw error;
      return data;
    },
  });

  const handleBeachCreated = useCallback((beach: Beach) => {
    setShowBeachForm(false);
    refreshBeaches();
    toast({
      title: "Beach created",
      description: `${beach.name} has been successfully created.`,
    });
  }, [refreshBeaches, toast]);

  const filteredBeaches = beaches.filter(beach => 
    beach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (beach.location && beach.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (beach.description && beach.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Beaches</h1>
            <p className="text-muted-foreground">Manage your beaches and their layouts</p>
          </div>

          <Button onClick={() => setShowBeachForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Beach
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search beaches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="whitespace-nowrap"
                >
                  <Filter className="mr-2 h-4 w-4" /> Filters
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setSearchQuery("");
                    setSortBy("name");
                    refreshBeaches();
                  }}
                  className="whitespace-nowrap"
                >
                  Reset
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                        <SelectItem value="name.desc">Name (Z-A)</SelectItem>
                        <SelectItem value="created_at">Newest First</SelectItem>
                        <SelectItem value="created_at.desc">Oldest First</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showBeachForm} onOpenChange={setShowBeachForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Beach</DialogTitle>
              <DialogDescription>
                Add a new beach to your portfolio
              </DialogDescription>
            </DialogHeader>
            <BeachForm onSuccess={handleBeachCreated} />
          </DialogContent>
        </Dialog>

        <div className="grid gap-6">
          {filteredBeaches.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Beaches Found</CardTitle>
                <CardDescription>
                  {searchQuery ? "Try a different search query or" : "Start by"} creating your first beach
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowBeachForm(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Create Your First Beach
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredBeaches.map((beach) => (
              <BeachManagement 
                key={beach.id} 
                beach={beach}
                onUpdate={refreshBeaches}
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
