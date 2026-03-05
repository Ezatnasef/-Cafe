import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Lock, User, Eye, EyeOff, Coffee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthPageProps {
  onLogin: () => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        onLogin();
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: data.message || "اسم المستخدم أو كلمة المرور غير صحيحة",
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "خطأ",
        description: "فشل الاتصال بالخادم",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  return (
    <div dir="rtl" className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#f5f0e8]">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(184,134,11,0.08),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,90,43,0.06),transparent_50%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-amber-700/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-amber-700/5 rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 shadow-xl shadow-amber-800/20 mb-6">
            <Coffee className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-stone-800 mb-2 tracking-wide">
            Casablanca <span className="text-amber-700">Cafe</span>
          </h1>
          <p className="text-stone-500 text-sm">نظام إدارة الكافيه - تسجيل الدخول</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/80 border-stone-200/80 backdrop-blur-xl shadow-2xl shadow-stone-900/10">
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-stone-600 text-sm font-bold">اسم المستخدم</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    placeholder="أدخل اسم المستخدم"
                    className="bg-stone-50 border-stone-200 text-stone-800 placeholder:text-stone-400 pr-11 h-12 rounded-xl focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-stone-600 text-sm font-bold">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="أدخل كلمة المرور"
                    className="bg-stone-50 border-stone-200 text-stone-800 placeholder:text-stone-400 pr-11 pl-11 h-12 rounded-xl focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    onClick={() => setShowPassword(p => !p)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-lg font-black rounded-xl shadow-lg shadow-amber-700/25 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-stone-400 text-xs mt-6">
          Casablanca Cafe Management System v1.0
        </p>
      </div>
    </div>
  );
}
