
import { cn } from "@/lib/utils";

interface ReservationStepsProps {
  currentStep: "date" | "location" | "payment";
  onStepChange: (step: "date" | "location" | "payment") => void;
}

export function ReservationSteps({ currentStep, onStepChange }: ReservationStepsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 mb-8">
      <div 
        className={cn(
          "p-4 rounded-md text-center cursor-pointer transition-colors",
          currentStep === "date" 
            ? "bg-blue-100 text-blue-800" 
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
        onClick={() => onStepChange("date")}
      >
        <span className="font-medium">1. Select Date</span>
      </div>
      <div 
        className={cn(
          "p-4 rounded-md text-center cursor-pointer transition-colors",
          currentStep === "location" 
            ? "bg-blue-100 text-blue-800" 
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
        onClick={() => onStepChange("location")}
      >
        <span className="font-medium">2. Choose Location</span>
      </div>
      <div 
        className={cn(
          "p-4 rounded-md text-center cursor-pointer transition-colors",
          currentStep === "payment" 
            ? "bg-blue-100 text-blue-800" 
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
        onClick={() => onStepChange("payment")}
      >
        <span className="font-medium">3. Complete Reservation</span>
      </div>
    </div>
  );
}
