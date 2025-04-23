
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2 } from 'lucide-react';
import { useReservationDetail } from '@/hooks/useReservationDetail';
import { ReservationInfo } from '@/components/reservations/ReservationInfo';
import { Set } from '@/types';
import { format } from 'date-fns';
import { StatusBadge, PaymentStatusBadge, CheckinBadge } from "@/components/reservations/management/StatusBadges";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// TODO: Add admin-specific actions if needed (e.g., manual status change, refund trigger?)

export default function AdminReservationDetail() {
  const { id } = useParams<{ id: string }>();
  const { reservation, beach, sets, loading, formatReservationId } = useReservationDetail(id);
  const error = !loading && !reservation; // Determine error state after loading

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
     return (
       <div className="p-4 md:p-6">
         <Alert variant="destructive">
           <Terminal className="h-4 w-4" />
           <AlertTitle>Error Loading Reservation</AlertTitle>
           <AlertDescription>Could not load details for reservation ID {id}. It might not exist or there was a server error.</AlertDescription>
         </Alert>
         <Button variant="outline" asChild className="mt-4">
            <Link to="/admin/reservations">Back to Reservations</Link>
          </Button>
       </div>
     );
  }
  
  // Ensure reservation is not null before proceeding (handled by error check, but good practice)
  if (!reservation) return null; 

  // Calculate total price from the sets fetched by the hook
  const calculatedTotalPrice = sets.reduce((sum, set) => sum + Number(set.price || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold">Reservation Details</h1>
                <p className="text-muted-foreground">Viewing details for Reservation ID: {formatReservationId(reservation.id)}</p>
            </div>
             <Button variant="outline" asChild>
                 <Link to="/admin/reservations">Back to Reservations List</Link>
             </Button>
        </div>

      {/* Reuse ReservationInfo for core guest/date details */}
      <ReservationInfo reservation={reservation} formatReservationId={formatReservationId} />

      {/* Additional Admin-specific details */}
      <Card>
        <CardHeader>
          <CardTitle>Status & Set Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">Reservation Status</p>
                    <StatusBadge status={reservation.status || 'pending'} />
                </div>
                 <div>
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                    <PaymentStatusBadge status={reservation.payment_status || 'pending'} />
                </div>
                 <div>
                    <p className="text-sm text-muted-foreground">Check-in Status</p>
                    <CheckinBadge checkedIn={reservation.checked_in} />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Total Amount (Stored)</p>
                    <p className="font-medium">${Number(reservation.payment_amount).toFixed(2)}</p>
                </div>
            </div>
            
            <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Reserved Sets ({sets.length})</p>
                {sets.length > 0 ? (
                    <ul className="space-y-2">
                        {sets.map((set: Set) => (
                            <li key={set.id} className="flex justify-between p-2 border rounded bg-muted/50">
                                <span>{set.name} (ID: {set.id.substring(0,4)}...)</span>
                                <span>${Number(set.price).toFixed(2)}</span>
                            </li>
                        ))}
                        <li className="flex justify-between font-semibold pt-2 border-t">
                            <span>Total Calculated from Sets:</span>
                            <span>${calculatedTotalPrice.toFixed(2)}</span>
                        </li>
                    </ul>
                ) : (
                    <p>No sets associated with this reservation.</p>
                )}
            </div>
             
             {/* Display timestamps */}
             <div className="pt-4 border-t space-y-1 text-sm text-muted-foreground">
                <p>Created At: {format(new Date(reservation.created_at), 'Pp')}</p>
                <p>Last Updated: {format(new Date(reservation.updated_at), 'Pp')}</p>
                {reservation.client_id && <p>Client ID: {reservation.client_id}</p>}
                {reservation.stripe_session_id && <p>Stripe Session ID: {reservation.stripe_session_id}</p>}
             </div>

             {/* TODO: Add Admin Actions Here (e.g., manual status updates, trigger refund?) */}

        </CardContent>
      </Card>
    </div>
  );
} 
