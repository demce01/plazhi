
import { Beach, Set, Zone } from "@/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { GuestReservationForm } from "./GuestReservationForm";
import { cn } from "@/lib/utils";

interface PaymentStepProps {
  isActive: boolean;
  beach: Beach | null;
  selectedDate: Date;
  selectedZone: Zone | null;
  selectedSets: Set[];
  isLoggedIn: boolean;
  isProcessing: boolean;
  onRemoveSet: (setId: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  onGuestSubmit: (data: { name: string; phone: string; email?: string }) => void;
}

export function PaymentStep({
  isActive,
  beach,
  selectedDate,
  selectedZone,
  selectedSets,
  isProcessing,
  onRemoveSet,
  onBack,
  onGuestSubmit
}: PaymentStepProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-8", !isActive && "hidden")}>
      <div className="border rounded-lg p-6 bg-gray-50">
        <h3 className="font-semibold text-lg mb-4">Reservation Summary</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Beach:</span>
              <span className="font-medium">{beach?.name}</span>
            </div>
            {beach?.location && (
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{beach.location}</span>
              </div>
            )}
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Zone:</span>
              <span className="font-medium">{selectedZone?.name || "Not selected"}</span>
            </div>
          </div>
          
          <div>
            <p className="text-gray-600 mb-2">Selected Sets:</p>
            <div className="space-y-2">
              {selectedSets.map(set => (
                <div key={set.id} className="flex justify-between items-center p-2 bg-white rounded border">
                  <span>{set.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${Number(set.price).toFixed(2)}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onRemoveSet(set.id)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${selectedSets.reduce((sum, set) => sum + Number(set.price || 0), 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">Contact Information</h3>
          <p className="text-gray-600">
            Please provide your contact details to complete the reservation.
          </p>
          
          <GuestReservationForm 
            onSubmit={onGuestSubmit}
            onCancel={onBack}
            isSubmitting={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}
