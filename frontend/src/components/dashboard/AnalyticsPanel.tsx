"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { AnalyticsData } from "@/types/dashboard";
import {
  EmptyState,
  Notice,
  PageIntro,
  Panel,
  secondaryButtonClass,
  StatCard,
} from "./DashboardUI";

const quickLinks = [
  { label: "Manage users", href: "/dashboard/admin/users" },
  { label: "Manage buyers", href: "/dashboard/admin/buyers" },
  { label: "Manage sellers", href: "/dashboard/admin/sellers" },
  { label: "Notifications", href: "/dashboard/admin/notifications" },
];

export default function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await apiFetch<{ analytics: AnalyticsData }>("/admin/analytics");
        if (active) setAnalytics(response.analytics);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load analytics.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="grid gap-8">
      <PageIntro
        title="Analytics"
        description="A live snapshot of platform activity. Every number comes directly from the API and MongoDB."
      />

      {error && <Notice tone="error">{error}</Notice>}

      <Panel title="Platform snapshot" description="Current records across the Meridiana portal">
        {loading ? (
          <p className="text-sm text-charcoal-500">Loading analytics…</p>
        ) : !analytics ? (
          <EmptyState>Analytics are not available right now.</EmptyState>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total users" value={analytics.totalUsers} />
            <StatCard label="Buyer profiles" value={analytics.buyerProfiles} />
            <StatCard label="Seller profiles" value={analytics.sellerProfiles} />
            <StatCard label="Website inquiries" value={analytics.inquiries} />
          </div>
        )}
      </Panel>

      {analytics && (
        <Panel title="Accounts by role" description="How the current user base is distributed">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Administrators" value={analytics.byRole.admin} />
            <StatCard label="Advisors" value={analytics.byRole.advisor} />
            <StatCard label="Buyers" value={analytics.byRole.buyer} />
            <StatCard label="Sellers" value={analytics.byRole.seller} />
          </div>
        </Panel>
      )}

      <Panel title="Quick navigation" description="Go straight to the records behind these numbers">
        <div className="flex flex-wrap gap-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className={secondaryButtonClass}>
              {link.label}
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
