import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OverviewPlaceholder from "@/components/dashboard/OverviewPlaceholder";

export const metadata: Metadata = { title: "Advisor Overview" };

export default function AdvisorOverviewPage() {
  return (
    <ProtectedRoute allowedRoles={["advisor"]}>
      <OverviewPlaceholder
        role="advisor"
        title="Advisor overview"
        intro="Your client work, deal timelines and communication threads will live here. This overview confirms your advisor session and permissions are active."
        sections={[
          "Assigned Deals",
          "Buyer Pipeline",
          "Seller Pipeline",
          "Deal Progress",
          "Documents",
          "Meetings",
          "Tasks",
          "Messages",
          "Notifications",
        ]}
      />
    </ProtectedRoute>
  );
}
