export default function Loading() {
  return (
    <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center">
        <div className="h-10 w-10 border-4 border-white/10 border-t-brand-primary rounded-full animate-spin mb-4" />
        <p className="text-brand-muted text-sm tracking-wide font-medium">Loading workspace...</p>
      </div>
    </div>
  );
}
