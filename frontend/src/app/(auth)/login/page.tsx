import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Client Login" };

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to Meridiana"
      description="Access your confidential transaction workspace with the email address linked to your account."
      footer={
        <>
          New to Meridiana?{" "}
          <Link href="/register" className="font-semibold text-gold-600 hover:text-navy-900">
            Create a buyer or seller account
          </Link>
          .
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
