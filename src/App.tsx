import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleProvider } from "@/contexts/RoleContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Overview from "./pages/dashboard/components/OverviewPage";
import Onboard from "./pages/onboarding/components/OnboardPage";
import RoleBasedAssessmentPage from "./pages/assements/components/RoleBasedAssessmentPage";
import AssessmentAdd from "./pages/assements/components/AssessmentAddPage";
import Reports from "./pages/dashboard/components/ReportsPage";
import Users from "./pages/settings/components/UsersPage";
import RolesPermissions from "./pages/settings/components/RolesPermissionsPage";
import LoginPage from "./pages/auth/components/loginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RoleProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LoginPage />} />
            
            {/* Protected Routes with AppLayout */}
            <Route path="/*" element={
              <AppLayout>
                <Routes>
                  <Route path="/dashboard" element={<Overview />} />
                  <Route path="/onboard" element={<Onboard />} />
                  <Route path="/assessment" element={<RoleBasedAssessmentPage />} />
                  <Route path="/assessments" element={<RoleBasedAssessmentPage />} />
                  <Route path="/assessments/add" element={<AssessmentAdd />} />
                  <Route path="/assessments/edit/:id" element={<AssessmentAdd />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/roles" element={<RolesPermissions />} />
                  <Route path="/system-safety" element={<div className="p-6"><h1 className="text-2xl font-bold">System Safety</h1><p className="text-muted-foreground">System safety features coming soon...</p></div>} />
                  <Route path="/backup" element={<div className="p-6"><h1 className="text-2xl font-bold">Backup & Recovery</h1><p className="text-muted-foreground">Backup management coming soon...</p></div>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </RoleProvider>
  </QueryClientProvider>
);

export default App;
