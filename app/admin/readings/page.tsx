"use client";

import { ReadingManagement } from "@/components/admin/reading-management";

export default function ReadingsPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between space-x-6">
        <h1 className="page-title">Reading Management</h1>
        <p className="page-description">Monitor and manage all platform readings</p>
      </div>
      <ReadingManagement />
    </div>
  );
}
