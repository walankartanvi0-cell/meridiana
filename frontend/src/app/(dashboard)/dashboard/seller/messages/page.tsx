import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MessagesPanel from "@/components/dashboard/MessagesPanel";

export const metadata: Metadata = { title: "Messages" };

export default function SellerMessagesPage() {
  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <MessagesPanel role="seller" />
    </ProtectedRoute>
  );
}
