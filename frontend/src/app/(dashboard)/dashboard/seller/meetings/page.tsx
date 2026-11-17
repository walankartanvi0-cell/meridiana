import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MeetingsPanel from "@/components/dashboard/MeetingsPanel";

export const metadata: Metadata = { title: "Meetings" };

export default function SellerMeetingsPage() {
  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <MeetingsPanel role="seller" />
    </ProtectedRoute>
  );
}
