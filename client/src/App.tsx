import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "./pages/auth-page";

// Pages
import Dashboard from "./pages/dashboard";
import POS from "./pages/pos";
import MenuManagement from "./pages/menu";
import Customers from "./pages/customers";
import Staff from "./pages/staff";
import Reports from "./pages/reports";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage}/>
      <Route path="/" component={Dashboard}/>
      <Route path="/pos" component={POS}/>
      <Route path="/menu" component={MenuManagement}/>
      <Route path="/customers" component={Customers}/>
      <Route path="/staff" component={Staff}/>
      <Route path="/reports" component={Reports}/>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div dir="rtl" className="h-full w-full">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
