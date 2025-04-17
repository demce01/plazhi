
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBeachDetails } from "@/hooks/useBeachDetails";
import { useReservation } from "@/hooks/useReservation";
import { ReservationSteps } from "@/components/reservations/ReservationSteps";
import { DateStep } from "@/components/reservations/DateStep";
import { LocationStep } from "@/components/reservations/LocationStep";
import { PaymentStep } from "@/components/reservations/PaymentStep";

export default function BeachDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // Added useNavigate hook
  const { userSession } = useAuth();
  
  // Custom hooks for beach data and reservation management
  const {
    loading,
    beach,
    sets,
    zones,
    selectedDate,
    setSelectedDate,
  } = useBeachDetails(id);
  
  const {
    selectedZone,
    selectedSets,
    currentStep,
    isProcessing,
    showGuestForm,
    handleSelectSet,
    handleRemoveSet,
    handleZoneSelect,
    getSetsForZone,
    getSetsByRow,
    handleReservation,
    handleGuestReservation,
    goToStep,
    setShowGuestForm
  } = useReservation(beach, selectedDate, userSession);

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

  // Debug: Check zones in the render
  console.log("Rendering with zones:", zones, "and selectedZone:", selectedZone);

  return (
    <div className="container max-w-5xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Reserve Your Beach Spot</h1>
      
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold">Your Reservation</h2>
          <p className="text-gray-600">Follow the steps below to complete your reservation</p>
        </div>
        
        {/* Step Indicator */}
        <ReservationSteps 
          currentStep={currentStep} 
          onStepChange={goToStep} 
        />
        
        {/* Step content */}
        <Tabs value={currentStep} className="w-full">
          <TabsContent value="date" className="m-0">
            <DateStep 
              selectedDate={selectedDate} 
              onDateChange={(date) => date && setSelectedDate(date)}
              onContinue={() => goToStep("location")}
              isActive={currentStep === "date"}
            />
          </TabsContent>
          
          <TabsContent value="location" className="m-0 space-y-6">
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
          </TabsContent>
          
          <TabsContent value="payment" className="m-0">
            <PaymentStep 
              isActive={currentStep === "payment"}
              beach={beach}
              selectedDate={selectedDate}
              selectedZone={selectedZone}
              selectedSets={selectedSets}
              isLoggedIn={!!userSession.user}
              isProcessing={isProcessing}
              showGuestForm={showGuestForm}
              onRemoveSet={handleRemoveSet}
              onBack={() => goToStep("location")}
              onSubmit={handleReservation}
              onGuestSubmit={handleGuestReservation}
              onCancelGuest={() => {
                setShowGuestForm(false);
                goToStep("location");
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
