import api from "@/utils/api";
import { Urls } from "@/constants/urls";
import { termDateData } from "./_models";

export const createTermDates = async (data: termDateData) => {
    const response = await api.post(Urls.CREATE_TERM_DATES_URL, data);
    return response.data;
};

export const getTermDates = async () => {
    const response = await api.get(Urls.GET_TERM_DATES_URL);
    return response.data;
};

export const getTermDatesById = async (id: number) => {
    const response = await api.get(Urls.GET_TERM_DATES_BY_ID_URL(id));
    return response.data;
};

export const updateTermDates = async (id: number, data: termDateData) => {
    const response = await api.put(Urls.UPDATE_TERM_DATES_URL(id), data);
    return response.data;
};

export const deleteTermDates = async (id: number) => {
    const response = await api.delete(Urls.DELETE_TERM_DATES_URL(id));
    return response.data;
};
