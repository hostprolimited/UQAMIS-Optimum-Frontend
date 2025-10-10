// import React, { useState, useEffect } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { useRole } from '@/contexts/RoleContext';
// import { getDashboardData } from '../core/_request';
// import { getSchoolMetrics } from '../../assements/core/_request';
// import { DashboardData } from '../core/_models';
// import { DashboardResponse } from '../core/_models';
// import { SchoolMetric } from '../../assements/core/_model';
// import countiesData from '@/constants/data.json';

// // Kenya county code to name mapping from data.json
// const countiesTable = countiesData.find((item: any) => item.type === 'table' && item.name === 'counties');
// const counties = countiesTable?.data || [];
// const countyCodeToName: Record<string, string> = counties.reduce((acc: Record<string, string>, county: any) => {
//   acc[county.county_id] = county.county_name;
//   return acc;
// }, {});
// import { School, Users, FileText, TrendingUp, CheckCircle, AlertTriangle, XCircle, BarChart3 } from 'lucide-react';

// // Mock data for different levels
// const countyData = [
//   { name: 'Nairobi', schools: 245, assessments: 180, approved: 125, pending: 35, rejected: 20 },
//   { name: 'Mombasa', schools: 178, assessments: 134, approved: 98, pending: 28, rejected: 8 },
//   { name: 'Kisumu', schools: 156, assessments: 112, approved: 89, pending: 15, rejected: 8 },
//   { name: 'Nakuru', schools: 189, assessments: 145, approved: 102, pending: 31, rejected: 12 },
// ];

// const schoolAssessmentData = [
//   { month: 'Jan', completed: 45, pending: 12, score: 85 },
//   { month: 'Feb', completed: 52, pending: 8, score: 87 },
//   { month: 'Mar', completed: 38, pending: 15, score: 82 },
//   { month: 'Apr', completed: 61, pending: 6, score: 89 },
//   { month: 'May', completed: 49, pending: 11, score: 86 },
//   { month: 'Jun', completed: 55, pending: 9, score: 88 },
// ];

// const statusData = [
//   { name: 'Approved', value: 314, color: 'hsl(var(--success))' },
//   { name: 'Pending Review', value: 89, color: 'hsl(var(--warning))' },
//   { name: 'Needs Improvement', value: 48, color: 'hsl(var(--destructive))' },
//   { name: 'Not Assessed', value: 67, color: 'hsl(var(--muted-foreground))' },
// ];

// const Overview = () => {
//   const { currentUser } = useRole();
//   // const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
//   const [schoolMetricsData, setSchoolMetricsData] = useState<SchoolMetric[] | null>(null);
//   const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);

//   const getDashboardType = () => {
//     if (currentUser.permissions?.includes('view_national_dashboard')) return 'ministry_admin';
//     if (currentUser.permissions?.includes('view_county_dashboard') || currentUser.permissions?.includes('view_ward_dashboard')) return 'agent';
//     if (currentUser.permissions?.includes('view_school_dashboard')) return 'school_admin';
//     // fallback to role
//     return currentUser.role;
//   };

//   const dashboardType = getDashboardType();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (dashboardType === 'ministry_admin' || dashboardType === 'agent' || dashboardType === 'school_admin') {
//           const response = await getDashboardData();
//           if (response.status === 'success') {
//             setDashboardData(response);
//           }
//         }
//         if (dashboardType === 'ministry_admin') {
//           const response = await getSchoolMetrics();
//           if (response.status === 'success') {
//             setSchoolMetricsData(response.data);
//           }
//         }
//       } catch (error) {
//         console.error('Failed to fetch data', error);
//       }
//     };
//     fetchData();
//   }, [dashboardType]);

//   const getOverviewTitle = () => {
//     switch (dashboardType) {
//       case 'ministry_admin':
//         if (dashboardData && dashboardData.title) {
//           return dashboardData.title;
//         } else {
//           return 'National Overview';
//         }
//       case 'agent':
//         if (dashboardData && dashboardData.title) {
//           // Extract county code from title like "County Dashboard: 12"
//           const titleMatch = dashboardData.title.match(/County Dashboard:\s*(\d+)/);
//           if (titleMatch) {
//             const countyCode = titleMatch[1];
//             const countyName = countyCodeToName[countyCode] || `County ${countyCode}`;
//             return `County Dashboard: ${countyName}`;
//           }
//           return dashboardData.title;
//         } else {
//           const code = (currentUser as any).county_code || currentUser.county_code || currentUser.county_name;
//           const countyName = countyCodeToName[String(code)] || 'Unknown';
//           return `${countyName} County Overview`;
//         }
//       case 'school_admin':
//         return `${dashboardData?.institution_name || currentUser.institution_name} Overview`;
//       default:
//         return 'Overview';
//     }
//   };

