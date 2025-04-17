
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Beach } from "@/types";

interface FilterBarProps {
  searchQuery: string;
  dateFilter: Date | undefined;
  statusFilter: string;
  beachFilter: string;
  checkinFilter: string;
  beaches: Beach[];
  setSearchQuery: (value: string) => void;
  setDateFilter: (date: Date | undefined) => void;
  setStatusFilter: (value: string) => void;
  setBeachFilter: (value: string) => void;
  setCheckinFilter: (value: string) => void;
  clearFilters: () => void;
}

export function FilterBar({
  searchQuery,
  dateFilter,
  statusFilter,
  beachFilter,
  checkinFilter,
  beaches,
  setSearchQuery,
  setDateFilter,
  setStatusFilter,
  setBeachFilter,
  setCheckinFilter,
  clearFilters
}: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or phone..."
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
        <Select value={beachFilter} onValueChange={setBeachFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by beach" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Beaches</SelectItem>
            {beaches.map((beach) => (
              <SelectItem key={beach.id} value={beach.id}>
                {beach.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={checkinFilter} onValueChange={setCheckinFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by check-in" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Check-ins</SelectItem>
            <SelectItem value="checked_in">Checked In</SelectItem>
            <SelectItem value="not_checked_in">Not Checked In</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          onClick={clearFilters}
          className="flex gap-2"
        >
          <Filter className="h-4 w-4" /> Clear
        </Button>
      </div>
    </div>
  );
}
