import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  MonitorPlay, 
  UtensilsCrossed, 
  Users, 
  Contact, 
  BarChart3 
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "لوحة التحكم", url: "/", icon: LayoutDashboard },
  { title: "الطلبات (POS)", url: "/pos", icon: MonitorPlay },
  { title: "القائمة", url: "/menu", icon: UtensilsCrossed },
  { title: "العملاء", url: "/customers", icon: Contact },
  { title: "الموظفين", url: "/staff", icon: Users },
  { title: "التقارير", url: "/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const [location] = useLocation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-EG', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Sidebar className="border-r-border/50 bg-sidebar">
      <SidebarHeader className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-bold text-xl">C</span>
            </div>
            <h2 className="text-xl font-black text-foreground tracking-wide">
              Casablanca <span className="text-primary">Cafe</span>
            </h2>
          </div>
          <div className="text-xs text-muted-foreground font-bold bg-muted/30 p-2 rounded-lg border border-border/50 text-center">
            {formatDate(now)}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 px-3">
              {items.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        h-12 text-base rounded-xl transition-all duration-300
                        ${isActive 
                          ? 'bg-primary/10 text-primary font-bold shadow-sm' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3 w-full px-4">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
