"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLE_HOME } from "@/types/auth";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? ROLE_HOME[user.role] : "/login");
  }, [loading, router, user]);

  return (
    <div className="border border-navy-900/10 bg-white p-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-600">
        Meridiana portal
      </p>
      <h1 className="mt-4 font-display text-3xl text-navy-900">Opening your workspace…</h1>
    </div>
  );
}
