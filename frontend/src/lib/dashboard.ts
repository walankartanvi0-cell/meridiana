import type { UserRole } from "@/types/auth";

type DashboardSection = {
  label: string;
  href?: string;
  badge?: string;
};

/**
 * Sections with an href are live now. Sections with a badge are visible in the
 * navigation but clearly marked for the next build stage, so there are no dead links.
 */
export const DASHBOARD_SECTIONS = {
  admin: [
    { label: "Overview", href: "/dashboard/admin" },
    { label: "Manage Users", href: "/dashboard/admin/users" },
    { label: "Manage Buyers", href: "/dashboard/admin/buyers" },
    { label: "Manage Sellers", href: "/dashboard/admin/sellers" },
    { label: "Manage Deals", badge: "Stage 6" },
    { label: "Transaction Pipeline", badge: "Stage 6" },
    { label: "Documents", badge: "Stage 7" },
    { label: "Meetings", badge: "Stage 7" },
    { label: "Analytics", href: "/dashboard/admin/analytics" },
    { label: "Notifications", href: "/dashboard/admin/notifications" },
    { label: "Settings", href: "/dashboard/admin/settings" },
  ],
  advisor: [
    { label: "Overview", href: "/dashboard/advisor" },
    { label: "Assigned Deals", badge: "Stage 6" },
    { label: "Buyer Pipeline", badge: "Stage 6" },
    { label: "Seller Pipeline", badge: "Stage 6" },
    { label: "Deal Progress", badge: "Stage 6" },
    { label: "Documents", badge: "Stage 7" },
    { label: "Meetings", badge: "Stage 7" },
    { label: "Tasks", badge: "Stage 7" },
    { label: "Messages", badge: "Stage 7" },
    { label: "Notifications", href: "/dashboard/advisor/notifications" },
    { label: "Account Settings", href: "/dashboard/advisor/settings" },
  ],
  buyer: [
    { label: "Overview", href: "/dashboard/buyer" },
    { label: "Available Opportunities", badge: "Stage 6" },
    { label: "Saved Opportunities", badge: "Stage 6" },
    { label: "Deal Details", badge: "Stage 6" },
    { label: "NDA Management", badge: "Stage 7" },
    { label: "Documents", badge: "Stage 7" },
    { label: "Meetings", badge: "Stage 7" },
    { label: "Messages", badge: "Stage 7" },
    { label: "Notifications", href: "/dashboard/buyer/notifications" },
    { label: "Profile", href: "/dashboard/buyer/profile" },
    { label: "Account Settings", href: "/dashboard/buyer/settings" },
  ],
  seller: [
    { label: "Overview", href: "/dashboard/seller" },
    { label: "Business Profile", href: "/dashboard/seller/business-profile" },
    { label: "Transaction Progress", badge: "Stage 6" },
    { label: "Buyer Interest", badge: "Stage 6" },
    { label: "Documents", badge: "Stage 7" },
    { label: "Meetings", badge: "Stage 7" },
    { label: "Messages", badge: "Stage 7" },
    { label: "Notifications", href: "/dashboard/seller/notifications" },
    { label: "Profile", href: "/dashboard/seller/profile" },
  ],
} satisfies Record<UserRole, readonly DashboardSection[]>;
