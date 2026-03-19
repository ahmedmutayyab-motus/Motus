"use client";

import { useEffect, useState } from "react";
import { PlayCircle, Plus, Activity, Loader2, PauseCircle, HelpCircle } from "lucide-react";
import { getSequences, createSequence } from "@/app/actions/sequences";
import Link from "next/link";
import { toast } from "sonner";

export default function SequencesPage() {
  const [sequences, setSequences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  async function fetchSequences() {
    setIsLoading(true);
    try {
      const data = await getSequences();
      setSequences(data);
    } catch (e) {
      toast.error("Failed to load sequences.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSequences();
  }, []);

  async function handleCreateSequence() {
    setIsCreating(true);
    const name = prompt("Enter a name for your new sequence:", "New Outbound Sequence");
    if (!name) {
      setIsCreating(false);
      return;
    }
    try {
      await createSequence(name, "");
      toast.success("Sequence created");
      fetchSequences();
    } catch(e) {
      toast.error(e.message || "Failed to create Sequence");
    } finally {
      setIsCreating(false);
    }
  }

  const activeCount = sequences.filter(s => s.status === 'active').length;
  const pausedCount = sequences.filter(s => s.status === 'paused').length;
  const draftCount = sequences.filter(s => s.status === 'draft').length;
  const totalEnrollments = sequences.reduce((sum, s) => sum + (s.sequence_enrollments?.[0]?.count || 0), 0);

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Sequences</h1>
          <p className="text-sm text-brand-muted">Design outreach flows and orchestrate contact enrollment.</p>
        </div>
        <button onClick={handleCreateSequence} disabled={isLoading || isCreating} className="flex items-center bg-brand-primary hover:bg-brand-primaryHover text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-lg disabled:opacity-50">
          {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          New Sequence
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-center border border-white/5">
          <span className="text-xs text-brand-muted uppercase font-semibold tracking-wider mb-1">Active</span>
          <div className="text-2xl font-bold text-white flex items-center">
             {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-brand-muted" /> : activeCount}
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-center border border-white/5">
          <span className="text-xs text-brand-muted uppercase font-semibold tracking-wider mb-1">Paused / Draft</span>
          <div className="text-2xl font-bold text-white flex items-center">
             {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-brand-muted" /> : pausedCount + draftCount}
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-center border border-brand-primary/20 bg-brand-primary/5">
          <span className="text-xs text-brand-muted uppercase font-semibold tracking-wider mb-1">Total Enrolled</span>
          <div className="text-2xl font-bold text-brand-primary flex items-center">
             {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-brand-muted" /> : totalEnrollments}
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center border border-white/5 bg-black/20 group relative overflow-hidden">
          <HelpCircle className="h-8 w-8 text-brand-muted/20 absolute right-4 transition-transform group-hover:scale-110" />
          <div>
            <span className="text-xs text-brand-muted font-medium mb-1 block">Phase 4 Notice</span>
            <span className="text-[10px] text-brand-muted/70 tracking-tight leading-snug block pr-8">
              Live automated email delivery infrastructure is scheduled for Phase 5. Active sequences track flow state, but sending mechanics are placeholders.
            </span>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl flex flex-col flex-1 overflow-hidden border border-white/5">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-black/40 text-brand-muted border-b border-white/5 sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="px-6 py-4 font-medium">Campaign Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Enrolled Contacts</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && sequences.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-brand-muted">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-brand-primary" />
                    Fetching structural architecture...
                  </td>
                </tr>
              ) : sequences.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center border-b border-white/5">
                    <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Activity className="h-6 w-6 text-brand-muted" />
                    </div>
                    <p className="text-white font-medium mb-1">No sequences built yet.</p>
                    <p className="text-brand-muted text-sm max-w-sm mx-auto mb-4">You need sequences to automate your outbound workflows and enroll generated contact lists.</p>
                  </td>
                </tr>
              ) : (
                sequences.map(seq => (
                  <tr key={seq.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                    <td className="px-6 py-4 relative">
                      <Link href={`/sequences/${seq.id}`} className="absolute inset-0 z-0"></Link>
                      <div className="font-medium text-white relative z-10 pointer-events-none">{seq.name}</div>
                      <div className="text-xs text-brand-muted truncate max-w-md relative z-10 pointer-events-none">{seq.description || "No description provided."}</div>
                    </td>
                    <td className="px-6 py-4 pointer-events-none text-xs font-semibold uppercase tracking-wider">
                       {seq.status === 'active' && <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded inline-flex items-center"><PlayCircle className="h-3 w-3 mr-1" /> Active</span>}
                       {seq.status === 'paused' && <span className="text-amber-500 bg-amber-500/10 px-2 py-1 rounded inline-flex items-center"><PauseCircle className="h-3 w-3 mr-1" /> Paused</span>}
                       {seq.status === 'draft' && <span className="text-brand-muted bg-white/5 border border-white/10 px-2 py-1 rounded">Draft</span>}
                    </td>
                    <td className="px-6 py-4 pointer-events-none text-brand-muted">
                      {seq.sequence_enrollments?.[0]?.count || 0} traversing
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/sequences/${seq.id}`} className="text-brand-primary font-medium hover:underline text-xs relative z-10">
                        Open Editor
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
