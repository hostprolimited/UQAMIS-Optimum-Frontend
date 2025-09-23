import api from '@/utils/api';
import { Urls } from '@/constants/urls';
import { User, CreateUserInput, UpdateUserInput, Role, Permission } from './_models';

// Get all users
export const getUsers = async (): Promise<User[]> => {
  const res = await api.get(Urls.GET_USERS_URL);
  // If API returns { data: [...] }, return res.data.data, else res.data
  if (Array.isArray(res.data)) {
    return res.data;
  } else if (res.data && Array.isArray(res.data.data)) {
    return res.data.data;
  } else {
    return [];
  }
};

// Get user by ID
export const getUserById = async (id: number): Promise<User> => {
  const res = await api.get(Urls.USER_DETAIL_URL(id));
  return res.data;
};

// Create user
export const createUser = async (data: CreateUserInput): Promise<User> => {
  const res = await api.post(Urls.CREATE_USERS_URL, data);
  return res.data;
};

// Update user
export const updateUser = async (id: number, data: UpdateUserInput): Promise<User> => {
  const res = await api.put(Urls.UPDATE_USER_URL(id), data);
  return res.data;
};

// Delete user
export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(Urls.DELETE_USER_URL(id));
};

// Get user roles
export const getUserRoles = async (id: number): Promise<Role[]> => {
  const res = await api.get(Urls.GET_USER_ROLES_URL(id));
  return res.data;
};

// Assign role to user
export const assignRoleToUser = async (id: number, roleId: number): Promise<void> => {
  await api.post(Urls.CREATE_ROLE_URL(id), { role_id: roleId });
};

// Remove role from user
export const removeRoleFromUser = async (id: number): Promise<void> => {
  await api.delete(Urls.DELETE_ROLE_URL(id));
};
