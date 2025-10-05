import { Metadata } from "next";
import { ContentManagement } from "@/components/admin/content-management";

export const metadata: Metadata = {
  title: "Content Management | AuraLumic Admin",
  description: "Manage categories, attributes, and badges for the AuraLumic platform",
};

export default function ContentPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between space-x-6">
        <h1 className="page-title">Content Management</h1>
        <p className="page-description">Manage categories, attributes, and badges</p>
      </div>
      <ContentManagement />
    </div>
  );
}
