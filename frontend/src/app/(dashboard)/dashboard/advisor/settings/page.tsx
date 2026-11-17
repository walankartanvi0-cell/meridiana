import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AccountSettingsPanel from "@/components/dashboard/AccountSettingsPanel";

export const metadata: Metadata = { title: "Account Settings" };

export default function AdvisorSettingsPage() {
  return (
    <ProtectedRoute allowedRoles={["advisor"]}>
      <AccountSettingsPanel />
    </ProtectedRoute>
  );
}
