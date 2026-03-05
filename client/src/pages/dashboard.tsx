import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDailyReport } from "@/hooks/use-reports";
import { useSessions } from "@/hooks/use-sessions";
import { useCustomers } from "@/hooks/use-customers";
import { useStaff } from "@/hooks/use-staff";
import { TrendingUp, Users, ShoppingBag, Plus, Star, RefreshCw, Contact, Clock } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: report, isLoading: reportLoading, refetch: refetchReport } = useDailyReport();
  const { data: completedSessions } = useSessions("completed");
  const { data: customers } = useCustomers();
  const { data: staffList } = useStaff();

  const handleRefresh = () => {
    refetchReport();
  };

  // Last 5 completed orders
  const recentOrders = completedSessions?.slice(-5).reverse() || [];

  return (
    <Layout>
      <div className="flex flex-col gap-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-card to-background border border-border/50 p-8 md:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 max-w-2xl text-right">
            <h1 className="text-3xl md:text-4xl font-black text-foreground mb-3 leading-tight">
              نظام إدارة كافيه <span className="text-primary">Casablanca</span>
            </h1>
            <p className="text-base text-muted-foreground mb-6">
              أدر المنيو، الشيشة، العملاء، والموظفين من شاشة واحدة.
            </p>

            <div className="flex flex-wrap gap-3 justify-start">
              <Button
                size="lg"
                className="h-14 px-6 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg glow-primary text-primary-foreground transition-all hover:-translate-y-1 active:translate-y-0"
                onClick={() => setLocation("/pos")}
              >
                <span className="ml-2">☕</span>
                ابدأ التشغيل الآن
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-6 text-lg font-bold rounded-2xl border-border/50 bg-background/50 hover:bg-muted transition-all hover:-translate-y-1 active:translate-y-0"
                onClick={() => setLocation("/menu")}
              >
                <Plus className="ml-2 w-5 h-5" /> إضافة صنف
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">إحصائيات اليوم</h2>
          <Button variant="outline" size="sm" className="rounded-xl border-border/50 gap-2" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border/50 backdrop-blur shadow-xl hover:shadow-primary/5 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">إجمالي دخل اليوم</p>
                  <h3 className="text-2xl font-black text-foreground mt-1">
                    {reportLoading ? "..." : `${report?.totalSales || 0} ج.م`}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur shadow-xl hover:shadow-primary/5 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">العملاء المسجلين</p>
                  <h3 className="text-2xl font-black text-foreground mt-1">
                    {customers?.length || 0}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur shadow-xl hover:shadow-primary/5 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الطلبات المكتملة</p>
                  <h3 className="text-2xl font-black text-foreground mt-1">
                    {reportLoading ? "..." : report?.totalOrders || 0}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur shadow-xl hover:shadow-primary/5 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">أكثر صنف مبيعاً</p>
                  <h3 className="text-lg font-black text-primary mt-1 truncate max-w-[160px]">
                    {reportLoading ? "..." : report?.bestSellingItem || "---"}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Orders */}
          <Card className="bg-card/50 border-border/50 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  آخر الطلبات المكتملة
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary" onClick={() => setLocation("/orders")}>
                  عرض الكل
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-right">#</TableHead>
                    <TableHead className="text-right">العميل</TableHead>
                    <TableHead className="text-right">الموظف</TableHead>
                    <TableHead className="text-right">الإجمالي</TableHead>
                    <TableHead className="text-right">الدفع</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">لا توجد طلبات مكتملة بعد</TableCell>
                    </TableRow>
                  ) : (
                    recentOrders.map(order => (
                      <TableRow key={order.id} className="hover:bg-muted/20">
                        <TableCell className="font-bold">#{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell className="text-muted-foreground">{staffList?.find(s => s.id === order.staffId)?.name || '-'}</TableCell>
                        <TableCell className="text-primary font-bold">{order.total || 0} ج.م</TableCell>
                        <TableCell>
                          <span className="bg-muted/50 px-2 py-1 rounded text-xs font-bold">
                            {order.paymentMethod === 'cash' ? 'كاش' : order.paymentMethod === 'card' ? 'بطاقة' : order.paymentMethod === 'vodafone_cash' ? 'فودافون' : order.paymentMethod || '-'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Customers List */}
          <Card className="bg-card/50 border-border/50 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Contact className="w-5 h-5 text-primary" />
                  العملاء المسجلين
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary" onClick={() => setLocation("/customers")}>
                  عرض الكل
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">ملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!customers || customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">لا يوجد عملاء مسجلين</TableCell>
                    </TableRow>
                  ) : (
                    customers.slice(0, 6).map(customer => (
                      <TableRow key={customer.id} className="hover:bg-muted/20">
                        <TableCell className="font-bold">{customer.name}</TableCell>
                        <TableCell>
                          {customer.isRegular ? (
                            <span className="inline-flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded text-xs font-bold">
                              <Star className="w-3 h-3 fill-primary" /> VIP
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">عادي</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm truncate max-w-[150px]">{customer.notes || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

      </div>
    </Layout>
  );
}
