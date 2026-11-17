import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BuyerOpportunitiesPanel from "@/components/dashboard/BuyerOpportunitiesPanel";

export const metadata: Metadata = { title: "Deal Details" };

export default function BuyerDealsPage() {
  return (
    <ProtectedRoute allowedRoles={["buyer"]}>
      <BuyerOpportunitiesPanel mode="all" />
    </ProtectedRoute>
  );
}
