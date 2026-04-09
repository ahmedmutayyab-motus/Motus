import { Bell, Search, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

export default async function TopNav() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const initials = user?.user_metadata?.first_name 
    ? (user.user_metadata.first_name[0] + (user.user_metadata.last_name?.[0] || "")).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || "??";

  return (
    <header className="h-16 border-b border-white/5 bg-brand-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex flex-1">
        <div className="w-full max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted pointer-events-none" />
          <input 
            type="text" 
            disabled
            title="Global Search (Phase 6)"
            placeholder="Search (Phase 6)..." 
            className="w-full bg-obsidian-900 border border-white/10 rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-brand-muted opacity-50 cursor-not-allowed"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button disabled title="Notifications (Phase 6)" className="text-brand-muted opacity-50 cursor-not-allowed transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-3 pl-4 border-l border-white/5">
          <div className="flex flex-col items-end hidden sm:flex">
             <span className="text-xs font-medium text-white">{user?.user_metadata?.full_name || user?.email}</span>
             <span className="text-[10px] text-brand-muted">Admin</span>
          </div>
          <div className="group relative">
            <div className="h-8 w-8 rounded-full bg-brand-primary/20 border border-brand-primary flex items-center justify-center text-sm font-medium text-brand-primary transition-all">
              {initials}
            </div>
            <div className="absolute right-0 top-full mt-2 w-48 bg-obsidian-900 border border-white/10 rounded-md shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
               <div className="p-3 border-b border-white/5 bg-black/20">
                  <p className="text-xs text-brand-muted truncate">{user?.email}</p>
               </div>
               <form action={signOut}>
                 <button type="submit" className="w-full flex items-center px-4 py-2.5 text-sm text-brand-muted hover:text-red-400 hover:bg-red-400/5 transition-colors">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                 </button>
               </form>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
