
import { Beach } from "@/types";
import { ManagerForm } from "./ManagerForm";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

interface ManagerCreationCardProps {
  beaches: Beach[];
  onSuccess: () => void;
}

export function ManagerCreationCard({ beaches, onSuccess }: ManagerCreationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Manager</CardTitle>
        <CardDescription>
          Add a new manager and optionally assign them to a beach
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
