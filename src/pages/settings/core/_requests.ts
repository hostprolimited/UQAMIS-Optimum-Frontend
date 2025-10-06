import api from '@/utils/api';
import { Urls } from '@/constants/urls';
import { User, CreateUserInput, UpdateUserInput, Role, Permission, CreatePermissionInput, AssignPermissionRoleInput, AssignUserRoleInput } from './_models';

// Get all users
export const getUsers = async (): Promise<{ users: User[] }> => {
  const res = await api.get(Urls.GET_USERS_URL);
  return res.data;
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

// Get all roles
export const getRoles = async (): Promise<{ roles: Role[] }> => {
  const res = await api.get(Urls.GET_ROLES_URL);
  return res.data;
};

// Create role
export const createRole = async (data: { name: string }): Promise<Role> => {
  const res = await api.post(Urls.CREATE_ROLE_URL, data);
  return res.data;
};

// Permissions
export const getPermissions = async (): Promise<{
  roles: any[]; permissions: Permission[] 
}> => {
  const res = await api.get(Urls.GET_PERMISSIONS_URL);
  return res.data;
};

export const createPermission = async (data: CreatePermissionInput): Promise<Permission> => {
  const res = await api.post(Urls.CREATE_PERMISSION_URL, {
    name: data.name
  });
  return res.data;
};

// Assign permission to role
export const assignPermissionToRole = async (data: AssignPermissionRoleInput): Promise<void> => {
  await api.post(Urls.ASSIGN_PERMISSION_ROLE_URL, {
    permission_name: data.permission_name,
    role_name: data.role_name
  });
};

// Assign role to user
export const assignUserRole = async (data: AssignUserRoleInput): Promise<void> => {
  await api.post(Urls.ASSIGN_USER_ROLE_URL(data.user_id), {
    role_name: data.role_name
  });
};

// Get user role
export const getUserRole = async (id: number): Promise<Role> => {
  const res = await api.get(Urls.GET_USER_ROLE(id));
  return res.data;
};

// Update role
export const updateRole = async (id: number, data: { name?: string; status?: string }): Promise<Role> => {
  const res = await api.put(Urls.UPDATE_ROLE_URL(id), data);
  return res.data;
};

// Remove role
export const removeRole = async (id: number): Promise<void> => {
  await api.delete(Urls.DELETE_ROLE_URL(id));
};

// Update permission
export const updatePermission = async (id: number, data: { name?: string; status?: string }): Promise<Permission> => {
  const res = await api.put(Urls.UPDATE_PERMISSION_URL(id), data);
  return res.data;
};

// Delete permission
export const deletePermission = async (id: number): Promise<void> => {
  await api.delete(Urls.DELETE_PERMISSION_URL(id));
};
