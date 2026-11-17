import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";

export const metadata: Metadata = { title: "Notifications" };

export default function AdvisorNotificationsPage() {
  return (
    <ProtectedRoute allowedRoles={["advisor"]}>
      <NotificationsPanel />
    </ProtectedRoute>
  );
}
