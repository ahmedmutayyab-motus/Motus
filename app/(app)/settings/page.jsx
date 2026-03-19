import { Settings } from "lucide-react";

export default function SettingsPlaceholderPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-20">
      <div className="h-20 w-20 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6">
        <Settings className="h-10 w-10 text-brand-primary" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Workspace Settings</h1>
      <p className="text-brand-muted mb-8 leading-relaxed">
        Configure your entire Motus instance, billing, and team permissions.
      </p>
      <div className="bg-obsidian-900 border border-white/5 rounded-lg p-4 w-full text-left">
        <div className="text-xs font-semibold text-brand-primary uppercase tracking-wider mb-2">Coming in Phase 2</div>
        <ul className="text-sm text-brand-muted space-y-2">
          <li>• Profile & Workspace configuration</li>
          <li>• Connected integrations & Mailboxes</li>
          <li>• Stripe billing & usage</li>
        </ul>
      </div>
    </div>
  );
}
