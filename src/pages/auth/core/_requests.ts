import api from "@/utils/api";
import { Urls } from "@/constants/urls";
import { LoginResponse } from "./_models";

// Ensure payload matches backend: { email, password }
export async function login(email: string, password: string): Promise<LoginResponse> {
  const payload = { email, password };
  const res = await api.post(Urls.LOGIN_URL, payload);
  // The backend returns { user, token, message, dashboard }
  return res.data;
}