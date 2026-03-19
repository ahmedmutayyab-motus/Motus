export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex text-brand-foreground bg-brand-background">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex flex-col flex-1 bg-obsidian-900 border-r border-white/5 relative overflow-hidden p-12 justify-between">
        <div className="absolute inset-0 bg-mesh-gradient opacity-40 pointer-events-none" />
        <div className="relative z-10">
          <div className="font-bold tracking-tight text-3xl text-white mb-6">MOTUS.</div>
          <p className="text-brand-muted text-lg max-w-md">
            The momentum engine for modern outbound. Command everything from one workspace.
          </p>
        </div>
        <div className="relative z-10 glass-panel p-6 rounded-xl max-w-md">
          <p className="italic text-brand-muted mb-4">&quot;Motus replaced 4 disconnected tools in our workflow on day one.&quot;</p>
          <div className="flex items-center">
            <div className="h-10 w-10 bg-brand-primary/20 rounded-full mr-3 border border-brand-primary/30" />
            <div>
              <div className="text-sm font-semibold text-white">Sarah Jenkins</div>
              <div className="text-xs text-brand-muted">VP of Sales, Acme Corp</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right panel - Auth form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative bg-brand-background">
        {children}
      </div>
    </div>
  );
}
