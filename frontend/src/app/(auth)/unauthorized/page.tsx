import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Access Restricted" };

export default function UnauthorizedPage() {
  return (
    <AuthShell
      eyebrow="Access restricted"
      title="This area is not available to your role"
      description="Your account is signed in, but it does not have permission to view the requested workspace."
      footer={
        <Link href="/login" className="font-semibold text-gold-600 hover:text-navy-900">
          Switch accounts
        </Link>
      }
    >
      <Link
        href="/dashboard"
        className="inline-flex border border-navy-900/20 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-navy-900 transition-colors hover:border-gold-500 hover:text-gold-600"
      >
        Go to my dashboard
      </Link>
    </AuthShell>
  );
}
