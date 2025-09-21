import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRole } from '@/contexts/RoleContext';

// Kenya county code to name mapping
const countyCodeToName: Record<string, string> = {
  '1': 'Mombasa',
  '2': 'Kwale',
  '3': 'Kilifi',
  '4': 'Tana River',
  '5': 'Lamu',
  '6': 'Taita Taveta',
  '7': 'Garissa',
  '8': 'Wajir',
  '9': 'Mandera',
  '10': 'Marsabit',
  '11': 'Isiolo',
  '12': 'Meru',
  '13': 'Tharaka-Nithi',
  '14': 'Embu',
  '15': 'Kitui',
  '16': 'Machakos',
  '17': 'Makueni',
  '18': 'Nyandarua',
  '19': 'Nyeri',
  '20': 'Kirinyaga',
  '21': 'Murang’a',
  '22': 'Kiambu',
  '23': 'Turkana',
  '24': 'West Pokot',
  '25': 'Samburu',
  '26': 'Trans Nzoia',
  '27': 'Uasin Gishu',
  '28': 'Elgeyo Marakwet',
  '29': 'Nandi',
  '30': 'Baringo',
  '31': 'Laikipia',
  '32': 'Nakuru',
  '33': 'Narok',
  '34': 'Kajiado',
  '35': 'Kericho',
  '36': 'Bomet',
  '37': 'Kakamega',
  '38': 'Vihiga',
  '39': 'Bungoma',
  '40': 'Busia',
  '41': 'Siaya',
  '42': 'Kisumu',
  '43': 'Homa Bay',
  '44': 'Migori',
  '45': 'Kisii',
  '46': 'Nyamira',
  '47': 'Nairobi',
};
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

  const getOverviewTitle = () => {
    switch (currentUser.role) {
      case 'ministry_admin':
        return 'National Overview';
      case 'agent': {
        // Use county_code to get county name
        const code = (currentUser as any).county_code || currentUser.county_code || currentUser.county_name;
        const countyName = countyCodeToName[String(code)] || 'Unknown';
        return `${countyName} County Overview`;
      }
      case 'school_admin':
        return `${currentUser.name} Overview`;
      default:
        return 'Overview';
    }
  };

  const getKPIData = () => {
    switch (currentUser.role) {
      case 'ministry_admin':
        return [
          { title: 'Total Counties', value: '47', icon: Users, trend: '+2', color: 'text-primary' },
          { title: 'Total Schools', value: '1,248', icon: School, trend: '+45', color: 'text-success' },
          { title: 'Assessments', value: '971', icon: FileText, trend: '+123', color: 'text-info' },
          { title: 'Avg Score', value: '86.5', icon: TrendingUp, trend: '+2.3', color: 'text-warning' },
        ];
      case 'agent':
        return [
          { title: 'Sub-Counties', value: '8', icon: Users, trend: '0', color: 'text-primary' },
          { title: 'Schools', value: '245', icon: School, trend: '+3', color: 'text-success' },
          { title: 'Assessments', value: '180', icon: FileText, trend: '+24', color: 'text-info' },
          { title: 'Avg Score', value: '87.2', icon: TrendingUp, trend: '+1.8', color: 'text-warning' },
        ];
      case 'school_admin':
        return [
          { title: 'Students', value: '847', icon: Users, trend: '+12', color: 'text-primary' },
          { title: 'Teachers', value: '42', icon: Users, trend: '+2', color: 'text-success' },
          { title: 'Assessments', value: '12', icon: FileText, trend: '+3', color: 'text-info' },
          { title: 'Score', value: '89.4', icon: TrendingUp, trend: '+3.2', color: 'text-warning' },
        ];
      default:
        return [];
    }
  };

  const kpiData = getKPIData();

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
                    <p className="text-xs text-muted-foreground">{item.value} schools</p>
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
              <LineChart data={schoolAssessmentData}>
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
              <BarChart data={countyData}>
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
                <Bar dataKey="approved" fill="hsl(var(--success))" name="Approved" />
                <Bar dataKey="pending" fill="hsl(var(--warning))" name="Pending" />
                <Bar dataKey="rejected" fill="hsl(var(--destructive))" name="Rejected" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
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
      </Card>
    </div>
  );
};

export default Overview;