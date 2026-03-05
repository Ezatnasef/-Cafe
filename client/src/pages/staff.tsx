import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStaff, useCreateStaff } from "@/hooks/use-staff";
import { Plus, UserSquare2 } from "lucide-react";

export default function Staff() {
  const { data: staffList, isLoading } = useStaff();
  const createStaff = useCreateStaff();

  const [isOpen, setIsOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: "", role: "waiter" });

  const handleCreate = () => {
    createStaff.mutate(newStaff, {
      onSuccess: () => {
        setIsOpen(false);
        setNewStaff({ name: "", role: "waiter" });
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black">الموظفين</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-xl glow-primary font-bold">
                <Plus className="w-5 h-5 ml-2" /> إضافة موظف
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50">
              <DialogHeader>
                <DialogTitle>موظف جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>الاسم</Label>
                  <Input 
                    value={newStaff.name} 
                    onChange={e => setNewStaff({...newStaff, name: e.target.value})} 
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الوظيفة</Label>
                  <Select value={newStaff.role} onValueChange={v => setNewStaff({...newStaff, role: v})}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="اختر الوظيفة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cashier">كاشير</SelectItem>
                      <SelectItem value="waiter">ويتر (كابتن)</SelectItem>
                      <SelectItem value="shisha">عامل شيشة</SelectItem>
                      <SelectItem value="manager">مدير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} disabled={createStaff.isPending} className="w-full mt-4 h-12 rounded-xl">
                  حفظ الموظف
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
             <div className="col-span-full py-12 text-center text-muted-foreground">جاري التحميل...</div>
          ) : staffList?.length === 0 ? (
             <div className="col-span-full py-12 text-center text-muted-foreground">لا يوجد موظفين مسجلين</div>
          ) : (
            staffList?.map(staff => (
              <Card key={staff.id} className="bg-card/50 backdrop-blur border-border/50 hover:shadow-lg transition-all group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <UserSquare2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{staff.name}</h3>
                    <p className="text-muted-foreground text-sm uppercase tracking-wider">{staff.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
