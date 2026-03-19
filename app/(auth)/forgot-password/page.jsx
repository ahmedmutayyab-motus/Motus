"use client";

import { useState } from "react";
import Link from "next/link";
import AuthWrapper from "@/components/ui/AuthWrapper";
import { ArrowLeft, Loader2 } from "lucide-react";
import { resetPassword } from "@/app/actions/auth";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleAction(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    
    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setIsSent(true);
      toast.success("Reset instructions sent to your email.");
    } catch (error) {
      toast.error(error.message || "Failed to send reset link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthWrapper
      title="Reset password"
      subtitle={isSent ? "Check your inbox for further instructions." : "We'll send you instructions to reset your password."}
    >
      {!isSent ? (
        <form onSubmit={handleAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-1" htmlFor="email">Work Email</label>
            <input 
              name="email"
              type="email" 
              id="email" 
              className="w-full bg-obsidian-900 border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-brand-muted" 
              placeholder="you@company.com" 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-white text-black py-2.5 rounded-md font-medium hover:bg-white/90 shadow-lg transition-all flex items-center justify-center disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
      ) : (
        <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-md p-4 text-sm text-brand-primary mb-4 text-center">
          Email sent! Please follow the link in the message to reset your password.
        </div>
      )}
      <div className="mt-8 text-center">
        <Link href="/login" className="inline-flex items-center text-sm text-brand-muted hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to log in
        </Link>
      </div>
    </AuthWrapper>
  );
}
