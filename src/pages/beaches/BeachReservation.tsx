
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useBeachDetails } from "@/hooks/useBeachDetails";
import { useAuth } from "@/contexts/auth";
import { useReservation } from "@/hooks/reservations";
import { ReservationSteps } from "@/components/reservations/ReservationSteps";
import { DateStep } from "@/components/reservations/DateStep";
import { LocationStep } from "@/components/reservations/LocationStep";
import { PaymentStep } from "@/components/reservations/PaymentStep";

export default function BeachReservation() {
  const { beachId } = useParams<{ beachId: string }>();
  const navigate = useNavigate();
  const { userSession } = useAuth();
  
  const {
    loading,
    beach,
    sets,
    zones,
    selectedDate,
    setSelectedDate,
  } = useBeachDetails(beachId);
  
  const {
    selectedZone,
    selectedSets,
    currentStep,
    isProcessing,
    handleSelectSet,
    handleRemoveSet,
    handleZoneSelect,
    getSetsForZone,
    getSetsByRow,
    handleReservation,
    handleGuestReservation,
    goToStep,
  } = useReservation(beach, selectedDate, userSession);

  useEffect(() => {
    console.log("Beach reservation component mounted for beach ID:", beachId);
  }, [beachId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!beach) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Beach Not Found</h1>
        <p className="mb-8">The beach you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/beaches")}>Back to Beaches</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Reserve Your Beach Spot</h1>
      
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold">Your Reservation</h2>
          <p className="text-gray-600">Follow the steps below to complete your reservation</p>
        </div>
        
        <ReservationSteps 
          currentStep={currentStep} 
          onStepChange={goToStep} 
        />
        
        <div className="mt-8">
          <DateStep 
            selectedDate={selectedDate} 
            onDateChange={(date) => date && setSelectedDate(date)}
            onContinue={() => goToStep("location")}
            isActive={currentStep === "date"}
          />
          
          <LocationStep 
            isActive={currentStep === "location"}
            zones={zones}
            selectedZone={selectedZone}
            onZoneSelect={handleZoneSelect}
            getSetsForZone={(zoneName) => getSetsForZone(zoneName, sets)}
            getSetsByRow={getSetsByRow}
            selectedSets={selectedSets}
            onSelectSet={handleSelectSet}
            onContinue={() => goToStep("payment")}
            onBack={() => goToStep("date")}
          />
          
          <PaymentStep 
            isActive={currentStep === "payment"}
            beach={beach}
            selectedDate={selectedDate}
            selectedZone={selectedZone}
            selectedSets={selectedSets}
            isLoggedIn={!!userSession.user}
            isProcessing={isProcessing}
            onRemoveSet={handleRemoveSet}
            onBack={() => goToStep("location")}
            onSubmit={handleReservation}
            onGuestSubmit={handleGuestReservation}
          />
        </div>
      </div>
    </div>
  );
}
