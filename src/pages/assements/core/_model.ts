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
  class: string[];
  institution_name: string;
  status: 'pending' | 'in_progress' | 'completed';
  details: {
    part_of_building: string;
    assessment_status: 'Urgent Attention' | 'Attention Required' | 'Good';
  }[];
  school_feedback: string;
  agent_feedback: string;
  files?: File[];
}

export interface MaintenanceReport {
  id: number;
  school_name: string;
  facility_type: string;
  institution_name: string;
  assessment_date: string;
  class: string[];
  urgent_items: number;
  attention_items: number;
  good_items: number;
  total_items: number;
  agent_feedback: string;
  school_feedback: string;
  recommended_actions?: string;
  priority_level?: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  total_score_percentage: number;
  overall_condition: 'excellent' | 'good' | 'needs-attention' | 'critical';
  completion_status: 'completed' | 'in-progress' | 'pending';
  files?: string[];
  created_at: string;
}


export interface SafetyAssessmentInput {
  institution_id: number;
  facility_id: number;
  class: string[];
  institution_name: string;
  status: 'pending' | 'in_progress' | 'completed';
  details: {
    part_of_building: string;
    assessment_status: 'Urgent Attention' | 'Attention Required' | 'Good';
  }[];
  school_feedback: string;
  agent_feedback: string;
  files?: File[];
}

export interface SafetyReport {
  id: number;
  school_name: string;
  facility_type: string;
  institution_name: string;
  assessment_date: string;
  class: string[];
  urgent_items: number;
  attention_items: number;
  good_items: number;
  total_items: number;
  agent_feedback: string;
  school_feedback: string;
  recommended_actions?: string;
  priority_level?: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  total_score_percentage: number;
  overall_condition: 'excellent' | 'good' | 'needs-attention' | 'critical';
  completion_status: 'completed' | 'in-progress' | 'pending';
  files?: string[];
  created_at: string;
}

export interface APIResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface SchoolMetric {
  id: number;
  metrics_id: string;
  institution_id: number;
  students_count: number;
  teachers_count: number;
  class: string;
  streams: string[];
  year: number;
  term: string;
  created_at: string;
  updated_at: string;
}

export interface AgentReview{
  review_decision: 'approved' | 'rejected' |  'requires_clarification' | 'pending';
  review_remarks: string;
  maintenance_assessment_id: number;
  recommended_actions?: string;
  priority?: 'low' | 'medium' | 'high';
}