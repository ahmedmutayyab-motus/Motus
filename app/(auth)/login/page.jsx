import Link from "next/link";
import AuthWrapper from "@/components/ui/AuthWrapper";

export default function LoginPage() {
  return (
    <AuthWrapper
      title="Welcome back"
      subtitle="Enter your credentials to access your workspace."
    >
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-muted mb-1" htmlFor="email">Work Email</label>
          <input 
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
            <Link href="/forgot-password" className="text-xs text-brand-primary hover:text-brand-primaryHover">Forgot password?</Link>
          </div>
          <input 
            type="password" 
            id="password" 
            className="w-full bg-obsidian-900 border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-brand-muted" 
            placeholder="••••••••" 
            required 
          />
        </div>
        <button 
          type="button" 
          className="w-full bg-brand-primary text-white py-2.5 rounded-md font-medium hover:bg-brand-primaryHover shadow-lg transition-all"
        >
          Sign in (Phase 1 Stub)
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-brand-muted">
        Don&apos;t have an account? <Link href="/signup" className="text-white hover:underline">Sign up</Link>
      </p>
    </AuthWrapper>
  );
}
