"use client";

import { useState } from "react";
import Link from "next/link";
import AuthWrapper from "@/components/ui/AuthWrapper";
import { signIn } from "@/app/actions/auth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAction(formData) {
    setIsSubmitting(true);
    try {
      await signIn(formData);
    } catch (error) {
      toast.error(error.message || "Invalid credentials.");
      setIsSubmitting(false);
    }
  }

  return (
    <AuthWrapper
      title="Welcome back"
      subtitle="Enter your credentials to access your workspace."
    >
      <form action={handleAction} className="space-y-4">
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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-brand-muted" htmlFor="password">Password</label>
            <Link href="/forgot-password" size="sm" className="text-xs text-brand-primary hover:text-brand-primaryHover">Forgot password?</Link>
          </div>
          <input 
            name="password"
            type="password" 
            id="password" 
            className="w-full bg-obsidian-900 border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-brand-muted" 
            placeholder="••••••••" 
            required 
          />
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-brand-primary text-white py-2.5 rounded-md font-medium hover:bg-brand-primaryHover shadow-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-brand-muted">
        Don&apos;t have an account? <Link href="/signup" className="text-white hover:underline">Sign up</Link>
      </p>
    </AuthWrapper>
  );
}
