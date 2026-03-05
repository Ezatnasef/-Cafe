import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDailyReport } from "@/hooks/use-reports";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";

export default function Reports() {
  const { data: report, isLoading } = useDailyReport();

  // Format data for recharts
  const categoryData = report ? Object.entries(report.salesByCategory).map(([name, value]) => ({ name, value })) : [];
  const staffData = report ? Object.entries(report.staffProfits).map(([name, value]) => ({ name, value })) : [];

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-12">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black">التقارير اليومية</h1>
          <div className="bg-card px-4 py-2 rounded-xl border border-border/50 font-bold text-primary">
            {format(new Date(), "yyyy-MM-dd")}
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">جاري التحميل...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-card to-background border-border/50 shadow-xl">
                <CardContent className="p-8">
                  <p className="text-muted-foreground font-bold mb-2">إجمالي المبيعات</p>
                  <h2 className="text-5xl font-black text-primary">{report?.totalSales} <span className="text-xl text-foreground">ج.م</span></h2>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-card to-background border-border/50 shadow-xl">
                <CardContent className="p-8">
                  <p className="text-muted-foreground font-bold mb-2">عدد الطلبات</p>
                  <h2 className="text-5xl font-black text-foreground">{report?.totalOrders}</h2>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-card to-background border-border/50 shadow-xl">
                <CardContent className="p-8">
                  <p className="text-muted-foreground font-bold mb-2">الصنف الأكثر مبيعاً</p>
                  <h2 className="text-3xl font-black text-primary mt-4 truncate">{report?.bestSellingItem || 'غير متاح'}</h2>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              <Card className="bg-card/50 border-border/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>المبيعات حسب القسم</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '8px' }} 
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(45, 80%, ${50 - (index * 5)}%)`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">لا توجد بيانات كافية</div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>أداء الموظفين (المبيعات)</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {staffData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={staffData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                        <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '8px' }} 
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">لا توجد بيانات كافية</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
