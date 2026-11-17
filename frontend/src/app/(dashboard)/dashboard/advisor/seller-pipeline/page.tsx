import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TransactionPipelinePanel from "@/components/dashboard/TransactionPipelinePanel";

export const metadata: Metadata = { title: "Seller Pipeline" };

export default function AdvisorSellerPipelinePage() {
  return (
    <ProtectedRoute allowedRoles={["advisor"]}>
      <TransactionPipelinePanel role="advisor" mode="seller" />
    </ProtectedRoute>
  );
}
