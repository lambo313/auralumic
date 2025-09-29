import { MainLayout } from "@/components/layout/main-layout";
import { RoleGuard } from "@/components/auth/role-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["admin"]} checkBaseRole={true}>
      <MainLayout forceRole="admin">
        {children}
      </MainLayout>
    </RoleGuard>
  );
}
