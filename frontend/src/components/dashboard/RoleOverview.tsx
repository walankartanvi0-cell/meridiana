"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { UserRole } from "@/types/auth";
import type { AnalyticsData, BuyerProfile, SellerProfile } from "@/types/dashboard";
import {
  Notice,
  PageIntro,
  Panel,
  secondaryButtonClass,
  StatCard,
} from "./DashboardUI";

type OverviewData = {
  analytics: AnalyticsData | null;
  unread: number | null;
  profileComplete: boolean | null;
};

const initialData: OverviewData = {
  analytics: null,
  unread: null,
  profileComplete: null,
};

const copy: Record<UserRole, { title: string; description: string }> = {
  admin: {
    title: "Administrator overview",
    description: "Manage people, review platform activity and keep every part of the portal running smoothly.",
  },
  advisor: {
    title: "Advisor overview",
    description: "Your secure base for client updates. Transaction tools will appear here as they are released.",
  },
  buyer: {
    title: "Buyer overview",
    description: "Keep your acquisition criteria current and stay on top of important account updates.",
  },
  seller: {
    title: "Seller overview",
    description: "Keep your business profile current and follow every update from your advisory team.",
  },
};

const quickLinks: Record<UserRole, { label: string; href: string }[]> = {
  admin: [
    { label: "Manage users", href: "/dashboard/admin/users" },
    { label: "Manage buyers", href: "/dashboard/admin/buyers" },
    { label: "Manage sellers", href: "/dashboard/admin/sellers" },
    { label: "Analytics", href: "/dashboard/admin/analytics" },
    { label: "Notifications", href: "/dashboard/admin/notifications" },
  ],
  advisor: [
    { label: "Notifications", href: "/dashboard/advisor/notifications" },
    { label: "Account settings", href: "/dashboard/advisor/settings" },
  ],
  buyer: [
    { label: "Buyer profile", href: "/dashboard/buyer/profile" },
    { label: "Notifications", href: "/dashboard/buyer/notifications" },
    { label: "Account settings", href: "/dashboard/buyer/settings" },
  ],
  seller: [
    { label: "Business profile", href: "/dashboard/seller/business-profile" },
    { label: "Notifications", href: "/dashboard/seller/notifications" },
    { label: "Profile", href: "/dashboard/seller/profile" },
  ],
};

export default function RoleOverview({ role }: { role: UserRole }) {
  const [data, setData] = useState<OverviewData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        if (role === "admin") {
          const response = await apiFetch<{ analytics: AnalyticsData }>("/admin/analytics");
          if (active) setData({ analytics: response.analytics, unread: null, profileComplete: null });
          return;
        }

        if (role === "advisor") {
          const response = await apiFetch<{ unread: number }>("/notifications");
          if (active) setData({ analytics: null, unread: response.unread, profileComplete: null });
          return;
        }

        const [notificationResponse, profileResponse] = await Promise.all([
          apiFetch<{ unread: number }>("/notifications"),
          role === "buyer"
            ? apiFetch<{ profile: BuyerProfile | null }>("/account/buyer")
            : apiFetch<{ profile: SellerProfile | null }>("/account/seller"),
        ]);

        if (active) {
          setData({
            analytics: null,
            unread: notificationResponse.unread,
            profileComplete: Boolean(profileResponse.profile?.companyName),
          });
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load your overview.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [role]);

  return (
    <div className="grid gap-8">
      <PageIntro title={copy[role].title} description={copy[role].description} />

      {error && <Notice tone="error">{error}</Notice>}

      <Panel title="At a glance" description="Live information from your workspace">
        {loading ? (
          <p className="text-sm text-charcoal-500">Loading your overview…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {role === "admin" && data.analytics && (
              <>
                <StatCard label="Total users" value={data.analytics.totalUsers} />
                <StatCard label="Buyers" value={data.analytics.byRole.buyer} />
                <StatCard label="Sellers" value={data.analytics.byRole.seller} />
                <StatCard label="Inquiries" value={data.analytics.inquiries} />
              </>
            )}

            {role === "advisor" && (
              <>
                <StatCard label="Unread notifications" value={data.unread ?? 0} />
                <StatCard label="Workspace" value="Active" detail="Your session and permissions are confirmed." />
              </>
            )}

            {(role === "buyer" || role === "seller") && (
              <>
                <StatCard
                  label="Profile status"
                  value={data.profileComplete ? "Complete" : "Not started"}
                  detail={data.profileComplete ? "Your details are saved." : "Add your details to get started."}
                />
                <StatCard label="Unread notifications" value={data.unread ?? 0} />
              </>
            )}
          </div>
        )}
      </Panel>

      <Panel title="Quick actions" description="Go directly to the tools available for your role">
        <div className="flex flex-wrap gap-3">
          {quickLinks[role].map((link) => (
            <Link key={link.href} href={link.href} className={secondaryButtonClass}>
              {link.label}
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
