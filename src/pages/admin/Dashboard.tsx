
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Beach, Manager } from "@/types";
import { Loader2, Plus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BeachForm } from "@/components/beaches/BeachForm";
import { BeachManagement } from "@/components/beaches/BeachManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ManagerManagement } from "@/components/managers/ManagerManagement";

export default function AdminDashboard() {
  const { userSession } = useAuth();
  const { role } = userSession;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [showBeachForm, setShowBeachForm] = useState(false);

  useEffect(() => {
    if (role !== 'admin') {
      navigate('/');
      return;
    }

    fetchAllBeaches();
    fetchAllManagers();
  }, [role, navigate]);

  const fetchAllBeaches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('beaches')
        .select('*')
        .order('name');
      
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

  const fetchAllManagers = async () => {
    try {
      const { data, error } = await supabase
        .from('managers')
        .select(`
          *,
          beaches(id, name)
        `);
      
      if (error) throw error;
      
      setManagers(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading managers",
        description: error.message,
        variant: "destructive",
      });
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

  // Helper function to get beach name
  const getBeachName = (manager: Manager) => {
    if (!manager.beach_id) return "Not assigned to any beach";
    
    // Find the beach in the beaches array
    const beach = beaches.find(b => b.id === manager.beach_id);
    return beach ? beach.name : "Unknown Beach";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
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
      ) : (
        <Tabs defaultValue="beaches" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="beaches">All Beaches</TabsTrigger>
            <TabsTrigger value="managers">Managers</TabsTrigger>
            <TabsTrigger value="manager-management">Manager Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="beaches" className="mt-6">
            <div className="grid gap-4">
              {beaches.length === 0 ? (
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
                beaches.map(beach => (
                  <BeachManagement key={beach.id} beach={beach} onUpdate={fetchAllBeaches} />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="managers" className="mt-6">
            <h3 className="text-xl font-medium mb-4">Beach Managers</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {managers.map(manager => (
                <Card key={manager.id}>
                  <CardHeader>
                    <CardTitle>Manager</CardTitle>
                    <CardDescription>ID: {manager.user_id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">
                      {manager.beach_id ? (
                        <>Managing: {getBeachName(manager)}</>
                      ) : (
                        "Not assigned to any beach"
                      )}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {managers.length === 0 && (
                <div className="col-span-full text-center p-6 border rounded-lg">
                  <Users className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No Managers Yet</h3>
                  <p className="text-muted-foreground">
                    Create managers using the Manager Management tab
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="manager-management" className="mt-6">
            <ManagerManagement 
              managers={managers}
              beaches={beaches}
              onUpdate={() => {
                fetchAllManagers();
                fetchAllBeaches();
              }}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