//    const getKPIData = () => {
//        switch (dashboardType) {
//         case 'ministry_admin':
//           if (dashboardData) {
//             return [
//               { title: 'Total Institutions', value: dashboardData.data.metrics_kpis.total_institutions.value.toString(), icon: School, trend: dashboardData.data.metrics_kpis.total_institutions.vs_last_month, color: 'text-primary' },
//               { title: 'Total Students', value: dashboardData.data.metrics_kpis.total_students.value.toString(), icon: Users, trend: dashboardData.data.metrics_kpis.total_students.vs_last_month, color: 'text-success' },
//               { title: 'Total Teachers', value: dashboardData.data.metrics_kpis.total_teachers.value.toString(), icon: Users, trend: dashboardData.data.metrics_kpis.total_teachers.vs_last_month, color: 'text-info' },
//               { title: 'Total Assessments', value: dashboardData.data.metrics_kpis.total_assessments.value.toString(), icon: FileText, trend: dashboardData.data.metrics_kpis.total_assessments.vs_last_month, color: 'text-warning' },
//               { title: 'Safety Assessments', value: dashboardData.data.metrics_kpis.total_safety_assessments.value.toString(), icon: CheckCircle, trend: dashboardData.data.metrics_kpis.total_safety_assessments.vs_last_month, color: 'text-primary' },
//               { title: 'Safety Score', value: dashboardData.data.metrics_kpis.safety_score.value.toString(), icon: TrendingUp, trend: dashboardData.data.metrics_kpis.safety_score.vs_last_month, color: 'text-success' },
//                { title: 'Maintenance Assessments', value: dashboardData.data.metrics_kpis.total_maintenance_assessments.value.toString(), icon: AlertTriangle, trend: dashboardData.data.metrics_kpis.total_maintenance_assessments.vs_last_month, color: 'text-info' },
//               { title: 'Maintenance Score', value: dashboardData.data.metrics_kpis.maintenance_score.value.toString(), icon: TrendingUp, trend: dashboardData.data.metrics_kpis.maintenance_score.vs_last_month, color: 'text-info' },
//               { title: 'Completed Maintenance', value: dashboardData.data.metrics_kpis.completed_maintenance.value.toString(), icon: CheckCircle, trend: dashboardData.data.metrics_kpis.completed_maintenance.vs_last_month, color: 'text-primary' },
//               { title: 'High Priority Maintenance', value: dashboardData.data.metrics_kpis.high_priority_maintenance.value.toString(), icon: AlertTriangle, trend: dashboardData.data.metrics_kpis.high_priority_maintenance.vs_last_month, color: 'text-destructive' },
//             ];
//           } else if (schoolMetricsData) {
//             const totalInstitutions = new Set(schoolMetricsData.map(m => m.institution_id)).size;
//             const totalStudents = schoolMetricsData.reduce((sum, m) => sum + m.students_count, 0);
//             const totalTeachers = schoolMetricsData.reduce((sum, m) => sum + m.teachers_count, 0);
//             return [
//               { title: 'Total Institutions', value: totalInstitutions.toString(), icon: School, trend: '+0', color: 'text-primary' },
//               { title: 'Total Students', value: totalStudents.toString(), icon: Users, trend: '+0', color: 'text-success' },
//               { title: 'Total Teachers', value: totalTeachers.toString(), icon: Users, trend: '+0', color: 'text-info' },
//               { title: 'Avg Score', value: '86.5', icon: TrendingUp, trend: '+2.3', color: 'text-warning' },
//             ];
//           } else {
//             return [
//               { title: 'Total Institutions', value: '1', icon: School, trend: '+100%', color: 'text-primary' },
//               { title: 'Total Students', value: '0', icon: Users, trend: '0%', color: 'text-success' },
//               { title: 'Total Teachers', value: '0', icon: Users, trend: '0%', color: 'text-info' },
//               { title: 'Total Actions', value: '5', icon: FileText, trend: '+100%', color: 'text-warning' },
//               { title: 'Safety Assessments', value: '2', icon: CheckCircle, trend: '+100%', color: 'text-primary' },
//               { title: 'Safety Score', value: '50', icon: TrendingUp, trend: 'N/A', color: 'text-success' },
//               { title: 'Maintenance Assessments', value: '3', icon: AlertTriangle, trend: '+100%', color: 'text-warning' },
//               { title: 'Maintenance Score', value: '30.8', icon: TrendingUp, trend: 'N/A', color: 'text-info' },
//               { title: 'Completed Maintenance', value: '0', icon: CheckCircle, trend: '0%', color: 'text-primary' },
//               { title: 'High Priority Maintenance', value: '0', icon: AlertTriangle, trend: '0%', color: 'text-destructive' },
//             ];
//           }
//         case 'agent':
//           if (dashboardData) {
//             return [
//               { title: 'Total Schools', value: dashboardData.data.metrics_kpis.total_schools.value.toString(), icon: School, trend: dashboardData.data.metrics_kpis.total_schools.vs_last_month, color: 'text-primary' },
//               { title: 'Total Teachers', value: dashboardData.data.metrics_kpis.total_teachers.value.toString(), icon: Users, trend: dashboardData.data.metrics_kpis.total_teachers.vs_last_month, color: 'text-success' },
//               { title: 'Total Students', value: dashboardData.data.metrics_kpis.total_students.value.toString(), icon: Users, trend: dashboardData.data.metrics_kpis.total_students.vs_last_month, color: 'text-info' },
//               { title: 'Assessment Coverage', value: dashboardData.data.metrics_kpis.assessment_coverage_percentage.value.toString(), icon: FileText, trend: dashboardData.data.metrics_kpis.assessment_coverage_percentage.vs_last_month, color: 'text-warning' },
//               { title: 'Assessments Overdue', value: dashboardData.data.metrics_kpis.assessments_overdue.value.toString(), icon: AlertTriangle, trend: dashboardData.data.metrics_kpis.assessments_overdue.vs_last_month, color: 'text-destructive' },
//               { title: 'Avg Time to Complete', value: dashboardData.data.metrics_kpis.avg_time_to_complete_days.value.toString(), icon: TrendingUp, trend: dashboardData.data.metrics_kpis.avg_time_to_complete_days.vs_last_month, color: 'text-info' },
//               { title: 'Total Assessments', value: dashboardData.data.metrics_kpis.total_assessments.value.toString(), icon: FileText, trend: dashboardData.data.metrics_kpis.total_assessments.vs_last_month, color: 'text-warning' },
//               { title: 'Safety Assessments', value: dashboardData.data.metrics_kpis.total_safety_assessments.value.toString(), icon: CheckCircle, trend: dashboardData.data.metrics_kpis.total_safety_assessments.vs_last_month, color: 'text-primary' },
//               { title: 'Safety Score', value: dashboardData.data.metrics_kpis.safety_score.value.toString(), icon: TrendingUp, trend: dashboardData.data.metrics_kpis.safety_score.vs_last_month, color: 'text-success' },
//               { title: 'Maintenance Assessments', value: dashboardData.data.metrics_kpis.total_maintenance_assessments.value.toString(), icon: AlertTriangle, trend: dashboardData.data.metrics_kpis.total_maintenance_assessments.vs_last_month, color: 'text-warning' },
//               { title: 'Maintenance Score', value: dashboardData.data.metrics_kpis.maintenance_score.value.toString(), icon: TrendingUp, trend: dashboardData.data.metrics_kpis.maintenance_score.vs_last_month, color: 'text-info' },
//               { title: 'Completed Maintenance', value: dashboardData.data.metrics_kpis.completed_maintenance.value.toString(), icon: CheckCircle, trend: dashboardData.data.metrics_kpis.completed_maintenance.vs_last_month, color: 'text-primary' },
//               { title: 'High Priority Maintenance', value: dashboardData.data.metrics_kpis.high_priority_maintenance.value.toString(), icon: AlertTriangle, trend: dashboardData.data.metrics_kpis.high_priority_maintenance.vs_last_month, color: 'text-destructive' },
//             ];
//           }
//           return [];
//         case 'school_admin':
//           if (dashboardData) {
//             return [
//               { title: 'Students', value: dashboardData.data.metrics_kpis.students.value.toString(), icon: Users, trend: dashboardData.data.metrics_kpis.students.vs_last_month, color: 'text-primary' },
//               { title: 'Teachers', value: dashboardData.data.metrics_kpis.teachers.value.toString(), icon: Users, trend: dashboardData.data.metrics_kpis.teachers.vs_last_month, color: 'text-success' },
//               { title: 'Total Assessments', value: dashboardData.data.metrics_kpis.total_assessments.value.toString(), icon: FileText, trend: dashboardData.data.metrics_kpis.total_assessments.vs_last_month, color: 'text-info' },
//               { title: 'Safety Assessments', value: dashboardData.data.metrics_kpis.total_safety_assessments.value.toString(), icon: CheckCircle, trend: dashboardData.data.metrics_kpis.total_safety_assessments.vs_last_month, color: 'text-warning' },
//               { title: 'Safety Score', value: dashboardData.data.metrics_kpis.safety_score.value.toString(), icon: TrendingUp, trend: dashboardData.data.metrics_kpis.safety_score.vs_last_month, color: 'text-primary' },
//                { title: 'Maintenance Assessments', value: dashboardData.data.metrics_kpis.total_maintenance_assessments.value.toString(), icon: AlertTriangle, trend: dashboardData.data.metrics_kpis.total_maintenance_assessments.vs_last_month, color: 'text-info' },
//               { title: 'Maintenance Score', value: dashboardData.data.metrics_kpis.maintenance_score.value.toString(), icon: TrendingUp, trend: dashboardData.data.metrics_kpis.maintenance_score.vs_last_month, color: 'text-success' },
//               { title: 'Completed Maintenance', value: dashboardData.data.metrics_kpis.completed_maintenance.value.toString(), icon: CheckCircle, trend: dashboardData.data.metrics_kpis.completed_maintenance.vs_last_month, color: 'text-warning' },
//               { title: 'High Priority Maintenance', value: dashboardData.data.metrics_kpis.high_priority_maintenance.value.toString(), icon: AlertTriangle, trend: dashboardData.data.metrics_kpis.high_priority_maintenance.vs_last_month, color: 'text-destructive' },
//             ];
//           } else if (schoolMetricsData && currentUser.institution_id) {
//             const schoolMetrics = schoolMetricsData.filter(m => m.institution_id === currentUser.institution_id);
//             if (schoolMetrics.length > 0) {
//               // Take the latest by created_at
//               const latest = schoolMetrics.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
//               return [
//                 { title: 'Students', value: latest.students_count.toString(), icon: Users, trend: '+0', color: 'text-primary' },
//                 { title: 'Teachers', value: latest.teachers_count.toString(), icon: Users, trend: '+0', color: 'text-success' },
//                 { title: 'Assessments', value: '12', icon: FileText, trend: '+3', color: 'text-info' },
//                 { title: 'Score', value: '89.4', icon: TrendingUp, trend: '+3.2', color: 'text-warning' },
//               ];
//             }
//           }
//           return [
//             { title: 'Students', value: '0', icon: Users, trend: '0%', color: 'text-primary' },
//             { title: 'Teachers', value: '0', icon: Users, trend: '0%', color: 'text-success' },
//             { title: 'Total Actions', value: '5', icon: FileText, trend: '+100%', color: 'text-info' },
//             { title: 'Safety Assessments', value: '2', icon: CheckCircle, trend: '+100%', color: 'text-warning' },
//             { title: 'Safety Score', value: '50', icon: TrendingUp, trend: 'N/A', color: 'text-primary' },
//                       { title: 'Maintenance Assessments', value: '3', icon: AlertTriangle, trend: '+100%', color: 'text-info' },
//             { title: 'Maintenance Score', value: '30.8', icon: TrendingUp, trend: 'N/A', color: 'text-success' },
//             { title: 'Completed Maintenance', value: '0', icon: CheckCircle, trend: '0%', color: 'text-warning' },
//             { title: 'High Priority Maintenance', value: '0', icon: AlertTriangle, trend: '0%', color: 'text-destructive' },
//           ];
//         default:
//           return [];
//       }
//     };

