import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  MonitorPlay,
  UtensilsCrossed,
  Users,
  Contact,
  BarChart3,
  ClipboardList,
  LogOut,
  KeyRound
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const items = [
  { title: "لوحة التحكم", url: "/", icon: LayoutDashboard },
  { title: "الطلبات (POS)", url: "/pos", icon: MonitorPlay },
  { title: "سجل الطلبات", url: "/orders", icon: ClipboardList },
  { title: "القائمة", url: "/menu", icon: UtensilsCrossed },
  { title: "العملاء", url: "/customers", icon: Contact },
  { title: "الموظفين", url: "/staff", icon: Users },
  { title: "التقارير", url: "/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const [location] = useLocation();
  const [now, setNow] = useState(new Date());
  const [changePassOpen, setChangePassOpen] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const handleChangePassword = async () => {
    if (newPass !== confirmPass) {
      toast({ title: "خطأ", description: "كلمات المرور غير متطابقة", variant: "destructive" });
      return;
    }
    if (newPass.length < 4) {
      toast({ title: "خطأ", description: "كلمة المرور يجب أن تكون 4 أحرف على الأقل", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "تم بنجاح", description: "تم تغيير كلمة المرور" });
        setChangePassOpen(false);
        setOldPass("");
        setNewPass("");
        setConfirmPass("");
      } else {
        toast({ title: "خطأ", description: data.message || "كلمة المرور الحالية غير صحيحة", variant: "destructive" });
      }
    } catch {
      toast({ title: "خطأ", description: "فشل الاتصال بالخادم", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <>
      <Sidebar side="right" className="border-l border-border/50 bg-sidebar">
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
        <SidebarFooter className="p-3 space-y-1">
          <button
            onClick={() => setChangePassOpen(true)}
            className="flex items-center gap-3 w-full px-4 h-11 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all text-sm"
          >
            <KeyRound className="w-4 h-4" />
            <span>تغيير كلمة المرور</span>
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("cafe_logged_in");
              window.location.reload();
            }}
            className="flex items-center gap-3 w-full px-4 h-11 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </SidebarFooter>
      </Sidebar>

      {/* Change Password Dialog */}
      <Dialog open={changePassOpen} onOpenChange={setChangePassOpen}>
        <DialogContent className="bg-card border-border/50 max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle>تغيير كلمة المرور</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-bold">كلمة المرور الحالية</Label>
              <Input
                type="password"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                className="h-11 rounded-lg bg-background"
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold">كلمة المرور الجديدة</Label>
              <Input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="h-11 rounded-lg bg-background"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold">تأكيد كلمة المرور الجديدة</Label>
              <Input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="h-11 rounded-lg bg-background"
                autoComplete="new-password"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-bold"
            >
              {isLoading ? "جاري التغيير..." : "تغيير كلمة المرور"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
