import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import Unauthorized from "./pages/Unauthorized";
// ProtectedRoute component using RoleContext
const ProtectedRoute = ({ page, children }: { page: string; children: React.ReactNode }) => {
  const { hasAccess } = useRole();
  if (!hasAccess(page)) return <Navigate to="/unauthorized" replace />;
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
import FacilityAddPage from "./pages/facilities/components/EntitiesAddPage";
import EntitiesListPage from "./pages/facilities/components/EntitiesListPage";
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
import IncidentlistPage from "./pages/reports/components/IncidentlistPage";
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
            {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}
            {/* Protected Routes with AppLayout */}
            <Route path="/*" element={
              <AppLayout>
                <Routes>
                  {/* School Admin: dashboard, reports, assessments (list/add) */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute page="overview">
                      <Overview />
                    </ProtectedRoute>
                  } />
                  <Route path="/onboard" element={
                    <ProtectedRoute page="onboard">
                      <Onboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/onboarded-schools" element={
                    <ProtectedRoute page="onboard">
                      <OnboardedSchoolList />
                    </ProtectedRoute>
                  } />

                  <Route path ="/facilities/add" element={
                    <ProtectedRoute page="entities">
                      <FacilityAddPage />
                    </ProtectedRoute>
                  } />
                  <Route path ="/entities" element={
                    <ProtectedRoute page="entities">
                      <EntitiesListPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/assessment" element={
                    <ProtectedRoute page="assessment">
                      <RoleBasedAssessmentPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/maintenance/assessment" element={
                    <ProtectedRoute page="assessment">
                      <RoleBasedAssessmentPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/assessment/report" element={
                    <ProtectedRoute page="school_form">
                      <SafetyReportPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/school-metrics" element={
                    <ProtectedRoute page="school_form">
                      <SchoolFormListPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/school-metrics/add" element={
                    <ProtectedRoute page="school_form">
                      <SchoolFormAddPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/incidents" element={
                    <ProtectedRoute page="reports">
                      <IncidentlistPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Assesments Routes*/}
                  <Route path="/assessments/add" element={
                    <ProtectedRoute page="assessment">
                      <AssessmentAdd />
                    </ProtectedRoute>
                  } />
                  <Route path="/assessments/edit/:id" element={
                    <ProtectedRoute page="assessment">
                      <AssessmentAdd />
                    </ProtectedRoute>
                  } />
                  <Route path="/assessments/review" element={
                    <ProtectedRoute page="review">
                      <AssessmentReviewPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/review" element={
                    <ProtectedRoute page="review">
                      <SafetyReviewPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/assessments/view/:id" element ={
                    <ProtectedRoute page="review">
                      <AssessmentViewPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/maintenance/reports" element={
                    <ProtectedRoute page="reports">
                      <MaintenanceAssessmentReportPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/reports" element={
                    <ProtectedRoute page="reports">
                      <SafetyReportsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/termly-dates" element={
                    <ProtectedRoute page="term_dates">
                      <TermDateListPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/termly-dates/add" element={
                    <ProtectedRoute page="term_dates">
                      <TermDates />
                    </ProtectedRoute>
                  } />
                  {/* Users routes */}
                  <Route path="/users" element={
                    <ProtectedRoute page="user_management">
                      <Users />
                    </ProtectedRoute>
                  } />
                  <Route path="/roles" element={
                    <ProtectedRoute page="user_management">
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
