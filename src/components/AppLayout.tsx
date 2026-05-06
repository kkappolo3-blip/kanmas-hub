import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import logo from "@/assets/logo-kanmas.png";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-3 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <img src={logo} alt="KANMAS" className="h-8 w-8 object-contain" />
                <div className="leading-tight">
                  <h1 className="text-sm font-bold text-primary">System KANMAS</h1>
                  <p className="text-[10px] text-muted-foreground">Kanit Binmas</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground hidden sm:block">by Mohamad Khair</div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
          <footer className="border-t bg-card px-4 py-2 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} System KANMAS — by Mohamad Khair
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
