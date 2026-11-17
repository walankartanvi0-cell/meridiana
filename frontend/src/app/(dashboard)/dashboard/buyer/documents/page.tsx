import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DocumentsPanel from "@/components/dashboard/DocumentsPanel";

export const metadata: Metadata = { title: "Documents" };

export default function BuyerDocumentsPage() {
  return (
    <ProtectedRoute allowedRoles={["buyer"]}>
      <DocumentsPanel role="buyer" />
    </ProtectedRoute>
  );
}
