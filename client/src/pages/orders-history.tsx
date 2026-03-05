import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSessions, useAddSessionItem, useUpdateSessionItem, useDeleteSessionItem, useUpdateSession, useDeleteSession } from "@/hooks/use-sessions";
import { useStaff } from "@/hooks/use-staff";
import { useItems } from "@/hooks/use-items";
import { useCategories } from "@/hooks/use-categories";
import { Search, RefreshCw, Eye, ShoppingBag, CheckCircle, Plus, Minus, Trash2, Edit3, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OrdersHistory() {
  const [, setLocation] = useLocation();
  const { data: allSessions, refetch } = useSessions();
  const { data: staffList } = useStaff();
  const { data: items } = useItems();
  const { data: categories } = useCategories();
  const { toast } = useToast();

  const addItem = useAddSessionItem();
  const updateItem = useUpdateSessionItem();
  const deleteItem = useDeleteSessionItem();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [itemSearch, setItemSearch] = useState("");

  // Edit fields
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState("");
  const [editStatus, setEditStatus] = useState("");

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);

  // Scrollable item list ref
  const itemsListRef = useRef<HTMLDivElement>(null);

  // Sort by most recent first
  const sortedSessions = [...(allSessions || [])].reverse();

  const filteredSessions = sortedSessions.filter(session => {
    const matchesSearch = search
      ? session.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        String(session.id).includes(search)
      : true;
    const matchesStatus = filterStatus !== "all" ? session.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    refetch();
    toast({ title: "تم التحديث", description: "تم تحديث سجل الطلبات" });
  };

  const viewDetails = (order: any) => {
    setSelectedOrder(order);
    setIsEditMode(false);
    setIsDetailOpen(true);
  };

  const editOrder = (order: any) => {
    setSelectedOrder(order);
    setEditCustomerName(order.customerName || "");
    setEditPaymentMethod(order.paymentMethod || "none");
    setEditStatus(order.status || "completed");
    setIsEditMode(true);
    setIsDetailOpen(true);
  };

  const refreshSelectedOrder = () => {
    refetch().then(result => {
      if (selectedOrder && result.data) {
        const updated = result.data.find((s: any) => s.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    });
  };

  const handleSaveChanges = () => {
    if (!selectedOrder) return;
    updateSession.mutate({
      id: selectedOrder.id,
      customerName: editCustomerName,
      paymentMethod: editPaymentMethod === "none" ? null : editPaymentMethod,
      status: editStatus,
    }, {
      onSuccess: () => {
        toast({ title: "تم الحفظ", description: "تم حفظ التعديلات بنجاح" });
        refreshSelectedOrder();
        setIsEditMode(false);
      },
      onError: () => {
        toast({ title: "خطأ", description: "فشل في حفظ التعديلات", variant: "destructive" });
      }
    });
  };

  const handleDeleteOrder = () => {
    if (!orderToDelete) return;
    deleteSession.mutate(orderToDelete.id, {
      onSuccess: () => {
        toast({ title: "تم الحذف", description: "تم حذف الطلب بنجاح" });
        setDeleteDialogOpen(false);
        setOrderToDelete(null);
        if (isDetailOpen && selectedOrder?.id === orderToDelete.id) {
          setIsDetailOpen(false);
        }
      },
      onError: () => {
        toast({ title: "خطأ", description: "فشل في حذف الطلب", variant: "destructive" });
      }
    });
  };

  const handleAddItemToOrder = (itemId: number) => {
    if (!selectedOrder) return;
    addItem.mutate({ sessionId: selectedOrder.id, itemId, quantity: 1 }, {
      onSuccess: () => {
        toast({ title: "تمت الإضافة", description: "تمت إضافة الصنف للطلب" });
        setAddItemDialogOpen(false);
        refreshSelectedOrder();
      }
    });
  };

  const handleUpdateQuantity = (orderItemId: number, newQty: number) => {
    if (!selectedOrder) return;
    if (newQty <= 0) {
      handleRemoveItem(orderItemId);
      return;
    }
    updateItem.mutate({ sessionId: selectedOrder.id, itemId: orderItemId, quantity: newQty }, {
      onSuccess: () => refreshSelectedOrder()
    });
  };

  const handleRemoveItem = (orderItemId: number) => {
    if (!selectedOrder) return;
    deleteItem.mutate({ sessionId: selectedOrder.id, itemId: orderItemId }, {
      onSuccess: () => {
        toast({ title: "تم الحذف", description: "تم حذف الصنف من الطلب" });
        refreshSelectedOrder();
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-500 px-2.5 py-1 rounded-lg text-xs font-bold">
            <CheckCircle className="w-3 h-3" /> مكتمل
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-lg text-xs font-bold">
            لم يتم الدفع
          </span>
        );
    }
  };

  const getPaymentLabel = (method: string | null) => {
    if (!method) return "لم يتم الدفع";
    switch (method) {
      case "cash": return "كاش";
      case "card": return "بطاقة";
      case "vodafone_cash": return "فودافون كاش";
      default: return method;
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const filteredMenuItems = items?.filter(item =>
    (selectedCategoryId ? item.categoryId === selectedCategoryId : true) &&
    (itemSearch ? item.name.toLowerCase().includes(itemSearch.toLowerCase()) : true)
  );

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-3xl font-black">سجل الطلبات</h1>
          <Button variant="outline" onClick={handleRefresh} className="h-12 px-4 rounded-xl">
            <RefreshCw className="w-5 h-5 ml-2" /> تحديث
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="بحث باسم العميل أو رقم الطلب..."
              className="pr-10 h-11 rounded-xl bg-card border-border/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: "all", label: "الكل" },
              { value: "completed", label: "مكتمل" },
            ].map(btn => (
              <Button
                key={btn.value}
                variant={filterStatus === btn.value ? "default" : "outline"}
                className={`h-11 px-5 rounded-xl font-bold ${filterStatus === btn.value ? "glow-primary" : "border-border/50"}`}
                onClick={() => setFilterStatus(btn.value)}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
              <h3 className="text-2xl font-black mt-1">{allSessions?.length || 0}</h3>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">مكتملة</p>
              <h3 className="text-2xl font-black text-green-500 mt-1">{allSessions?.filter(s => s.status === "completed").length || 0}</h3>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">إجمالي الدخل</p>
              <h3 className="text-2xl font-black text-primary mt-1">
                {allSessions?.filter(s => s.status === "completed").reduce((sum, s) => sum + (s.total || 0), 0) || 0} ج.م
              </h3>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="bg-card/50 border-border/50 backdrop-blur">
          <CardContent className="p-0">
            <div className="rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-right w-16">#</TableHead>
                    <TableHead className="text-right">العميل</TableHead>
                    <TableHead className="text-right">الموظف</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">طريقة الدفع</TableHead>
                    <TableHead className="text-right">الإجمالي</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right w-32">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        لا توجد طلبات
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSessions.map(session => (
                      <TableRow key={session.id} className="hover:bg-muted/20">
                        <TableCell className="font-bold text-muted-foreground">#{session.id}</TableCell>
                        <TableCell className="font-bold">{session.customerName}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {staffList?.find(s => s.id === session.staffId)?.name || '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell>
                          <span className="bg-muted/50 px-2 py-1 rounded text-xs font-bold">
                            {getPaymentLabel(session.paymentMethod)}
                          </span>
                        </TableCell>
                        <TableCell className="text-primary font-bold">{session.total || 0} ج.م</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {formatDate(session.endTime || session.startTime)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => viewDetails(session)} title="عرض التفاصيل">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500" onClick={() => editOrder(session)} title="تعديل الطلب">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setOrderToDelete(session); setDeleteDialogOpen(true); }} title="حذف الطلب">
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-card border-border/50">
            <DialogHeader>
              <DialogTitle>تأكيد الحذف</DialogTitle>
              <DialogDescription>
                هل أنت متأكد من حذف الطلب #{orderToDelete?.id} ({orderToDelete?.customerName})؟ سيتم حذف جميع الأصناف المرتبطة به.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
              <Button variant="destructive" onClick={handleDeleteOrder} disabled={deleteSession.isPending}>
                {deleteSession.isPending ? "جاري الحذف..." : "حذف الطلب"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Order Detail / Edit Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) {
            setIsEditMode(false);
            refetch();
          }
        }}>
          <DialogContent className="bg-card border-border/50 max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  {isEditMode ? <Edit3 className="w-5 h-5 text-amber-500" /> : <Eye className="w-5 h-5 text-primary" />}
                  {isEditMode ? "تعديل" : "تفاصيل"} الطلب #{selectedOrder?.id}
                </DialogTitle>
                {!isEditMode && (
                  <Button variant="outline" size="sm" className="text-amber-500 border-amber-500/30 hover:bg-amber-500/10 rounded-lg" onClick={() => editOrder(selectedOrder)}>
                    <Edit3 className="w-4 h-4 ml-1" /> تعديل
                  </Button>
                )}
              </div>
            </DialogHeader>
            {selectedOrder && (
              <div className="flex-1 overflow-y-auto" style={{ maxHeight: "calc(85vh - 120px)" }}>
                <div className="space-y-4 py-2">
                  {isEditMode ? (
                    /* Edit Mode Fields */
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-muted-foreground">اسم العميل</Label>
                        <Input
                          value={editCustomerName}
                          onChange={(e) => setEditCustomerName(e.target.value)}
                          className="h-10 rounded-lg bg-background"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-muted-foreground">طريقة الدفع</Label>
                          <Select value={editPaymentMethod} onValueChange={setEditPaymentMethod}>
                            <SelectTrigger className="h-10 rounded-lg bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">لم يتم الدفع</SelectItem>
                              <SelectItem value="cash">كاش</SelectItem>
                              <SelectItem value="card">بطاقة</SelectItem>
                              <SelectItem value="vodafone_cash">فودافون كاش</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-muted-foreground">حالة الطلب</Label>
                          <Select value={editStatus} onValueChange={setEditStatus}>
                            <SelectTrigger className="h-10 rounded-lg bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="completed">مكتمل (تم الدفع)</SelectItem>
                              <SelectItem value="active">لم يتم الدفع بعد</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/30 p-3 rounded-xl">
                        <p className="text-xs text-muted-foreground">العميل</p>
                        <p className="font-bold">{selectedOrder.customerName}</p>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-xl">
                        <p className="text-xs text-muted-foreground">الموظف</p>
                        <p className="font-bold">{staffList?.find(s => s.id === selectedOrder.staffId)?.name || '-'}</p>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-xl">
                        <p className="text-xs text-muted-foreground">الحالة</p>
                        <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-xl">
                        <p className="text-xs text-muted-foreground">طريقة الدفع</p>
                        <p className="font-bold">{getPaymentLabel(selectedOrder.paymentMethod)}</p>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-sm text-muted-foreground">الأصناف المطلوبة</h4>
                      {isEditMode && (
                        <Button
                          size="sm"
                          className="h-8 px-3 rounded-lg text-xs font-bold"
                          onClick={() => { setItemSearch(""); setSelectedCategoryId(null); setAddItemDialogOpen(true); }}
                        >
                          <Plus className="w-3.5 h-3.5 ml-1" /> إضافة صنف
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((orderItem: any) => {
                          const itemName = items?.find(i => i.id === orderItem.itemId)?.name || orderItem.item?.name || "صنف محذوف";
                          return (
                            <div key={orderItem.id} className="flex justify-between items-center bg-background p-3 rounded-xl border border-border/50">
                              <div className="flex-1 min-w-0">
                                <span className="font-bold">{itemName}</span>
                                <span className="text-muted-foreground text-sm mr-2">x{orderItem.quantity}</span>
                              </div>
                              {isEditMode ? (
                                <div className="flex items-center gap-1.5">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg"
                                    onClick={() => handleUpdateQuantity(orderItem.id, orderItem.quantity - 1)}
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </Button>
                                  <span className="w-6 text-center font-bold text-sm">{orderItem.quantity}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg"
                                    onClick={() => handleUpdateQuantity(orderItem.id, orderItem.quantity + 1)}
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleRemoveItem(orderItem.id)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-primary font-bold">{orderItem.priceAtTime * orderItem.quantity} ج.م</span>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-muted-foreground text-sm text-center py-4">لا توجد أصناف</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-border/50">
                    <span className="text-lg font-bold">الإجمالي</span>
                    <span className="text-2xl font-black text-primary">{selectedOrder.total || 0} ج.م</span>
                  </div>

                  {/* Save Button */}
                  {isEditMode && (
                    <Button
                      className="w-full h-12 rounded-xl font-bold text-base glow-primary"
                      onClick={handleSaveChanges}
                      disabled={updateSession.isPending}
                    >
                      <Save className="w-5 h-5 ml-2" />
                      {updateSession.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Item Dialog - with native scrolling */}
        <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
          <DialogContent className="bg-card border-border/50 max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>إضافة صنف للطلب</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث عن صنف..."
                  className="pr-9 h-10 rounded-xl bg-background border-border/50"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategoryId === null ? "default" : "outline"}
                  size="sm"
                  className="rounded-lg text-xs h-8"
                  onClick={() => setSelectedCategoryId(null)}
                >
                  الكل
                </Button>
                {categories?.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategoryId === cat.id ? "default" : "outline"}
                    size="sm"
                    className="rounded-lg text-xs h-8"
                    onClick={() => setSelectedCategoryId(cat.id)}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>
            {/* Use native overflow-y-auto instead of ScrollArea for mouse wheel support */}
            <div ref={itemsListRef} className="flex-1 overflow-y-auto mt-3" style={{ maxHeight: "350px" }}>
              <div className="grid grid-cols-2 gap-2 pb-2">
                {filteredMenuItems?.map(item => (
                  <Button
                    key={item.id}
                    variant="outline"
                    className="h-auto p-3 rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 flex flex-col items-center gap-1"
                    onClick={() => handleAddItemToOrder(item.id)}
                  >
                    <span className="font-bold text-sm truncate w-full text-center">{item.name}</span>
                    <span className="text-primary font-bold text-xs">{item.price} ج.م</span>
                  </Button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
