import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Create an Account" };

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Join Meridiana"
      title="Create your account"
      description="Buyers and sellers can register here. Your workspace will be ready as soon as your account is created."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-gold-600 hover:text-navy-900">
            Sign in
          </Link>
          .
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
