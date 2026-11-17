import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";

export const metadata: Metadata = { title: "Notifications" };

export default function SellerNotificationsPage() {
  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <NotificationsPanel />
    </ProtectedRoute>
  );
}
