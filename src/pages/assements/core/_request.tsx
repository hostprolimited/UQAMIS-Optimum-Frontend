
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
  formData.append('facilityId', data.facilityId.toString());
  formData.append('reviewRemarks', data.reviewRemarks);
  formData.append('parts', JSON.stringify(data.parts));
  
  if (data.files) {
    data.files.forEach((file) => {
      formData.append('files', file);
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
