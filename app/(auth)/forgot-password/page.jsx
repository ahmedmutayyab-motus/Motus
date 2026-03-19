import Link from "next/link";
import AuthWrapper from "@/components/ui/AuthWrapper";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <AuthWrapper
      title="Reset password"
      subtitle="We'll send you instructions to reset your password."
    >
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-muted mb-1" htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            className="w-full bg-obsidian-900 border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-brand-muted" 
            placeholder="you@company.com" 
            required 
          />
        </div>
        <button 
          type="button" 
          className="w-full bg-white text-black py-2.5 rounded-md font-medium hover:bg-white/90 shadow-lg transition-all"
        >
          Send Reset Link
        </button>
      </form>
      <div className="mt-8 text-center">
        <Link href="/login" className="inline-flex items-center text-sm text-brand-muted hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to log in
        </Link>
      </div>
    </AuthWrapper>
  );
}
