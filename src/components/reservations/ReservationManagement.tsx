
import { Beach } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Import our new components
import { FilterBar } from "./management/FilterBar";
import { ReservationTable } from "./management/ReservationTable";
import { CancelDialog } from "./management/CancelDialog";
import { useReservationList } from "./management/useReservationList";
import { useReservationOperations } from "./management/useReservationOperations";

interface ReservationManagementProps {
  beaches: Beach[];
  activateReservationsTab?: () => void;
}

export function ReservationManagement({ 
  beaches,
  activateReservationsTab
}: ReservationManagementProps) {
  // Use custom hooks for state management and operations
  const { 
    loading, 
    reservations, 
    fetchReservations, 
    filters 
  } = useReservationList();
  
  const {
    selectedReservation,
    isProcessing,
    handleUpdateStatus,
    handleCheckIn,
    openCancelDialog,
    setSelectedReservation,
    handleCancelComplete
  } = useReservationOperations(fetchReservations);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservations Management</CardTitle>
        <CardDescription>
          View and manage all beach reservations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FilterBar 
            searchQuery={filters.searchQuery}
            dateFilter={filters.dateFilter}
            statusFilter={filters.statusFilter}
            beachFilter={filters.beachFilter}
            checkinFilter={filters.checkinFilter}
            beaches={beaches}
            setSearchQuery={filters.setSearchQuery}
            setDateFilter={filters.setDateFilter}
            setStatusFilter={filters.setStatusFilter}
            setBeachFilter={filters.setBeachFilter}
            setCheckinFilter={filters.setCheckinFilter}
            clearFilters={filters.clearFilters}
          />
          
          <ReservationTable 
            loading={loading}
            reservations={reservations}
            onCheckIn={handleCheckIn}
            onUpdateStatus={handleUpdateStatus}
            onCancelClick={openCancelDialog}
          />
        </div>
      </CardContent>

      <CancelDialog 
        isOpen={!!selectedReservation}
        isProcessing={isProcessing}
        onOpenChange={(open) => !open && setSelectedReservation(null)}
        onConfirm={handleCancelComplete}
      />
    </Card>
  );
}
