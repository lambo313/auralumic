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
  ChevronUp,
  ChevronDown,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { adminService } from "@/services/api";
import type { Reading, ReadingStatus } from "@/types/readings";

interface ReadingWithDetails extends Reading {
  readerName: string;
  clientName: string;
  readerAvatar?: string;
  clientAvatar?: string;
  // Use the same review shape as the core Reading type
  review?: Reading["review"];
  type?: string;
  duration?: number;
  notes?: string;
  timeZone?: string;
  scheduledFor?: Date;
  completedAt?: Date;
  dispute?: {
    reason: string;
    status: string;
    createdAt: Date;
    adminResponse?: string;
    resolvedAt?: Date;
  };
}

interface ReadingStats {
  totalReadings: number;
  pendingReadings: number;
  completedReadings: number;
  disputedReadings: number;
  cancelledReadings: number;
  activeReadings: number;
  totalRevenue: number; // Backward compatibility
  monthlyRevenue: number;
  revenuePerReading: number;
  averageRating: number;
  averageDuration: number;
  popularCategories: { category: string; count: number }[];
  prevMonthlyRevenue?: number | null;
}

export function ReadingManagement() {
  const [readings, setReadings] = useState<ReadingWithDetails[]>([]);
  const [stats, setStats] = useState<ReadingStats>({
    totalReadings: 0,
    pendingReadings: 0,
    completedReadings: 0,
    disputedReadings: 0,
    activeReadings: 0,
    cancelledReadings: 0,
    totalRevenue: 0, // Backward compatibility
    monthlyRevenue: 0,
    revenuePerReading: 0,
    averageRating: 0,
    averageDuration: 0,
    popularCategories: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedReading, setSelectedReading] = useState<ReadingWithDetails | null>(null);
  const [clientMap, setClientMap] = useState<Record<string, { username?: string; profileImage?: string }>>({});
  const [readerMap, setReaderMap] = useState<Record<string, { username?: string; profileImage?: string }>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReadingStatus>("all");
  const [dateRange, setDateRange] = useState<"all" | "today" | "week" | "month">("all");

  useEffect(() => {
    loadReadings();
    loadStats();
  }, []);

  // Sorting state for the table
  type SortKey = 'topic' | 'client' | 'reader' | 'status' | 'credits' | 'date' | null;
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const loadReadings = async () => {
    try {
      setLoading(true);
      // Fetch real readings from admin API
      const res = await fetch('/api/admin/readings?page=1&limit=200');
      if (!res.ok) throw new Error('Failed to load readings');
      const data = await res.json();
      // Ensure createdAt/updatedAt are Date instances for display helpers
      const normalized: ReadingWithDetails[] = (data.readings || []).map((r: unknown) => {
        const rr = r as ReadingWithDetails;
        return {
          ...rr,
          // derive friendly fields for UI from the readingOption stored in DB
          type: rr.readingOption?.type ?? rr.type ?? "",
          duration: rr.readingOption?.timeSpan?.duration ?? rr.duration ?? undefined,
          createdAt: rr.createdAt ? new Date(String(rr.createdAt)) : new Date(),
          updatedAt: rr.updatedAt ? new Date(String(rr.updatedAt)) : new Date(),
          scheduledDate: rr.scheduledDate ? new Date(String(rr.scheduledDate)) : undefined,
          completedDate: rr.completedDate ? new Date(String(rr.completedDate)) : undefined,
        };
      });
      setReadings(normalized);
      // kick off fetching display info for users referenced in readings
      const clientIds = Array.from(new Set(normalized.map(r => r.clientId).filter(Boolean)));
      const readerIds = Array.from(new Set(normalized.map(r => r.readerId).filter(Boolean)));
      // fetch any ids not already present in maps
      const missingClients = clientIds.filter(id => !clientMap[id]);
      const missingReaders = readerIds.filter(id => !readerMap[id]);
      if (missingClients.length > 0) {
        missingClients.forEach(async (id) => {
          try {
            const res = await fetch(`/api/users/${id}`);
            if (!res.ok) return;
            const data = await res.json();
            setClientMap(prev => ({ ...prev, [id]: { username: data.username || data.firstName || data.name, profileImage: data.profileImage || data.imageUrl } }));
          } catch (err) {
            // ignore individual failures
          }
        });
      }
      if (missingReaders.length > 0) {
        missingReaders.forEach(async (id) => {
          try {
            const res = await fetch(`/api/readers/${id}`);
            if (!res.ok) return;
            const data = await res.json();
            setReaderMap(prev => ({ ...prev, [id]: { username: data.username || data.displayName || data.name, profileImage: data.profileImage || data.imageUrl } }));
          } catch (err) {
            // ignore
          }
        });
      }
    } catch (error) {
      console.error("Error loading readings:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to load stats');
      const data = await res.json();
      // Map returned stats shape to ReadingStats where possible
      const mapped: ReadingStats = {
        totalReadings: data.totalReadings ?? data.totalReadings ?? 0,
        // Prefer server-provided pendingReadings (readings in instant_queue, message_queue, scheduled)
        pendingReadings: data.pendingReadings ?? data.pendingApprovals ?? 0,
          completedReadings: data.completedReadings ?? data.activeReadings ?? 0,
          disputedReadings: data.disputesOpen ?? 0,
          // activeReadings represents in-progress readings
          activeReadings: data.activeReadings ?? data.inProgressCount ?? 0,
        // Prefer server-provided cancelledReadings (refunded)
        cancelledReadings: data.cancelledReadings ?? data.disputesOpen ?? 0,
        totalRevenue: data.monthlyRevenue ?? 0, // Backward compatibility
        monthlyRevenue: data.monthlyRevenue ?? 0,
  prevMonthlyRevenue: data.prevMonthlyRevenue ?? data.previousMonthlyRevenue ?? null,
        revenuePerReading: data.revenuePerReading ?? 0,
        averageRating: data.averageRating ?? 0,
        averageDuration: data.averageDuration ?? 0,
        popularCategories: data.popularCategories ?? [],
      };
      setStats(mapped);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const computePercent = (count: number, total: number) => {
    if (!total || total <= 0) return 0;
    return Math.round((count / total) * 100);
  };

  const formatCurrency = (value: number) => {
    try {
      return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
    } catch (e) {
      return String(value);
    }
  };

  // Robust revenue per reading derivation (prefer server-provided value).
  const revenuePerReadingValue = (() => {
    if (stats.revenuePerReading && stats.revenuePerReading > 0) return stats.revenuePerReading;
    const denom = stats.completedReadings && stats.completedReadings > 0 ? stats.completedReadings : 0;
    if (!denom) return 0;
    // Prefer totalRevenue when available (backwards-compat); fall back to monthlyRevenue.
    const numerator = (stats.totalRevenue && stats.totalRevenue > 0) ? stats.totalRevenue : stats.monthlyRevenue;
    if (!numerator || numerator <= 0) return 0;
    return Math.round(numerator / denom);
  })();
 

  const getStatusVariant = (status: ReadingStatus) => {
    switch (status) {
      case "instant_queue":
        return "secondary";
      case "scheduled":
        return "default";
      case "completed":
        return "default";
      case "refunded":
        return "destructive";
      default:
        return "outline";
    }
  };

  const filteredReadings = readings.filter((reading) => {
    const lowerTerm = searchTerm.toLowerCase();
    const matchesSearch = 
      (reading.topic ?? "").toLowerCase().includes(lowerTerm) ||
      (reading.readerName ?? "").toLowerCase().includes(lowerTerm) ||
      (reading.clientName ?? "").toLowerCase().includes(lowerTerm) ||
      (reading.type ?? "").toLowerCase().includes(lowerTerm);
    
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

  // Apply sorting to the filtered readings according to sortKey and sortDir
  const sortedReadings = (() => {
    if (!sortKey) return filteredReadings;
    const copy = [...filteredReadings];
    copy.sort((a, b) => {
      const getClientName = (r: ReadingWithDetails) => clientMap[r.clientId ?? '']?.username ?? r.clientName ?? '';
      const getReaderName = (r: ReadingWithDetails) => readerMap[r.readerId ?? '']?.username ?? r.readerName ?? '';

      let av: string | number | Date = '';
      let bv: string | number | Date = '';

      switch (sortKey) {
        case 'topic':
          av = (a.topic || '').toString();
          bv = (b.topic || '').toString();
          break;
        case 'client':
          av = getClientName(a);
          bv = getClientName(b);
          break;
        case 'reader':
          av = getReaderName(a);
          bv = getReaderName(b);
          break;
        case 'status':
          av = a.status || '';
          bv = b.status || '';
          break;
        case 'credits':
          av = a.credits ?? 0;
          bv = b.credits ?? 0;
          break;
        case 'date':
          av = a.createdAt || new Date(0);
          bv = b.createdAt || new Date(0);
          break;
        default:
          av = '';
          bv = '';
      }

      let res = 0;
      if (av instanceof Date && bv instanceof Date) {
        res = av.getTime() - bv.getTime();
      } else if (typeof av === 'number' && typeof bv === 'number') {
        res = av - bv;
      } else {
        res = String(av).localeCompare(String(bv));
      }

      return sortDir === 'asc' ? res : -res;
    });
    return copy;
  })();

  const updateReadingStatus = async (readingId: string, newStatus: ReadingStatus) => {
    try {
      // Try admin API first (admin endpoint should allow updating any reading's status)
      const res = await fetch(`/api/admin/readings/${readingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        // Fallback: attempt generic readings endpoint
        console.warn('Admin status update failed, falling back to /api/readings/:id');
        const res2 = await fetch(`/api/readings/${readingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res2.ok) throw new Error('Failed to update reading status via fallback');
      }

      // Update local state optimistically based on successful API call
      setReadings(prev => prev.map(reading =>
        reading.id === readingId ? { ...reading, status: newStatus, updatedAt: new Date() } : reading
      ));

      // Business rules: adjust reader status when reading goes in_progress or archived
      const updated = readings.find(r => r.id === readingId) || null;
      const readerId = updated?.readerId;
      if (readerId) {
        try {
          if (newStatus === 'in_progress') {
            // Set reader to busy
            await fetch(`/api/admin/readers/${readerId}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'busy' }),
            });
          }

          if (newStatus === 'archived') {
            // Check if reader has any other in_progress readings; if none, set reader available
            const otherInProgress = readings.some(r => r.readerId === readerId && r.id !== readingId && r.status === 'in_progress');
            if (!otherInProgress) {
              await fetch(`/api/admin/readers/${readerId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'available' }),
              });
            }
          }
        } catch (err) {
          // Non-fatal: log and continue
          console.error('Failed to update reader status after reading status change:', err);
        }
      }

    } catch (error) {
      console.error("Error updating reading status:", error);
      throw error;
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const renderHeader = (label: string, key: SortKey) => (
    <button
      type="button"
      onClick={() => toggleSort(key)}
      className="flex items-center gap-2 text-sm font-medium"
    >
      <span>{label}</span>
      <span className="flex flex-col">
        <ChevronUp className={`h-3 w-3 ${sortKey === key && sortDir === 'asc' ? 'opacity-100' : 'opacity-30'}`} />
        <ChevronDown className={`h-3 w-3 -mt-1 ${sortKey === key && sortDir === 'desc' ? 'opacity-100' : 'opacity-30'}`} />
      </span>
    </button>
  );

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
                <p className="text-xs text-muted-foreground">Total readings to date</p>
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
                <p className="text-xs text-muted-foreground">Based on completed readings</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                      <div className="text-2xl font-bold">${formatCurrency(stats.monthlyRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.prevMonthlyRevenue && stats.prevMonthlyRevenue > 0 ? (
                      (() => {
                        const diff = stats.monthlyRevenue - (stats.prevMonthlyRevenue ?? 0);
                        const pct = Math.round((diff / (stats.prevMonthlyRevenue ?? 1)) * 100);
                        const sign = pct > 0 ? "+" : "";
                        return `${sign}${pct}% from last month`;
                      })()
                    ) : (
                      "Monthly revenue"
                    )}
                  </p>
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
                  <div className="text-sm font-medium">
                    {stats.completedReadings}
                    <span className="ml-2 text-xs text-muted-foreground">{computePercent(stats.completedReadings, Math.max(stats.totalReadings, stats.completedReadings + stats.activeReadings + stats.pendingReadings + stats.cancelledReadings))}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">In Progress</span>
                    </div>
                    <div className="text-sm font-medium">
                      {stats.activeReadings}
                      <span className="ml-2 text-xs text-muted-foreground">{computePercent(stats.activeReadings, Math.max(stats.totalReadings, stats.completedReadings + stats.activeReadings + stats.pendingReadings + stats.cancelledReadings))}%</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-gray-500 rounded-full"></div>
                    <span className="text-sm">Pending</span>
                  </div>
                  <div className="text-sm font-medium">
                    {stats.pendingReadings}
                    <span className="ml-2 text-xs text-muted-foreground">{computePercent(stats.pendingReadings, Math.max(stats.totalReadings, stats.completedReadings + stats.activeReadings + stats.pendingReadings + stats.cancelledReadings))}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Disputed</span>
                  </div>
                  <div className="text-sm font-medium">
                    {stats.disputedReadings}
                    <span className="ml-2 text-xs text-muted-foreground">{computePercent(stats.disputedReadings, Math.max(stats.totalReadings, stats.completedReadings + stats.activeReadings + stats.pendingReadings + stats.cancelledReadings))}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Cancelled</span>
                  </div>
                  <div className="text-sm font-medium">
                    {stats.cancelledReadings}
                    <span className="ml-2 text-xs text-muted-foreground">{computePercent(stats.cancelledReadings, Math.max(stats.totalReadings, stats.completedReadings + stats.activeReadings + stats.pendingReadings + stats.cancelledReadings))}%</span>
                  </div>
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
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{category.count}</Badge>
                      <span className="text-xs text-muted-foreground">{computePercent(category.count, stats.completedReadings)}%</span>
                    </div>
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
                  <SelectItem value="instant_queue">Instant Queue</SelectItem>
                  <SelectItem value="message_queue">Message Queue</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="suggested">Suggested</SelectItem>
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
                  <TableHead>{renderHeader('Reading', 'topic')}</TableHead>
                  <TableHead>{renderHeader('Client', 'client')}</TableHead>
                  <TableHead>{renderHeader('Reader', 'reader')}</TableHead>
                  <TableHead>{renderHeader('Status', 'status')}</TableHead>
                  <TableHead>{renderHeader('Credits', 'credits')}</TableHead>
                  <TableHead>{renderHeader('Date', 'date')}</TableHead>
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
                ) : sortedReadings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No readings found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedReadings.map((reading) => (
                    <TableRow key={reading.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reading.topic}</div>
                          <div className="text-sm text-muted-foreground">{reading.type ?? reading.readingOption?.type ?? ""}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={clientMap[reading.clientId ?? ""]?.profileImage ?? reading.clientAvatar} />
                            <AvatarFallback>{(clientMap[reading.clientId ?? ""]?.username ?? reading.clientName)?.[0] ?? "?"}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{clientMap[reading.clientId ?? ""]?.username ?? reading.clientName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={readerMap[reading.readerId ?? ""]?.profileImage ?? reading.readerAvatar} />
                            <AvatarFallback>{(readerMap[reading.readerId ?? ""]?.username ?? reading.readerName)?.[0] ?? "?"}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{readerMap[reading.readerId ?? ""]?.username ?? reading.readerName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(reading.status).color} text-white`}> 
                            {getStatusColor(reading.status).label}
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
            {sortedReadings
              .filter(reading => reading.status === "in_progress" )
              .map((reading) => (
                <Card key={reading.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{reading.topic}</CardTitle>
                        <CardDescription>{reading.type ?? reading.readingOption?.type ?? ""} • {(reading.duration ?? reading.readingOption?.timeSpan?.duration) ?? ""} minutes</CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(reading.status).color} text-white`}>
                        {getStatusColor(reading.status).label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-medium">Client</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={clientMap[reading.clientId ?? ""]?.profileImage ?? reading.clientAvatar} />
                            <AvatarFallback>{(clientMap[reading.clientId ?? ""]?.username ?? reading.clientName)?.[0] ?? "?"}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{clientMap[reading.clientId ?? ""]?.username ?? reading.clientName}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Reader</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={readerMap[reading.readerId ?? ""]?.profileImage ?? reading.readerAvatar} />
                            <AvatarFallback>{(readerMap[reading.readerId ?? ""]?.username ?? reading.readerName)?.[0] ?? "?"}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{readerMap[reading.readerId ?? ""]?.username ?? reading.readerName}</span>
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
                    ${formatCurrency(revenuePerReadingValue)}
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
  const [clientUser, setClientUser] = useState<{ username?: string; profileImage?: string } | null>(null);
  const [readerUser, setReaderUser] = useState<{ username?: string; profileImage?: string } | null>(null);
  const [adminResponse, setAdminResponse] = useState<string | null>(reading.dispute?.adminResponse ?? null);
  const [responseText, setResponseText] = useState<string>("");
  const [submittingResponse, setSubmittingResponse] = useState<boolean>(false);

  useEffect(() => {
    const fetchNames = async () => {
      try {
        // Fetch client username
        if (reading.clientId) {
          const res = await fetch(`/api/users/${reading.clientId}`);
          if (res.ok) {
            const data = await res.json();
            setClientUser({
              username: data.username || data.firstName || data.name,
              profileImage: data.profileImage || data.imageUrl,
            });
          }
        }

        // Fetch reader username
        if (reading.readerId) {
          const res2 = await fetch(`/api/readers/${reading.readerId}`);
          if (res2.ok) {
            const rdata = await res2.json();
            setReaderUser({
              username: rdata.username || rdata.displayName || rdata.name,
              profileImage: rdata.profileImage || rdata.imageUrl,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching user names for admin dialog:', err);
      }
    };

    fetchNames();
  }, [reading.clientId, reading.readerId]);

  const handleStatusUpdate = () => {
    onUpdateStatus(reading.id, newStatus);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reading Details</DialogTitle>
          <DialogDescription>View and manage reading information</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid gap-4 grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Topic</Label>
              <p className="text-sm mt-1">{reading.topic}</p>
            </div>
              <div>
                <Label className="text-sm font-medium">Type</Label>
                <p className="text-sm mt-1">{reading.type ?? reading.readingOption?.type ?? ""}</p>
              </div>
            <div>
              <Label className="text-sm font-medium">Duration</Label>
              <p className="text-sm mt-1">{(reading.duration ?? reading.readingOption?.timeSpan?.duration) ?? ""} minutes</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Credits</Label>
              <p className="text-sm mt-1">{reading.credits}</p>
            </div>
            <div className="flex flex-col">
              <Label className="text-sm font-medium">Status</Label>
              <Badge className={`${getStatusColor(reading.status).color} text-white mt-2 flex w-max`}>
                {getStatusColor(reading.status).label}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Created</Label>
              <p className="text-sm mt-1">{formatDate(reading.createdAt)}</p>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Client</Label>
              <div className="flex items-center gap-3 mt-2">
                <Avatar>
                  <AvatarImage src={clientUser?.profileImage ?? reading.clientAvatar} />
                  <AvatarFallback>{clientUser?.username?.[0]?.toUpperCase() ?? reading.clientName?.[0] ?? "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{clientUser?.username}</p>
                  {/* <p className="text-xs text-muted-foreground">{clientUser?.username ? `ID: ${reading.clientId}` : `Client ID: ${reading.clientId}`}</p> */}
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Reader</Label>
              <div className="flex items-center gap-3 mt-2">
                <Avatar>
                  <AvatarImage src={readerUser?.profileImage ?? reading.readerAvatar} />
                  <AvatarFallback>{readerUser?.username?.[0]?.toUpperCase() ?? reading.readerName?.[0] ?? "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{readerUser?.username}</p>
                  {/* <p className="text-xs text-muted-foreground">{readerUser?.username ? `ID: ${reading.readerId}` : `Reader ID: ${reading.readerId}`}</p> */}
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

          {reading.review && (
            <div>
              <Label className="text-sm font-medium">Client Review</Label>
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < (reading.review?.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{reading.review?.rating}/5</span>
                </div>
                <p className="text-sm">{reading.review?.review}</p>
              </div>
            </div>
          )}

          {reading.dispute && (
            <>
              <div>
                <Label className="text-sm font-medium">Client Dispute •{" "} 
                  <Badge className="mt-1">{reading.dispute?.status}</Badge>
                </Label>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mt-1">{reading.dispute?.reason}</p>
                </div>
              </div>

              {/* Show existing admin response if present (prefer local state), otherwise show input to submit one */}
              {(adminResponse || reading.dispute?.adminResponse) ? (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Admin Response</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mt-1">{adminResponse ?? reading.dispute?.adminResponse}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Admin Response</Label>
                  <Textarea
                    placeholder="Write a response to the client..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" onClick={() => { setResponseText(""); }} disabled={submittingResponse}>
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!responseText.trim()) return;
                        try {
                          setSubmittingResponse(true);
                          const res = await adminService.resolveDispute(reading.id, responseText.trim());
                          // On success, show the response and hide the input
                          setAdminResponse(responseText.trim());
                        } catch (err) {
                          console.error('Failed to submit admin response', err);
                        } finally {
                          setSubmittingResponse(false);
                        }
                      }}
                      disabled={submittingResponse || !responseText.trim()}
                    >
                      Submit Response
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <Label className="text-sm font-medium">Update Status</Label>
            <Select value={newStatus} onValueChange={(value: ReadingStatus) => setNewStatus(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant_queue">Instant Queue</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="message_queue">Message Queue</SelectItem>
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
    case "instant_queue":
      return "secondary" as const;
    case "scheduled":
      return "default" as const;
    case "completed":
      return "default" as const;
    case "refunded":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

// Top-level helper so it can be shared by the main component and the dialog
function getStatusColor(status: ReadingStatus) {
  switch (status) {
    case 'instant_queue':
      return { label: 'Instant Queue', color: 'bg-gray-500', icon: '⚡' };
    case 'scheduled':
      return { label: 'Scheduled', color: 'bg-gray-500', icon: '📅' };
    case 'message_queue':
      return { label: 'Message Queue', color: 'bg-gray-500', icon: '🎥' };
    case 'in_progress':
      return { label: 'In Progress', color: 'bg-blue-500', icon: '🔄' };
    case 'archived':
      return { label: 'Archived', color: 'bg-green-500', icon: '✅' };
    case 'disputed':
      return { label: 'Disputed', color: 'bg-yellow-500', icon: '⚠️' };
    case 'refunded':
      return { label: 'Refunded', color: 'bg-red-500', icon: '↩️' };
    default:
      return { label: status, color: 'bg-gray-500', icon: '❓' };
  }
}