export default function AuthWrapper({ title, subtitle, children }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{title}</h1>
        {subtitle && <p className="text-brand-muted">{subtitle}</p>}
      </div>
      <div className="glass-panel p-8 rounded-2xl relative">
        <div className="absolute inset-0 bg-white/5 rounded-2xl pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
