"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Eye, User, Users, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserStateSwitcher() {
  const { role, baseRole, switchViewState } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only show this component if user is actually an admin in database
  if (baseRole !== "admin") {
    return null;
  }

  const handleRoleChange = async (newRole: "client" | "reader" | "admin") => {
    if (newRole === role) return;
    
    setIsLoading(true);
    try {
      await switchViewState(newRole);
  // Persist view state for admin
  localStorage.setItem("adminViewState", newRole);
      // Redirect to appropriate dashboard
      switch (newRole) {
        case "client":
          router.push("/dashboard");
          break;
        case "reader":
          router.push("/dashboard");
          break;
        case "admin":
          router.push("/admin/dashboard");
          break;
      }
    } catch (error) {
      console.error("Failed to switch view state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case "client":
        return <User className="h-4 w-4" />;
      case "reader":
        return <Users className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleDescription = (roleType: string) => {
    switch (roleType) {
      case "client":
        return "Access client features - browse readers, book readings, manage bookings";
      case "reader":
        return "Access reader features - manage profile, handle bookings, view earnings";
      case "admin":
        return "Access admin features - manage platform, approve readers, resolve disputes";
      default:
        return "";
    }
  };

  if (!isMounted) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Administrator View Controller
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-10 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Administrator View Controller
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            As an administrator, you can switch between different user states to test functionality and assist users.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <label className="text-sm font-medium">Current View:</label>
              <Select
                value={role || "client"}
                onValueChange={(value) => handleRoleChange(value as "client" | "reader" | "admin")}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(role || "client")}
                      <span className="capitalize">{role || "client"}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Client View
                    </div>
                  </SelectItem>
                  <SelectItem value="reader">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Reader View
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin View
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground flex-1">
              {getRoleDescription(role || "client")}
            </div>
          </div>
          
          {isLoading && (
            <p className="text-sm text-blue-600">Switching user state...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
