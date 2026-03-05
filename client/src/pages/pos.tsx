import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useItems } from "@/hooks/use-items";
import { useCategories } from "@/hooks/use-categories";
import { useSessions, useCreateSession, useAddSessionItem, useUpdateSessionItem, useDeleteSessionItem, useCheckoutSession } from "@/hooks/use-sessions";
import { useCustomers } from "@/hooks/use-customers";
import { useStaff } from "@/hooks/use-staff";
import { Plus, Minus, Trash2, Search, CreditCard, Banknote, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function POS() {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Form states
  const [newSessionCustomer, setNewSessionCustomer] = useState("");
  const [newSessionStaff, setNewSessionStaff] = useState("");
  const [checkoutMethod, setCheckoutMethod] = useState("cash");

  const { toast } = useToast();

  const { data: items } = useItems();
  const { data: categories } = useCategories();
  const { data: sessions } = useSessions("active");
  const { data: customers } = useCustomers();
  const { data: staff } = useStaff();

  const createSession = useCreateSession();
  const addItem = useAddSessionItem();
  const updateItem = useUpdateSessionItem();
  const deleteItem = useDeleteSessionItem();
  const checkout = useCheckoutSession();

  const activeSession = sessions?.find(s => s.id === activeSessionId) || sessions?.[0];

  const filteredItems = items?.filter(item => 
    (activeCategoryId ? item.categoryId === activeCategoryId : true) &&
    (searchQuery ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : true)
  );

  const handleCreateSession = async () => {
    if (!newSessionCustomer || !newSessionStaff) {
      toast({ title: "خطأ", description: "يرجى اختيار العميل والموظف", variant: "destructive" });
      return;
    }
    createSession.mutate({
      customerName: newSessionCustomer,
      customerId: parseInt(newSessionCustomer) || undefined, // Simple handling for demo
      staffId: parseInt(newSessionStaff),
      status: "active"
    }, {
      onSuccess: (data) => {
        setActiveSessionId(data.id);
        setIsNewSessionOpen(false);
      }
    });
  };

  const handleItemClick = (itemId: number) => {
    if (!activeSession) {
      toast({ title: "تنبيه", description: "يرجى فتح طلب جديد أولاً", variant: "default" });
      setIsNewSessionOpen(true);
      return;
    }
    
    const existingItem = activeSession.items?.find(i => i.itemId === itemId);
    if (existingItem) {
      updateItem.mutate({ sessionId: activeSession.id, itemId: existingItem.id, quantity: existingItem.quantity + 1 });
    } else {
      addItem.mutate({ sessionId: activeSession.id, itemId, quantity: 1 });
    }
  };

  const handleCheckout = () => {
    if (!activeSession) return;
    checkout.mutate({ id: activeSession.id, paymentMethod: checkoutMethod }, {
      onSuccess: () => {
        toast({ title: "تم الدفع", description: "تم إنهاء الطلب بنجاح", className: "bg-primary text-primary-foreground" });
        setIsCheckoutOpen(false);
        setActiveSessionId(null);
      }
    });
  };

  const orderTotal = activeSession?.items?.reduce((acc, curr) => acc + (curr.priceAtTime * curr.quantity), 0) || 0;

  return (
    <Layout>
      <div className="flex h-[calc(100vh-8rem)] gap-6 animate-in fade-in duration-300">
        
        {/* Left Side - Menu Grid */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Categories & Search */}
          <div className="flex items-center justify-between gap-4 shrink-0">
            <ScrollArea className="w-full whitespace-nowrap" orientation="horizontal">
              <div className="flex w-max space-x-2 space-x-reverse p-1">
                <Button
                  variant={activeCategoryId === null ? "default" : "outline"}
                  onClick={() => setActiveCategoryId(null)}
                  className={`rounded-full px-6 h-12 text-base font-bold ${activeCategoryId === null ? 'shadow-md glow-primary' : 'bg-card'}`}
                >
                  الكل
                </Button>
                {categories?.map(cat => (
                  <Button
                    key={cat.id}
                    variant={activeCategoryId === cat.id ? "default" : "outline"}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`rounded-full px-6 h-12 text-base font-bold ${activeCategoryId === cat.id ? 'shadow-md glow-primary' : 'bg-card'}`}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            
            <div className="relative w-64 shrink-0">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="بحث عن صنف..." 
                className="pl-4 pr-10 h-12 rounded-full bg-card border-border/50 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Items Grid */}
          <ScrollArea className="flex-1 pr-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
              {filteredItems?.map(item => (
                <Card 
                  key={item.id}
                  className="cursor-pointer hover:shadow-xl hover:border-primary/50 transition-all duration-200 overflow-hidden bg-card/80 border-border/50 group touch-target aspect-square flex flex-col"
                  onClick={() => handleItemClick(item.id)}
                >
                  <div className="flex-1 flex items-center justify-center p-4 bg-muted/30 group-hover:bg-primary/5 transition-colors">
                    {/* Placeholder for item image if we had them, using icon/text for now */}
                    <span className="text-5xl opacity-20 group-hover:text-primary group-hover:opacity-40 transition-colors">☕</span>
                  </div>
                  <div className="p-4 border-t border-border/50 bg-card">
                    <h3 className="font-bold text-foreground truncate">{item.name}</h3>
                    <p className="text-primary font-black mt-1">{item.price} ج.م</p>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Side - Cart / Active Session */}
        <Card className="w-96 flex flex-col bg-card/90 backdrop-blur border-border/50 shadow-2xl shrink-0 overflow-hidden">
          {activeSession ? (
            <>
              {/* Cart Header */}
              <div className="p-6 border-b border-border/50 bg-muted/20">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold">طلب حالي #{activeSession.id}</h3>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => setActiveSessionId(null)}>إلغاء التحديد</Button>
                </div>
                <div className="text-sm text-muted-foreground flex gap-2">
                  <span className="bg-background px-2 py-1 rounded-md border border-border">عميل: {activeSession.customerName}</span>
                  <span className="bg-background px-2 py-1 rounded-md border border-border">بواسطة: {staff?.find(s => s.id === activeSession.staffId)?.name || 'غير محدد'}</span>
                </div>
              </div>

              {/* Cart Items */}
              <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-3">
                  {activeSession.items?.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <p>الطلب فارغ</p>
                      <p className="text-sm mt-1">اختر أصناف من القائمة للبدء</p>
                    </div>
                  ) : (
                    activeSession.items?.map(orderItem => (
                      <div key={orderItem.id} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50 hover:border-primary/30 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-bold">{items?.find(i => i.id === orderItem.itemId)?.name}</h4>
                          <p className="text-primary font-semibold text-sm">{orderItem.priceAtTime * orderItem.quantity} ج.م</p>
                        </div>
                        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-foreground hover:text-primary hover:bg-background rounded-md"
                            onClick={() => {
                              if (orderItem.quantity > 1) {
                                updateItem.mutate({ sessionId: activeSession.id, itemId: orderItem.id, quantity: orderItem.quantity - 1 });
                              } else {
                                deleteItem.mutate({ sessionId: activeSession.id, itemId: orderItem.id });
                              }
                            }}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-6 text-center font-bold">{orderItem.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-foreground hover:text-primary hover:bg-background rounded-md"
                            onClick={() => updateItem.mutate({ sessionId: activeSession.id, itemId: orderItem.id, quantity: orderItem.quantity + 1 })}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Cart Footer */}
              <div className="p-6 border-t border-border/50 bg-background/50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-medium text-muted-foreground">الإجمالي</span>
                  <span className="text-3xl font-black text-primary">{orderTotal} <span className="text-lg font-bold">ج.م</span></span>
                </div>
                <Button 
                  className="w-full h-16 text-xl font-bold rounded-2xl glow-primary"
                  disabled={!activeSession.items?.length || checkout.isPending}
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  إتمام الدفع
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-transparent to-muted/10">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <UtensilsCrossed className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold mb-2">لا يوجد طلب محدد</h3>
              <p className="text-muted-foreground mb-8">اختر طلباً حالياً أو قم بإنشاء طلب جديد للبدء</p>
              
              <Button 
                size="lg" 
                className="w-full h-14 rounded-xl text-lg glow-primary"
                onClick={() => setIsNewSessionOpen(true)}
              >
                <Plus className="w-5 h-5 ml-2" /> طلب جديد
              </Button>

              {sessions && sessions.length > 0 && (
                <div className="w-full mt-8 text-right">
                  <h4 className="font-bold text-muted-foreground mb-4">الطلبات النشطة</h4>
                  <div className="flex flex-col gap-2">
                    {sessions.map(s => (
                      <Button 
                        key={s.id} 
                        variant="outline" 
                        className="justify-start h-12 border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                        onClick={() => setActiveSessionId(s.id)}
                      >
                        طلب #{s.id} - {s.customerName}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* New Session Dialog */}
        <Dialog open={isNewSessionOpen} onOpenChange={setIsNewSessionOpen}>
          <DialogContent className="sm:max-w-md bg-card border-border/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">بدء طلب جديد</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-6 py-4">
              <div className="space-y-2">
                <Label className="text-base">العميل</Label>
                <Input 
                  placeholder="اسم العميل (أو اكتب 'زائر')" 
                  value={newSessionCustomer}
                  onChange={(e) => setNewSessionCustomer(e.target.value)}
                  className="h-12 bg-background border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base">الموظف (الكابتن)</Label>
                <Select value={newSessionStaff} onValueChange={setNewSessionStaff}>
                  <SelectTrigger className="h-12 bg-background border-border/50">
                    <SelectValue placeholder="اختر الموظف المسؤول" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff?.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name} ({s.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleCreateSession} 
                className="w-full h-14 text-lg font-bold rounded-xl mt-4 glow-primary"
                disabled={createSession.isPending}
              >
                {createSession.isPending ? "جاري الإنشاء..." : "فتح الطلب"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Checkout Dialog */}
        <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
          <DialogContent className="sm:max-w-md bg-card border-border/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">إتمام الدفع</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-6 py-4 text-center">
              <div className="bg-background rounded-2xl p-6 border border-border/50">
                <p className="text-muted-foreground mb-2">المبلغ المطلوب</p>
                <h2 className="text-5xl font-black text-primary">{orderTotal} <span className="text-xl">ج.م</span></h2>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base block text-right">طريقة الدفع</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button 
                    variant={checkoutMethod === 'cash' ? 'default' : 'outline'}
                    className={`h-20 flex-col gap-2 rounded-xl ${checkoutMethod === 'cash' ? 'glow-primary' : 'bg-background'}`}
                    onClick={() => setCheckoutMethod('cash')}
                  >
                    <Banknote className="w-6 h-6" /> كاش
                  </Button>
                  <Button 
                    variant={checkoutMethod === 'card' ? 'default' : 'outline'}
                    className={`h-20 flex-col gap-2 rounded-xl ${checkoutMethod === 'card' ? 'glow-primary' : 'bg-background'}`}
                    onClick={() => setCheckoutMethod('card')}
                  >
                    <CreditCard className="w-6 h-6" /> بطاقة
                  </Button>
                  <Button 
                    variant={checkoutMethod === 'vodafone_cash' ? 'default' : 'outline'}
                    className={`h-20 flex-col gap-2 rounded-xl ${checkoutMethod === 'vodafone_cash' ? 'glow-primary text-xs' : 'bg-background text-xs'}`}
                    onClick={() => setCheckoutMethod('vodafone_cash')}
                  >
                    <Smartphone className="w-6 h-6" /> فودافون كاش
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleCheckout} 
                className="w-full h-16 text-xl font-bold rounded-xl mt-4 glow-primary"
                disabled={checkout.isPending}
              >
                {checkout.isPending ? "جاري التنفيذ..." : "تأكيد الدفع"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </Layout>
  );
}
