import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/use-customers";
import { useCreateSession } from "@/hooks/use-sessions";
import { useStaff } from "@/hooks/use-staff";
import { Plus, Star, Trash2, Pencil, RefreshCw, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export default function Customers() {
  const [, setLocation] = useLocation();
  const { data: customers, isLoading, refetch } = useCustomers();
  const { data: staffList } = useStaff();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const createSession = useCreateSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [newCustomer, setNewCustomer] = useState({ name: "", notes: "", isRegular: false });
  const [editCustomer, setEditCustomer] = useState({ name: "", notes: "", isRegular: false });
  const [orderStaffId, setOrderStaffId] = useState("");

  const handleCreate = () => {
    if (!newCustomer.name.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم العميل", variant: "destructive" });
      return;
    }
    createCustomer.mutate(newCustomer, {
      onSuccess: () => {
        setIsOpen(false);
        setNewCustomer({ name: "", notes: "", isRegular: false });
        toast({ title: "تم بنجاح", description: "تمت إضافة العميل بنجاح" });
      },
      onError: () => {
        toast({ title: "خطأ", description: "فشل في إضافة العميل", variant: "destructive" });
      }
    });
  };

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer);
    setEditCustomer({ name: customer.name, notes: customer.notes || "", isRegular: customer.isRegular || false });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editCustomer.name.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم العميل", variant: "destructive" });
      return;
    }
    updateCustomer.mutate({ id: selectedCustomer.id, data: editCustomer }, {
      onSuccess: () => {
        setIsEditOpen(false);
        setSelectedCustomer(null);
        toast({ title: "تم بنجاح", description: "تم تعديل بيانات العميل بنجاح" });
      },
      onError: () => {
        toast({ title: "خطأ", description: "فشل في تعديل بيانات العميل", variant: "destructive" });
      }
    });
  };

  const handleDeleteClick = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    deleteCustomer.mutate(selectedCustomer.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedCustomer(null);
        toast({ title: "تم بنجاح", description: "تم حذف العميل بنجاح" });
      },
      onError: () => {
        toast({ title: "خطأ", description: "فشل في حذف العميل", variant: "destructive" });
      }
    });
  };

  const handleRefresh = () => {
    refetch();
    toast({ title: "تم التحديث", description: "تم تحديث قائمة العملاء" });
  };

  const handleNewOrder = (customer: any) => {
    setSelectedCustomer(customer);
    setOrderStaffId("");
    setIsNewOrderOpen(true);
  };

  const handleCreateOrder = () => {
    if (!orderStaffId) {
      toast({ title: "خطأ", description: "يرجى اختيار الموظف", variant: "destructive" });
      return;
    }
    createSession.mutate({
      customerName: selectedCustomer.name,
      customerId: selectedCustomer.id,
      staffId: parseInt(orderStaffId),
      status: "active"
    }, {
      onSuccess: () => {
        setIsNewOrderOpen(false);
        toast({ title: "تم بنجاح", description: `تم إنشاء طلب جديد للعميل ${selectedCustomer.name}` });
        setLocation("/pos");
      },
      onError: () => {
        toast({ title: "خطأ", description: "فشل في إنشاء الطلب", variant: "destructive" });
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black">العملاء</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} className="h-12 px-4 rounded-xl">
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 px-6 rounded-xl glow-primary font-bold">
                  <Plus className="w-5 h-5 ml-2" /> إضافة عميل
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border/50">
                <DialogHeader>
                  <DialogTitle>عميل جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>اسم العميل</Label>
                    <Input
                      value={newCustomer.name}
                      onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ملاحظات</Label>
                    <Input
                      value={newCustomer.notes}
                      onChange={e => setNewCustomer({...newCustomer, notes: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse pt-2">
                    <Checkbox
                      id="regular"
                      checked={newCustomer.isRegular}
                      onCheckedChange={(checked) => setNewCustomer({...newCustomer, isRegular: checked as boolean})}
                    />
                    <Label htmlFor="regular">عميل دائم (VIP)</Label>
                  </div>
                  <Button onClick={handleCreate} disabled={createCustomer.isPending} className="w-full mt-4 h-12 rounded-xl">
                    {createCustomer.isPending ? "جاري الحفظ..." : "حفظ العميل"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-0">
            <div className="rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">ملاحظات</TableHead>
                    <TableHead className="text-right w-32">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">جاري التحميل...</TableCell></TableRow>
                  ) : customers?.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">لا يوجد عملاء</TableCell></TableRow>
                  ) : (
                    customers?.map(customer => (
                      <TableRow key={customer.id} className="hover:bg-muted/20">
                        <TableCell className="font-bold">{customer.name}</TableCell>
                        <TableCell>
                          {customer.isRegular ? (
                            <span className="inline-flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded-md text-xs font-bold">
                              <Star className="w-3 h-3 fill-primary" /> VIP
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">عادي</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">{customer.notes || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:text-green-500 hover:bg-green-500/10" onClick={() => handleNewOrder(customer)} title="طلب جديد">
                              <ShoppingBag className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEdit(customer)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteClick(customer)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-card border-border/50">
            <DialogHeader>
              <DialogTitle>تعديل بيانات العميل</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>اسم العميل</Label>
                <Input
                  value={editCustomer.name}
                  onChange={e => setEditCustomer({...editCustomer, name: e.target.value})}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Input
                  value={editCustomer.notes}
                  onChange={e => setEditCustomer({...editCustomer, notes: e.target.value})}
                  className="bg-background"
                />
              </div>
              <div className="flex items-center space-x-2 space-x-reverse pt-2">
                <Checkbox
                  id="edit-regular"
                  checked={editCustomer.isRegular}
                  onCheckedChange={(checked) => setEditCustomer({...editCustomer, isRegular: checked as boolean})}
                />
                <Label htmlFor="edit-regular">عميل دائم (VIP)</Label>
              </div>
              <Button onClick={handleUpdate} disabled={updateCustomer.isPending} className="w-full mt-4 h-12 rounded-xl">
                {updateCustomer.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
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
                هل أنت متأكد من حذف العميل "{selectedCustomer?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>إلغاء</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteCustomer.isPending}>
                {deleteCustomer.isPending ? "جاري الحذف..." : "حذف"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Order Dialog */}
        <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
          <DialogContent className="bg-card border-border/50">
            <DialogHeader>
              <DialogTitle>طلب جديد للعميل: {selectedCustomer?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>الموظف (الكابتن)</Label>
                <Select value={orderStaffId} onValueChange={setOrderStaffId}>
                  <SelectTrigger className="h-12 bg-background border-border/50">
                    <SelectValue placeholder="اختر الموظف المسؤول" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList?.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name} ({s.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateOrder} disabled={createSession.isPending} className="w-full h-12 rounded-xl font-bold glow-primary">
                <ShoppingBag className="w-5 h-5 ml-2" />
                {createSession.isPending ? "جاري الإنشاء..." : "فتح الطلب والانتقال لنقطة البيع"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
