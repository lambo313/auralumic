import { UserManagement } from "@/components/admin/user-management";

export default function AdminUsersPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between space-x-6">
        <h1 className="page-title">User Management</h1>
        <p className="page-description">Manage user roles, permissions, and access levels</p>
      </div>
      <UserManagement />
    </div>
  );
}
