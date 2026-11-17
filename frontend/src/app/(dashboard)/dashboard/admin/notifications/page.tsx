import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";

export const metadata: Metadata = { title: "Notifications" };

export default function AdminNotificationsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <NotificationsPanel />
    </ProtectedRoute>
  );
}
