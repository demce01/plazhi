
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateStepProps {
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void;
  onContinue: () => void;
  isActive: boolean;
}

export function DateStep({ 
  selectedDate, 
  onDateChange, 
  onContinue, 
  isActive 
}: DateStepProps) {
  return (
    <div className={cn("mb-6", !isActive && "hidden")}>
      <h2 className="text-xl font-semibold mb-4">Select Date for Your Reservation</h2>
      <div className="max-w-sm mx-auto">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateChange(date)}
          disabled={(date) => date < new Date()}
          className="rounded-md border shadow p-4 bg-white mx-auto"
        />
      </div>
      <div className="flex justify-center mt-6">
        <Button 
          onClick={onContinue}
          disabled={!selectedDate}
        >
          Continue to Location Selection
        </Button>
      </div>
    </div>
  );
}
