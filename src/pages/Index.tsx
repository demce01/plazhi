import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Beach } from "@/types";
import { BeachCard } from "@/components/beaches/BeachCard";
import { useAuth } from "@/contexts/auth";

export default function Index() {
  const [featuredBeaches, setFeaturedBeaches] = useState<Beach[]>([]);
  const [loading, setLoading] = useState(true);
  const { userSession } = useAuth();
  const { user } = userSession;

  useEffect(() => {
    const fetchFeaturedBeaches = async () => {
      try {
        const { data } = await supabase
          .from("beaches")
          .select("*")
          .limit(3);

        setFeaturedBeaches(data || []);
      } catch (error) {
        console.error("Error fetching featured beaches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBeaches();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Reserve Your Perfect Beach Spot
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
          BeachEase makes it simple to book beach umbrellas and chairs. Choose your favorite beach,
          pick the perfect spot, and enjoy your day without any hassle.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg">
            <Link to="/beaches">
              Browse Beaches
            </Link>
          </Button>
          {!user && (
            <Button variant="outline" asChild size="lg">
              <Link to="/auth/register">
                Create Account
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Featured Beaches */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Featured Beaches
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Discover some of our most popular beach destinations
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading featured beaches...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredBeaches.map((beach) => (
              <BeachCard key={beach.id} beach={beach} />
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link to="/beaches">
              View All Beaches
            </Link>
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Reserve your beach spot in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg bg-white shadow-sm">
            <div className="w-12 h-12 rounded-full bg-primary text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Choose a Beach</h3>
            <p className="text-gray-600">
              Browse our selection of beautiful beaches and select your favorite.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-white shadow-sm">
            <div className="w-12 h-12 rounded-full bg-primary text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Select Your Spot</h3>
            <p className="text-gray-600">
              Pick the perfect umbrella and chairs from our interactive beach map.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-white shadow-sm">
            <div className="w-12 h-12 rounded-full bg-primary text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Confirm & Pay</h3>
            <p className="text-gray-600">
              Complete your reservation by making a secure online payment.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
