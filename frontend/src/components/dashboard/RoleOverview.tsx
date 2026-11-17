"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { UserRole } from "@/types/auth";
import type { DealPipeline } from "@/types/deals";
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
  pipeline: DealPipeline | null;
  unread: number | null;
  profileComplete: boolean | null;
  opportunities: number | null;
  saved: number | null;
  transactions: number | null;
};

const initialData: OverviewData = {
  analytics: null,
  pipeline: null,
  unread: null,
  profileComplete: null,
  opportunities: null,
  saved: null,
  transactions: null,
};

const copy: Record<UserRole, { title: string; description: string }> = {
  admin: {
    title: "Administrator overview",
    description: "Manage people, review transactions and keep every part of the portal running smoothly.",
  },
  advisor: {
    title: "Advisor overview",
    description: "Your secure base for client updates, assigned deals and live pipeline progress.",
  },
  buyer: {
    title: "Buyer overview",
    description: "Keep your acquisition criteria current and track opportunities matched to you.",
  },
  seller: {
    title: "Seller overview",
    description: "Keep your business profile current and follow every stage of your sale process.",
  },
};

const quickLinks: Record<UserRole, { label: string; href: string }[]> = {
  admin: [
    { label: "Manage users", href: "/dashboard/admin/users" },
    { label: "Manage buyers", href: "/dashboard/admin/buyers" },
    { label: "Manage sellers", href: "/dashboard/admin/sellers" },
    { label: "Manage deals", href: "/dashboard/admin/deals" },
    { label: "Transaction pipeline", href: "/dashboard/admin/pipeline" },
    { label: "Analytics", href: "/dashboard/admin/analytics" },
    { label: "Notifications", href: "/dashboard/admin/notifications" },
  ],
  advisor: [
    { label: "Assigned deals", href: "/dashboard/advisor/deals" },
    { label: "Buyer pipeline", href: "/dashboard/advisor/buyer-pipeline" },
    { label: "Seller pipeline", href: "/dashboard/advisor/seller-pipeline" },
    { label: "Deal progress", href: "/dashboard/advisor/deal-progress" },
    { label: "Notifications", href: "/dashboard/advisor/notifications" },
    { label: "Account settings", href: "/dashboard/advisor/settings" },
  ],
  buyer: [
    { label: "Buyer profile", href: "/dashboard/buyer/profile" },
    { label: "Available opportunities", href: "/dashboard/buyer/opportunities" },
    { label: "Saved opportunities", href: "/dashboard/buyer/saved" },
    { label: "Deal details", href: "/dashboard/buyer/deals" },
    { label: "Notifications", href: "/dashboard/buyer/notifications" },
    { label: "Account settings", href: "/dashboard/buyer/settings" },
  ],
  seller: [
    { label: "Business profile", href: "/dashboard/seller/business-profile" },
    { label: "Transaction progress", href: "/dashboard/seller/transactions" },
    { label: "Buyer interest", href: "/dashboard/seller/buyer-interest" },
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
          const [analyticsResponse, pipelineResponse] = await Promise.all([
            apiFetch<{ analytics: AnalyticsData }>("/admin/analytics"),
            apiFetch<{ pipeline: DealPipeline }>("/deals/pipeline"),
          ]);
          if (active) {
            setData({
              ...initialData,
              analytics: analyticsResponse.analytics,
              pipeline: pipelineResponse.pipeline,
            });
          }
          return;
        }

        if (role === "advisor") {
          const [notificationResponse, pipelineResponse] = await Promise.all([
            apiFetch<{ unread: number }>("/notifications"),
            apiFetch<{ pipeline: DealPipeline }>("/deals/pipeline"),
          ]);
          if (active) {
            setData({
              ...initialData,
              unread: notificationResponse.unread,
              pipeline: pipelineResponse.pipeline,
            });
          }
          return;
        }

        if (role === "buyer") {
          const [notificationResponse, profileResponse, availableResponse, savedResponse] =
            await Promise.all([
              apiFetch<{ unread: number }>("/notifications"),
              apiFetch<{ profile: BuyerProfile | null }>("/account/buyer"),
              apiFetch<{ deals: unknown[] }>("/deals/available"),
              apiFetch<{ deals: unknown[] }>("/deals/saved"),
            ]);
          if (active) {
            setData({
              ...initialData,
              unread: notificationResponse.unread,
              profileComplete: Boolean(profileResponse.profile?.companyName),
              opportunities: availableResponse.deals.length,
              saved: savedResponse.deals.length,
            });
          }
          return;
        }

        const [notificationResponse, profileResponse, mineResponse] = await Promise.all([
          apiFetch<{ unread: number }>("/notifications"),
          apiFetch<{ profile: SellerProfile | null }>("/account/seller"),
          apiFetch<{ deals: unknown[] }>("/deals/mine"),
        ]);
        if (active) {
          setData({
            ...initialData,
            unread: notificationResponse.unread,
            profileComplete: Boolean(profileResponse.profile?.companyName),
            transactions: mineResponse.deals.length,
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

  const activeDeals = data.pipeline
    ? data.pipeline.totalDeals - data.pipeline.byStage.closed - data.pipeline.byStage.passed
    : 0;

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
                <StatCard label="Active deals" value={activeDeals} />
              </>
            )}

            {role === "advisor" && (
              <>
                <StatCard label="Assigned deals" value={data.pipeline?.totalDeals ?? 0} />
                <StatCard label="Active mandates" value={activeDeals} />
                <StatCard label="Unread notifications" value={data.unread ?? 0} />
                <StatCard label="Workspace" value="Active" />
              </>
            )}

            {role === "buyer" && (
              <>
                <StatCard
                  label="Profile status"
                  value={data.profileComplete ? "Complete" : "Not started"}
                  detail={data.profileComplete ? "Your criteria are saved." : "Add your criteria."}
                />
                <StatCard label="Opportunities" value={data.opportunities ?? 0} />
                <StatCard label="Saved" value={data.saved ?? 0} />
                <StatCard label="Unread notifications" value={data.unread ?? 0} />
              </>
            )}

            {role === "seller" && (
              <>
                <StatCard
                  label="Profile status"
                  value={data.profileComplete ? "Complete" : "Not started"}
                  detail={data.profileComplete ? "Your details are saved." : "Add your details."}
                />
                <StatCard label="Transactions" value={data.transactions ?? 0} />
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
