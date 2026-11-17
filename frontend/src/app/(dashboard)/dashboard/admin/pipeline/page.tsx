import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TransactionPipelinePanel from "@/components/dashboard/TransactionPipelinePanel";

export const metadata: Metadata = { title: "Transaction Pipeline" };

export default function AdminPipelinePage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <TransactionPipelinePanel role="admin" mode="all" />
    </ProtectedRoute>
  );
}
