
import { useEffect } from "react";

export default function BeachList() {
  useEffect(() => {
    // Placeholder for beach list fetching logic
    console.log("Beach list component mounted");
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Our Beaches</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Beach cards would be rendered here */}
        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold">Beach Placeholder</h2>
          <p className="text-gray-600 mt-2">This is a placeholder for the beach list.</p>
        </div>
      </div>
    </div>
  );
}
