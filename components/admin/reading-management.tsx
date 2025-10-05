"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  Clock,
  Star,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Reading, ReadingStatus } from "@/types/readings";

interface ReadingWithDetails extends Reading {
  readerName: string;
  clientName: string;
  readerAvatar?: string;
  clientAvatar?: string;
  rating?: number;
  review?: string;
  type?: string;
  duration?: number;
  notes?: string;
  timeZone?: string;
  scheduledFor?: Date;
  completedAt?: Date;
}

interface ReadingStats {
  totalReadings: number;
  pendingReadings: number;
  completedReadings: number;
  cancelledReadings: number;
  totalRevenue: number;
  averageRating: number;
  averageDuration: number;
  popularCategories: { category: string; count: number }[];
}

export function ReadingManagement() {
  const [readings, setReadings] = useState<ReadingWithDetails[]>([]);
  const [stats, setStats] = useState<ReadingStats>({
    totalReadings: 0,
    pendingReadings: 0,
    completedReadings: 0,
    cancelledReadings: 0,
    totalRevenue: 0,
    averageRating: 0,
    averageDuration: 0,
    popularCategories: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedReading, setSelectedReading] = useState<ReadingWithDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReadingStatus>("all");
  const [dateRange, setDateRange] = useState<"all" | "today" | "week" | "month">("all");

  useEffect(() => {
    loadReadings();
    loadStats();
  }, []);

  const loadReadings = async () => {
    try {
      setLoading(true);
      // Simulated data - replace with actual API call
      const mockReadings: ReadingWithDetails[] = [
        {
          id: "1",
          readerId: "reader1",
          clientId: "client1",
          status: "completed",
          scheduledDate: new Date("2024-09-25T14:00:00Z"),
          completedDate: new Date("2024-09-25T15:00:00Z"),
          topic: "Love and Relationships",
          readingOption: {
            type: "video_message",
            basePrice: 100,
            timeSpan: { duration: 60, label: "1 hour", multiplier: 1 },
            finalPrice: 150
          },
          credits: 150,
          createdAt: new Date("2024-09-20T10:00:00Z"),
          updatedAt: new Date("2024-09-25T15:00:00Z"),
          readerName: "Sarah Moon",
          clientName: "Emily Johnson",
          rating: 5,
          review: "Amazing reading! Very insightful and accurate.",
          type: "Tarot Reading",
          duration: 60,
          notes: "Detailed reading about future romantic prospects",
          timeZone: "UTC",
          scheduledFor: new Date("2024-09-25T14:00:00Z"),
          completedAt: new Date("2024-09-25T15:00:00Z")
        },
        {
          id: "2",
          readerId: "reader2",
          clientId: "client2",
          status: "requested",
          scheduledDate: new Date("2024-09-29T16:00:00Z"),
          topic: "Career Guidance",
          readingOption: {
            type: "phone_call",
            basePrice: 80,
            timeSpan: { duration: 45, label: "45 minutes", multiplier: 1.5 },
            finalPrice: 120
          },
          credits: 120,
          createdAt: new Date("2024-09-26T09:00:00Z"),
          updatedAt: new Date("2024-09-26T09:00:00Z"),
          readerName: "Marcus Stars",
          clientName: "David Chen",
          type: "Astrology Chart",
          duration: 45,
          notes: "Birth chart analysis for career decisions",
          timeZone: "UTC",
          scheduledFor: new Date("2024-09-29T16:00:00Z")
        },
        {
          id: "3",
          readerId: "reader1",
          clientId: "client3",
          status: "accepted",
          scheduledDate: new Date("2024-09-30T10:00:00Z"),
          topic: "Life Purpose",
          readingOption: {
            type: "live_video",
            basePrice: 60,
            timeSpan: { duration: 30, label: "30 minutes", multiplier: 1.3 },
            finalPrice: 80
          },
          credits: 80,
          createdAt: new Date("2024-09-27T14:30:00Z"),
          updatedAt: new Date("2024-09-28T08:00:00Z"),
          readerName: "Sarah Moon",
          clientName: "Lisa Anderson",
          type: "Oracle Cards",
          duration: 30,
          notes: "Seeking clarity on life direction and purpose",
          timeZone: "UTC",
          scheduledFor: new Date("2024-09-30T10:00:00Z")
        },
        {
          id: "4",
          readerId: "reader3",
          clientId: "client4",
          status: "declined",
          topic: "Family Issues",
          readingOption: {
            type: "video_message",
            basePrice: 100,
            timeSpan: { duration: 60, label: "1 hour", multiplier: 1.5 },
            finalPrice: 150
          },
          credits: 150,
          createdAt: new Date("2024-09-24T11:15:00Z"),
          updatedAt: new Date("2024-09-24T16:30:00Z"),
          readerName: "Luna Mystic",
          clientName: "Robert Wilson",
          type: "Psychic Reading",
          duration: 60,
          notes: "Concerns about family relationships and dynamics",
          timeZone: "UTC"
        }
      ];
      setReadings(mockReadings);
    } catch (error) {
      console.error("Error loading readings:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Simulated stats - replace with actual API call
      const mockStats: ReadingStats = {
        totalReadings: 245,
        pendingReadings: 18,
        completedReadings: 198,
        cancelledReadings: 29,
        totalRevenue: 28750,
        averageRating: 4.7,
        averageDuration: 52,
        popularCategories: [
          { category: "Love & Relationships", count: 89 },
          { category: "Career Guidance", count: 67 },
          { category: "Life Purpose", count: 45 },
          { category: "Family Issues", count: 34 },
          { category: "Spiritual Growth", count: 10 }
        ]
      };
      setStats(mockStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const getStatusColor = (status: ReadingStatus) => {
    switch (status) {
      case "requested":
        return "bg-yellow-500";
      case "accepted":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "declined":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusVariant = (status: ReadingStatus) => {
    switch (status) {
      case "requested":
        return "secondary";
      case "accepted":
        return "default";
      case "completed":
        return "default";
      case "declined":
        return "destructive";
      default:
        return "outline";
    }
  };

  const filteredReadings = readings.filter((reading) => {
    const matchesSearch = 
      reading.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reading.readerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reading.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reading.type && reading.type.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || reading.status === statusFilter;
    
    const now = new Date();
    let matchesDate = true;
    
    if (dateRange === "today") {
      matchesDate = reading.createdAt.toDateString() === now.toDateString();
    } else if (dateRange === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = reading.createdAt >= weekAgo;
    } else if (dateRange === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = reading.createdAt >= monthAgo;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const updateReadingStatus = async (readingId: string, newStatus: ReadingStatus) => {
    try {
      // API call would go here
      setReadings(prev => prev.map(reading =>
        reading.id === readingId ? { ...reading, status: newStatus, updatedAt: new Date() } : reading
      ));
    } catch (error) {
      console.error("Error updating reading status:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="readings" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            All Readings
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReadings}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingReadings}</div>
                <p className="text-xs text-muted-foreground">Awaiting reader response</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating}/5</div>
                <p className="text-xs text-muted-foreground">+0.2 from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Reading Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="text-sm font-medium">{stats.completedReadings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="text-sm font-medium">{stats.pendingReadings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Cancelled</span>
                  </div>
                  <span className="text-sm font-medium">{stats.cancelledReadings}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.popularCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{category.category}</span>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* All Readings Tab */}
        <TabsContent value="readings" className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 md:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search readings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | ReadingStatus)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="requested">Requested</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={(value) => setDateRange(value as "all" | "today" | "week" | "month")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reading</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Reader</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 w-32 animate-pulse rounded bg-muted"></div></TableCell>
                      <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted"></div></TableCell>
                      <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted"></div></TableCell>
                      <TableCell><div className="h-4 w-16 animate-pulse rounded bg-muted"></div></TableCell>
                      <TableCell><div className="h-4 w-12 animate-pulse rounded bg-muted"></div></TableCell>
                      <TableCell><div className="h-4 w-20 animate-pulse rounded bg-muted"></div></TableCell>
                      <TableCell><div className="h-4 w-16 animate-pulse rounded bg-muted"></div></TableCell>
                    </TableRow>
                  ))
                ) : filteredReadings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No readings found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReadings.map((reading) => (
                    <TableRow key={reading.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reading.topic}</div>
                          <div className="text-sm text-muted-foreground">{reading.type}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={reading.clientAvatar} />
                            <AvatarFallback>{reading.clientName[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{reading.clientName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={reading.readerAvatar} />
                            <AvatarFallback>{reading.readerName[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{reading.readerName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(reading.status)}>
                          {reading.status.charAt(0).toUpperCase() + reading.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{reading.credits}</TableCell>
                      <TableCell>{formatDate(reading.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReading(reading)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Active Tab */}
        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {filteredReadings
              .filter(reading => reading.status === "requested" || reading.status === "accepted")
              .map((reading) => (
                <Card key={reading.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{reading.topic}</CardTitle>
                        <CardDescription>{reading.type} • {reading.duration} minutes</CardDescription>
                      </div>
                      <Badge variant={getStatusVariant(reading.status)}>
                        {reading.status.charAt(0).toUpperCase() + reading.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-medium">Client</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={reading.clientAvatar} />
                            <AvatarFallback>{reading.clientName[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{reading.clientName}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Reader</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={reading.readerAvatar} />
                            <AvatarFallback>{reading.readerName[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{reading.readerName}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Scheduled</Label>
                        <div className="text-sm mt-1">
                          {reading.scheduledDate ? formatDate(reading.scheduledDate) : "Not scheduled"}
                        </div>
                      </div>
                    </div>
                    {reading.notes && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium">Notes</Label>
                        <p className="text-sm text-muted-foreground mt-1">{reading.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Average Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageDuration} min</div>
                <p className="text-xs text-muted-foreground">Across all completed readings</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((stats.completedReadings / stats.totalReadings) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">Readings successfully completed</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue per Reading</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${Math.round(stats.totalRevenue / stats.completedReadings)}
                </div>
                <p className="text-xs text-muted-foreground">Average revenue per reading</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reading Performance Metrics</CardTitle>
              <CardDescription>Key insights about platform readings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Advanced analytics coming soon</p>
                <p className="text-sm">Charts and detailed metrics will be available in the next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reading Details Dialog */}
      {selectedReading && (
        <ReadingDetailsDialog
          reading={selectedReading}
          onClose={() => setSelectedReading(null)}
          onUpdateStatus={updateReadingStatus}
        />
      )}
    </div>
  );
}

// Reading Details Dialog Component
function ReadingDetailsDialog({
  reading,
  onClose,
  onUpdateStatus,
}: {
  reading: ReadingWithDetails;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ReadingStatus) => void;
}) {
  const [newStatus, setNewStatus] = useState<ReadingStatus>(reading.status);

  const handleStatusUpdate = () => {
    onUpdateStatus(reading.id, newStatus);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reading Details</DialogTitle>
          <DialogDescription>View and manage reading information</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Topic</Label>
              <p className="text-sm mt-1">{reading.topic}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <p className="text-sm mt-1">{reading.type}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Duration</Label>
              <p className="text-sm mt-1">{reading.duration} minutes</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Credits</Label>
              <p className="text-sm mt-1">{reading.credits}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge variant={getStatusVariant(reading.status)} className="mt-1">
                {reading.status.charAt(0).toUpperCase() + reading.status.slice(1)}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Created</Label>
              <p className="text-sm mt-1">{formatDate(reading.createdAt)}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Client</Label>
              <div className="flex items-center gap-3 mt-2">
                <Avatar>
                  <AvatarImage src={reading.clientAvatar} />
                  <AvatarFallback>{reading.clientName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{reading.clientName}</p>
                  <p className="text-xs text-muted-foreground">Client ID: {reading.clientId}</p>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Reader</Label>
              <div className="flex items-center gap-3 mt-2">
                <Avatar>
                  <AvatarImage src={reading.readerAvatar} />
                  <AvatarFallback>{reading.readerName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{reading.readerName}</p>
                  <p className="text-xs text-muted-foreground">Reader ID: {reading.readerId}</p>
                </div>
              </div>
            </div>
          </div>

          {reading.notes && (
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm text-muted-foreground mt-1">{reading.notes}</p>
            </div>
          )}

          {reading.scheduledDate && (
            <div>
              <Label className="text-sm font-medium">Scheduled For</Label>
              <p className="text-sm mt-1">{formatDate(reading.scheduledDate)}</p>
            </div>
          )}

          {reading.rating && reading.review && (
            <div>
              <Label className="text-sm font-medium">Client Review</Label>
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < reading.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{reading.rating}/5</span>
                </div>
                <p className="text-sm">{reading.review}</p>
              </div>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Update Status</Label>
            <Select value={newStatus} onValueChange={(value: ReadingStatus) => setNewStatus(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleStatusUpdate} disabled={newStatus === reading.status}>
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getStatusVariant(status: ReadingStatus) {
  switch (status) {
    case "requested":
      return "secondary" as const;
    case "accepted":
      return "default" as const;
    case "completed":
      return "default" as const;
    case "declined":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}