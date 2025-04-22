
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function BeachReservation() {
  const { beachId } = useParams<{ beachId: string }>();
  
  useEffect(() => {
    console.log("Beach reservation component mounted for beach ID:", beachId);
  }, [beachId]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Reserve Your Spot</h1>
      <p className="mb-4">Beach ID: {beachId}</p>
      <div className="p-6 border rounded-lg shadow-sm bg-white">
        <p className="text-gray-600">This is a placeholder for the beach reservation form.</p>
      </div>
    </div>
  );
}
