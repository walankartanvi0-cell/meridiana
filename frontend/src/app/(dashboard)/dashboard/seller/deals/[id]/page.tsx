import type { Metadata } from "next";
import { Suspense } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DealDetailPanel from "@/components/dashboard/DealDetailPanel";

export const metadata: Metadata = { title: "Deal Details" };

function DetailFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal-500">
      Loading deal details…
    </div>
  );
}

export default function SellerDealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<DetailFallback />}>
      {params.then(
        ({ id }) => (
          <ProtectedRoute allowedRoles={["seller"]}>
            <DealDetailPanel id={id} role="seller" />
          </ProtectedRoute>
        ),
      )}
    </Suspense>
  );
}
