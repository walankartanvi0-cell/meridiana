import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NdaPanel from "@/components/dashboard/NdaPanel";

export const metadata: Metadata = { title: "NDAs" };

export default function AdvisorNdasPage() {
  return (
    <ProtectedRoute allowedRoles={["advisor"]}>
      <NdaPanel role="advisor" />
    </ProtectedRoute>
  );
}
