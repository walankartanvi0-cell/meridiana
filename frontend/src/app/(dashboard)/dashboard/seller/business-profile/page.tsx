import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SellerBusinessProfilePanel from "@/components/dashboard/SellerBusinessProfilePanel";

export const metadata: Metadata = { title: "Business Profile" };

export default function SellerBusinessProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <SellerBusinessProfilePanel />
    </ProtectedRoute>
  );
}
