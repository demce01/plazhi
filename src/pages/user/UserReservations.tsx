
import { useEffect } from "react";

export default function UserReservations() {
  useEffect(() => {
    console.log("User reservations component mounted");
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Reservations</h1>
      <div className="p-6 border rounded-lg shadow-sm bg-white">
        <p className="text-gray-600">You don't have any reservations yet.</p>
      </div>
    </div>
  );
}
