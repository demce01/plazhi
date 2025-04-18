import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAdminReservations, ReservationWithBeachAdmin } from "@/hooks/admin/useAdminReservations";
import { AdminReservationsTable } from "./AdminReservationsTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
// Import necessary date components and utils
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay, endOfDay } from 'date-fns';
import { cn } from "@/lib/utils";

// Define possible statuses for filtering
const STATUS_OPTIONS = ['all', 'confirmed', 'cancelled', 'pending', 'completed'];

export function ReservationManagementTab() {
  const { 
    reservations: allReservations,
    isLoading, 
    refreshReservations 
  } = useAdminReservations();

  // State for filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Memoized filtered reservations
  const filteredReservations = useMemo(() => {
    let filtered = allReservations;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => (r.status || 'pending').toLowerCase() === statusFilter);
    }

    // Apply search term filter (guest name, email, phone, beach name)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.guest_name?.toLowerCase().includes(lowerSearchTerm) ||
        r.guest_email?.toLowerCase().includes(lowerSearchTerm) ||
        r.guest_phone?.toLowerCase().includes(lowerSearchTerm) ||
        r.beach_name?.toLowerCase().includes(lowerSearchTerm) ||
        r.id.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply date range filter (inclusive)
    if (dateRange.from || dateRange.to) {
        const start = dateRange.from ? startOfDay(dateRange.from) : null;
        const end = dateRange.to ? endOfDay(dateRange.to) : null;

        filtered = filtered.filter(r => {
            try {
                const reservationDate = new Date(r.reservation_date); // Ensure date string is parsed
                if (start && reservationDate < start) return false;
                if (end && reservationDate > end) return false;
                return true;
            } catch (e) {
                console.error("Error parsing reservation date:", r.reservation_date, e);
                return false; // Exclude if date is invalid
            }
        });
    }

    return filtered;
  }, [allReservations, statusFilter, searchTerm, dateRange]);

  return (
    <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                 <h1 className="text-2xl font-bold">Manage Reservations</h1>
                 <p className="text-muted-foreground">View, filter, and manage all guest reservations.</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
                <Input 
                    placeholder="Search by guest, beach, ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status..." />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map(status => (
                            <SelectItem key={status} value={status} className="capitalize">
                                {status}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {/* Date Range Pickers */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date-from"
                            variant={"outline"}
                            className={cn(
                                "w-[200px] justify-start text-left font-normal",
                                !dateRange.from && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.from ? format(dateRange.from, "LLL dd, y") : <span>Start date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={dateRange.from}
                            onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date-to"
                            variant={"outline"}
                            className={cn(
                                "w-[200px] justify-start text-left font-normal",
                                !dateRange.to && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.to ? format(dateRange.to, "LLL dd, y") : <span>End date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={dateRange.to}
                            onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                 {/* Button to clear date filter */}
                 {(dateRange.from || dateRange.to) && (
                     <Button variant="ghost" size="sm" onClick={() => setDateRange({})}>Clear Dates</Button>
                 )}
            </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <AdminReservationsTable 
              reservations={filteredReservations}
              isLoading={isLoading}
              onActionComplete={refreshReservations}
            />
          </CardContent>
        </Card>
    </div>
  );
} 