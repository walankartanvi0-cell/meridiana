import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleOverview from "@/components/dashboard/RoleOverview";

export const metadata: Metadata = { title: "Advisor Overview" };

export default function AdvisorOverviewPage() {
  return (
    <ProtectedRoute allowedRoles={["advisor"]}>
      <RoleOverview role="advisor" />
    </ProtectedRoute>
  );
}
