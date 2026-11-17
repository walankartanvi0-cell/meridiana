import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BuyerOpportunitiesPanel from "@/components/dashboard/BuyerOpportunitiesPanel";

export const metadata: Metadata = { title: "Saved Opportunities" };

export default function BuyerSavedPage() {
  return (
    <ProtectedRoute allowedRoles={["buyer"]}>
      <BuyerOpportunitiesPanel mode="saved" />
    </ProtectedRoute>
  );
}
