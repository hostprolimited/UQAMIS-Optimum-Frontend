
import api from "@/utils/api";
import { Urls } from "@/constants/urls";
import { APIResponse, Facility, MaintenanceAssessmentInput, MaintenanceReport, SchoolMetric, SafetyAssessmentInput, SafetyReport } from "./_model";

// Fetch all facilities
export const getFacilities = async (): Promise<APIResponse<Facility[]>> => {
  const response = await api.get<APIResponse<Facility[]>>(Urls.FACILITIES_URL);
  return response.data;
};

// Create maintenance assessment
export const createMaintenanceAssessment = async (data: MaintenanceAssessmentInput): Promise<APIResponse<any>> => {
  const formData = new FormData();
  formData.append('institution_id', data.institution_id.toString());
  formData.append('facility_id', data.facility_id.toString());
  formData.append('status', data.status);
  // Append each detail as details[i][field]
  data.details.forEach((detail, i) => {
    formData.append(`details[${i}][part_of_building]`, detail.part_of_building);
    formData.append(`details[${i}][assessment_status]`, detail.assessment_status);
  });
  formData.append('school_feedback', data.school_feedback);
  formData.append('agent_feedback', data.agent_feedback);

  formData.append('class', JSON.stringify(data.class || []));
  
  if (data.files && data.files.length > 0) {
    data.files.forEach((file: File) => {
      formData.append('files[]', file);
    });
  }

  const response = await api.post<APIResponse<any>>(
    Urls.MAINTENANCE_ASSESSMENT,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

// Fetch all maintenance reports
export const getMaintenanceReports = async (): Promise<APIResponse<MaintenanceReport[]>> => {
  const response = await api.get<APIResponse<MaintenanceReport[]>>(Urls.GET_MAINTENANCE_REPORT_URL);
  return response.data;
};


// create Safety assessment
export const createSafetyAssessment = async (data: SafetyAssessmentInput): Promise<APIResponse<any>> => {
  const formData = new FormData();
  formData.append('institution_id', data.institution_id.toString());
  formData.append('facility_id', data.facility_id.toString());
  formData.append('status', data.status);
  // Append each detail as details[i][field]
  data.details.forEach((detail, i) => {
    formData.append(`details[${i}][part_of_building]`, detail.part_of_building);
    formData.append(`details[${i}][assessment_status]`, detail.assessment_status);
  });
  formData.append('school_feedback', data.school_feedback);
  formData.append('agent_feedback', data.agent_feedback);

  formData.append('class', JSON.stringify(data.class || []));

  if (data.files && data.files.length > 0) {
    data.files.forEach((file: File) => {
      formData.append('files[]', file);
    });
  }

  const response = await api.post<APIResponse<any>>(
    Urls.CREATE_SAFETY_REPORT_URL,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

// Fetch all safety reports
// export const getSafetyReports = async (): Promise<APIResponse<SafetyReport[]>> => {
//   const response = await api.get<APIResponse<SafetyReport[]>>(Urls.GET_SAFETY_REPORT_URL);
//   return response.data;
// };

// add school metrics
export const createSchoolMetrics = async (data: { institution_id: number; students_count: number; teachers_count: number; term: string; year: string; class: string; streams: string[]; }): Promise<APIResponse<any>> => {
  const response = await api.post<APIResponse<any>>(Urls.CREATE_INSTITUTION_METRICS_URL, data);
  return response.data;
};

// list school metrics
export const getSchoolMetrics = async (): Promise<APIResponse<SchoolMetric[]>> => {
  const response = await api.get<APIResponse<SchoolMetric[]>>(Urls.INSTITUTIONS_METRICS_URL);
  return response.data;
};

// update school metrics
export const updateSchoolMetrics = async (id: number, data: { students_count: number; teachers_count: number; metric_id: number; }): Promise<APIResponse<any>> => {
  const response = await api.put<APIResponse<any>>(Urls.UPDATE_INSTITUTION_METRICS_URL(id), data);
  return response.data;
};

// delete school metrics
export const deleteSchoolMetrics = async (id: number): Promise<APIResponse<any>> => {
  const response = await api.delete<APIResponse<any>>(Urls.DELETE_INSTITUTION_METRICS_URL(id));
  return response.data;
};


// get maintainance report by id
export const getMaintenanceReportById = async (id: number): Promise<APIResponse<MaintenanceReport>> => {
  const response = await api.get<APIResponse<MaintenanceReport>>(Urls.GET_MAINTENANCE_REPORT_BY_ID_URL(id));
  return response.data;
};

// agent review maintainance report 
export const agentReviewMaintenanceReport = async (id: number, data: { review_decision: 'approved' | 'rejected' | 'requires_clarification' | 'pending'; review_remarks: string; recommended_action: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; }): Promise<APIResponse<any>> => {
  const response = await api.put<APIResponse<any>>(Urls.AGENT_REVIEW_MAINTENANCE_ASSESSMENT(id), data);
  return response.data;
};

// get safety reports
export const getSafetyReports = async (): Promise<APIResponse<SafetyReport[]>> => {
  const response = await api.get<APIResponse<SafetyReport[]>>(Urls.GET_SAFETY_REPORT_URL);
  return response.data;
};

// agent review safety report
export const agentReviewSafetyReport = async (id: number, data: { review_decision: 'approved' | 'rejected' | 'requires_clarification' | 'pending'; review_remarks: string; recommended_action: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; }): Promise<APIResponse<any>> => {
  const response = await api.put<APIResponse<any>>(Urls.AGENT_REVIEW_SAFETY_ASSESSMENT(id), data);
  return response.data;
};