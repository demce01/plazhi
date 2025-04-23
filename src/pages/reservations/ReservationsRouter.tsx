
import React from 'react';
import { useAuth } from "@/contexts/auth";
import MyReservations from "./MyReservations";
import { ReservationManagementTab } from "@/components/admin/ReservationManagementTab";
import { Loader2 } from 'lucide-react';
import { useAdminBeachList } from "@/hooks/admin/useAdminBeachList";

export default function ReservationsRouter() {
  const { userSession, loading: authLoading } = useAuth();
  const { beaches } = useAdminBeachList();
  const role = userSession?.role;

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role === 'admin' || role === 'employee') {
    return (
      <div className="container mx-auto p-6 max-w-7xl space-y-8">
        <ReservationManagementTab beaches={beaches} />
      </div>
    );
  } else {
    return <MyReservations />;
  }
}
