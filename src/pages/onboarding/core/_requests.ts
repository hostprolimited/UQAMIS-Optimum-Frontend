import api from "@/utils/api";
import { Urls } from "@/constants/urls";
import { onboardSchoolData } from "./_models";

export const onboardSchools = async (data: onboardSchoolData[]) => {
    const response = await api.post(Urls.ONBOARD_SCHOOLS_URL, { institutions: data });
    return response.data;
};