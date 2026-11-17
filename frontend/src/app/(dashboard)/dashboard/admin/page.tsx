import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OverviewPlaceholder from "@/components/dashboard/OverviewPlaceholder";

export const metadata: Metadata = { title: "Administrator Overview" };

export default function AdminOverviewPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <OverviewPlaceholder
        role="admin"
        title="Administrator overview"
        intro="Control platform access and keep every transaction moving. This overview confirms your administrator session and role permissions are active."
        sections={[
          "Manage Users",
          "Manage Buyers",
          "Manage Sellers",
          "Manage Deals",
          "Transaction Pipeline",
          "Documents",
          "Meetings",
          "Analytics",
          "Notifications",
          "Settings",
        ]}
      />
    </ProtectedRoute>
  );
}
