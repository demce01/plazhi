
import { useEffect } from "react";

export default function UserProfile() {
  useEffect(() => {
    console.log("User profile component mounted");
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="p-6 border rounded-lg shadow-sm bg-white">
        <p className="text-gray-600">This is a placeholder for the user profile.</p>
      </div>
    </div>
  );
}
