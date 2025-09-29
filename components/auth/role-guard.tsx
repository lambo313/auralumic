'use client';

import { useAuth } from "@/hooks/use-auth";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ("client" | "reader" | "admin")[];
  checkBaseRole?: boolean; // For admin routes, check the base role instead of current view
}

export function RoleGuard({ children, allowedRoles, checkBaseRole = false }: RoleGuardProps) {
  const { role, baseRole, isLoaded } = useAuth();
  const [checked, setChecked] = useState(false);

  const roleToCheck = checkBaseRole ? baseRole : role;

  useEffect(() => {
    if (isLoaded && roleToCheck) {
      setChecked(true);
      console.log('[RoleGuard] roleToCheck:', roleToCheck);
    }
  }, [isLoaded, roleToCheck]);

  useEffect(() => {
    if (checked && (!roleToCheck || !allowedRoles.includes(roleToCheck as "client" | "reader" | "admin"))) {
      console.warn('[RoleGuard] Redirecting: roleToCheck:', roleToCheck, 'allowedRoles:', allowedRoles);
      redirect("/"); // Redirect to home if user doesn't have required role
    }
  }, [checked, roleToCheck, allowedRoles]);

  if (!checked) {
    // Optionally render a loading spinner or null
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return <>{children}</>;
}
