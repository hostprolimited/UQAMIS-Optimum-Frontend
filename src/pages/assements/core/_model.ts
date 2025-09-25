export interface Facility {
  id: number;
  institution_id: number | null;
  name: string;
  created_at: string;
  updated_at: string;
  description?: string;
  statistics?: string;
  color?: string;
  parts?: string[];
}

export interface MaintenanceAssessmentInput {
  institution_id: number;
  facility_id: number;
  status: 'pending' | 'in_progress' | 'completed';
  details: {
    part_of_building: string;
    assessment_status: 'Urgent Attention' | 'Attention' | 'Good';
  }[];
  school_feedback: string;
  agent_feedback: string;
  files?: File[];
}

export interface MaintenanceReport {
  id: number;
  school_name: string;
  facility_type: string;
  assessment_date: string;
  urgent_items: number;
  attention_items: number;
  good_items: number;
  total_items: number;
  overall_condition: 'excellent' | 'good' | 'needs-attention' | 'critical';
  completion_status: 'completed' | 'in-progress' | 'pending';
  files?: string[];
}

export interface APIResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface SchoolMetric {
  id: number;
  institution_id: number;
  students_count: number;
  teachers_count: number;
  year: number;
  term: string;
  created_at: string;
  updated_at: string;
}