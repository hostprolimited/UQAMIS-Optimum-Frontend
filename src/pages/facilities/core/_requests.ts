import api from "@/utils/api";
import { Urls } from "@/constants/urls";
import { entitiesData } from "./_models";

export const createSchoolEntities = async (data: entitiesData) => {
    const response = await api.post(Urls.CREATE_SCHOOL_ENTITIES_URL, data);
    return response.data;
};

export const getSchoolEntities = async () => {
    const response = await api.get(Urls.GET_SCHOOL_ENTITIES_URL);
    return response.data;
};
export const getSchoolEntityById = async (id: number) => {
    const response = await api.get(Urls.GET_SCHOOL_ENTITY_BY_ID_URL(id));
    return response.data;
};

export const updateSchoolEntity = async (id: number, data: entitiesData) => {
    const response = await api.put(Urls.UPDATE_SCHOOL_ENTITY_URL(id), data);
    return response.data;
};
export const deleteSchoolEntity = async (id: number) => {
    const response = await api.delete(Urls.DELETE_SCHOOL_ENTITY_URL(id));
    return response.data;
}