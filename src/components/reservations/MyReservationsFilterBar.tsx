
import { CalendarRange, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

interface MyReservationsFilterBarProps {
  searchQuery: string;
  dateFilter: Date | undefined;
  statusFilter: string;
  setSearchQuery: (value: string) => void;
  setDateFilter: (date: Date | undefined) => void;
  setStatusFilter: (value: string) => void;
}

export function MyReservationsFilterBar({
  searchQuery,
  dateFilter,
  statusFilter,
  setSearchQuery,
  setDateFilter,
  setStatusFilter,
}: MyReservationsFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by beach name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="w-[180px]">
          <DatePicker
            date={dateFilter}
            setDate={setDateFilter}
            placeholder="Filter by date"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
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
