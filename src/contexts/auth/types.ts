
import { Session, User } from "@supabase/supabase-js";
import { UserRole, UserSession } from "@/types";

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  userSession: UserSession;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}
