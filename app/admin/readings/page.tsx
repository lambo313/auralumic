"use client";

import { useRouter } from "next/navigation";
import { ReadingManagement } from "@/components/admin/reading-management";

export default function ReadingsPage() {
  const router = useRouter();

  return (
    <div className="container py-6">
      <ReadingManagement />
    </div>
  );
}
