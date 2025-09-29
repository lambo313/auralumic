"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function AdminRedirect() {
  const { role, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && role === "admin") {
      // Redirect admin users to admin dashboard
      router.push("/admin/dashboard");
    }
  }, [role, isLoaded, router]);

  return null;
}
