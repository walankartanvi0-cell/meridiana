import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OverviewPlaceholder from "@/components/dashboard/OverviewPlaceholder";

export const metadata: Metadata = { title: "Buyer Overview" };

export default function BuyerOverviewPage() {
  return (
    <ProtectedRoute allowedRoles={["buyer"]}>
      <OverviewPlaceholder
        role="buyer"
        title="Buyer overview"
        intro="Review opportunities, manage confidentiality agreements and follow each transaction in one secure place."
        sections={[
          "Available Opportunities",
          "Saved Opportunities",
          "Deal Details",
          "NDA Management",
          "Documents",
          "Meetings",
          "Messages",
          "Profile",
        ]}
      />
    </ProtectedRoute>
  );
}
