import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleOverview from "@/components/dashboard/RoleOverview";

export const metadata: Metadata = { title: "Seller Overview" };

export default function SellerOverviewPage() {
  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <RoleOverview role="seller" />
    </ProtectedRoute>
  );
}
