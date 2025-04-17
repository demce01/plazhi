
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole, UserSession } from "@/types";

export async function fetchUserData(userId: string, userEmail: string | undefined): Promise<Omit<UserSession, 'loading'>> {
  try {
    // Get user metadata for role check
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    
    // Check for admin role via app_metadata
    const appMetadata = userData?.user?.app_metadata;
    const userMetadata = userData?.user?.user_metadata;
    
    // Default role
    let role: UserRole = 'client';
    let clientId = null;
    let managerId = null;
    
    // Check if user is an admin first
    if (appMetadata && appMetadata.role === 'admin') {
      role = 'admin';
    } 
    // Then check if user is a manager
    else if (userMetadata && userMetadata.role === 'manager') {
      role = 'manager';
      
      // Get manager data if this is a manager
      const { data: managerData, error: managerError } = await supabase
        .from('managers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (managerError && managerError.code !== 'PGRST116') {
        console.warn("Manager query error:", managerError);
      }
      
      if (managerData) {
        managerId = managerData.id;
      }
    } 
    // Then check if user is a client
    else {
      // Get client data
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (clientError && clientError.code !== 'PGRST116') {
        console.warn("Client query error:", clientError);
      }
      
      if (clientData) {
        clientId = clientData.id;
      }
    }
    
    console.log("User role determined:", role, "User metadata:", userMetadata);
    
    return {
      user: {
        id: userId,
        email: userEmail,
      },
      role,
      clientId,
      managerId
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return {
      user: {
        id: userId,
        email: userEmail,
      },
      role: 'client', // Default to client on error
      clientId: null,
      managerId: null
    };
  }
}
