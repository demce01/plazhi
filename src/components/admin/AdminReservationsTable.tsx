import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReservationWithBeachAdmin } from "@/hooks/admin/useAdminReservations";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Actions Hook & Dropdown components
import { useAdminReservationActions } from "@/hooks/admin/useAdminReservationActions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Check, X, Eye, Loader2 } from "lucide-react";
import { Link } from "react-router-dom"; // For View Details link

interface AdminReservationsTableProps {
  reservations: ReservationWithBeachAdmin[] | undefined;
  isLoading: boolean;
  title?: string;
  onActionComplete?: () => void; // Callback to refresh data after an action
}

export function AdminReservationsTable({
  reservations,
  isLoading,
  title = "Recent Reservations",
  onActionComplete // Destructure the callback
}: AdminReservationsTableProps) {
  
  // Use the actions hook, passing the callback
  const { handleAdminCheckIn, handleAdminCancel, isProcessing } = useAdminReservationActions(onActionComplete);

  const renderSkeletons = () =>
    Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell>
          <Skeleton className="h-4 w-[100px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[150px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[80px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[120px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[100px]" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-4 w-[60px] float-right" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-4 w-[60px] float-right" />
        </TableCell>
      </TableRow>
    ));

  const renderReservations = () =>
    reservations?.map((reservation) => (
      <TableRow key={reservation.id}>
        <TableCell className="font-medium">{reservation.beach_name}</TableCell>
        <TableCell>{reservation.guest_name}</TableCell>
        <TableCell>
          {format(new Date(reservation.reservation_date), "PPP")}
        </TableCell>
        <TableCell>{reservation.status}</TableCell>
        <TableCell>{reservation.guest_phone}</TableCell>
        <TableCell className="text-right">
          ${reservation.payment_amount ? reservation.payment_amount.toFixed(2) : '0.00'}
        </TableCell>
        <TableCell className="text-right">
          <AdminReservationActions 
            reservation={reservation} 
            onCheckIn={handleAdminCheckIn}
            onCancel={handleAdminCancel}
            isProcessing={isProcessing[reservation.id] || false}
          />
        </TableCell>
      </TableRow>
    ));

  return (
    <Table>
      <TableCaption>{title}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Beach</TableHead>
          <TableHead>Guest Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? renderSkeletons()
          : reservations && reservations.length > 0
            ? renderReservations()
            : <TableRow><TableCell colSpan={7} className="text-center">No reservations found.</TableCell></TableRow>}
      </TableBody>
    </Table>
  );
}

// Separate component for the actions dropdown for clarity
interface AdminReservationActionsProps {
  reservation: ReservationWithBeachAdmin;
  onCheckIn: (reservation: ReservationWithBeachAdmin) => void;
  onCancel: (reservation: ReservationWithBeachAdmin) => void;
  isProcessing: boolean;
}

function AdminReservationActions({ 
  reservation, 
  onCheckIn, 
  onCancel,
  isProcessing
}: AdminReservationActionsProps) {
  
  const canCheckIn = !reservation.checked_in && reservation.status !== 'cancelled';
  const canCancel = reservation.status !== 'cancelled';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isProcessing}>
          <span className="sr-only">Open menu</span>
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
           <Link to={`/admin/reservations/${reservation.id}`}> 
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onCheckIn(reservation)}
          disabled={!canCheckIn || isProcessing}
        >
          <Check className="mr-2 h-4 w-4" />
          Check In
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onCancel(reservation)}
          disabled={!canCancel || isProcessing}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <X className="mr-2 h-4 w-4" />
          Cancel Reservation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 