"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { adminService } from "@/services/api";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  BookOpen, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  DollarSign 
} from "lucide-react";

interface DashboardStats {
  totalReaders: number;
  totalClients: number;
  activeReadings: number;
  totalReadings: number;
  pendingApprovals: number;
  disputesOpen: number;
  monthlyRevenue: number;
  readerGrowth: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalReaders: 0,
    totalClients: 0,
    activeReadings: 0,
    totalReadings: 0,
    pendingApprovals: 0,
    disputesOpen: 0,
    monthlyRevenue: 0,
    readerGrowth: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const dashboardStats = await adminService.getStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error("Error loading admin stats:", error);
        // Use mock data for development
        setStats({
          totalReaders: 127,
          totalClients: 1849,
          activeReadings: 23,
          totalReadings: 3421,
          pendingApprovals: 5,
          disputesOpen: 2,
          monthlyRevenue: 18540,
          readerGrowth: 12.5,
        });
      }
    }

    loadStats();
  }, []);

  const statCards = [
    {
      title: "Total Readers",
      value: stats.totalReaders,
      icon: UserCheck,
      description: "Active readers on platform",
      trend: stats.readerGrowth > 0 ? `+${stats.readerGrowth}%` : `${stats.readerGrowth}%`,
      trendColor: stats.readerGrowth > 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "Total Clients",
      value: stats.totalClients,
      icon: Users,
      description: "Registered client accounts",
      trend: "+8.2%",
      trendColor: "text-green-600",
    },
    {
      title: "Active Readings",
      value: stats.activeReadings,
      icon: Calendar,
      description: "Currently in progress",
      trend: "Real-time",
      trendColor: "text-blue-600",
    },
    {
      title: "Total Readings",
      value: stats.totalReadings,
      icon: BookOpen,
      description: "All-time completed readings",
      trend: "+15.3%",
      trendColor: "text-green-600",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: Clock,
      description: "Reader applications awaiting review",
      trend: stats.pendingApprovals > 10 ? "High" : "Normal",
      trendColor: stats.pendingApprovals > 10 ? "text-orange-600" : "text-green-600",
    },
    {
      title: "Open Disputes",
      value: stats.disputesOpen,
      icon: AlertTriangle,
      description: "Issues requiring resolution",
      trend: stats.disputesOpen > 5 ? "High" : "Low",
      trendColor: stats.disputesOpen > 5 ? "text-red-600" : "text-green-600",
    },
    {
      title: "Monthly Revenue",
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "Platform earnings this month",
      trend: "+22.4%",
      trendColor: "text-green-600",
    },
    {
      title: "Platform Growth",
      value: `${stats.readerGrowth}%`,
      icon: TrendingUp,
      description: "Reader growth this month",
      trend: "Trending up",
      trendColor: "text-green-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="hover:shadow-aura-lg transition-shadow ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground mb-1">
                {stat.description}
              </div>
              <div className={`text-xs font-medium ${stat.trendColor}`}>
                {stat.trend}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
