import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRole } from '@/contexts/RoleContext';
import { getDashboardData } from '../core/_request';
import { getSchoolMetrics } from '../../assements/core/_request';
import { DashboardData } from '../core/_models';
import { SchoolMetric } from '../../assements/core/_model';
import countiesData from '@/constants/data.json';

// Kenya county code to name mapping from data.json
const countiesTable = countiesData.find((item: any) => item.type === 'table' && item.name === 'counties');
const counties = countiesTable?.data || [];
const countyCodeToName: Record<string, string> = counties.reduce((acc: Record<string, string>, county: any) => {
  acc[county.county_id] = county.county_name;
  return acc;
}, {});
import { School, Users, FileText, TrendingUp, CheckCircle, AlertTriangle, XCircle, BarChart3 } from 'lucide-react';

// Mock data for different levels
const countyData = [
  { name: 'Nairobi', schools: 245, assessments: 180, approved: 125, pending: 35, rejected: 20 },
  { name: 'Mombasa', schools: 178, assessments: 134, approved: 98, pending: 28, rejected: 8 },
  { name: 'Kisumu', schools: 156, assessments: 112, approved: 89, pending: 15, rejected: 8 },
  { name: 'Nakuru', schools: 189, assessments: 145, approved: 102, pending: 31, rejected: 12 },
];

const schoolAssessmentData = [
  { month: 'Jan', completed: 45, pending: 12, score: 85 },
  { month: 'Feb', completed: 52, pending: 8, score: 87 },
  { month: 'Mar', completed: 38, pending: 15, score: 82 },
  { month: 'Apr', completed: 61, pending: 6, score: 89 },
  { month: 'May', completed: 49, pending: 11, score: 86 },
  { month: 'Jun', completed: 55, pending: 9, score: 88 },
];

const statusData = [
  { name: 'Approved', value: 314, color: 'hsl(var(--success))' },
  { name: 'Pending Review', value: 89, color: 'hsl(var(--warning))' },
  { name: 'Needs Improvement', value: 48, color: 'hsl(var(--destructive))' },
  { name: 'Not Assessed', value: 67, color: 'hsl(var(--muted-foreground))' },
];

