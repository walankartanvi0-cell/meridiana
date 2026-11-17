import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MessagesPanel from "@/components/dashboard/MessagesPanel";

export const metadata: Metadata = { title: "Messages" };

export default function BuyerMessagesPage() {
  return (
    <ProtectedRoute allowedRoles={["buyer"]}>
      <MessagesPanel role="buyer" />
    </ProtectedRoute>
  );
}
