import { supabase } from "@/integrations/supabase/client";
import { UserRole, UserSession } from "@/types";

export async function fetchUserData(userId: string, userEmail: string | undefined): Promise<Omit<UserSession, 'loading'>> {
  try {
    // Get user metadata for role check
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    
    // Check for admin role via app_metadata
    const appMetadata = userData?.user?.app_metadata;
    let role: UserRole = 'client';
    let clientId = null;
    
    // Check if user is an admin
    if (appMetadata && appMetadata.role === 'admin') {
      role = 'admin';
    } else {
      // Get client data
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (clientError) throw clientError;
      
      if (clientData) {
        clientId = clientData.id;
      }
    }
    
    return {
      user: {
        id: userId,
        email: userEmail,
      },
      role,
      clientId
    };
  } catch (error) {
    console.error("Error fetching user role/client data:", error);
    return {
      user: {
        id: userId,
        email: userEmail,
      },
      role: 'client',
      clientId: null
    };
  }
}
