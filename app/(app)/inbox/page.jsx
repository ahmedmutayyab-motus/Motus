import { Inbox } from "lucide-react";

export default function InboxPlaceholderPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-20">
      <div className="h-20 w-20 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6">
        <Inbox className="h-10 w-10 text-brand-primary" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Unified Inbox</h1>
      <p className="text-brand-muted mb-8 leading-relaxed">
        Manage all replies in one place. Triage, categorize, and follow up fast.
      </p>
      <div className="bg-obsidian-900 border border-white/5 rounded-lg p-4 w-full text-left">
        <div className="text-xs font-semibold text-brand-primary uppercase tracking-wider mb-2">Coming in Phase 3</div>
        <ul className="text-sm text-brand-muted space-y-2">
          <li>• IMAP/SMTP integration</li>
          <li>• AI reply drafting</li>
          <li>• Sentiment analysis on inbound</li>
        </ul>
      </div>
    </div>
  );
}
