"use client";

import { useState } from "react";
import Link from "next/link";
import AuthWrapper from "@/components/ui/AuthWrapper";
import { signUp } from "@/app/actions/auth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAction(formData) {
    setIsSubmitting(true);
    try {
      await signUp(formData);
    } catch (error) {
      toast.error(error.message || "Something went wrong during sign up.");
      setIsSubmitting(false);
    }
  }

  return (
    <AuthWrapper
      title="Create your account"
      subtitle="Start building momentum today."
    >
      <form action={handleAction} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-1" htmlFor="firstName">First Name</label>
            <input 
              name="firstName"
              type="text" 
              id="firstName" 
              className="w-full bg-obsidian-900 border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-brand-muted" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-1" htmlFor="lastName">Last Name</label>
            <input 
              name="lastName"
              type="text" 
              id="lastName" 
              className="w-full bg-obsidian-900 border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-brand-muted" 
              required 
            />
          </div>
        </div>
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
        <div>
          <label className="block text-sm font-medium text-brand-muted mb-1" htmlFor="password">Password</label>
          <input 
            name="password"
            type="password" 
            id="password" 
            className="w-full bg-obsidian-900 border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-brand-muted" 
            placeholder="Min. 8 characters" 
            required 
          />
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-brand-primary text-white py-2.5 rounded-md font-medium hover:bg-brand-primaryHover shadow-lg transition-all mt-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-brand-muted leading-relaxed">
        By continuing, you agree to our <Link href="#" className="underline hover:text-white">Terms of Service</Link> and <Link href="#" className="underline hover:text-white">Privacy Policy</Link>.
      </p>
      <p className="mt-8 text-center text-sm text-brand-muted">
        Already have an account? <Link href="/login" className="text-white hover:underline">Log in</Link>
      </p>
    </AuthWrapper>
  );
}
