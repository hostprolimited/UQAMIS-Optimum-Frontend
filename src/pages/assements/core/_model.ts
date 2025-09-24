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
  facilityId: number;
  reviewRemarks: string;
  parts: {
    name: string;
    condition: 'urgent' | 'attention' | 'good';
  }[];
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