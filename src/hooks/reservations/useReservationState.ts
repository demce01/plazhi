
import { useState } from "react";
import { Zone, Set } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useReservationState() {
  const { toast } = useToast();
  
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedSets, setSelectedSets] = useState<Set[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<"date" | "location" | "payment">("date");

  const handleSelectSet = (set: Set) => {
    if (set.status === "reserved") return;
    
    setSelectedSets(prev => {
      const isSelected = prev.some(s => s.id === set.id);
      if (isSelected) {
        return prev.filter(s => s.id !== set.id);
      } else {
        return [...prev, set];
      }
    });
  };

  const handleRemoveSet = (setId: string) => {
    setSelectedSets(prev => prev.filter(s => s.id !== setId));
  };

  const handleZoneSelect = (zone: Zone) => {
    setSelectedZone(zone);
    // Clear selected sets when changing zone
    setSelectedSets([]);
  };

  const goToStep = (step: "date" | "location" | "payment") => {
    if (step === "location" && !currentStep) {
      toast({
        title: "Please select a date first",
        variant: "destructive",
      });
      return;
    }
    
    if (step === "payment" && selectedSets.length === 0) {
      toast({
        title: "Please select at least one set",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentStep(step);
  };

  return {
    selectedZone,
    selectedSets,
    currentStep,
    isProcessing,
    handleSelectSet,
    handleRemoveSet,
    handleZoneSelect,
    goToStep,
    setIsProcessing
  };
}
