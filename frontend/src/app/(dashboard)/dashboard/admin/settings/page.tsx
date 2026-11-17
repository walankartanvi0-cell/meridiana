import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AccountSettingsPanel from "@/components/dashboard/AccountSettingsPanel";

export const metadata: Metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AccountSettingsPanel />
    </ProtectedRoute>
  );
}
