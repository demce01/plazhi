
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ReservationSuccess() {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("Reservation success component mounted");
  }, []);

  return (
    <div className="container mx-auto py-8 text-center">
      <div className="max-w-md mx-auto p-6 border rounded-lg shadow-sm bg-white">
        <h1 className="text-3xl font-bold mb-6 text-green-600">Success!</h1>
        <p className="mb-4">Your beach reservation has been confirmed.</p>
        <button 
          onClick={() => navigate("/user/reservations")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View My Reservations
        </button>
      </div>
    </div>
  );
}
