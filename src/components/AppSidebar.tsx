import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Car, CalendarDays, FileText } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/logo-kanmas.png";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Aset Ranmor", url: "/ranmor", icon: Car },
  { title: "Rencana Kegiatan", url: "/rencana", icon: CalendarDays },
  { title: "Laporan Bulanan", url: "/laporan", icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (url: string) => url === "/" ? pathname === "/" : pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 p-2">
          <img src={logo} alt="KANMAS Logo" className="h-10 w-10 object-contain shrink-0" />
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-bold text-sidebar-primary text-sm">KANMAS</div>
              <div className="text-[10px] text-sidebar-foreground/70">Kanit Binmas</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink to={item.url} end={item.url === "/"}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-2 py-2 text-[10px] text-sidebar-foreground/60">
            by Mohamad Khair
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
