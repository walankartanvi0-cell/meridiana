import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleOverview from "@/components/dashboard/RoleOverview";

export const metadata: Metadata = { title: "Administrator Overview" };

export default function AdminOverviewPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <RoleOverview role="admin" />
    </ProtectedRoute>
  );
}
