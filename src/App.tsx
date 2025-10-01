import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import Unauthorized from "./pages/Unauthorized";
// ProtectedRoute component using RoleContext
const ProtectedRoute = ({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) => {
  const { currentUser } = useRole();
  if (!currentUser) return <Navigate to="/unauthorized" replace />;
  if (!allowedRoles.includes(currentUser.role)) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
};
import { RoleProvider } from "@/contexts/RoleContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Overview from "./pages/dashboard/components/OverviewPage";
import Onboard from "./pages/onboarding/components/OnboardPage";
import OnboardedSchoolList from "./pages/onboarding/components/OnboardedSchoolList";
import RoleBasedAssessmentPage from "./pages/assements/components/RoleBasedAssessmentsPage";
import AssessmentAdd from "./pages/assements/components/AssessmentAddPage";
import Users from "./pages/settings/components/UsersPage";
// facility 
import FacilityAddPage from "./pages/facilities/components/FacilityAddPage";
import SafetyReportPage from "./pages/assements/components/SafetyReportPage";
import SchoolFormListPage from "./pages/assements/components/SchoolMetricsListPage";
import SchoolFormAddPage from "./pages/assements/components/SchoolMetricsAddPage";
import AssessmentReviewPage from "./pages/assements/components/MaintainanceReviewPage";
import MaintenanceAssessmentReportPage from "./pages/reports/components/MaintenanceReportsPage";
import SafetyReportsPage from "./pages/reports/components/SafetyReports";
import SafetyReviewPage from "./pages/assements/components/SafetyReviewPage";
import AssessmentViewPage from "./pages/assements/components/AssesmentViewPage";
import RolesPermissions from "./pages/settings/components/RolesPermissionsPage";
import TermDates from "./pages/termly_dates/components/TermDatesAddPage";
import TermDateListPage from "./pages/termly_dates/components/TermDateListPage";
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
            <Route path="/unauthorized" element={<Unauthorized />} />
            {/* Protected Routes with AppLayout */}
            <Route path="/*" element={
              <AppLayout>
                <Routes>
                  {/* School Admin: dashboard, reports, assessments (list/add) */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={["school_admin", "agent", "ministry_admin"]}>
                      <Overview />
                    </ProtectedRoute>
                  } />
                  <Route path="/onboard" element={
                    <ProtectedRoute allowedRoles={["ministry_admin", "agent"]}>
                      <Onboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/onboarded-schools" element={
                    <ProtectedRoute allowedRoles={["ministry_admin", "agent"]}>
                      <OnboardedSchoolList />
                    </ProtectedRoute>
                  } />

                  <Route path ="/facilities/add" element={
                    <ProtectedRoute allowedRoles={["school_admin"]}>
                      <FacilityAddPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/assessment" element={
                    <ProtectedRoute allowedRoles={["school_admin", "agent", "ministry_admin"]}>
                      <RoleBasedAssessmentPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/maintenance/assessment" element={
                    <ProtectedRoute allowedRoles={["school_admin", "agent", "ministry_admin"]}>
                      <RoleBasedAssessmentPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/assessment/report" element={
                    <ProtectedRoute allowedRoles={["school_admin"]}>
                      <SafetyReportPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/school-metrics" element={
                    <ProtectedRoute allowedRoles={["school_admin"]}>
                      <SchoolFormListPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/school-metrics/add" element={
                    <ProtectedRoute allowedRoles={["school_admin"]}>
                      <SchoolFormAddPage />
                    </ProtectedRoute>
                  } />

                  
                  
                  {/* Assesments Routes*/}
                  <Route path="/assessments/add" element={
                    <ProtectedRoute allowedRoles={["school_admin", "ministry_admin"]}>
                      <AssessmentAdd />
                    </ProtectedRoute>
                  } />
                  <Route path="/assessments/edit/:id" element={
                    <ProtectedRoute allowedRoles={["school_admin", "ministry_admin"]}>
                      <AssessmentAdd />
                    </ProtectedRoute>
                  } />
                  <Route path="/assessments/review" element={
                    <ProtectedRoute allowedRoles={["agent", "ministry_admin"]}>
                      <AssessmentReviewPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/review" element={
                    <ProtectedRoute allowedRoles={["agent", "ministry_admin"]}>
                      <SafetyReviewPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/assessments/view/:id" element ={
                    <ProtectedRoute allowedRoles={["agent", "ministry_admin"]}>
                      <AssessmentViewPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/maintenance/reports" element={
                    <ProtectedRoute allowedRoles={["agent", "ministry_admin"]}>
                      <MaintenanceAssessmentReportPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/reports" element={
                    <ProtectedRoute allowedRoles={["agent", "ministry_admin"]}>
                      <SafetyReportsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/termly-dates" element={
                    <ProtectedRoute allowedRoles={["agent", "ministry_admin", "school_admin"]}>
                      <TermDateListPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/termly-dates/add" element={
                    <ProtectedRoute allowedRoles={["agent", "ministry_admin"]}>
                      <TermDates />
                    </ProtectedRoute>
                  } />
                  {/* Users routes */}
                  <Route path="/users" element={
                    <ProtectedRoute allowedRoles={["agent", "ministry_admin"]}>
                      <Users />
                    </ProtectedRoute>
                  } />
                  <Route path="/roles" element={
                    <ProtectedRoute allowedRoles={["agent", "ministry_admin"]}>
                      <RolesPermissions />
                    </ProtectedRoute>
                  } />
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
