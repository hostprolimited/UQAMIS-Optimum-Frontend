import api from '@/utils/api';
import { Urls } from '@/constants/urls';
import {
  Incident,
  IncidentListResponse,
  CreateIncidentInput,
  UpdateIncidentInput
} from './_models';

// Get all incidents
export const getIncidents = async (): Promise<IncidentListResponse> => {
  const res = await api.get(Urls.GET_INCIDENTS_URL);
  return res.data;
};

// Get incident by ID
export const getIncidentById = async (id: number): Promise<Incident> => {
  const res = await api.get(Urls.GET_INCIDENT_BY_ID_URL(id));
  return res.data;
};

// Create incident
export const createIncident = async (data: CreateIncidentInput): Promise<Incident> => {
  const res = await api.post(Urls.CREATE_INCIDENT_URL, data);
  return res.data;
};

// Update incident
export const updateIncident = async (id: number, data: UpdateIncidentInput): Promise<Incident> => {
  const res = await api.put(Urls.UPDATE_INCIDENT_URL(id), data);
  return res.data;
};

// Delete incident
export const deleteIncident = async (id: number): Promise<void> => {
  await api.delete(Urls.DELETE_INCIDENT_URL(id));
};