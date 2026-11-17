import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MeetingsPanel from "@/components/dashboard/MeetingsPanel";

export const metadata: Metadata = { title: "Meetings" };

export default function AdvisorMeetingsPage() {
  return (
    <ProtectedRoute allowedRoles={["advisor"]}>
      <MeetingsPanel role="advisor" />
    </ProtectedRoute>
  );
}
