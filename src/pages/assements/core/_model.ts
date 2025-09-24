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

export interface APIResponse<T> {
  status: string;
  message: string;
  data: T;
}