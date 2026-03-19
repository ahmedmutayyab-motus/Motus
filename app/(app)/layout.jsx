import AppSidebar from "@/components/app-shell/AppSidebar";
import TopNav from "@/components/app-shell/TopNav";
import ShellContainer from "@/components/app-shell/ShellContainer";

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen bg-brand-background overflow-hidden relative">
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav />
        <ShellContainer>
          {children}
        </ShellContainer>
      </div>
    </div>
  );
}
