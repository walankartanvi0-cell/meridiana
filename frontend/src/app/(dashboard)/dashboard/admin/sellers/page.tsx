import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminSellersPanel from "@/components/dashboard/AdminSellersPanel";

export const metadata: Metadata = { title: "Manage Sellers" };

export default function AdminSellersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminSellersPanel />
    </ProtectedRoute>
  );
}
