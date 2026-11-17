import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NdaPanel from "@/components/dashboard/NdaPanel";

export const metadata: Metadata = { title: "NDA Management" };

export default function BuyerNdasPage() {
  return (
    <ProtectedRoute allowedRoles={["buyer"]}>
      <NdaPanel role="buyer" />
    </ProtectedRoute>
  );
}
