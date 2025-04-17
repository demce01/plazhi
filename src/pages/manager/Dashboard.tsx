import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Beach } from "@/types";
import { Loader2, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BeachForm } from "@/components/beaches/BeachForm";
import { BeachManagement } from "@/components/beaches/BeachManagement";
import { ReservationManagement } from "@/components/reservations/ReservationManagement";
import { Input } from "@/components/ui/input";

export default function ManagerDashboard() {
  const { userSession } = useAuth();
  const { managerId, role } = userSession;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [filteredBeaches, setFilteredBeaches] = useState<Beach[]>([]);
  const [showBeachForm, setShowBeachForm] = useState(false);
  const [activeTab, setActiveTab] = useState("beaches");
  const [searchQuery, setSearchQuery] = useState("");
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!managerId && role !== 'manager' && role !== 'admin') {
      navigate('/');
      return;
    }

    fetchManagerBeaches();
  }, [managerId, role, navigate]);

  useEffect(() => {
    // Filter beaches based on search query
    const filtered = beaches.filter(beach => 
      beach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (beach.location && beach.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredBeaches(filtered);
  }, [searchQuery, beaches]);

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

  const activateReservationsTab = () => {
    setActiveTab("reservations");
    // Scroll to tabs if needed
    if (tabsRef.current) {
      tabsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
        <div ref={tabsRef}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="beaches">My Beaches</TabsTrigger>
              <TabsTrigger value="reservations">Reservations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="beaches" className="mt-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search beaches by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="grid gap-4">
                {filteredBeaches.map(beach => (
                  <BeachManagement key={beach.id} beach={beach} onUpdate={fetchManagerBeaches} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="reservations" className="mt-6">
              <ReservationManagement 
                beaches={beaches} 
                activateReservationsTab={activateReservationsTab}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
