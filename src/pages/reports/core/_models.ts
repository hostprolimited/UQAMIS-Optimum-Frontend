// Incident models for incident management endpoints

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  role: string;
  institution_id: number;
  county_code: string;
  status: string;
  county: string;
  subcounty: string;
  ward: string;
  created_at: string;
  updated_at: string;
}

export interface Institution {
  id: number;
  name: string;
  type: string;
  county: string;
  subcounty: string;
  ward: string;
  county_code: string;
  address: string;
  phone_number: string;
  latitude: string;
  longitude: string;
  email: string;
  status: string;
  boarding_type: string;
  total_students: number;
  total_teachers: string;
  gender_based: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: number;
  institution_id: number | null;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: number;
  institution_id: number;
  facility_id: number;
  submitted_by: User;
  incident_description: string;
  attachment_path: string | null;
  severity_level: string;
  created_at: string;
  updated_at: string;
  institution: Institution;
  facility: Facility;
}

export interface IncidentListResponse {
  status: string;
  title: string;
  attachment_path: string;
  incidents: {
    current_page: number;
    data: Incident[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface CreateIncidentInput {
  incident_description: string;
  facility_id: string;
  severity_level: string;
  attachment: string; // This might be a file or base64 string
}

export interface UpdateIncidentInput {
  incident_description?: string;
  facility_id?: string;
  severity_level?: string;
  attachment?: string;
}