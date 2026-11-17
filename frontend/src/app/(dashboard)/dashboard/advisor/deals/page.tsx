import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DealManagementPanel from "@/components/dashboard/DealManagementPanel";

export const metadata: Metadata = { title: "Assigned Deals" };

export default function AdvisorDealsPage() {
  return (
    <ProtectedRoute allowedRoles={["advisor"]}>
      <DealManagementPanel role="advisor" />
    </ProtectedRoute>
  );
}
