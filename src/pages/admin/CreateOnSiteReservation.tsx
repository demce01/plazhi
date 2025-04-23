
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Import the form component
import { OnSiteReservationForm } from '@/components/admin/OnSiteReservationForm';

export default function CreateOnSiteReservation() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Create On-Site Reservation</CardTitle>
          <CardDescription>
            Create a new reservation for a guest paying on-site. 
            Select the beach, date, sets, and enter guest details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Render the actual form */}
          <OnSiteReservationForm />
        </CardContent>
      </Card>
    </div>
  );
} 
