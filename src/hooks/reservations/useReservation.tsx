
import { Beach, Zone, Set, UserSession } from "@/types";
import { useReservationState } from "./useReservationState";
import { useSetManagement } from "./useSetManagement";
import { useReservationSubmit } from "./useReservationSubmit";

export function useReservation(
  beach: Beach | null, 
  selectedDate: Date,
  userSession: UserSession
) {
  // Use the smaller, focused hooks
  const {
    selectedZone,
    selectedSets,
    currentStep,
    isProcessing,
    handleSelectSet,
    handleRemoveSet,
    handleZoneSelect,
    goToStep,
    setIsProcessing
  } = useReservationState();
  
  const {
    getSetsForZone,
    getSetsByRow
  } = useSetManagement();
  
  const {
    handleReservation,
    handleGuestReservation
  } = useReservationSubmit(beach, selectedDate, userSession, selectedSets, setIsProcessing);

  // Return all the functions and state from our smaller hooks
  return {
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
    goToStep
  };
}
