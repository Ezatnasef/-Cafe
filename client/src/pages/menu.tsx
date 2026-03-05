import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useItems, useCreateItem, useUpdateItem, useDeleteItem } from "@/hooks/use-items";
import { useCategories } from "@/hooks/use-categories";
import { Plus, Trash2, Search, ArrowUpDown, RefreshCw, Edit3, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MenuManagement() {
  const { data: items, isLoading: itemsLoading, refetch } = useItems();
  const { data: categories } = useCategories();
  const { toast } = useToast();

  const createItem = useCreateItem();
  const updateItemMutation = useUpdateItem();
  const deleteItem = useDeleteItem();

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({ name: "", price: "", categoryId: "" });
  const [editItem, setEditItem] = useState({ name: "", price: "", categoryId: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none");

  const handleCreate = () => {
    if (!newItem.name.trim() || !newItem.price || !newItem.categoryId) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول", variant: "destructive" });
      return;
    }
    createItem.mutate({
      name: newItem.name,
      price: parseInt(newItem.price),
      categoryId: parseInt(newItem.categoryId)
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setNewItem({ name: "", price: "", categoryId: "" });
        toast({ title: "تم بنجاح", description: "تمت إضافة الصنف بنجاح" });
      },
      onError: () => {
        toast({ title: "خطأ", description: "فشل في إضافة الصنف", variant: "destructive" });
      }
    });
  };

  const handleEditClick = (item: any) => {
    setSelectedItem(item);
    setEditItem({
      name: item.name,
      price: String(item.price),
      categoryId: String(item.categoryId || ""),
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editItem.name.trim() || !editItem.price) {
      toast({ title: "خطأ", description: "يرجى ملء الاسم والسعر", variant: "destructive" });
      return;
    }
    updateItemMutation.mutate({
      id: selectedItem.id,
      name: editItem.name,
      price: parseInt(editItem.price),
      categoryId: editItem.categoryId ? parseInt(editItem.categoryId) : null,
    }, {
      onSuccess: () => {
        setIsEditOpen(false);
        setSelectedItem(null);
        toast({ title: "تم بنجاح", description: "تم تعديل الصنف بنجاح" });
      },
      onError: () => {
        toast({ title: "خطأ", description: "فشل في تعديل الصنف", variant: "destructive" });
      }
    });
  };

  const handleDeleteClick = (item: any) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    deleteItem.mutate(selectedItem.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedItem(null);
        toast({ title: "تم بنجاح", description: "تم حذف الصنف بنجاح" });
      },
      onError: () => {
        toast({ title: "خطأ", description: "فشل في حذف الصنف", variant: "destructive" });
      }
    });
  };

  const handleRefresh = () => {
    refetch();
    toast({ title: "تم التحديث", description: "تم تحديث قائمة الأصناف" });
  };

  const filteredItems = items?.filter(item =>
    (searchQuery ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : true) &&
    (filterCategory !== "all" ? item.categoryId === parseInt(filterCategory) : true)
  ).sort((a, b) => {
    if (priceSort === "asc") return a.price - b.price;
    if (priceSort === "desc") return b.price - a.price;
    return 0;
  });

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black">إدارة القائمة</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} className="h-12 px-4 rounded-xl">
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 px-6 rounded-xl glow-primary font-bold">
                  <Plus className="w-5 h-5 ml-2" /> إضافة صنف
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border/50">
                <DialogHeader>
                  <DialogTitle>صنف جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>اسم الصنف</Label>
                    <Input
                      value={newItem.name}
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>السعر (ج.م)</Label>
                    <Input
                      type="number"
                      value={newItem.price}
                      onChange={e => setNewItem({...newItem, price: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>القسم</Label>
                    <Select value={newItem.categoryId} onValueChange={v => setNewItem({...newItem, categoryId: v})}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreate} disabled={createItem.isPending} className="w-full mt-4 h-12 rounded-xl">
                    {createItem.isPending ? "جاري الحفظ..." : "حفظ الصنف"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle>الأصناف المتاحة</CardTitle>
            {/* Search and Filter Bar */}
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="بحث سريع عن صنف..."
                  className="pl-3 pr-10 h-11 rounded-xl bg-background border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48 h-11 rounded-xl bg-background border-border">
                  <SelectValue placeholder="كل الأقسام" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأقسام</SelectItem>
                  {categories?.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className={`h-11 px-4 rounded-xl gap-2 ${priceSort !== 'none' ? 'border-primary text-primary' : ''}`}
                onClick={() => setPriceSort(prev => prev === "none" ? "asc" : prev === "asc" ? "desc" : "none")}
              >
                <ArrowUpDown className="w-4 h-4" />
                {priceSort === "none" ? "السعر" : priceSort === "asc" ? "الأرخص أولاً" : "الأغلى أولاً"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/50 overflow-hidden bg-background/50">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">القسم</TableHead>
                    <TableHead className="text-right">السعر</TableHead>
                    <TableHead className="text-left w-24">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">جاري التحميل...</TableCell></TableRow>
                  ) : filteredItems?.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">لا توجد أصناف مطابقة</TableCell></TableRow>
                  ) : (
                    filteredItems?.map(item => (
                      <TableRow key={item.id} className="hover:bg-muted/20">
                        <TableCell className="font-bold max-w-[200px] truncate">{item.name}</TableCell>
                        <TableCell>{categories?.find(c => c.id === item.categoryId)?.name || '-'}</TableCell>
                        <TableCell className="text-primary font-bold">{item.price} ج.م</TableCell>
                        <TableCell className="text-left">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-amber-500 hover:text-amber-500 hover:bg-amber-500/10"
                              onClick={() => handleEditClick(item)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteClick(item)}
                            >
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

        {/* Edit Item Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-card border-border/50">
            <DialogHeader>
              <DialogTitle>تعديل الصنف</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>اسم الصنف</Label>
                <Input
                  value={editItem.name}
                  onChange={e => setEditItem({...editItem, name: e.target.value})}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>السعر (ج.م)</Label>
                <Input
                  type="number"
                  value={editItem.price}
                  onChange={e => setEditItem({...editItem, price: e.target.value})}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>القسم</Label>
                <Select value={editItem.categoryId} onValueChange={v => setEditItem({...editItem, categoryId: v})}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveEdit} disabled={updateItemMutation.isPending} className="w-full mt-4 h-12 rounded-xl font-bold">
                <Save className="w-5 h-5 ml-2" />
                {updateItemMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
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
                هل أنت متأكد من حذف الصنف "{selectedItem?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>إلغاء</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteItem.isPending}>
                {deleteItem.isPending ? "جاري الحذف..." : "حذف"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
