import Link from "next/link";
import AuthWrapper from "@/components/ui/AuthWrapper";
import { MailCheck } from "lucide-react";

export default function CheckEmailPage() {
  return (
    <AuthWrapper
      title="Check your email"
      subtitle="We sent a confirmation link to verify your account."
    >
      <div className="flex flex-col items-center text-center py-4">
        <div className="h-16 w-16 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-5">
          <MailCheck className="h-8 w-8 text-brand-primary" />
        </div>
        <p className="text-sm text-brand-muted max-w-xs leading-relaxed">
          Click the link in your email to activate your account. Once confirmed, you can sign in.
        </p>
        <Link
          href="/login"
          className="mt-8 text-sm text-brand-primary hover:underline"
        >
          Back to Sign In
        </Link>
      </div>
    </AuthWrapper>
  );
}
