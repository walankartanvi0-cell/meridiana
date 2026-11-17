import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SellerTransactionsPanel from "@/components/dashboard/SellerTransactionsPanel";

export const metadata: Metadata = { title: "Buyer Interest" };

export default function SellerBuyerInterestPage() {
  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <SellerTransactionsPanel mode="interest" />
    </ProtectedRoute>
  );
}