const Overview = () => {
  const { currentUser } = useRole();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [schoolMetricsData, setSchoolMetricsData] = useState<SchoolMetric[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentUser.role === 'ministry_admin' || currentUser.role === 'agent' || currentUser.role === 'school_admin') {
          const response = await getDashboardData();
          if (response.status === 'success') {
            setDashboardData(response.data);
          }
        }
        if (currentUser.role === 'ministry_admin') {
          const response = await getSchoolMetrics();
          if (response.status === 'success') {
            setSchoolMetricsData(response.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, [currentUser.role]);

  const getOverviewTitle = () => {
    switch (currentUser.role) {
      case 'ministry_admin':
      case 'agent':
      case 'school_admin':
        if (dashboardData && dashboardData.title) {
          return dashboardData.title;
        } else {
          if (currentUser.role === 'ministry_admin') return 'National Overview';
          if (currentUser.role === 'agent') {
            const code = (currentUser as any).county_code || currentUser.county_code || currentUser.county_name;
            const countyName = countyCodeToName[String(code)] || 'Unknown';
            return `${countyName} County Overview`;
          }
          if (currentUser.role === 'school_admin') return `${currentUser.name} Overview`;
        }
      default:
        return 'Overview';
    }
  };

  const getKPIData = () => {
    switch (currentUser.role) {
      case 'ministry_admin':
        if (dashboardData) {
          return [
            { title: 'Total Institutions', value: dashboardData.metrics_kpis.total_institutions.value.toString(), icon: School, trend: dashboardData.metrics_kpis.total_institutions.vs_last_month, color: 'text-primary' },
            { title: 'Total Students', value: dashboardData.metrics_kpis.total_students.value.toString(), icon: Users, trend: dashboardData.metrics_kpis.total_students.vs_last_month, color: 'text-success' },
            { title: 'Total Teachers', value: dashboardData.metrics_kpis.total_teachers.value.toString(), icon: Users, trend: dashboardData.metrics_kpis.total_teachers.vs_last_month, color: 'text-info' },
            { title: 'Total Actions', value: dashboardData.metrics_kpis.total_actions.value.toString(), icon: FileText, trend: dashboardData.metrics_kpis.total_actions.vs_last_month, color: 'text-warning' },
            { title: 'Safety Assessments', value: dashboardData.metrics_kpis.total_safety_assessments.value.toString(), icon: CheckCircle, trend: dashboardData.metrics_kpis.total_safety_assessments.vs_last_month, color: 'text-primary' },
            { title: 'Safety Score', value: dashboardData.metrics_kpis.safety_score.value.toString(), icon: TrendingUp, trend: dashboardData.metrics_kpis.safety_score.vs_last_month, color: 'text-success' },
            { title: 'Maintenance Score', value: dashboardData.metrics_kpis.maintenance_score.value.toString(), icon: TrendingUp, trend: dashboardData.metrics_kpis.maintenance_score.vs_last_month, color: 'text-info' },
            { title: 'Maintenance Requests', value: dashboardData.metrics_kpis.total_maintenance_requests.value.toString(), icon: AlertTriangle, trend: dashboardData.metrics_kpis.total_maintenance_requests.vs_last_month, color: 'text-warning' },
            { title: 'Completed Maintenance', value: dashboardData.metrics_kpis.completed_maintenance.value.toString(), icon: CheckCircle, trend: dashboardData.metrics_kpis.completed_maintenance.vs_last_month, color: 'text-primary' },
            { title: 'High Priority Maintenance', value: dashboardData.metrics_kpis.high_priority_maintenance.value.toString(), icon: AlertTriangle, trend: dashboardData.metrics_kpis.high_priority_maintenance.vs_last_month, color: 'text-destructive' },
          ];
        } else if (schoolMetricsData) {
          const totalInstitutions = new Set(schoolMetricsData.map(m => m.institution_id)).size;
          const totalStudents = schoolMetricsData.reduce((sum, m) => sum + m.students_count, 0);
          const totalTeachers = schoolMetricsData.reduce((sum, m) => sum + m.teachers_count, 0);
          return [
            { title: 'Total Institutions', value: totalInstitutions.toString(), icon: School, trend: '+0', color: 'text-primary' },
            { title: 'Total Students', value: totalStudents.toString(), icon: Users, trend: '+0', color: 'text-success' },
            { title: 'Total Teachers', value: totalTeachers.toString(), icon: Users, trend: '+0', color: 'text-info' },
            { title: 'Avg Score', value: '86.5', icon: TrendingUp, trend: '+2.3', color: 'text-warning' },
          ];
        } else {
          return [
            { title: 'Total Institutions', value: '1', icon: School, trend: '+100%', color: 'text-primary' },
            { title: 'Total Students', value: '0', icon: Users, trend: '0%', color: 'text-success' },
            { title: 'Total Teachers', value: '0', icon: Users, trend: '0%', color: 'text-info' },
            { title: 'Total Actions', value: '5', icon: FileText, trend: '+100%', color: 'text-warning' },
            { title: 'Safety Assessments', value: '2', icon: CheckCircle, trend: '+100%', color: 'text-primary' },
            { title: 'Safety Score', value: '50', icon: TrendingUp, trend: 'N/A', color: 'text-success' },
            { title: 'Maintenance Score', value: '30.8', icon: TrendingUp, trend: 'N/A', color: 'text-info' },
            { title: 'Maintenance Requests', value: '3', icon: AlertTriangle, trend: '+100%', color: 'text-warning' },
            { title: 'Completed Maintenance', value: '0', icon: CheckCircle, trend: '0%', color: 'text-primary' },
            { title: 'High Priority Maintenance', value: '0', icon: AlertTriangle, trend: '0%', color: 'text-destructive' },
          ];
        }
      case 'agent':
        if (dashboardData) {
          return [
            { title: 'Total Schools', value: dashboardData.metrics_kpis.total_schools.value.toString(), icon: School, trend: dashboardData.metrics_kpis.total_schools.vs_last_month, color: 'text-primary' },
            { title: 'Total Teachers', value: dashboardData.metrics_kpis.total_teachers.value.toString(), icon: Users, trend: dashboardData.metrics_kpis.total_teachers.vs_last_month, color: 'text-success' },
            { title: 'Total Students', value: dashboardData.metrics_kpis.total_students.value.toString(), icon: Users, trend: dashboardData.metrics_kpis.total_students.vs_last_month, color: 'text-info' },
            { title: 'Total Actions', value: dashboardData.metrics_kpis.total_actions.value.toString(), icon: FileText, trend: dashboardData.metrics_kpis.total_actions.vs_last_month, color: 'text-warning' },
            { title: 'Safety Assessments', value: dashboardData.metrics_kpis.total_safety_assessments.value.toString(), icon: CheckCircle, trend: dashboardData.metrics_kpis.total_safety_assessments.vs_last_month, color: 'text-primary' },
            { title: 'Safety Score', value: dashboardData.metrics_kpis.safety_score.value.toString(), icon: TrendingUp, trend: dashboardData.metrics_kpis.safety_score.vs_last_month, color: 'text-success' },
            { title: 'Maintenance Score', value: dashboardData.metrics_kpis.maintenance_score.value.toString(), icon: TrendingUp, trend: dashboardData.metrics_kpis.maintenance_score.vs_last_month, color: 'text-info' },
            { title: 'Maintenance Requests', value: dashboardData.metrics_kpis.total_maintenance_requests.value.toString(), icon: AlertTriangle, trend: dashboardData.metrics_kpis.total_maintenance_requests.vs_last_month, color: 'text-warning' },
            { title: 'Completed Maintenance', value: dashboardData.metrics_kpis.completed_maintenance.value.toString(), icon: CheckCircle, trend: dashboardData.metrics_kpis.completed_maintenance.vs_last_month, color: 'text-primary' },
            { title: 'High Priority Maintenance', value: dashboardData.metrics_kpis.high_priority_maintenance.value.toString(), icon: AlertTriangle, trend: dashboardData.metrics_kpis.high_priority_maintenance.vs_last_month, color: 'text-destructive' },
          ];
        } else {
          return [
            { title: 'Total Schools', value: '1', icon: School, trend: '+100%', color: 'text-primary' },
            { title: 'Total Teachers', value: '0', icon: Users, trend: '0%', color: 'text-success' },
            { title: 'Total Students', value: '0', icon: Users, trend: '0%', color: 'text-info' },
            { title: 'Total Actions', value: '5', icon: FileText, trend: '+100%', color: 'text-warning' },
            { title: 'Safety Assessments', value: '2', icon: CheckCircle, trend: '+100%', color: 'text-primary' },
            { title: 'Safety Score', value: '50', icon: TrendingUp, trend: 'N/A', color: 'text-success' },
            { title: 'Maintenance Score', value: '30.8', icon: TrendingUp, trend: 'N/A', color: 'text-info' },
            { title: 'Maintenance Requests', value: '3', icon: AlertTriangle, trend: '+100%', color: 'text-warning' },
            { title: 'Completed Maintenance', value: '0', icon: CheckCircle, trend: '0%', color: 'text-primary' },
            { title: 'High Priority Maintenance', value: '0', icon: AlertTriangle, trend: '0%', color: 'text-destructive' },
          ];
        }
      case 'school_admin':
        if (dashboardData) {
          return [
            { title: 'Students', value: dashboardData.metrics_kpis.students.value.toString(), icon: Users, trend: dashboardData.metrics_kpis.students.vs_last_month, color: 'text-primary' },
            { title: 'Teachers', value: dashboardData.metrics_kpis.teachers.value.toString(), icon: Users, trend: dashboardData.metrics_kpis.teachers.vs_last_month, color: 'text-success' },
            { title: 'Total Actions', value: dashboardData.metrics_kpis.total_actions.value.toString(), icon: FileText, trend: dashboardData.metrics_kpis.total_actions.vs_last_month, color: 'text-info' },
            { title: 'Safety Assessments', value: dashboardData.metrics_kpis.total_safety_assessments.value.toString(), icon: CheckCircle, trend: dashboardData.metrics_kpis.total_safety_assessments.vs_last_month, color: 'text-warning' },
            { title: 'Safety Score', value: dashboardData.metrics_kpis.safety_score.value.toString(), icon: TrendingUp, trend: dashboardData.metrics_kpis.safety_score.vs_last_month, color: 'text-primary' },
            { title: 'Maintenance Score', value: dashboardData.metrics_kpis.maintenance_score.value.toString(), icon: TrendingUp, trend: dashboardData.metrics_kpis.maintenance_score.vs_last_month, color: 'text-success' },
            { title: 'Maintenance Requests', value: dashboardData.metrics_kpis.total_maintenance_requests.value.toString(), icon: AlertTriangle, trend: dashboardData.metrics_kpis.total_maintenance_requests.vs_last_month, color: 'text-info' },
            { title: 'Completed Maintenance', value: dashboardData.metrics_kpis.completed_maintenance.value.toString(), icon: CheckCircle, trend: dashboardData.metrics_kpis.completed_maintenance.vs_last_month, color: 'text-warning' },
            { title: 'High Priority Maintenance', value: dashboardData.metrics_kpis.high_priority_maintenance.value.toString(), icon: AlertTriangle, trend: dashboardData.metrics_kpis.high_priority_maintenance.vs_last_month, color: 'text-destructive' },
          ];
        } else if (schoolMetricsData && currentUser.institution_id) {
          const schoolMetrics = schoolMetricsData.filter(m => m.institution_id === currentUser.institution_id);
          if (schoolMetrics.length > 0) {
            // Take the latest by created_at
            const latest = schoolMetrics.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
            return [
              { title: 'Students', value: latest.students_count.toString(), icon: Users, trend: '+0', color: 'text-primary' },
              { title: 'Teachers', value: latest.teachers_count.toString(), icon: Users, trend: '+0', color: 'text-success' },
              { title: 'Assessments', value: '12', icon: FileText, trend: '+3', color: 'text-info' },
              { title: 'Score', value: '89.4', icon: TrendingUp, trend: '+3.2', color: 'text-warning' },
            ];
          }
        }
        return [
          { title: 'Students', value: '0', icon: Users, trend: '0%', color: 'text-primary' },
          { title: 'Teachers', value: '0', icon: Users, trend: '0%', color: 'text-success' },
          { title: 'Total Actions', value: '5', icon: FileText, trend: '+100%', color: 'text-info' },
          { title: 'Safety Assessments', value: '2', icon: CheckCircle, trend: '+100%', color: 'text-warning' },
          { title: 'Safety Score', value: '50', icon: TrendingUp, trend: 'N/A', color: 'text-primary' },
          { title: 'Maintenance Score', value: '30.8', icon: TrendingUp, trend: 'N/A', color: 'text-success' },
          { title: 'Maintenance Requests', value: '3', icon: AlertTriangle, trend: '+100%', color: 'text-info' },
          { title: 'Completed Maintenance', value: '0', icon: CheckCircle, trend: '0%', color: 'text-warning' },
          { title: 'High Priority Maintenance', value: '0', icon: AlertTriangle, trend: '0%', color: 'text-destructive' },
        ];
      default:
        return [];
    }
  };

  const kpiData = getKPIData();

  const performanceData = dashboardData ? dashboardData.performance_trends.labels.map((label, i) => ({
    month: label,
    completed: dashboardData.performance_trends.completion_rate[i],
    score: dashboardData.performance_trends.quality_score[i]
  })) : schoolAssessmentData;

  const statusData = dashboardData && dashboardData.assessment_status_distribution ? dashboardData.assessment_status_distribution.map(item => ({
    name: item.label,
    value: item.value,
    color: item.color
  })) : [
    { name: 'Approved', value: 314, color: 'hsl(var(--success))' },
    { name: 'Pending Review', value: 89, color: 'hsl(var(--warning))' },
    { name: 'Needs Improvement', value: 48, color: 'hsl(var(--destructive))' },
    { name: 'Not Assessed', value: 67, color: 'hsl(var(--muted-foreground))' },
  ];

  const subCountyData = dashboardData && dashboardData.sub_county_performance ?
    dashboardData.sub_county_performance.labels.map((label, i) => {
      const obj: any = { name: label };
      dashboardData.sub_county_performance!.data.forEach(item => {
        obj[item.label] = item.values[i];
      });
      return obj;
    }) :
    countyData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{getOverviewTitle()}</h1>
          <p className="text-muted-foreground">
            Monitor and track quality assurance metrics across your jurisdiction
          </p>
        </div>
        {/* <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            Last updated: 2 minutes ago
          </Badge>
        </div> */}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    kpi.trend.startsWith('+') 
                      ? 'text-success border-success/20 bg-success/10' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {kpi.trend !== '0' && kpi.trend}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpi.trend.startsWith('+') ? 'vs last month' : 'no change'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>Assessment Status</span>
            </CardTitle>
            <CardDescription>
              Distribution of assessment outcomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    {/* <p className="text-xs text-muted-foreground">{item.value} assesments</p> */}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-info" />
              <span>Performance Trends</span>
            </CardTitle>
            <CardDescription>
              Assessment completion and quality scores over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="month" 
                  className="text-muted-foreground" 
                  fontSize={12}
                />
                <YAxis className="text-muted-foreground" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Completed"
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name="Average Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* County/Regional Performance (for Admin and County Admin) */}
      {(currentUser.role === 'ministry_admin' || currentUser.role === 'agent') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>
                {currentUser.role === 'ministry_admin' ? 'County Performance' : 'Sub-County Performance'}
              </span>
            </CardTitle>
            <CardDescription>
              Assessment metrics across different regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={subCountyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="name"
                  className="text-muted-foreground"
                  fontSize={12}
                />
                <YAxis className="text-muted-foreground" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                {dashboardData ? (
                  currentUser.role === 'ministry_admin' && dashboardData.county_performance ?
                    dashboardData.county_performance.data.map(item => (
                      <Bar key={item.label} dataKey={item.label} fill={item.color} name={item.label} />
                    )) :
                  dashboardData.sub_county_performance ?
                    dashboardData.sub_county_performance.data.map(item => (
                      <Bar key={item.label} dataKey={item.label} fill={item.color} name={item.label} />
                    )) :
                  <>
                    <Bar dataKey="approved" fill="hsl(var(--success))" name="Approved" />
                    <Bar dataKey="pending" fill="hsl(var(--warning))" name="Pending" />
                    <Bar dataKey="rejected" fill="hsl(var(--destructive))" name="Rejected" />
                  </>
                ) : (
                  <>
                    <Bar dataKey="approved" fill="hsl(var(--success))" name="Approved" />
                    <Bar dataKey="pending" fill="hsl(var(--warning))" name="Pending" />
                    <Bar dataKey="rejected" fill="hsl(var(--destructive))" name="Rejected" />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest assessment updates and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                icon: CheckCircle,
                color: 'text-success',
                title: 'Green Valley Primary School',
                description: 'Assessment approved with score 92.5',
                time: '2 minutes ago'
              },
              {
                icon: AlertTriangle,
                color: 'text-warning',
                title: 'St. Mary Secondary School',
                description: 'Assessment pending review - missing documentation',
                time: '15 minutes ago'
              },
              {
                icon: FileText,
                color: 'text-info',
                title: 'Hillside Academy',
                description: 'New assessment submitted for review',
                time: '1 hour ago'
              },
              {
                icon: XCircle,
                color: 'text-destructive',
                title: 'Riverside Primary',
                description: 'Assessment requires improvements in safety protocols',
                time: '2 hours ago'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <activity.icon className={`h-5 w-5 mt-0.5 ${activity.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default Overview;