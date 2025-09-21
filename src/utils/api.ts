import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    CancelTokenSource,
} from "axios";
import { API_BASE_URL } from "@/constants/urls";

const isDev = import.meta.env.MODE === "development";

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    withCredentials: true, // <-- IMPORTANT for session cookies
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Refresh token logic
let refreshRetryCount = 0;

async function refreshToken(): Promise<void> {
    const axiosInternal = axios.create({
        baseURL: isDev
            ? import.meta.env.VITE_DEV_APP_API_URL
            : import.meta.env.VITE_PROD_APP_API_URL,
        withCredentials: true,
        timeout: 30000,
        headers: {
            Accept: "application/json",
        },
    });

    try {
        if (isDev) console.log("Refreshing session token...");
        const response = await axiosInternal.post("/auth/refresh-token");

        if (response.status === 200 && response.data.status) {
            const auth = JSON.parse(localStorage.getItem("auth") || "{}");
            const newAuth = {
                ...auth,
                expires_at: Date.now() + 25 * 60 * 1000, // 25 mins
            };
            localStorage.setItem("auth", JSON.stringify(newAuth));
            refreshRetryCount = 0;
        }
    } catch (error) {
        if (refreshRetryCount < 1) {
            refreshRetryCount++;
            if (isDev) console.warn("Retrying refresh token once...");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return refreshToken();
        }

        if (isDev) console.error("Refresh failed after retry:", error);
        localStorage.removeItem("auth");

        // window.location.href = "/login";
        localStorage.removeItem("school_admin");
        localStorage.removeItem("school");
        window.location.href = "/login";
        return Promise.reject(error);
    }
}

// Request interceptor (handles session expiration)
// @ts-ignore
api.interceptors.request.use(async (config: AxiosRequestConfig) => {
        const auth = JSON.parse(localStorage.getItem("auth") || "{}");
        const now = Date.now() + 60 * 1000; // 1-minute buffer

        if (auth?.expires_at && now >= auth.expires_at) {
            await refreshToken();
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        if (isDev) console.log("Request:", config.url);
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor (optional global error handling)
api.interceptors.response.use(
    (response: AxiosResponse) => {
        if (isDev) console.log("Response:", response);
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            console.warn("Unauthorized - refreshing session");
            await refreshToken();
            return api.request(error.config); // Retry the original request
        }

        console.error("API Error:", error.response || error.message);
        return Promise.reject(error);
    }
);

// Global cancel token
export const globalCancelToken: CancelTokenSource = axios.CancelToken.source();

export default api;
