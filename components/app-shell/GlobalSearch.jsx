"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, User, Layers, Mail, ArrowRight } from "lucide-react";
import { getGlobalSearch } from "@/app/actions/search";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const containerRef = useRef(null);
  const pathname = usePathname();

  // Close search on path change
  useEffect(() => {
    setIsOpen(false);
    setQuery("");
  }, [pathname]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getGlobalSearch(query);
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const ICONS = {
    contact: <User className="h-4 w-4 text-brand-amber/80" />,
    sequence: <Layers className="h-4 w-4 text-brand-amber/80" />,
    inbox_thread: <Mail className="h-4 w-4 text-brand-amber/80" />
  };

  return (
    <div className="w-full max-w-md relative" ref={containerRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted pointer-events-none" />
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        placeholder="Search contacts, sequences, threads..." 
        className="w-full bg-obsidian-900 border border-white/10 rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-amber/40 focus:ring-1 focus:ring-brand-amber/40 transition-all placeholder:text-brand-muted"
      />
      {loading && (
        <Loader2 className="h-4 w-4 text-brand-amber animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
      )}

      {/* Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-brand-surface border border-white/10 rounded-md shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 text-center text-sm text-brand-muted">
              No results found for &quot;{query}&quot;.
            </div>
          ) : (
            <div className="py-2">
              <div className="px-3 pb-2 text-xs font-semibold text-brand-muted uppercase tracking-wider">Results</div>
              {results.map((r, i) => (
                <Link key={`${r.type}-${r.id}-${i}`} href={r.url}>
                  <div className="flex items-start gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors group cursor-pointer border-b border-white/5 last:border-0">
                    <div className="mt-0.5 bg-obsidian-900 p-1.5 rounded-md border border-white/5">
                      {ICONS[r.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-light truncate group-hover:text-brand-amber transition-colors">
                        {r.title}
                      </p>
                      <p className="text-xs text-brand-muted truncate">
                        {r.type.toUpperCase().replace("_", " ")} &bull; {r.subtitle}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