//   const kpiData = getKPIData();

//   const performanceData = dashboardData ? dashboardData.data.performance_trends.labels.map((label, i) => ({
//     month: label,
//     completed: dashboardData.data.performance_trends.completion_rate[i],
//     score: dashboardData.data.performance_trends.quality_score[i]
//   })) : schoolAssessmentData;

//   const statusData = dashboardData && dashboardData.data.assessment_status_distribution ? dashboardData.data.assessment_status_distribution.map(item => ({
//     name: item.label,
//     value: Array.isArray(item.value) ? item.value.reduce((sum, assessment) => sum + (assessment.count || 0), 0) : item.value,
//     color: item.color
//   })) : [
//     { name: 'Approved', value: 314, color: 'hsl(var(--success))' },
//     { name: 'Pending Review', value: 89, color: 'hsl(var(--warning))' },
//     { name: 'Needs Improvement', value: 48, color: 'hsl(var(--destructive))' },
//     { name: 'Not Assessed', value: 67, color: 'hsl(var(--muted-foreground))' },
//   ];

//   // Prepare assessment details data for the table
//   const assessmentDetailsData = React.useMemo(() => {
//     if (!dashboardData?.data?.assessment_status_distribution) return [];

//     const details: any[] = [];
//     dashboardData.data.assessment_status_distribution.forEach(statusGroup => {
//       if (Array.isArray(statusGroup.value)) {
//         statusGroup.value.forEach(assessment => {
//           details.push({
//             school_name: assessment.school_name,
//             item_description: assessment.item_description,
//             status: assessment.status,
//             count: assessment.count,
//             status_color: statusGroup.color,
//             status_label: statusGroup.label
//           });
//         });
//       }
//     });
//     return details;
//   }, [dashboardData]);

