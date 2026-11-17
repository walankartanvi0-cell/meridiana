import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DealManagementPanel from "@/components/dashboard/DealManagementPanel";

export const metadata: Metadata = { title: "Manage Deals" };

export default function AdminDealsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DealManagementPanel role="admin" />
    </ProtectedRoute>
  );
}
