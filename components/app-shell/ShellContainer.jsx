export default function ShellContainer({ children }) {
  return (
    <main className="flex-1 overflow-x-hidden pt-8 px-6 pb-24 h-[calc(100vh-64px)] overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  );
}
