
import { Beach } from "@/types";
import { ManagerForm } from "./ManagerForm";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { UserPlus } from "lucide-react";

interface ManagerCreationCardProps {
  beaches: Beach[];
  onSuccess: () => void;
}

export function ManagerCreationCard({ beaches, onSuccess }: ManagerCreationCardProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <CardTitle>Create New Manager</CardTitle>
        </div>
        <CardDescription>
          Create a manager account with login credentials and optional beach assignment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ManagerForm 
          beaches={beaches} 
          onSuccess={onSuccess} 
        />
      </CardContent>
    </Card>
  );
}
