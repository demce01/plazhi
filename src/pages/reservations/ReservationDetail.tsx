
import { useParams } from "react-router-dom";
import { useReservationDetail } from "@/hooks/useReservationDetail";
import { ReservationDetailHeader } from "@/components/reservations/ReservationDetailHeader";
import { ReservationInfo } from "@/components/reservations/ReservationInfo";
import { BeachInfo } from "@/components/reservations/BeachInfo";
import { PaymentSummary } from "@/components/reservations/PaymentSummary";
import { ReservationActions } from "@/components/reservations/ReservationActions";
import { ReservationLoadingState } from "@/components/reservations/LoadingState";
import { ReservationNotFound } from "@/components/reservations/ReservationNotFound";

export default function ReservationDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    loading,
    reservation,
    beach,
    sets,
    handleCheckIn,
    formatReservationId
  } = useReservationDetail(id);

  if (loading) {
    return <ReservationLoadingState />;
  }

  if (!reservation || !beach) {
    return <ReservationNotFound />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <ReservationDetailHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ReservationInfo 
          reservation={reservation} 
          formatReservationId={formatReservationId}
          onCheckIn={handleCheckIn}
        />
        
        <BeachInfo beach={beach} sets={sets} />
      </div>
      
      <PaymentSummary reservation={reservation} sets={sets} />
      
      <ReservationActions reservation={reservation} />
    </div>
  );
}
