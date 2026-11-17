import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AccountSettingsPanel from "@/components/dashboard/AccountSettingsPanel";

export const metadata: Metadata = { title: "Profile" };

export default function SellerProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <AccountSettingsPanel />
    </ProtectedRoute>
  );
}
