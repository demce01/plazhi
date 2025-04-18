import React from 'react';
import { useAuth } from "@/contexts/auth";
import MyReservations from "./MyReservations"; // User's own reservations page
import { ReservationManagementTab } from "@/components/admin/ReservationManagementTab"; // Admin management tab
import { Loader2 } from 'lucide-react';

// This component acts as a router based on user role for the /reservations path
export default function ReservationsRouter() {
  const { userSession, loading: authLoading } = useAuth();
  const role = userSession?.role;

  if (authLoading) {
    // Show a loading indicator while authentication state is resolving
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role === 'admin') {
    // If user is admin, show the admin reservation management tab
    // Wrap it slightly to provide some context/padding if needed, 
    // or potentially render a simplified Admin-specific layout here.
    return (
      <div className="p-4 md:p-6">
          {/* You might want a title here too */} 
          {/* <h1 className="text-2xl font-bold mb-4">Manage Reservations (Admin)</h1> */}
        <ReservationManagementTab />
      </div>
    );
  } else {
    // Otherwise, show the standard "My Reservations" page
    return <MyReservations />;
  }
} 