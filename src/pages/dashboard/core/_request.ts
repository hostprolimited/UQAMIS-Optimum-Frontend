import api from "@/utils/api";
import { Urls } from "@/constants/urls";


// dashboard data
export const getDashboardData = async (): Promise<any> => {
  const response = await api.get<any>(Urls.DASHBOARD_URL);
  return response.data;
};