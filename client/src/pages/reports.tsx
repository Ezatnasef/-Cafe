import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDailyReport } from "@/hooks/use-reports";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";
import { Download, RefreshCw, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const { data: report, isLoading, refetch } = useDailyReport(selectedDate);
  const { toast } = useToast();


  const categoryData = report ? Object.entries(report.salesByCategory).map(([name, value]) => ({ name, value })) : [];
  const staffData = report ? Object.entries(report.staffProfits).map(([name, value]) => ({ name, value })) : [];

  const handleRefresh = () => {
    refetch();
    toast({ title: "تم التحديث", description: "تم تحديث بيانات التقارير" });
  };

  const generatePDF = async () => {
    if (!report) {
      toast({ title: "خطأ", description: "لا توجد بيانات للتصدير", variant: "destructive" });
      return;
    }

    toast({ title: "جاري التحضير", description: "جاري إنشاء ملف PDF..." });

    try {
      // Build report as a printable HTML page and use the browser to print it as PDF
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        toast({ title: "خطأ", description: "الرجاء السماح بالنوافذ المنبثقة لتحميل التقرير", variant: "destructive" });
        return;
      }

      const categoryRows = Object.entries(report.salesByCategory).map(([cat, amount]) =>
        `<tr>
          <td style="padding: 12px 16px; font-size: 15px; border-bottom: 1px solid #e5e5e5;">${cat}</td>
          <td style="padding: 12px 16px; font-size: 15px; text-align: left; color: #b8860b; font-weight: bold; border-bottom: 1px solid #e5e5e5;">${amount} ج.م</td>
        </tr>`
      ).join('');

      const staffRows = Object.entries(report.staffProfits).map(([name, amount]) =>
        `<tr>
          <td style="padding: 12px 16px; font-size: 15px; border-bottom: 1px solid #e5e5e5;">${name}</td>
          <td style="padding: 12px 16px; font-size: 15px; text-align: left; color: #b8860b; font-weight: bold; border-bottom: 1px solid #e5e5e5;">${amount} ج.م</td>
        </tr>`
      ).join('');

      const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقرير كازابلانكا - ${selectedDate}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      direction: rtl;
      color: #1a1a1a;
      background: #fff;
      padding: 40px;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 35px;
      border-bottom: 3px solid #b8860b;
      padding-bottom: 25px;
    }
    .header h1 { font-size: 32px; color: #1a1a1a; margin-bottom: 4px; }
    .header .sub { font-size: 14px; color: #999; }
    .header h2 { font-size: 22px; color: #b8860b; margin-top: 16px; }
    .stats {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 35px;
    }
    .stat-card {
      flex: 1;
      background: #f9f7f2;
      border-radius: 14px;
      padding: 22px;
      text-align: center;
      border: 1px solid #e8e4da;
    }
    .stat-card .label { color: #888; font-size: 13px; margin-bottom: 6px; }
    .stat-card .value { font-size: 30px; font-weight: 900; color: #b8860b; }
    .stat-card .value.dark { color: #1a1a1a; }
    .section { margin-bottom: 30px; }
    .section h3 {
      font-size: 19px;
      color: #1a1a1a;
      border-right: 4px solid #b8860b;
      padding-right: 12px;
      margin-bottom: 14px;
    }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f5f2eb; }
    th {
      padding: 12px 16px;
      text-align: right;
      font-size: 14px;
      font-weight: 700;
      border-bottom: 2px solid #d4c9b0;
      color: #555;
    }
    th:last-child { text-align: left; }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 18px;
      border-top: 1px solid #e5e5e5;
      color: #bbb;
      font-size: 12px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>كافيه كازابلانكا</h1>
    <p class="sub">Casablanca Cafe</p>
    <h2>تقرير يومي - ${selectedDate}</h2>
  </div>

  <div class="stats">
    <div class="stat-card">
      <div class="label">إجمالي المبيعات</div>
      <div class="value">${report.totalSales} ج.م</div>
    </div>
    <div class="stat-card">
      <div class="label">عدد الطلبات</div>
      <div class="value dark">${report.totalOrders}</div>
    </div>
    <div class="stat-card">
      <div class="label">الأكثر مبيعاً</div>
      <div class="value" style="font-size: 20px;">${report.bestSellingItem || 'لا يوجد'}</div>
    </div>
  </div>

  <div class="section">
    <h3>المبيعات حسب القسم</h3>
    <table>
      <thead>
        <tr>
          <th>القسم</th>
          <th style="text-align: left;">المبيعات</th>
        </tr>
      </thead>
      <tbody>
        ${categoryRows || '<tr><td colspan="2" style="padding: 20px; text-align: center; color: #999;">لا توجد بيانات</td></tr>'}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h3>أداء الموظفين</h3>
    <table>
      <thead>
        <tr>
          <th>الموظف</th>
          <th style="text-align: left;">المبيعات</th>
        </tr>
      </thead>
      <tbody>
        ${staffRows || '<tr><td colspan="2" style="padding: 20px; text-align: center; color: #999;">لا توجد بيانات</td></tr>'}
      </tbody>
    </table>
  </div>

  <div class="footer">
    تم إنشاء التقرير بتاريخ ${format(new Date(), "yyyy-MM-dd")} الساعة ${format(new Date(), "HH:mm")} | كافيه كازابلانكا
  </div>

  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 1000);
    };
  </script>
</body>
</html>`;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      toast({ title: "تم", description: "استخدم حفظ كـ PDF من نافذة الطباعة" });
    } catch {
      toast({ title: "خطأ", description: "فشل في إنشاء التقرير", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-12">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-3xl font-black">التقارير</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-xl border border-border/50">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-0 bg-transparent p-0 h-8 w-36 text-primary font-bold focus-visible:ring-0"
              />
            </div>
            <Button variant="outline" onClick={handleRefresh} className="h-12 px-4 rounded-xl">
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Button onClick={generatePDF} className="h-12 px-6 rounded-xl glow-primary font-bold">
              <Download className="w-5 h-5 ml-2" /> تحميل PDF
            </Button>
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
                  <h2 className="text-5xl font-black text-primary">{report?.totalSales || 0} <span className="text-xl text-foreground">ج.م</span></h2>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-card to-background border-border/50 shadow-xl">
                <CardContent className="p-8">
                  <p className="text-muted-foreground font-bold mb-2">عدد الطلبات</p>
                  <h2 className="text-5xl font-black text-foreground">{report?.totalOrders || 0}</h2>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-card to-background border-border/50 shadow-xl">
                <CardContent className="p-8">
                  <p className="text-muted-foreground font-bold mb-2">الصنف الأكثر مبيعاً</p>
                  <h2 className="text-3xl font-black text-primary mt-4 truncate">{report?.bestSellingItem || 'لا توجد بيانات'}</h2>
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
                          formatter={(value: number) => [`${value} ج.م`, 'المبيعات']}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {categoryData.map((_, index) => (
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
                          formatter={(value: number) => [`${value} ج.م`, 'المبيعات']}
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
