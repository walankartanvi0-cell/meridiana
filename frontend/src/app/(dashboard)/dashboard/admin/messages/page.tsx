import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MessagesPanel from "@/components/dashboard/MessagesPanel";

export const metadata: Metadata = { title: "Messages" };

export default function AdminMessagesPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <MessagesPanel role="admin" />
    </ProtectedRoute>
  );
}
