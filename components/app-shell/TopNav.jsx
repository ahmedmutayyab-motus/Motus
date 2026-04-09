import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import GlobalSearch from "./GlobalSearch";
import ActivityFeed from "./ActivityFeed";

export default async function TopNav() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const initials = user?.user_metadata?.first_name 
    ? (user.user_metadata.first_name[0] + (user.user_metadata.last_name?.[0] || "")).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || "??";

  return (
    <header className="h-16 border-b border-white/5 bg-brand-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex flex-1">
        <GlobalSearch />
      </div>
      <div className="flex items-center space-x-4">
        <ActivityFeed />
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
