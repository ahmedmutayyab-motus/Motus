"use client";

import { useEffect, useState } from "react";
import { Inbox, Filter, Search, Loader2, ArrowRight, CornerDownRight, PlayCircle, Settings, Mail, PlusCircle, AlertCircle } from "lucide-react";
import { getThreads, seedSampleInbox } from "@/app/actions/inbox";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function InboxPage() {
  const router = useRouter();
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");

  async function fetchThreads() {
    setIsLoading(true);
    try {
      const data = await getThreads(search, stateFilter);
      setThreads(data);
    } catch (e) {
      toast.error(e.message || "Failed to load inbox threads.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, stateFilter]);

  async function handleSeed() {
    setIsSeeding(true);
    try {
      await seedSampleInbox();
      toast.success("Sample thread created.");
      fetchThreads();
    } catch (e) {
      toast.error("Failed to seed thread. " + e.message);
    } finally {
      setIsSeeding(false);
    }
  }

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto">
      
      {/* Informational Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Inbox Workspace</h1>
          <p className="text-sm text-brand-muted">Manage conversations, update thread states, and draft AI replies.</p>
        </div>
      </div>

      {/* Honest Provider Warning */}
      <div className="glass-panel p-4 rounded-xl flex items-start border border-amber-500/20 bg-amber-500/5 relative overflow-hidden">
         <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
         <div>
            <h3 className="text-sm font-semibold text-amber-500 mb-1">Live Mailbox Sync required (Phase 5 / 6)</h3>
            <p className="text-xs text-brand-muted/80 leading-relaxed max-w-2xl">
               This workspace structural UI is fully operational. Live IMAP/SMTP ingestion and automatic outbound sending requires a provider (like Nylas or SendGrid) which is scheduled for future deployment. Use the &quot;Seed Provider Simulation&quot; button below to test internal structure.
            </p>
         </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-2 rounded-xl flex flex-col sm:flex-row items-center justify-between border border-white/5 space-y-3 sm:space-y-0 sm:space-x-3 bg-black/40">
        <div className="flex items-center space-x-3 w-full sm:w-auto px-2">
          <Filter className="h-4 w-4 text-brand-muted" />
          <select 
             value={stateFilter}
             onChange={(e) => setStateFilter(e.target.value)}
             className="bg-transparent text-sm text-white focus:outline-none focus:ring-0 border-none appearance-none"
          >
             <option value="all" className="bg-obsidian-900 text-white">All Threads</option>
             <option value="open" className="bg-obsidian-900 text-white">Open</option>
             <option value="interested" className="bg-obsidian-900 text-white">Interested</option>
             <option value="follow_up" className="bg-obsidian-900 text-white">Follow Up</option>
             <option value="closed" className="bg-obsidian-900 text-white">Closed</option>
             <option value="archived" className="bg-obsidian-900 text-white">Archived</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
           <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subjects..."
              className="w-full bg-obsidian-900 border border-white/10 rounded-md py-1.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-brand-primary"
           />
        </div>
      </div>

      {/* Inbox List Area */}
      <div className="glass-panel rounded-xl flex flex-col flex-1 overflow-hidden border border-white/5">
        <div className="flex-1 overflow-auto">
          {isLoading ? (
             <div className="h-full flex flex-col items-center justify-center py-20 text-brand-muted">
                <Loader2 className="h-6 w-6 animate-spin mb-4 text-brand-primary" />
                <p className="text-sm">Retrieving workspace threads...</p>
             </div>
          ) : threads.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center py-24 text-center px-4">
                <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Inbox className="h-8 w-8 text-brand-muted" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Inbox Empty</h3>
                <p className="text-brand-muted text-sm max-w-sm mb-6">There are no active communication threads in the workspace matching your filters.</p>
                <div className="space-y-3">
                   <button onClick={handleSeed} disabled={isSeeding} className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-brand-primary text-sm font-medium rounded-lg transition-colors flex items-center justify-center mx-auto disabled:opacity-50">
                      {isSeeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                      Seed Provider Simulation
                   </button>
                   <p className="text-[10px] text-brand-muted/50 w-full">Generates an internal test thread missing IMAP ingestion.</p>
                </div>
             </div>
          ) : (
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-white/5">
                {threads.map((thread) => {
                   const contactStr = thread.contacts ? (thread.contacts.full_name || thread.contacts.email) : "Unknown Sender";
                   const companyStr = thread.contacts?.company ? `, ${thread.contacts.company}` : "";
                   
                   return (
                      <tr 
                          key={thread.id} 
                          onClick={() => router.push(`/inbox/${thread.id}`)}
                          className="hover:bg-white/[0.03] transition-colors group cursor-pointer relative"
                      >
                         <td className="px-6 py-5">
                            <div className="flex items-start justify-between">
                               <div>
                                  <div className="flex items-center space-x-2 mb-1">
                                     <span className="font-semibold text-white">{contactStr}</span>
                                     <span className="text-brand-muted text-xs">{companyStr}</span>
                                  </div>
                                  <div className="font-medium text-brand-muted/90 group-hover:text-white transition-colors">{thread.subject}</div>
                               </div>
                               <div className="flex flex-col items-end space-y-2">
                                  <span className="text-xs text-brand-muted font-medium">
                                     {new Date(thread.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border 
                                     ${thread.state === 'open' ? 'border-brand-primary/20 bg-brand-primary/10 text-brand-primary' : ''}
                                     ${thread.state === 'interested' ? 'border-green-500/20 bg-green-500/10 text-green-400' : ''}
                                     ${thread.state === 'follow_up' ? 'border-amber-500/20 bg-amber-500/10 text-amber-400' : ''}
                                     ${thread.state === 'closed' ? 'border-red-500/20 bg-red-500/10 text-red-400' : ''}
                                     ${thread.state === 'archived' ? 'border-white/10 bg-white/5 text-brand-muted' : ''}
                                  `}>
                                     {thread.state.replace('_', ' ')}
                                  </span>
                               </div>
                            </div>
                         </td>
                      </tr>
                   );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
