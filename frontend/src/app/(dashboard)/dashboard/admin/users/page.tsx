import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminUsersPanel from "@/components/dashboard/AdminUsersPanel";

export const metadata: Metadata = { title: "Manage Users" };

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminUsersPanel />
    </ProtectedRoute>
  );
}
