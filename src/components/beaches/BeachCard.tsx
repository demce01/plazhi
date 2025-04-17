
import { Beach } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

interface BeachCardProps {
  beach: Beach;
}

export function BeachCard({ beach }: BeachCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{beach.name}</CardTitle>
        {beach.location && (
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{beach.location}</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-700">
          {beach.description || "No description available"}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/beaches/${beach.id}/reserve`}>
            Make a Reservation
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