//   const subCountyData = dashboardData && (dashboardData.data.county_performance || dashboardData.data.sub_county_performance || dashboardData.data.institution_performance) ?
//     (dashboardData.data.county_performance || dashboardData.data.sub_county_performance || dashboardData.data.institution_performance).labels.map((label, i) => {
//       const obj: any = { name: countyCodeToName[label] || label };
//       (dashboardData.data.county_performance || dashboardData.data.sub_county_performance || dashboardData.data.institution_performance)!.data.forEach(item => {
//         obj[item.label] = item.values[i];
//       });
//       return obj;
//     }) :
//     countyData;

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-foreground">{getOverviewTitle()}</h1>
//           <p className="text-muted-foreground">
//             Monitor and track quality assurance metrics across your jurisdiction
//           </p>
//         </div>
//         {/* <div className="flex items-center space-x-2">
//           <Badge variant="outline" className="text-sm">
//             Last updated: 2 minutes ago
//           </Badge>
//         </div> */}
//       </div>
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Assessment Status Distribution */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <CheckCircle className="h-5 w-5 text-success" />
//                 <span>Assessment Status Distribution</span>
//               </CardTitle>
//               <CardDescription>
//                 Overview of assessment outcomes across all schools
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={statusData}
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={60}
//                     outerRadius={100}
//                     paddingAngle={5}
//                     dataKey="value"
//                   >
//                     {statusData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//               <div className="grid grid-cols-2 gap-4 mt-4">
//                 {statusData.map((item, index) => (
//                   <div key={index} className="flex items-center space-x-2">
//                     <div
//                       className="w-3 h-3 rounded-full"
//                       style={{ backgroundColor: item.color }}
//                     />
//                     <div className="flex-1">
//                       <p className="text-sm font-medium">{item.name}</p>
//                       <p className="text-xs text-muted-foreground">{item.value} assessments</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>

