import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DocumentsPanel from "@/components/dashboard/DocumentsPanel";

export const metadata: Metadata = { title: "Documents" };

export default function AdminDocumentsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DocumentsPanel role="admin" />
    </ProtectedRoute>
  );
}
