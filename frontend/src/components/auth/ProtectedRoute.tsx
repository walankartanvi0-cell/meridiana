"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import type { UserRole } from "@/types/auth";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: readonly UserRole[];
};

/** Client-side gate for dashboard routes. The API also checks every request. */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const allowedKey = allowedRoles?.join(",") ?? "";

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (allowedKey && !allowedKey.split(",").includes(user.role)) {
      router.replace("/unauthorized");
    }
  }, [allowedKey, loading, router, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950 text-ivory-200">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">
          Checking your session…
        </p>
      </div>
    );
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
