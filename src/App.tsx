import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleProvider } from "@/contexts/RoleContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Overview from "./pages/Overview";
import Onboard from "./pages/Onboard";
import Assessment from "./pages/Assessment";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import RolesPermissions from "./pages/RolesPermissions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RoleProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/onboard" element={<Onboard />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/users" element={<Users />} />
              <Route path="/roles" element={<RolesPermissions />} />
              <Route path="/system-safety" element={<div className="p-6"><h1 className="text-2xl font-bold">System Safety</h1><p className="text-muted-foreground">System safety features coming soon...</p></div>} />
              <Route path="/backup" element={<div className="p-6"><h1 className="text-2xl font-bold">Backup & Recovery</h1><p className="text-muted-foreground">Backup management coming soon...</p></div>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </RoleProvider>
  </QueryClientProvider>
);

export default App;