//         {/* Performance Trends */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <TrendingUp className="h-5 w-5 text-info" />
//               <span>Performance Trends</span>
//             </CardTitle>
//             <CardDescription>
//               Assessment completion and quality scores over time
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={performanceData}>
//                 <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
//                 <XAxis 
//                   dataKey="month" 
//                   className="text-muted-foreground" 
//                   fontSize={12}
//                 />
//                 <YAxis className="text-muted-foreground" fontSize={12} />
//                 <Tooltip 
//                   contentStyle={{ 
//                     backgroundColor: 'hsl(var(--card))',
//                     border: '1px solid hsl(var(--border))',
//                     borderRadius: '6px'
//                   }}
//                 />
//                 <Line 
//                   type="monotone" 
//                   dataKey="completed" 
//                   stroke="hsl(var(--primary))" 
//                   strokeWidth={2}
//                   name="Completed"
//                 />
//                 <Line 
//                   type="monotone" 
//                   dataKey="score" 
//                   stroke="hsl(var(--success))" 
//                   strokeWidth={2}
//                   name="Average Score"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {kpiData.map((kpi, index) => (
//           <Card key={index} className="relative overflow-hidden">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">
//                 {kpi.title}
//               </CardTitle>
//               <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
//             </CardHeader>
//             <CardContent>
//               <div className="flex items-center space-x-2">
//                 <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
//                 <Badge
//                   variant="secondary"
//                   className={`text-xs ${
//                     kpi.trend.startsWith('+')
//                       ? 'text-success border-success/20 bg-success/10'
//                       : 'text-muted-foreground'
//                   }`}
//                 >
//                   {kpi.trend !== '0' && kpi.trend}
//                 </Badge>
//               </div>
//               <p className="text-xs text-muted-foreground mt-1">
//                 {kpi.trend.startsWith('+') ? 'vs last month' : 'no change'}
//               </p>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

      

