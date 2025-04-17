
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTestManager } from "./hooks/useTestManager";

interface TestManagerSectionProps {
  onSuccess: () => void;
}

export function TestManagerSection({ onSuccess }: TestManagerSectionProps) {
  const [isTestMode, setIsTestMode] = useState(false);
  const { isLoading, createTestManager } = useTestManager(onSuccess);

  if (!isTestMode) {
    return (
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={() => setIsTestMode(true)}
          className="text-xs"
          type="button"
        >
          Show Test Options
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={() => setIsTestMode(false)}
          className="text-xs"
          type="button"
        >
          Hide Test Options
        </Button>
      </div>
      
      <div className="p-4 border rounded-lg bg-muted/30 mb-4">
        <h3 className="text-sm font-medium mb-2">Development Options</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Create a test manager using the current admin account for development purposes.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={createTestManager}
          disabled={isLoading}
          className="w-full"
          type="button"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Creating Test Manager...
            </>
          ) : (
            "Create Test Manager"
          )}
        </Button>
      </div>
    </div>
  );
}
