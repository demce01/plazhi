
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Beach } from "@/types";
import { BeachCard } from "@/components/beaches/BeachCard";
import { useAuth } from "@/contexts/auth";
import { Search, MapPin, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// In a full CMS implementation, this would come from the database
const pageContent = {
  hero: {
    title: "Your Perfect Beach Day",
    subtitle: "Starts Here",
    description: "Easily reserve beach umbrellas and chairs at your favorite beaches. Experience hassle-free beach days with BeachEase's simple booking system."
  },
  howItWorks: {
    title: "How It Works",
    subtitle: "Book your perfect beach spot in three simple steps",
    steps: [
      {
        title: "1. Choose Location",
        description: "Browse our selection of beautiful beaches and select your favorite spot.",
        icon: Search
      },
      {
        title: "2. Pick a Date",
        description: "Select your preferred date and time for your beach visit.",
        icon: Calendar
      },
      {
        title: "3. Confirm & Relax",
        description: "Complete your booking and get ready for a perfect beach day.",
        icon: CheckCircle
      }
    ]
  },
  featuredBeaches: {
    title: "Featured Beaches",
    subtitle: "Discover our most popular destinations"
  }
};

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
    <div className="space-y-20 px-4 sm:px-6 lg:px-8">
      {/* Hero Section with Modern Design */}
      <section className="relative py-20 sm:py-32">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            {pageContent.hero.title}
            <span className="block text-primary">{pageContent.hero.subtitle}</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            {pageContent.hero.description}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="min-w-[160px]">
              <Link to="/beaches">Find Your Spot</Link>
            </Button>
            {!user && (
              <Button variant="outline" asChild size="lg" className="min-w-[160px]">
                <Link to="/auth/register">Create Account</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {pageContent.howItWorks.title}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {pageContent.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pageContent.howItWorks.steps.map((step, index) => (
            <Card key={index} className="border-none shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="pt-8 pb-6 px-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3 w-12 h-12 mx-auto">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Beaches Section */}
      <section className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {pageContent.featuredBeaches.title}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {pageContent.featuredBeaches.subtitle}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-[300px] animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredBeaches.map((beach) => (
              <BeachCard key={beach.id} beach={beach} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Button variant="outline" asChild size="lg">
            <Link to="/beaches">
              View All Beaches
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
