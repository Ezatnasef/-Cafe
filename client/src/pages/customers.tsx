import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useCustomers, useCreateCustomer } from "@/hooks/use-customers";
import { Plus, Star } from "lucide-react";

export default function Customers() {
  const { data: customers, isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();

  const [isOpen, setIsOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", notes: "", isRegular: false });

  const handleCreate = () => {
    createCustomer.mutate(newCustomer, {
      onSuccess: () => {
        setIsOpen(false);
        setNewCustomer({ name: "", notes: "", isRegular: false });
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black">العملاء</h1>
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
                  حفظ العميل
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">جاري التحميل...</TableCell></TableRow>
                  ) : customers?.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">لا يوجد عملاء</TableCell></TableRow>
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
                        <TableCell className="text-muted-foreground">{customer.notes || '-'}</TableCell>
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
