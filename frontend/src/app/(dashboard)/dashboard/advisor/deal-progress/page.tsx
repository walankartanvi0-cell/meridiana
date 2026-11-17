import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TransactionPipelinePanel from "@/components/dashboard/TransactionPipelinePanel";

export const metadata: Metadata = { title: "Deal Progress" };

export default function AdvisorDealProgressPage() {
  return (
    <ProtectedRoute allowedRoles={["advisor"]}>
      <TransactionPipelinePanel role="advisor" mode="progress" />
    </ProtectedRoute>
  );
}
