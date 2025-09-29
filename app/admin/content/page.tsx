import { Metadata } from "next";
import { ContentManagement } from "@/components/admin/content-management";

export const metadata: Metadata = {
  title: "Content Management | AuraLumic Admin",
  description: "Manage categories, attributes, and badges for the AuraLumic platform",
};

export default function ContentPage() {
  return (
    <div className="container mx-auto py-8">
      <ContentManagement />
    </div>
  );
}
