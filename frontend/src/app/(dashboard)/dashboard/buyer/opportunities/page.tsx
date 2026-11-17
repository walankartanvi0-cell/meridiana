import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BuyerOpportunitiesPanel from "@/components/dashboard/BuyerOpportunitiesPanel";

export const metadata: Metadata = { title: "Available Opportunities" };

export default function BuyerOpportunitiesPage() {
  return (
    <ProtectedRoute allowedRoles={["buyer"]}>
      <BuyerOpportunitiesPanel mode="available" />
    </ProtectedRoute>
  );
}
