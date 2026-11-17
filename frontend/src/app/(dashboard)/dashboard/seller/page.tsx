import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OverviewPlaceholder from "@/components/dashboard/OverviewPlaceholder";

export const metadata: Metadata = { title: "Seller Overview" };

export default function SellerOverviewPage() {
  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <OverviewPlaceholder
        role="seller"
        title="Seller overview"
        intro="A private home for your business profile, buyer interest and transaction milestones as your sale process develops."
        sections={[
          "Business Profile",
          "Transaction Progress",
          "Buyer Interest",
          "Documents",
          "Meetings",
          "Messages",
          "Profile",
        ]}
      />
    </ProtectedRoute>
  );
}
