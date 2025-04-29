
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAdminReservations } from "@/hooks/admin/useAdminReservations";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { LaptopIcon, UserIcon } from "lucide-react";
import { Beach } from "@/types";

interface AdminOutletContext {
  beaches: Beach[];
}

export default function ReservationsDashboard() {
  const { isLoading, reservations } = useAdminReservations();
  const { beaches = [] } = useOutletContext<AdminOutletContext>();
  const [activeTab, setActiveTab] = useState("all");

  // Group reservations - online vs. onsite
  const onlineReservations = reservations.filter(r => !r.created_by);
  const onsiteReservations = reservations.filter(r => r.created_by);

  // Get the reservations based on active tab
  const displayReservations = activeTab === "all" 
    ? reservations 
    : activeTab === "online" 
      ? onlineReservations 
      : onsiteReservations;

  const formatReservationId = (id: string) => {
    return id.substring(0, 8).toUpperCase();
  };

  // Count reservations by status
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
  const cancelledCount = reservations.filter(r => r.status === 'cancelled').length;
  const totalRevenue = reservations
    .filter(r => r.status !== 'cancelled')
    .reduce((sum, r) => sum + Number(r.payment_amount || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Reservations Dashboard</h1>
        
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reservations.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {onlineReservations.length} online · {onsiteReservations.length} on-site
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Reservation Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedCount} confirmed</div>
              <p className="text-xs text-muted-foreground mt-1">
                {cancelledCount} cancelled
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                From confirmed reservations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for reservation types */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Reservations</TabsTrigger>
            <TabsTrigger value="online" className="flex items-center gap-1">
              <LaptopIcon className="h-3.5 w-3.5" />
              <span>Online</span>
            </TabsTrigger>
            <TabsTrigger value="onsite" className="flex items-center gap-1">
              <UserIcon className="h-3.5 w-3.5" />
              <span>On-site</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-24">
                    <p>Loading reservations...</p>
                  </div>
                ) : displayReservations.length === 0 ? (
                  <div className="flex items-center justify-center h-24">
                    <p>No reservations found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Guest</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Beach</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayReservations.slice(0, 10).map(reservation => (
                          <TableRow key={reservation.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              {formatReservationId(reservation.id)}
                            </TableCell>
                            <TableCell>{reservation.guest_name || "No name"}</TableCell>
                            <TableCell>
                              {format(new Date(reservation.reservation_date), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>{reservation.beach_name}</TableCell>
                            <TableCell>${Number(reservation.payment_amount).toFixed(2)}</TableCell>
                            <TableCell>
                              {reservation.created_by ? (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200">
                                  On-site
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                  Online
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {reservation.status === "confirmed" && (
                                <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
                              )}
                              {reservation.status === "cancelled" && (
                                <Badge variant="destructive">Cancelled</Badge>
                              )}
                              {reservation.status === "pending" && (
                                <Badge variant="outline">Pending</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {displayReservations.length > 10 && (
                      <div className="text-center mt-4 text-sm text-muted-foreground">
                        Showing 10 of {displayReservations.length} reservations
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
