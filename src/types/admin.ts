
import { Beach, Reservation } from "@/types";

export interface ReservationWithBeachAdmin extends Reservation {
  beach_name: string;
  beach: {
    id: string;
    name: string;
  };
}

export interface BeachSummary extends Beach {
  sets_count?: number;
  active_reservations?: number;
  total_revenue?: number;
}
