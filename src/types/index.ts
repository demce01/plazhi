
import { Database } from "@/integrations/supabase/types";

export type Beach = Database["public"]["Tables"]["beaches"]["Row"];
export type Set = Database["public"]["Tables"]["sets"]["Row"];
export type Reservation = Database["public"]["Tables"]["reservations"]["Row"] & {
  checked_in?: boolean;
};
export type ReservationSet = Database["public"]["Tables"]["reservation_sets"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Zone = Database["public"]["Tables"]["zones"]["Row"];

export type UserRole = "client" | "admin";

export interface UserSession {
  user: {
    id: string;
    email?: string;
  } | null;
  role: UserRole | null;
  clientId?: string | null;
  loading: boolean;
}

export interface BeachLayout {
  zones: Zone[];
  sets: Set[];
}

export interface GuestReservation {
  name: string;
  phone: string;
  email?: string;
  date: Date;
  selectedSets: Set[];
}
