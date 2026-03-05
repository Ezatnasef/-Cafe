import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from "@/hooks/use-staff";
import { Plus, UserSquare2, Trash2, Pencil, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const roleLabels: Record<string, string> = {
  cashier: "كاشير",
  waiter: "ويتر (كابتن)",
  shisha: "عامل شيشة",
  manager: "مدير"
};

export default function Staff() {
  const { data: staffList, isLoading, refetch } = useStaff();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [newStaff, setNewStaff] = useState({ name: "", role: "waiter" });
  const [editStaff, setEditStaff] = useState({ name: "", role: "waiter" });

  const handleCreate = () => {
    if (!newStaff.name.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم الموظف", variant: "destructive" });
      return;
    }
    createStaff.mutate(newStaff, {
      onSuccess: () => {
        setIsOpen(false);
        setNewStaff({ name: "", role: "waiter" });
        toast({ title: "تم بنجاح", description: "تمت إضافة الموظف بنجاح" });
      },
      onError: () => {
        toast({ title: "خطأ", description: "فشل في إضافة الموظف", variant: "destructive" });
      }
    });
  };

  const handleEdit = (staff: any) => {
    setSelectedStaff(staff);
    setEditStaff({ name: staff.name, role: staff.role });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editStaff.name.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم الموظف", variant: "destructive" });
      return;
    }
    updateStaff.mutate({ id: selectedStaff.id, data: editStaff }, {
      onSuccess: () => {
        setIsEditOpen(false);
        setSelectedStaff(null);
        toast({ title: "تم بنجاح", description: "تم تعديل بيانات الموظف بنجاح" });
      },
      onError: () => {
        toast({ title: "خطأ", description: "فشل في تعديل بيانات الموظف", variant: "destructive" });
      }
    });
  };

  const handleDeleteClick = (staff: any) => {
    setSelectedStaff(staff);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    deleteStaff.mutate(selectedStaff.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedStaff(null);
        toast({ title: "تم بنجاح", description: "تم حذف الموظف بنجاح" });
      },
      onError: () => {
        toast({ title: "خطأ", description: "فشل في حذف الموظف", variant: "destructive" });
      }
    });
  };

  const handleRefresh = () => {
    refetch();
    toast({ title: "تم التحديث", description: "تم تحديث قائمة الموظفين" });
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black">الموظفين</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} className="h-12 px-4 rounded-xl">
              <RefreshCw className="w-5 h-5" />
            </Button>
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
                    {createStaff.isPending ? "جاري الحفظ..." : "حفظ الموظف"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
             <div className="col-span-full py-12 text-center text-muted-foreground">جاري التحميل...</div>
          ) : staffList?.length === 0 ? (
             <div className="col-span-full py-12 text-center text-muted-foreground">لا يوجد موظفين مسجلين</div>
          ) : (
            staffList?.map(staff => (
              <Card key={staff.id} className="bg-card/50 backdrop-blur border-border/50 hover:shadow-lg transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <UserSquare2 className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{staff.name}</h3>
                        <p className="text-muted-foreground text-sm">{roleLabels[staff.role] || staff.role}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEdit(staff)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteClick(staff)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-card border-border/50">
            <DialogHeader>
              <DialogTitle>تعديل بيانات الموظف</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>الاسم</Label>
                <Input
                  value={editStaff.name}
                  onChange={e => setEditStaff({...editStaff, name: e.target.value})}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>الوظيفة</Label>
                <Select value={editStaff.role} onValueChange={v => setEditStaff({...editStaff, role: v})}>
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
              <Button onClick={handleUpdate} disabled={updateStaff.isPending} className="w-full mt-4 h-12 rounded-xl">
                {updateStaff.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="bg-card border-border/50">
            <DialogHeader>
              <DialogTitle>تأكيد الحذف</DialogTitle>
              <DialogDescription>
                هل أنت متأكد من حذف الموظف "{selectedStaff?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>إلغاء</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteStaff.isPending}>
                {deleteStaff.isPending ? "جاري الحذف..." : "حذف"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
