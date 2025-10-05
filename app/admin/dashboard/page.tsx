import { Card } from "@/components/ui/card";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { UserStateSwitcher } from "@/components/admin/user-state-switcher";

export default function AdminDashboardPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between space-x-6">
        <h1 className="page-title">Administrator Dashboard</h1>
        <p className="page-description">Platform oversight and management</p>
      </div>
      
      {/* User State Switcher */}
      <UserStateSwitcher />
      
      {/* Main Dashboard Content */}
      <div className="space-y-6">
        <AdminDashboard />
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
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
          
          <Card className="p-6">
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
      </div>
    </div>
  );
}