//       {/* County/Regional Performance (for Admin and County Admin) */}
//       {(dashboardType === 'ministry_admin' || dashboardType === 'agent') && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <BarChart3 className="h-5 w-5 text-primary" />
//               <span>
//                 {dashboardType === 'ministry_admin' ? 'County Performance' :
//                  dashboardData?.data?.institution_performance ? 'Institution Performance' :
//                  'Sub-County Performance'}
//               </span>
//             </CardTitle>
//             <CardDescription>
//               Assessment metrics across different regions
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={500}>
//               <BarChart
//                 data={subCountyData}
//                 barCategoryGap="20%"
//                 barGap={4}
//                 margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
//                 <XAxis
//                   dataKey="name"
//                   className="text-muted-foreground"
//                   fontSize={10}
//                   angle={-45}
//                   textAnchor="end"
//                   height={100}
//                   interval={0}
//                   dy={10}
//                   tickLine={false}
//                 />
//                 <YAxis className="text-muted-foreground" fontSize={12} />
//                 <Tooltip
//                   contentStyle={{
//                     backgroundColor: 'hsl(var(--card))',
//                     border: '1px solid hsl(var(--border))',
//                     borderRadius: '6px'
//                   }}
//                 />
//                 {dashboardData && (dashboardData.data.county_performance || dashboardData.data.sub_county_performance || dashboardData.data.institution_performance) &&
//                   (dashboardData.data.county_performance || dashboardData.data.sub_county_performance || dashboardData.data.institution_performance).data.map(item => (
//                     <Bar
//                       key={item.label}
//                       dataKey={item.label}
//                       fill={item.color}
//                       name={item.label}
//                       maxBarSize={40}
//                     />
//                   ))
//                 }
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       )}

//       {/* Assessment Details Table */}
//       {assessmentDetailsData.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <FileText className="h-5 w-5 text-primary" />
//               <span>Assessment Details</span>
//             </CardTitle>
//             <CardDescription>
//               Detailed breakdown of assessments by school, building parts, and condition
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>School Name</TableHead>
//                     <TableHead>Building Part</TableHead>
//                     <TableHead>Condition</TableHead>
//                     <TableHead>Items Count</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {assessmentDetailsData.map((item, index) => (
//                     <TableRow key={index}>
//                       <TableCell className="font-medium">{item.school_name}</TableCell>
//                       <TableCell>{item.item_description}</TableCell>
//                       <TableCell>
//                         <Badge
//                           variant="outline"
//                           className="text-xs"
//                           style={{
//                             borderColor: item.status_color,
//                             color: item.status_color
//                           }}
//                         >
//                           {item.status}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>{item.count}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Recent Activity */}
//       {/* <Card>
//         <CardHeader>
//           <CardTitle>Recent Activity</CardTitle>
//           <CardDescription>Latest assessment updates and system events</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {[
//               {
//                 icon: CheckCircle,
//                 color: 'text-success',
//                 title: 'Green Valley Primary School',
//                 description: 'Assessment approved with score 92.5',
//                 time: '2 minutes ago'
//               },
//               {
//                 icon: AlertTriangle,
//                 color: 'text-warning',
//                 title: 'St. Mary Secondary School',
//                 description: 'Assessment pending review - missing documentation',
//                 time: '15 minutes ago'
//               },
//               {
//                 icon: FileText,
//                 color: 'text-info',
//                 title: 'Hillside Academy',
//                 description: 'New assessment submitted for review',
//                 time: '1 hour ago'
//               },
//               {
//                 icon: XCircle,
//                 color: 'text-destructive',
//                 title: 'Riverside Primary',
//                 description: 'Assessment requires improvements in safety protocols',
//                 time: '2 hours ago'
//               }
//             ].map((activity, index) => (
//               <div key={index} className="flex items-start space-x-3">
//                 <activity.icon className={`h-5 w-5 mt-0.5 ${activity.color}`} />
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium text-foreground">
//                     {activity.title}
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     {activity.description}
//                   </p>
//                   <p className="text-xs text-muted-foreground mt-1">
//                     {activity.time}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card> */}
//     </div>
//   );
// };

// export default Overview;