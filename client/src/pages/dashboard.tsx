import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDailyReport } from "@/hooks/use-reports";
import { useSessions } from "@/hooks/use-sessions";
import { PlayCircle, TrendingUp, Users, ShoppingBag } from "lucide-react";

export default function Dashboard() {
  const { data: report, isLoading: reportLoading } = useDailyReport();
  const { data: sessions, isLoading: sessionsLoading } = useSessions("active");

  const activeSessionsCount = sessions?.length || 0;

  return (
    <Layout>
      <div className="flex flex-col gap-8 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-card to-background border border-border/50 p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 leading-tight">
              مرحباً بك في نظام <span className="text-primary">LoungePOS</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              إدارة سلسة وسريعة للطلبات، مصممة خصيصاً للمقاهي والمطاعم الحديثة.
            </p>
            
            <Link href="/pos">
              <Button size="lg" className="h-16 px-8 text-xl font-bold rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg glow-primary text-primary-foreground transition-all hover:-translate-y-1 active:translate-y-0">
                <PlayCircle className="w-6 h-6 ml-3" />
                ابدأ التشغيل الآن
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/50 border-border/50 backdrop-blur shadow-xl hover:shadow-primary/5 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">مبيعات اليوم</p>
                  <h3 className="text-3xl font-black text-foreground mt-1">
                    {reportLoading ? "..." : `${report?.totalSales || 0} ج.م`}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur shadow-xl hover:shadow-primary/5 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">طلبات نشطة</p>
                  <h3 className="text-3xl font-black text-foreground mt-1">
                    {sessionsLoading ? "..." : activeSessionsCount}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur shadow-xl hover:shadow-primary/5 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الطلبات المكتملة</p>
                  <h3 className="text-3xl font-black text-foreground mt-1">
                    {reportLoading ? "..." : report?.totalOrders || 0}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </Layout>
  );
}
