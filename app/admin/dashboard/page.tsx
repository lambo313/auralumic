import { Card } from "@/components/ui/card";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { UserStateSwitcher } from "@/components/admin/user-state-switcher";
import { ContentManagement } from "@/components/admin/content-management";
import { UserManagement } from "@/components/admin/user-management";
import { ReadingManagement } from "@/components/admin/reading-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Settings, 
  AlertTriangle 
} from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Administrator Dashboard</h1>
        <p className="text-muted-foreground">Platform oversight and management</p>
      </div>
      
      {/* User State Switcher */}
      <UserStateSwitcher />
      
      {/* Main Admin Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="readings" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Readings
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="disputes" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Disputes
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <AdminDashboard />
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 ">
              <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h3 className="font-medium">Pending Reader Approvals</h3>
                    <p className="text-sm text-muted-foreground">5 applications awaiting review</p>
                  </div>
                  <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h3 className="font-medium">Open Disputes</h3>
                    <p className="text-sm text-muted-foreground">2 disputes need attention</p>
                  </div>
                  <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h3 className="font-medium">System Health</h3>
                    <p className="text-sm text-muted-foreground">All systems operational</p>
                  </div>
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 ">
              <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">New reader application</p>
                    <p className="text-xs text-muted-foreground">Alex Johnson applied 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Reader approved</p>
                    <p className="text-xs text-muted-foreground">Maria Santos was approved yesterday</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="h-2 w-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Dispute filed</p>
                    <p className="text-xs text-muted-foreground">Client disputed reading quality</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        {/* Readings Tab */}
        <TabsContent value="readings" className="space-y-6">
          <ReadingManagement />
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <ContentManagement />
        </TabsContent>

        {/* Disputes Tab */}
        <TabsContent value="disputes" className="space-y-6">
          <Card className="p-6 ">
            <h2 className="mb-4 text-xl font-semibold">Dispute Resolution</h2>
            <p className="text-muted-foreground mb-4">
              Review and resolve disputes between clients and readers
            </p>
            {/* The existing dispute resolver component would go here */}
            <div className="text-center py-8 text-muted-foreground">
              No active disputes to resolve
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
