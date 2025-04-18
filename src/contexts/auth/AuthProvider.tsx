import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { UserSession } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from "./useAuthOperations";
import { AuthContextType } from "./types";
import { fetchUserData } from "./useUserData";
import { toast } from "@/components/ui/use-toast";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userSession, setUserSession] = useState<UserSession>({
    user: null,
    role: null,
    clientId: null,
    loading: true,
  });
  const [loading, setLoading] = useState(true);
  const authOperations = useAuthOperations();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await handleUserAuthenticated(session.user.id, session.user.email);
      } else {
        setUserSession(prev => ({ ...prev, loading: false }));
      }
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('[AuthProvider] onAuthStateChange event:', event, 'Session:', !!session);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (event === 'SIGNED_IN' && session?.user) {
            await handleUserAuthenticated(session.user.id, session.user.email);
          } else if (event === 'SIGNED_OUT') {
            setUserSession({
              user: null,
              role: null,
              clientId: null,
              loading: false,
            });
            console.log('[AuthProvider] User session cleared on SIGNED_OUT');
          }
        }
      );
      
      setLoading(false);
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initializeAuth();
  }, []);
  
  // Fetch user data (client, manager status)
  const handleUserAuthenticated = async (userId: string, email?: string) => {
    console.log(`[AuthProvider] handleUserAuthenticated called for userId: ${userId}`);
    setUserSession(prev => ({ ...prev, loading: true }));
    
    try {
      const userData = await fetchUserData(userId, email);
      setUserSession({
        ...userData,
        loading: false
      });
      console.log('[AuthProvider] handleUserAuthenticated success. Role:', userData.role, 'ClientId:', userData.clientId);
    } catch (error) {
      console.error("Error fetching user session data:", error);
      toast({ 
        title: "Error Loading User",
        description: "Could not load your user session. Please try refreshing.",
        variant: "destructive",
      });
      console.log('[AuthProvider] handleUserAuthenticated failed.');
      setUserSession(prev => ({ ...prev, loading: false }));
    }
  };
  
  return (
    <AuthContext.Provider value={{
      session,
      user,
      userSession,
      ...authOperations,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
