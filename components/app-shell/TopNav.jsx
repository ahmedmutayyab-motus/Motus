import { Bell, Search } from "lucide-react";

export default function TopNav() {
  return (
    <header className="h-16 border-b border-white/5 bg-brand-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex flex-1">
        <div className="w-full max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search contacts, sequences..." 
            className="w-full bg-obsidian-900 border border-white/10 rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-brand-muted"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-brand-muted hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <div className="h-8 w-8 rounded-full bg-brand-primary/20 border border-brand-primary flex items-center justify-center text-sm font-medium text-brand-primary cursor-pointer hover:bg-brand-primary hover:text-white transition-all">
          SJ
        </div>
      </div>
    </header>
  );
}
