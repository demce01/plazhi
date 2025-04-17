
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Beach } from "@/types";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BeachForm } from "@/components/beaches/BeachForm";
import { BeachManagement } from "@/components/beaches/BeachManagement";

export default function ManagerDashboard() {
  const { userSession } = useAuth();
  const { managerId, role } = userSession;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [showBeachForm, setShowBeachForm] = useState(false);

  useEffect(() => {
    if (!managerId && role !== 'manager' && role !== 'admin') {
      navigate('/');
      return;
    }

    fetchManagerBeaches();
  }, [managerId, role, navigate]);

  const fetchManagerBeaches = async () => {
    try {
      setLoading(true);
      
      // If admin, fetch all beaches, otherwise fetch only beaches managed by this manager
      let query = supabase.from('beaches').select('*');
      
      if (role === 'manager') {
        const { data: managerData } = await supabase
          .from('managers')
          .select('beach_id')
          .eq('id', managerId);
        
        if (managerData && managerData.length > 0) {
          const beachIds = managerData.map(m => m.beach_id).filter(Boolean);
          if (beachIds.length > 0) {
            query = query.in('id', beachIds);
          }
        }
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      
      setBeaches(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading beaches",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBeachCreated = (beach: Beach) => {
    setBeaches(prev => [...prev, beach]);
    setShowBeachForm(false);
    toast({
      title: "Beach created",
      description: `${beach.name} has been successfully created.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
        <Button onClick={() => setShowBeachForm(!showBeachForm)}>
          <Plus className="mr-2 h-4 w-4" /> {showBeachForm ? "Cancel" : "Create Beach"}
        </Button>
      </div>

      {showBeachForm && (
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Create New Beach</h2>
          <BeachForm onSuccess={handleBeachCreated} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : beaches.length === 0 ? (
        <div className="text-center p-10 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No Beaches Yet</h2>
          <p className="text-muted-foreground mb-4">
            Start by creating your first beach and setting up the layout
          </p>
          <Button onClick={() => setShowBeachForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Your First Beach
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="beaches" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="beaches">My Beaches</TabsTrigger>
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="beaches" className="mt-6">
            <div className="grid gap-4">
              {beaches.map(beach => (
                <BeachManagement key={beach.id} beach={beach} onUpdate={fetchManagerBeaches} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="reservations" className="mt-6">
            <h3 className="text-xl font-medium mb-4">Recent Reservations</h3>
            {/* We'll implement the reservations view in a separate component */}
            <p>Reservation management coming soon</p>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
