
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { UserRole, UserSession } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userSession: UserSession;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userSession, setUserSession] = useState<UserSession>({
    user: null,
    role: null,
    clientId: null,
    managerId: null,
    loading: true,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setUserSession(prev => ({ ...prev, loading: false }));
      }
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (event === 'SIGNED_IN' && session?.user) {
            await fetchUserData(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            setUserSession({
              user: null,
              role: null,
              clientId: null,
              managerId: null,
              loading: false,
            });
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
  const fetchUserData = async (userId: string) => {
    setUserSession(prev => ({ ...prev, loading: true }));
    
    try {
      // Get client data
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (clientError) throw clientError;
      
      // Get manager data
      const { data: managerData, error: managerError } = await supabase
        .from('managers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (managerError) throw managerError;
      
      // Determine role
      let role: UserRole = 'client'; // Default role
      if (managerData) {
        role = 'manager';
      }
      
      // Check for admin role (via JWT)
      const { data } = await supabase.auth.getUser();
      // Fix: properly handle the JWT claims for role checking
      const userMetadata = data?.user?.app_metadata;
      const isAdmin = userMetadata && userMetadata.role === 'admin';
      
      if (isAdmin) {
        role = 'admin';
      }
      
      setUserSession({
        user: {
          id: userId,
          email: user?.email,
        },
        role,
        clientId: clientData?.id || null,
        managerId: managerData?.id || null,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserSession({
        user: {
          id: userId,
          email: user?.email,
        },
        role: 'client', // Default to client on error
        clientId: null,
        managerId: null,
        loading: false,
      });
    }
  };
  
  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Sign up
  const signUp = async (email: string, password: string, phone?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. Please check your email for verification.",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred while signing out.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  return (
    <AuthContext.Provider value={{
      session,
      user,
      userSession,
      signIn,
      signUp,
      signOut,
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
