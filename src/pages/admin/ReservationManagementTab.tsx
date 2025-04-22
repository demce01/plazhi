
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAdminReservations, ReservationWithBeachAdmin } from "@/hooks/admin/useAdminReservations";
import { AdminReservationsTable } from "@/components/admin/AdminReservationsTable";
import { Beach } from "@/types";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterX, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReservationManagementTabProps {
  beaches: Beach[];
}

export default function ReservationManagementTab({ beaches = [] }: ReservationManagementTabProps) {
  const { isLoading, reservations, refreshReservations } = useAdminReservations();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBeach, setSelectedBeach] = useState("all");

  // Format reservation ID for display (first 8 characters in uppercase)
  const formatReservationId = (id: string) => {
    return id.substring(0, 8).toUpperCase();
  };

  // Filter reservations
  const filteredReservations = reservations.filter(reservation => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      reservation.guest_name?.toLowerCase().includes(searchLower) ||
      reservation.guest_email?.toLowerCase().includes(searchLower) ||
      reservation.guest_phone?.toLowerCase().includes(searchLower) ||
      formatReservationId(reservation.id).includes(searchLower);

    // Date filter
    const matchesDate = !selectedDate || 
      new Date(reservation.reservation_date).toDateString() === selectedDate.toDateString();

    // Status filter
    const matchesStatus = selectedStatus === "all" || reservation.status === selectedStatus;

    // Beach filter
    const matchesBeach = selectedBeach === "all" || reservation.beach_id === selectedBeach;

    return matchesSearch && matchesDate && matchesStatus && matchesBeach;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDate(undefined);
    setSelectedStatus("all");
    setSelectedBeach("all");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Reservation Management</h1>
        <p className="text-muted-foreground">
          View, filter, and manage all beach reservations in one place
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by guest name, email, phone or Booking ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 md:flex-nowrap">
                <DatePicker
                  date={selectedDate}
                  setDate={setSelectedDate}
                  className="w-[240px]"
                  placeholder="Filter by date"
                />
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedBeach} onValueChange={setSelectedBeach}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Beach" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Beaches</SelectItem>
                    {beaches && beaches.map((beach) => (
                      <SelectItem key={beach.id} value={beach.id}>
                        {beach.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <FilterX className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </div>

            <AdminReservationsTable
              reservations={filteredReservations}
              isLoading={isLoading}
              onActionComplete={refreshReservations}
              formatReservationId={formatReservationId}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
