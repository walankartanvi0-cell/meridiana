import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NdaPanel from "@/components/dashboard/NdaPanel";

export const metadata: Metadata = { title: "NDAs" };

export default function AdminNdasPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <NdaPanel role="admin" />
    </ProtectedRoute>
  );
}
