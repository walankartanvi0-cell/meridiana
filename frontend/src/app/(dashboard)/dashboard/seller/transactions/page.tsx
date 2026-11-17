import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SellerTransactionsPanel from "@/components/dashboard/SellerTransactionsPanel";

export const metadata: Metadata = { title: "Transaction Progress" };

export default function SellerTransactionsPage() {
  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <SellerTransactionsPanel mode="progress" />
    </ProtectedRoute>
  );
}
