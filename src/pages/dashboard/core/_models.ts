export interface MetricKPI {
  value: number;
  vs_last_month: string;
}

export interface MetricsKPIs {
  total_schools?: MetricKPI;
  total_teachers?: MetricKPI;
  total_students?: MetricKPI;
  total_actions?: MetricKPI;
  total_safety_assessments?: MetricKPI;
  safety_score?: MetricKPI;
  maintenance_score?: MetricKPI;
  total_maintenance_requests?: MetricKPI;
  completed_maintenance?: MetricKPI;
  high_priority_maintenance?: MetricKPI;
  total_institutions?: MetricKPI;
  students?: MetricKPI;
  teachers?: MetricKPI;
}

export interface PerformanceTrends {
  labels: string[];
  completion_rate: number[];
  quality_score: number[];
}

export interface SubCountyData {
  label: string;
  values: number[];
  color: string;
}

export interface SubCountyPerformance {
  labels: string[];
  data: SubCountyData[];
}

export interface DashboardData {
  metrics_kpis: MetricsKPIs;
  assessment_status_distribution: any[];
  performance_trends: PerformanceTrends;
  title: string;
  sub_county_performance?: SubCountyPerformance;
  county_performance?: SubCountyPerformance;
}

export interface DashboardResponse {
  status: string;
  title: string;
  data: DashboardData;
}