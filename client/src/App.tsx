import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import CharacterSheet from "@/pages/character-sheet";
import AdminDashboard from "@/pages/admin-dashboard";
import Alleybrary from "@/pages/alleybrary";
import Home from "@/pages/home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/character-sheet/:id" component={CharacterSheet} />
      {/* Fallback for legacy links or direct access */}
      <Route path="/character-sheet" component={CharacterSheet} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/alleybrary" component={Alleybrary} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
