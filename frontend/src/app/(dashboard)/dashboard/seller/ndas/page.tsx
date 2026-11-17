import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NdaPanel from "@/components/dashboard/NdaPanel";

export const metadata: Metadata = { title: "NDAs" };

export default function SellerNdasPage() {
  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <NdaPanel role="seller" />
    </ProtectedRoute>
  );
}
