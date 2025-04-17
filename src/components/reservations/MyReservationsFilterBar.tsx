
import { CalendarRange, Search, Hash, Phone, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MyReservationsFilterBarProps {
  nameFilter: string;
  phoneFilter: string;
  reservationIdFilter: string;
  dateFilter: Date | undefined;
  statusFilter: string;
  setNameFilter: (value: string) => void;
  setPhoneFilter: (value: string) => void;
  setReservationIdFilter: (value: string) => void;
  setDateFilter: (date: Date | undefined) => void;
  setStatusFilter: (value: string) => void;
}

export function MyReservationsFilterBar({
  nameFilter,
  phoneFilter,
  reservationIdFilter,
  dateFilter,
  statusFilter,
  setNameFilter,
  setPhoneFilter,
  setReservationIdFilter,
  setDateFilter,
  setStatusFilter,
}: MyReservationsFilterBarProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by guest name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="relative">
          <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by phone number..."
            value={phoneFilter}
            onChange={(e) => setPhoneFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="relative">
          <Hash className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by reservation ID..."
            value={reservationIdFilter}
            onChange={(e) => setReservationIdFilter(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-[180px]">
          <DatePicker
            date={dateFilter}
            setDate={setDateFilter}
            placeholder="Filter by date"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
