import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BuyerProfilePanel from "@/components/dashboard/BuyerProfilePanel";

export const metadata: Metadata = { title: "Buyer Profile" };

export default function BuyerProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["buyer"]}>
      <BuyerProfilePanel />
    </ProtectedRoute>
  );
}
