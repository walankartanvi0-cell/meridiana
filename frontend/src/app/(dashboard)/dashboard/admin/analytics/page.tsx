import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";

export const metadata: Metadata = { title: "Analytics" };

export default function AdminAnalyticsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AnalyticsPanel />
    </ProtectedRoute>
  );
}
