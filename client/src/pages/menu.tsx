import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useItems, useCreateItem, useDeleteItem } from "@/hooks/use-items";
import { useCategories } from "@/hooks/use-categories";
import { Plus, Trash2, Edit } from "lucide-react";

export default function MenuManagement() {
  const { data: items, isLoading: itemsLoading } = useItems();
  const { data: categories } = useCategories();
  
  const createItem = useCreateItem();
  const deleteItem = useDeleteItem();

  const [isOpen, setIsOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", price: "", categoryId: "" });

  const handleCreate = () => {
    createItem.mutate({
      name: newItem.name,
      price: parseInt(newItem.price),
      categoryId: parseInt(newItem.categoryId)
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setNewItem({ name: "", price: "", categoryId: "" });
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black">إدارة القائمة</h1>
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
                  حفظ الصنف
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle>الأصناف المتاحة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/50 overflow-hidden bg-background/50">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">القسم</TableHead>
                    <TableHead className="text-right">السعر</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">جاري التحميل...</TableCell></TableRow>
                  ) : items?.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">لا توجد أصناف</TableCell></TableRow>
                  ) : (
                    items?.map(item => (
                      <TableRow key={item.id} className="hover:bg-muted/20">
                        <TableCell className="font-bold">{item.name}</TableCell>
                        <TableCell>{categories?.find(c => c.id === item.categoryId)?.name || '-'}</TableCell>
                        <TableCell className="text-primary font-bold">{item.price} ج.م</TableCell>
                        <TableCell className="text-left">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if(confirm('هل أنت متأكد من الحذف؟')) deleteItem.mutate(item.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
