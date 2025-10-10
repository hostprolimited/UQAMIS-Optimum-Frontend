export interface MetricKPI {
  value: number;
  vs_last_month: string;
}

export interface MetricsKPIs {
  total_schools?: MetricKPI;
  total_teachers?: MetricKPI;
  total_students?: MetricKPI;
  assessment_coverage_percentage?: MetricKPI;
  assessments_overdue?: MetricKPI;
  avg_time_to_complete_days?: MetricKPI;
  total_assessments?: MetricKPI;
  total_safety_assessments?: MetricKPI;
  safety_score?: MetricKPI;
  maintenance_score?: MetricKPI;
  total_maintenance_assessments?: MetricKPI;
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

export interface AssessmentDetail {
  status: string;
  count: number;
  item_description: string;
  school_name: string;
}

export interface AssessmentStatusItem {
  label: string;
  value: AssessmentDetail[];
  color: string;
}

export interface SubCountyPerformance {
  labels: string[];
  data: SubCountyData[];
}

export interface ScoreData {
  school_name: string;
  score: number;
}

export interface DashboardData {
  metrics_kpis: MetricsKPIs;
  assessment_status_distribution: AssessmentStatusItem[];
  performance_trends: PerformanceTrends;
  institution_name?: string;
  title: string;
  sub_county_performance?: SubCountyPerformance;
  county_performance?: SubCountyPerformance;
  institution_performance?: SubCountyPerformance;
  lowest_safety_scores?: ScoreData[];
  highest_safety_scores?: ScoreData[];
  lowest_maintenance_scores?: ScoreData[];
  highest_maintenance_scores?: ScoreData[];
}

export interface DashboardResponse {
  status: string;
  title: string;
  institution_name: string;
  data: DashboardData;
}