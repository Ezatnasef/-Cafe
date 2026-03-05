import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useState } from "react";
import bgImage from "@assets/image_1772678081791.png";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app we'd validate, but for this "Offline/Local" requested feel we'll just go in
    setLocation("/");
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Dark Wash */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>

      <Card className="relative z-10 w-full max-w-md mx-4 bg-transparent border-0 shadow-none">
        <CardContent className="flex flex-col items-center gap-8 pt-6">
          <h1 className="text-4xl font-bold text-white tracking-tight">Casablanca Cafe</h1>
          
          <div className="w-32 h-32 rounded-full bg-blue-600/80 flex items-center justify-center border-4 border-white/20 shadow-2xl">
            <svg viewBox="0 0 24 24" className="w-16 h-16 text-white" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-6">
            <div className="space-y-2">
              <Label className="text-white/80 text-sm font-medium sr-only">Username</Label>
              <Input 
                placeholder="Username" 
                className="bg-transparent border-0 border-b-2 border-white/30 rounded-none text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:border-white h-12 text-lg px-0"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80 text-sm font-medium sr-only">Password</Label>
              <Input 
                type="password"
                placeholder="Password" 
                className="bg-white/10 border-0 rounded-md text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:bg-white/20 h-12 text-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button 
              type="submit"
              className="w-full h-14 bg-blue-700 hover:bg-blue-600 text-white text-xl font-bold rounded-md shadow-lg transition-all active:scale-[0.98]"
            >
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
