// import React, { useState, useEffect } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { useRole } from '@/contexts/RoleContext';
// import { getDashboardData } from '../core/_request';
// import { getSchoolMetrics } from '../../assements/core/_request';
// import { DashboardResponse } from '../core/_models';
// import { SchoolMetric } from '../../assements/core/_model';
// import countiesData from '@/constants/data.json';
// import { School, Users, FileText, TrendingUp, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';
//
// import Box from '@mui/material/Box';
// import { default as MuiTable } from '@mui/material/Table';
// import TableBody from '@mui/material/TableBody';
// import TableCell from '@mui/material/TableCell';
// import TableContainer from '@mui/material/TableContainer';
// import TableHead from '@mui/material/TableHead';
// import TablePagination from '@mui/material/TablePagination';
// import TableRow from '@mui/material/TableRow';
// import TableSortLabel from '@mui/material/TableSortLabel';
// import Paper from '@mui/material/Paper';
// import { visuallyHidden } from '@mui/utils';
//
// // Kenya county code to name mapping from data.json
// const countiesTable = countiesData.find((item: any) => item.type === 'table' && item.name === 'counties');
// const counties = countiesTable?.data || [];
// const countyCodeToName: Record<string, string> = counties.reduce((acc: Record<string, string>, county: any) => {
//     acc[county.county_id] = county.county_name;
//     return acc;
// }, {});
//
// // Mock data for different levels
// const countyData = [
//     { name: 'Nairobi', schools: 245, assessments: 180, approved: 125, pending: 35, rejected: 20 },
//     { name: 'Mombasa', schools: 178, assessments: 134, approved: 98, pending: 28, rejected: 8 },
//     { name: 'Kisumu', schools: 156, assessments: 112, approved: 89, pending: 15, rejected: 8 },
//     { name: 'Nakuru', schools: 189, assessments: 145, approved: 102, pending: 31, rejected: 12 },
// ];
//
// const schoolAssessmentData = [
//     { month: 'Jan', completed: 45, pending: 12, score: 85 },
//     { month: 'Feb', completed: 52, pending: 8, score: 87 },
//     { month: 'Mar', completed: 38, pending: 15, score: 82 },
//     { month: 'Apr', completed: 61, pending: 6, score: 89 },
//     { month: 'May', completed: 49, pending: 11, score: 86 },
//     { month: 'Jun', completed: 55, pending: 9, score: 88 },
// ];
//
// // --- Table Helper Types and Functions ---
//
// interface ProblemItem {
//     item_name: string;
//     status: string;
//     count: number;
//     school_name: string;
// }
//
// type Order = 'asc' | 'desc';
//
// function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
//     if (b[orderBy] < a[orderBy]) {
//         return -1;
//     }
//     if (b[orderBy] > a[orderBy]) {
//         return 1;
//     }
//     return 0;
// }
//
// function getComparator<Key extends keyof any>(
//     order: Order,
//     orderBy: Key,
// ): (
//     a: { [key in Key]: number | string },
//     b: { [key in Key]: number | string },
// ) => number {
//     return order === 'desc'
//         ? (a, b) => descendingComparator(a, b, orderBy)
//         : (a, b) => -descendingComparator(a, b, orderBy);
// }
//
// interface ProblemHeadCell {
//     id: keyof ProblemItem;
//     label: string;
//     numeric: boolean;
// }
//
// const problemHeadCells: readonly ProblemHeadCell[] = [
//     { id: 'school_name', numeric: false, label: 'School Name' },
//     { id: 'item_name', numeric: false, label: 'Item Name' },
//     { id: 'count', numeric: true, label: 'Count' },
//     { id: 'status', numeric: false, label: 'Status' },
// ];
//
// interface EnhancedTableProps {
//     onRequestSort: (event: React.MouseEvent<unknown>, property: keyof ProblemItem) => void;
//     order: Order;
//     orderBy: string;
// }
//
// function EnhancedTableHead(props: EnhancedTableProps) {
//     const { order, orderBy, onRequestSort } = props;
//     const createSortHandler =
//         (property: keyof ProblemItem) => (event: React.MouseEvent<unknown>) => {
//             onRequestSort(event, property);
//         };
//
//     return (
//         <TableHead>
//             <TableRow className="bg-muted/50">
//                 {problemHeadCells.map((headCell) => (
//                     <TableCell
//                         key={headCell.id}
//                         align={headCell.numeric ? 'right' : 'left'}
//                         sortDirection={orderBy === headCell.id ? order : false}
//                         className="font-bold"
//                     >
//                         <TableSortLabel
//                             active={orderBy === headCell.id}
//                             direction={orderBy === headCell.id ? order : 'asc'}
//                             onClick={createSortHandler(headCell.id)}
//                         >
//                             {headCell.label}
//                             {orderBy === headCell.id ? (
//                                 <Box component="span" sx={visuallyHidden}>
//                                     {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
//                                 </Box>
//                             ) : null}
//                         </TableSortLabel>
//                     </TableCell>
//                 ))}
//             </TableRow>
//         </TableHead>
//     );
// }
//
//
// const Overview = () => {
//     const { currentUser } = useRole();
//     const [schoolMetricsData, setSchoolMetricsData] = useState<SchoolMetric[] | null>(null);
//     const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
//
//     const [performanceScores, setPerformanceScores] = useState({
//         lowest_safety_scores: [],
//         highest_safety_scores: [],
//         lowest_maintenance_scores: [],
//         highest_maintenance_scores: []
//     });
//
//     const [topProblemAreas, setTopProblemAreas] = useState<{maintenance: ProblemItem[], safety: ProblemItem[]}>({
//         maintenance: [],
//         safety: []
//     });
//
//     // State for Maintenance Table
//     const [maintOrder, setMaintOrder] = React.useState<Order>('desc');
//     const [maintOrderBy, setMaintOrderBy] = React.useState<keyof ProblemItem>('count');
//     const [maintPage, setMaintPage] = React.useState(0);
//     const [maintRowsPerPage, setMaintRowsPerPage] = React.useState(5);
//
//     // State for Safety Table
//     const [safetyOrder, setSafetyOrder] = React.useState<Order>('desc');
//     const [safetyOrderBy, setSafetyOrderBy] = React.useState<keyof ProblemItem>('count');
//     const [safetyPage, setSafetyPage] = React.useState(0);
//     const [safetyRowsPerPage, setSafetyRowsPerPage] = React.useState(5);
//
//
//     const getDashboardType = () => {
//         if (currentUser.permissions?.includes('view_national_dashboard')) return 'ministry_admin';
//         if (currentUser.permissions?.includes('view_county_dashboard') || currentUser.permissions?.includes('view_ward_dashboard')) return 'agent';
//         if (currentUser.permissions?.includes('view_school_dashboard')) return 'school_admin';
//         return currentUser.role;
//     };
//
//     const dashboardType = getDashboardType();
//
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 if (dashboardType === 'ministry_admin' || dashboardType === 'agent' || dashboardType === 'school_admin') {
//                     const response = await getDashboardData();
//                     if (response.status === 'success') {
//                         setDashboardData(response);
//                         if (response.data?.lowest_safety_scores || response.data?.highest_safety_scores ||
//                             response.data?.lowest_maintenance_scores || response.data?.highest_maintenance_scores) {
//                             setPerformanceScores({
//                                 lowest_safety_scores: response.data.lowest_safety_scores || [],
//                                 highest_safety_scores: response.data.highest_safety_scores || [],
//                                 lowest_maintenance_scores: response.data.lowest_maintenance_scores || [],
//                                 highest_maintenance_scores: response.data.highest_maintenance_scores || []
//                             });
//                         }
//                         if (response.data?.top_problem_areas) {
//                             setTopProblemAreas(response.data.top_problem_areas);
//                         }
//                     }
//                 }
//                 if (dashboardType === 'ministry_admin') {
//                     const response = await getSchoolMetrics();
//                     if (response.status === 'success') {
//                         setSchoolMetricsData(response.data);
//                     }
//                 }
//             } catch (error) {
//                 console.error('Failed to fetch data', error);
//             }
//         };
//         fetchData();
//     }, [dashboardType]);
//
//     const getOverviewTitle = () => {
//         switch (dashboardType) {
//             case 'ministry_admin':
//                 return dashboardData?.title || 'National Overview';
//             case 'agent':
//                 if (dashboardData && dashboardData.title) {
//                     const titleMatch = dashboardData.title.match(/County Dashboard:\s*(\d+)/);
//                     if (titleMatch) {
//                         const countyCode = titleMatch[1];
//                         const countyName = countyCodeToName[countyCode] || `County ${countyCode}`;
//                         return `County Dashboard: ${countyName}`;
//                     }
//                     return dashboardData.title;
//                 } else {
//                     const code = (currentUser as any).county_code || currentUser.county_code || currentUser.county_name;
//                     const countyName = countyCodeToName[String(code)] || 'Unknown';
//                     return `${countyName} County Overview`;
//                 }
//             case 'school_admin':
//                 return `${dashboardData?.institution_name || currentUser.institution_name} Overview`;
//             default:
//                 return 'Overview';
//         }
//     };
//
//     const getKPIData = () => {
//         switch (dashboardType) {
//             case 'ministry_admin':
//                 if (dashboardData) {
//                     return [
//                         { title: 'Total Institutions', value: dashboardData.data.metrics_kpis.total_institutions.value.toString(), icon: School, trend: dashboardData.data.metrics_kpis.total_institutions.vs_last_month, color: 'text-primary' },
//                         { title: 'Total Students', value: dashboardData.data.metrics_kpis.total_students.value.toString(), icon: Users, trend: dashboardData.data.metrics_kpis.total_students.vs_last_month, color: 'text-success' },
//                         { title: 'Total Teachers', value: dashboardData.data.metrics_kpis.total_teachers.value.toString(), icon: Users, trend: dashboardData.data.metrics_kpis.total_teachers.vs_last_month, color: 'text-info' },
//                         { title: 'Total Assessments', value: dashboardData.data.metrics_kpis.total_assessments.value.toString(), icon: FileText, trend: dashboardData.data.metrics_kpis.total_assessments.vs_last_month, color: 'text-warning' },
//                         { title: 'Safety Assessments', value: dashboardData.data.metrics_kpis.total_safety_assessments.value.toString(), icon: CheckCircle, trend: dashboardData.data.metrics_kpis.total_safety_assessments.vs_last_month, color: 'text-primary' },
//                         { title: 'Safety Score', value: dashboardData.data.metrics_kpis.safety_score.value.toString(), icon: TrendingUp, trend: dashboardData.data.metrics_kpis.safety_score.vs_last_month, color: 'text-success' },
//                         { title: 'Maintenance Assessments', value: dashboardData.data.metrics_kpis.total_maintenance_assessments.value.toString(), icon: AlertTriangle, trend: dashboardData.data.metrics_kpis.total_maintenance_assessments.vs_last_month, color: 'text-info' },
//                         { title: 'Maintenance Score', value: dashboardData.data.metrics_kpis.maintenance_score.value.toString(), icon: TrendingUp, trend: dashboardData.data.metrics_kpis.maintenance_score.vs_last_month, color: 'text-info' },
//                         { title: 'Completed Maintenance', value: dashboardData.data.metrics_kpis.completed_maintenance.value.toString(), icon: CheckCircle, trend: dashboardData.data.metrics_kpis.completed_maintenance.vs_last_month, color: 'text-primary' },
//                         { title: 'High Priority Maintenance', value: dashboardData.data.metrics_kpis.high_priority_maintenance.value.toString(), icon: AlertTriangle, trend: dashboardData.data.metrics_kpis.high_priority_maintenance.vs_last_month, color: 'text-destructive' },
//                     ];
//                 } else if (schoolMetricsData) {
//                     const totalInstitutions = new Set(schoolMetricsData.map(m => m.institution_id)).size;
//                     const totalStudents = schoolMetricsData.reduce((sum, m) => sum + m.students_count, 0);
//                     const totalTeachers = schoolMetricsData.reduce((sum, m) => sum + m.teachers_count, 0);
//                     return [
//                         { title: 'Total Institutions', value: totalInstitutions.toString(), icon: School, trend: '+0', color: 'text-primary' },
//                         { title: 'Total Students', value: totalStudents.toString(), icon: Users, trend: '+0', color: 'text-success' },
//                         { title: 'Total Teachers', value: totalTeachers.toString(), icon: Users, trend: '+0', color: 'text-info' },
//                         { title: 'Avg Score', value: '86.5', icon: TrendingUp, trend: '+2.3', color: 'text-warning' },
//                     ];
//                 } else {
//                     return [
//                         { title: 'Total Institutions', value: '1', icon: School, trend: '+100%', color: 'text-primary' },
//                         { title: 'Total Students', value: '0', icon: Users, trend: '0%', color: 'text-success' },
//                         { title: 'Total Teachers', value: '0', icon: Users, trend: '0%', color: 'text-info' },
//                         { title: 'Total Actions', value: '5', icon: FileText, trend: '+100%', color: 'text-warning' },
//                         { title: 'Safety Assessments', value: '2', icon: CheckCircle, trend: '+100%', color: 'text-primary' },
//                         { title: 'Safety Score', value: '50', icon: TrendingUp, trend: 'N/A', color: 'text-success' },
//                         { title: 'Maintenance Assessments', value: '3', icon: AlertTriangle, trend: '+100%', color: 'text-warning' },
//                         { title: 'Maintenance Score', value: '30.8', icon: TrendingUp, trend: 'N/A', color: 'text-info' },
//                         { title: 'Completed Maintenance', value: '0', icon: CheckCircle, trend: '0%', color: 'text-primary' },
//                         { title: 'High Priority Maintenance', value: '0', icon: AlertTriangle, trend: '0%', color: 'text-destructive' },
//                     ];
//                 }
//             case 'agent':
//                 if (dashboardData) {
//                     return [
//                         { title: 'Total Schools', value: dashboardData.data.metrics_kpis.total_schools.value.toString(), icon: School, trend: dashboardData.data.metrics_kpis.total_schools.vs_last_month, color: 'text-primary' },
//                         { title: 'Total Teachers', value: dashboardData.data.metrics_kpis.total_teachers.value.toString(), icon: Users, trend: dashboardData.data.metrics_kpis.total_teachers.vs_last_month, color: 'text-success' },
//                         { title: 'Total Students', value: dashboardData.data.metrics_kpis.total_students.value.toString(), icon: Users, trend: dashboardData.data.metrics_kpis.total_students.vs_last_month, color: 'text-info' },
//                         { title: 'Assessment Coverage', value: dashboardData.data.metrics_kpis.assessment_coverage_percentage.value.toString(), icon: FileText, trend: dashboardData.data.metrics_kpis.assessment_coverage_percentage.vs_last_month, color: 'text-warning' },
//                         { title: 'Total Assessments', value: dashboardData.data.metrics_kpis.total_assessments.value.toString(), icon: FileText, trend: dashboardData.data.metrics_kpis.total_assessments.vs_last_month, color: 'text-warning' },
//                         { title: 'Safety Assessments', value: dashboardData.data.metrics_kpis.total_safety_assessments.value.toString(), icon: CheckCircle, trend: dashboardData.data.metrics_kpis.total_safety_assessments.vs_last_month, color: 'text-primary' },
//                         { title: 'Safety Score', value: dashboardData.data.metrics_kpis.safety_score.value.toString(), icon: TrendingUp, trend: dashboardData.data.metrics_kpis.safety_score.vs_last_month, color: 'text-success' },
//                         { title: 'Maintenance Assessments', value: dashboardData.data.metrics_kpis.total_maintenance_assessments.value.toString(), icon: AlertTriangle, trend: dashboardData.data.metrics_kpis.total_maintenance_assessments.vs_last_month, color: 'text-warning' },
//                         { title: 'Maintenance Score', value: dashboardData.data.metrics_kpis.maintenance_score.value.toString(), icon: TrendingUp, trend: dashboardData.data.metrics_kpis.maintenance_score.vs_last_month, color: 'text-info' },
//                         { title: 'Completed Maintenance', value: dashboardData.data.metrics_kpis.completed_maintenance.value.toString(), icon: CheckCircle, trend: dashboardData.data.metrics_kpis.completed_maintenance.vs_last_month, color: 'text-primary' },
//                         { title: 'High Priority Maintenance', value: dashboardData.data.metrics_kpis.high_priority_maintenance.value.toString(), icon: AlertTriangle, trend: dashboardData.data.metrics_kpis.high_priority_maintenance.vs_last_month, color: 'text-destructive' },
//                     ];
//                 }
//                 return [];
//             case 'school_admin':
//                 if (dashboardData) {
//                     return [
//                         { title: 'Students', value: dashboardData.data.metrics_kpis.students.value.toString(), icon: Users, trend: dashboardData.data.metrics_kpis.students.vs_last_month, color: 'text-primary' },
//                         { title: 'Teachers', value: dashboardData.data.metrics_kpis.teachers.value.toString(), icon: Users, trend: dashboardData.data.metrics_kpis.teachers.vs_last_month, color: 'text-success' },
//                         { title: 'Total Assessments', value: dashboardData.data.metrics_kpis.total_assessments.value.toString(), icon: FileText, trend: dashboardData.data.metrics_kpis.total_assessments.vs_last_month, color: 'text-info' },
//                         { title: 'Safety Assessments', value: dashboardData.data.metrics_kpis.total_safety_assessments.value.toString(), icon: CheckCircle, trend: dashboardData.data.metrics_kpis.total_safety_assessments.vs_last_month, color: 'text-warning' },
//                         { title: 'Safety Score', value: dashboardData.data.metrics_kpis.safety_score.value.toString(), icon: TrendingUp, trend: dashboardData.data.metrics_kpis.safety_score.vs_last_month, color: 'text-primary' },
//                         { title: 'Maintenance Assessments', value: dashboardData.data.metrics_kpis.total_maintenance_assessments.value.toString(), icon: AlertTriangle, trend: dashboardData.data.metrics_kpis.total_maintenance_assessments.vs_last_month, color: 'text-info' },
//                         { title: 'Maintenance Score', value: dashboardData.data.metrics_kpis.maintenance_score.value.toString(), icon: TrendingUp, trend: dashboardData.data.metrics_kpis.maintenance_score.vs_last_month, color: 'text-success' },
//                         { title: 'Completed Maintenance', value: dashboardData.data.metrics_kpis.completed_maintenance.value.toString(), icon: CheckCircle, trend: dashboardData.data.metrics_kpis.completed_maintenance.vs_last_month, color: 'text-warning' },
//                         { title: 'High Priority Maintenance', value: dashboardData.data.metrics_kpis.high_priority_maintenance.value.toString(), icon: AlertTriangle, trend: dashboardData.data.metrics_kpis.high_priority_maintenance.vs_last_month, color: 'text-destructive' },
//                     ];
//                 } else if (schoolMetricsData && currentUser.institution_id) {
//                     const schoolMetrics = schoolMetricsData.filter(m => m.institution_id === currentUser.institution_id);
//                     if (schoolMetrics.length > 0) {
//                         const latest = schoolMetrics.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
//                         return [
//                             { title: 'Students', value: latest.students_count.toString(), icon: Users, trend: '+0', color: 'text-primary' },
//                             { title: 'Teachers', value: latest.teachers_count.toString(), icon: Users, trend: '+0', color: 'text-success' },
//                             { title: 'Assessments', value: '12', icon: FileText, trend: '+3', color: 'text-info' },
//                             { title: 'Score', value: '89.4', icon: TrendingUp, trend: '+3.2', color: 'text-warning' },
//                         ];
//                     }
//                 }
//                 return [
//                     { title: 'Students', value: '0', icon: Users, trend: '0%', color: 'text-primary' },
//                     { title: 'Teachers', value: '0', icon: Users, trend: '0%', color: 'text-success' },
//                     { title: 'Total Actions', value: '5', icon: FileText, trend: '+100%', color: 'text-info' },
//                     { title: 'Safety Assessments', value: '2', icon: CheckCircle, trend: '+100%', color: 'text-warning' },
//                     { title: 'Safety Score', value: '50', icon: TrendingUp, trend: 'N/A', color: 'text-primary' },
//                     { title: 'Maintenance Assessments', value: '3', icon: AlertTriangle, trend: '+100%', color: 'text-info' },
//                     { title: 'Maintenance Score', value: '30.8', icon: TrendingUp, trend: 'N/A', color: 'text-success' },
//                     { title: 'Completed Maintenance', value: '0', icon: CheckCircle, trend: '0%', color: 'text-warning' },
//                     { title: 'High Priority Maintenance', value: '0', icon: AlertTriangle, trend: '0%', color: 'text-destructive' },
//                 ];
//             default:
//                 return [];
//         }
//     };
//
//     const kpiData = getKPIData();
//
//     const performanceData = dashboardData ? dashboardData.data.performance_trends.labels.map((label, i) => ({
//         month: label,
//         completed: dashboardData.data.performance_trends.completion_rate[i],
//         score: dashboardData.data.performance_trends.quality_score[i]
//     })) : schoolAssessmentData;
//
//     const statusData = dashboardData && dashboardData.data.assessment_status_distribution ? dashboardData.data.assessment_status_distribution.map(item => ({
//         name: item.label,
//         value: Array.isArray(item.value) ? item.value.reduce((sum, assessment) => sum + (assessment.count || 0), 0) : item.value,
//         color: item.color
//     })) : [
//         { name: 'Approved', value: 314, color: 'hsl(var(--success))' },
//         { name: 'Pending Review', value: 89, color: 'hsl(var(--warning))' },
//         { name: 'Needs Improvement', value: 48, color: 'hsl(var(--destructive))' },
//         { name: 'Not Assessed', value: 67, color: 'hsl(var(--muted-foreground))' },
//     ];
//
//     const subCountyData = dashboardData && (dashboardData.data.county_performance || dashboardData.data.sub_county_performance || dashboardData.data.institution_performance) ?
//         (dashboardData.data.county_performance || dashboardData.data.sub_county_performance || dashboardData.data.institution_performance).labels.map((label, i) => {
//             const obj: any = { name: countyCodeToName[label] || label };
//             (dashboardData.data.county_performance || dashboardData.data.sub_county_performance || dashboardData.data.institution_performance)!.data.forEach(item => {
//                 obj[item.label] = item.values[i];
//             });
//             return obj;
//         }) :
//         countyData;
//
//     // --- Maintenance Table Logic ---
//     const handleMaintRequestSort = (event: React.MouseEvent<unknown>, property: keyof ProblemItem) => {
//         const isAsc = maintOrderBy === property && maintOrder === 'asc';
//         setMaintOrder(isAsc ? 'desc' : 'asc');
//         setMaintOrderBy(property);
//     };
//
//     const handleMaintChangePage = (event: unknown, newPage: number) => {
//         setMaintPage(newPage);
//     };
//
//     const handleMaintChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
//         setMaintRowsPerPage(parseInt(event.target.value, 10));
//         setMaintPage(0);
//     };
//
//     const visibleMaintRows = React.useMemo(
//         () =>
//             [...topProblemAreas.maintenance]
//                 .sort(getComparator(maintOrder, maintOrderBy))
//                 .slice(maintPage * maintRowsPerPage, maintPage * maintRowsPerPage + maintRowsPerPage),
//         [maintOrder, maintOrderBy, maintPage, maintRowsPerPage, topProblemAreas.maintenance],
//     );
//
//     // --- Safety Table Logic ---
//     const handleSafetyRequestSort = (event: React.MouseEvent<unknown>, property: keyof ProblemItem) => {
//         const isAsc = safetyOrderBy === property && safetyOrder === 'asc';
//         setSafetyOrder(isAsc ? 'desc' : 'asc');
//         setSafetyOrderBy(property);
//     };
//
//     const handleSafetyChangePage = (event: unknown, newPage: number) => {
//         setSafetyPage(newPage);
//     };
//
//     const handleSafetyChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
//         setSafetyRowsPerPage(parseInt(event.target.value, 10));
//         setSafetyPage(0);
//     };
//
//     const visibleSafetyRows = React.useMemo(
//         () =>
//             [...topProblemAreas.safety]
//                 .sort(getComparator(safetyOrder, safetyOrderBy))
//                 .slice(safetyPage * safetyRowsPerPage, safetyPage * safetyRowsPerPage + safetyRowsPerPage),
//         [safetyOrder, safetyOrderBy, safetyPage, safetyRowsPerPage, topProblemAreas.safety],
//     );
//
//
//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h1 className="text-2xl font-bold text-foreground">{getOverviewTitle()}</h1>
//                     <p className="text-muted-foreground">
//                         Monitor and track quality assurance metrics across your jurisdiction
//                     </p>
//                 </div>
//             </div>
//             {/* Performance Scores Charts */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <Card>
//                     <CardHeader className="text-center">
//                         <CardTitle className="flex items-center justify-center space-x-2">
//                             <CheckCircle className="h-5 w-5 text-success" />
//                             <span>Safety Performance Scores</span>
//                         </CardTitle>
//                         <CardDescription>
//                             Lowest and highest safety scores across schools
//                         </CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                         <ResponsiveContainer width="100%" height={400}>
//                             <BarChart
//                                 data={[
//                                     ...performanceScores.lowest_safety_scores.map(item => ({ ...item, type: 'Lowest' })),
//                                     ...performanceScores.highest_safety_scores.map(item => ({ ...item, type: 'Highest' }))
//                                 ]}
//                                 margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
//                             >
//                                 <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
//                                 <XAxis
//                                     dataKey="school_name"
//                                     className="text-muted-foreground"
//                                     fontSize={10}
//                                     angle={-45}
//                                     textAnchor="end"
//                                     height={100}
//                                     interval={0}
//                                     dy={10}
//                                     tickLine={false}
//                                 />
//                                 <YAxis
//                                     className="text-muted-foreground"
//                                     fontSize={12}
//                                     domain={[0, 100]}
//                                 />
//                                 <Tooltip
//                                     contentStyle={{
//                                         backgroundColor: 'hsl(var(--card))',
//                                         border: '1px solid hsl(var(--border))',
//                                         borderRadius: '6px'
//                                     }}
//                                     formatter={(value) => [`${value}%`, 'Score']}
//                                 />
//                                 <Bar
//                                     dataKey="score"
//                                     fill="hsl(var(--success))"
//                                     name="Safety Score"
//                                     maxBarSize={40}
//                                 />
//                             </BarChart>
//                         </ResponsiveContainer>
//                     </CardContent>
//                 </Card>
//
//                 <Card>
//                     <CardHeader className="text-center">
//                         <CardTitle className="flex items-center justify-center space-x-2">
//                             <AlertTriangle className="h-5 w-5 text-destructive" />
//                             <span>Maintenance Performance Scores</span>
//                         </CardTitle>
//                         <CardDescription>
//                             Lowest and highest maintenance scores across schools
//                         </CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                         <ResponsiveContainer width="100%" height={400}>
//                             <BarChart
//                                 data={[
//                                     ...performanceScores.lowest_maintenance_scores.map(item => ({ ...item, type: 'Lowest' })),
//                                     ...performanceScores.highest_maintenance_scores.map(item => ({ ...item, type: 'Highest' }))
//                                 ]}
//                                 margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
//                             >
//                                 <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
//                                 <XAxis
//                                     dataKey="school_name"
//                                     className="text-muted-foreground"
//                                     fontSize={10}
//                                     angle={-45}
//                                     textAnchor="end"
//                                     height={100}
//                                     interval={0}
//                                     dy={10}
//                                     tickLine={false}
//                                 />
//                                 <YAxis
//                                     className="text-muted-foreground"
//                                     fontSize={12}
//                                     domain={[0, 100]}
//                                 />
//                                 <Tooltip
//                                     contentStyle={{
//                                         backgroundColor: 'hsl(var(--card))',
//                                         border: '1px solid hsl(var(--border))',
//                                         borderRadius: '6px'
//                                     }}
//                                     formatter={(value) => [`${value}%`, 'Score']}
//                                 />
//                                 <Bar
//                                     dataKey="score"
//                                     fill="hsl(var(--destructive))"
//                                     name="Maintenance Score"
//                                     maxBarSize={40}
//                                 />
//                             </BarChart>
//                         </ResponsiveContainer>
//                     </CardContent>
//                 </Card>
//             </div>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {/* Assessment Status Distribution */}
//                 {/* <Card>
//             <CardHeader className="text-center">
//               <CardTitle className="flex items-center justify-center space-x-2">
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
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card> */}
//                 {(dashboardType === 'ministry_admin' || dashboardType === 'agent') && (
//                     <Card>
//                         <CardHeader className="text-center">
//                             <CardTitle className="flex items-center justify-center space-x-2">
//                                 <BarChart3 className="h-5 w-5 text-primary" />
//                                 <span>
//                 {dashboardType === 'ministry_admin' ? 'County Performance' :
//                     dashboardData?.data?.institution_performance ? 'Institution Performance' :
//                         'Sub-County Performance'}
//               </span>
//                             </CardTitle>
//                             <CardDescription>
//                                 Assessment metrics across different regions
//                             </CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                             <ResponsiveContainer width="100%" height={500}>
//                                 <BarChart
//                                     data={subCountyData}
//                                     barCategoryGap="20%"
//                                     barGap={4}
//                                     margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
//                                 >
//                                     <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
//                                     <XAxis
//                                         dataKey="name"
//                                         className="text-muted-foreground"
//                                         fontSize={10}
//                                         angle={-45}
//                                         textAnchor="end"
//                                         height={100}
//                                         interval={0}
//                                         dy={10}
//                                         tickLine={false}
//                                     />
//                                     <YAxis className="text-muted-foreground" fontSize={12} />
//                                     <Tooltip
//                                         contentStyle={{
//                                             backgroundColor: 'hsl(var(--card))',
//                                             border: '1px solid hsl(var(--border))',
//                                             borderRadius: '6px'
//                                         }}
//                                     />
//                                     {dashboardData && (dashboardData.data.county_performance || dashboardData.data.sub_county_performance || dashboardData.data.institution_performance) &&
//                                         (dashboardData.data.county_performance || dashboardData.data.sub_county_performance || dashboardData.data.institution_performance).data.map(item => (
//                                             <Bar
//                                                 key={item.label}
//                                                 dataKey={item.label}
//                                                 fill={item.color}
//                                                 name={item.label}
//                                                 maxBarSize={40}
//                                             />
//                                         ))}
//                                 </BarChart>
//                             </ResponsiveContainer>
//                         </CardContent>
//                     </Card>
//                 )}
//                 {/* Performance Trends */}
//                 <Card>
//                     <CardHeader className="text-center">
//                         <CardTitle className="flex items-center justify-center space-x-2">
//                             <TrendingUp className="h-5 w-5 text-info" />
//                             <span>Performance Trends</span>
//                         </CardTitle>
//                         <CardDescription>
//                             Assessment completion and quality scores over time
//                         </CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                         <ResponsiveContainer width="100%" height={300}>
//                             <LineChart data={performanceData}>
//                                 <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
//                                 <XAxis
//                                     dataKey="month"
//                                     className="text-muted-foreground"
//                                     fontSize={12}
//                                 />
//                                 <YAxis className="text-muted-foreground" fontSize={12} />
//                                 <Tooltip
//                                     contentStyle={{
//                                         backgroundColor: 'hsl(var(--card))',
//                                         border: '1px solid hsl(var(--border))',
//                                         borderRadius: '6px'
//                                     }}
//                                 />
//                                 <Line
//                                     type="monotone"
//                                     dataKey="completed"
//                                     stroke="hsl(var(--primary))"
//                                     strokeWidth={2}
//                                     name="Completed"
//                                 />
//                                 <Line
//                                     type="monotone"
//                                     dataKey="score"
//                                     stroke="hsl(var(--success))"
//                                     strokeWidth={2}
//                                     name="Average Score"
//                                 />
//                             </LineChart>
//                         </ResponsiveContainer>
//                     </CardContent>
//                 </Card>
//             </div>
//
//             {/* KPI Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 {kpiData.map((kpi, index) => (
//                     <Card key={index} className="relative overflow-hidden">
//                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                             <CardTitle className="text-sm font-medium text-muted-foreground">
//                                 {kpi.title}
//                             </CardTitle>
//                             <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
//                         </CardHeader>
//                         <CardContent>
//                             <div className="flex items-center space-x-2">
//                                 <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
//                                 <Badge
//                                     variant="secondary"
//                                     className={`text-xs ${
//                                         kpi.trend.startsWith('+')
//                                             ? 'text-success border-success/20 bg-success/10'
//                                             : 'text-muted-foreground'
//                                     }`}
//                                 >
//                                     {kpi.trend !== '0' && kpi.trend}
//                                 </Badge>
//                             </div>
//                             <p className="text-xs text-muted-foreground mt-1">
//                                 {kpi.trend.startsWith('+') ? 'vs last month' : 'no change'}
//                             </p>
//                         </CardContent>
//                     </Card>
//                 ))}
//             </div>
//
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {/* Top Maintenance Problems */}
//                 <Card>
//                     <CardHeader className="text-center">
//                         <CardTitle className="flex items-center justify-center space-x-2">
//                             <AlertTriangle className="h-5 w-5 text-destructive" />
//                             <span>Top Maintenance Problems</span>
//                         </CardTitle>
//                         <CardDescription>
//                             Most common maintenance issues across schools
//                         </CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                         <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }} elevation={0} className="border">
//                             <TableContainer>
//                                 <MuiTable>
//                                     <EnhancedTableHead
//                                         order={maintOrder}
//                                         orderBy={maintOrderBy}
//                                         onRequestSort={handleMaintRequestSort}
//                                     />
//                                     <TableBody>
//                                         {visibleMaintRows.map((row, index) => (
//                                             <TableRow hover key={index}>
//                                                 <TableCell>{row.school_name}</TableCell>
//                                                 <TableCell>{row.item_name}</TableCell>
//                                                 <TableCell align="right">{row.count}</TableCell>
//                                                 <TableCell>
//                                                     <Badge
//                                                         variant="outline"
//                                                         className={`text-xs ${
//                                                             row.status === 'Urgent Attention' ? 'border-red-500 text-red-500' :
//                                                                 row.status === 'Attention Required' ? 'border-yellow-500 text-yellow-500' :
//                                                                     'border-green-500 text-green-500'
//                                                         }`}
//                                                     >
//                                                         {row.status}
//                                                     </Badge>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))}
//                                     </TableBody>
//                                 </MuiTable>
//                             </TableContainer>
//                             <TablePagination
//                                 rowsPerPageOptions={[5, 10, 25]}
//                                 component="div"
//                                 count={topProblemAreas.maintenance.length}
//                                 rowsPerPage={maintRowsPerPage}
//                                 page={maintPage}
//                                 onPageChange={handleMaintChangePage}
//                                 onRowsPerPageChange={handleMaintChangeRowsPerPage}
//                             />
//                         </Paper>
//                     </CardContent>
//                 </Card>
//
//                 {/* Top Safety Problems */}
//                 <Card>
//                     <CardHeader className="text-center">
//                         <CardTitle className="flex items-center justify-center space-x-2">
//                             <CheckCircle className="h-5 w-5 text-success" />
//                             <span>Top Safety Problems</span>
//                         </CardTitle>
//                         <CardDescription>
//                             Most common safety issues across schools
//                         </CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                         <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }} elevation={0} className="border">
//                             <TableContainer>
//                                 <MuiTable>
//                                     <EnhancedTableHead
//                                         order={safetyOrder}
//                                         orderBy={safetyOrderBy}
//                                         onRequestSort={handleSafetyRequestSort}
//                                     />
//                                     <TableBody>
//                                         {visibleSafetyRows.map((row, index) => (
//                                             <TableRow hover key={index}>
//                                                 <TableCell>{row.school_name}</TableCell>
//                                                 <TableCell>{row.item_name}</TableCell>
//                                                 <TableCell align="right">{row.count}</TableCell>
//                                                 <TableCell>
//                                                     <Badge
//                                                         variant="outline"
//                                                         className={`text-xs ${
//                                                             row.status === 'Urgent Attention' ? 'border-red-500 text-red-500' :
//                                                                 row.status === 'Attention Required' ? 'border-yellow-500 text-yellow-500' :
//                                                                     'border-green-500 text-green-500'
//                                                         }`}
//                                                     >
//                                                         {row.status}
//                                                     </Badge>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))}
//                                     </TableBody>
//                                 </MuiTable>
//                             </TableContainer>
//                             <TablePagination
//                                 rowsPerPageOptions={[5, 10, 25]}
//                                 component="div"
//                                 count={topProblemAreas.safety.length}
//                                 rowsPerPage={safetyRowsPerPage}
//                                 page={safetyPage}
//                                 onPageChange={handleSafetyChangePage}
//                                 onRowsPerPageChange={handleSafetyChangeRowsPerPage}
//                             />
//                         </Paper>
//                     </CardContent>
//                 </Card>
//             </div>
//         </div>
//     );
// };
//
// export default Overview;
