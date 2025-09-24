
import api from "@/utils/api";
import { Urls } from "@/constants/urls";
import { APIResponse, Facility, MaintenanceAssessmentInput, MaintenanceReport } from "./_model";

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
