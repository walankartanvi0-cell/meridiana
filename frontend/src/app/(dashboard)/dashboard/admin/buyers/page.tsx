import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminBuyersPanel from "@/components/dashboard/AdminBuyersPanel";

export const metadata: Metadata = { title: "Manage Buyers" };

export default function AdminBuyersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminBuyersPanel />
    </ProtectedRoute>
  );
}
