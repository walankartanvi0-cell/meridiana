import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TransactionPipelinePanel from "@/components/dashboard/TransactionPipelinePanel";

export const metadata: Metadata = { title: "Buyer Pipeline" };

export default function AdvisorBuyerPipelinePage() {
  return (
    <ProtectedRoute allowedRoles={["advisor"]}>
      <TransactionPipelinePanel role="advisor" mode="buyer" />
    </ProtectedRoute>
  );
}
