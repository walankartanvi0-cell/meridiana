import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleOverview from "@/components/dashboard/RoleOverview";

export const metadata: Metadata = { title: "Buyer Overview" };

export default function BuyerOverviewPage() {
  return (
    <ProtectedRoute allowedRoles={["buyer"]}>
      <RoleOverview role="buyer" />
    </ProtectedRoute>
  );
}
